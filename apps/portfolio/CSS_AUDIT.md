# CSS Animation & Rules Audit

**Scope:** `src/app/globals.css` + the eight section CSS files under
`src/components/portfolio/styles/`.

**Method:** static analysis only. For each keyframe / utility / component
class I grepped every `.tsx`/`.ts`/`.css` file under `src/` for every
plausible reference form (JSX `animate-*` class, raw `animation:` CSS
rule, data-attribute selector, bare class name). Counts below are the
union of those refs.

**Verdict up top:** there is real fat to cut, but it's mostly
**dead aliases / dead keyframes / dead utilities**, not duplicated
animations. There are 5 truly identical or near-identical keyframe
clusters that can collapse to 2.

---

> **STATUS (May 2026 — post-migration).** The cuts in §8 and the merges
> in §9 (steps 1–3 + the §6.F drift parameterization) have landed. JSX
> call-sites are also fully migrated to the new alias names (the §1
> "old name → new alias" mapping is no longer relevant — every JSX file
> uses the new names). Sections 1–9 below are kept as historical
> reference. Newer content is at the bottom:
>
> - **§10** — accurate post-migration accounting (renames + deletions)
> - **§11** — two items from §9 deliberately held back (visual-review-needed)
> - **§12** — JSX-side dedup audit (new — broader scan beyond the original CSS plan)

---

## 1. `globals.css` — `@theme` animation aliases (lines 64–94)

Each `--animate-{name}` line is just a JSX-side alias — it lets a
component write `animate-foo` and have Tailwind resolve it to the full
`animation: foo …` shorthand. Removing an alias only removes the JSX
utility; the underlying `@keyframes` is unaffected.

| Alias | Resolves to | JSX `animate-*` refs | Status |
| --- | --- | --- | --- |
| `--animate-pulse-soft` | `pulse 1.5s ease-in-out infinite` | `header.tsx:33` | **1 use** |
| `--animate-pulse-slow` | `pulse 1.6s ease-in-out infinite` | — | **DEAD ALIAS** |
| `--animate-header-in` | `header-in 0.7s var(--ease-soft) forwards 0.05s` | `header.tsx:8` | 1 use |
| `--animate-rail-in` | `rail-in 0.9s var(--ease-soft) forwards 0.1s` | `rail.tsx:17` | 1 use |
| `--animate-rail-breath` | `rail-breath 2.4s ease-in-out infinite` | `rail.tsx:40` | 1 use |
| `--animate-hero-rise` | `hero-rise 0.9s var(--ease-soft) forwards` | `hero.tsx:56`, `:81`, `:88` | 3 uses |
| `--animate-hero-fade` | `hero-fade 0.9s ease forwards` | `hero.tsx:101`, `:110` | 2 uses |
| `--animate-hero-foot-bob` | `hero-foot-bob 2.4s ease-in-out infinite` | — | **DEAD ALIAS** (also dead keyframe — see §3) |
| `--animate-term-fade-up` | `fade-up 0.9s var(--ease-soft) forwards 0.85s` | `terminal.tsx:87` | 1 use |
| `--animate-term-pulse-dot` | `term-pulse-dot 2s ease-in-out infinite` | `terminal.tsx:94` | 1 use |
| `--animate-term-cursor-blink` | `term-cursor-blink 1s steps(2) infinite` | `terminal.tsx:112`, `:127` | 2 uses |
| `--animate-term-scan` | `term-scan 4.4s linear infinite` | `terminal.tsx:137` | 1 use |
| `--animate-atm-far-breathe` | `atm-far-breathe 22s ease-in-out infinite` | `contour-svg.tsx:38` | 1 use |
| `--animate-atm-orb-drift-a` | `atm-orb-drift-a 28s ease-in-out infinite` | `atmosphere.tsx:16` (+ `:19` via arbitrary `animate-[atm-orb-drift-a_…_reverse]`) | 1 alias use + 1 raw-keyframe reuse |
| `--animate-atm-orb-drift-b` | `atm-orb-drift-b 34s ease-in-out infinite` | `atmosphere.tsx:17` | 1 use |
| `--animate-atm-orb-drift-c` | `atm-orb-drift-c 40s ease-in-out infinite` | `atmosphere.tsx:18` | 1 use |
| `--animate-vp-wipe` | `vp-wipe 620ms var(--ease-soft)` | — | **DEAD ALIAS** — keyframe IS used, but via raw `animation: vp-wipe …` in `work.css:96` |
| `--animate-ring-pulse` | `ring-pulse 2.4s ease-in-out infinite` | `work/project-still.tsx:81` | 1 use |
| `--animate-ken-burns` | `ken-burns 14s ease-in-out infinite alternate` | — | **DEAD ALIAS** — keyframe IS used, but via raw `animation: ken-burns …` in `work.css:69` |
| `--animate-voices-fade` | `voices-fade 0.4s ease forwards` | `voices-player.tsx:170` | 1 use |
| `--animate-blog-rise` | `blog-rise 0.9s var(--ease-blog) forwards` | `Blog/PageTitle.tsx:27`, `:37` | 2 uses |
| `--animate-blog-dot-bounce` | `blog-dot-bounce 2.4s 1.4s …` | `Blog/PageTitle.tsx:31` | 1 use |
| `--animate-blog-spin` | `blog-spin 14s linear infinite` | — | **DEAD ALIAS** (keyframe also dead — see §3) |
| `--animate-blog-bar` | `blog-bar 2.4s ease-in-out infinite` | `Blog/FeaturedCard.tsx:42` | 1 use |
| `--animate-blog-shrink` | `blog-shrink 4s ease-in-out infinite` | `Blog/FeaturedCard.tsx:54` | 1 use |
| `--animate-post-bar-fill` | `post-bar-fill 1.2s 0.2s var(--ease-blog) both` | `Blog/post/PostHeader.tsx:88` | 1 use |
| `--animate-score-pulse` | `score-pulse 0.52s var(--ease-blog) forwards` | `Blog/post/ScoreMeter.tsx:140` | 1 use |
| `--animate-score-burst` | `score-burst 0.7s var(--ease-blog) forwards` | `Blog/post/ScoreMeter.tsx:178` | 1 use |

