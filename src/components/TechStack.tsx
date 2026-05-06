"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const categories = [
  {
    label: "Core",
    items: ["TypeScript", "Python", "SQL", "Node.js"],
  },
  {
    label: "Platform",
    items: ["React", "Next.js", "FastAPI", "Fastify"],
  },
  {
    label: "Infra",
    items: ["PostgreSQL", "Redis", "Elasticsearch", "Docker", "Kubernetes"],
  },
];

export default function TechStack() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".stack-row", {
        opacity: 0,
        x: -20,
        stagger: 0.2,
        duration: 1,
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
    <section className="relative w-full py-40 px-10 bg-[#f8f8f8]">
      <div ref={containerRef} className="max-w-6xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-[0.4em] text-[#888] mb-20">Technical Arsenal</p>
        
        <div className="space-y-20">
          {categories.map((cat) => (
            <div key={cat.label} className="stack-row flex flex-col md:flex-row gap-10 md:gap-40 items-baseline">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#888] w-20">{cat.label}</p>
              <div className="flex flex-wrap gap-4">
                {cat.items.map((item) => (
                  <span key={item} className="text-2xl md:text-4xl font-bold text-[#121212] hover:text-[#888] transition-colors duration-300">
                    {item}.
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
