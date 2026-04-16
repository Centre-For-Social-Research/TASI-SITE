'use client';

import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function LightHeroParticles() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      if (isMounted) {
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isReady) {
    return (
      <div
        id="light-hero-particles"
        className="pointer-events-none absolute inset-0 opacity-70 dark:hidden"
        aria-hidden="true"
      />
    );
  }

  return (
    <Particles
      id="light-hero-particles"
      className="pointer-events-none absolute inset-0 opacity-70 dark:hidden"
      aria-hidden="true"
      options={{
        fullScreen: {
          enable: false,
        },
        fpsLimit: 120,
        detectRetina: true,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: 'grab',
            },
            onClick: {
              enable: true,
              mode: 'push',
            },
            resize: {
              enable: true,
            },
          },
          modes: {
            grab: {
              distance: 220,
              links: {
                opacity: 0.45,
              },
            },
            push: {
              quantity: 4,
            },
            repulse: {
              distance: 180,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: '#ffe7a8',
          },
          links: {
            enable: true,
            distance: 160,
            color: '#f7b267',
            opacity: 0.22,
            width: 1,
          },
          move: {
            enable: true,
            speed: 2,
            random: true,
            outModes: {
              default: 'bounce',
            },
          },
          number: {
            value: 140,
            density: {
              enable: true,
              width: 800,
              height: 800,
            },
          },
          opacity: {
            value: {
              min: 0.18,
              max: 0.48,
            },
            animation: {
              enable: true,
              speed: 1,
            },
          },
          shape: {
            type: 'circle',
            options: {
              circle: {
                stroke: {
                  width: 0.5,
                  color: '#f4845f',
                },
              },
            },
          },
          size: {
            value: {
              min: 1,
              max: 3,
            },
            animation: {
              enable: true,
              speed: 2,
            },
          },
        },
      }}
    />
  );
}
