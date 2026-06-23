import { z } from "zod";

const optionalHttpsUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => !value || value.startsWith("https://"), "Social links must use https.")
  .transform((value) => value || null);

export const contactSettingsSchema = z.object({
  email: z.string().trim().email("Email must be valid.").max(254),
  location: z.string().trim().max(180),
  instagramUrl: optionalHttpsUrl,
  youtubeUrl: optionalHttpsUrl,
});

export type ContactSettings = z.infer<typeof contactSettingsSchema>;
