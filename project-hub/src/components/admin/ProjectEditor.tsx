"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowUpRight, LoaderCircle, UploadCloud } from "lucide-react";
import { upload } from "@vercel/blob/client";
import type { Project, ProjectInput } from "@/lib/projects";

const accents: ProjectInput["accent"][] = ["citrus", "violet", "coral", "blue", "lavender", "amber", "mint"];

function blankProject(sortOrder: number): ProjectInput {
  return {
    title: "", slug: "", category: "", description: "", longDescription: "",
    tech: [], repository: "", liveUrl: "", demoUrl: "", documentationUrl: "",
    presentationUrl: "", mediaUrls: [], thumbnailUrl: "", featured: false,
    status: "draft", sortOrder, accent: "citrus",
  };
}

export default function ProjectEditor({ project, sortOrder, onCancel, onSaved }: {
  project: Project | null;
  sortOrder: number;
  onCancel: () => void;
  onSaved: (project: Project) => void;
}) {
  const [value, setValue] = useState<ProjectInput>(() => project ? {
    title: project.title, slug: project.slug, category: project.category,
    description: project.description, longDescription: project.longDescription,
    tech: project.tech, repository: project.repository, liveUrl: project.liveUrl,
    demoUrl: project.demoUrl, documentationUrl: project.documentationUrl,
    presentationUrl: project.presentationUrl, mediaUrls: project.mediaUrls,
    thumbnailUrl: project.thumbnailUrl, featured: project.featured,
    status: project.status, sortOrder: project.sortOrder, accent: project.accent as ProjectInput["accent"],
  } : blankProject(sortOrder));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  function update<K extends keyof ProjectInput>(key: K, next: ProjectInput[K]) {
    setValue((current) => ({ ...current, [key]: next }));
  }

  function updateText(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value: next } = event.currentTarget;
    if (name === "title") {
      setValue((current) => ({ ...current, title: next }));
      return;
    }
    if (name === "tech") update("tech", next.split(",").map((item) => item.trim()).filter(Boolean));
    else if (name === "mediaUrls") update("mediaUrls", next.split(/[\n,]/).map((item) => item.trim()).filter(Boolean));
    else if (name === "sortOrder") update("sortOrder", Number(next));
    else if (name in value) update(name as keyof ProjectInput, next as never);
  }

  async function uploadFile(event: ChangeEvent<HTMLInputElement>, kind: "thumbnail" | "presentation") {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const isPresentation = kind === "presentation";
    const allowed = isPresentation
      ? file.name.toLowerCase().endsWith(".pptx")
      : ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type);
    const maxSize = isPresentation ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
    if (!allowed) {
      setMessage(isPresentation ? "Choose a PowerPoint .pptx file." : "Use a JPG, PNG, WebP, or AVIF image.");
      input.value = "";
      return;
    }
    if (file.size > maxSize) {
      setMessage(isPresentation ? "Choose a presentation under 100 MB." : "Choose an image under 5 MB.");
      input.value = "";
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-90) || (isPresentation ? "presentation.pptx" : "project-image");
      const typedFile = isPresentation && !file.type
        ? new File([file], safeName, { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" })
        : file;
      const blob = await upload(`projects/${Date.now()}-${safeName}`, typedFile, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      update(isPresentation ? "presentationUrl" : "thumbnailUrl", blob.url);
      setMessage(isPresentation ? "Presentation uploaded. It will be publicly viewable from the project page." : "Image uploaded to project storage.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The file could not be uploaded.");
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(project ? `/api/admin/projects/${encodeURIComponent(project.id)}` : "/api/admin/projects", {
        method: project ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "Project could not be saved.");
        return;
      }
      onSaved(result.project as Project);
    } catch {
      setMessage("Could not reach the project service.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-panel editor-panel">
      <div className="admin-panel-head"><h2>{project ? "Edit project" : "New project"}</h2><button className="editor-close" type="button" onClick={onCancel}>Close</button></div>
      <form className="project-editor-form" onSubmit={submit}>
        <div className="admin-form-grid">
          <div className="admin-field"><label htmlFor="project-title">Project name</label><input id="project-title" value={value.title} onChange={(event) => update("title", event.target.value)} required minLength={2} maxLength={100} /></div>
          <div className="admin-field"><label htmlFor="project-slug">Slug</label><input id="project-slug" value={value.slug} onChange={(event) => update("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-"))} placeholder="my-project" required maxLength={80} /></div>
          <div className="admin-field"><label htmlFor="project-category">Category</label><input id="project-category" value={value.category} onChange={(event) => update("category", event.target.value)} required maxLength={100} placeholder="AI · Research" /></div>
          <div className="admin-field"><label htmlFor="project-tech">Technology (comma separated)</label><input id="project-tech" name="tech" value={value.tech.join(", ")} onChange={updateText} placeholder="Next.js, TypeScript, PostgreSQL" /></div>
          <div className="admin-field admin-field-full"><label htmlFor="project-summary">Short description</label><textarea id="project-summary" value={value.description} onChange={(event) => update("description", event.target.value)} required maxLength={280} rows={3} /></div>
          <div className="admin-field admin-field-full"><label htmlFor="project-long-description">Detailed overview</label><textarea id="project-long-description" value={value.longDescription} onChange={(event) => update("longDescription", event.target.value)} required maxLength={8000} rows={6} /></div>
          <div className="admin-field"><label htmlFor="project-repository">GitHub repository</label><input id="project-repository" type="url" value={value.repository} onChange={(event) => update("repository", event.target.value)} placeholder="https://github.com/..." /></div>
          <div className="admin-field"><label htmlFor="project-live">Live project URL</label><input id="project-live" type="url" value={value.liveUrl} onChange={(event) => update("liveUrl", event.target.value)} placeholder="https://..." /></div>
          <div className="admin-field"><label htmlFor="project-demo">Interactive demo URL</label><input id="project-demo" type="url" value={value.demoUrl} onChange={(event) => update("demoUrl", event.target.value)} placeholder="https://..." /></div>
          <div className="admin-field"><label htmlFor="project-docs">Documentation URL</label><input id="project-docs" type="url" value={value.documentationUrl} onChange={(event) => update("documentationUrl", event.target.value)} placeholder="https://..." /></div>
          <div className="admin-field"><label htmlFor="project-presentation">PowerPoint for the web embed URL</label><input id="project-presentation" type="url" value={value.presentationUrl} onChange={(event) => update("presentationUrl", event.target.value)} placeholder="Paste a PowerPoint / OneDrive embed URL" /><small className="admin-field-note">Use the official embed URL for best animation support. A direct .pptx upload is also available below.</small></div>
          <div className="admin-field admin-field-full"><label className="file-upload-label" htmlFor="project-pptx"><UploadCloud size={15} /> {uploading ? "Uploading file…" : "Upload PowerPoint (.pptx, max 100 MB)"}{uploading && <LoaderCircle size={14} className="spin" />}</label><input className="visually-hidden" id="project-pptx" type="file" accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={(event) => void uploadFile(event, "presentation")} disabled={uploading} />{value.presentationUrl && <a className="admin-thumbnail-link" href={value.presentationUrl} target="_blank" rel="noreferrer">Open current presentation <ArrowUpRight size={12} /></a>}</div>
          <div className="admin-field admin-field-full"><label htmlFor="project-media">Screenshots / architecture / media URLs (one per line)</label><textarea id="project-media" name="mediaUrls" value={value.mediaUrls.join("\n")} onChange={updateText} rows={3} placeholder="https://..." /></div>
          <div className="admin-field admin-field-full"><label htmlFor="project-thumbnail">Thumbnail URL</label><input id="project-thumbnail" type="url" value={value.thumbnailUrl} onChange={(event) => update("thumbnailUrl", event.target.value)} placeholder="Upload an image or paste a URL" /></div>
          <div className="admin-field admin-field-full"><label className="file-upload-label" htmlFor="project-image"><UploadCloud size={15} /> {uploading ? "Uploading file…" : "Upload thumbnail (JPG, PNG, WebP, AVIF; max 5 MB)"}{uploading && <LoaderCircle size={14} className="spin" />}</label><input className="visually-hidden" id="project-image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => void uploadFile(event, "thumbnail")} disabled={uploading} />{value.thumbnailUrl && <a className="admin-thumbnail-link" href={value.thumbnailUrl} target="_blank" rel="noreferrer">Preview uploaded image <ArrowUpRight size={12} /></a>}</div>
          <div className="admin-field"><label htmlFor="project-accent">Artwork accent</label><select id="project-accent" value={value.accent} onChange={(event) => update("accent", event.target.value as ProjectInput["accent"])}>{accents.map((accent) => <option key={accent} value={accent}>{accent}</option>)}</select></div>
          <div className="admin-field"><label htmlFor="project-order">Display order</label><input id="project-order" type="number" min={0} max={9999} value={value.sortOrder} onChange={(event) => update("sortOrder", Number(event.target.value))} /></div>
        </div>
        <div className="admin-form-actions">
          <div className="editor-options"><label className="admin-checkbox"><input type="checkbox" checked={value.featured} onChange={(event) => update("featured", event.target.checked)} /> Featured</label><label className="admin-checkbox">Status <select value={value.status} onChange={(event) => update("status", event.target.value as ProjectInput["status"])}><option value="draft">Draft</option><option value="published">Published</option></select></label></div>
          <div className="editor-submit-group">{message && <span className="admin-message" role="status">{message}</span>}<button className="button button-primary" type="submit" disabled={saving || uploading}>{saving ? <>Saving <LoaderCircle size={14} className="spin" /></> : <>Save project <ArrowUpRight size={13} /></>}</button></div>
        </div>
      </form>
    </section>
  );
}
