"use client";

import { useRef } from "react";

const themes = [
  { bg: "linear-gradient(135deg,#0e6b5c,#0a3d36)", fg: "#e9f5f1" },
  { bg: "linear-gradient(135deg,#14171a,#2b3138)", fg: "#f5f3ee" },
  { bg: "linear-gradient(135deg,#c9822b,#8f5412)", fg: "#fff7ea" },
];

/* A 3D-tilting project panel: layers sit at different depths and follow the cursor. */
export default function ProjectVisual({ title, tech, index }: { title: string; tech: string[]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const t = themes[index % themes.length];

  function move(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
  }
  function leave() {
    if (ref.current) ref.current.style.transform = "rotateY(0) rotateX(0)";
  }

  return (
    <div style={{ perspective: 1000 }} onMouseMove={move} onMouseLeave={leave}>
      <div
        ref={ref}
        className="tilt relative aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_30px_60px_-25px_rgba(20,23,26,.45)]"
        style={{ background: t.bg, color: t.fg }}
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "22px 22px" }} />
        <span className="absolute -right-4 -bottom-16 text-[18rem] font-bold leading-none opacity-[0.12] select-none" style={{ transform: "translateZ(20px)" }}>
          {title[0]}
        </span>
        <div className="absolute left-7 top-7 mono text-xs tracking-widest uppercase opacity-70" style={{ transform: "translateZ(40px)" }}>
          0{index + 1} / case study
        </div>
        <div className="absolute left-7 bottom-7 right-7" style={{ transform: "translateZ(60px)" }}>
          <p className="text-4xl md:text-5xl font-semibold tracking-tight">{title}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tech.map((x) => (
              <span key={x} className="mono text-[11px] px-2.5 py-1 rounded-full border border-current/30 bg-white/10 backdrop-blur-sm">{x}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