**Dead aliases to remove** (utility never appears in any source file):

- `--animate-pulse-slow`
- `--animate-hero-foot-bob`
- `--animate-vp-wipe`
- `--animate-ken-burns`
- `--animate-blog-spin`

Removing these is risk-free — the JSX utility is unreferenced. For
`vp-wipe` and `ken-burns` the keyframe itself stays (used via raw
`animation:` in `work.css`); only the JSX alias is dead.

---

## 2. `globals.css` — `@keyframes` declared in @theme (lines 98–189)

These bodies are inside the `@theme` block but @keyframes are globally
scoped once parsed, so they resolve from anywhere.

| Keyframe | Used by (CSS rules + JSX `animate-*`) | Refs | Status |
| --- | --- | --- | --- |
| `pulse` | only via `--animate-pulse-soft` (→ `header.tsx:33`). `--animate-pulse-slow` resolves to it too but that alias is dead. | 1 effective use | Keep, but see §6.A for merge candidates |
| `blog-rise` | `--animate-blog-rise` → `PageTitle.tsx:27`, `:37` | 2 | Keep |
| `blog-dot-bounce` | `--animate-blog-dot-bounce` → `PageTitle.tsx:31` | 1 | Keep |
| `blog-spin` | none | **0 — DEAD KEYFRAME** | Delete |
| `blog-bar` | `--animate-blog-bar` → `FeaturedCard.tsx:42` | 1 | Keep |
| `blog-shrink` | `--animate-blog-shrink` → `FeaturedCard.tsx:54` | 1 | Keep |
| `post-bar-fill` | `--animate-post-bar-fill` → `PostHeader.tsx:88` | 1 | Keep |
| `score-pulse` | `--animate-score-pulse` → `ScoreMeter.tsx:140` | 1 | Keep, but see §6.E |
| `score-burst` | `--animate-score-burst` → `ScoreMeter.tsx:178` | 1 | Keep |

---

## 3. `globals.css` — reveal keyframes in `@layer components` (lines 343–402)

| Keyframe | Driven by selector | JSX uses (data-attr count) | Refs |
| --- | --- | --- | --- |
| `reveal-in` | `[data-reveal].is-in` | `about.tsx:21`, `endorsement.tsx:17`, `footer.tsx:8` & `:22`, `now.tsx:82`, `services.tsx:73`, `work/index.tsx:37`, `work/meta.tsx:11`, `Blog/InViewArticle.tsx:16` | 9 elements |
| `reveal-stagger-in` | `[data-reveal-stagger].is-in > *` | `now.tsx:93`, `writing.tsx:47`, `stack.tsx:73`, `work/list.tsx:12` | 4 elements |
| `word-on` | `[data-reveal-words].is-in .word` | `about.tsx:37` | 1 element |

The `ScrollObserver.tsx:24` observer attaches `is-in` to any element
with any of the three attributes.

These three keyframes are **structurally identical** to several others
in `@theme` — see §6.B.

---

## 4. `globals.css` — utility classes (`@utility` blocks)

| Utility | Defined at | Used at | Count |
| --- | --- | --- | --- |
| `section-pad` | line 248 | — | **0 — DEAD UTILITY** |
| `page-shell` | line 252 | `about.tsx:17`, `voices.tsx:13`, `footer.tsx:6`, `endorsement.tsx:19`, `writing.tsx:40`, `hero.tsx:42`, `stack.tsx:53`, `work/index.tsx:27`, `now.tsx:80`, `app/blog/page.tsx:59` | 10 |
| `text-highlight` | line 443 | `hero.tsx:102` (inline `[&_em]:text-highlight`) | 1 |
| `blog-marker` | line 462 | `Blog/PostRow.tsx:55` | 1 |
| `blog-dial` | line 478 | `Blog/post/ScoreMeter.tsx:132` | 1 |
| `box` | line 485 | — | **0 — DEBUG UTILITY** (`border: 1px solid red`) |

**Dead utilities to remove:** `section-pad`, `box`.

---

## 5. `globals.css` — component classes inside `@layer components`

| Class | Defined at | Used at | Count |
| --- | --- | --- | --- |
| `display` | line 260 | `work/list.tsx:31`, `work/project-still.tsx:49` | 2 |
| `h-serif` | line 271 | `services.tsx:99`, `ui/H2.tsx:11`, `writing.tsx:56` | 3 |
| `eyebrow` (`+ ::before`) | line 281 | `about.tsx:22`, `endorsement.tsx:24` | 2 |
| `em-accent em` | line 301 | `hero.tsx:86` & `:98`, `voices.tsx:20` & `:39`, `footer.tsx:9`, `writing.tsx:41`, `work/index.tsx:38` | 7 elements |
| `margin-note` (`+ ::before`) | line 309 | `stack.tsx:54`, `voices.tsx:14`, `about.tsx:19`, `work/index.tsx:31` | 4 |

All live. `display` and `h-serif` are near-duplicates — see §6.C.

---

## 6. Interchangeable / near-duplicate animations

Each cluster below has multiple keyframes producing essentially the same
visual effect. The "Effect" line describes what the merged form would do;
the "Change" line says how to collapse them.

### 6.A — Three single-line pulse loops (opacity oscillation)

| Keyframe | File | Body |
| --- | --- | --- |
| `pulse` | globals.css:98 | `0/100% { opacity: 1 }` `50% { opacity: 0.3 }` |
| `term-pulse-dot` | terminal.css:10 | `0/100% { opacity: 1 }` `50% { opacity: 0.45 }` |
| `rail-breath` | rail.css:7 | `0/100% { opacity: 1 }` `50% { opacity: 0.6 }` |

