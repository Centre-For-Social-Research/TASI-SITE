export const MAP_WIDTH = 1440;
export const MAP_HEIGHT = 680;
export const DELHI = {
  id: 'delhi',
  city: 'Delhi',
  country: 'India',
  longitude: 77.209,
  latitude: 28.6139,
};

// Equirectangular projection shared by the SVG basemap and WebGL overlay.
export function projectLocation({ longitude, latitude }) {
  return { x: (longitude + 180) * 4, y: (85 - latitude) * 4 };
}

export function createRoute(location) {
  const start = projectLocation(location);
  const end = projectLocation(DELHI);
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const lift = Math.min(170, Math.max(28, distance * 0.28));
  const control = {
    x: (start.x + end.x) / 2 + (start.x > end.x ? lift * 0.35 : 0),
    y: Math.max(18, Math.min(start.y, end.y) - lift),
  };
  return {
    id: location.id,
    start,
    end,
    control,
    path: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
  };
}

export function pointOnRoute(route, progress) {
  const remaining = 1 - progress;
  return {
    x:
      remaining * remaining * route.start.x +
      2 * remaining * progress * route.control.x +
      progress * progress * route.end.x,
    y:
      remaining * remaining * route.start.y +
      2 * remaining * progress * route.control.y +
      progress * progress * route.end.y,
  };
}

export function getMapView(routes, mobile = false, selectedId) {
  const visibleRoutes = mobile
    ? routes.filter((route) => route.id === selectedId)
    : routes;
  const points = [projectLocation(DELHI)];
  for (const route of visibleRoutes) {
    for (let step = 0; step <= 40; step += 1) {
      points.push(pointOnRoute(route, step / 40));
    }
  }
  const padding = mobile ? 65 : 85;
  const left = Math.min(...points.map((p) => p.x)) - padding;
  const right = Math.max(...points.map((p) => p.x)) + padding;
  const top = Math.min(...points.map((p) => p.y)) - padding;
  const bottom = Math.max(...points.map((p) => p.y)) + padding;
  const ratio = mobile ? (right - left > 500 ? 1.6 : 1.15) : 2.2;
  const width = Math.max(
    right - left,
    (bottom - top) * ratio,
    mobile ? 320 : 780
  );
  const height = width / ratio;
  return {
    x: (left + right - width) / 2,
    y: (top + bottom - height) / 2,
    width,
    height,
  };
}
