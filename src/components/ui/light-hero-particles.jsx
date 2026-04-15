'use client';

import { useEffect, useCallback } from 'react';

export default function LightHeroParticles() {
  const initParticles = useCallback((isDark) => {
    const particlesRoot = document.getElementById('light-hero-particles');

    if (!particlesRoot || typeof window === 'undefined') {
      return;
    }

    const oldCanvas = particlesRoot.querySelector('canvas');
    if (oldCanvas) oldCanvas.remove();

    if (window.pJSDom?.length > 0) {
      window.pJSDom.forEach((instance) => instance.pJS.fn.vendors.destroypJS());
      window.pJSDom = [];
    }

    if (isDark) {
      return;
    }

    window.particlesJS('light-hero-particles', {
      particles: {
        number: { value: 140, density: { enable: true, value_area: 800 } },
        color: { value: '#ffe7a8' },
        shape: {
          type: 'circle',
          stroke: { width: 0.5, color: '#f4845f' },
        },
        opacity: {
          value: 0.48,
          random: true,
          anim: { enable: true, speed: 1, opacity_min: 0.18 },
        },
        size: {
          value: 3,
          random: true,
          anim: { enable: true, speed: 2, size_min: 1 },
        },
        line_linked: {
          enable: true,
          distance: 160,
          color: '#f7b267',
          opacity: 0.22,
          width: 1,
        },
        move: { enable: true, speed: 2, random: true, out_mode: 'bounce' },
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'grab' },
          onclick: { enable: true, mode: 'push' },
          resize: true,
        },
        modes: {
          grab: { distance: 220, line_linked: { opacity: 0.45 } },
          push: { particles_nb: 4 },
          repulse: { distance: 180, duration: 0.4 },
        },
      },
      retina_detect: true,
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let observer;

    const loadParticles = async () => {
      await import('particles.js');

      const html = document.documentElement;
      const detectDark = () =>
        html.classList.contains('dark') ||
        html.getAttribute('data-theme') === 'dark';

      initParticles(detectDark());

      observer = new MutationObserver(() => initParticles(detectDark()));
      observer.observe(html, {
        attributes: true,
        attributeFilter: ['class', 'data-theme'],
      });
    };

    loadParticles();

    return () => {
      observer?.disconnect();
      if (window.pJSDom?.length > 0) {
        window.pJSDom.forEach((instance) => instance.pJS.fn.vendors.destroypJS());
        window.pJSDom = [];
      }
    };
  }, [initParticles]);

  return (
    <div
      id="light-hero-particles"
      className="pointer-events-none absolute inset-0 opacity-70 dark:hidden"
      aria-hidden="true"
    />
  );
}