**Effect:** all three breathe the element's opacity from 1 down and
back. They differ only in (a) the min-opacity at the 50% mark
(0.30 / 0.45 / 0.60) and (b) duration (1.5s / 2s / 2.4s).

**Change:** keep only `pulse`. Replace `term-pulse-dot` and `rail-breath`
usages with `pulse` + an inline `--pulse-min` CSS var (or just accept
the 0.30 trough everywhere — the visual difference is barely
perceptible at the dot sizes these run on). Saves 2 keyframes.

Note: `--animate-pulse-slow` (1.6s) was probably introduced for one of
these merges and then never wired up. Dead.

### 6.B — Five rise-while-fade keyframes

| Keyframe | File | Body |
| --- | --- | --- |
| `hero-rise` | hero.css:5 | `to { opacity: 1; translate: 0 0; }` |
| `fade-up` (alias `term-fade-up`) | terminal.css:3 | `to { opacity: 1; translate: 0 0; }` |
| `blog-rise` | globals.css:108 | `to { opacity: 1; transform: translateY(0); }` |
| `reveal-in` | globals.css:343 | `from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); }` |
| `reveal-stagger-in` | globals.css:364 | `from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }` |

**Effect:** all five animate `opacity 0 → 1` together with a small
upward translate. Start offset varies (20–24px on the reveal pair,
0.4em / `translate-y-2` etc. on the others, set as the element's
*initial* state in JSX).

**Identical pair:** `hero-rise` and `fade-up` have byte-identical
keyframe bodies. One is redundant.

**Near-identical pair:** `reveal-in` and `reveal-stagger-in` differ by 4px
in their `from` block — collapse safely.

**`blog-rise` vs `hero-rise`:** different only in `transform: translateY()`
vs `translate:`. The comment at `hero.css:1` explains the `translate:`
choice — it's chosen so Tailwind's `translate-y-*` utility on the
target element composes correctly instead of being clobbered. So
`blog-rise` could be rewritten the same way and merged, IF the blog
targets don't carry a `translate-*` utility (`PageTitle.tsx:27,37` use
`translate-y-10` and `translate-y-5`, so yes, the same composition
concern applies — they'd actually benefit from the `translate:` form).

**Change:** define one shared `rise-in` keyframe (the hero-rise body),
delete `fade-up`, `blog-rise`, `reveal-in`, `reveal-stagger-in`. Keep
the per-use timing (`var(--ease-soft)` for hero/term/reveal,
`var(--ease-blog)` for blog) — that lives on the `animation` shorthand,
not the keyframe. Saves 4 keyframes.

Edge case: `reveal-in` and `reveal-stagger-in` declare `from`
explicitly (24px / 20px) so the animation works even if the element's
inline initial state isn't set. If you merge them into `hero-rise`'s
`to`-only form, you must keep the initial-state declarations that
already exist at `globals.css:354` and `:375` (the `[data-reveal]` and
`[data-reveal-stagger] > *` rules that set `opacity: 0;
transform: translateY(24px);`). They're already there — no work needed.

### 6.C — Two opacity-only fades

| Keyframe | File | Body |
| --- | --- | --- |
| `hero-fade` | hero.css:12 | `to { opacity: 1; }` |
| `voices-fade` | voices.css:1 | `to { opacity: 1; }` |
| `rail-in` | rail.css:1 | `to { opacity: 1; }` |

**Effect:** plain opacity fade-in to 1. Byte-identical keyframe bodies.
Only the `animation` shorthand differs (durations 0.4s / 0.9s, delay
0.1s on rail-in).

**Change:** define one `fade-in` keyframe, delete the other two.
Per-use timing stays on the shorthand. Saves 2 keyframes.

### 6.D — Two serif heading utilities

| Class | File | Body |
| --- | --- | --- |
| `display` | globals.css:260 | `font-family: var(--serif); font-weight: 400; line-height: 0.96; letter-spacing: -0.02em;` |
| `h-serif` | globals.css:271 | `font-family: var(--serif); font-weight: 400; letter-spacing: -0.025em;` |

**Effect:** both apply the serif display face at normal weight with
tight tracking. Differences: `display` sets `line-height: 0.96` and
tracking `-0.02em`; `h-serif` omits line-height and uses `-0.025em`.

Per the prior `CSS_PURGE.md` note (line 159) these were left split
because of a concern about "subtle layout changes." But both are used
exclusively on big serif text; in practice the difference is 0.005em of
letter-spacing. They could collapse to one if the two `display`
consumers (`work/list.tsx:31`, `project-still.tsx:49`) tolerate the
slightly looser tracking, or one if `h-serif` consumers tolerate the
explicit line-height. Worth visual-checking, not blind-merging.

### 6.E — Three "ring expands and fades" effects

| Keyframe | File | Body |
| --- | --- | --- |
| `ring-pulse` | work.css:6 | `0/100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.18); opacity: 0.15; }` |
| `score-pulse` | globals.css:167 | `0% { box-shadow: 0 0 0 0 accent55%; } 100% { box-shadow: 0 0 0 18px accent0%; }` |

**Effect:** both produce an expanding-ring-that-fades visual. Their
implementations differ: `ring-pulse` scales a positioned span,
`score-pulse` grows a box-shadow. The shapes the rings sit on are
different too (one is `<span border rounded-full>`, the other is a
button).

**Change:** these are NOT interchangeable as keyframes — the underlying
property is different — but they ARE the same visual idiom. If you're
willing to standardize on the box-shadow approach you can delete
`ring-pulse` and rewrite `project-still.tsx:81`'s ring as a shadow on a
sized empty span (saves the extra DOM node for the border too). Not a
free swap — visual diff possible at the very edge of the ring.

### 6.F — Three orb drift loops

