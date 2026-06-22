import { z } from "zod";

export const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required.").max(200),
  slug: z.string().max(200).optional(),
  excerpt: z.string().max(400).optional(),
  categoryId: z.string().optional(),
  coverImage: z
    .string()
    .url("Cover image must be a valid URL.")
    .refine((u) => u.startsWith("https://"), "Cover image must use https.")
    .optional(),
  status: z.enum(["draft", "published"]),
  content: z
    .object({ type: z.literal("doc"), content: z.array(z.unknown()) })
    .passthrough(),
});
