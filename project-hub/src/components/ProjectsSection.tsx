"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Code2, ExternalLink, Orbit } from "lucide-react";
import type { Project } from "@/lib/projects";

function ProjectArtwork({ project, index }: { project: Project; index: number }) {
  return (
    <div className={`project-art art-${project.accent}${project.thumbnailUrl ? " project-art-has-image" : ""}`} aria-hidden="true">
      {project.thumbnailUrl && <Image src={project.thumbnailUrl} alt="" fill sizes="(max-width: 720px) 100vw, 50vw" unoptimized className="project-real-thumbnail" />}
      <div className="art-coordinate">{String(index + 1).padStart(2, "0")} / FIELD NOTE</div>
      <div className="art-motif">
        <div className="motif-ring motif-ring-a" />
        <div className="motif-ring motif-ring-b" />
        <div className="motif-core"><span>{project.title.slice(0, 1)}</span></div>
        <span className="motif-node node-a" /><span className="motif-node node-b" /><span className="motif-node node-c" />
      </div>
      <div className="art-bottom"><span>{project.category.split("·")[0].trim().toUpperCase()}</span><Orbit size={14} strokeWidth={1.4} /></div>
      <span className="art-grain" />
    </div>
  );
}

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  const ordered = [...projects].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section id="projects" className="projects-section section-wrap section-space">
      <div className="section-kicker"><span>02 / Selected work</span><span className="kicker-rule" /><span className="kicker-count">{String(ordered.length).padStart(2, "0")} PROJECTS</span></div>
      <div className="projects-intro">
        <h2 className="section-heading">Ideas, out in<br /><em>the world.</em></h2>
        <p>Selected builds, tools, and experiments. Each one starts with a question and ends with something you can explore.</p>
      </div>

      <div className="projects-grid">
        {ordered.map((project, index) => (
          <motion.article
            key={project.id}
            className={`project-card${index === 0 ? " project-card-featured" : ""}`}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.55, delay: index % 2 === 0 ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5 }}
          >
            <Link href={`/projects/${project.slug}`} className="project-card-link" aria-label={`Explore ${project.title}`}>
              <ProjectArtwork project={project} index={index} />
              <div className="project-card-body">
                <div className="project-card-topline"><span>{project.category}</span><span>{project.featured ? "FEATURED" : String(index + 1).padStart(2, "0")}</span></div>
                <h3>{project.title}<ArrowDownRight className="project-arrow" size={22} strokeWidth={1.5} /></h3>
                <p>{project.description}</p>
                <div className="project-card-bottom">
                  <div className="tech-tags">{project.tech.slice(0, 3).map((tech) => <span key={tech}>{tech}</span>)}</div>
                  <span className="project-open">Open case <ArrowUpRight size={14} /></span>
                </div>
              </div>
            </Link>
            <div className="project-card-external">
              {project.repository && <a href={project.repository} target="_blank" rel="noreferrer"><Code2 size={13} /> Source</a>}
              {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Live</a>}
              {project.demoUrl && <span className="demo-ready"><i /> Interactive demo</span>}
              {!project.liveUrl && !project.demoUrl && <span className="demo-planned">Demo details inside</span>}
            </div>
          </motion.article>
        ))}
      </div>

      <Link href="/projects" className="all-projects-link">Browse the full project index <ArrowUpRight size={16} /></Link>
    </section>
  );
}