| Keyframe | File | Body |
| --- | --- | --- |
| `atm-orb-drift-a` | atmosphere.css:6 | `50% { translate(40px, -30px) scale(1.08) }` |
| `atm-orb-drift-b` | atmosphere.css:11 | `50% { translate(-50px, 40px) scale(0.92) }` |
| `atm-orb-drift-c` | atmosphere.css:16 | `33%/66%` two-step variant |

**Effect:** all three are slow drift loops on background orbs — each
floats around its origin and gently breathes scale. The deltas (a/b/c)
were picked to keep the three orbs from synchronizing visually.

`atmosphere.tsx:19` already reuses `atm-orb-drift-a` reversed
(`animate-[atm-orb-drift-a_32s_ease-in-out_infinite_reverse]`), which
proves a single keyframe can stand in for two orbs with `reverse` /
duration variation.

**Change (optional):** these are *intentionally* slightly different to
de-sync the orbs. You could collapse to one keyframe driven by CSS
vars (`--drift-x: 40px; --drift-y: -30px; --drift-scale: 1.08;`) and
parameterize per-orb. That removes 2 keyframes at the cost of one
indirection. Lower priority than the cuts in §6.A–C.

### 6.G — `term-cursor-blink` is unique enough

`term-cursor-blink` uses `steps(2)` timing for the hard on/off blink —
visually distinct from the smooth pulses in §6.A. Keep.

### 6.H — `atm-far-breathe` is unique enough

It combines scale, translateY, and opacity. Different enough from the
pulses and the orb drifts. Keep.

### 6.I — `term-scan` vs `vp-wipe`

Both translate down the Y-axis but the effects differ materially
(`term-scan` runs forever linearly with no fade; `vp-wipe` runs once
with opacity in/out and exits at `+100%`). Keep both.

### 6.J — `hero-foot-bob` — dead anyway

Defined in `hero.css:18`, aliased in `globals.css:71`. Grep shows zero
references in JSX. Dead. Delete keyframe + alias.

---

## 7. Per-file summary

### `src/app/globals.css`

Imports five styles (atmosphere/rail/header for persistent UI, plus
hero/terminal/services/work/voices for sections). Owns:

- 23 `--animate-*` aliases (5 dead — see §1)
- 9 `@keyframes` inside `@theme` (`pulse` + 8 blog/score; `blog-spin` dead)
- 3 reveal keyframes inside `@layer components` (`reveal-in`,
  `reveal-stagger-in`, `word-on`) — see §3
- 6 `@utility` classes (`section-pad` dead, `box` dead, see §4)
- 5 component classes (all live, but `display`/`h-serif` overlap — §6.D)
- Base styles, `@theme inline` font tokens, responsive var overrides

### `src/components/portfolio/styles/atmosphere.css`

- 4 keyframes (`atm-far-breathe`, `atm-orb-drift-a/b/c`) — all used,
  but a/b/c are reducible (§6.F)
- 4 component classes inside `@layer components`:
  - `.atm-far` / `.atm-mid` / `.atm-near` — parallax planes; used in
    `atmosphere.tsx:58/66/77`
  - `.atm-tint` — used in `atmosphere.tsx:63`; driven by
    `html[data-active-section]` attribute (6 selector branches)
  - `.atm-grain` — used in `atmosphere.tsx:82`

### `src/components/portfolio/styles/header.css`

- 1 keyframe: `header-in` — used via alias once (`header.tsx:8`)

### `src/components/portfolio/styles/hero.css`

- 3 keyframes:
  - `hero-rise` — 3 uses (§6.B candidate)
  - `hero-fade` — 2 uses (§6.C candidate)
  - `hero-foot-bob` — **0 uses — DEAD**

### `src/components/portfolio/styles/rail.css`

- 2 keyframes:
  - `rail-in` — 1 use (§6.C candidate)
  - `rail-breath` — 1 use (§6.A candidate)

### `src/components/portfolio/styles/services.css`

- 0 keyframes. All-component-classes file.
- 5 component classes (`.svc-label`, `.svc-title`, `.svc-desc`,
  `.svc-frame`, `.svc-bar-fill`) — all used in `services.tsx`
- All animation is CSS `transition` driven by numeric vars
  (`--pin-step`, `--pin-sub`, `--i`). No `@keyframes` to audit.

### `src/components/portfolio/styles/terminal.css`

- 4 keyframes:
  - `fade-up` — 1 use (§6.B candidate — identical to `hero-rise`)
  - `term-pulse-dot` — 1 use (§6.A candidate)
  - `term-cursor-blink` — 2 uses (keep, §6.G)
  - `term-scan` — 1 use (keep)

### `src/components/portfolio/styles/voices.css`

- 1 keyframe: `voices-fade` — 1 use (§6.C candidate)
- 1 component class `.voices-frame` (scroll-driven scale) — used in
  `voices.tsx`

### `src/components/portfolio/styles/work.css`

- 3 keyframes:
  - `vp-wipe` — used directly via `animation: vp-wipe …` in `.work-frame::after`
    (work.css:96). JSX alias dead.
  - `ring-pulse` — 1 use (§6.E candidate)
  - `ken-burns` — used directly via `animation: ken-burns …` in `.work-still::before`
    (work.css:69). JSX alias dead.
- Many component classes (`.work-row`, `.work-still`, `.work-meta`,
  `.work-thumb-pack`, `.work-still-meta`, `.work-still-play`,
  `.work-thumb`, `.work-meta-stack`, `.work-frame`, `.row-title`,
  `.row-meta`, `.row-rule`, `.row-glyph`) — all used.

---

## 8. Minimum-risk cut list

If you want only the no-judgment-calls deletions, this is the set:

1. **Delete dead JSX aliases** in `globals.css` (§1):
   - `--animate-pulse-slow`
   - `--animate-hero-foot-bob`
   - `--animate-vp-wipe`  *(keyframe stays)*
   - `--animate-ken-burns`  *(keyframe stays)*
   - `--animate-blog-spin`
