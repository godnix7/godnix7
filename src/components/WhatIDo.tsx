"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const skills = [
  {
    title: "Full-Stack Engineering",
    desc: "Building resilient backends and highly interactive, premium frontend experiences.",
    icon: "◈",
  },
  {
    title: "AI & Machine Learning",
    desc: "Developing threat detection systems, deepfake video analysis, and intelligent NLP tools.",
    icon: "◎",
  },
  {
    title: "Cloud & Infrastructure",
    desc: "Deploying containerized microservices with Docker, Kubernetes, and polyglot databases.",
    icon: "◆",
  },
];

export default function WhatIDo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading reveal
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      cardsRef.current.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 60, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full py-32 md:py-48 px-6">
      <div className="max-w-6xl mx-auto">
        <h2
          ref={headingRef}
          className="text-xs md:text-sm font-mono uppercase tracking-[0.4em] text-white/30 mb-20 md:mb-28"
        >
          What I Do
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {skills.map((skill, i) => (
            <div
              key={skill.title}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className="group relative p-8 md:p-10 rounded-xl border border-black/[0.04] bg-white/[0.01] hover:bg-black/[0.03] transition-all duration-700"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/0 to-blue-500/0 group-hover:from-violet-500/[0.06] group-hover:to-blue-500/[0.04] transition-all duration-700" />

              <span className="relative text-3xl mb-6 block text-violet-400/60 group-hover:text-violet-400 transition-colors duration-500">
                {skill.icon}
              </span>

              <h3 className="relative text-xl md:text-2xl font-semibold mb-4 text-white/80 group-hover:text-white transition-colors duration-500">
                {skill.title}
              </h3>

              <p className="relative text-sm md:text-base text-white/30 group-hover:text-white/50 transition-colors duration-500 leading-relaxed">
                {skill.desc}
              </p>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-violet-500/0 group-hover:via-violet-500/30 to-transparent transition-all duration-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
