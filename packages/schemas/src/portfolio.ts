import { z } from "zod";

// Optional URL field that also accepts empty string
const optionalUrl = z.url().or(z.literal("")).default("");

// One encoded variant of a video.
// - `type` is the container MIME for the <source type> attribute, e.g.
//   "video/webm" or "video/mp4".
// - `codec` is the optional `codecs=` parameter, e.g. 'avc1.42E01E, mp4a.40.2'
//   (H.264/AAC), "vp9", or "av01.0.05M.08". Splitting it out keeps the UI
//   simple; `videoSourceType` recombines the two into the real attribute.
// The browser reads the combined value to download only a source it can decode.
const videoSourceSchema = z.object({
  url: optionalUrl,
  type: z.string().default(""),
  codec: z.string().default(""),
  // Original upload filename, kept so each encoded source stays identifiable
  // in the editor once `url` becomes an opaque uploaded URL. Display-only.
  filename: z.string().default(""),
});
export type VideoSource = z.infer<typeof videoSourceSchema>;

// Build the value for a <source type> attribute from a VideoSource: the
// container MIME plus an optional codecs clause. Returns "" when no MIME is
// set (so callers can fall back to `undefined` and let the browser sniff).
export function videoSourceType(s: VideoSource): string {
  if (!s.type) return "";
  const codec = s.codec.trim();
  return codec ? `${s.type}; codecs="${codec}"` : s.type;
}

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
  // Encoded sources for a video still (browser picks the best codec it can
  // play). Only set when `kind === "video"`; images use `url`.
  sources: z.array(videoSourceSchema).optional(),
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
  video: z.array(videoSourceSchema).default([]),
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

export const resumeSchema = z.object({
  // Public URL of the uploaded PDF (empty until one is uploaded).
  url: optionalUrl,
  // Original filename, used as the download name on the portfolio CV button.
  filename: z.string().default(""),
});
export type Resume = z.infer<typeof resumeSchema>;

export const pageDataSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  keywords: z.array(z.string()).default([]),
  profilePicture: optionalUrl,
  // Resume / CV: uploaded PDF URL + original filename (used as the download
  // name on the portfolio's "Download CV" button).
  resume: resumeSchema.default({ url: "", filename: "" }),

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
