import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Please tell us your name.").max(120),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().max(160).optional(),
  body: z.string().min(1, "Please write a message.").max(5000),
});
