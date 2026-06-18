import { z } from "zod";

export const timelineEntrySchema = z.object({
  year: z.string().min(1, "Each timeline entry needs a year.").max(40),
  label: z.string().min(1, "Each timeline entry needs a label.").max(280),
});

export const aboutSchema = z.object({
  name: z.string().min(1, "Name is required.").max(120),
  short: z.string().max(400),
  portraitUrl: z.string().url("Portrait must be a valid URL.").max(2048).nullable(),
  intro: z.record(z.unknown()),
  bio: z.record(z.unknown()),
  why: z.record(z.unknown()),
  favoriteQuote: z.object({
    text: z.string().max(600),
    source: z.string().max(160),
  }),
  timeline: z.array(timelineEntrySchema).max(50),
});

export type AboutContent = z.infer<typeof aboutSchema>;
