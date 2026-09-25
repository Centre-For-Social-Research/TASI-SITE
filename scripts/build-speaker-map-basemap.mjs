import { readFile, writeFile, mkdir } from 'node:fs/promises';
import {
  projectLocation,
  MAP_WIDTH,
  MAP_HEIGHT,
} from '../src/lib/speaker-map-geometry.mjs';

// Source: Natural Earth v5.1.2, 1:110m physical land. Public domain.
// https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_land.geojson
// Usage: node scripts/build-speaker-map-basemap.mjs <path-to-ne_110m_land.geojson>
const source = JSON.parse(await readFile(process.argv[2], 'utf8'));
const paths = [];
for (const feature of source.features) {
  const polygons =
    feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;
  for (const polygon of polygons) {
    if (polygon[0].every(([, latitude]) => latitude < -60)) continue;
    const d = polygon
      .map(
        (ring) =>
          ring
            .map(([longitude, latitude], index) => {
              const { x, y } = projectLocation({ longitude, latitude });
              return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ') + 'Z'
      )
      .join(' ');
    paths.push(`<path d="${d}"/>`);
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" fill="#302144" stroke="#76518d" stroke-opacity=".55" stroke-width=".7"><!-- Natural Earth v5.1.2 physical land; public domain. -->${paths.join('')}</svg>\n`;
await mkdir('public/maps', { recursive: true });
await writeFile('public/maps/speaker-world.svg', svg);
console.log(`Wrote speaker-world.svg (${Buffer.byteLength(svg)} bytes).`);
