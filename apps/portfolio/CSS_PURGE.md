# CSS / Tailwind / JSX Purge — Report

## Environment & honesty note

**No browser available** — the sandbox has no Chrome/Chromium and the
runtime asked me to skip visual verification. **Every change in this pass
is static-analysis only.** I removed redundancies that have a clear CSS
spec / Tailwind semantics explanation; I did not flatten anything whose
layout effect I could not reason about from the source. Visual review by
a human in front of an actual browser is still required before this lands.

Additionally:
- The dev server could not start (`pnpm install` fails — workspace dep
  `@tabsircg/schemas` is missing under that resolver, and node_modules has
  a different layout than pnpm expects), so I could not even render the
  page headlessly.
- `tsc` could not run either (typescript binary not resolvable from this
  shell). Sanity-checking was limited to file-level brace/paren balancing
  and grep-based reference checks.

## Summary

| Bucket | Before | After | Δ |
| --- | ---: | ---: | ---: |
| `src/**/*.tsx` (excl. `temp/`) | **4862** | **4519** | **-343 (-7.1%)** |
| `src/**/*.css` (excl. `temp/`) | **773** | **811** | **+38 (+4.9%)**¹ |
| Net SLOC in scope | **5635** | **5330** | **-305 (-5.4%)** |

¹ The CSS line count went **up** because I extracted three repeated utility
groups into new component classes (`.h-serif`, `.eyebrow`, `.em-accent`)
in `globals.css`. Those ~38 added CSS lines replace several hundred
inline utility chars across 8 tsx files. The wins in component files
more than make up for it (see "Per-file changes" below).

**The 50% target was not hit.** Most line counts in this codebase are
intrinsic (SVG markup in `service-visual.tsx` 329 → 329, `voices-player.tsx`
playback logic, `ScoreMeter.tsx` SVG + button state). Realistic upper
bound for safe static reduction here is ~10–15%, and even that would
need visual verification I couldn't run. Anything more aggressive would
mean restructuring the SVG components or moving the section-style
animations out of pure Tailwind, which is **out of scope** of a CSS purge.

### Reduction by category

| Category | Roughly |
| --- | --- |
| Multi-line `cn()` chains collapsed to single-line `className` strings | ~140 lines |
| Wrappers flattened / removed | ~15 lines |
| Repeated utility groups extracted to `.h-serif` / `.eyebrow` / `.em-accent` | ~30 lines (utility chars across files); +38 CSS |
| Redundant utilities removed (`gap-0`, `items-stretch`, `mx-0` on `<p>`, `w-X h-X` → `size-X`, `block` on absolute, etc.) | ~30 lines |
| Data-driving (atmosphere orbs as a tuple array, endorsement stars as `Array.from`) | ~25 lines |
| Stale CSS comment about a class that doesn't exist (`.term-card`) | comment edit only |
| Debug `console.log` in `active-section.tsx` | -1 line |

## Per-file changes (touched files only)

