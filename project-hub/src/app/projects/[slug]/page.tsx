import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BookOpen, Code2, ExternalLink, Presentation } from "lucide-react";
import { HubFooter, HubNav } from "@/components/hub/HubChrome";
import UniMonitorTerminal from "@/components/demos/UniMonitorTerminal";
import { getProjectBySlug } from "@/lib/projects";

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
  const thumbnailUrl = project.thumbnailUrl.startsWith("/") && !project.thumbnailUrl.startsWith("//") ? project.thumbnailUrl : safeHttpsUrl(project.thumbnailUrl);
  const presentationSource = presentationUrl && new URL(presentationUrl).pathname.toLowerCase().endsWith(".pptx")
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(presentationUrl)}`
    : presentationUrl;
  const liveDemo = project.slug === "motionsense" || project.slug === "unimonitor";

  return (
    <div className="hub">
      <HubNav />
      <main className="h-wrap">
        <nav className="h-crumbs" aria-label="Breadcrumb">
          <Link href="/">Project Lab</Link> / <Link href="/projects">Projects</Link> / <span>{project.title}</span>
        </nav>

        <header className="h-detail-head">
          <div>
            <span className="h-eyebrow">{project.category}</span>
            <h1>{project.title}</h1>
            <p>{project.description}</p>
          </div>
          <div className="h-actions">
            {liveUrl && <a className="h-btn h-btn-dark" href={liveUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open website</a>}
            {repository && <a className="h-btn h-btn-light" href={repository} target="_blank" rel="noreferrer"><Code2 size={15} /> Source code</a>}
            {docsUrl && <a className="h-btn h-btn-light" href={docsUrl} target="_blank" rel="noreferrer"><BookOpen size={15} /> Docs</a>}
            {presentationUrl && <a className="h-btn h-btn-light" href="#presentation"><Presentation size={15} /> Slides</a>}
          </div>
        </header>

        {project.slug === "unimonitor" ? (
          <div className="h-stage"><UniMonitorTerminal /></div>
        ) : demoUrl ? (
          <div className="h-stage">
            <div className="h-stage-head"><span><i /> Interactive demo</span><a href={demoUrl} target="_blank" rel="noreferrer">Open full screen <ArrowUpRight size={12} /></a></div>
            <iframe className="h-frame" title={`${project.title} demo`} src={demoUrl} loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads" />
          </div>
        ) : thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <div className="h-hero-shot"><img src={thumbnailUrl} alt={`${project.title} screenshot`} /></div>
        ) : null}

        <section className="h-about">
          <div>
            <h2>About the project</h2>
            <div className="h-prose">
              {project.longDescription.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </div>
          <dl className="h-facts">
            <div><dt>Category</dt><dd>{project.category}</dd></div>
            <div><dt>Stack</dt><dd className="h-chips">{project.tech.map((t) => <span key={t}>{t}</span>)}</dd></div>
            {liveDemo && <div><dt>Demo</dt><dd>{project.slug === "motionsense" ? "Runs in your browser (ONNX Runtime Web)" : "Real scripts in a Linux sandbox"}</dd></div>}
            {liveUrl && <div><dt>Website</dt><dd><a href={liveUrl} target="_blank" rel="noreferrer">{new URL(liveUrl).host} ↗</a></dd></div>}
            {repository && <div><dt>Repository</dt><dd><a href={repository} target="_blank" rel="noreferrer">{new URL(repository).pathname.slice(1)} ↗</a></dd></div>}
          </dl>
        </section>

        {presentationUrl && (
          <section id="presentation" style={{ paddingBottom: 90 }}>
            <div className="h-section-head">
              <div><span className="h-eyebrow">Presentation</span><h2>Walk through the deck</h2></div>
              <a className="h-btn h-btn-light" href={presentationUrl} target="_blank" rel="noreferrer">Download <ArrowUpRight size={14} /></a>
            </div>
            <iframe className="h-frame" title={`${project.title} presentation`} src={presentationSource} allowFullScreen loading="lazy" />
          </section>
        )}
      </main>
      <HubFooter />
    </div>
  );
}
