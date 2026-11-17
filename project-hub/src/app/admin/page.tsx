import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/auth";
import { getAllProjects, getProjectCounts, type Project } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await getAdminSession())) redirect("/login");
  let counts = { total: 0, published: 0, drafts: 0, featured: 0 };
  let recent: Project[] = [];
  let databaseReady = true;
  try {
    const [result, projects] = await Promise.all([getProjectCounts(), getAllProjects()]);
    counts = result;
    recent = projects.slice(0, 5);
  } catch {
    databaseReady = false;
  }

  return (
    <AdminShell>
      <div className="admin-title-row">
        <div><p className="section-kicker">Workspace / Overview</p><h1 className="admin-title" style={{ marginTop: 16 }}>Good to see you.</h1><p className="admin-subtitle">A clear view of what’s live and what’s taking shape.</p></div>
        <Link href="/dashboard/projects?new=1" className="button button-primary"><Plus size={15} /> Add project</Link>
      </div>

      {!databaseReady && <div className="admin-setup-banner"><strong>No database connected (optional)</strong><span>You are signed in, and presentations can be uploaded from <a href="/present" style={{ textDecoration: "underline" }}>Presentations</a>. To add and edit projects from here, connect a Neon database (DATABASE_URL) and apply <code>database/schema.sql</code> and <code>database/seed.sql</code>.</span></div>}

      <div className="admin-stat-grid">
        <div className="admin-stat"><span>Total projects</span><strong>{counts.total.toString().padStart(2, "0")}</strong></div>
        <div className="admin-stat"><span>Published</span><strong>{counts.published.toString().padStart(2, "0")}</strong></div>
        <div className="admin-stat"><span>Drafts</span><strong>{counts.drafts.toString().padStart(2, "0")}</strong></div>
        <div className="admin-stat"><span>Featured</span><strong>{counts.featured.toString().padStart(2, "0")}</strong></div>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-head"><h2>Recently updated</h2><Link className="text-link" href="/dashboard/projects">All projects <ArrowRight size={14} /></Link></div>
        {recent.length ? recent.map((project) => (
          <div className="admin-project-row" key={project.id}>
            <div className="admin-project-name"><strong>{project.title}</strong><small>/{project.slug} · {new Date(project.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</small></div>
            <span className="admin-project-category">{project.category}</span>
            <span className={`admin-status${project.status === "draft" ? " draft" : ""}`}>{project.status}</span>
            <div className="admin-row-actions"><Link href={`/dashboard/projects?edit=${encodeURIComponent(project.id)}`}>Edit <ArrowUpRight size={12} /></Link></div>
          </div>
        )) : <div className="admin-empty">{databaseReady ? "No projects yet. Add a project to start your index." : "Project data will appear after the database is ready."}</div>}
      </section>
    </AdminShell>
  );
}
