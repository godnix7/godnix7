"use client";

import { useRef } from "react";

/* Browser-window mockup showing a real screenshot of the live site. It tilts in
   3D with the cursor; the name chip floats above the frame. */
export default function ProjectVisual({
  title, shot, live, index,
}: { title: string; shot: string; live?: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const host = live ? live.replace(/^https?:\/\//, "").replace(/\/$/, "") : "github.com/godnix7";

  function move(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
  }
  function leave() {
    if (ref.current) ref.current.style.transform = "rotateY(0) rotateX(0)";
  }

  const frame = (
    <div
      ref={ref}
      className="tilt relative rounded-xl bg-white overflow-hidden border border-line shadow-[0_40px_70px_-30px_rgba(20,23,26,.55)]"
    >
      <div className="flex items-center gap-2 px-4 h-10 bg-[#ebe8e1] border-b border-line">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ec6a5e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#f4bf4f]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#61c554]" />
        <span className="ml-3 flex-1 truncate rounded-md bg-white/80 px-3 py-1 mono text-[11px] text-muted">{host}</span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden bg-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shot} alt={`${title} website preview`} loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-ink/90 text-paper px-3.5 py-1.5 text-sm font-medium backdrop-blur" style={{ transform: "translateZ(50px)" }}>
        <span className="mono text-[11px] text-paper/60">0{index + 1}</span> {title}
      </div>
    </div>
  );

  return (
    <div style={{ perspective: 1200 }} onMouseMove={move} onMouseLeave={leave} className="group">
      {live ? (
        <a href={live} target="_blank" rel="noreferrer" aria-label={`Open ${title}`} className="block">{frame}</a>
      ) : (
        frame
      )}
    </div>
  );
}
