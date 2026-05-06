"use client";

import { motion } from "framer-motion";

export default function AboutScene() {
  return (
    <section className="relative w-full min-h-screen py-32 px-6 bg-[#fbfbfb] flex items-center justify-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
         <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400 rounded-full blur-[120px]" />
         <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-400 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl w-full p-12 md:p-20 rounded-[40px] relative border border-black/5 bg-white/40 backdrop-blur-sm shadow-sm">
        <div className="absolute top-10 left-10 text-blue-600 font-mono text-xs tracking-widest uppercase">Bio // System Architecture</div>
        
        <div className="space-y-10">
          <h2 className="text-4xl md:text-5xl font-bold text-[#121212] tracking-tighter leading-tight">
            I build <span className="text-blue-500">robust, scalable</span> digital systems.
          </h2>
          
          <p className="text-lg md:text-xl text-[#555] font-light leading-relaxed">
            Nischay Kademane is a Software Engineer driven by the pursuit of technical excellence. 
            From architectural design to AI integration, I craft systems that don't just run—they excel.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-black/10">
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-[#888] uppercase">Experience</p>
              <p className="text-xl font-bold text-[#121212]">2+ YEARS</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-[#888] uppercase">Projects</p>
              <p className="text-xl font-bold text-[#121212]">15+ SHIPPED</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-[#888] uppercase">Specialty</p>
              <p className="text-xl font-bold text-[#121212]">BACKEND</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-[#888] uppercase">Status</p>
              <p className="text-xl font-bold text-blue-500">AVAILABLE</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
