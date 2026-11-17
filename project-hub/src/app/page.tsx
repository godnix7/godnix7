import ClientExperience from "@/components/ClientExperience";
import { getPublishedProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await getPublishedProjects();
  return <ClientExperience projects={projects} />;
}
