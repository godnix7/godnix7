import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HubFooter, HubNav } from "@/components/hub/HubChrome";
import ProjectGrid from "@/components/hub/ProjectGrid";
import { getPublishedProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = (await getPublishedProjects()).sort((a, b) => a.sortOrder - b.sortOrder);
  const cards = projects.map(({ slug, title, category, description, tech, thumbnailUrl, liveUrl, repository }) => ({
    slug, title, category, description, tech, thumbnailUrl, liveUrl, repository,
  }));

  return (
    <div className="hub">
      <HubNav />
      <main>
        <section className="h-wrap h-hero">
          <span className="h-eyebrow">Project Lab · project.nischay.tech</span>
          <h1>Don&apos;t just read about my projects. <em>Run them.</em></h1>
          <p>
            Live, working demos of what I build: a deep-learning model running in your browser, a Linux toolkit running on a
            real server, and the full catalogue of products I&apos;ve shipped.
          </p>
        </section>

        <section id="live" className="h-wrap h-live" aria-label="Live demos">
          <Link href="/projects/motionsense" className="h-tile">
            <div className="h-tile-media">
              <video src="/motionsense/videos/mixed_activities.mp4" autoPlay muted loop playsInline preload="metadata" />
              <span className="h-tile-badge"><i /> Live · in your browser</span>
              <span className="h-tile-pred"><small>Model sees</small>Human activity, ~2 s windows</span>
            </div>
            <div className="h-tile-body">
              <span>Deep learning · MotionSense</span>
              <h3>Real-time activity recognition</h3>
              <p>MobileNetV3 + LSTM trained on UCF101. Try sample clips, your own video or your webcam. Nothing is uploaded.</p>
              <span className="h-tile-cta">Run the model <ArrowRight size={16} /></span>
            </div>
          </Link>

          <Link href="/projects/unimonitor" className="h-tile">
            <div className="h-tile-media">
              <pre className="h-term">
                <b>unimonitor@demo:~$</b> health{"\n"}
                SYSTEM HEALTH ANALYSIS{"\n"}
                ------------------------------------------{"\n"}
                {" "}CPU status      : <span className="ok">HEALTHY</span>   2.0%{"\n"}
                {" "}Memory status   : <span className="ok">HEALTHY</span>   9.7%{"\n"}
                {" "}Disk status     : <span className="ok">HEALTHY</span>   6%{"\n"}
                {" "}Load status     : <span className="ok">HEALTHY</span>   0.00 0.00 0.00{"\n"}
                {"\n"}
                {" "}Overall status  : <span className="ok">HEALTHY</span>{"\n"}
                <b>unimonitor@demo:~$</b> processes▌
              </pre>
              <span className="h-tile-badge"><i /> Live · Linux sandbox</span>
            </div>
            <div className="h-tile-body">
              <span>Linux · UniMonitor</span>
              <h3>System monitoring toolkit</h3>
              <p>The real Bash scripts run on a cloud Linux machine. Pick a command in the terminal and watch real readings come back.</p>
              <span className="h-tile-cta">Open the terminal <ArrowRight size={16} /></span>
            </div>
          </Link>
        </section>

        <section id="projects" className="h-section">
          <div className="h-wrap">
            <div className="h-section-head">
              <div>
                <span className="h-eyebrow">All projects · {String(cards.length).padStart(2, "0")}</span>
                <h2>Everything I&apos;ve built</h2>
              </div>
              <p>Products, systems and research. Open any project for the story, the stack, links and, where available, a demo.</p>
            </div>
            <ProjectGrid projects={cards} />
          </div>
        </section>
      </main>
      <HubFooter />
    </div>
  );
}
