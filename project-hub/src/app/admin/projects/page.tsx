import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import ProjectManager from "@/components/admin/ProjectManager";
import { getAdminSession } from "@/lib/auth";
import { getAllProjects, type Project } from "@/lib/projects";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ new?: string; edit?: string }> };

export default async function AdminProjectsPage({ searchParams }: Props) {
  if (!(await getAdminSession())) redirect("/login");
  const query = await searchParams;
  let projects: Project[] = [];
  let databaseReady = true;
  try {
    projects = await getAllProjects();
  } catch {
    databaseReady = false;
  }

  return (
    <AdminShell>
      <ProjectManager initialProjects={projects} databaseReady={databaseReady} startNew={query.new === "1"} openProjectId={query.edit || ""} />
    </AdminShell>
  );
}
