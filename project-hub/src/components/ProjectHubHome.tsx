import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Code2 } from "lucide-react";
import type { Project } from "@/lib/projects";

export default function ProjectHubHome({ projects }: { projects: Project[] }) {
  const ordered = [...projects].sort((a, b) => a.sortOrder - b.sortOrder);
  const featured = ordered.filter((project) => project.featured).length;

  return (
    <main className="hub-home">
      <header className="hub-header">
        <Link href="/" className="hub-brand" aria-label="Project Hub home">
          <span className="hub-brand-mark">P</span>
          <span>PROJECT<span className="hub-brand-light">HUB</span></span>
        </Link>
        <nav aria-label="Project Hub navigation">
          <a href="#projects">Projects</a>
          <a href="#about-hub">About</a>
          <a className="hub-admin-link" href="/admin/login">Admin <ArrowUpRight size={14} /></a>
        </nav>
      </header>

      <section className="hub-hero" id="about-hub">
        <div className="hub-hero-copy">
          <span className="hub-eyebrow"><i /> A living index of things I build</span>
          <h1>Projects,<br /><em>built to be explored.</em></h1>
          <p>Software experiments, useful tools, and ambitious products. Open a project to see what it does, how it works, and where to try it.</p>
          <a className="hub-primary-button" href="#projects">Explore projects <ArrowRight size={16} /></a>
        </div>
        <div className="hub-hero-panel" aria-hidden="true">
          <div className="hub-panel-top"><span>PROJECT INDEX</span><span>2026 / ACTIVE</span></div>
          <div className="hub-orbit hub-orbit-one" /><div className="hub-orbit hub-orbit-two" />
          <div className="hub-panel-core">{String(ordered.length).padStart(2, "0")}<small>BUILDS</small></div>
          <span className="hub-panel-node hub-node-a" /><span className="hub-panel-node hub-node-b" />
          <div className="hub-panel-bottom"><span>IDEA → BUILD → SHIP</span><span>BLR / IN</span></div>
        </div>
      </section>

      <section className="hub-projects" id="projects">
        <div className="hub-section-heading">
          <div><span className="hub-section-label">THE INDEX / 01</span><h2>Explore the work</h2></div>
          <p>{ordered.length} projects <span>·</span> {featured} featured</p>
        </div>
        <div className="hub-project-grid">
          {ordered.map((project, index) => (
            <article className="hub-project-card" key={project.id}>
              <Link href={`/projects/${project.slug}`} className="hub-project-image" aria-label={`View ${project.title}`}>
                {project.thumbnailUrl ? <Image src={project.thumbnailUrl} alt={`${project.title} preview`} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" /> : <span className={`hub-project-placeholder ${project.accent}`}><b>{project.title.slice(0, 1)}</b></span>}
                <span className="hub-project-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="hub-project-open"><ArrowUpRight size={17} /></span>
              </Link>
              <div className="hub-project-meta"><span>{project.category}</span><span className={project.demoUrl ? "hub-featured" : "hub-project-label"}>{project.demoUrl ? "LIVE DEMO" : "PROJECT"}</span></div>
              <h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3>
              <p>{project.description}</p>
              <div className="hub-project-footer">
                <div>{project.tech.slice(0, 3).map((tech) => <span key={tech}>{tech}</span>)}</div>
                <Link href={`/projects/${project.slug}`}>Details <ArrowRight size={14} /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="hub-footer"><Link href="/" className="hub-brand"><span className="hub-brand-mark">P</span><span>PROJECT<span className="hub-brand-light">HUB</span></span></Link><span>A project index by Nischay Kademane</span><a href="https://github.com/godnix7" target="_blank" rel="noreferrer"><Code2 size={15} /> GitHub <ArrowUpRight size={13} /></a></footer>
    </main>
  );
}
