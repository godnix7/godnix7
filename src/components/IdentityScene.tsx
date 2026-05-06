"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function IdentityScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal-item", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={containerRef} className="relative w-full min-h-[80vh] py-40 px-10 flex items-center bg-[#f8f8f8]">
      <div className="max-w-6xl w-full">
        <p className="reveal-item text-xs font-mono uppercase tracking-[0.4em] text-[#888] mb-12">Who I Am</p>
        
        <h2 className="reveal-item text-4xl md:text-6xl lg:text-7xl font-bold text-[#121212] leading-[1.1] tracking-tight max-w-4xl">
          A developer focused on <span className="text-[#888]">high-performance systems</span> and immersive digital experiences.
        </h2>
        
        <div className="reveal-item grid grid-cols-1 md:grid-cols-2 gap-20 mt-24">
          <p className="text-xl text-[#555] leading-relaxed font-light">
            With a focus on Backend Architecture and AI Engineering, I build tools that are as robust as they are visually engaging. I believe in software that performs as well as it looks.
          </p>
          <div className="space-y-8">
            <div className="flex justify-between border-b border-black/10 pb-4">
              <span className="font-mono text-xs text-[#888] uppercase">Discipline</span>
              <span className="text-sm">Software Engineering</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-4">
              <span className="font-mono text-xs text-[#888] uppercase">Focus</span>
              <span className="text-sm">Backend & AI</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-4">
              <span className="font-mono text-xs text-[#888] uppercase">Location</span>
              <span className="text-sm">Bengaluru, IN</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
