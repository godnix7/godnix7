import "server-only";
import { neon } from "@neondatabase/serverless";

export type ProjectStatus = "draft" | "published";

export type Project = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  longDescription: string;
  tech: string[];
  repository: string;
  liveUrl: string;
  demoUrl: string;
  documentationUrl: string;
  presentationUrl: string;
  mediaUrls: string[];
  thumbnailUrl: string;
  featured: boolean;
  status: ProjectStatus;
  sortOrder: number;
  accent: string;
  updatedAt: string;
};

export type ProjectInput = Omit<Project, "id" | "updatedAt">;

const seedProjects: Project[] = [
  {
    id: "seed-medilocker",
    title: "MediLocker",
    slug: "medilocker",
    category: "Healthcare · Security",
    description: "A secure health-record platform designed around privacy, clear access, and dependable care workflows.",
    longDescription: "MediLocker explores how people and care teams can manage sensitive medical records with a stronger sense of control. The project brings together secure document storage, hospital workflows, and a privacy-first approach to sharing information.",
    tech: ["FastAPI", "PostgreSQL", "Redis", "AWS S3"],
    repository: process.env.PROJECT_MEDILOCKER_REPO || "https://github.com/godnix7/MediLocker",
    liveUrl: process.env.PROJECT_MEDILOCKER_LIVE || "https://medilocker-main.vercel.app/",
    demoUrl: "",
    documentationUrl: "",
    presentationUrl: "",
    mediaUrls: [],
    thumbnailUrl: "/shots/medilocker.png",
    featured: true,
    status: "published",
    sortOrder: 10,
    accent: "citrus",
    updatedAt: "2026-11-17T00:00:00.000Z",
  },
  {
    id: "seed-lynxis",
    title: "Lynxis AI",
    slug: "lynxis-ai",
    category: "AI · Developer tools",
    description: "A multi-agent code intelligence platform for making large codebases easier to understand and navigate.",
    longDescription: "Lynxis AI brings agent-based analysis and interactive code exploration into one workspace. It focuses on helping developers build context around unfamiliar projects and move from questions to useful answers.",
    tech: ["Node.js", "Express", "Prisma", "Three.js", "Docker"],
    repository: process.env.PROJECT_LYNXIS_REPO || "https://github.com/godnix7/Lynxis",
    liveUrl: process.env.PROJECT_LYNXIS_LIVE || "https://lynxis.vercel.app",
    demoUrl: "",
    documentationUrl: "",
    presentationUrl: "",
    mediaUrls: [],
    thumbnailUrl: "/shots/lynxis.png",
    featured: true,
    status: "published",
    sortOrder: 20,
    accent: "violet",
    updatedAt: "2026-11-17T00:00:00.000Z",
  },
  {
    id: "seed-eventbyte",
    title: "EventByte",
    slug: "eventbyte",
    category: "Events · Real time",
    description: "A hackathon operations platform that connects participant tracking, judging, and live event updates.",
    longDescription: "EventByte is built to make the moving pieces of a hackathon easier to coordinate. It combines participant and event management with real-time judging workflows and updates for teams and organizers.",
    tech: ["Django", "TypeScript", "TanStack Query", "Socket.io"],
    repository: process.env.PROJECT_EVENTBYTE_REPO || "https://github.com/godnix7/EventByte",
    liveUrl: process.env.PROJECT_EVENTBYTE_LIVE || "https://event-byte.vercel.app",
    demoUrl: "",
    documentationUrl: "",
    presentationUrl: "",
    mediaUrls: [],
    thumbnailUrl: "/shots/eventbyte.png",
    featured: false,
    status: "published",
    sortOrder: 30,
    accent: "coral",
    updatedAt: "2026-11-17T00:00:00.000Z",
  },
  {
    id: "seed-deepfake-detection",
    title: "Deepfake Detection",
    slug: "deepfake-detection",
    category: "Computer vision · Forensics",
    description: "A video-forensics project that detects and classifies AI-generated deepfake media.",
    longDescription: "Deepfake Detection explores the use of computer vision and deep learning to identify synthetic video. The project focuses on helping viewers assess manipulated media through an accessible detection workflow.",
    tech: ["Python", "Computer vision", "Deep learning"],
    repository: "https://github.com/godnix7/Deepfake-detection",
    liveUrl: "",
    demoUrl: "",
    documentationUrl: "",
    presentationUrl: "",
    mediaUrls: [],
    thumbnailUrl: "",
    featured: false,
    status: "published",
    sortOrder: 40,
    accent: "coral",
    updatedAt: "2026-11-17T00:00:00.000Z",
  },
  {
    id: "seed-localmusic",
    title: "LocalMusic",
    slug: "localmusic",
    category: "Media · Streaming",
    description: "A focused music experience backed by fast search, streaming, and subscription-aware controls.",
    longDescription: "LocalMusic combines a listening experience with an operations layer for managing subscriptions and media. The project explores responsive search and low-latency playback flows built on a real-time backend.",
    tech: ["Fastify", "PostgreSQL", "Elasticsearch", "Redis", "WebSockets"],
    repository: process.env.PROJECT_LOCALMUSIC_REPO || "https://github.com/godnix7/LocalMusic",
    liveUrl: process.env.PROJECT_LOCALMUSIC_LIVE || "https://localmusic-three.vercel.app",
    demoUrl: "",
    documentationUrl: "",
    presentationUrl: "",
    mediaUrls: [],
    thumbnailUrl: "/shots/localmusic.png",
    featured: false,
    status: "published",
    sortOrder: 50,
    accent: "blue",
    updatedAt: "2026-11-17T00:00:00.000Z",
  },
  {
    id: "seed-althea",
    title: "Althea",
    slug: "althea",
    category: "AI · Wellbeing",
    description: "An accessible emotional-support concept exploring gentle, everyday interactions with language technology.",
    longDescription: "Althea is an early exploration of conversational support, with an emphasis on an approachable experience and useful, thoughtful responses. It studies how language interfaces can make help feel easier to reach.",
    tech: ["Python", "Flask", "NLP", "Vercel"],
    repository: process.env.PROJECT_ALTHEA_REPO || "https://github.com/godnix7/Althea",
    liveUrl: process.env.PROJECT_ALTHEA_LIVE || "https://althea-gamma.vercel.app",
    demoUrl: "",
    documentationUrl: "",
    presentationUrl: "",
    mediaUrls: [],
    thumbnailUrl: "/shots/althea.png",
    featured: false,
    status: "published",
    sortOrder: 60,
    accent: "lavender",
    updatedAt: "2026-11-17T00:00:00.000Z",
  },
  {
    id: "seed-motionsense",
    title: "MotionSense",
    slug: "motionsense",
    category: "Deep learning · Computer vision",
    description: "Real-time human activity recognition. The trained MobileNetV3 + LSTM network runs live in your browser on sample clips, your own video or your webcam.",
    longDescription: "MotionSense recognises six activities (Jumping Jack, Push-Ups, Bodyweight Squats, Lunges, Tai Chi and Boxing on a speed bag) from motion over time, never from a single frame. A frozen MobileNetV3-Large encodes each frame, an LSTM reads a 16-frame (about 2 second) window of those features together with their temporal differences, and a small head outputs class probabilities, smoothed and gated by confidence and motion.\n\nTrained on UCF101 (412 training videos), the selected model reaches 72.9% video-level accuracy and 0.738 macro-F1 on the official test split. Feeding the LSTM frame-to-frame feature differences and freezing the backbone reduced background memorisation.\n\nThe demo below runs the actual checkpoint, exported to ONNX (outputs match PyTorch to within 0.000002), entirely inside the browser with ONNX Runtime Web: no server, and video never leaves the device.",
    tech: ["PyTorch", "MobileNetV3", "LSTM", "ONNX Runtime Web", "OpenCV", "UCF101"],
    repository: "https://github.com/godnix7/MotionSense---Deep-Learning-Project",
    liveUrl: "",
    demoUrl: process.env.MOTIONSENSE_STREAMLIT_URL || "",
    documentationUrl: "",
    presentationUrl: "",
    mediaUrls: [],
    thumbnailUrl: "/shots/motionsense.png",
    featured: true,
    status: "published",
    sortOrder: 1,
    accent: "amber",
    updatedAt: "2026-11-17T00:00:00.000Z",
  },
  {
    id: "seed-unimonitor",
    title: "UniMonitor",
    slug: "unimonitor",
    category: "Linux · Systems programming",
    description: "A modular Bash toolkit for Linux system monitoring. Run the real scripts live in a cloud Linux sandbox from a terminal on this page.",
    longDescription: "UniMonitor reports system information, CPU and memory use, mounted filesystems, processes, network configuration and overall health, using Linux /proc interfaces and standard command-line tools. It can save timestamped reports, rotates its own logs, parses its configuration as data (never as code) and protects critical processes from termination.\n\nThe terminal below runs the real UniMonitor scripts inside a Linux (Amazon Linux 2023) serverless sandbox. Visitors choose from an allow-list of read-only views: there is no free-form shell, no process termination and no settings changes. Where the sandbox lacks ps, ip, ss or hostname, tiny /proc readers stand in.",
    tech: ["Bash", "Linux", "/proc", "awk", "Shell scripting"],
    repository: process.env.UNIMONITOR_REPO_URL || "https://github.com/godnix7/Unimonitor",
    liveUrl: "",
    demoUrl: process.env.UNIMONITOR_DEMO_URL || "",
    documentationUrl: "",
    presentationUrl: "",
    mediaUrls: [],
    thumbnailUrl: "",
    featured: true,
    status: "published",
    sortOrder: 2,
    accent: "mint",
    updatedAt: "2026-11-17T00:00:00.000Z",
  },
  {
    id: "seed-harvest-club",
    title: "Harvest Club",
    slug: "harvest-club",
    category: "Community · Product",
    description: "A community platform built to bring local discovery and useful connections into one place.",
    longDescription: "Harvest Club is a community product focused on making local discovery feel approachable and useful. It brings people, places, and shared interests together in a polished web experience.",
    tech: ["TypeScript", "Next.js"],
    repository: "https://github.com/godnix7/harvest-club",
    liveUrl: "https://harvestclub.vercel.app",
    demoUrl: "",
    documentationUrl: "",
    presentationUrl: "",
    mediaUrls: [],
    thumbnailUrl: "/shots/harvest.png",
    featured: false,
    status: "published",
    sortOrder: 70,
    accent: "mint",
    updatedAt: "2026-11-17T00:00:00.000Z",
  },
  {
    id: "seed-sih-internal",
    title: "SIH Internal",
    slug: "sih-internal",
    category: "Civic technology · Hackathon",
    description: "An internal-round build for the Smart India Hackathon, focused on a clear and dependable product workflow.",
    longDescription: "SIH Internal is a collaborative build created for the internal round of the Smart India Hackathon. The project explores how a focused product workflow can support a real-world challenge under a tight delivery schedule.",
    tech: ["TypeScript", "Next.js"],
    repository: "https://github.com/godnix7/SIH-Internal",
    liveUrl: "",
    demoUrl: "",
    documentationUrl: "",
    presentationUrl: "",
    mediaUrls: [],
    thumbnailUrl: "",
    featured: false,
    status: "published",
    sortOrder: 80,
    accent: "blue",
    updatedAt: "2026-11-17T00:00:00.000Z",
  },
];

