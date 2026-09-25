import * as THREE from 'three';
import { pointOnRoute } from '@/lib/speaker-map-geometry.mjs';

// Loaded only when the map is on screen and motion is enabled.
export function createSpeakerMapRenderer(container, routes, view) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: 'low-power',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    view.x,
    view.x + view.width,
    view.y,
    view.y + view.height,
    0.1,
    10
  );
  camera.position.z = 1;

  const positions = [];
  const progress = [];
  const offsets = [];
  const speeds = [];
  const routeIndexes = [];
  for (const [index, route] of routes.entries()) {
    for (let step = 0; step <= 220; step += 1) {
      const t = step / 220;
      const point = pointOnRoute(route, t);
      positions.push(point.x, point.y, 0);
      progress.push(t);
      offsets.push((index * 0.618034) % 1);
      speeds.push(1 / (5.5 + (index % 5) * 0.7));
      routeIndexes.push(index);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    'aProgress',
    new THREE.Float32BufferAttribute(progress, 1)
  );
  geometry.setAttribute(
    'aOffset',
    new THREE.Float32BufferAttribute(offsets, 1)
  );
  geometry.setAttribute('aSpeed', new THREE.Float32BufferAttribute(speeds, 1));
  geometry.setAttribute(
    'aRoute',
    new THREE.Float32BufferAttribute(routeIndexes, 1)
  );
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uSelectedRoute: { value: -1 },
    },
    vertexShader: `
      attribute float aProgress;
      attribute float aOffset;
      attribute float aSpeed;
      attribute float aRoute;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uSelectedRoute;
      varying float vIntensity;
      void main() {
        float head = fract(uTime * aSpeed + aOffset);
        float behind = mod(head - aProgress + 1.0, 1.0);
        vIntensity = pow(max(0.0, 1.0 - behind / 0.18), 1.6);
        if (uSelectedRoute != -1.0 && abs(uSelectedRoute - aRoute) > 0.1) vIntensity *= 0.12;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = (2.3 + 2.0 * vIntensity) * uPixelRatio;
      }
    `,
    fragmentShader: `
      varying float vIntensity;
      void main() {
        float radius = length(gl_PointCoord - vec2(0.5));
        float alpha = (1.0 - smoothstep(0.12, 0.5, radius)) * vIntensity;
        if (alpha < 0.01) discard;
        vec3 color = mix(vec3(1.0, 0.32, 0.12), vec3(1.0, 0.9, 0.48), vIntensity);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
  const particles = new THREE.Points(geometry, material);
  // The explicit map camera defines visibility, including narrow mobile views.
  particles.frustumCulled = false;
  scene.add(particles);

  let elapsed = 0;
  let previousTime = null;
  let running = false;
  const draw = (time) => {
    if (previousTime !== null)
      elapsed += Math.min(time - previousTime, 100) / 1000;
    previousTime = time;
    material.uniforms.uTime.value = elapsed;
    renderer.render(scene, camera);
  };
  const resize = () => {
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    renderer.render(scene, camera);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  return {
    setView(nextView) {
      camera.left = nextView.x;
      camera.right = nextView.x + nextView.width;
      camera.top = nextView.y;
      camera.bottom = nextView.y + nextView.height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    },
    setSelection(id) {
      material.uniforms.uSelectedRoute.value =
        id === 'all' ? -1 : routes.findIndex((route) => route.id === id);
      if (id === 'india') material.uniforms.uSelectedRoute.value = -2;
      renderer.render(scene, camera);
    },
    setRunning(enabled) {
      if (running === enabled) return;
      running = enabled;
      previousTime = null;
      renderer.setAnimationLoop(enabled ? draw : null);
    },
    dispose() {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
