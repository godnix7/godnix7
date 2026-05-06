"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Environment, 
  PerspectiveCamera, 
  ContactShadows, 
  useGLTF, 
  Float,
  Stars,
  Sparkles
} from "@react-three/drei";
import { 
  EffectComposer, 
  Bloom, 
  ChromaticAberration, 
  Noise,
  Vignette 
} from "@react-three/postprocessing";
import * as THREE from "three";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "./LoadingScreen";
import Navbar from "./Navbar";
import ContactForm from "./ContactForm";

gsap.registerPlugin(ScrollTrigger);

import AbstractCore from "./AbstractCore";
import TechStack from "./TechStack";
import ProjectsSection from "./ProjectsSection";

export default function ClientExperience({ envVars }: { envVars: Record<string, string> }) {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const coreRef = useRef<THREE.Group>(null);

  useEffect(() => {
    setMounted(true);
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // --- GSAP CAMERA & CORE JOURNEY ---
    if (mounted) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        }
      });

      tl.to("#core-container", { 
        x: -150, 
        y: 50, 
        scale: 0.7, 
        opacity: 0.4,
        ease: "none" 
      }, 0);
      
      tl.to("#core-container", { 
        x: 150, 
        y: -50, 
        scale: 1, 
        opacity: 0.6,
        ease: "none" 
      }, 0.5);

      tl.to("#core-container", { 
        x: 0, 
        y: 0, 
        scale: 0.4, 
        opacity: 0.15,
        ease: "none" 
      }, 1);
    }

    return () => lenis.destroy();
  }, [mounted]);

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      
      {/* Fixed 3D Scene Background */}
      <div className="fixed inset-0 z-0 bg-[#fbfbfb]">
        <div id="core-container" className="w-full h-full">
          <Canvas shadows={{ type: THREE.PCFShadowMap }} dpr={[1, 2]} gl={{ antialias: true }}>
            <Suspense fallback={null}>
              <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={35} />
              
              <AbstractCore />
              
              <Sparkles count={30} scale={20} size={1} speed={0.1} color="#3b82f6" opacity={0.1} />
              
              <Environment preset="city" />
              <fog attach="fog" args={["#fbfbfb", 10, 30]} />

              <EffectComposer disableNormalPass>
                <Bloom luminanceThreshold={0.9} mipmapBlur intensity={0.5} radius={0.5} />
                <ChromaticAberration offset={new THREE.Vector2(0.0003, 0.0003)} />
                <Noise opacity={0.02} />
                <Vignette eskil={false} offset={0.1} darkness={0.8} />
              </EffectComposer>
            </Suspense>
          </Canvas>
        </div>
      </div>

      <main className="relative z-10">
        <Navbar />

        {/* Section 1: Intro */}
        <section id="perspective" className="relative w-full h-[100vh] flex items-center justify-center pointer-events-none">
          <div className="text-center">
             <motion.h1 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
               className="text-[8vw] font-bold tracking-tighter leading-none text-[#121212]"
             >
               NISCHAY
             </motion.h1>
             <p className="mt-8 text-xs font-mono tracking-[0.8em] text-[#888] uppercase">Software Architecture & Engineering</p>
          </div>
        </section>

        {/* Section 2: Identity */}
        <section className="relative w-full min-h-screen flex items-center px-10 md:px-40 py-20">
          <div className="max-w-4xl space-y-12">
             <div className="space-y-4">
                <p className="text-xs font-mono uppercase tracking-[0.5em] text-[#888]">The Vision</p>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-[#121212] leading-tight">
                  High-Performance Systems <br /> <span className="text-blue-500">Built to Scale.</span>
                </h2>
             </div>
             <p className="text-lg md:text-xl text-[#555] font-light leading-relaxed max-w-2xl">
               I architect digital environments where performance and aesthetics collide. From robust backend infrastructure to seamless user interaction.
             </p>
          </div>
        </section>

        {/* Section 3: Tech Arsenal */}
        <div id="stack">
          <TechStack />
        </div>

        {/* Section 4: Projects */}
        <div id="records">
          <ProjectsSection envVars={envVars} />
        </div>

        {/* Section 5: Connection */}
        <section id="connect" className="relative w-full py-40 px-10 md:px-40 bg-[#f8f8f8]">
           <div className="flex flex-col items-center">
              <div className="text-center space-y-12 mb-32">
                 <p className="text-xs font-mono tracking-[0.5em] text-[#888] uppercase">Get in touch</p>
                 <h2 className="text-5xl md:text-7xl font-bold text-[#121212] tracking-tighter leading-none">COLLABORATE</h2>
              </div>
              <div className="w-full max-w-2xl">
                <ContactForm />
              </div>
           </div>
        </section>

        <footer className="py-20 px-10 border-t border-black/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-[#888] uppercase tracking-widest gap-8 bg-[#fbfbfb]">
           <p>© 2026 NISCHAY KADEMANE — CRAFTING ROBUST SYSTEMS</p>
           <div className="flex gap-16">
              <a href="https://linkedin.com/in/nischay-kademane" target="_blank" className="hover:text-black transition-colors">LinkedIn</a>
              <a href="https://github.com/godnix7" target="_blank" className="hover:text-black transition-colors">GitHub</a>
              <a href="https://twitter.com/nischay_k" target="_blank" className="hover:text-black transition-colors">Twitter</a>
           </div>
        </footer>
      </main>
    </>
  );
}