| File | Before | After | Δ | What changed |
| --- | ---: | ---: | ---: | --- |
| `src/app/globals.css` | 445 | 483 | **+38** | Added `.h-serif`, `.eyebrow`, `.em-accent` component classes |
| `src/components/portfolio/styles/terminal.css` | 38 | 38 | 0 | Stale `.term-card` comment fixed (referred to a class that doesn't exist) |
| `src/components/portfolio/atmosphere.tsx` | 105 | 86 | **-19** | Four nearly-identical orb `<div>`s collapsed to a tuple array + map. Orb gradient moved to inline `style.backgroundImage` so Tailwind JIT isn't asked to enumerate dynamic class strings. `left-0 right-0` → `inset-x-0`. `motion-reduce:animate-none` hoisted into shared `ORB` constant. |
| `src/components/portfolio/about.tsx` | 79 | 58 | **-21** | Eyebrow row replaced with `.eyebrow`. Several multi-line `cn()` chains collapsed. `cn` import removed (no longer used). |
| `src/components/portfolio/hero.tsx` | 218 | 160 | **-58** | Background gradient + wrapper div merged (was wrapper > div, both `absolute inset-0`). `flex flex-col gap-0` → `flex flex-col` (gap-0 is default). `items-stretch` removed (default). `mx-0` on `<p>` removed (default for `<p>`). Several `cn()` chains collapsed. Hero `<em>` italic-accent moved to `.em-accent`. `p-0` removed from `<section>` (default). |
| `src/components/portfolio/header.tsx` | 47 | 38 | **-9** | `cn()` chain collapsed to single-line className. `border-line` moved inline with rest of border. `h-[6px] w-[6px]` → `size-1.5`. `py-0` removed from nav (default). `cn` import removed. |
| `src/components/portfolio/footer.tsx` | 94 | 84 | **-10** | Eyebrow → `.eyebrow`. Heading utility chain → `.h-serif`. `cn` import removed. |
| `src/components/portfolio/voices.tsx` | 91 | 78 | **-13** | Heading chain → `.h-serif` + parent gets `.em-accent`. Empty `<span className="flex-1 max-xl:hidden">` spacer removed; verified-badge gets `ml-auto max-xl:ml-0` instead. `w-[14px] h-[14px]` → `size-3.5`. `cn` import removed. |
| `src/components/portfolio/stack.tsx` | 150 | 118 | **-32** | Multiple multi-line `cn()` chains collapsed. Heading chain → `.h-serif`. `w-1 h-1` → `size-1`. |
| `src/components/portfolio/writing.tsx` | 103 | 75 | **-28** | Heading chain → `.h-serif` (twice). Parent gets `.em-accent`. `cn()` chains collapsed. `cn` import removed. |
| `src/components/portfolio/now.tsx` | 131 | 117 | **-14** | Eyebrow → `.eyebrow`. Heading chain → `.h-serif`. `w-2 h-2` → `size-2`. `cn` import removed. |
| `src/components/portfolio/endorsement.tsx` | 171 | 102 | **-69** | Five identical `<span>★</span>` collapsed to `Array.from`. Eyebrow → `.eyebrow`. Several multi-line `cn()` chains collapsed. `w-4 h-4` → `size-4`. |
| `src/components/portfolio/services.tsx` | 177 | 173 | **-4** | Heading chain → `.h-serif`. Inline `style={{ margin: "0 6px" }}` etc → `mx-1.5` / `mx-2.5`. `style={{ position: "relative", zIndex: 2 }}` → `relative z-2`. `cn` import removed. (Could not safely consolidate the inner grid container with `.page-shell` without visual verification — flagged below.) |
| `src/components/portfolio/rail.tsx` | 65 | 45 | **-20** | The tick `cn()` chain extracted to `TICK_BASE` constant; multi-line cn calls collapsed. `w-2 h-2` → `size-2`. `cn` import removed. |
| `src/components/portfolio/terminal.tsx` | 149 | 142 | **-7** | Outer wrapper `cn()` chain collapsed. Three `w-2 h-2` → `size-2`. `cn` import removed. |
| `src/components/portfolio/voices-player.tsx` | 222 | 217 | **-5** | Frame wrapper `cn()` chain collapsed. (See "skipped" — the `block w-full h-full` on the `<video>` element looks redundant on an `absolute inset-0`, but I kept it to be safe.) |
| `src/components/portfolio/cursor-glow.tsx` | 55 | 51 | **-4** | `cn()` chain collapsed. `cn` import removed. |
| `src/components/portfolio/work/index.tsx` | 78 | 67 | **-11** | Section wrapper `cn()` collapsed. Anchor `cn()` collapsed. `items-stretch` removed (grid default). `cn` import removed. |
| `src/components/portfolio/work/list.tsx` | 61 | 53 | **-8** | Two `cn()` chains collapsed. |
| `src/components/portfolio/work/viewport.tsx` | 69 | 66 | **-3** | Outer single-child `<div className="flex flex-col gap-3.5">` wrapper removed (its sole child was the work-frame). The four corner-bracket spans had a shared core which is now `CORNER` constant. `w-5 h-5` → `size-5`. `cn` import removed. |
| `src/components/portfolio/work/meta.tsx` | 89 | 87 | **-2** | One `cn()` chain collapsed. Redundant `max-xl:col-start-1` removed (base already has `col-start-1`). |
| `src/components/Blog/Aside.tsx` | 124 | 127 | **+3** | Two identical "tape" decorations extracted to `TAPE` constant (this added a line for the constant but enabled cleaner JSX). `w-4 h-4` → `size-4`. |
| `src/components/Blog/PostRow.tsx` | 104 | 102 | **-2** | Empty `<div>` wrapper around the kind-badge `<span>` flattened (had no styling and no purpose — span sits directly in flex now). |
| `src/components/Blog/Filters.tsx` | 61 | 55 | **-6** | Single-child `<div className="flex justify-between …">` wrapper around `<h2>` flattened (only one child). Conditional `transition-colors duration-220` factored out of branches. `w-2.5 h-2.5` → `size-2.5`. |
| `src/components/Blog/FeaturedCard.tsx` | 106 | 106 | 0 | `p-10 px-11` → `py-10 px-11` (semantically identical, slightly cleaner). `mx-0` on `<h2>` removed (default for `<h2>` is no horizontal margin). |
| `src/components/ui/active-section.tsx` | 127 | 126 | **-1** | Debug `console.log(entries.filter((e) => e.isIntersecting))` removed. |

(Files listed have ≥ 1 substantive change. Files I didn't touch are
unchanged.)

## Visual verification log

**None.** No browser available. See note at top.

## Skipped / flagged for review

These were candidates I deliberately did NOT touch, with reasoning:

1. **`src/temp/` directory** — out of scope per explicit user instruction. It
   is reference material (a complete vanilla JSX prototype of the redesign,
   no imports from anywhere in the live tree, `tsconfig.json` excludes it).
   ~3000 lines of CSS/JSX live there. The original 50% target probably
   assumed it was in scope; with `temp/` excluded the achievable reduction
   is much smaller.

2. **`src/components/ui/legal-layout.tsx`** — the file's default export is a
   const named `LegalPage` even though the function declared above it is
   named `LegalLayout` (a different, unused function). The pages
   (`privacy/page.tsx`, `terms/page.tsx`, `refund-policy/page.tsx`) all import
   it as `LegalPage`. The naming is confusing but it works. I did not
   rename either symbol because I can't verify the `(legal)/layout.tsx`
   wrapper's full behavior without a browser.

3. **`<video>` element in `voices-player.tsx`** — has `absolute inset-0 w-full
   h-full block`. By CSS spec §10.6.4, an absolutely positioned **replaced**
   element with `width: auto`/`height: auto` and all four offsets resolved
   uses its **intrinsic** width/height, NOT the resolved offsets. So
   `w-full h-full` is **not** redundant on a `<video>` (replaced) the way it
   would be on a `<div>` (non-replaced). I removed only `block` from one
   attempt then reverted because the safer thing is to keep all three.

4. **`services.tsx` inner grid container at line 73** — its utilities
   (`mx-auto w-full max-w-(--max-w) pr-(--gutter) pl-(--rail-gutter)`)
   exactly duplicate `.page-shell`. But this div sits inside a flex
   container with `items-center`, and `.page-shell` adds `position:
   relative`. I'm 90% confident the swap is safe but the section is the
   pinned-scroll choreography piece — visual breakage here would be very
   visible. Flagged for human review.

5. **Long inline `bg-[radial-gradient(...)]` / `bg-[linear-gradient(...)]`
   utility strings** in `atmosphere.tsx`, `hero.tsx`, `work/index.tsx`,
   `service-visual.tsx`, `voices-player.tsx`, etc. These are arbitrary-value
   Tailwind utilities with literal CSS inside `[]`. They look ugly but
   they're each unique to one element. Extracting them to `@layer
   components` rules in CSS would save a few characters per call site but
   double the surface area (utility name + CSS rule must stay in sync).
   I left them as-is.

6. **`section { position: relative }` in `@layer base`** — already declared
   in `globals.css`. Several `<section>` elements still carry `relative`
   explicitly, which is now redundant. I left them — the explicit
   utility documents intent and removing it is more likely to confuse than
   help. Cheap to keep.

7. **`atmosphere.tsx` orbs animation strings** — these are dynamic from
   the perspective of the `<div>` className (passed as elements of a
   tuple), but each value (`animate-atm-orb-drift-a`, etc.) appears as a
   **literal string** elsewhere in the source array. Tailwind v4's
   built-in scanner detects literal strings in source regardless of how
   they get assembled into `className`. Confirmed safe. (The orb gradient
   IS dynamic per-orb, which is why that one moved to inline style.)

8. **Most multi-line `cn()` calls in the components/Blog/ tree** — many
   could be collapsed to one-liners with no semantic change, but I only
   did this where the chain was short enough to remain readable. Some
   chains (notably in `PostFooter.tsx`, `PostHeader.tsx`, `Share.tsx`,
   `ScoreMeter.tsx`) have 5+ lines each — collapsing them to one
   200-character line would make diffs harder to read for future review.
   Left as-is.

9. **The `display` heading utility class** in `globals.css` already
   exists and has slightly different line-height/letter-spacing from the
   new `.h-serif`. I did not consolidate the two — they're used in
   different places intentionally (`display` is used by the work-list
   title; `.h-serif` replaces the `font-serif font-normal tracking-tight
   font-features-['liga','kern']` chain on h2 elements). Merging would
   risk subtle layout changes.

## Dead code I found but did NOT remove

These need a yes/no from a human before deletion:

- **`src/components/ui/legal-layout.tsx`** — declares an unused, never-imported
  `LegalLayout` function (just the constant `LegalPage` is exported). Could
  be deleted, but only with confirmation that no other branch / planned
  feature uses it.

- **`src/temp/` (~3000 lines)** — entirely unimported reference material.
  Marked out of scope by user.

- The `react-scan` script tag in `layout.tsx:73` runs only in development,
  but it is loaded from a public CDN. Not dead code; just calling it out
  because someone reviewing the report should be aware.

## Open questions

1. **Is the `.page-shell` swap in `services.tsx` (skip #4 above) safe to
   do?** I think yes; would need a 30-second visual check on the
   pinned-scroll section at desktop + tablet.

2. **Is `src/components/ui/legal-layout.tsx`'s confusing naming
   intentional, or is it a leftover from a refactor?** If the latter, I'd
   rename the export and delete the dead `LegalLayout` function in the
   same pass.

3. **The 50% reduction target** — based on this audit, I think the
   achievable reduction is realistically 5–10% under the constraint
   "don't break the UI and don't restructure SVG components." Hitting
   50% would require either:
   - including `src/temp/` (which has ~3000 lines of unreferenced
     reference material that could be deleted wholesale), or
   - rewriting `service-visual.tsx`, `voices-player.tsx`, and `ScoreMeter.tsx`
     against shared SVG primitives, which is a different kind of work
     from a CSS purge.

   If "include temp/" gets the green light, total reduction jumps
   immediately to ~50% — but only because we're deleting an entire
   directory of unused code, not because we made any individual file
   leaner.
