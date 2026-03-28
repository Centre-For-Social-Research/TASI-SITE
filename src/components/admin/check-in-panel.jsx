"use client";

import jsQR from "jsqr";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import checkInUtils from "@/lib/check-in-panel-utils.cjs";

const {
  getCameraStateMessage,
  isCheckInConfigError,
  getCheckInFeedbackTone,
} = checkInUtils;

function ResultCard({ title, description, tone = "default" }) {
  const toneMap = {
    default: "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
    success: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-100",
    danger: "border-red-200 bg-red-50 text-red-950 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-100",
    warning: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100",
  };

  return (
    <div className={`rounded-[10px] border p-4 ${toneMap[tone]}`}>
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
  const [lookupLoading, setLookupLoading] = useState(false);
  const [scanSubmitting, setScanSubmitting] = useState(false);
  const [configWarning, setConfigWarning] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  const cameraMessage = useMemo(() => getCameraStateMessage(cameraState), [cameraState]);

  const stopCamera = useCallback((nextState = "idle") => {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setCameraState(nextState);
  }, []);

  const completeCheckIn = useCallback(
    async (payload) => {
      setScanSubmitting(true);

      try {
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
          const errorMessage = data.error || "Unable to complete check-in.";
          setScanMessage({
            tone: "danger",
            title: isCheckInConfigError(errorMessage) ? "Supabase Admin Configuration Required" : "Check-in failed",
            description: isCheckInConfigError(errorMessage)
              ? "Check-in tools need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the deployment environment before scans and lookups can reach registrant data."
              : errorMessage,
          });
          return;
        }

        setScanMessage({
          tone: getCheckInFeedbackTone(data.result),
          title:
            data.result === "valid"
              ? "Attendee approved"
              : data.result === "already_checked_in"
                ? "Already checked in"
                : data.result === "waitlisted"
                  ? "Attendee waitlisted"
                  : "Entry blocked",
          description: `${data.registration.first_name} ${data.registration.last_name} | ${data.registration.organization} | ${data.registration.registration_code}`,
        });
      } catch {
        setScanMessage({
          tone: "danger",
          title: "Check-in failed",
          description: "Network error while validating the attendee.",
        });
      } finally {
        setScanSubmitting(false);
      }
    },
    [deskLabel],
  );

  const scanFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || cameraState !== "active") {
      return;
    }

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth && video.videoHeight) {
      const context = canvas.getContext("2d", { willReadFrequently: true });

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code?.data) {
          stopCamera();
          setManualToken(code.data);
          await completeCheckIn({ token: code.data });
          return;
        }
      }
    }

    animationFrameRef.current = window.requestAnimationFrame(() => {
      void scanFrame();
    });
  }, [cameraState, completeCheckIn, stopCamera]);

  async function lookupAttendee() {
    setLookupLoading(true);

    try {
      const response = await fetch("/api/check-in/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Unable to search attendees.";
        setScanMessage({
          tone: "danger",
          title: isCheckInConfigError(errorMessage) ? "Supabase Admin Configuration Required" : "Lookup failed",
          description: isCheckInConfigError(errorMessage)
            ? "Attendee lookup needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the deployment environment before it can load registrants."
            : errorMessage,
        });
        setLookupResults([]);
        return;
      }

      setLookupResults(data.registrations || []);
    } catch {
      setScanMessage({
        tone: "danger",
        title: "Lookup failed",
        description: "Network error while searching attendees.",
      });
      setLookupResults([]);
    } finally {
      setLookupLoading(false);
    }
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      return;
    }

    stopCamera("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState("active");
    } catch (error) {
      if (error instanceof DOMException && ["NotAllowedError", "SecurityError"].includes(error.name)) {
        stopCamera("permission_denied");
        return;
      }

      stopCamera("error");
    }
  }

  useEffect(() => {
    if (cameraState !== "active") {
      return undefined;
    }

    animationFrameRef.current = window.requestAnimationFrame(() => {
      void scanFrame();
    });

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [cameraState, scanFrame]);

  useEffect(() => {
    let active = true;

    async function loadConfigHealth() {
      try {
        const response = await fetch("/api/health", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const supabaseServices = data?.services?.supabase;

        if (!active || !supabaseServices) {
          return;
        }

        if (!supabaseServices.urlConfigured || !supabaseServices.serviceRoleConfigured) {
          setConfigWarning(
            "Supabase admin access is not configured in this deployment. Camera scans, attendee lookup, and check-in validation will stay unavailable until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are added."
          );
        }
      } catch {
        // Keep the console usable even if health diagnostics are unavailable.
      }
    }

    void loadConfigHealth();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div className="space-y-6">
      <section className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/60">
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
            className="h-11 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {configWarning ? (
          <div className="xl:col-span-2">
            <ResultCard title="Supabase Admin Configuration Required" description={configWarning} tone="danger" />
          </div>
        ) : null}
        <div className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">QR Scan</p>
          <div className="mt-4 overflow-hidden rounded-[10px] border border-slate-200 bg-slate-950 dark:border-slate-800">
            <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startCamera}
              className="h-11 rounded-full bg-[#4c1d95] px-5 text-sm font-semibold text-white transition hover:bg-[#5b21b6]"
            >
              {cameraState === "active" ? "Restart Camera Scan" : "Start Camera Scan"}
            </button>
            <button
              type="button"
              onClick={() => stopCamera()}
              className="h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
            >
              Stop Camera
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{cameraMessage}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={manualToken}
              onChange={(event) => setManualToken(event.target.value)}
              placeholder="Paste QR token manually"
              className="h-11 flex-1 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <button
              type="button"
              onClick={() => completeCheckIn({ token: manualToken })}
              disabled={!manualToken.trim() || scanSubmitting}
              className="h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200"
            >
              {scanSubmitting ? "Validating..." : "Validate Token"}
            </button>
          </div>
        </div>

        <div className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Manual Lookup</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email, or registration ID"
              className="h-11 flex-1 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <button
              type="button"
              onClick={lookupAttendee}
              disabled={!query.trim() || lookupLoading}
              className="h-11 rounded-full bg-[#4c1d95] px-5 text-sm font-semibold text-white transition hover:bg-[#5b21b6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {lookupLoading ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {lookupResults.map((registration) => (
              <div
                key={registration.id}
                className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {registration.first_name} {registration.last_name}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {registration.organization} | {registration.registration_code}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-500">
                  {registration.status}
                  {registration.checked_in_at ? " | already checked in" : ""}
                </p>
                <button
                  type="button"
                  onClick={() => completeCheckIn({ registrationId: registration.id })}
                  disabled={scanSubmitting}
                  className="mt-3 h-10 rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200"
                >
                  Check In This Attendee
                </button>
              </div>
            ))}
            {!lookupLoading && !lookupResults.length ? (
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
