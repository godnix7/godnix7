import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProjectsSection from "@/components/ProjectsSection";
import { getPublishedProjects } from "@/lib/projects";

export const metadata: Metadata = { title: "Project Index", description: "Explore software, systems, and applied AI projects by Nischay Kademane." };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  return (
    <main className="archive-page">
      <div className="ambient-grid" aria-hidden="true" />
      <div className="film-grain" aria-hidden="true" />
      <Navbar />
      <div className="section-wrap subpage-main">
        <Link className="detail-back" href="/#projects"><ArrowLeft size={14} /> Back to portfolio</Link>
        <p className="section-kicker" style={{ marginTop: 45 }}>Project index <span className="kicker-rule" /><span className="kicker-count">{String(projects.length).padStart(2, "0")} ENTRIES</span></p>
        <h1 className="subpage-heading">A body of<br /><em>work in progress.</em></h1>
        <p className="subpage-intro">A growing collection of products, systems, research, and experiments. Open a project for the context, tools, and live demo where available.</p>
        <div className="project-archive-grid"><ProjectsSection projects={projects} /></div>
        <Link className="text-link" href="/#contact">Have a problem I should explore? <ArrowUpRight size={14} /></Link>
      </div>
    </main>
  );
}
