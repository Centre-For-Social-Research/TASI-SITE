'use client';

import jsQR from 'jsqr';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import scanSessionUtils from '@/lib/check-in-scan-session.cjs';
import checkInUtils from '@/lib/check-in-panel-utils.cjs';
import checkInDayUtils from '@/lib/check-in-day-utils.cjs';
import { AdminStatCard, AdminStatusBadge } from '@/components/admin/admin-ui';
import AdminPageIntro from '@/components/admin/admin-page-intro';

const {
  classifyCameraStartFailure,
  getCameraStateMessage,
  isCheckInConfigError,
  getCheckInFeedbackTone,
  shouldRetryCameraRequest,
} = checkInUtils;
const { createScanSession } = scanSessionUtils;
const {
  CHECK_IN_DAYS,
  getCheckInDayShortLabel,
  getDefaultCheckInDay,
  isCheckedInForDay,
} = checkInDayUtils;

function ResultCard({ title, description, tone = 'default' }) {
  const toneMap = {
    default:
      'border-zinc-200 bg-white text-zinc-700 dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-zinc-200',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
    danger:
      'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200',
    warning:
      'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
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
    return 'Not yet';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function CheckInPanel({ operator }) {
  const [deskLabel, setDeskLabel] = useState('Main Desk');
  const [selectedEventDay, setSelectedEventDay] = useState(() =>
    getDefaultCheckInDay()
  );
  const [query, setQuery] = useState('');
  const [lookupResults, setLookupResults] = useState([]);
  const [scanMessage, setScanMessage] = useState(null);
  const [cameraState, setCameraState] = useState('idle');
  const [manualToken, setManualToken] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [scanSubmitting, setScanSubmitting] = useState(false);
  const [configWarning, setConfigWarning] = useState('');
  const [recentScans, setRecentScans] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const scanSessionRef = useRef(createScanSession());

  const cameraMessage = useMemo(
    () => getCameraStateMessage(cameraState),
    [cameraState]
  );
  const selectedEventDayLabel = useMemo(
    () => getCheckInDayShortLabel(selectedEventDay),
    [selectedEventDay]
  );
  const activityStats = useMemo(() => {
    const valid = recentScans.filter(
      (scan) => scan.scan_result === 'valid'
    ).length;
    const duplicates = recentScans.filter(
      (scan) => scan.scan_result === 'already_checked_in'
    ).length;
    const blocked = recentScans.filter(
      (scan) => !['valid', 'already_checked_in'].includes(scan.scan_result)
    ).length;

    return {
      valid,
      duplicates,
      blocked,
      total: recentScans.length,
    };
  }, [recentScans]);

  const stopCamera = useCallback((nextState = 'idle') => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState(nextState);
  }, []);

  const completeCheckIn = useCallback(
    async (payload) => {
      scanSessionRef.current.markSubmitting();
      setScanSubmitting(true);

      try {
        const response = await fetch('/api/check-in/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deskLabel,
            eventDay: selectedEventDay,
            ...payload,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error || 'Unable to complete check-in.';
          setScanMessage({
            tone: 'danger',
            title: isCheckInConfigError(errorMessage)
              ? 'Supabase Admin Configuration Required'
              : 'Check-in failed',
            description: isCheckInConfigError(errorMessage)
              ? 'Check-in tools need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the deployment environment before scans and lookups can reach registrant data.'
              : errorMessage,
          });
          return;
        }

        setRecentScans(data.recentScans || []);
        setScanMessage({
          tone: getCheckInFeedbackTone(data.result),
          title:
            data.result === 'valid'
              ? `Attendee approved for ${selectedEventDayLabel}`
              : data.result === 'already_checked_in'
                ? `Already checked in for ${selectedEventDayLabel}`
                : data.result === 'waitlisted'
                  ? 'Attendee waitlisted'
                  : 'Entry blocked',
          description: `${data.registration.first_name} ${data.registration.last_name} | ${data.registration.organization} | ${data.registration.registration_code}`,
        });
      } catch {
        setScanMessage({
          tone: 'danger',
          title: 'Check-in failed',
          description: 'Network error while validating the attendee.',
        });
      } finally {
        scanSessionRef.current.resetSubmission();
        setScanSubmitting(false);
      }
    },
    [deskLabel, selectedEventDay, selectedEventDayLabel]
  );

  async function startCamera() {
    if (!window.isSecureContext) {
      setCameraState('insecure_or_blocked');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('unsupported');
      return;
    }

    stopCamera('requesting');
    scanSessionRef.current = createScanSession();

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
    } catch (error) {
      const errorName = error instanceof DOMException ? error.name : '';
      if (shouldRetryCameraRequest(errorName)) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (fallbackError) {
          stopCamera(
            classifyCameraStartFailure({
              isSecureContext: window.isSecureContext,
              errorName:
                fallbackError instanceof DOMException ? fallbackError.name : '',
            })
          );
          return;
        }
      } else {
        stopCamera(
          classifyCameraStartFailure({
            isSecureContext: window.isSecureContext,
            errorName,
          })
        );
        return;
      }
    }

    streamRef.current = stream;
    const video = videoRef.current;
    video.srcObject = stream;
    await video.play();
    setCameraState('active');

    function scanFrame() {
      if (
        !videoRef.current ||
        videoRef.current.readyState < videoRef.current.HAVE_ENOUGH_DATA
      ) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const now = Date.now();
      if (scanSessionRef.current.shouldDecode(now)) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsQR(imageData.data, canvas.width, canvas.height);
        if (result?.data) {
          const token = result.data.trim();
          if (
            scanSessionRef.current.shouldSubmitToken(token, now) &&
            !scanSessionRef.current.isSubmitting()
          ) {
            stopCamera();
            setManualToken(token);
            void completeCheckIn({ token });
            return;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }

  async function lookupAttendee() {
    setLookupLoading(true);

    try {
      const response = await fetch('/api/check-in/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, eventDay: selectedEventDay }),
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Unable to search attendees.';
        setScanMessage({
          tone: 'danger',
          title: isCheckInConfigError(errorMessage)
            ? 'Supabase Admin Configuration Required'
            : 'Lookup failed',
          description: isCheckInConfigError(errorMessage)
            ? 'Attendee lookup needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the deployment environment before it can load registrants.'
            : errorMessage,
        });
        setLookupResults([]);
        return;
      }

      setLookupResults(data.registrations || []);
    } catch {
      setScanMessage({
        tone: 'danger',
        title: 'Lookup failed',
        description: 'Network error while searching attendees.',
      });
      setLookupResults([]);
    } finally {
      setLookupLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadConfigHealth() {
      try {
        const response = await fetch('/api/health', { cache: 'no-store' });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const supabaseServices = data?.services?.supabase;

        if (!active || !supabaseServices) {
          return;
        }

        if (
          !supabaseServices.urlConfigured ||
          !supabaseServices.serviceRoleConfigured
        ) {
          setConfigWarning(
            'Supabase admin access is not configured in this deployment. Camera scans, attendee lookup, and check-in validation will stay unavailable until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are added.'
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
        const response = await fetch(
          `/api/check-in/recent?eventDay=${encodeURIComponent(selectedEventDay)}`,
          {
            cache: 'no-store',
          }
        );
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
  }, [selectedEventDay]);

  useEffect(
    () => () => {
      stopCamera();
    },
    [stopCamera]
  );

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <AdminPageIntro
          eyebrow="Check-In"
          title="Scanner-first entry validation"
          description="Keep the camera running during live operations, fall back to manual lookup when needed, and keep the latest scan outcomes visible for the whole desk team."
          chips={[
            `Desk lead: ${operator.displayName}`,
            selectedEventDayLabel,
            'Live QR scanning',
            'Manual attendee lookup',
          ]}
        />
        <div className="mt-5 flex flex-wrap gap-4">
          <label className="flex min-w-64 flex-col gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Desk Label
            <input
              id="deskLabel"
              name="deskLabel"
              value={deskLabel}
              onChange={(event) => setDeskLabel(event.target.value)}
              className="h-11 rounded-[10px] border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
            />
          </label>
          <fieldset className="flex flex-col gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            <legend>Event Day</legend>
            <div className="inline-flex h-11 rounded-[10px] border border-zinc-200 bg-zinc-50 p-1 dark:border-white/10 dark:bg-white/[0.06]">
              {CHECK_IN_DAYS.map((day) => {
                const selected = selectedEventDay === day.value;
                return (
                  <label
                    key={day.value}
                    className={`flex cursor-pointer items-center rounded-[10px] px-4 text-sm transition ${
                      selected
                        ? 'bg-purple-600 text-white'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="eventDay"
                      value={day.value}
                      checked={selected}
                      onChange={() => setSelectedEventDay(day.value)}
                      className="sr-only"
                    />
                    {day.shortLabel}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Recent Valid"
          value={activityStats.valid}
          tone="success"
          detail={`${selectedEventDayLabel} successful approvals`}
        />
        <AdminStatCard
          label="Duplicates"
          value={activityStats.duplicates}
          tone="warning"
          detail={`${selectedEventDayLabel} repeat attempts`}
        />
        <AdminStatCard
          label="Blocked"
          value={activityStats.blocked}
          tone="danger"
          detail={`${selectedEventDayLabel} rejected or waitlisted entries`}
        />
        <AdminStatCard
          label="Recent Total"
          value={activityStats.total}
          tone="info"
          detail={`${selectedEventDayLabel} rows shown below`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {configWarning ? (
          <div className="xl:col-span-2">
            <ResultCard
              title="Supabase Admin Configuration Required"
              description={configWarning}
              tone="danger"
            />
          </div>
        ) : null}
        <div className="rounded-[10px] border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-600">
            Scanner Frame
          </p>
          <div className="mt-4 overflow-hidden rounded-[10px] border border-zinc-200 bg-zinc-950 dark:border-white/[0.06]">
            <video
              ref={videoRef}
              className="aspect-video w-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startCamera}
              className="h-11 rounded-full bg-purple-600 px-5 text-sm font-medium text-white transition hover:bg-purple-700"
            >
              {cameraState === 'active'
                ? 'Restart Camera Scan'
                : 'Start Camera Scan'}
            </button>
            <button
              type="button"
              onClick={() => stopCamera()}
              className="h-11 rounded-full border border-zinc-200 bg-white px-5 text-sm text-zinc-700 transition hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:border-white/10"
            >
              Stop Camera
            </button>
          </div>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            {cameraMessage}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              id="manualToken"
              name="manualToken"
              value={manualToken}
              onChange={(event) => setManualToken(event.target.value)}
              placeholder="Paste QR token manually"
              className="h-11 flex-1 rounded-[10px] border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={() => completeCheckIn({ token: manualToken })}
              disabled={!manualToken.trim() || scanSubmitting}
              className="h-11 rounded-full border border-zinc-200 bg-white px-5 text-sm text-zinc-700 transition hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:border-white/10"
            >
              {scanSubmitting ? 'Validating...' : 'Validate Token'}
            </button>
          </div>
        </div>

        <div className="rounded-[10px] border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-600">
            Manual Lookup
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              id="lookupQuery"
              name="lookupQuery"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email, or registration ID"
              className="h-11 flex-1 rounded-[10px] border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={lookupAttendee}
              disabled={!query.trim() || lookupLoading}
              className="h-11 rounded-full bg-purple-600 px-5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {lookupLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {lookupResults.map((registration) => {
              const checkedInForSelectedDay = isCheckedInForDay(
                registration,
                selectedEventDay
              );
              return (
                <div
                  key={registration.id}
                  className="rounded-[10px] border border-zinc-200 bg-zinc-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.04]"
                >
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {registration.first_name} {registration.last_name}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {registration.organization} |{' '}
                    {registration.registration_code}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <AdminStatusBadge
                      tone={
                        registration.status === 'confirmed'
                          ? 'success'
                          : registration.status === 'pending'
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {registration.status}
                    </AdminStatusBadge>
                    {checkedInForSelectedDay ? (
                      <AdminStatusBadge tone="warning">
                        checked in {selectedEventDayLabel}
                      </AdminStatusBadge>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      completeCheckIn(
                        registration.check_in_kind === 'festival_ticket'
                          ? { festivalTicketId: registration.id }
                          : { registrationId: registration.id }
                      )
                    }
                    disabled={scanSubmitting}
                    className="mt-3 h-10 rounded-full border border-zinc-200 bg-white px-4 text-sm text-zinc-700 transition hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:border-white/10"
                  >
                    Check In For {selectedEventDayLabel}
                  </button>
                </div>
              );
            })}
            {!lookupLoading && !lookupResults.length ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Search results will appear here for manual fallback check-in.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[10px] border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-600">
              Recent Activity
            </p>
            <h2 className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Last validated scans
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              void (async () => {
                try {
                  const response = await fetch(
                    `/api/check-in/recent?eventDay=${encodeURIComponent(selectedEventDay)}`,
                    {
                      cache: 'no-store',
                    }
                  );
                  const data = await response.json();
                  if (response.ok) {
                    setRecentScans(data.scans || []);
                  }
                } catch {
                  // Keep refresh action silent when the network is unstable on-site.
                }
              })();
            }}
            className="h-10 rounded-full border border-zinc-200 bg-white px-4 text-sm text-zinc-700 transition hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:border-white/10"
          >
            Refresh Activity
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {recentScans.map((scan) => (
            <div
              key={scan.id}
              className="rounded-[10px] border border-zinc-200 bg-zinc-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.04]"
            >
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {scan.registration?.first_name} {scan.registration?.last_name}
              </p>
              <div className="mt-2">
                <AdminStatusBadge
                  tone={getCheckInFeedbackTone(scan.scan_result)}
                >
                  {scan.scan_result.replaceAll('_', ' ')}
                </AdminStatusBadge>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {scan.registration?.registration_code} |{' '}
                {scan.registration?.organization}
              </p>
              <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                {scan.desk_label || 'Desk not set'} |{' '}
                {getCheckInDayShortLabel(scan.event_day)} |{' '}
                {formatDate(scan.created_at)}
              </p>
            </div>
          ))}
          {!recentScans.length ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Recent scan activity will appear here after the first successful
              validation.
            </p>
          ) : null}
        </div>
      </section>

      {scanMessage ? (
        <ResultCard
          title={scanMessage.title}
          description={scanMessage.description}
          tone={scanMessage.tone}
        />
      ) : null}
    </div>
  );
}
