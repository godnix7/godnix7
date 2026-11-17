import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpen, Code2, ExternalLink, Presentation } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getProjectBySlug } from "@/lib/projects";
import MotionSenseDemo from "@/components/demos/MotionSenseDemo";
import UniMonitorTerminal from "@/components/demos/UniMonitorTerminal";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function safeHttpsUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return { title: project.title, description: project.description };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const repository = safeHttpsUrl(project.repository);
  const liveUrl = safeHttpsUrl(project.liveUrl);
  const demoUrl = safeHttpsUrl(project.demoUrl);
  const docsUrl = safeHttpsUrl(project.documentationUrl);
  const presentationUrl = safeHttpsUrl(project.presentationUrl);
  const thumbnailUrl = project.thumbnailUrl.startsWith("/") && !project.thumbnailUrl.startsWith("//")
    ? project.thumbnailUrl
    : safeHttpsUrl(project.thumbnailUrl);
  const presentationPath = presentationUrl ? new URL(presentationUrl).pathname.toLowerCase() : "";
  const presentationSource = presentationPath.endsWith(".pptx")
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(presentationUrl)}&wdAr=1.7777777778`
    : presentationUrl;

  return (
    <main className="project-detail-page">
      <div className="ambient-grid" aria-hidden="true" />
      <div className="film-grain" aria-hidden="true" />
      <Navbar />
      <article className="section-wrap subpage-main">
        <div className="detail-top">
          <Link className="detail-back" href="/#projects"><ArrowLeft size={14} /> Back to selected work</Link>
          <span className="section-kicker">PROJECT / {project.slug.toUpperCase()}</span>
        </div>

        {thumbnailUrl && <div className="detail-thumbnail"><Image src={thumbnailUrl} alt={`${project.title} project artwork`} fill sizes="(max-width: 720px) 100vw, 1000px" unoptimized /></div>}

        <p className="detail-category" style={{ marginTop: project.thumbnailUrl ? 38 : 62 }}>{project.category}</p>
        <h1 className="detail-title">{project.title}</h1>
        <p className="detail-description">{project.description}</p>

        <div className="detail-actions">
          {repository && <a className="button button-quiet" href={repository} target="_blank" rel="noreferrer"><Code2 size={15} /> View source <ArrowUpRight size={13} /></a>}
          {liveUrl && <a className="button button-primary" href={liveUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open live project <ArrowUpRight size={13} /></a>}
          {docsUrl && <a className="button button-quiet" href={docsUrl} target="_blank" rel="noreferrer"><BookOpen size={15} /> Documentation <ArrowUpRight size={13} /></a>}
          {presentationUrl && <a className="button button-quiet" href={presentationUrl} target="_blank" rel="noreferrer"><Presentation size={15} /> Presentation <ArrowUpRight size={13} /></a>}
        </div>

        <div className="detail-meta">
          <div className="detail-meta-block"><span className="detail-meta-label">Technology</span><div className="detail-tech">{project.tech.map((tech) => <span key={tech}>{tech}</span>)}</div></div>
          <div className="detail-meta-block"><span className="detail-meta-label">Project notes</span><span className="subpage-intro">{project.featured ? "Featured work" : "Selected project"} · Updated {new Date(project.updatedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span></div>
        </div>

        <div className="detail-story">{project.longDescription}</div>

        {project.mediaUrls.length > 0 && (
          <div className="detail-media-grid">
            {project.mediaUrls.map((url, index) => {
              const safeUrl = safeHttpsUrl(url);
              return safeUrl ? <a key={safeUrl} href={safeUrl} target="_blank" rel="noreferrer" className="media-link">Media {String(index + 1).padStart(2, "0")} <ArrowUpRight size={14} /></a> : null;
            })}
          </div>
        )}

        {presentationUrl && (
          <section className="presentation-wrap" aria-label={`${project.title} presentation`}>
            <div className="presentation-heading"><div><span className="detail-meta-label">PRESENTATION / POWERPOINT</span><h2>Walk through the deck.</h2></div><a className="button button-quiet" href={presentationUrl} target="_blank" rel="noreferrer">Open or download <ArrowUpRight size={13} /></a></div>
            <iframe className="presentation-frame" title={`${project.title} PowerPoint presentation`} src={presentationSource} loading="lazy" allow="fullscreen; autoplay; clipboard-read; clipboard-write" allowFullScreen referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-presentation" />
            <p className="presentation-note">The Office web viewer plays supported slide animations. For the closest PowerPoint animation and timing support, paste the official PowerPoint for the web embed URL; advanced effects and embedded media may still behave differently from desktop.</p>
          </section>
        )}

        {project.slug === "motionsense" ? (
          <MotionSenseDemo />
        ) : project.slug === "unimonitor" ? (
          <UniMonitorTerminal />
        ) : demoUrl ? (
          <section className="demo-frame-wrap" aria-label={`${project.title} interactive demonstration`}>
            <div className="demo-frame-top"><span><i /> Interactive demonstration</span><a href={demoUrl} target="_blank" rel="noreferrer">Open in new tab <ArrowUpRight size={13} /></a></div>
            <iframe className="demo-frame" title={`${project.title} demonstration`} src={demoUrl} loading="lazy" allow="clipboard-read; clipboard-write" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads" />
          </section>
        ) : (
          <div className="demo-placeholder"><strong>Interactive demonstration</strong><span>The project entry is live. Its hosted demonstration URL can be added from the project dashboard when ready.</span></div>
        )}
      </article>
    </main>
  );
}