2. **Delete dead keyframes**:
   - `hero-foot-bob` in `hero.css`
   - `blog-spin` in `globals.css` (lines 133–137)
3. **Delete dead `@utility` blocks** in `globals.css`:
   - `section-pad`
   - `box` (the `border: 1px solid red` debug helper)

All eight of these are unreferenced. Removing them changes no rendered
pixel.

## 9. Merge-and-save cut list (visual review recommended)

If you want to go further, in order of safety:

1. **Merge §6.C fades** (`hero-fade`, `voices-fade`, `rail-in` → one
   `fade-in`). Bodies are byte-identical. **Risk: none.** Saves 2
   keyframes.
2. **Merge §6.B rises** (`hero-rise`, `fade-up`, `reveal-in`,
   `reveal-stagger-in`, optionally `blog-rise` → one `rise-in`).
   Bodies differ only by which property they animate (`translate:` vs
   `transform: translateY()`) and start-offset. **Risk: low** if you
   pick the `translate:` form, as discussed in §6.B. Saves 3–4 keyframes.
3. **Merge §6.A pulses** (`pulse`, `term-pulse-dot`, `rail-breath` →
   one `pulse` with shared trough). **Risk: low**, possible barely-perceptible
   dimming change on the terminal dot and rail orb. Saves 2 keyframes.
4. **Consolidate `display` and `h-serif`** (§6.D) — one serif heading
   class. **Risk: low-medium**, a 0.005em tracking shift on big serif text.
   Visual diff is small but real.
5. **Collapse `atm-orb-drift-a/b/c` to one parameterized keyframe**
   (§6.F). **Risk: low** but adds indirection (each orb needs its own
   `--drift-x/y/scale` vars). Saves 2 keyframes.
6. **Unify ring vs box-shadow ring pulse** (§6.E) — `ring-pulse` →
   `score-pulse` style. **Risk: medium**, visible at ring edges. Skip
   unless you're already touching that file.

After steps 1–3, total `@keyframes` count drops from **24 → 17** with
no observable rendering change.

---

## 10. Post-migration accounting

This is what actually landed. Use this section, not §1–§9, if you want
to know the *current* state.

### 10.A — Renames

All `@theme` animation aliases were renamed to generic effect-named
forms. Old → new:

