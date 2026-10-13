// Schematic isometric view of the two Kamaladevi Complex floors TASI 2026
// uses. Coordinates are floor units: x runs to the lower right, y to the
// lower left, z up. Room positions are indicative, not to scale.

const UNIT = 22;
const COS = UNIT * 0.866;
const SIN = UNIT * 0.5;
const ORIGIN_X = 300;
const FIRST_FLOOR_Y = 114;
const GROUND_FLOOR_Y = 410;

export const ZONE_COLORS = {
  sessions: { pin: '#350265', pinText: '#ffffff' },
  breakouts: { pin: '#ff6900', pinText: '#ffffff' },
  connect: { pin: '#ffd919', pinText: '#350265' },
};

const FACES = {
  slab: ['#f6f1ea', '#ddd5c9', '#c7bead'],
  sessions: ['#dccbf3', '#8e5ccf', '#5b2a99'],
  breakouts: ['#ffd6b8', '#ff8c3a', '#d95700'],
  breakoutsAlt: ['#ffe4cf', '#ffa25e', '#e56a12'],
  connect: ['#fff1a6', '#ffd919', '#d1ad00'],
  core: ['#e7e5e4', '#a8a29e', '#78716c'],
  grass: ['#d3eac8', '#9fca8f', '#7fae6d'],
};

function point(x, y, z, baseY) {
  return [ORIGIN_X + (x - y) * COS, baseY + (x + y) * SIN - z * UNIT];
}

