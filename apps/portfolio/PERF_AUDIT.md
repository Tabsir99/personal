# Scroll-FPS audit — Portfolio home page

**Scope:** `/workspace/src/app/page.tsx` and everything it renders, plus
the global infrastructure that runs on the home page (header, observers,
global CSS, root layout). Blog routes are explicitly out of scope.

**Symptom:** FPS drops during scrolling.

**Method:** two-pass. §1–§4 below were the original static audit
(reading code, ranking by suspected coupling to paint/composite/style).
**§5 is the Chrome DevTools trace analysis that replaced the priority
order** — the measurements landed differently than the static audit
predicted. **Read §5 first.** Use §1–§4 for context on the mechanisms.

---

## TL;DR — corrected by trace (§5)

The trace (`src/temp/Performanceauditchrome`, ~8.87s of scrolling, dev
mode) flipped the priority. The original static ranking is preserved
below the line for reference, but the **measured** priority is:

| # | Where | What | Trace evidence |
|---|-------|------|----------------|
| 1 | `ui/active-section.tsx:59` | `--scroll-y` / `--scroll-progress` written on `<html>` per rAF tick | **47% of trace CPU is style recalc**. 93 recalcs spike to 30–62ms each, each touching ~2,224 elements (the whole tree). **This single mechanism explains the FPS drop.** Fix with `@property` registration + moving the writes off `<html>`. See §5.D. |
| 2 | `portfolio/service-visual.tsx:44–50` | rAF + `getComputedStyle` per frame during the 400vh services pin | Confirmed contributing to main-thread cost; replace with CSS-driven or cache `sub`. |
| 3 | `portfolio/cursor-glow.tsx:25–37` | Always-on rAF, lerp never settles | Confirmed in trace — small but constant main-thread tax. |
| 4 | `unpkg.com/react-scan/auto.global.js` | Dev-only React render highlighter loaded in `layout.tsx:73–79` | **439ms / 5% of trace.** Dev-only — re-test in `next build && next start` before sizing the remaining gap. |
| 5 | `portfolio/header.tsx:8` | `backdrop-blur-[20px] backdrop-saturate-180` on fixed nav | Demoted — **Paint is only 3% of trace**. Real but secondary. |
| 6+ | rest of §2 / §3 findings | mix-blend, ken-burns, terminal backdrop-filter, rail layout transitions, etc. | Real, but each is small after #1 is fixed. |

**The headline number:** 689 of 975 scrolling frames (**70.7%**) are
flagged by Chrome as `affects_smoothness=true` with main thread
missing its deadline (`PRESENTED_PARTIAL`). The compositor presents on
time; the main thread doesn't. Style recalc is what's keeping the main
thread busy.

<details>
<summary>Original static-audit priority (now superseded)</summary>

| # | Where | What | Why it costs frames |
|---|-------|------|---------------------|
| 1 | `portfolio/header.tsx:8` | `backdrop-blur-[20px] backdrop-saturate-180` on a `fixed` nav that is **always on-screen during scroll** | (Trace says: not the top issue — Paint is only 3% of trace.) |
| 2 | `portfolio/service-visual.tsx:44–50` | Self-restarting `requestAnimationFrame` that calls `getComputedStyle(wrap).getPropertyValue('--pin-sub')` and mutates SVG attributes every frame | Confirmed contributor but small. |
| 3 | `portfolio/cursor-glow.tsx:25–37` | Always-on rAF lerp writing `--gx`/`--gy` | Confirmed contributor but small. |
| 4 | `portfolio/terminal.tsx:100` | `backdrop-filter: blur(14px) saturate(140%)` on the hero terminal panel | Demoted with #1. |
| 5 | `ui/active-section.tsx:59–82` | `--scroll-y` written on `document.documentElement` per rAF tick | **Promoted to #1 by trace.** |
| 6 | `portfolio/atmosphere.tsx` | 4 orbs, parallax planes, contour SVG | Demoted — composited. |
| 7 | `portfolio/work/viewport.tsx:27` + `:36` | mix-blend, backdrop-blur, ken-burns | Demoted with #1. |

</details>

---

