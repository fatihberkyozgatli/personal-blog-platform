import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required.").max(120),
  icon: z.string().max(60).optional(),
});