| Old | New |
| --- | --- |
| `--animate-pulse-soft` | `--animate-pulse` (also absorbs `pulse-slow`'s niche) |
| `--animate-hero-rise`, `--animate-term-fade-up`, `--animate-blog-rise` | `--animate-rise-in` |
| `--animate-hero-fade`, `--animate-voices-fade`, `--animate-rail-in` | `--animate-fade-in` |
| `--animate-term-cursor-blink` | `--animate-blink` |
| `--animate-term-scan` | `--animate-scan` |
| `--animate-atm-far-breathe` | `--animate-breathe` |
| `--animate-atm-orb-drift-{a,b,c}` | `--animate-drift` (one keyframe, parameterized via `--drift-x/--drift-y/--drift-s`) |
| `--animate-ring-pulse` | `--animate-expand-pulse` |
| `--animate-vp-wipe` | `--animate-wipe` |
| `--animate-blog-bar` | `--animate-bar-pulse` |
| `--animate-blog-shrink` | `--animate-shrink` |
| `--animate-blog-dot-bounce` | `--animate-bounce` (shadows Tailwind default — no consumer of the default exists) |
| `--animate-post-bar-fill` | `--animate-fill` |
| `--animate-score-pulse` | `--animate-ring-burst` |
| `--animate-score-burst` | `--animate-count-burst` |
| `--ease-blog` | `--ease-soft` (one shared curve, was identical-in-practice anyway) |

Every JSX call site has been updated.

### 10.B — Deletions

- All §1 dead aliases.
- `@keyframes blog-spin`, `@keyframes hero-foot-bob`.
- Utilities `.section-pad` and `.box`.
- Three CSS files dropped entirely: `header.css`, `hero.css`, `rail.css`.
  Their keyframes folded into globals.css's `@theme`; the section-specific
  consumers now use the shared aliases.

### 10.C — Structural changes worth knowing

- **`rise-in` uses `translate:` longhand, not `transform`.** This means
  Tailwind `translate-y-*` utilities on the target element compose
  correctly with the animation instead of being clobbered. Header keeps
  its centered position via `[--rise-x:-50%]` on the element.
- **`pulse` accepts a `--pulse-min` var** at 50% (default 0.3). No
  consumer overrides it today, but the override mechanism is there if
  the rail/terminal dots ever need a shallower trough.
- **`drift` reads `--drift-x/--drift-y/--drift-s`** with sensible
  defaults; each orb sets its own values inline. `atmosphere.tsx` also
  drives duration + direction via inline style.
- **`reveal-in` and `reveal-stagger-in` are still one keyframe** —
  `reveal-in` — driven by `[data-reveal]` and `[data-reveal-stagger]`
  selectors in `@layer components`. Kept separate from `rise-in` because
  it animates `transform: translateY()` (not `translate:`) so that
  hover utilities like `hover:translate-x-1` on Stack cards don't get
  silently overridden by the animation's forwards-locked final value.
  This is intentional, not an oversight.

### 10.D — Net keyframe count

Pre-migration: 30 keyframes across all CSS files (including the two
dead ones, `hero-foot-bob` and `blog-spin`).

Post-migration: **18** keyframes.

| Location | Count | Names |
| --- | ---: | --- |
| `globals.css` @theme | 9 | `pulse`, `fade-in`, `rise-in`, `bounce`, `bar-pulse`, `shrink`, `fill`, `ring-burst`, `count-burst` |
| `globals.css` @layer components | 2 | `reveal-in`, `word-on` |
| `atmosphere.css` | 2 | `breathe`, `drift` |
| `terminal.css` | 2 | `blink`, `scan` |
| `work.css` | 3 | `wipe`, `expand-pulse`, `ken-burns` |

40% reduction. If §11.A and §11.B both also land, `expand-pulse`
would go and the count would drop to 17.

---

## 11. Held back from §9 (visual-review-needed)

Both items below were flagged in the original audit as needing a
real-browser pass before landing. They're the last loose ends from
the CSS-side plan.

### 11.A — `.display` vs `.h-serif` (was §6.D)

**Files & current definitions:**
- `globals.css:209` — `.display` adds `line-height: 0.96` + `letter-spacing: -0.02em` to the serif face
- `globals.css:220` — `.h-serif` uses `letter-spacing: -0.025em`, no line-height

**Consumers:**
- `.display`: `work/list.tsx:31` (project row title), `work/project-still.tsx:49` (ghosted serif word inside the viewing frame)
- `.h-serif`: `ui/H2.tsx:11` (the shared H2 abstraction — used by stack, voices, work/index, writing, footer, now), `services.tsx:99` (svc-title), `writing.tsx:56` (article row title)

**Path to merge:**
Add `line-height: 0.96` to `.h-serif` and delete `.display`. The H2
consumers all already set their own `leading-*` per-call (e.g.,
`H2.tsx:11` declares `leading-[0.88]`), so the inherited `0.96`
won't override them. The 0.005em tracking shift on the two display
consumers is the one thing to eyeball.

**Risk:** low. One-line CSS change, one class rename across 2 files.

### 11.B — `expand-pulse` vs `ring-burst` (was §6.E)

**Files & current definitions:**
- `work.css:10` — `@keyframes expand-pulse` (transform: scale + opacity)
  applied to a `<span>` with `border-accent rounded-full` in
  `work/project-still.tsx:81` (the play-preview ring)
- `globals.css:132` — `@keyframes ring-burst` (box-shadow expansion)
  applied to a button in `Blog/post/ScoreMeter.tsx:140`

**Why not done:** they animate different CSS properties, so this isn't
a keyframe rename. To merge, you have to rewrite project-still's ring
as a box-shadow on a sized empty span (instead of a span with an
explicit `border`). Then `expand-pulse` becomes deletable.

**Risk:** medium. Visual diff possible at the very edge of the ring
(border antialiasing vs shadow rendering differ subtly). Skip unless
you're already touching `project-still.tsx` for other reasons.

---

## 12. JSX deduplication audit

A static-only sweep across `src/**/*.tsx` (excluding `src/temp/`,
which is reference material). Ordered by confidence. Aggressive
suggestions at the end — all clearly marked.

### 12.A — `KIND_LABEL` duplicated 3× (HIGH CONFIDENCE — no risk)

Identical declaration in three Blog files:

| File | Lines |
| --- | --- |
| `Blog/post/PostHeader.tsx` | 4–9 |
| `Blog/PostRow.tsx` | 5–10 |
| `Blog/FeaturedCard.tsx` | 6–11 |

```ts
const KIND_LABEL: Record<PostMeta["kind"], string> = {
  essay: "essay",
  "deep-dive": "deep-dive",
  "war-story": "war story",
  notes: "notes",
};
```

**Action:** export from `src/lib/posts.ts` (where `PostMeta` is
defined). Import the three files. Pure data constant — no Tailwind
implications.

**Saves:** ~21 lines net.

### 12.B — `formatDate()` duplicated 3× (HIGH CONFIDENCE — no risk)

Identical implementation in the same three files:

```ts
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}
```

**Action:** export from `src/lib/posts.ts` as a named export.

**Saves:** ~18 lines net.

### 12.C — Breadcrumb nav (MEDIUM CONFIDENCE)

**Files:**
- `Blog/PageTitle.tsx:10–24` — 2 crumbs (`tabsircg.com / blog`), uses `<a>`
- `Blog/post/PostHeader.tsx:29–52` — 3 crumbs (adds `slug`), uses Next `<Link>`

Both share the chrome classes byte-for-byte: outer nav
(`font-mono inline-flex items-center gap-2.5 text-xs text-muted mb-7 tracking-wide`),
divider (`text-cream/8`), link hover
(`transition-colors duration-200 hover:text-cream`).

**Action:** extract `<Breadcrumb crumbs={[{label, href?}, …]} className?>` to `Blog/Breadcrumb.tsx`. Use Next
`<Link>` everywhere (it handles `/` fine).

**Saves:** ~25 lines net (after the component file).
**Risk:** low. Bottom margin differs (`mb-7` vs `mb-8`) — pass via
the `className` prop.

### 12.D — TagPill (MEDIUM CONFIDENCE)

**Files:**
- `Blog/post/PostHeader.tsx:100–108` — `<Link>` filled-pill
- `Blog/PostRow.tsx:63–72` — `<Link>` filled-pill
- `Blog/FeaturedCard.tsx:76–83` — `<span>` outlined-pill

Filled-pill className is **byte-identical** between PostHeader and
PostRow:

```
font-mono text-xs px-2.5 py-[3px] bg-ink-2 text-cream-2 rounded-full
no-underline [transition:transform_200ms_ease,background-color_200ms_ease,color_200ms_ease]
hover:bg-accent hover:text-cream hover:-translate-y-px
```

Outlined variant in FeaturedCard differs only in border/background.

**Action:** `<TagPill tag variant?="filled"|"outlined" asLink?=true>`
in `Blog/TagPill.tsx`. Tailwind v4 JIT will pick up the literal
classnames in the new file.

**Saves:** ~24 lines net + visual consistency.
**Risk:** low.

### 12.E — `NeighbourCard` local (LOW CONFIDENCE — same-file dedup)

**File:** `Blog/post/PostFooter.tsx:25–75`

Two cards (prev + next) with near-identical structure:
- Both wrap with `CARD_BASE` + a direction-specific suffix
  (`hover:-translate-x-1` vs `hover:translate-x-1`).
- Both have a "DIR_BASE" row, both have a title row, both have an
  arrow character (← vs →).

**Action:** local `<NeighbourCard direction="prev"|"next" neighbour>`
function within the file. Use `direction` to pick alignment, arrow
position, and translate sign.

**Saves:** ~15 lines.
**Risk:** none — local refactor.

### 12.F — `MetadataRow` local (LOW CONFIDENCE — same-file dedup)

**File:** `Blog/post/PostHeader.tsx:78–94` and `95–110`

Same `<div className="flex items-center gap-3 m-0"><dt …>…</dt><dd …>…</dd></div>` structure twice in the same file.

**Action:** local function within the file.

**Saves:** ~8 lines.
**Risk:** none.

### 12.G — Terminal prompt prefix local (LOW CONFIDENCE — same-file dedup)

**File:** `portfolio/terminal.tsx:105–114` and `122–128`

The 4-span chunk:
```jsx
<span className="text-phosphor">tabsir</span>
<span className="opacity-55">@</span>
<span className="text-accent">field</span>
<span className="opacity-55">:~$ </span>
```
…is byte-identical between the active-prompt block and the idle-prompt
block. The only differences are the typed-command body and which
cursor renders.

**Action:** factor a local `PROMPT_PREFIX` JSX const or a local
`<Prompt>` component within `terminal.tsx`.

**Saves:** ~10 lines.
**Risk:** none.

### 12.H — `service-visual.tsx` idx=1 data-drive (MEDIUM CONFIDENCE — bigger win)

**File:** `portfolio/service-visual.tsx:134–211`

The other three SVG branches (idx=0, 2, 3) render their elements via
`.map()` over data tuples. idx=1 alone is ~75 lines of literal
`<rect>` / `<circle>` / `<line>` elements with hardcoded
`x/y/width/height/style`.

**Action:** define a `frame1Shapes` tuple array, map to `<rect>` /
`<line>` / `<circle>`. Same approach as the other branches.

**Saves:** ~40 lines.
**Risk:** low (pure refactor — output unchanged). Effort: medium —
each element has to be translated carefully.

### 12.I — `services.tsx` `.page-shell` swap (MEDIUM CONFIDENCE — call-back from CSS_PURGE)

**File:** `portfolio/services.tsx:72` —

```
mx-auto grid w-full max-w-(--max-w) grid-cols-[0.85fr_1fr]
items-center gap-16 pr-(--gutter) pl-(--rail-gutter)
```

The bolded utilities `mx-auto w-full max-w-(--max-w) pr-(--gutter) pl-(--rail-gutter)`
replicate `.page-shell`. CSS_PURGE.md left this alone for visual safety.

**Action:** apply `.page-shell` to a wrapper and remove the duplicated
utilities. The sticky positioning lives on the parent at `:71`, so
adding `.page-shell` here shouldn't change scroll behavior. **But
this is the pinned-scroll choreography section, so visually verify.**

**Saves:** ~5 chars + semantic clarity.
**Risk:** medium — high-visibility section.

### 12.J — Stale `cn("single-string")` calls (TRIVIAL)

A handful of `cn()` calls take a single static string with no
conditional — they reduce to identity.

Known sites:
- `stack.tsx:53` — `className={cn("page-shell")}`
- `endorsement.tsx:18–20` — `cn(...)` wrapping one multi-line static string

**Action:** drop `cn(...)`, use the string directly. Remove `cn`
import if no longer needed.

**Saves:** ~3–5 lines + a couple of imports.

### 12.K — Long inline gradients (NOT RECOMMENDED — listed for completeness)

Long `bg-[radial-gradient(...)]` / `bg-[linear-gradient(...)]` chains:

- `project-still.tsx:41` (stripe pattern) — only used here
- `project-still.tsx:45` (dot pattern) — only used here
- `voices-player.tsx:148` (poster overlay) — only used here
- `services.tsx:121` (checker pattern) — only used here
- `terminal.tsx:87` (terminal body fill) — only used here
- `FeaturedCard.tsx:25/26` (cover wash + glow) — only used here

Each gradient is unique. Extracting to CSS component classes saves
roughly zero chars (`@layer components { .x { background: … } }` is
the same length as the inline form). Skip — extraction adds an
indirection without payoff.

### 12.L — Things NOT worth doing (call-outs)

Listed so future-you doesn't re-discover and re-litigate them:

1. **Inlining single-use components** (`Aside`, `VoicesPlayer`,
   `Terminal`, `ScrambleWord`, `BlockQuote`, all Blog post components)
   — modularity > raw line count.
2. **Component-local constants** (`BTN_BASE`, `CARD_BASE`, `DIR_BASE`,
   `BASE_CONTROL_BTN`, `TAG_BASE`, `TICK_BASE`, `CORNER`, `TAPE`,
   `PLANE`, `ORB`) — each scoped to one file, each distinct.
3. **`NavLink` internal `BASE` / `UL_OUTER` / `UL_INNER` constants** —
   already an extraction.
4. **The arrow SVG in `Share.tsx:50–81`** (copy/check icon) — single
   site, stateful variants.
5. **Repeated `transition-colors duration-200`** etc. — Tailwind v4
   emits one rule per unique utility, so duplication has zero
   CSS-output cost. Extracting just adds an indirection.
6. **The "`<H2>` + max-w prose" pattern across portfolio sections** —
   each `max-w` differs, each section adds its own layout chrome. The
   shared part is already captured by `H2.tsx`.
7. **Arrow SVG dedup between `PostRow.tsx:88–97` and `FeaturedCard.tsx:91–100`**
   — same icon at different sizes, same stroke props. Tempting, but:
   the rest of the codebase uses unicode arrows (`↗`, `↘`, `→`, `↑`,
   `←`) for the same job, and unifying just these two SVGs while
   leaving the unicode arrows alone is shallow. Either commit to a
   `<Arrow>` system covering both, or skip. Probably not worth the
   churn.

### 12.M — Aggressive suggestions (USER ASKED FOR THESE — risk flagged)

Per the "aggressive deduplication, broad range" brief, here are the
ones I'd normally hold back on. All carry real risk; UI review
required.

#### 12.M.1 — `<Section>` wrapper for portfolio sections

`about.tsx`, `endorsement.tsx`, `voices.tsx`, `stack.tsx`,
`writing.tsx`, `now.tsx`, `work/index.tsx`, `footer.tsx` all start
with the same `<section id="..." className="page-shell ...">`
pattern, most with `data-reveal`, many with a `.margin-note` and a
`<H2>` heading.

**Speculative shape:**
```tsx
<Section id="now" reveal grid="page-cols-15" marginNote="…">
  <H2>…</H2>
  …
</Section>
```

**Why I'd hold back:** the grid columns differ per-section
(`grid-cols-[1fr_1.6fr]`, `grid-cols-[1fr_2fr]`,
`grid-cols-[1fr_1.5fr]`, `grid-cols-2`, etc.). Encoding that as a
prop turns into a switch statement OR you pass `grid="…"` as a
freeform string and you've just renamed `className`. Net win:
maybe 20 lines of `<section id="...">` chrome. Net cost: an
abstraction that lies about how customizable it is.

**Risk:** medium-high. Likely net-negative for readability. Worth
trying only if you also want to consolidate the margin-note
top-offsets, which are all over the map (`top-[220px]`,
`top-[260px]`, etc.).

#### 12.M.2 — Split `service-visual.tsx` into 4 files

At 329 lines it's the largest file in the codebase, and each idx
branch is ~70 lines of unrelated SVG. Split into
`service-visual-{0,1,2,3}.tsx` (or a co-located `frames/` folder)
and have the parent index dispatch. Removes the `idx === N` ladder.

**Risk:** low (pure restructure). Cost: 4 new files instead of 1.
**Net benefit:** depends on whether you'd ever edit one frame
without thinking about the others. If yes, split. If they always
move together, keep.

#### 12.M.3 — Extract `<NavLinkColumn>` for footer.tsx

`footer.tsx:30–65` has four `<div className="flex flex-col gap-X">`
columns, each with an `<H3>` plus a flat list of `<NavLink>`s.

Could collapse to a `COLUMNS` tuple array + a map. Saves ~25 lines.

**Risk:** none. Cost: a tiny indirection layer. Worth doing.

#### 12.M.4 — Inline `InViewArticle.tsx` (20 lines)

It's a 7-line component that adds `data-reveal` to an `<article>` element. Both consumers (`PostRow.tsx`, `FeaturedCard.tsx`) could
directly set `data-reveal` on their own root.

**Risk:** none. The named-component abstraction is purely cosmetic
here. Saves the import + the file.

#### 12.M.5 — Unicode arrow unification

Across `hero.tsx`, `footer.tsx`, `endorsement.tsx`, `writing.tsx`,
`PostFooter.tsx`, `nav-link.tsx`, the cards/buttons use
`↗`/`↘`/`↑`/`↓`/`→`/`←` text characters with handcrafted
`transition-transform` + `group-hover:translate-*` chains. Each
site repeats the pattern.

A `<TextArrow direction="up-right" />` (~6 directions) wrapping the
character and the standard hover transform could replace ~6 sites
with consistent behavior.

**Risk:** low. Cost: a new file. Probably worth it if you also
unify the polish (some sites use `group-hover:translate-x-1`, others
use `0.5`; some have opacity ramp, others don't — picking one canonical version is a UI choice, not a refactor).

### 12.N — Estimated savings if 12.A–12.J + 12.M.3 + 12.M.4 land

| Item | Lines | Risk |
| --- | ---: | --- |
| 12.A KIND_LABEL → lib | -21 | none |
| 12.B formatDate → lib | -18 | none |
| 12.C Breadcrumb component | -25 | low |
| 12.D TagPill component | -24 | low |
| 12.E NeighbourCard local | -15 | none |
| 12.F MetadataRow local | -8 | none |
| 12.G Terminal prompt local | -10 | none |
| 12.H service-visual idx=1 data-drive | -40 | low |
| 12.I services.tsx page-shell swap | -3 | medium |
| 12.J cn() cleanup | -5 | none |
| 12.M.3 footer columns | -25 | none |
| 12.M.4 InViewArticle inline | -15 | none |
| **TOTAL** | **~-209** | |

About 4% of the `.tsx`/`.ts` surface. Smaller than the original
CSS_PURGE pass (-7.1%) because the obvious wins were already taken
in that round; what's left is genuine semantic dedup, not
boilerplate removal.

---

## 13. Suggested order of operations

If you want a low-risk merge order:

1. **12.A + 12.B** — pure data-layer extractions, no UI impact. Do
   first. (No visual review needed.)
2. **12.E + 12.F + 12.G + 12.J + 12.M.4** — same-file dedups. No
   imports change, no shared components added. (No visual review
   needed.)
3. **12.M.3** — footer columns. Self-contained file.
4. **12.D** — TagPill. The biggest cross-file extraction; needs JIT
   sanity check (visual review of one blog index page + one post page
   covers it).
5. **12.C** — Breadcrumb. Two consumers; visual review of
   `/blog` and `/blog/[slug]` covers it.
6. **12.H** — service-visual idx=1 rewrite. Standalone refactor of
   one SVG branch.
7. **11.A** — `.display` / `.h-serif` merge. Quick visual check on
   work/list, work/project-still, plus any H2 consumer.
8. **12.I** — services.tsx page-shell swap. **High-visibility, save
   for last** so it doesn't block other work.
9. **11.B** — `expand-pulse` / `ring-burst`. Only if you're
   already touching `project-still.tsx`. Genuinely optional.
10. **12.M.1, 12.M.2, 12.M.5** — speculative; do only if you're
    bored or want to chase the "<H2> + tagline" / arrow-unification
    polish.
