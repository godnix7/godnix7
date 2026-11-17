"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, PerspectiveCamera, Sparkles } from "@react-three/drei";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight, Code2, Mail } from "lucide-react";
import AbstractCore from "./AbstractCore";
import Navbar from "./Navbar";
import ProjectsSection from "./ProjectsSection";
import TechStack from "./TechStack";
import type { Project } from "@/lib/projects";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function ClientExperience({ projects }: { projects: Project[] }) {
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  return (
    <main className="portfolio-shell">
      <div className="ambient-grid" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-one" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-two" aria-hidden="true" />
      <div className="film-grain" aria-hidden="true" />

      <Navbar />

      <section id="home" ref={heroRef} className="hero section-wrap">
        <div className="hero-copy">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="eyebrow hero-eyebrow"
          >
            <span className="status-light" />
            <span>Independent developer · Bengaluru, India</span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="hero-title"
          >
            I make complex
            <br />
            <span className="title-highlight">systems feel</span>
            <br />
            <span className="title-outline">simple.</span>
          </motion.h1>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hero-bottom"
          >
            <p className="hero-description">
              Software engineering across product, backend systems, and applied AI. I care about the details that make useful ideas feel effortless.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#projects">
                Explore the work <ArrowRight size={16} />
              </a>
              <a className="button button-quiet" href="https://github.com/godnix7" target="_blank" rel="noreferrer">
                <Code2 size={16} /> GitHub <ArrowUpRight size={13} />
              </a>
            </div>
          </motion.div>

          <a className="scroll-cue" href="#about" aria-label="Scroll to about section">
            <span>Scroll to explore</span>
            <ArrowDown size={14} />
          </a>
        </div>

        <motion.div
          className="hero-art"
          initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Interactive 3D orbital sculpture"
        >
          <div className="orbital-label orbital-label-top"><span>FIG. 01</span><span>Systems in motion</span></div>
          <div className="orbital-orbit orbit-one" />
          <div className="orbital-orbit orbit-two" />
          <div className="orbital-crosshair crosshair-x" />
          <div className="orbital-crosshair crosshair-y" />
          <div className="orbital-canvas">
            <Canvas frameloop={prefersReducedMotion ? "demand" : "always"} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0, 7.5], fov: 40 }}>
              <Suspense fallback={null}>
                <PerspectiveCamera makeDefault position={[0, 0, 7.5]} />
                <ambientLight intensity={1.3} />
                <directionalLight position={[4, 5, 5]} intensity={3.2} color="#efffb0" />
                <pointLight position={[-4, -2, 2]} intensity={12} color="#fb805e" />
                <Float speed={prefersReducedMotion ? 0 : 1.35} rotationIntensity={0.28} floatIntensity={0.24}>
                  <AbstractCore />
                </Float>
                <Sparkles count={60} scale={7} size={1.4} speed={prefersReducedMotion ? 0 : 0.22} color="#dbff63" opacity={0.55} />
              </Suspense>
            </Canvas>
          </div>
          <div className="orbital-label orbital-label-bottom"><span>BUILD / TEST / ITERATE</span><span className="orbital-index">01 — 06</span></div>
          <span className="orbital-pin orbital-pin-a" />
          <span className="orbital-pin orbital-pin-b" />
        </motion.div>

        <div className="hero-footnote"><span>PORTFOLIO / 2026</span><span>Scroll-driven, human-led</span></div>
      </section>

      <section className="signal-strip" aria-label="Areas of focus">
        <div className="signal-strip-inner">
          <span>Product engineering</span><i />
          <span>Backend architecture</span><i />
          <span>Applied AI</span><i />
          <span>Interactive systems</span>
        </div>
      </section>

      <section id="about" className="about-section section-wrap section-space">
        <div className="section-kicker"><span>01 / About</span><span className="kicker-rule" /></div>
        <div className="about-layout">
          <h2 className="section-heading">Curiosity, made <em>concrete.</em></h2>
          <div className="about-copy">
            <p className="about-lead">I’m Nischay, a software developer drawn to the space between strong engineering and thoughtful product design.</p>
            <p>I work across the stack: shaping a clear experience, building the systems behind it, and making the whole thing dependable in the real world. This portfolio is a working collection of the problems I’ve explored and the things I’ve shipped.</p>
            <a className="text-link" href="#contact">A little more about working together <ArrowRight size={15} /></a>
          </div>
        </div>
        <div className="about-notes">
          <div><span className="note-label">CURRENTLY INTO</span><span>Product systems · Computer vision · Developer tools</span></div>
          <div><span className="note-label">BASED IN</span><span>Bengaluru, India <span className="tiny-orbit">✳</span></span></div>
          <div><span className="note-label">OPEN TO</span><span>Interesting collaborations</span></div>
        </div>
      </section>

      <TechStack />

      <ProjectsSection projects={projects} />

      <section id="contact" className="contact-section section-wrap section-space">
        <div className="contact-orbit" aria-hidden="true"><span>LET’S MAKE</span><span>SOMETHING</span><span>MATTER</span></div>
        <div className="section-kicker"><span>03 / Contact</span><span className="kicker-rule" /></div>
        <div className="contact-content">
          <p className="eyebrow">Have a good problem?</p>
          <h2 className="contact-title">Let’s build<br /><em>what’s next.</em></h2>
          <a className="button button-primary contact-cta" href="mailto:nischaykademane2006@gmail.com">
            Start a conversation <Mail size={16} />
          </a>
        </div>
        <footer className="site-footer">
          <a className="footer-signature" href="#home">NK<span>®</span></a>
          <span>Designed and built by Nischay Kademane · 2026</span>
          <div className="footer-links">
            <a href="https://github.com/godnix7" target="_blank" rel="noreferrer" aria-label="GitHub"><Code2 size={17} /></a>
            <a href="https://www.linkedin.com/in/nischaykademane/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><span className="social-letter">in</span></a>
            <a href="mailto:nischaykademane2006@gmail.com" aria-label="Email"><Mail size={17} /></a>
          </div>
        </footer>
      </section>
    </main>
  );
}
