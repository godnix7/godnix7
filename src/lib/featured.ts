// Case-study details for the three flagship projects (keyed by repo name).
export const featured: Record<string, { role: string; highlights: string[] }> = {
  MediLocker: {
    role: "Full-stack · Architecture",
    highlights: [
      "Encrypted document vault with per-patient access control",
      "QR-based record sharing between patients and hospitals",
      "Centralised hospital management on FastAPI + PostgreSQL",
    ],
  },
  Lynxis: {
    role: "Full-stack · AI orchestration",
    highlights: [
      "Multiple cooperating AI agents analyse a codebase end to end",
      "Interactive 3D visualisation of repository structure",
      "Node.js + Prisma backend orchestrating Anthropic models",
    ],
  },
  EventByte: {
    role: "Backend · Real-time",
    highlights: [
      "Live judging and scoring pushed to every screen over sockets",
      "Participant, team and round management for large events",
      "Django backend with a typed TypeScript client",
    ],
  },
};

export const capabilities = [
  {
    title: "Backend & APIs",
    text: "Secure, well-structured services with FastAPI, Django, Node.js and Fastify, backed by PostgreSQL, Redis and Elasticsearch.",
  },
  {
    title: "AI products",
    text: "Multi-agent workflows, NLP chatbots and computer-vision pipelines such as deepfake detection, taken from prototype to deployment.",
  },
  {
    title: "Interactive frontends",
    text: "Fast React and Next.js interfaces with real-time data, motion and 3D where it helps the product.",
  },
];

// Real screenshots of the live sites (public/shots), keyed by repo name.
export const shots: Record<string, string> = {
  MediLocker: "/shots/medilocker.png",
  Lynxis: "/shots/lynxis.png",
  EventByte: "/shots/eventbyte.png",
  LocalMusic: "/shots/localmusic.png",
  Althea: "/shots/althea.png",
  "harvest-club": "/shots/harvest.png",
};
