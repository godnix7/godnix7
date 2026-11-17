import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession, requestOriginIsValid } from "@/lib/auth";
import { getAllProjects, saveProject } from "@/lib/projects";
import { projectInputSchema } from "@/lib/project-validation";

export const runtime = "nodejs";

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  try {
    return NextResponse.json({ projects: await getAllProjects() });
  } catch {
    return NextResponse.json({ error: "Projects are unavailable. Apply database/schema.sql first." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!requestOriginIsValid(request)) return NextResponse.json({ error: "Request origin rejected." }, { status: 403 });
  if (!(await getAdminSession())) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const parsed = projectInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Some project fields are missing or invalid." }, { status: 400 });

  try {
    const project = await saveProject(parsed.data);
    if (!project) return NextResponse.json({ error: "Project could not be saved." }, { status: 500 });
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    return NextResponse.json({ error: code === "23505" ? "That project slug is already in use." : "Project could not be saved. Check the database setup." }, { status: code === "23505" ? 409 : 503 });
  }
}
