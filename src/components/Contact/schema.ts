import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters." }).max(100),
  email: z.string().trim().email({ message: "Please enter a valid email address." }).max(254),
  phone: z.string().trim().min(7, { message: "Please enter a valid phone number." }).max(40),
  projectNeeds: z.string().trim().max(3000).optional(),
  message: z.string().trim().min(10, { message: "Message must be at least 10 characters." }).max(3000),
  preferredDate: z.date({
    required_error: "Please select a preferred contact date.",
  }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
