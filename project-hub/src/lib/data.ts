export const profile = {
  name: "Nischay Venkatesh Kademane",
  short: "Nischay",
  role: "Backend & AI engineer",
  email: "nischaykademane2006@gmail.com",
  github: "https://github.com/godnix7",
  githubUser: "godnix7",
  linkedin: "https://www.linkedin.com/in/nischaykademane/",
  x: "https://x.com/NISCHAYKADEMANE",
};

export type Project = {
  repo: string;
  title: string;
  kicker: string;
  blurb: string;
  tech: string[];
  live?: string;
};

// Curated copy for repos on github.com/godnix7. Stars / language / last push are
// refreshed from the GitHub API at build + hourly revalidation (see lib/github.ts).
export const projects: Project[] = [
  {
    repo: "MediLocker",
    title: "MediLocker",
    kicker: "Zero-trust health records",
    blurb:
      "A medical safe vault and centralized hospital system: encrypted document storage, QR-based record sharing and hospital-side management.",
    tech: ["FastAPI", "PostgreSQL", "AWS S3", "Redis"],
    live: "https://medilocker-main.vercel.app/",
  },
  {
    repo: "Lynxis",
    title: "Lynxis",
    kicker: "Multi-agent code intelligence",
    blurb:
      "Point it at a codebase and a team of AI agents analyses, explains and answers questions about it, with a 3D map of the repo.",
    tech: ["Node.js", "Prisma", "Three.js", "Anthropic"],
    live: "https://lynxis.vercel.app",
  },
  {
    repo: "EventByte",
    title: "EventByte",
    kicker: "Hackathon operations",
    blurb:
      "Real-time judging, scoring and event tracking for large competitions, pushed to every screen over sockets.",
    tech: ["Django", "TypeScript", "Socket.io", "TanStack Query"],
    live: "https://event-byte.vercel.app",
  },
  {
    repo: "Deepfake-detection",
    title: "Deepfake Detection",
    kicker: "Video forensics",
    blurb: "Detects and classifies AI-generated deepfake videos.",
    tech: ["Python", "Computer vision", "Deep learning"],
  },
  {
    repo: "LocalMusic",
    title: "LocalMusic",
    kicker: "Audio streaming",
    blurb:
      "A personal music streaming platform with admin-controlled subscriptions and fast search.",
    tech: ["Fastify", "Elasticsearch", "Redis", "WebSockets"],
    live: "https://localmusic-three.vercel.app",
  },
  {
    repo: "Althea",
    title: "Althea",
    kicker: "Emotional support",
    blurb: "A mental-health chatbot for day-to-day life, lightweight and always available.",
    tech: ["Python", "NLP", "Vercel"],
    live: "https://althea-gamma.vercel.app",
  },
  {
    repo: "harvest-club",
    title: "Harvest Club",
    kicker: "Community platform",
    blurb: "Newest build, shipped to production on Vercel.",
    tech: ["TypeScript", "Next.js"],
    live: "https://harvestclub.vercel.app",
  },
  {
    repo: "SIH-Internal",
    title: "SIH Internal",
    kicker: "Smart India Hackathon",
    blurb: "Internal-round build for Smart India Hackathon.",
    tech: ["TypeScript", "Next.js"],
  },
];

export const stack: { label: string; items: string[] }[] = [
  { label: "Languages", items: ["TypeScript", "Python", "JavaScript", "SQL"] },
  { label: "Backend", items: ["FastAPI", "Django", "Node.js", "Fastify", "Prisma"] },
  { label: "Frontend", items: ["React", "Next.js", "Three.js", "GSAP", "Tailwind"] },
  { label: "Data & infra", items: ["PostgreSQL", "Redis", "Elasticsearch", "Docker", "AWS"] },
];
