"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  tech: string[];
  repoVar: string;
  liveVar: string;
  index: string;
};

const projects: Project[] = [
  {
    id: "medilocker",
    title: "MediLocker",
    category: "Healthcare Security",
    description: "A medical-based safe vault and centralized hospital system featuring secure document storage and hospital management with zero-trust architecture.",
    tech: ["FastAPI", "PostgreSQL", "Redis", "GSAP", "Three.js", "AWS S3"],
    repoVar: "PROJECT_MEDILOCKER_REPO",
    liveVar: "PROJECT_MEDILOCKER_LIVE",
    index: "01",
  },
  {
    id: "lynxis",
    title: "Lynxis AI",
    category: "AI Intelligence",
    description: "AI-Powered Multi-Agent Code Intelligence platform for analyzing and interacting with complex codebases using multiple AI agents.",
    tech: ["Node.js", "Express", "Prisma", "Three.js", "Anthropic AI", "Docker"],
    repoVar: "PROJECT_LYNXIS_REPO",
    liveVar: "PROJECT_LYNXIS_LIVE",
    index: "02",
  },
  {
    id: "eventbyte",
    title: "EventByte",
    category: "Event Management",
    description: "A premium hackathon management platform with real-time judging, event tracking, and socket-based updates for high-scale competitions.",
    tech: ["Django", "TypeScript", "Tailwind CSS", "TanStack Query", "Radix UI"],
    repoVar: "PROJECT_EVENTBYTE_REPO",
    liveVar: "PROJECT_EVENTBYTE_LIVE",
    index: "03",
  },
  {
    id: "localmusic",
    title: "LocalMusic",
    category: "Streaming Platform",
    description: "A personal music player and admin-controlled subscription service with high-performance search and real-time features.",
    tech: ["Fastify", "Prisma", "Elasticsearch", "Redis", "WebSockets", "TypeScript"],
    repoVar: "PROJECT_LOCALMUSIC_REPO",
    liveVar: "PROJECT_LOCALMUSIC_LIVE",
    index: "04",
  },
  {
    id: "althea",
    title: "Althea",
    category: "AI Mental Health",
    description: "Mental Health Chatbot designed to provide support and resources for day-to-day life, focused on accessibility and emotional intelligence.",
    tech: ["Python", "Flask", "Vercel", "Natural Language Processing"],
    repoVar: "PROJECT_ALTHEA_REPO",
    liveVar: "PROJECT_ALTHEA_LIVE",
    index: "05",
  },
];

export default function ProjectsSection({ envVars }: { envVars: Record<string, string> }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedProject = projects.find((p) => p.id === selectedId);

  return (
    <section id="projects" className="relative w-full py-40 px-10 bg-[#f8f8f8]">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-[0.4em] text-[#888] mb-20">Selected Work</p>

        <div className="flex flex-col border-t border-black/10">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedId(project.id)}
              className="group flex flex-col md:flex-row justify-between items-baseline py-16 border-b border-black/10 hover:bg-black/[0.01] transition-all px-4 cursor-pointer"
            >
              <div className="flex items-baseline gap-12">
                <span className="text-xs font-mono text-[#888]">{project.index}</span>
                <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#121212] group-hover:translate-x-4 transition-transform duration-500">
                  {project.title}
                </h3>
              </div>
              <p className="text-sm font-mono uppercase tracking-widest text-[#888] mt-6 md:mt-0">
                {project.category}
              </p>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedId && selectedProject && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-md"
              onClick={() => setSelectedId(null)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-[#f8f8f8] border border-black/5 p-12 md:p-20 shadow-2xl overflow-hidden"
            >
              <button onClick={() => setSelectedId(null)} className="absolute top-10 right-10 text-[#888] hover:text-black transition-colors">
                <X size={24} />
              </button>

              <div className="space-y-12">
                <div className="space-y-4">
                  <p className="text-xs font-mono text-[#888] uppercase tracking-[0.3em]">Project {selectedProject.index}</p>
                  <h2 className="text-4xl md:text-6xl font-bold text-[#121212] tracking-tighter leading-none">{selectedProject.title}</h2>
                  <p className="text-xl text-[#555] font-light leading-relaxed max-w-3xl">{selectedProject.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                  <div className="space-y-6">
                    <p className="font-mono text-xs uppercase text-[#888] tracking-widest border-b border-black/10 pb-2">Technical Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tech.map(t => (
                        <span key={t} className="px-3 py-1 bg-black/5 text-xs font-mono text-[#121212]">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="font-mono text-xs uppercase text-[#888] tracking-widest border-b border-black/10 pb-2">Navigation</p>
                    <div className="flex gap-4">
                       <a href={envVars[selectedProject.repoVar]} target="_blank" className="text-sm font-mono underline hover:text-[#888] transition-colors">View Source Code</a>
                       <a href={envVars[selectedProject.liveVar]} target="_blank" className="text-sm font-mono underline hover:text-[#888] transition-colors">Visit Project</a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
