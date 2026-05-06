"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 1;
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 1.1,
        duration: 1.5,
        ease: "power4.inOut",
        onComplete
      });
    }
  }, [progress, onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[500] bg-[#03050a] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-12">
        <div className="space-y-2 text-center">
          <h2 className="text-[2vw] font-bold tracking-[1em] text-white uppercase opacity-20">Initializing</h2>
          <p className="text-[10px] font-mono text-blue-500 tracking-[0.5em] uppercase">Sensory Engine</p>
        </div>

        <div className="w-80 h-[1px] bg-white/5 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-blue-600 origin-left transition-transform duration-300"
            style={{ transform: `scaleX(${progress / 100})` }}
          />
        </div>

        <div className="flex gap-20">
          <div className="text-center">
            <p className="text-[8px] font-mono text-gray-600 mb-1">BUFFER</p>
            <p className="text-sm font-mono text-white">{progress}%</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-mono text-gray-600 mb-1">STATUS</p>
            <p className="text-sm font-mono text-white">{progress < 100 ? "CALIBRATING" : "READY"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
