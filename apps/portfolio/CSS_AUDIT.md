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
