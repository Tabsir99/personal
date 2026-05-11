// Toggle individual collection seeding. Flip a flag to `false` to skip writing
// that collection; everything else still runs.
//
// Dependency notes (mostly informational — each seeder is independent at the
// I/O layer, but the data lines up only when run together):
//   - `blogs` derives its `stats.views` from the simulator output, which uses
//     the slug list from `blogContent.ts`. If `blogs: false`, no blog docs are
//     touched; existing blog views in Firestore won't be updated to match.
//   - `validLinks` writes the slug list from `blogContent.ts` — independent of
//     whether blog docs are actually written this run.
//   - `analytics` writes traffic for blog post pages using slugs from
//     `blogContent.ts`. If you disable `blogs` but keep `analytics`, the
//     resulting page metrics reference slugs that may not exist as documents.
export const SEED = {
  config: true,
  blogs: true,
  validLinks: true,
  analytics: true,
} as const;
