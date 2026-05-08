import { z } from "zod/v4";

const linkSchema = z.object({
  text: z.string().default(""),
  url: z.string().default(""),
});

export const projectSchema = z.object({
  image: z.string().default(""),
  title: z.string(),
  type: z.enum(["Personal", "Demo", "Freelance"]),
  description: z.string().default(""),
  link1: linkSchema,
  link2: linkSchema,
  skills: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  metrics: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    )
    .default([]),
  isActive: z.boolean().default(true),
  year: z.string().default(""),
  duration: z.string().default(""),
  role: z.string().default(""),
  clientType: z.string().default(""),
});

export const testimonialSchema = z.object({
  name: z.string(),
  company: z.string().default(""),
  location: z.string().default(""),
  role: z.string().default(""),
  project: z.string().default(""),
  size: z.enum(["large", "medium", "small"]),
  rating: z.number(),
  text: z.string().default(""),
  video: z.string().default(""),
  isActive: z.boolean().default(true),
  avatar: z.string().default(""),
  date: z.string().default(""),
  projectDuration: z.string().default(""),
  projectBudget: z.string().default(""),
  featured: z.boolean().default(false),
});

export const skillGroupSchema = z.object({
  title: z.string(),
  icon: z.string().default(""),
  skills: z
    .array(
      z.object({
        name: z.string(),
        level: z.number(),
        icon: z.string().default(""),
      }),
    )
    .default([]),
  isActive: z.boolean().default(true),
});

export const credentialSchema = z.object({
  title: z.string(),
  issuer: z.string().default(""),
  date: z.string().default(""),
  description: z.string().default(""),
  link: z.string().default(""),
  image: z.string().default(""),
  isActive: z.boolean().default(true),
});

export const serviceSchema = z.object({
  title: z.string(),
  content: z.string().default(""),
  icon: z.string().default(""),
  isActive: z.boolean().default(true),
});

export const contactSchema = z.object({
  email: z.email(),
  social: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        icon: z.string().default(""),
      }),
    )
    .default([]),
});

export const pageDataSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  keywords: z.array(z.string()).default([]),
  profilePicture: z.string().default(""),
  stats: z.object({
    yearsExperience: z.number().default(0),
    projectsCompleted: z.number().default(0),
    jobSuccessRate: z.number().min(0).max(100).default(0),
    responseTime: z.string().default(""),
    happyClients: z.number().default(0),
  }),
  projects: z.array(projectSchema).default([]),
  testimonials: z.array(testimonialSchema).default([]),
  about: z.array(z.string()).default([]),
  skills: z.array(skillGroupSchema).default([]),
  credentials: z.array(credentialSchema).default([]),
  contact: contactSchema,
  services: z.array(serviceSchema).default([]),
});
export type PageData = z.infer<typeof pageDataSchema>;

export const uploadFileInfoSchema = z.object({
  size: z.number().int().nonnegative(),
  type: z.string().min(1),
  path: z.string().min(1),
});
export type UploadFileInfo = z.infer<typeof uploadFileInfoSchema>;

export const uploadFileInfoArraySchema = z.array(uploadFileInfoSchema);
