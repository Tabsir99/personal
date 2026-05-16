import { z } from "zod";

// Optional URL field that also accepts empty string
const optionalUrl = z.url().or(z.literal("")).default("");

const linkSchema = z.object({
  text: z.string().default(""),
  url: optionalUrl,
  type: z
    .enum(["live", "repo", "case-study", "video", "other"])
    .default("other"),
});

const imageSchema = z.object({
  url: optionalUrl,
  alt: z.string().default(""),
});

export const projectSchema = z.object({
  title: z.string(),
  dek: z.string().default(""),

  type: z.enum(["Personal", "Demo", "Freelance"]),
  status: z
    .enum(["shipped", "in-progress", "archived", "discontinued"])
    .default("shipped"),

  image: optionalUrl,
  video: optionalUrl,
  gallery: z.array(imageSchema).default([]),

  links: z.array(linkSchema).default([]),
  skills: z.array(z.string()).default([]),
  metrics: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    )
    .default([]),

  role: z.string().default(""),
  year: z.string().default(""),

  featured: z.boolean().default(false),
  order: z.number().default(0),
  visible: z.boolean().default(true),

  // Metadata
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const testimonialSchema = z.object({
  name: z.string(),
  company: z.string().default(""),
  location: z.string().default(""),
  role: z.string().default(""),
  project: z.string().default(""),
  // NOTE: layout concern — consider moving to a display config eventually
  size: z.enum(["large", "medium", "small"]),
  rating: z.number().min(0).max(5),
  text: z.string().default(""),
  video: optionalUrl,
  isActive: z.boolean().default(true),
  avatar: optionalUrl,
  date: z.string().default(""), // free-form ("March 2024", "2024", etc.)
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
        level: z.number().min(1).max(5),
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
  link: optionalUrl,
  image: optionalUrl,
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
        url: z.url(), // required — if a social exists, the URL must be valid
        icon: z.string().default(""),
      }),
    )
    .default([]),
});

export const pageDataSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  keywords: z.array(z.string()).default([]),
  profilePicture: optionalUrl,
  stats: z.object({
    yearsExperience: z.number().int().nonnegative().default(0),
    projectsCompleted: z.number().int().nonnegative().default(0),
    jobSuccessRate: z.number().min(0).max(100).default(0),
    responseTime: z.string().default(""),
    happyClients: z.number().int().nonnegative().default(0),
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
