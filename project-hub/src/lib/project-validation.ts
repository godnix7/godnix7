import { z } from "zod";

const safeUrl = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}, "Use a valid HTTPS URL.");

export const projectInputSchema = z.object({
  title: z.string().trim().min(2).max(100),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  category: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(280),
  longDescription: z.string().trim().min(10).max(8000),
  tech: z.array(z.string().trim().min(1).max(40)).max(20),
  repository: safeUrl,
  liveUrl: safeUrl,
  demoUrl: safeUrl,
  documentationUrl: safeUrl,
  presentationUrl: safeUrl,
  mediaUrls: z.array(safeUrl).max(12),
  thumbnailUrl: safeUrl,
  featured: z.boolean(),
  status: z.enum(["draft", "published"]),
  sortOrder: z.number().int().min(0).max(9999),
  accent: z.enum(["citrus", "violet", "coral", "blue", "lavender", "amber", "mint"]),
});