## §1 — Per-frame scroll cost chain

The cost of one scroll frame on this page, traced from input event to
paint, looks roughly like:

```
scroll event
  → rAF schedule (active-section.tsx)
    → read scrollY / innerHeight / scrollHeight       (1 forced layout)
    → write --scroll-y on <html>                       (global style invalidation)
    → write --scroll-progress on <html>                (global style invalidation)
    → per pinTarget: write --pin-step / --pin-sub      (per-target style invalidation)

… for each consumer of --scroll-y:
  .atm-far/.atm-mid/.atm-near                          (3 composited transforms — OK)
  .voices-frame                                        (1 composited scale — OK)

… for each consumer of --scroll-progress:
  rail height bar                                      (transition on `height` — layout/paint, see §4.A)
  rail dot                                             (transition on `top` — layout/paint, see §4.A)

… for each consumer of --pin-step/--pin-sub:
  svc-label / svc-title / svc-desc / svc-frame / svc-bar-fill  (calc'd opacity + transform — composited, OK)

… in parallel, independent of the scroll rAF:
  CursorGlow rAF                                       (writes --gx/--gy — full-page gradient repaint, see §3)
  service-visual rAF (while in pin)                    (getComputedStyle + SVG attr mutate, see §2)
  4× orb drift animation                               (composited)
  1× contour breathe animation                         (rasterized SVG, no will-change — see §6)
  3× decorative pulse/blink/scan inside Terminal       (composited)
  1× expand-pulse per active project-still play ring   (composited)

… then paint:
  header backdrop-blur(20px) saturate(180%)            ← every frame, fullscreen-sized read-back
  terminal backdrop-blur(14px) saturate(140%)          ← every frame while hero visible
  work thumb-strip backdrop-blur-sm                    ← every frame while work visible
  work scan-line mix-blend-multiply                    ← every frame while work visible
```

