import { z } from "zod";

export const userSchema = z.object({
  userId: z.string().min(1),
  email: z.email(),
  username: z.string().min(1),
  likedBlogs: z.array(z.string()).default([]),
});
export type User = z.infer<typeof userSchema>;
