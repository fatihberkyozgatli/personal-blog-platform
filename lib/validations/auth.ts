import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const emailSchema = z.object({
  email: z.string().email(),
});

export const passwordSchema = z.object({
  password: z.string().min(8),
});

export type Credentials = z.infer<typeof credentialsSchema>;