The composited animations are fine — they're a few hundred microseconds
of GPU time per frame. The real costs are: (a) the three backdrop-filter
read-backs (#1, #4, #7); (b) the CursorGlow gradient repaint (#3); (c)
the getComputedStyle in service-visual (#2). Each of those is a
multi-millisecond bite out of the 16.67ms frame budget, and they stack.

---

## §2 — Top findings (with file:line + fix sketch)

### 2.1 Header backdrop-filter (`portfolio/header.tsx:8`)

```tsx
backdrop-blur-[20px] backdrop-saturate-180 bg-ink/78
```

**Problem.** A 20px blur + 180% saturate on a `fixed` element that's
always on screen during scroll is one of the most expensive paint
operations a browser does. Every paint of the page beneath the header
forces the compositor to re-blur a band of the page background through a
20px Gaussian kernel. The Atmosphere orbs and parallax planes guarantee
that band is dirty every single frame.

**Fix options (in order of impact ↓ visual change ↓):**

- **A. Drop the backdrop-filter, lean harder on `bg-ink/X`.** The nav is
  already at `bg-ink/78`. Bump to `bg-ink/88` or `bg-ink/92`. You lose
  the through-glass look but reclaim several ms per frame.
- **B. Halve the blur radius.** `backdrop-blur-[10px]` is ~4× cheaper
  than `-[20px]` (cost grows ~quadratically with radius). Drop saturate.
- **C. Gate the filter on `[html[data-scrolled]]`.** Apply
  `backdrop-blur` only after `--scrolled` flips. Above the fold there's
  nothing interesting behind the nav anyway. (Requires the nav to be a
  pure opaque pill above the fold.)
- **D. Use `transform: translateZ(0)` on the body of the page** to
  promote a backing layer — sometimes lets the compositor skip the
  blur read-back. Mileage varies per browser.

Pick A if you can live with the look; otherwise B + C combined gets most
of the win.

### 2.2 service-visual rAF + getComputedStyle (`portfolio/service-visual.tsx:44–67`)

```js
const tick = () => {
  raf = 0;
  const sub =
    parseFloat(getComputedStyle(wrap).getPropertyValue("--pin-sub")) || 0;
  apply(idx, sub, root);
  raf = requestAnimationFrame(tick);
};
```

**Problem.** `getComputedStyle()` forces the browser to flush pending
style and **synchronously compute resolved styles** for the queried
element. Doing this every frame is textbook layout thrash. Worse: the
loop self-reschedules unconditionally, so once active, it runs at full
60fps regardless of whether `--pin-sub` actually changed. The `apply()`
function then mutates SVG attributes which trigger an SVG paint.

The pin scroll for `Services` is 400vh — 4 full viewports of scroll
during which exactly one of these RAFs is firing.

**Fix options (recommended → fallback):**

- **A. Read `--pin-sub` from a publishing channel, not getComputedStyle.**
  `active-section.tsx` already computes `sub` per frame. Have it
  dispatch an event (or call a registered callback) with the numeric
  value so subscribers don't have to re-read it. Then visualizers
  consume the number directly.
- **B. Make the SVG animations declarative (CSS).** All four visualizers
  do small scalar animations (radius growth, x offset via sin(sub*2π),
  opacity ramp). Most can become CSS:
  - idx 2 / idx 3 (radius pulses): replace JS with a CSS `@keyframes`
    that scales the circles; trigger on `[data-pin-step="2"]` /
    `[data-pin-step="3"]`. No per-frame sub at all.
  - idx 0 / idx 1: only the wave-offset and line-position truly need
    sub — even those can use a CSS transform driven by `var(--pin-sub)`
    on the SVG element rather than per-attribute JS.
- **C. If JS must stay, cache the last-read sub and bail out early.** At
  minimum, skip the SVG mutation when `sub` hasn't changed by more than
  ~0.001. Still pays for getComputedStyle, but skips the SVG paint.

A or B is the right call. The current design fights React's "no
re-render on scroll" win by reintroducing per-frame DOM work.

### 2.3 CursorGlow always-on rAF (`portfolio/cursor-glow.tsx:25–37`)

```js
function tick() {
  cx += (tx - cx) * 0.05;
  cy += (ty - cy) * 0.05;
  // …
  el.style.setProperty("--gx", `${cx * 100}%`);
  el.style.setProperty("--gy", `${cy * 100}%`);
  raf = requestAnimationFrame(tick);
}
```

**Problem.** Three compounding issues:

1. The rAF never stops — it loops forever, even when the mouse hasn't
   moved.
2. `cx += (tx-cx)*0.05` is a one-pole low-pass that asymptotes to `tx`
   but never equals it. Floating point keeps the values changing by
   nano-amounts each frame.
3. The target div has a **fullscreen radial-gradient background that
   reads `var(--gx)` / `var(--gy)`**, so each property change repaints
   that gradient across the whole viewport. Gradients are not free —
   even a single repaint per frame of a 1920×1080 radial gradient is
   non-trivial GPU work, and your compositor cannot skip it because the
   var changed.

This runs **concurrent with scroll**, doubling the per-frame paint
budget the browser has to spend.

**Fix options:**

- **A. Idle the loop when the mouse hasn't moved.** Track when the
  delta `(tx-cx, ty-cy)` is below a threshold (e.g. 0.001) and stop the
  rAF; restart on next mousemove.
- **B. Step the values, don't lerp.** Drop the smoothing entirely, set
  `--gx`/`--gy` directly inside `onMove` (which is already throttled by
  the OS to mouse-event cadence — usually slower than 60fps). You lose
  the silky lag but kill the always-on cost.
- **C. Disable below a certain viewport / pointer:fine.** It's
  decorative; `@media (pointer: coarse) { display: none }` and
  `@media (prefers-reduced-motion: reduce) { display: none }` already
  guard most low-end devices, but you can also early-return in JS if
  `matchMedia('(pointer: fine)').matches === false`.

A is the cheapest win that preserves the look.

### 2.4 Terminal backdrop-filter (`portfolio/terminal.tsx:100`)

```css
[backdrop-filter:blur(14px)_saturate(140%)]
```

**Problem.** Same mechanism as the header but on a panel inside the
hero. It's only painted while the hero is on screen (roughly the first
100vh), and the Atmosphere orbs drift through this area, so each frame
the area behind the terminal is dirty.

**Fix options:**

- **A. Drop the saturate** — saturate(140%) doubles the filter cost for
  marginal aesthetic gain on dark backgrounds.
- **B. Halve the blur** — `blur(7px)` reads as ~the same glass effect at
  roughly 1/4 the GPU time.
- **C. Lean on solid + gradient backgrounds.** The terminal already has
  a `linear-gradient(180deg, ink-3/45, ink/55)` bg. Bump those alphas
  to 70 / 80, drop backdrop-filter, accept that the orbs no longer show
  through. The translucency is doing very little visually because the
  background is so dark.

C is the cleanest if you're willing to give up the through-glass story.

### 2.5 `--scroll-y` global cascade (`ui/active-section.tsx:59`)

```js
root.setProperty("--scroll-y", String(y));
root.setProperty("--scroll-progress", progress.toFixed(2));
```

**Problem.** Custom properties set on `<html>` invalidate style for
every descendant that uses the property (and Chrome historically has
slow paths around this — current versions are better but it's still not
free). The cost compounds with the size of the matched rule set.

In practice this is fine here because only a handful of selectors read
`--scroll-y` / `--scroll-progress`. The real point is that this is
**load-bearing infrastructure**, so anything we add (e.g. a 6th
consumer that triggers paint, not just composite) multiplies the
per-frame cost.

**Fix options (preventative, not urgent):**

- **A. Set the var on the nearest common ancestor, not `<html>`.** Both
  Atmosphere and Voices are inside the body — setting `--scroll-y` on
  `<body>` instead of `<html>` would narrow the invalidation tree.
  (Doesn't help today but keeps tomorrow honest.)
- **B. Stop the `toFixed(2)` allocation.** It's a string allocation
  every frame for no behavioral benefit — the CSS calc reads it as a
  number anyway. `String(progress)` (or just leave it numeric) is fine.
  Same for `String(y)` — could be omitted (CSS coerces).
- **C. Skip writes when value hasn't changed.** Cache last y; if
  `y === lastY`, skip the property writes. Saves work when the user
  is on a section that's taller than 1 viewport and the rAF fires
  during a scroll-momentum frame with no actual delta.

### 2.6 Atmosphere paint surface (`portfolio/atmosphere.tsx`, `styles/atmosphere.css`)

The Atmosphere is `fixed inset-0`, sits behind everything, and contains:

- 4 orbs (560×560 → 860×860), each a radial-gradient background, each
  with `will-change: transform` and a 28–40s drift keyframe.
- 3 parallax planes (240vh tall, `will-change: transform`), translated
  via `--scroll-y`.
- A `<ContourSVG>` with ~40 ellipses, scaled+translated by
  `animate-breathe` (22s).
- An SVG grain layer (`atm-grain`) — 220×220 tiled noise URI, opacity
  0.045.
- A radial vignette overlay.

**What's fine.** The orbs and parallax planes are properly promoted
(`will-change: transform`) and animate with `transform`, so they
composite. The grain is a static raster that the compositor caches.

**What's not.**

- **`ContourSVG` has no `will-change`.** The `animate-breathe` keyframe
  scales the entire SVG by 1 → 1.015. Without will-change, the SVG is
  re-rasterized at every animation step. With 40 ellipses, this is a
  non-trivial paint that happens 60fps × 22s loop = every frame.
- **Orb sizes are huge.** A 860×860 layer is ~3 MB of backing store
  per orb. 4 orbs ≈ 12 MB resident in compositor memory. On
  memory-constrained GPUs (integrated graphics, mobile) this can
  thrash texture cache.
- **Atmosphere is `fixed`** — that means it stays on screen for the
  whole scroll, so its paint never gets to "leave" the viewport.

**Fix options:**

- **A. Promote ContourSVG.** Add `will-change: transform` (or
  `transform: translateZ(0)`) to the SVG. Cheap.
- **B. Reduce orb size or count.** Drop to 2 orbs, or shrink the 860 to
  ~520. Visually a small change; halves the layer memory.
- **C. Pause Atmosphere animations during fast scrolls.** Add a body
  class (e.g. `is-scrolling`) that the active-section rAF sets and
  clears on idle, and gate `animate-drift` / `animate-breathe` under
  `body:not(.is-scrolling)`. Animations restart cleanly when scroll
  stops.
- **D. Disable the Atmosphere on `prefers-reduced-motion`** — already
  partially done (`motion-reduce:animate-none`), could go further and
  hide the planes entirely.

### 2.7 Work section paint stack (`portfolio/work/viewport.tsx`, `styles/work.css`)

Three independent issues compound inside the work viewport when it's on
screen:

1. **`mix-blend-multiply` scan-lines overlay** (viewport.tsx:27) — every
   mix-blend mode forces an isolated stacking context + a separate paint
   pass. The scan-line gradient is a `repeating-linear-gradient`, which
   is already moderately expensive to paint; mix-blend multiplies the
   cost.
2. **`backdrop-blur-sm` on the thumb strip** (viewport.tsx:36) — small
   radius so cheap-ish, but it's another read-back during scroll.
3. **5 `.work-still`s all running `animate-ken-burns`** — the keyframe
   targets `transform: scale(...) translate(...)`. Inactive stills are
   `opacity: 0` (work.css:71), but the animations still run and the
   browser doesn't always skip paint for opacity-0 nodes (it depends on
   whether they have their own layer).

**Fix options:**

- **A. Drop mix-blend on the scan-lines.** Replace with a low-alpha
  `repeating-linear-gradient` that uses the cream/8 color directly. You
  lose the deepens-shadows quality of multiply, but the visual delta is
  small on a dark frame.
- **B. Gate ken-burns to the active still.**
  `.work-still { animation: none; }` plus a more specific
  `[data-work-active="N"] .work-still[data-i="N"] { animation: var(--animate-ken-burns); }`.
  Or use the existing `--active` calc to set `animation-play-state` —
  but CSS can't drive play-state from a number, so the cleaner path is
  selector-based.
- **C. Drop the thumb-strip backdrop-blur.** It's a 4px effective blur
  on a band that's already `bg-ink/78` — barely visible. Cheap win.

---

## §3 — Secondary findings

### 3.A Rail transitions on layout properties (`portfolio/rail.tsx:23, 40`)

```html
<div class="… transition-[height] duration-60 …" style="height: calc(var(--scroll-progress) * 1%)">
<div class="… transition-[top]    duration-60 …" style="top:    calc(var(--scroll-progress) * 1%)">
```

Animating `height` and `top` triggers layout + paint instead of
composite. The rail elements are tiny (1px wide line, 8px dot) and
position:absolute inside a position:fixed container, so the layout reach
is bounded — but it's still per-frame work that could be composited
instead.

**Fix.** Replace `top` with `transform: translateY()` and use a fixed
height with `scaleY()` on the bar. Both become composite-only.

### 3.B `html { scroll-behavior: smooth }` (`globals.css:14`)

Smooth scroll prolongs each user scroll input over many frames, which
amplifies any per-frame cost. It's not itself a cause of FPS drops, but
it ensures cost is paid over a longer interval — so users *feel* jank
they might not have noticed on a snap-scroll.

**Fix.** Consider keeping smooth scroll only for in-page anchor jumps
(`html` doesn't support that — would need JS `scrollIntoView({behavior:'smooth'})`
on anchor clicks, and remove it from CSS).

### 3.C Continuous decorative animations

Always-on, never paused:

- `animate-blink` (terminal cursor)
- `animate-pulse` ×3 (terminal status dot, header "Available" dot, score widgets)
- `animate-scan` (terminal scanline) — translates a 1px tall gradient bar 260px
- `animate-breathe` (contour SVG)
- `animate-drift` ×4 (atmosphere orbs)
- `animate-expand-pulse` on the active project-still play ring
- `animate-ken-burns` ×5 (work stills)

Most are composited (transform/opacity only), so each costs a fraction
of a ms on the GPU per frame. But they all add up, and several run on
content that is off-screen for 90% of the scroll.

**Fix.** Wrap section-scoped animations in
`@container` or `:has` selectors driven by an in-view flag, OR use
`animation-play-state: paused` for elements not in the active section
(state-island already exposes `data-active-section`, easy to gate).

### 3.D `text-rendering: optimizeLegibility` on `body` (`globals.css:164`)

Enables ligatures + kerning + contextual alternates page-wide. On a
serif-italic display page, this slows text shaping. Not a scroll
killer — the work happens once at layout time — but page-load TTI gets a
hit, and when sections animate in (data-reveal staggers), the appearing
text re-shapes with this setting on.

**Fix.** Either drop it (use the default `auto`) or scope it to the
display headings via a `.h-serif { text-rendering: optimizeLegibility }`
rule.

### 3.E No CSS `contain` anywhere

`contain: layout style paint` tells the browser that a subtree is
isolated — changes inside don't ripple out, and the subtree can be
painted independently. Big self-contained sections that would benefit:

- `section#services` (400vh pinned subtree)
- `section#work` (large grid + 5 stills + meta stack)
- `section#now` (sticky left + scrolling right)

Adding `contain: layout style paint` (or `contain: content`) to those
sections is a near-free win — the browser can skip recomputation across
them when something elsewhere on the page changes.

### 3.F `react-scan` loaded in dev (`layout.tsx:73–79`)

Not a prod issue, but if the FPS testing is happening in `next dev`,
react-scan's own instrumentation may be contributing. Worth excluding
when profiling.

### 3.G `content-visibility: auto` not used

For sections that are far down the page (Writing, Now, Footer), adding
`content-visibility: auto` (with a `contain-intrinsic-size` to reserve
space) skips painting until they enter the viewport. Helps initial scroll
through the upper sections.

---

## §4 — Recommended order of attack

If the goal is "smooth scroll on the home page", the smallest set of
changes that should deliver the biggest fps gain:

1. **Drop or weaken the header backdrop-filter** (§2.1). Single
   biggest expected gain. Try `bg-ink/92` with no blur first; if the
   look is unacceptable, fall back to `backdrop-blur-[8px]` with no
   saturate.

2. **Idle the CursorGlow rAF when the mouse is still** (§2.3 option A).
   Maybe 10 lines of code, no visual change.

3. **Move service-visual animations to CSS, or at minimum cache the
   last `sub` and bail** (§2.2 option B / C). Removes the 60fps
   getComputedStyle thrash during the longest pinned section.

4. **Drop the terminal backdrop-filter or halve its radius** (§2.4).
   Only matters for hero, but hero is where users form their first
   FPS impression.

5. **Pause atmosphere + decorative animations when not in view, and
   add `will-change: transform` to ContourSVG** (§2.6 A + C).

6. **Drop `mix-blend-multiply` and the thumb-strip backdrop-blur in
   Work** (§2.7 A + C). Gate ken-burns to the active still.

7. **Add `contain: content` (or `contain: layout style paint`) to the
   big sections** (§3.E). Free win.

8. **Convert rail height/top transitions to scaleY/translateY**
   (§3.A). Polish.

Items 1–4 alone should make the difference between "the page drops
frames" and "the page is smooth". Items 5–8 are the long tail.

---

## §5 — Trace findings (corrects §1's priority order)

Captured `/workspace/src/temp/Performanceauditchrome` — DevTools
performance trace, ~8.87s of scrolling, **dev mode**
(`localhost:3001/_next/...`).

### 5.A The headline numbers

| Metric | Value |
|---|---|
| Trace duration | 8,869ms |
| Scrolling presented frames (compositor) | 975 |
| **`affects_smoothness=true` + `PRESENTED_PARTIAL` while scrolling** | **689 (70.7% of scrolling frames)** |
| Fully presented while scrolling | 262 |
| Dropped while scrolling | 6 |
| Total `UpdateLayoutTree` time | **4,164ms (47% of trace)** |
| `UpdateLayoutTree` events >16ms (over frame budget) | **99 of 1,402** |
| `UpdateLayoutTree` events >30ms | 93 (max 62ms) |
| Elements restyled per slow recalc | **~2,224 (essentially the whole tree)** |
| Total `Paint` time | 278ms (3%) |
| Total `Layout` time | 287ms (3%) |
| Total `RasterTask` time | 121ms (1%) |
| Total `Layerize` time | 423ms (5%) |
| `FunctionCall` total — react-scan | 439ms over 2,271 calls |
| `FunctionCall` total — `compute` (active-section rAF) | 77ms over 234 calls |
| Transition events (`transitionrun`/`start`/`cancel`/`end`) | 1,298 |
| `transitioncancel` (mid-flight interruptions) | 270 |

### 5.B What the trace actually says

**70.7% of scrolling frames are partial-and-smoothness-affected.** That's
Chrome's own jank counter. The compositor keeps presenting (so DrawFrame
gaps look fine) but the main thread misses its deadline on more than 2/3
of scroll frames, so the user sees stale content for the main-thread
layers while the compositor keeps animating its own layers.

