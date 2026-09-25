'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Pause, Play } from 'lucide-react';
import { speakerCountries2026 } from '@/data/speaker-countries-2026';
import {
  createRoute,
  DELHI,
  getMapView,
  MAP_HEIGHT,
  MAP_WIDTH,
  projectLocation,
} from '@/lib/speaker-map-geometry.mjs';
import styles from './speaker-countries-map.module.css';

const locations = speakerCountries2026.filter((country) => !country.host);
const routes = locations.map(createRoute);
const delhi = projectLocation(DELHI);
const desktopView = getMapView(routes);
const serverSnapshot = () => false;
const mediaSubscription = (query) => (notify) => {
  const media = window.matchMedia(query);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
const subscribeMobile = mediaSubscription('(max-width: 639px)');
const subscribeReducedMotion = mediaSubscription(
  '(prefers-reduced-motion: reduce)'
);
const mobileSnapshot = () => window.matchMedia('(max-width: 639px)').matches;
const reducedMotionSnapshot = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function AnimatedConnections({
  view,
  paused,
  reducedMotion,
  selected,
  onUnavailable,
}) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const pausedRef = useRef(paused);
  const visibleRef = useRef(false);
  const selectedRef = useRef(selected);
  const viewRef = useRef(view);

  useEffect(() => {
    viewRef.current = view;
    engineRef.current?.setView(view);
  }, [view]);

  useEffect(() => {
    selectedRef.current = selected;
    engineRef.current?.setSelection(selected);
  }, [selected]);

  useEffect(() => {
    pausedRef.current = paused;
    engineRef.current?.setRunning(
      !paused && visibleRef.current && !document.hidden
    );
  }, [paused]);

  useEffect(() => {
    if (reducedMotion) return;
    const container = containerRef.current;
    let cancelled = false;
    let loading = false;
    const updatePlayback = () =>
      engineRef.current?.setRunning(
        visibleRef.current && !pausedRef.current && !document.hidden
      );
    const load = async () => {
      if (loading || cancelled) return;
      loading = true;
      try {
        const { createSpeakerMapRenderer } =
          await import('./speaker-map-renderer');
        if (cancelled) return;
        engineRef.current = createSpeakerMapRenderer(
          container,
          routes,
          viewRef.current
        );
        engineRef.current.setSelection(selectedRef.current);
        updatePlayback();
      } catch {
        // SVG geography, connections and labels remain available without WebGL.
        if (!cancelled) onUnavailable();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) void load();
      updatePlayback();
    });
    observer.observe(container);
    document.addEventListener('visibilitychange', updatePlayback);
    const contextLost = (event) => {
      event.preventDefault();
      engineRef.current?.setRunning(false);
      onUnavailable();
    };
    container.addEventListener('webglcontextlost', contextLost, true);
    return () => {
      cancelled = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', updatePlayback);
      container.removeEventListener('webglcontextlost', contextLost, true);
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [reducedMotion, onUnavailable]);

  return (
    <div ref={containerRef} className={styles.animation} aria-hidden="true" />
  );
}

export default function SpeakerCountriesMap() {
  const id = useId().replaceAll(':', '');
  const [selected, setSelected] = useState('all');
  const [paused, setPaused] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const mobile = useSyncExternalStore(
    subscribeMobile,
    mobileSnapshot,
    serverSnapshot
  );
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionSnapshot,
    serverSnapshot
  );
  const onUnavailable = useMemo(() => () => setUnavailable(true), []);
  const focused = selected !== 'all';
  const view = useMemo(
    () =>
      mobile && focused ? getMapView(routes, true, selected) : desktopView,
    [mobile, focused, selected]
  );
  const selectedCountry = speakerCountries2026.find(
    (country) => country.id === selected
  );
  const isStatic = reducedMotion || unavailable;
  const selectId = `${id}-country`;
  const labelScale = mobile ? Math.max(1, view.width / 340) : 1;
  const delhiLabelX = mobile
    ? Math.min(
        view.x + view.width - 48 * labelScale,
        Math.max(view.x + 48 * labelScale, delhi.x)
      )
    : delhi.x + 28;

  return (
    <section
      id="speaker-countries"
      className={styles.section}
      aria-labelledby={`${id}-heading`}
    >
      <div className={styles.inner}>
        <div className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>TASI 2026 · A GLOBAL COMMUNITY</p>
            <h2 id={`${id}-heading`} className={styles.heading}>
              Global voices.
              <br />
              <span>Connected in Delhi.</span>
            </h2>
          </div>
          <div className={styles.intro}>
            <p>
              Across borders, united by a safer digital world. Explore the
              countries that will be represented in our TASI 2026 speaker
              community.
            </p>
            <p className={styles.stat}>
              <strong>{speakerCountries2026.length}</strong> countries{' '}
              <span aria-hidden="true">/</span> one shared conversation
            </p>
          </div>
        </div>

        <div className={styles.mapPanel}>
          <div className={styles.toolbar}>
            <div className={styles.legend}>
              <span className={styles.legendDot} aria-hidden="true" />
              <span>Speaker countries</span>
              <span className={styles.legendLine} aria-hidden="true" />
              <span>Delhi, India</span>
            </div>
            {!isStatic && (
              <button
                type="button"
                className={styles.motionControl}
                onClick={() => setPaused(!paused)}
                aria-label={
                  paused ? 'Play map animation' : 'Pause map animation'
                }
              >
                {paused ? (
                  <Play size={14} aria-hidden="true" />
                ) : (
                  <Pause size={14} aria-hidden="true" />
                )}
                {paused ? 'Play' : 'Pause'}
              </button>
            )}
          </div>

          <div
            className={styles.mapViewport}
            style={{ aspectRatio: `${view.width} / ${view.height}` }}
          >
            <svg
              className={styles.map}
              viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
              aria-hidden="true"
            >
              <defs>
                <radialGradient id={`${id}-glow`}>
                  <stop offset="0" stopColor="#ffd919" stopOpacity=".3" />
                  <stop offset="1" stopColor="#ffd919" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`${id}-route`} x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#cf76d3" stopOpacity=".65" />
                  <stop offset="1" stopColor="#ffbb53" stopOpacity=".7" />
                </linearGradient>
              </defs>
              <g className={styles.grid}>
                {Array.from({ length: 13 }, (_, index) => (
                  <line
                    key={`v${index}`}
                    x1={index * 120}
                    y1="0"
                    x2={index * 120}
                    y2={MAP_HEIGHT}
                  />
                ))}
                {Array.from({ length: 6 }, (_, index) => (
                  <line
                    key={`h${index}`}
                    x1="0"
                    y1={index * 120 + 20}
                    x2={MAP_WIDTH}
                    y2={index * 120 + 20}
                  />
                ))}
              </g>
              <image
                href="/maps/speaker-world.svg"
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
              />
              <g fill="none" stroke={`url(#${id}-route)`}>
                {routes.map((route) => (
                  <path
                    key={route.id}
                    d={route.path}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth={selected === route.id ? 1.8 : 1}
                    opacity={!focused || selected === route.id ? 1 : 0.22}
                  />
                ))}
              </g>
              <circle
                cx={delhi.x}
                cy={delhi.y}
                r="65"
                fill={`url(#${id}-glow)`}
              />
            </svg>

            <AnimatedConnections
              view={view}
              paused={paused || unavailable}
              reducedMotion={reducedMotion}
              selected={selected}
              onUnavailable={onUnavailable}
            />

            <svg
              className={`${styles.map} ${styles.labels}`}
              viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
              aria-hidden="true"
            >
              {locations.map((location) => {
                const point = projectLocation(location);
                const [dx, dy] = mobile
                  ? [
                      point.x > delhi.x ? -18 * labelScale : 18 * labelScale,
                      -18 * labelScale,
                    ]
                  : location.label;
                const active = selected === location.id;
                const showLabel = !mobile || (focused && active);
                return (
                  <g key={location.id} opacity={!focused || active ? 1 : 0.38}>
                    {showLabel && (
                      <path
                        d={`M ${point.x} ${point.y} L ${point.x + dx * 0.7} ${point.y + dy} L ${point.x + dx} ${point.y + dy}`}
                        className={styles.leader}
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={(active ? 10 : 8) * labelScale}
                      fill="#e78ceb"
                      opacity=".15"
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={(active ? 4.5 : 3.5) * labelScale}
                      fill={active ? '#ffd919' : '#e5a0e6'}
                      stroke="#f9e7fb"
                      strokeWidth="1"
                    />
                    {showLabel && (
                      <text
                        x={point.x + dx + (dx > 0 ? 5 : -5)}
                        y={point.y + dy + 4}
                        textAnchor={dx > 0 ? 'start' : 'end'}
                        className={styles.countryLabel}
                        style={{ fontSize: 13 * labelScale }}
                      >
                        {location.country}
                      </text>
                    )}
                  </g>
                );
              })}
              <circle
                cx={delhi.x}
                cy={delhi.y}
                r={20 * labelScale}
                fill="none"
                stroke="#ffd919"
                strokeOpacity=".3"
              />
              <circle
                cx={delhi.x}
                cy={delhi.y}
                r={12 * labelScale}
                fill="#ffd919"
                fillOpacity=".15"
                stroke="#ffd919"
                strokeWidth="1.5"
              />
              <circle
                cx={delhi.x}
                cy={delhi.y}
                r={5.5 * labelScale}
                fill="#ffd919"
                stroke="#fff8cb"
                strokeWidth="1.5"
              />
              <text
                x={delhiLabelX}
                y={mobile ? delhi.y + 32 * labelScale : delhi.y - 1}
                textAnchor={mobile ? 'middle' : 'start'}
                style={{ fontSize: (mobile ? 18 : 23) * labelScale }}
                className={styles.delhiLabel}
              >
                DELHI
              </text>
              <text
                x={delhiLabelX}
                y={mobile ? delhi.y + 46 * labelScale : delhi.y + 17}
                textAnchor={mobile ? 'middle' : 'start'}
                style={{ fontSize: (mobile ? 9 : 10) * labelScale }}
                className={styles.indiaLabel}
              >
                {mobile ? 'INDIA' : 'INDIA · TASI 2026'}
              </text>
            </svg>
          </div>

          <div className={styles.mapFooter}>
            <div className={styles.countrySelect}>
              <label htmlFor={selectId}>Explore a country</label>
              <select
                id={selectId}
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
              >
                <option value="all">
                  All {speakerCountries2026.length} countries
                </option>
                {speakerCountries2026.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.country}
                    {country.host ? ' · Host country' : ''}
                  </option>
                ))}
              </select>
            </div>
            <p className={styles.connectionCaption} aria-live="polite">
              {selectedCountry
                ? selectedCountry.host
                  ? 'Delhi, India · Our meeting point'
                  : `${selectedCountry.country} → Delhi, India`
                : 'Many perspectives. A shared commitment to trust and safety.'}
            </p>
          </div>
        </div>
        <p className={styles.footnote}>
          Based on TASI 2026 speaker profiles received as of 25 September 2026,
          plus organizer-confirmed participation from Germany and Malaysia.
        </p>
      </div>
    </section>
  );
}
