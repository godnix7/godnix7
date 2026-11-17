"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";

export type CardProject = {
  slug: string;
  title: string;
  category: string;
  description: string;
  tech: string[];
  thumbnailUrl: string;
  liveUrl: string;
  repository: string;
};

const LIVE = new Set(["motionsense", "unimonitor"]);
const group = (c: string) => c.split("·")[0].trim();

export default function ProjectGrid({ projects }: { projects: CardProject[] }) {
  const groups = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => group(p.category))))], [projects]);
  const [on, setOn] = useState("All");
  const shown = on === "All" ? projects : projects.filter((p) => group(p.category) === on);

  return (
    <>
      <div className="h-filters" role="tablist" aria-label="Filter projects by category">
        {groups.map((g) => (
          <button key={g} className={on === g ? "on" : ""} onClick={() => setOn(g)} role="tab" aria-selected={on === g}>
            {g}
          </button>
        ))}
      </div>
      <div className="h-grid">
        {shown.map((p, i) => (
          <article key={p.slug} className="h-card">
            <Link href={`/projects/${p.slug}`} className="h-card-media" aria-label={`Open ${p.title}`}>
              {p.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.thumbnailUrl} alt={`${p.title} preview`} loading="lazy" />
              ) : (
                <span className={`h-card-fallback${i % 2 ? " alt" : ""}`}>{p.title.slice(0, 1)}</span>
              )}
              <span className="h-card-tags">
                {LIVE.has(p.slug) && <span className="h-tag live"><i /> Live demo</span>}
                {p.liveUrl && <span className="h-tag">Website</span>}
              </span>
            </Link>
            <div className="h-card-body">
              <span className="h-card-cat">{p.category}</span>
              <h3><Link href={`/projects/${p.slug}`}>{p.title}</Link></h3>
              <p>{p.description}</p>
              <div className="h-chips">{p.tech.slice(0, 4).map((t) => <span key={t}>{t}</span>)}</div>
              <div className="h-card-foot">
                <Link href={`/projects/${p.slug}`}>{LIVE.has(p.slug) ? "Run the demo" : "View project"} →</Link>
                <span className="muted">
                  {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer">Site <ArrowUpRight size={12} /></a>}
                  {p.repository && <a href={p.repository} target="_blank" rel="noreferrer">Code <ArrowUpRight size={12} /></a>}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