**The dominant cost is style recalculation, not paint.** `UpdateLayoutTree`
is **47% of the entire trace**. Paint, Layout, and Raster combined are
**7%**. This **invalidates my §1 priority order** — backdrop-filter
(which I ranked #1) is paint-heavy, but Paint only accounts for 278ms.
Even if I cut backdrop-filter to zero, I save maybe 50–100ms total. The
real lever is the 4,164ms of style recalc.

**Each slow style recalc touches ~2,224 elements.** That's the entire
DOM tree under `<html>`. This is the unambiguous signature of:

> a CSS custom property being written on `<html>` that the engine cannot
> prove is read by only a subset of descendants, so every descendant's
> matched-rule set has to be re-evaluated.

That's `--scroll-y`, `--scroll-progress`, `--pin-step`, `--pin-sub` in
`active-section.tsx`. Several writes per scroll-rAF frame. Some go
through cheap fast paths (1,219 recalcs at sub-ms), but **93 of them
spike to 30–62ms**, blowing the 16.7ms frame budget every single time.
These 93 spikes are what the user feels as FPS drops.

**93 spikes over 7 seconds of scrolling = roughly one spike every ~75ms
of scrolling.** That matches the symptom precisely: scroll feels
*chunky*, not *paused* — micro-stutters at a steady cadence rather than
long hangs.

**Paint-heavy CSS (backdrop-filter, mix-blend) is NOT the current
bottleneck.** It's still expensive and worth fixing, but only after the
style-recalc issue is solved. Order matters here: fix paint first and
you still have 47% of CPU spent on style recalc and the jank stays.

**`transitioncancel` ×270 is a real signal.** During fast scrolls many
CSS transitions get interrupted before completing — every cancel still
goes through the CSSAnimationsAPI machinery. This is downstream of the
style-recalc cost (transitions are scheduled when style changes), so
fixing style recalc reduces this too.

**react-scan is significant in this dev trace.** 439ms / 2,271 calls is
~5% of trace time. **The trace was captured in `next dev`**, so this is
dev-only overhead. The user should re-test in `next build && next start`
before sizing the remaining gap — production may already feel
substantially better. That said, the style-recalc cost is **not** a
dev-only artifact; it'll be there in prod too.

### 5.C Corrected priority order

Rank | What | Expected impact | Effort
---|---|---|---
**1** | **Reduce or eliminate `--scroll-y` / `--scroll-progress` writes on `<html>`** | **Huge** — directly attacks the 47% of CPU in style recalc | Medium
**2** | Move `--pin-step` / `--pin-sub` to a child element (the pin wrap itself) | Large — narrows recalc to the services subtree | Small
**3** | Register the custom props with `@property` so the engine can scope invalidation | Large — gives the engine the info it needs to skip irrelevant elements | Small
**4** | Verify in `next build && next start` (drops react-scan + dev double-renders) | Medium — clears noise; may reveal more | Small (just a deploy test)
**5** | Idle CursorGlow rAF when mouse is still | Small | Trivial
**6** | Fix service-visual rAF (`getComputedStyle` per frame → CSS-driven or cached) | Small (its cost shows up in compute/script time, not the dominant 47%) | Small
**7–N** | Backdrop-filter, mix-blend, ken-burns gating, `contain` on big sections | Cumulative small wins | Various

### 5.D Concrete fixes for #1–#3

**5.D.1 — Move scroll-y off `<html>`.** Today:

```js
// active-section.tsx:54
const root = document.documentElement.style;
root.setProperty("--scroll-y", String(y));
root.setProperty("--scroll-progress", progress.toFixed(2));
```

The only readers of `--scroll-y` are:
- `.atm-far`, `.atm-mid`, `.atm-near` (inside `<Atmosphere>`)
- `.voices-frame` (inside `#voices`)

The only readers of `--scroll-progress` are:
- The rail height bar and dot (`<Rail>`)

Move the writes to a **target element that's a common ancestor only of
the consumers**, not `<html>`. Easiest: set them on `<body>` (still
covers all consumers but at least scoped one level down — minor win).
Better: set `--scroll-y` on a wrapper that contains Atmosphere + main,
and `--scroll-progress` on `<Rail>` directly (it's the sole consumer).

When Chrome sees a custom-prop change on a non-root element, the
invalidation scope is bounded to that subtree.

**5.D.2 — `@property` registration.** Add to `globals.css`:

```css
@property --scroll-y {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}
@property --scroll-progress {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}
@property --pin-step {
  syntax: "<integer>";
  inherits: true;
  initial-value: 0;
}
@property --pin-sub {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}
```

Registered properties give Chrome:
- typed values (avoids string→number reparse on every read)
- proper change tracking (engine knows the value semantically)
- the ability to interpolate them in animations

Most importantly: with `@property` declared, Chrome treats the custom
property as a real CSS property, so its invalidation goes through the
same per-property dependency tracking as built-in properties — only
elements whose computed style actually depends on the property get
re-styled. This alone should kill most of the 2,224-element recalc.

**5.D.3 — Move `--pin-step` / `--pin-sub` to the pin wrap.** Today the
active-section loop walks `[data-pin-steps]` elements and writes to
them directly — so this one is already scoped. But `compute()` also
writes `--scroll-y` to `<html>` on every iteration of the same loop.
The fix is just consistency: pin vars on the pin wrap (already correct),
scroll-y on a narrower target (currently wrong).

**5.D.4 — Skip writes when y is unchanged.** A free optimisation:

```js
let lastY = -1;
function compute() {
  raf = 0;
  const y = window.scrollY;
  if (y === lastY) { /* still publish other things, but skip --scroll-y */ }
  lastY = y;
  // …
}
```

Many rAF ticks fire during scroll-momentum decay where `y` hasn't moved
a full integer pixel — the write triggers invalidation for nothing.

### 5.E Expectation after #1–#3

If the style-recalc cost drops from 4,164ms / 47% to a small fraction
(say, 5–10% — typical for a well-scoped page), the trace's main-thread
budget becomes 60–70% idle headroom per frame. At that point:

- `affects_smoothness` jank ratio should fall from 70% to single-digit %
- The 93 over-budget recalc spikes should disappear (or reduce to ≤16ms)
- The remaining work (backdrop-filter paint, decorative animations,
  ken-burns) will fit in budget without the main thread getting in its
  own way

Only if jank persists after #1–#3 should you spend time on the §2 items
(backdrop-filter, mix-blend, etc.).

---

## §6 — What's already doing the right thing

So this audit doesn't read as one-note: a lot of the perf scaffolding
here is genuinely good and should be preserved:

- **Server-rendered Services + Work with state-island pattern.** No
  React re-renders during scroll. Excellent.
- **Single global IntersectionObserver for reveals.** One IO instance,
  not one per element. Correct.
- **Passive scroll listener + rAF coalesce in active-section.tsx.**
  Textbook. (The remaining cost is downstream of this, not in it.)
- **Parallax via CSS vars + transform, not JS-driven `top`.** Right
  call.
- **`will-change: transform` on the parallax planes and orbs.** Right.
- **`pointer-events: none` on every decorative overlay.** Prevents the
  hit-test path from walking through them.
- **Hover transitions only fire on hover (transition: opacity etc.) —
  no continuous JS animation outside the items called out above.**

The architectural problems aren't "JS doing too much" — it's a small
set of specific paint-heavy CSS rules (backdrop-filter, mix-blend) and
two badly-shaped rAF loops (CursorGlow, service-visual).
