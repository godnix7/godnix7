"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, ArrowRight, Github, Twitter, Mail } from "lucide-react";

const ComingSoon = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505] flex flex-col items-center justify-center font-sans text-white selection:bg-white selection:text-black">
      {/* Background Ambient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-medium tracking-widest uppercase text-white/70">Coming Summer 2026</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, filter: "blur(10px)", y: 30 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight mb-6"
        >
          Something <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40">
            Extraordinary
          </span>
          <br />
          is Coming.
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-white/50 max-w-xl mb-12 font-light leading-relaxed"
        >
          We're sculpting a new digital experience that redefines professional standards. 
          The wait will be worth the transformation.
        </motion.p>

        {/* Action / Waitlist (Placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
        >
          <div className="relative group w-full sm:w-80">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-xl"
            />
          </div>
          <button className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 group">
            Get Early Access
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Loading Spinner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 flex items-center gap-3 text-white/30 text-sm font-medium tracking-widest uppercase"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing Excellence
        </motion.div>
      </main>

      {/* Footer / Socials */}
      <footer className="absolute bottom-10 left-0 right-0 z-10 flex flex-col items-center gap-6">
        <div className="flex gap-8">
          {[
            { Icon: Github, href: "https://github.com/godnix7" },
            { Icon: Twitter, href: "https://twitter.com/nischay_k" },
            { Icon: Mail, href: "mailto:nischay@example.com" }
          ].map(({ Icon, href }, i) => (
            <motion.a
              key={i}
              href={href}
              target="_blank"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 + (i * 0.1) }}
              className="text-white/30 hover:text-white transition-colors"
            >
              <Icon className="w-5 h-5" />
            </motion.a>
          ))}
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-[10px] uppercase tracking-[0.3em] text-white/20"
        >
          © 2026 Godnix Studios. All Rights Reserved.
        </motion.p>
      </footer>

      {/* Decorative Lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-transparent via-white/10 to-transparent" />
    </div>
  );
};

export default ComingSoon;
