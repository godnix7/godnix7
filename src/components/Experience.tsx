"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Lenis from "lenis";
import { ArrowUpRight, Check, Code2, Mail, Star } from "lucide-react";
import { profile, projects, stack } from "@/lib/data";
import { capabilities, featured, shots } from "@/lib/featured";
import type { GitHubSnapshot } from "@/lib/github";
import ContactForm from "./ContactForm";
import ProjectVisual from "./ProjectVisual";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

const nav = [
  ["Work", "work"],
  ["Capabilities", "capabilities"],
  ["Stack", "stack"],
  ["GitHub", "github"],
  ["Contact", "contact"],
];

function ago(iso?: string) {
  if (!iso) return "—";
  const d = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 864e5));
  if (d < 1) return "today";
  if (d < 31) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionHead({ eyebrow, title, aside }: { eyebrow: string; title: string; aside?: string }) {
  return (
    <Reveal className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-2xl leading-[1.08]">{title}</h2>
      </div>
      {aside && <p className="text-muted max-w-sm">{aside}</p>}
    </Reveal>
  );
}

export default function Experience({ gh }: { gh: GitHubSnapshot }) {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1 });
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  const repoList = Object.values(gh.repos);
  const totalStars = repoList.reduce((s, r) => s + r.stars, 0);
  const langs = Object.entries(
    repoList.reduce<Record<string, number>>((m, r) => {
      if (r.language) m[r.language] = (m[r.language] ?? 0) + 1;
      return m;
    }, {})
  ).sort((a, b) => b[1] - a[1]);
  const recent = [...repoList].sort((a, b) => +new Date(b.pushedAt) - +new Date(a.pushedAt)).slice(0, 6);

  const flagship = projects.filter((p) => featured[p.repo]);
  const others = projects.filter((p) => !featured[p.repo]);

  return (
    <div>
      <Scene />

      {/* TOP BAR */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-line/80 bg-paper/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl h-16 px-6 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3 font-semibold">
            <span className="grid place-items-center h-8 w-8 rounded-md bg-ink text-paper text-xs mono">NK</span>
            <span className="hidden sm:inline">Nischay Kademane</span>
          </a>
          <nav className="hidden md:flex gap-8 text-sm text-muted">
            {nav.map(([l, id]) => (
              <a key={id} href={`#${id}`} className="hover:text-ink transition-colors">{l}</a>
            ))}
          </nav>
          <a href="#contact" className="rounded-lg bg-ink text-paper text-sm font-medium px-4 py-2 hover:bg-accent transition-colors">
            Get in touch
          </a>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO */}
        <section id="top" className="mx-auto max-w-6xl px-6 pt-36 pb-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-accent pulse-dot" />
              Open to roles &amp; collaborations
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08 }}
              className="mt-6 text-4xl sm:text-5xl lg:text-[4.1rem] font-semibold tracking-tight leading-[1.04]">
              I build reliable backend systems and <span className="text-accent">AI products</span> people actually use.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.16 }}
              className="mt-6 max-w-xl text-lg text-muted leading-relaxed">
              Hi, I&apos;m Nischay, a software engineer in Bengaluru. I design secure APIs, real-time platforms and AI agents, from healthcare records to hackathon judging, and ship them end to end.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.24 }}
              className="mt-8 flex flex-wrap gap-3">
              <a href="#work" className="rounded-lg bg-ink text-paper px-6 py-3 text-sm font-semibold hover:bg-accent transition-colors">View selected work</a>
              <a href={profile.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-6 py-3 text-sm font-semibold hover:border-ink transition-colors">
                <Code2 size={16} /> GitHub profile
              </a>
            </motion.div>

            <dl className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-y-6 border-t border-line pt-8">
              {[
                [String(gh.publicRepos), "Public repos"],
                [String(totalStars || "—"), "GitHub stars"],
                [String(gh.followers), "Followers"],
                [gh.since, "Building since"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="text-3xl font-semibold tracking-tight">{n}</dt>
                  <dd className="text-sm text-muted mt-1">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Reveal delay={0.2} className="lg:col-span-5">
            <p className="eyebrow mb-6">At a glance</p>
            <dl className="divide-y divide-line border-y border-line">
              {[
                ["Based in", "Bengaluru, India"],
                ["Focus", "Backend systems · AI products"],
                ["Core stack", "TypeScript, Python, FastAPI, Next.js"],
                ["Data & infra", "PostgreSQL, Redis, Docker, AWS"],
                ["Currently", "Open to roles & collaborations"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="mono text-xs uppercase tracking-widest text-muted">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>

        {/* WORK */}
        <section id="work" className="bg-paper/90 border-y border-line">
          <div className="mx-auto max-w-6xl px-6 py-28">
            <SectionHead eyebrow="01 — Selected work" title="Case studies from products I designed and shipped" aside="Three flagship builds, each taken from architecture to production." />

            <div className="space-y-28">
              {flagship.map((p, i) => {
                const f = featured[p.repo];
                const stat = gh.repos[p.repo];
                return (
                  <Reveal key={p.repo} className="grid md:grid-cols-12 gap-10 md:gap-14 items-center">
                    <div className={`md:col-span-6 ${i % 2 ? "md:order-2" : ""}`}>
                      <ProjectVisual title={p.title} shot={shots[p.repo]} live={p.live} index={i} />
                    </div>
                    <div className={`md:col-span-6 ${i % 2 ? "md:order-1" : ""}`}>
                      <p className="mono text-xs uppercase tracking-widest text-accent">{f.role}</p>
                      <h3 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">{p.kicker}</h3>
                      <p className="mt-4 text-muted leading-relaxed">{p.blurb}</p>
                      <ul className="mt-6 space-y-3">
                        {f.highlights.map((h) => (
                          <li key={h} className="flex gap-3 text-[15px]">
                            <Check size={18} className="mt-0.5 shrink-0 text-accent" /> {h}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-8 flex flex-wrap items-center gap-5 text-sm font-medium">
                        {p.live && (
                          <a href={p.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-accent hover:underline">
                            Live demo <ArrowUpRight size={16} />
                          </a>
                        )}
                        <a href={stat?.url ?? `${profile.github}/${p.repo}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-accent">
                          <Code2 size={16} /> Source code
                        </a>
                        {stat && (
                          <span className="inline-flex items-center gap-1.5 text-muted font-normal">
                            <Star size={14} /> {stat.stars} · updated {ago(stat.pushedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            {/* MORE PROJECTS */}
            <Reveal className="mt-32">
              <h3 className="text-xl font-semibold mb-6">More projects</h3>
              <div className="divide-y divide-line border-y border-line">
                {others.map((p) => {
                  const stat = gh.repos[p.repo];
                  return (
                    <div key={p.repo} className="group grid grid-cols-12 gap-4 items-center py-5 hover:bg-card/70 transition-colors px-2 -mx-2 rounded">
                      <div className="col-span-12 md:col-span-4 flex items-center gap-4">
                        {shots[p.repo] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={shots[p.repo]} alt="" loading="lazy" className="h-12 w-[4.5rem] shrink-0 rounded-md border border-line object-cover object-top" />
                        )}
                        <div>
                          <p className="font-semibold">{p.title}</p>
                          <p className="text-sm text-muted">{p.kicker}</p>
                        </div>
                      </div>
                      <p className="col-span-12 md:col-span-4 text-sm text-muted">{p.blurb}</p>
                      <p className="col-span-6 md:col-span-2 mono text-xs text-muted">{stat?.language ?? p.tech[0]}</p>
                      <div className="col-span-6 md:col-span-2 flex justify-end gap-4 text-sm font-medium">
                        {p.live && <a href={p.live} target="_blank" rel="noreferrer" className="text-accent hover:underline">Live</a>}
                        <a href={stat?.url ?? `${profile.github}/${p.repo}`} target="_blank" rel="noreferrer" className="hover:text-accent">Code</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CAPABILITIES */}
        <section id="capabilities" className="mx-auto max-w-6xl px-6 py-28">
          <SectionHead eyebrow="02 — Capabilities" title="What I can take off your plate" />
          <div className="grid md:grid-cols-3 gap-x-12 gap-y-10">
            {capabilities.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08} className="border-t-2 border-ink pt-6">
                <p className="mono text-xs text-accent">0{i + 1}</p>
                <h3 className="mt-3 text-xl font-semibold">{c.title}</h3>
                <p className="mt-3 text-muted leading-relaxed">{c.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* STACK */}
        <section id="stack" className="bg-ink text-paper">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal className="mb-12">
              <p className="eyebrow !text-warm [&::before]:!bg-warm mb-4">03 — Stack</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Tools I reach for</h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {stack.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.06}>
                  <p className="mono text-xs uppercase tracking-widest text-paper/50 mb-4">{s.label}</p>
                  <ul className="space-y-2.5">
                    {s.items.map((it) => (
                      <li key={it} className="text-lg">{it}</li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* GITHUB */}
        <section id="github" className="mx-auto max-w-6xl px-6 py-28">
          <SectionHead eyebrow="04 — Open source" title="Live from GitHub" aside={gh.ok ? "Synced from the GitHub API and refreshed hourly." : "Showing saved data; live sync is currently unavailable."} />
          <div className="grid lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-5">
              <p className="text-sm font-medium mb-4">Languages across {repoList.length || gh.publicRepos} repositories</p>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-line">
                {langs.map(([l, n], i) => (
                  <div key={l} style={{ width: `${(n / Math.max(1, repoList.length)) * 100}%`, opacity: 1 - i * 0.12 }} className="bg-accent" title={l} />
                ))}
              </div>
              <ul className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
                {langs.map(([l, n]) => (
                  <li key={l} className="flex items-center justify-between pr-6">
                    <span>{l}</span><span className="mono text-muted">{n}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <p className="text-sm font-medium mb-4">Recently active</p>
              <div className="divide-y divide-line border-y border-line">
                {recent.map((r) => (
                  <a key={r.name} href={r.url} target="_blank" rel="noreferrer" className="flex items-center justify-between py-4 hover:text-accent transition-colors">
                    <span className="font-medium">{r.name}</span>
                    <span className="flex items-center gap-6 text-sm text-muted">
                      <span className="mono hidden sm:inline">{r.language ?? "—"}</span>
                      <span className="inline-flex items-center gap-1"><Star size={13} />{r.stars}</span>
                      <span className="w-20 text-right">{ago(r.pushedAt)}</span>
                    </span>
                  </a>
                ))}
              </div>
              <a href={profile.github} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                View all on GitHub <ArrowUpRight size={15} />
              </a>
            </Reveal>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="border-t border-line bg-card/90">
          <div className="mx-auto max-w-6xl px-6 py-28 grid lg:grid-cols-12 gap-14">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow mb-4">05 — Contact</p>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.08]">Have a project or role in mind?</h2>
              <p className="mt-5 text-muted leading-relaxed max-w-md">I&apos;m open to full-time roles, internships and freelance work. Send a message and I&apos;ll get back to you quickly.</p>
              <a href={`mailto:${profile.email}`} className="mt-8 inline-flex items-center gap-2 font-medium hover:text-accent break-all">
                <Mail size={18} /> {profile.email}
              </a>
              <div className="mt-4 flex gap-5 text-sm text-muted">
                <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-ink">GitHub</a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-ink">LinkedIn</a>
                <a href={profile.x} target="_blank" rel="noreferrer" className="hover:text-ink">X</a>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <ContactForm />
            </Reveal>
          </div>
        </section>

        <footer className="bg-card/90 border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row justify-between gap-2 text-sm text-muted">
            <span>© 2026 {profile.name}</span>
            <span>Built with Next.js, React Three Fiber &amp; Framer Motion</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
