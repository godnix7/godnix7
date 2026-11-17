import { getPublishedProjects } from "@/lib/projects";
import ProjectHubHome from "@/components/ProjectHubHome";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await getPublishedProjects();
  return <ProjectHubHome projects={projects} />;
}
