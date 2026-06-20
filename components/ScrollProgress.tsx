"use client";

import { useEffect, useRef } from "react";
import { scrollState } from "@/lib/scroll";

export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (ref.current) {
        ref.current.style.transform = `scaleX(${scrollState.progress})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed left-0 top-0 z-[60] h-[2px] w-full bg-transparent">
      <div
        ref={ref}
        className="h-full origin-left bg-gradient-to-r from-cyan to-violet"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