function db() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  return neon(connectionString);
}

function fromRow(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    category: String(row.category),
    description: String(row.description),
    longDescription: String(row.long_description ?? ""),
    tech: Array.isArray(row.tech) ? row.tech.map(String) : [],
    repository: String(row.repository_url ?? ""),
    liveUrl: String(row.live_url ?? ""),
    demoUrl: String(row.demo_url || (row.slug === "motionsense" ? process.env.MOTIONSENSE_STREAMLIT_URL : row.slug === "unimonitor" ? process.env.UNIMONITOR_DEMO_URL : "") || ""),
    documentationUrl: String(row.documentation_url ?? ""),
    presentationUrl: String(row.presentation_url ?? ""),
    mediaUrls: Array.isArray(row.media_urls) ? row.media_urls.map(String) : [],
    thumbnailUrl: String(row.thumbnail_url ?? ""),
    featured: Boolean(row.featured),
    status: row.status === "draft" ? "draft" : "published",
    sortOrder: Number(row.sort_order ?? 0),
    accent: String(row.accent ?? "citrus"),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getPublishedProjects(): Promise<Project[]> {
  const sql = db();
  if (!sql) return seedProjects.filter((project) => project.status === "published");

  const rows = await sql`
    SELECT * FROM projects
    WHERE status = 'published'
    ORDER BY sort_order ASC, featured DESC, updated_at DESC
  `;
  return rows.map((row) => fromRow(row as Record<string, unknown>));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const sql = db();
  if (!sql) return seedProjects.find((project) => project.slug === slug && project.status === "published") ?? null;

  const rows = await sql`
    SELECT * FROM projects WHERE slug = ${slug} AND status = 'published' LIMIT 1
  `;
  return rows[0] ? fromRow(rows[0] as Record<string, unknown>) : null;
}

export async function getAllProjects(): Promise<Project[]> {
  const sql = db();
  if (!sql) throw new Error("DATABASE_URL is not configured.");
  const rows = await sql`SELECT * FROM projects ORDER BY sort_order ASC, updated_at DESC`;
  return rows.map((row) => fromRow(row as Record<string, unknown>));
}

export async function saveProject(input: ProjectInput, id?: string) {
  const sql = db();
  if (!sql) throw new Error("DATABASE_URL is not configured.");
  const values = [
    input.title, input.slug, input.category, input.description, input.longDescription,
    input.tech, input.repository, input.liveUrl, input.demoUrl, input.documentationUrl,
    input.presentationUrl, input.mediaUrls, input.thumbnailUrl, input.featured,
    input.status, input.sortOrder, input.accent,
  ] as const;

  const rows = id
    ? await sql`
        UPDATE projects SET
          title = ${values[0]}, slug = ${values[1]}, category = ${values[2]},
          description = ${values[3]}, long_description = ${values[4]}, tech = ${values[5]},
          repository_url = ${values[6]}, live_url = ${values[7]}, demo_url = ${values[8]},
          documentation_url = ${values[9]}, presentation_url = ${values[10]}, media_urls = ${values[11]},
          thumbnail_url = ${values[12]}, featured = ${values[13]}, status = ${values[14]},
          sort_order = ${values[15]}, accent = ${values[16]}, updated_at = now()
        WHERE id = ${id} RETURNING *
      `
    : await sql`
        INSERT INTO projects (
          title, slug, category, description, long_description, tech,
          repository_url, live_url, demo_url, documentation_url, presentation_url,
          media_urls, thumbnail_url, featured, status, sort_order, accent
        ) VALUES (
          ${values[0]}, ${values[1]}, ${values[2]}, ${values[3]}, ${values[4]}, ${values[5]},
          ${values[6]}, ${values[7]}, ${values[8]}, ${values[9]}, ${values[10]}, ${values[11]},
          ${values[12]}, ${values[13]}, ${values[14]}, ${values[15]}, ${values[16]}
        ) RETURNING *
      `;
  return rows[0] ? fromRow(rows[0] as Record<string, unknown>) : null;
}

export async function deleteProject(id: string) {
  const sql = db();
  if (!sql) throw new Error("DATABASE_URL is not configured.");
  const rows = await sql`DELETE FROM projects WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function getProjectCounts() {
  const sql = db();
  if (!sql) return { total: seedProjects.length, published: seedProjects.length, drafts: 0, featured: seedProjects.filter((project) => project.featured).length };
  const rows = await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'published')::int AS published,
      COUNT(*) FILTER (WHERE status = 'draft')::int AS drafts,
      COUNT(*) FILTER (WHERE featured = true AND status = 'published')::int AS featured
    FROM projects
  `;
  return rows[0] as { total: number; published: number; drafts: number; featured: number };
}

