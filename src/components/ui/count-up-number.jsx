"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export default function CountUpNumber({
  end,
  start = 0,
  duration = 1.7,
  suffix = "",
  prefix = "",
  className = "",
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.45 });
  const [value, setValue] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isInView) return;

    let rafId = 0;
    let startTime = null;
    const totalDelta = end - start;
    setIsAnimating(true);

    const tick = (time) => {
      if (startTime === null) {
        startTime = time;
      }

      const progress = Math.min((time - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(start + totalDelta * eased));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setValue(end);
        setTimeout(() => setIsAnimating(false), 220);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [duration, end, isInView, start]);

  return (
    <motion.span
      ref={ref}
      className={className}
      animate={
        isAnimating
          ? {
              scale: [1, 1.16, 1],
              filter: ["brightness(1)", "brightness(1.18)", "brightness(1)"],
            }
          : { scale: 1, filter: "brightness(1)" }
      }
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      {prefix}
      {value.toLocaleString("en-IN")}
      {suffix}
    </motion.span>
  );
}