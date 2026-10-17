import Experience from "@/components/Experience";
import { getGitHub } from "@/lib/github";

export default async function Home() {
  const gh = await getGitHub();
  return <Experience gh={gh} />;
}
