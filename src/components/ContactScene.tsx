"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function ContactScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="contact" ref={containerRef} className="relative w-full py-60 px-10 bg-[#f8f8f8] flex flex-col items-center">
      <p className="text-xs font-mono uppercase tracking-[0.4em] text-[#888] mb-20">Get In Touch</p>
      
      <a 
        href="mailto:nischaykademane2006@gmail.com" 
        className="text-[8vw] font-bold text-[#121212] tracking-tighter hover:text-[#888] transition-colors duration-500 text-center leading-none"
      >
        nischaykademane2006@gmail.com
      </a>
      
      <div className="mt-40 w-full max-w-7xl flex flex-col md:flex-row justify-between items-center border-t border-black/10 pt-10">
        <p className="text-xs font-mono text-[#888]">© 2025 NISCHAY KADEMANE</p>
        <div className="flex gap-12 mt-8 md:mt-0">
          <a href="https://linkedin.com" className="text-xs font-mono uppercase tracking-widest hover:underline">LinkedIn</a>
          <a href="https://github.com" className="text-xs font-mono uppercase tracking-widest hover:underline">GitHub</a>
        </div>
      </div>
    </section>
  );
}
