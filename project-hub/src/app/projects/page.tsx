import type { Metadata } from "next";
import { HubFooter, HubNav } from "@/components/hub/HubChrome";
import ProjectGrid from "@/components/hub/ProjectGrid";
import { getPublishedProjects } from "@/lib/projects";

export const metadata: Metadata = { title: "Projects", description: "Software, systems and applied AI projects by Nischay Kademane." };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = (await getPublishedProjects()).sort((a, b) => a.sortOrder - b.sortOrder);
  const cards = projects.map(({ slug, title, category, description, tech, thumbnailUrl, liveUrl, repository }) => ({
    slug, title, category, description, tech, thumbnailUrl, liveUrl, repository,
  }));
  return (
    <div className="hub">
      <HubNav />
      <main className="h-wrap" style={{ paddingBottom: 80 }}>
        <section className="h-hero" style={{ paddingBottom: 30 }}>
          <span className="h-eyebrow">Project index · {String(cards.length).padStart(2, "0")}</span>
          <h1>Every project, <em>one place.</em></h1>
          <p>Filter by area, open a project for the full story, or jump straight to a live demo.</p>
        </section>
        <ProjectGrid projects={cards} />
      </main>
      <HubFooter />
    </div>
  );
}
