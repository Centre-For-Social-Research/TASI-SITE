/**
 * Defer heavy animations until the browser is idle
 * Reduces main-thread blocking and improves initial page load
 */

export function deferAnimation(callback: () => void, delay: number = 0) {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(() => {
      setTimeout(callback, delay);
    });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(callback, Math.max(1000, delay));
  }
}

/**
 * Schedule animations to run after main thread is free
 * Use for complex GSAP animations or multiple animation sequences
 */
export function scheduleAnimations(animations: Array<() => void>) {
  const timeouts: NodeJS.Timeout[] = [];

  const runNextAnimation = (index: number = 0) => {
    if (index >= animations.length) return;

    const timeout = setTimeout(() => {
      animations[index]();
      runNextAnimation(index + 1);
    }, 50);

    timeouts.push(timeout);
  };

  runNextAnimation();

  return () => {
    timeouts.forEach((timeout) => clearTimeout(timeout));
  };
}

/**
 * Detect if animation is safe to run (not during critical path)
 */
export function shouldDeferAnimation(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  // Defer if on slow connection or low-end device
  return (nav.deviceMemory || 8) < 4;
}
