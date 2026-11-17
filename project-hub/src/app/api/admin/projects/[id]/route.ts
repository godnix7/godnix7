import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession, requestOriginIsValid } from "@/lib/auth";
import { deleteProject, saveProject } from "@/lib/projects";
import { projectInputSchema } from "@/lib/project-validation";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  if (!requestOriginIsValid(request)) return NextResponse.json({ error: "Request origin rejected." }, { status: 403 });
  if (!(await getAdminSession())) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = projectInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Some project fields are missing or invalid." }, { status: 400 });
  const { id } = await context.params;

  try {
    const project = await saveProject(parsed.data, id);
    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);
    return NextResponse.json({ project });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    return NextResponse.json({ error: code === "23505" ? "That project slug is already in use." : "Project could not be updated. Check the database setup." }, { status: code === "23505" ? 409 : 503 });
  }
}

export async function DELETE(request: Request, context: Context) {
  if (!requestOriginIsValid(request)) return NextResponse.json({ error: "Request origin rejected." }, { status: 403 });
  if (!(await getAdminSession())) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await context.params;
  try {
    const deleted = await deleteProject(id);
    if (!deleted) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    revalidatePath("/");
    revalidatePath("/projects");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Project could not be deleted. Check the database setup." }, { status: 503 });
  }
}