function polygon(points) {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

function Box({ x0, y0, x1, y1, h, baseY, z = 0, faces }) {
  const [top, left, right] = faces;
  const p = (x, y, dz) => point(x, y, z + dz, baseY);
  return (
    <g>
      <polygon
        points={polygon([
          p(x0, y1, 0),
          p(x1, y1, 0),
          p(x1, y1, h),
          p(x0, y1, h),
        ])}
        fill={left}
      />
      <polygon
        points={polygon([
          p(x1, y0, 0),
          p(x1, y1, 0),
          p(x1, y1, h),
          p(x1, y0, h),
        ])}
        fill={right}
      />
      <polygon
        points={polygon([
          p(x0, y0, h),
          p(x1, y0, h),
          p(x1, y1, h),
          p(x0, y1, h),
        ])}
        fill={top}
        stroke="#ffffff"
        strokeOpacity="0.55"
        strokeWidth="1"
      />
    </g>
  );
}

function Pin({
  x,
  y,
  z,
  baseY,
  marker,
  zone,
  label,
  sublabel,
  side = 'right',
}) {
  const [px, py] = point(x, y, z, baseY);
  const { pin, pinText } = ZONE_COLORS[zone];
  const cy = py - 34;
  const textX = side === 'right' ? px + 20 : px - 20;
  const anchor = side === 'right' ? 'start' : 'end';
  return (
    <g>
      <line
        x1={px}
        y1={py}
        x2={px}
        y2={cy}
        stroke="#1c1917"
        strokeWidth="1.5"
      />
      <circle cx={px} cy={py} r="3" fill="#1c1917" />
      <circle
        cx={px}
        cy={cy}
        r="14"
        fill={pin}
        stroke="#ffffff"
        strokeWidth="2"
      />
      <text
        x={px}
        y={cy + 5}
        textAnchor="middle"
        fontSize="14"
        fontWeight="800"
        fill={pinText}
      >
        {marker}
      </text>
      <text
        x={textX}
        y={cy + (sublabel ? -1 : 5)}
        textAnchor={anchor}
        fontSize="16"
        fontWeight="800"
        fill="#1c1917"
        stroke="#ffffff"
        strokeWidth="4"
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {label}
      </text>
      {sublabel ? (
        <text
          x={textX}
          y={cy + 15}
          textAnchor={anchor}
          fontSize="12.5"
          fontWeight="600"
          fill="#57534e"
          stroke="#ffffff"
          strokeWidth="4"
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          {sublabel}
        </text>
      ) : null}
    </g>
  );
}

function CoreTags({ baseY }) {
  const [lx, ly] = point(13.3, 0.9, 0.9, baseY);
  const [sx, sy] = point(12.1, 1.7, 0.9, baseY);
  return (
    <g>
      <g transform={`translate(${lx - 11} ${ly - 11})`}>
        <rect width="22" height="22" rx="5" fill="#1c1917" />
        <path d="M11 4.5 15 9H7z M11 17.5 7 13h8z" fill="#ffffff" />
      </g>
      <g transform={`translate(${sx - 11} ${sy - 11})`}>
        <rect width="22" height="22" rx="5" fill="#1c1917" />
        <path
          d="M5 16h4v-3.5h4V9h4"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

function Floor({ baseY }) {
  return (
    <Box
      x0={0}
      y0={0}
      x1={14}
      y1={9}
      h={0.35}
      z={-0.35}
      baseY={baseY}
      faces={FACES.slab}
    />
  );
}

function Tree({ x, y, baseY }) {
  const [px, py] = point(x, y, 0, baseY);
  return (
    <g>
      <ellipse cx={px} cy={py} rx="9" ry="4.5" fill="#6f9a5f" opacity="0.45" />
      <circle cx={px} cy={py - 11} r="9" fill="#5f9150" />
      <circle cx={px - 3} cy={py - 14} r="4" fill="#7fb06d" />
    </g>
  );
}

export default function VenueMapIllustration() {
  const ff = FIRST_FLOOR_Y;
  const gf = GROUND_FLOOR_Y;
  // Guests walk in on the side facing Gate 1, at the front of the drawing.
  const [entryX, entryY] = point(11.6, 9.15, 0, gf);
  const [entryFromX, entryFromY] = point(11.6, 11.8, 0, gf);
  const entryAngle = Math.atan2(entryY - entryFromY, entryX - entryFromX);
  const arrowHead = [0, -6, 6].map((offset) => {
    const back = offset === 0 ? 0 : 13;
    const angle = entryAngle + Math.PI / 2;
    return [
      entryX - Math.cos(entryAngle) * back + Math.cos(angle) * offset,
      entryY - Math.sin(entryAngle) * back + Math.sin(angle) * offset,
    ];
  });

  return (
    <svg
      viewBox="0 70 640 665"
      role="img"
      aria-labelledby="venue-map-title venue-map-desc"
      className="h-auto w-full font-sans"
    >
      <title id="venue-map-title">Kamaladevi Complex venue map</title>
      <desc id="venue-map-desc">
        Ground floor: you enter on the side facing Gate 1, where the
        registration desk, a selfie point and exhibition stalls 1 to 5 are. The
        Main Hall is behind them, and lunch is in the Rose Garden behind the
        Main Hall. First floor: Workshop Room and Roundtable Room. A lift and
        stairs connect the two floors.
      </desc>

      {/* First floor */}
      <Floor baseY={ff} />
      <Box
        x0={11.4}
        y0={0}
        x1={14}
        y1={2.4}
        h={0.9}
        baseY={ff}
        faces={FACES.core}
      />
      <Box
        x0={0}
        y0={0}
        x1={9}
        y1={5.5}
        h={1.1}
        baseY={ff}
        faces={FACES.breakouts}
      />
      <Box
        x0={9}
        y0={2.8}
        x1={14}
        y1={7.6}
        h={1.1}
        baseY={ff}
        faces={FACES.breakoutsAlt}
      />
      <CoreTags baseY={ff} />

      {/* Rose Garden, behind the Main Hall */}
      <Box
        x0={-5.4}
        y0={-0.5}
        x1={-0.6}
        y1={7}
        h={0.2}
        z={-0.2}
        baseY={gf}
        faces={FACES.grass}
      />
      {[
        [-4.6, 0.3],
        [-4.4, 6.1],
        [-1.6, 5.6],
      ].map(([x, y]) => (
        <Tree key={`${x}-${y}`} x={x} y={y} baseY={gf} />
      ))}

      {/* Ground floor */}
      <Floor baseY={gf} />
      <Box
        x0={11.4}
        y0={0}
        x1={14}
        y1={2.4}
        h={0.9}
        baseY={gf}
        faces={FACES.core}
      />
      <Box
        x0={0}
        y0={0}
        x1={9.5}
        y1={5.8}
        h={1.4}
        baseY={gf}
        faces={FACES.sessions}
      />
      {[2.8, 3.7, 4.6, 5.5, 6.4].map((y) => (
        <Box
          key={y}
          x0={12.7}
          y0={y}
          x1={13.8}
          y1={y + 0.8}
          h={0.6}
          baseY={gf}
          faces={FACES.connect}
        />
      ))}
      <Box
        x0={4}
        y0={7.7}
        x1={9.6}
        y1={8.4}
        h={0.5}
        baseY={gf}
        faces={FACES.connect}
      />
      <Box
        x0={12.4}
        y0={8}
        x1={13.3}
        y1={8.8}
        h={0.25}
        baseY={gf}
        faces={FACES.connect}
      />
      <CoreTags baseY={gf} />

      {/* Entry */}
      <line
        x1={entryFromX}
        y1={entryFromY}
        x2={arrowHead[1][0] + (arrowHead[2][0] - arrowHead[1][0]) / 2}
        y2={arrowHead[1][1] + (arrowHead[2][1] - arrowHead[1][1]) / 2}
        stroke="#350265"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <polygon points={polygon(arrowHead)} fill="#350265" />
      <text
        x={entryFromX - 22}
        y={entryFromY + 20}
        fontSize="15"
        fontWeight="800"
        fill="#350265"
      >
        Entry
      </text>
      <text
        x={entryFromX + 26}
        y={entryFromY + 20}
        fontSize="11.5"
        fill="#57534e"
      >
        from Gate 1
      </text>

      {/* Floor labels */}
      <text
        x="18"
        y="150"
        fontSize="14"
        fontWeight="800"
        letterSpacing="2"
        fill="#350265"
      >
        FIRST FLOOR
      </text>
      <text x="18" y="168" fontSize="12" fill="#57534e">
        One level up
      </text>
      <text
        x="18"
        y="590"
        fontSize="14"
        fontWeight="800"
        letterSpacing="2"
        fill="#350265"
      >
        GROUND FLOOR
      </text>
      <text x="18" y="608" fontSize="12" fill="#57534e">
        Kamaladevi Complex
      </text>

      {/* Pins, drawn last so they sit above every block */}
      <Pin
        x={4.5}
        y={2.75}
        z={1.1}
        baseY={ff}
        marker="5"
        zone="breakouts"
        label="Workshop Room"
        sublabel="Seminar Halls 1 & 2"
      />
      <Pin
        x={11.5}
        y={5.2}
        z={1.1}
        baseY={ff}
        marker="6"
        zone="breakouts"
        label="Roundtable Room"
        side="left"
        sublabel="Seminar Hall 3"
      />
      <Pin
        x={-3}
        y={3.25}
        z={0}
        baseY={gf}
        marker="4"
        zone="connect"
        label="Lunch"
        sublabel="Rose Garden"
      />
      <Pin
        x={4.75}
        y={2.9}
        z={1.4}
        baseY={gf}
        marker="1"
        zone="sessions"
        label="Main Hall"
        sublabel="Multipurpose Hall"
      />
      <Pin
        x={6.8}
        y={8}
        z={0.5}
        baseY={gf}
        marker="R"
        zone="connect"
        label="Registration"
        side="left"
      />
      <Pin
        x={13.25}
        y={4.6}
        z={0.6}
        baseY={gf}
        marker="2"
        zone="connect"
        label="Exhibition"
        side="left"
        sublabel="Stalls 1–5"
      />
      <Pin
        x={12.85}
        y={8.4}
        z={0.25}
        baseY={gf}
        marker="3"
        zone="connect"
        label="Selfie Point"
        side="left"
      />
    </svg>
  );
}
