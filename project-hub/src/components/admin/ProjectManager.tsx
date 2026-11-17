"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Check, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { Project } from "@/lib/projects";
import ProjectEditor from "./ProjectEditor";

type Filter = "all" | "published" | "draft";

export default function ProjectManager({ initialProjects, databaseReady, startNew, openProjectId }: {
  initialProjects: Project[];
  databaseReady: boolean;
  startNew: boolean;
  openProjectId: string;
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<Project | "new" | null>(() => startNew ? "new" : initialProjects.find((project) => project.id === openProjectId) ?? null);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  const visibleProjects = useMemo(() => projects.filter((project) => {
    const matchesStatus = filter === "all" || project.status === filter;
    const needle = search.trim().toLowerCase();
    const matchesSearch = !needle || `${project.title} ${project.slug} ${project.category}`.toLowerCase().includes(needle);
    return matchesStatus && matchesSearch;
  }), [projects, filter, search]);

  function saved(project: Project) {
    setProjects((current) => {
      const index = current.findIndex((item) => item.id === project.id);
      if (index < 0) return [...current, project].sort((a, b) => a.sortOrder - b.sortOrder);
      return current.map((item) => item.id === project.id ? project : item).sort((a, b) => a.sortOrder - b.sortOrder);
    });
    setEditor(null);
    setMessage(`${project.title} saved. ${project.status === "published" ? "It is available on the public site." : "It remains private as a draft."}`);
  }

  async function changeStatus(project: Project) {
    setBusyId(project.id);
    setMessage("");
    const input = {
      title: project.title, slug: project.slug, category: project.category,
      description: project.description, longDescription: project.longDescription,
      tech: project.tech, repository: project.repository, liveUrl: project.liveUrl,
      demoUrl: project.demoUrl, documentationUrl: project.documentationUrl,
      presentationUrl: project.presentationUrl, mediaUrls: project.mediaUrls,
      thumbnailUrl: project.thumbnailUrl, featured: project.featured,
      status: project.status === "published" ? "draft" : "published",
      sortOrder: project.sortOrder, accent: project.accent,
    };
    try {
      const response = await fetch(`/api/admin/projects/${encodeURIComponent(project.id)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "Project status could not be changed.");
        return;
      }
      setProjects((current) => current.map((item) => item.id === project.id ? result.project as Project : item));
      setMessage(`${project.title} is now ${input.status}.`);
    } catch {
      setMessage("Could not reach the project service.");
    } finally {
      setBusyId("");
    }
  }

  async function remove(project: Project) {
    if (!window.confirm(`Delete “${project.title}” from the project index? This cannot be undone.`)) return;
    setBusyId(project.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/projects/${encodeURIComponent(project.id)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "Project could not be deleted.");
        return;
      }
      setProjects((current) => current.filter((item) => item.id !== project.id));
      setEditor((current) => current && current !== "new" && current.id === project.id ? null : current);
      setMessage(`${project.title} deleted.`);
    } catch {
      setMessage("Could not reach the project service.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <>
      <div className="admin-title-row">
        <div><p className="section-kicker">Workspace / Content</p><h1 className="admin-title" style={{ marginTop: 16 }}>Projects.</h1><p className="admin-subtitle">Shape the project index, manage demos, and decide what is public.</p></div>
        <button className="button button-primary" type="button" onClick={() => { setMessage(""); setEditor("new"); }} disabled={!databaseReady}><Plus size={15} /> Add project</button>
      </div>

      {!databaseReady && <div className="admin-setup-banner"><strong>Database setup needed</strong><span>Run the SQL files in the <code>database</code> folder in Neon’s SQL Editor before creating or editing projects.</span></div>}
      {message && <p className="manager-message" role="status"><Check size={14} /> {message}</p>}

      {editor && databaseReady && <ProjectEditor key={editor === "new" ? "new" : editor.id} project={editor === "new" ? null : editor} sortOrder={(projects.at(-1)?.sortOrder ?? 0) + 10} onCancel={() => setEditor(null)} onSaved={saved} />}

      <section className="admin-panel project-manager-panel">
        <div className="admin-panel-head project-manager-tools">
          <h2>All projects <span className="panel-count">{String(projects.length).padStart(2, "0")}</span></h2>
          <div className="manager-controls">
            <label className="manager-search"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects" /></label>
            <div className="filter-tabs" role="tablist" aria-label="Filter projects">
              {(["all", "published", "draft"] as const).map((item) => <button key={item} type="button" className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}
            </div>
          </div>
        </div>
        {visibleProjects.length ? visibleProjects.map((project) => (
          <div className="admin-project-row" key={project.id}>
            <div className="admin-project-name"><strong>{project.title}{project.featured && <span className="featured-tag">FEATURED</span>}</strong><small>/{project.slug} · {new Date(project.updatedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</small></div>
            <span className="admin-project-category">{project.category}</span>
            <span className={`admin-status${project.status === "draft" ? " draft" : ""}`}>{project.status}</span>
            <div className="admin-row-actions">
              <button type="button" onClick={() => setEditor(project)} aria-label={`Edit ${project.title}`} title="Edit"><Pencil size={13} /></button>
              <Link href={`/projects/${project.slug}`} target="_blank" aria-label={`Preview ${project.title}`} title="Preview"><Eye size={14} /></Link>
              <button type="button" onClick={() => void changeStatus(project)} disabled={busyId === project.id} aria-label={`${project.status === "published" ? "Unpublish" : "Publish"} ${project.title}`} title={project.status === "published" ? "Move to drafts" : "Publish"}>{project.status === "published" ? <ArrowUpRight size={14} /> : <Check size={14} />}</button>
              <button type="button" onClick={() => void remove(project)} disabled={busyId === project.id} aria-label={`Delete ${project.title}`} title="Delete"><Trash2 size={13} /></button>
            </div>
          </div>
        )) : <div className="admin-empty">{databaseReady ? "No projects match that view." : "Connect the database to manage projects."}</div>}
      </section>
      <p className="manager-footnote"><ArrowUpRight size={12} /> Draft project detail routes are private and return not found until published.</p>
    </>
  );
}
