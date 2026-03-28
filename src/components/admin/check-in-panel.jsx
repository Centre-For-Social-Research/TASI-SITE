"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function ResultCard({ title, description, tone = "default" }) {
  const toneMap = {
    default: "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
    success: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-100",
    danger: "border-red-200 bg-red-50 text-red-950 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-100",
    warning: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneMap[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-relaxed opacity-90">{description}</p>
    </div>
  );
}

export default function CheckInPanel({ operator }) {
  const [deskLabel, setDeskLabel] = useState("Main Desk");
  const [query, setQuery] = useState("");
  const [lookupResults, setLookupResults] = useState([]);
  const [scanMessage, setScanMessage] = useState(null);
  const [cameraState, setCameraState] = useState("idle");
  const [manualToken, setManualToken] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const scanTimerRef = useRef(null);

  const completeCheckIn = useCallback(async (payload) => {
    const response = await fetch("/api/check-in/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deskLabel,
        ...payload,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setScanMessage({
        tone: "danger",
        title: "Check-in failed",
        description: data.error || "Unable to complete check-in.",
      });
      return;
    }

    const tone =
      data.result === "valid" ? "success" : data.result === "already_checked_in" ? "warning" : "danger";

    setScanMessage({
      tone,
      title:
        data.result === "valid"
          ? "Attendee approved"
          : data.result === "already_checked_in"
            ? "Already checked in"
            : "Entry blocked",
      description: `${data.registration.first_name} ${data.registration.last_name} • ${data.registration.organization} • ${data.registration.registration_code}`,
    });
  }, [deskLabel]);

  async function lookupAttendee() {
    const response = await fetch("/api/check-in/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    if (!response.ok) {
      setScanMessage({
        tone: "danger",
        title: "Lookup failed",
        description: data.error || "Unable to search attendees.",
      });
      return;
    }

    setLookupResults(data.registrations || []);
  }

  async function startCamera() {
    if (!("BarcodeDetector" in window)) {
      setCameraState("unsupported");
      return;
    }

    try {
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      detectorRef.current = detector;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("active");
    } catch {
      setCameraState("error");
    }
  }

  function stopCamera() {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraState("idle");
  }

  useEffect(() => {
    if (cameraState !== "active" || !videoRef.current || !detectorRef.current) {
      return undefined;
    }

    scanTimerRef.current = setInterval(async () => {
      try {
        const barcodes = await detectorRef.current.detect(videoRef.current);
        if (barcodes?.length) {
          const token = barcodes[0]?.rawValue;
          if (token) {
            stopCamera();
            setManualToken(token);
            await completeCheckIn({ token });
          }
        }
      } catch {
        // keep scanning silently
      }
    }, 700);

    return () => {
      if (scanTimerRef.current) {
        clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
      }
    };
  }, [cameraState, completeCheckIn]);

  useEffect(() => () => stopCamera(), []);

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/60">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Operator Check-In</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">TASI 2026 Entry Validation</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Signed in as {operator.displayName} ({operator.primaryEmail}).
        </p>
        <label className="mt-5 flex max-w-sm flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Desk Label
          <input
            value={deskLabel}
            onChange={(event) => setDeskLabel(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">QR Scan</p>
          <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-950 dark:border-slate-800">
            <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startCamera}
              className="h-11 rounded-full bg-[#4c1d95] px-5 text-sm font-semibold text-white transition hover:bg-[#5b21b6]"
            >
              Start Camera Scan
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
            >
              Stop Camera
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {cameraState === "unsupported"
              ? "BarcodeDetector is not supported in this browser. Use manual QR token entry or attendee lookup."
              : cameraState === "error"
                ? "Camera access could not be started. Check browser permissions and device camera access."
                : "Use the rear camera on Android for the most reliable QR scan performance."}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={manualToken}
              onChange={(event) => setManualToken(event.target.value)}
              placeholder="Paste QR token manually"
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <button
              type="button"
              onClick={() => completeCheckIn({ token: manualToken })}
              className="h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
            >
              Validate Token
            </button>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Manual Lookup</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email, or registration ID"
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <button
              type="button"
              onClick={lookupAttendee}
              className="h-11 rounded-full bg-[#4c1d95] px-5 text-sm font-semibold text-white transition hover:bg-[#5b21b6]"
            >
              Search
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {lookupResults.map((registration) => (
              <div
                key={registration.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {registration.first_name} {registration.last_name}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {registration.organization} • {registration.registration_code}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-500">
                  {registration.status} {registration.checked_in_at ? "• already checked in" : ""}
                </p>
                <button
                  type="button"
                  onClick={() => completeCheckIn({ registrationId: registration.id })}
                  className="mt-3 h-10 rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
                >
                  Check In This Attendee
                </button>
              </div>
            ))}
            {!lookupResults.length ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Search results will appear here for manual fallback check-in.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {scanMessage ? <ResultCard title={scanMessage.title} description={scanMessage.description} tone={scanMessage.tone} /> : null}
    </div>
  );
}
