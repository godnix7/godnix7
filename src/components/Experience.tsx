"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import { ArrowUpRight, Code2, Mail, Star, User } from "lucide-react";
import { profile, projects, stack } from "@/lib/data";
import type { GitHubSnapshot } from "@/lib/github";
import Cursor from "./Cursor";
import Reveal from "./Reveal";
import ContactForm from "./ContactForm";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

const nav = [
  ["Work", "work"],
  ["About", "about"],
  ["Stack", "stack"],
  ["Contact", "contact"],
];

function ago(iso?: string) {
  if (!iso) return "";
  const d = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 864e5));
  if (d < 1) return "today";
  if (d < 31) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

export default function Experience({ gh }: { gh: GitHubSnapshot }) {
  const [open, setOpen] = useState<string | null>("MediLocker");

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15 });
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  const totalStars = Object.values(gh.repos).reduce((s, r) => s + r.stars, 0);
  const loop = [...stack.flatMap((s) => s.items), ...stack.flatMap((s) => s.items)];

  return (
    <div className="grain">
      <Scene />
      <Cursor />

      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 mix-blend-difference">
        <a href="#top" className="mono text-xs tracking-[0.25em] uppercase">nk<span className="text-ember">/</span>2026</a>
        <nav className="flex gap-6 md:gap-10">
          {nav.map(([l, id]) => (
            <a key={id} href={`#${id}`} className="label !text-bone hover:!text-ember transition-colors">{l}</a>
          ))}
        </nav>
      </header>

      <main className="relative z-10">
        {/* HERO */}
        <section id="top" className="min-h-screen flex flex-col justify-end px-6 md:px-12 pb-14 pt-32">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }} className="label mb-6">
            Backend &amp; AI engineer — Bengaluru, India
          </motion.p>
          <h1 className="leading-[0.86] tracking-[-0.04em] font-semibold text-[clamp(3.6rem,13.5vw,15rem)]">
            {["Nischay", "Kademane"].map((w, i) => (
              <span key={w} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className={`block ${i ? "serif hero-stroke pl-[6vw]" : ""}`}
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <div className="mt-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <p className="max-w-md text-lg text-bone/80 leading-snug">
              I build the engines behind products: secure APIs, real-time systems and AI agents, then wrap them in interfaces worth touching.
            </p>
            <p className="label">Move your cursor · scroll to morph ↓</p>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="overflow-hidden border-y border-bone/15 py-5 bg-ink/60 backdrop-blur-sm">
          <div className="marquee flex w-max gap-10 whitespace-nowrap">
            {loop.map((t, i) => (
              <span key={i} className="serif text-3xl md:text-5xl text-bone/90">{t} <span className="text-ember not-italic">✦</span></span>
            ))}
          </div>
        </div>

        {/* WORK */}
        <section id="work" className="veil px-6 md:px-12 py-32">
          <Reveal className="flex items-end justify-between mb-14">
            <h2 className="text-5xl md:text-8xl tracking-[-0.04em]">Selected <span className="serif text-ember">work</span></h2>
            <p className="label hidden md:block">{projects.length} projects · live from GitHub</p>
          </Reveal>

          <ul>
            {projects.map((p, i) => {
              const stat = gh.repos[p.repo];
              const isOpen = open === p.repo;
              return (
                <li key={p.repo} className="border-t border-bone/15 last:border-b">
                  <button
                    onClick={() => setOpen(isOpen ? null : p.repo)}
                    className="group w-full flex items-baseline gap-4 md:gap-10 py-7 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="mono text-xs text-sand w-8">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`text-3xl md:text-6xl tracking-[-0.03em] transition-all duration-500 group-hover:translate-x-3 group-hover:text-ember ${isOpen ? "text-ember" : ""}`}>
                      {p.title}
                    </span>
                    <span className="serif text-lg md:text-2xl text-sand hidden md:inline">{p.kicker}</span>
                    <span className="ml-auto label hidden sm:inline">{stat?.language ?? p.tech[0]}</span>
                    <span className={`text-2xl transition-transform duration-500 ${isOpen ? "rotate-45 text-ember" : ""}`}>+</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid md:grid-cols-2 gap-8 pb-10 md:pl-[4.5rem]">
                          <div>
                            <p className="text-lg md:text-xl text-bone/85 max-w-xl leading-snug">{p.blurb}</p>
                            <div className="mt-6 flex flex-wrap gap-2">
                              {p.tech.map((t) => (
                                <span key={t} className="mono text-xs px-3 py-1 rounded-full border border-bone/25">{t}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 md:items-end">
                            {p.live && (
                              <a href={p.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-lg hover:text-ember transition-colors">
                                Live site <ArrowUpRight size={18} />
                              </a>
                            )}
                            <a href={stat?.url ?? `${profile.github}/${p.repo}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-lg hover:text-ember transition-colors">
                              <Code2 size={18} /> Source
                            </a>
                            {stat && (
                              <p className="label mt-2 flex items-center gap-3">
                                <Star size={12} /> {stat.stars}<span>·</span>updated {ago(stat.pushedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
          <a href={profile.github} target="_blank" rel="noreferrer" className="mt-10 inline-flex items-center gap-2 label hover:!text-ember transition-colors">
            All repositories on GitHub <ArrowUpRight size={14} />
          </a>
        </section>

        {/* ABOUT */}
        <section id="about" className="veil px-6 md:px-12 py-32 grid md:grid-cols-12 gap-12">
          <Reveal className="md:col-span-7">
            <p className="label mb-6">About</p>
            <h2 className="text-4xl md:text-7xl tracking-[-0.035em] leading-[0.98]">
              Systems that stay up, <span className="serif text-ember">interfaces</span> that feel alive.
            </h2>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-5 md:pt-14 space-y-6 text-lg text-bone/80 leading-snug">
            <p>
              I&apos;m Nischay, a software engineer from Bengaluru focused on backend architecture and applied AI. I like problems where reliability, security and speed all matter at once: health records, real-time judging, streaming, forensics.
            </p>
            <p>Hackathon builder at heart: most of what&apos;s here started as a weekend and kept growing.</p>
            <dl className="grid grid-cols-3 gap-4 pt-6 border-t border-bone/15">
              {[
                [String(gh.publicRepos), "public repos"],
                [String(gh.followers), "followers"],
                [gh.since, "shipping since"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="serif text-5xl text-bone">{n}</dt>
                  <dd className="label mt-1">{l}</dd>
                </div>
              ))}
            </dl>
            {gh.ok && <p className="label">{totalStars} stars across repos · synced from GitHub</p>}
          </Reveal>
        </section>

        {/* STACK */}
        <section id="stack" className="veil px-6 md:px-12 py-32">
          <Reveal><p className="label mb-12">Toolbox</p></Reveal>
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-14">
            {stack.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <p className="serif text-2xl text-ember mb-3">{s.label}</p>
                <p className="text-3xl md:text-5xl tracking-[-0.03em] leading-[1.15]">
                  {s.items.map((it, j) => (
                    <span key={it} className="hover:text-ember transition-colors">
                      {it}
                      {j < s.items.length - 1 && <span className="text-sand/60"> / </span>}
                    </span>
                  ))}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="veil px-6 md:px-12 pt-32 pb-12">
          <Reveal>
            <p className="label mb-6">Contact</p>
            <h2 className="text-5xl md:text-[9vw] tracking-[-0.045em] leading-[0.9]">
              Let&apos;s build <span className="serif text-ember">something.</span>
            </h2>
          </Reveal>
          <div className="mt-16 grid md:grid-cols-2 gap-16">
            <Reveal>
              <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-3 text-xl md:text-3xl hover:text-ember transition-colors break-all">
                <Mail /> {profile.email}
              </a>
              <div className="mt-8 flex gap-6">
                <a href={profile.github} target="_blank" rel="noreferrer" className="label hover:!text-ember flex items-center gap-2"><Code2 size={14} />GitHub</a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="label hover:!text-ember flex items-center gap-2"><User size={14} />LinkedIn</a>
                <a href={profile.x} target="_blank" rel="noreferrer" className="label hover:!text-ember">X</a>
              </div>
            </Reveal>
            <Reveal delay={0.1}><ContactForm /></Reveal>
          </div>
          <footer className="mt-32 flex justify-between label">
            <span>© 2026 {profile.name}</span>
            <a href="#top" className="hover:!text-ember">Back to top ↑</a>
          </footer>
        </section>
      </main>
    </div>
  );
}
