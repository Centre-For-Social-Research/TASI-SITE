"use client";

import jsQR from "jsqr";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import scanSessionUtils from "@/lib/check-in-scan-session.cjs";
import checkInUtils from "@/lib/check-in-panel-utils.cjs";
import { AdminSectionHeading, AdminStatCard, AdminStatusBadge } from "@/components/admin/admin-ui";

const {
  classifyCameraStartFailure,
  getCameraStateMessage,
  isCheckInConfigError,
  getCheckInFeedbackTone,
  shouldRetryCameraRequest,
} = checkInUtils;
const { createScanSession } = scanSessionUtils;

function ResultCard({ title, description, tone = "default" }) {
  const toneMap = {
    default: "border-[#2a2d35] bg-[#14161b] text-[#dfe2ea]",
    success: "border-[#21493d] bg-[#0e211a] text-[#9fdec9]",
    danger: "border-[#6b2f2f] bg-[#231011] text-[#f4b0b0]",
    warning: "border-[#6b5224] bg-[#221a0b] text-[#f4d191]",
  };

  return (
    <div className={`rounded-[10px] border p-4 ${toneMap[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-relaxed opacity-90">{description}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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
  const [recentScans, setRecentScans] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const scanSessionRef = useRef(createScanSession());

  const cameraMessage = useMemo(() => getCameraStateMessage(cameraState), [cameraState]);
  const activityStats = useMemo(() => {
    const valid = recentScans.filter((scan) => scan.scan_result === "valid").length;
    const duplicates = recentScans.filter((scan) => scan.scan_result === "already_checked_in").length;
    const blocked = recentScans.filter((scan) => !["valid", "already_checked_in"].includes(scan.scan_result)).length;

    return {
      valid,
      duplicates,
      blocked,
      total: recentScans.length,
    };
  }, [recentScans]);

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
      scanSessionRef.current.markSubmitting();
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

        setRecentScans(data.recentScans || []);
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
        scanSessionRef.current.resetSubmission();
        setScanSubmitting(false);
      }
    },
    [deskLabel],
  );

  const scanFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const now = Date.now();

    if (!video || !canvas || cameraState !== "active") {
      return;
    }

    if (
      video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      video.videoWidth &&
      video.videoHeight &&
      scanSessionRef.current.shouldDecode(now) &&
      !scanSessionRef.current.isSubmitting()
    ) {
      const context = canvas.getContext("2d", { willReadFrequently: true });

      if (context) {
        const maxWidth = 720;
        const scale = Math.min(1, maxWidth / video.videoWidth);
        canvas.width = Math.max(Math.round(video.videoWidth * scale), 320);
        canvas.height = Math.max(Math.round(video.videoHeight * scale), 180);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code?.data && scanSessionRef.current.shouldSubmitToken(code.data, now)) {
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

  const bindStreamToVideo = useCallback(async (stream) => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.srcObject = stream;

    await new Promise((resolve) => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        resolve();
        return;
      }

      const handleLoadedMetadata = () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        resolve();
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
      window.setTimeout(() => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        resolve();
      }, 1000);
    });

    try {
      await video.play();
    } catch {
      // Some browsers reject play() even after the camera stream is granted.
      // We still continue so scanning can start once frames become available.
    }
  }, []);

  const requestCameraStream = useCallback(async () => {
    const requests = [
      {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 960 },
          height: { ideal: 540 },
        },
        audio: false,
      },
      {
        video: true,
        audio: false,
      },
    ];

    let lastError = null;

    for (const constraints of requests) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        lastError = error;
        const errorName = error instanceof DOMException ? error.name : "";

        if (!shouldRetryCameraRequest(errorName)) {
          throw error;
        }
      }
    }

    throw lastError || new Error("Unable to access the camera.");
  }, []);

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
    if (!window.isSecureContext) {
      setCameraState("insecure_or_blocked");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      return;
    }

    stopCamera("requesting");
    scanSessionRef.current = createScanSession();

    try {
      const stream = await requestCameraStream();

      streamRef.current = stream;
      await bindStreamToVideo(stream);

      setCameraState("active");
    } catch (error) {
      stopCamera(
        classifyCameraStartFailure({
          isSecureContext: window.isSecureContext,
          errorName: error instanceof DOMException ? error.name : "",
        }),
      );
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

  useEffect(() => {
    let active = true;

    async function loadRecentScans() {
      try {
        const response = await fetch("/api/check-in/recent", { cache: "no-store" });
        const data = await response.json();

        if (!active || !response.ok) {
          return;
        }

        setRecentScans(data.scans || []);
      } catch {
        // Keep check-in usable even if the recent scans widget cannot load.
      }
    }

    void loadRecentScans();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#23262d] bg-[#111318] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
        <AdminSectionHeading
          eyebrow="Check-In"
          title="Scanner-first entry validation"
          description="Keep the camera running during live operations, fall back to manual token lookup when needed, and keep the latest scan outcomes visible for the entire desk team."
        />
        <p className="mt-4 text-sm text-[#8d93a5]">
          Signed in as {operator.displayName} ({operator.primaryEmail}).
        </p>
        <label className="mt-5 flex max-w-sm flex-col gap-2 text-sm font-semibold text-[#f5f6f8]">
          Desk Label
          <input
            value={deskLabel}
            onChange={(event) => setDeskLabel(event.target.value)}
            className="h-11 rounded-xl border border-[#2c3038] bg-[#181b21] px-4 text-sm text-[#f5f6f8]"
          />
        </label>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Recent Valid" value={activityStats.valid} tone="success" detail="Fresh successful entry approvals" />
        <AdminStatCard label="Duplicates" value={activityStats.duplicates} tone="warning" detail="Already checked in attendees" />
        <AdminStatCard label="Blocked" value={activityStats.blocked} tone="danger" detail="Rejected or waitlisted entries" />
        <AdminStatCard label="Recent Total" value={activityStats.total} tone="info" detail="Rows shown in recent desk activity" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {configWarning ? (
          <div className="xl:col-span-2">
            <ResultCard title="Supabase Admin Configuration Required" description={configWarning} tone="danger" />
          </div>
        ) : null}
        <div className="rounded-[28px] border border-[#23262d] bg-[#111318] p-6">
          <p className="font-admin-mono text-[10px] uppercase tracking-[0.18em] text-[#798093]">Scanner Frame</p>
          <div className="mt-4 overflow-hidden rounded-[24px] border border-[#23262d] bg-[#050608]">
            <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startCamera}
              className="h-11 rounded-full bg-[#c8a96e] px-5 text-sm font-medium text-[#171107] transition hover:opacity-90"
            >
              {cameraState === "active" ? "Restart Camera Scan" : "Start Camera Scan"}
            </button>
            <button
              type="button"
              onClick={() => stopCamera()}
              className="h-11 rounded-full border border-[#30343d] bg-[#17191f] px-5 text-sm text-[#dfe2ea] transition hover:border-[#4a4f5a]"
            >
              Stop Camera
            </button>
          </div>
          <p className="mt-3 text-sm text-[#8d93a5]">{cameraMessage}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={manualToken}
              onChange={(event) => setManualToken(event.target.value)}
              placeholder="Paste QR token manually"
              className="h-11 flex-1 rounded-xl border border-[#2c3038] bg-[#181b21] px-4 text-sm text-[#f5f6f8]"
            />
            <button
              type="button"
              onClick={() => completeCheckIn({ token: manualToken })}
              disabled={!manualToken.trim() || scanSubmitting}
              className="h-11 rounded-full border border-[#30343d] bg-[#17191f] px-5 text-sm text-[#dfe2ea] transition hover:border-[#4a4f5a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {scanSubmitting ? "Validating..." : "Validate Token"}
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#23262d] bg-[#111318] p-6">
          <p className="font-admin-mono text-[10px] uppercase tracking-[0.18em] text-[#798093]">Manual Lookup</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email, or registration ID"
              className="h-11 flex-1 rounded-xl border border-[#2c3038] bg-[#181b21] px-4 text-sm text-[#f5f6f8]"
            />
            <button
              type="button"
              onClick={lookupAttendee}
              disabled={!query.trim() || lookupLoading}
              className="h-11 rounded-full bg-[#c8a96e] px-5 text-sm font-medium text-[#171107] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {lookupLoading ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {lookupResults.map((registration) => (
              <div
                key={registration.id}
                className="rounded-2xl border border-[#23262d] bg-[#17191f] p-4"
              >
                <p className="text-sm font-semibold text-[#f5f6f8]">
                  {registration.first_name} {registration.last_name}
                </p>
                <p className="mt-1 text-sm text-[#9ca3b5]">
                  {registration.organization} | {registration.registration_code}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <AdminStatusBadge tone={registration.status === "confirmed" ? "success" : registration.status === "pending" ? "warning" : "danger"}>{registration.status}</AdminStatusBadge>
                  {registration.checked_in_at ? <AdminStatusBadge tone="warning">already checked in</AdminStatusBadge> : null}
                </div>
                <button
                  type="button"
                  onClick={() => completeCheckIn({ registrationId: registration.id })}
                  disabled={scanSubmitting}
                  className="mt-3 h-10 rounded-full border border-[#30343d] bg-[#17191f] px-4 text-sm text-[#dfe2ea] transition hover:border-[#4a4f5a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Check In This Attendee
                </button>
              </div>
            ))}
            {!lookupLoading && !lookupResults.length ? (
              <p className="text-sm text-[#8d93a5]">
                Search results will appear here for manual fallback check-in.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#23262d] bg-[#111318] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-admin-mono text-[10px] uppercase tracking-[0.18em] text-[#798093]">Recent Activity</p>
            <h2 className="mt-2 font-admin-display text-3xl text-[#f5f6f8]">Last validated scans</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              void (async () => {
                try {
                  const response = await fetch("/api/check-in/recent", { cache: "no-store" });
                  const data = await response.json();
                  if (response.ok) {
                    setRecentScans(data.scans || []);
                  }
                } catch {
                  // Keep refresh action silent when the network is unstable on-site.
                }
              })();
            }}
            className="h-10 rounded-full border border-[#30343d] bg-[#17191f] px-4 text-sm text-[#dfe2ea] transition hover:border-[#4a4f5a]"
          >
            Refresh Activity
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {recentScans.map((scan) => (
            <div key={scan.id} className="rounded-2xl border border-[#23262d] bg-[#17191f] p-4">
              <p className="text-sm font-semibold text-[#f5f6f8]">
                {scan.registration?.first_name} {scan.registration?.last_name}
              </p>
              <div className="mt-2">
                <AdminStatusBadge tone={getCheckInFeedbackTone(scan.scan_result)}>{scan.scan_result.replaceAll("_", " ")}</AdminStatusBadge>
              </div>
              <p className="mt-2 text-sm text-[#9ca3b5]">
                {scan.registration?.registration_code} | {scan.registration?.organization}
              </p>
              <p className="mt-2 text-xs text-[#6f778a]">
                {scan.desk_label || "Desk not set"} | {formatDate(scan.created_at)}
              </p>
            </div>
          ))}
          {!recentScans.length ? (
            <p className="text-sm text-[#8d93a5]">
              Recent scan activity will appear here after the first successful validation.
            </p>
          ) : null}
        </div>
      </section>

      {scanMessage ? <ResultCard title={scanMessage.title} description={scanMessage.description} tone={scanMessage.tone} /> : null}
    </div>
  );
}
