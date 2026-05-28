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
export type ProjectLink = z.infer<typeof linkSchema>;

const stillSchema = z.object({
  url: optionalUrl,
  alt: z.string().default(""),
  label: z.string().default(""),
  kind: z.enum(["image", "video"]).default("image"),
});
export type ProjectStill = z.infer<typeof stillSchema>;

export const projectSchema = z.object({
  title: z.string(),
  dek: z.string().default(""),

  type: z.enum(["Personal", "Demo", "Freelance"]),
  status: z
    .enum(["shipped", "in-progress", "archived", "discontinued"])
    .default("shipped"),

  role: z.string().default(""),
  year: z.string().default(""),
  tag: z.string().default(""),

  metrics: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    )
    .default([]),
  skills: z.array(z.string()).default([]),
  links: z.array(linkSchema).default([]),
  stills: z.array(stillSchema).default([]),

  order: z.number().default(0),
  isActive: z.boolean().default(true),
});
export type Project = z.infer<typeof projectSchema>;

export const testimonialSchema = z.object({
  name: z.string(),
  company: z.string().default(""),
  period: z.string().default(""),
  rating: z.number().min(0).max(5),
  text: z.string().default(""),
  video: optionalUrl,
  avatar: optionalUrl,
  displaySlot: z.enum(["endorsement", "voices", "none"]).default("none"),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
});
export type Testimonial = z.infer<typeof testimonialSchema>;

export const serviceSchema = z.object({
  label: z.string().default(""),
  title: z.string(),
  desc: z.string().default(""),
  frameLabel: z.string().default(""),
  frameTitle: z.string().default(""),
  items: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
});
export type Service = z.infer<typeof serviceSchema>;

export const skillGroupSchema = z.object({
  title: z.string(),
  skills: z
    .array(
      z.object({
        name: z.string(),
        level: z.number().min(1).max(5),
      }),
    )
    .default([]),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
});
export type SkillGroup = z.infer<typeof skillGroupSchema>;

export const credentialSchema = z.object({
  title: z.string(),
  image: optionalUrl,
  link: optionalUrl,
  isActive: z.boolean().default(true),
  order: z.number().default(0),
});
export type Credential = z.infer<typeof credentialSchema>;

export const contactSchema = z.object({
  email: z.email(),
  phone: z.string().default(""),
  // Booking link shown in the footer's "Direct" column.
  calLabel: z.string().default(""),
  calUrl: optionalUrl,
  social: z
    .array(
      z.object({
        name: z.string(),
        url: z.url(),
        icon: z.string().default(""),
      }),
    )
    .default([]),
});
export type Contact = z.infer<typeof contactSchema>;

export const heroStatSchema = z.object({
  value: z.string(),
  label: z.string(),
  order: z.number().default(0),
});
export type HeroStat = z.infer<typeof heroStatSchema>;

export const pageDataSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  keywords: z.array(z.string()).default([]),
  profilePicture: optionalUrl,

  aboutText: z.string().default(""),
  heroStats: z.array(heroStatSchema).default([]),

  // Footer "Studio" column: identity line + (newline-separated) address.
  studioName: z.string().default(""),
  address: z.string().default(""),

  contact: contactSchema,

  projects: z.array(projectSchema).default([]),
  services: z.array(serviceSchema).default([]),
  testimonials: z.array(testimonialSchema).default([]),
  skills: z.array(skillGroupSchema).default([]),
  credentials: z.array(credentialSchema).default([]),
});
export type PageData = z.infer<typeof pageDataSchema>;

export const uploadFileInfoSchema = z.object({
  size: z.number().int().nonnegative(),
  type: z.string().min(1),
  path: z.string().min(1),
});
export type UploadFileInfo = z.infer<typeof uploadFileInfoSchema>;
export const uploadFileInfoArraySchema = z.array(uploadFileInfoSchema);
