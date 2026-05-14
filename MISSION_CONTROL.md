# MISSION_CONTROL.md
**Build Specification — Siddhant Dube Portfolio (Space Theme, v2)**

> If you are an AI assistant opening this repo, read this entire document before writing any code. It is the source of truth for what this portfolio should be and what it must not become. Where it conflicts with patterns in the existing codebase, this document wins.

---

## 0. About This Document

This is the design and implementation specification for rebuilding `siddhantdube1.github.io` as a space-themed portfolio. The owner (Siddhant Dube) and a previous Claude session collaboratively decided on the concept; this document captures that decision in enough detail that a future implementer (human or AI) can build it without re-deriving any design choices.

**How to use this file:**
- Read sections 1–3 to understand the concept and visual language before touching code.
- Read section 4 to understand the section-by-section information architecture.
- Read sections 5–8 for the implementation specifics on telemetry, canvas/3D work, photography, and personality details.
- Reference section 13 (Implementation Phases) to scope work into shippable increments. Do not try to build everything at once.
- If you are about to add a floating astronaut, a rocket cursor, a generic starfield, or a "exploring the universe of code" tagline — stop and re-read section 12 (Anti-Patterns).

---

## 1. Project Context

### 1.1 Who this is for
Siddhant Dube — PhD candidate researching socio-technical AI systems, with a focus on how Graph Neural Networks, Large Language Models, and neuro-symbolic architectures can transform legal reasoning. ~4.5 years prior experience as an ML engineer at CVS Health, Ikigai Labs, Squark, and Empallo (MIT startup). Master's from Northeastern, Bachelor's from Monash.

Personally: loves mathematics, programming as problem-solving, **space (his biggest obsession)**, philosophy, and photography (landscapes, hobbyist).

He communicates directly and prefers detailed, step-by-step explanations. When building, prefer over-specifying to under-specifying.

### 1.2 Existing repo (what we're replacing)
- **Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, `lucide-react` icons.
- **Sections (single page):** Home / About / Experience / Skills / Projects / Contact, plus a separate `/blog` route backed by markdown in `content/blog/` and a `lib/blog.ts` helper.
- **Theme:** light/dark toggle persisted to `localStorage`, blue→purple→indigo gradient palette throughout.
- **Working machinery to preserve:** contact form + `/app/api/contact` route, blog markdown pipeline, `app/components/DarkModeToggle.tsx` and `app/components/ThemeProvider.tsx`, `public/Profile.jpg`.
- **Existing content to preserve verbatim (only reframe presentation):** all experience bullets, education entries, stats numbers, project descriptions, contact links.

### 1.3 The goal in one sentence
Replace the generic SaaS-portfolio aesthetic with a working mission-control console that does real work — pulling live telemetry from public space APIs — and frames Siddhant's career and personality as the mission being operated.

---

## 2. The Concept

### 2.1 Mission Control as spine

The site behaves like a ground-station console operating one mission: **Siddhant himself**. Every section is a subsystem report. Every numeric is monospace. Every section title reads like a callsign or panel label. Real data from public APIs makes the dashboard *do work* every time someone visits — this is the single biggest move that separates this portfolio from every other "space-themed" portfolio.

The mission designation is **SD-01**.

### 2.2 Golden Record as a localized overlay (About section only)

The About section borrows the framing of the Voyager Golden Record: "if a stranger found this drifting, who would they decide I am?" The section is titled **MANIFEST**. It contains:

- The faithfully-rendered Voyager pulsar map (citation, not pastiche — see section 6.2).
- The bio prose, lightly reframed as a manifest entry.
- Education entries reframed as "training logs."
- An inscription quote.

The Golden Record frame **does not leak into other sections.** Mission Log, Active Payloads, Onboard Systems, Downlink, and Open Channel stay strictly in the Mission Control register.

### 2.3 What this means in practice (the three commitments)

1. **The metaphor is information architecture, not decoration.** Section names, copy, motion, and data all participate. If you find yourself adding a star icon next to a generic section header, you are decorating — re-frame the section instead.
2. **Real data over animation.** A live ISS-position widget beats a CSS animation of orbiting circles. A real "next launch from Cape Canaveral" line beats a render of a rocket. Reach for an API before reaching for a Lottie file.
3. **Mechanical motion, not whimsical motion.** Things blink, tick, click into place, and update. They do not bounce, swoosh, or spring. Easings are linear or cubic, never elastic.

---

## 3. Visual & Sonic Language

### 3.1 The two themes (semantic, not just chromatic)

The light/dark toggle changes more than colors — it changes the *posture* of the page. Both modes are equally finished; neither is a "fallback" of the other. The toggle label can read **NIGHT OPS / DAYLIGHT RECOVERY** or use mode icons; either is fine.

| Aspect | Night Ops (default, dark) | Daylight Recovery (light) |
|---|---|---|
| Posture | Mission running | Mission archived |
| Background | Deep navy void | Parchment / cream |
| Primary type color | Inert white / cool gray | Ink navy |
| Accent | Instrument cyan + warning amber | Copper / brass |
| Material reference | Glass instrument panel | Etched golden record disc |
| Motion density | Higher — ticking numerics, blinking cursors active | Lower — numerics static unless interacted with |
| Sound (if user enabled) | Quiet Apollo-style beeps | Silence |

This dual aesthetic is intentional and is part of what makes the portfolio distinctive. **Do not collapse it into a simple "dark mode is the same site with lights off" pattern.**

### 3.2 Typography

- **Display / monospace (numerics, labels, callsigns, terminal output):** `Space Mono` or `JetBrains Mono`. Default to `Space Mono` for the on-the-nose pun; fall back gracefully.
- **Sans (running prose, project descriptions, bio copy):** `Inter`. Already widely available; no need to import unusual fonts.
- **Inscription serif (Daylight Recovery mode only, for Golden Record sections):** `Newsreader` or `EB Garamond`. Used for the Manifest section quote and a couple of Daylight-mode headlines. Not used in Night Ops mode.

Load fonts via `next/font/google` to avoid layout shift. Subset to Latin.

### 3.3 Color tokens (Tailwind theme extension)

Define both modes via CSS custom properties so component code can reference semantic names (`var(--instrument)`) rather than raw hex.

**Night Ops:**
```
--bg            #04060d   (void)
--bg-elevated   #0a0f1c   (panel)
--grid          #1a2030   (hairline grid lines, very low contrast)
--ink           #e2e8f0   (primary text)
--ink-dim       #94a3b8   (secondary text)
--instrument    #38bdf8   (cyan; primary accent, live data, links)
--warning       #fbbf24   (amber; updating values, attention)
--critical      #ef4444   (red; reserved — use sparingly)
--inert         #475569   (dividers, inactive)
```

**Daylight Recovery:**
```
--bg            #f4ede1   (parchment)
--bg-elevated   #ebe1cf   (slightly deeper parchment)
--grid          #d6c9ad   (etching lines)
--ink           #1a2540   (ink navy)
--ink-dim       #5a6280
--instrument    #b8860b   (copper / brass; replaces cyan)
--warning       #c2410c   (rust orange; replaces amber)
--critical      #991b1b
--inert         #a89a7a
```

All accent colors must hit WCAG AA contrast (4.5:1) against their background. Verify with a tool, don't eyeball.

### 3.4 Motion principles

- **Easings:** `linear` for ticking numerics, `cubic-bezier(0.4, 0, 0.2, 1)` for everything else. No springs, no overshoots, no bounces.
- **Durations:** 120–200ms for state changes (button hover, focus); 400–600ms for section transitions; one-shot 2–3s for the boot sequence; ongoing for telemetry tickers.
- **Hover behavior:** elements *brighten* (border or text color goes from `--ink-dim` to `--instrument`) rather than *lift*. The current portfolio's `translate-y-1` hover is a SaaS tic and should not survive.
- **Scroll:** sections snap softly into place; consider `scroll-snap-type: y proximity` on the main scroll container, but allow free scroll if the user is dragging quickly. Test on trackpad and mouse wheel.
- **Reduced motion:** when `prefers-reduced-motion: reduce` is set, kill the boot sequence, the orbit animation, philosophy crossfades, and the constellation overlay. Numerics still update on data refresh but without animated transitions.

### 3.5 Iconography

- Replace `lucide-react` decorative icons with custom thin-stroke SVG mission patches and instrument glyphs where it matters (project cards, system categories). Keep `lucide-react` for functional icons (menu, close, chevrons, social platforms).
- A 1px-stroke aesthetic dominates. Avoid filled glyphs unless they represent a live indicator (e.g., a filled circle for "connection active").
- No emoji icons on cards. Replace the current `🎓 🏥 📊 🧠 ⚡` project icons with small SVG mission patches.

### 3.6 Optional audio (off by default)

A small toggle in the corner enables muted UI sounds:
- Boot sequence: a single quiet tone at handshake completion.
- Toggle theme: a soft mechanical click.
- New telemetry value: nothing (would be annoying).
- Submitting the contact form: a confirmation tone.

State persists in `localStorage`. Default is off. Never auto-play.

### 3.7 The faint grid

A hairline engineering grid (1px lines at very low opacity, ~12-column at desktop, 4-column at mobile) is visible across the page as a fixed background. This is what gives the page its "panel of instrumentation" feel without requiring decoration. Implement as a CSS background-image with `repeating-linear-gradient` on a fixed pseudo-element.

---

## 4. Information Architecture

### 4.1 Section map (old → new)

| Old route / id | New section name (display) | Frame |
|---|---|---|
| `#home` (Hero) | **GROUND STATION** | Mission console entry, boot sequence, live telemetry HUD |
| `#about` | **MANIFEST** | Golden-record-flavored bio + pulsar map + training logs |
| `#experience` | **MISSION LOG** | Past missions with launch / recovery dates |
| `#skills` | **ONBOARD SYSTEMS** | Skill categories reframed as ship subsystems |
| `#projects` | **ACTIVE PAYLOADS** | Projects as probes / payloads in flight |
| **NEW** `#downlink` | **DOWNLINK** | Photography (general landscapes) |
| `/blog` | **TRANSMISSION LOG** | Markdown posts, framed as transmissions |
| `#contact` | **OPEN CHANNEL** | Contact form, framed as outgoing transmission |

The navigation order on the page becomes: Ground Station → Manifest → Mission Log → Onboard Systems → Active Payloads → Downlink → Open Channel, with Transmission Log linked separately as before.

### 4.2 Copy decks (section by section)

#### 4.2.1 GROUND STATION (Hero)

On first visit, before settling, a brief boot sequence plays (see 8.1).

After boot, the hero shows a **HUD layout** rather than a centered "name + tagline" card. Three regions:

- **Top-left identity block:**
  ```
  OPERATOR
  SIDDHANT DUBE
  CALLSIGN  SD-01
  STATUS    ACTIVE
  SECTOR    KUALA LUMPUR, MY
  ```
- **Center: a slow-rotating 3D Earth** with a pulsing dot at his KL coordinates and a small ISS marker on its real-time orbit (see 6.1).
- **Right-column live telemetry stack**, 4–6 widgets (see 5.1).
- **Bottom strip:** a single ticker line that cycles slowly through three modes:
  1. `LOCAL SIDEREAL TIME — [computed]`
  2. `MISSION ELAPSED TIME — [time since Voyager 1 launch, since 1977-09-05 12:56:00 UTC]`
  3. `NEAREST UPCOMING LAUNCH — [from Launch Library 2 API]`

Do not include a "scroll down" chevron. The visitor figures it out, or the boot sequence's last line hints at it (`> SCROLL TO ENTER LOG`).

No "Get In Touch" CTA in the hero. The contact path is via Open Channel at the end. The hero's job is to establish that this is an instrument, not a landing page.

#### 4.2.2 MANIFEST (About)

Section heading: **MANIFEST**
Subheading (small, mono, dim): `// IF FOUND DRIFTING, READ FIRST`

Layout: two-column on desktop, stacked on mobile.

Left column — the **Voyager pulsar map** rendered as faithfully as practical (see 6.2), with a single overlay caption beneath:

> *"If you find this drifting, here's where I am."* — SD

Right column — bio prose, reframed but content-preserved from the current site. Open with:

> CARGO MANIFEST — entry SD-01
>
> I'm a PhD researcher in socio-technical AI, exploring how Graph Neural Networks, Large Language Models, and neuro-symbolic architectures can transform legal reasoning and decision-making while considering their broader societal impacts and human-centered design.
>
> Before this, I spent ~4.5 years building production ML systems — most recently as a Senior ML Engineer at CVS Health, before that at Ikigai Labs, Squark, and an MIT-backed startup called Empallo. M.S. from Northeastern, B.Eng. from Monash.
>
> Off-mission: mathematics, programming as problem-solving, philosophy, and a long-standing addiction to landscape photography.

Below the prose, the **TRAINING LOGS** block — a reframed Education section:

```
TRAINING LOG / 02
INSTITUTION  Northeastern University, Boston MA
PROGRAM      M.S. Data Analytics Engineering
PERIOD       2021 — 2022
NOTES        GPA 3.76 / 4.00

TRAINING LOG / 01
INSTITUTION  Monash University, Kuala Lumpur MY
PROGRAM      B.Eng. Software Engineering (First Class Honours)
PERIOD       2017 — 2020
```

Below that, the **INSCRIPTION** — a single philosophy quote, in `Newsreader` serif when in Daylight Recovery mode, in `Space Mono` (italic) when in Night Ops. Curate from this short list — pick **one** and stick with it; do not rotate:

- Wheeler: *"It from bit."*
- Sagan: *"Somewhere, something incredible is waiting to be known."*
- Russell: *"The good life is one inspired by love and guided by knowledge."*
- Spinoza: *"All things excellent are as difficult as they are rare."*

Recommended default: **Wheeler**. It's the most personal to a mathematics-and-information-loving researcher, and it's short enough to feel etched rather than printed.

#### 4.2.3 MISSION LOG (Experience)

Section heading: **MISSION LOG**
Subheading: `// FIVE LOGGED MISSIONS — MOST RECENT FIRST`

Each role is a **mission record card**. Format:

The top card is the current PhD as `STATUS ACTIVE`. Show it first to demonstrate the active state and the open-ended window:

```
MISSION  M-05                           STATUS  ACTIVE
─────────────────────────────────────────────────────────
TITLE    PhD Research — Socio-Technical Legal AI
HOST     Monash University
SECTOR   Kuala Lumpur, MY
WINDOW   2026-01 / —

PAYLOAD NOTES
▸ Investigating how Graph Neural Networks, Large
  Language Models, and neuro-symbolic architectures
  can enhance legal reasoning while considering
  socio-technical dimensions and human-centered
  design principles
▸ [further bullets if Siddhant adds them]
```

A completed mission (e.g. M-04) follows the same format with `STATUS RECOVERED` and a closed window:

```
MISSION  M-04                           STATUS  RECOVERED
─────────────────────────────────────────────────────────
TITLE    Senior Machine Learning Engineer
HOST     CVS Health
SECTOR   Cambridge, MA
WINDOW   2024-09 / 2026-01

PAYLOAD NOTES
▸ [each existing bullet, preserved verbatim]
▸ ...
```

The "STATUS" field reads `ACTIVE` for the in-progress PhD (M-05) and `RECOVERED` for the four prior employment roles. The `WINDOW` field uses an em-dash for the open end of the active mission (`2026-01 / —`).

Mission numbering counts up chronologically by start date — M-01 Empallo, M-02 Squark, M-03 Ikigai, M-04 CVS Health, M-05 PhD — but cards display **most recent first** (M-05 at top). This is intentional: the visitor sees the latest mission first while the numbering hints at progression.

Use the `▸` glyph from the existing site for bullets; it fits the aesthetic.

#### 4.2.4 ONBOARD SYSTEMS (Skills)

Section heading: **ONBOARD SYSTEMS**
Subheading: `// FOUR SUBSYSTEMS, ALL NOMINAL`

Reframe the four categories:

| Old category | New subsystem name | Tagline |
|---|---|---|
| Machine Learning & AI | **COMPUTE / INFERENCE** | Models and reasoning |
| Programming & Frameworks | **PROPULSION** | Languages and frameworks |
| Cloud & DevOps | **GROUND INFRASTRUCTURE** | Deployment and orchestration |
| Data & Databases | **SENSOR ARRAY** | Data ingest and storage |

Each subsystem card displays its skills as small pill-shaped tags, but the pills should look like circuit components (hairline border, monospace label) rather than the current saturated gradient pills. On hover, the pill briefly lights up (`--instrument` border glow).

A small "NOMINAL" indicator (filled circle + label) sits in each card's header, all four green when in Night Ops, all four copper when in Daylight Recovery.

#### 4.2.5 ACTIVE PAYLOADS (Projects)

Section heading: **ACTIVE PAYLOADS**
Subheading: `// FIVE PROBES, VARIED TRAJECTORIES`

Each project is a **payload card**. Replace the current emoji icon with a small custom SVG mission patch — five unique simple geometric patches (a circle inscribed in a hexagon for "Healthcare Reco", a graph node cluster for "Time Series", etc.). Keep these *simple* — they should read at 64px.

Note: the PhD is treated as a mission (M-05 in the Mission Log) rather than a payload, so it is **not** repeated here. The five payloads come from the five non-PhD projects in the current site: Real-Time Healthcare Recommendations, Scalable Time Series Platform, Heart Failure Prediction System, GPU-Accelerated ML Pipeline, and DAESO Hackathon 2022.

Card format (example uses Real-Time Healthcare Recommendations as PAYLOAD-04):

```
[PATCH]   PAYLOAD-04
          Real-Time Healthcare Recommendations
          STATUS  RECOVERED

[existing description, preserved verbatim]

TELEMETRY  200ms response time, 25% throughput improvement

SUBSYSTEMS  [FastAPI] [MongoDB] [GPU Computing] [Vector Embeddings] [BigQuery]
```

The status string varies by project: `RECOVERED` for completed engineering work, `ARCHIVED` for community/leadership work. Roughly:
- CVS / Ikigai / Squark / Empallo engineering projects → RECOVERED
- DAESO Hackathon → ARCHIVED

Numbering for the five payloads can be assigned by the implementer — chronological by completion date is the cleanest default.

Optionally: a tiny inline canvas sparkline-meets-orbit per card, showing a stylized trajectory. Nice-to-have, not required.

#### 4.2.6 DOWNLINK (Photography — NEW)

Section heading: **DOWNLINK**
Subheading: `// IMAGERY RECEIVED FROM SURFACE`

This is a new section. Spec'd in detail in section 7.

#### 4.2.7 TRANSMISSION LOG (Blog)

Restyle the existing `/blog` route. The list page becomes a **transmission archive**:

```
TRANSMISSION LOG

▸ TX-003   2026-02-14   On gradient descent as a faith
▸ TX-002   2026-01-22   Notes on IRAC
▸ TX-001   2025-12-30   First post
```

Each post page gets a header block:
```
TRANSMISSION TX-003
ORIGIN     KUALA LUMPUR
TIMESTAMP  2026-02-14 09:23 MYT
SUBJECT    On gradient descent as a faith
```

Body uses the same `Inter` body font, but pull quotes in `Newsreader`. Code blocks use `Space Mono`.

#### 4.2.8 OPEN CHANNEL (Contact)

Section heading: **OPEN CHANNEL**
Subheading: `// TRANSMISSION OUTBOUND`

The form copy reframes the labels:
- `Name *` → `OPERATOR ID *`
- `Email *` → `RETURN FREQUENCY *`
- `Subject *` → `TRANSMISSION SUBJECT *`
- `Message *` → `PAYLOAD *`
- Submit button → `TRANSMIT`

The form mechanics (validation, the existing `/api/contact` POST, loading/success/error states) **do not change**. Only the styling and copy change.

Below the form, the direct-contact buttons become a `DIRECT FREQUENCIES` block — same four links (Email, LinkedIn, GitHub, Phone) but styled as instrument buttons. Remove the green "Call" button color — use the same `--instrument` accent for all four.

### 4.3 Navigation

The top nav becomes a thin, instrument-panel-style bar:

```
[SD-01]   GROUND  MANIFEST  LOG  SYSTEMS  PAYLOADS  DOWNLINK  TX  CHANNEL   [☾/☀]
```

Use abbreviated labels (`GROUND`, `LOG`, `TX`) to fit on one line at desktop. On mobile, collapse into a slide-down panel with the full labels.

The wordmark "SD" becomes `SD-01` in monospace.

The dark mode toggle icon should swap between a moon and sun glyph as currently, but rendered as thin-stroke SVG matching the rest of the iconography.

---

## 5. Live Data & Telemetry

This is the section that makes the portfolio feel alive. Build it carefully.

### 5.1 Telemetry widgets and their homes

**Hero (4–6 widgets, right column):**

1. **ISS POSITION** — live lat/lon, updating every 5s.
   - Source: `https://api.wheretheiss.at/v1/satellites/25544` (no API key required).
   - Display: `ISS · LAT  -23.41°  LON  117.82°` (one decimal place, fixed width via monospace).
2. **MOON PHASE** — current illumination % and named phase.
   - Source: compute locally with `astronomy-engine` npm package; no API needed.
   - Display: `MOON · WAXING GIBBOUS · 67%`.
3. **NEXT ISS PASS** — if visitor grants geolocation, show next overhead pass time.
   - Source: same `wheretheiss.at` (POST `/coordinates`), or `n2yo.com` API if key is acquired.
   - Display when permitted: `NEXT ISS PASS · 04h 23m (over you)`.
   - Display when denied: `NEXT ISS PASS · GEOLOC DENIED` (don't hide the widget; show the state).
4. **APOD** — NASA Astronomy Picture of the Day thumbnail (40x40) + date + clickable.
   - Source: `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY` (DEMO_KEY works for low volume; if traffic grows, register a real key and store in `NASA_API_KEY` env var).
   - Display: small thumbnail + date + truncated title; click opens APOD page in new tab.
5. **NEAR-EARTH OBJECTS TODAY** — count of NEOs passing today.
   - Source: NASA NeoWs feed `https://api.nasa.gov/neo/rest/v1/feed?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`.
   - Display: `NEO PASSES TODAY · 12`.
6. **VOYAGER 1 MISSION ELAPSED TIME** — live tick-up since 1977-09-05 12:56:00 UTC.
   - Source: pure JS computation.
   - Display: `V1 · MET 48y 252d 14h 03m` (updates every second).

**Scattered elsewhere (smaller, atmospheric):**

- **In the Mission Log section header**, a tiny solar wind speed readout from NOAA SWPC (`https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json`). Just one number with a label: `SOLAR WIND · 412 km/s`.
- **In the Open Channel section**, a "carrier signal" indicator that pulses gently to suggest the channel is open.

### 5.2 API proxy pattern

All external API calls go through Next.js Route Handlers in `app/api/telemetry/[feed]/route.ts`. Reasons:
- Hides API keys server-side.
- Allows server-side caching (revalidate every N seconds — 5s for ISS, 1h for APOD, 6h for NEOs).
- Provides a single place to implement fallback logic.

Example structure:
```
app/api/telemetry/iss/route.ts
app/api/telemetry/apod/route.ts
app/api/telemetry/neos/route.ts
app/api/telemetry/launches/route.ts
app/api/telemetry/solar-wind/route.ts
```

Each route returns a consistent envelope:
```ts
{
  status: "ok" | "stale" | "error",
  data: { ... },           // the actual payload, shape depends on feed
  fetched_at: ISOString,
  source: string,          // e.g. "wheretheiss.at"
}
```

### 5.3 Fallback strategy

Every widget must have a graceful failure mode. **Never show "Loading..." for more than 1 second**, and never show an empty box. The hierarchy:

1. **Live data available** → show it with `--instrument` accent.
2. **Cached data available (within last hour)** → show it with `--warning` accent and a `STALE` label.
3. **No data available** → show last-known-good value (hardcoded fallback) with a `LAST KNOWN` label, e.g. `MOON · WAXING GIBBOUS · 67% (LAST KNOWN)`.

This means even with the entire internet on fire, the dashboard *still looks operational*. That's the whole point.

### 5.4 Refresh cadence

| Feed | Server-side cache | Client-side poll |
|---|---|---|
| ISS position | 5s | 5s |
| Moon phase | n/a (computed) | recompute every 60s |
| APOD | 1h | 1h |
| NEOs | 6h | on page load only |
| Next launch | 30m | 30m |
| Solar wind | 5m | 5m |
| Voyager MET | n/a | every 1s (pure JS, no network) |

Use React Server Components for initial hydration where possible; clients fetch from `/api/telemetry/...` for updates.

### 5.5 Geolocation

- Request only on user gesture (clicking the "ENABLE LOCAL TELEMETRY" button in the hero).
- If granted: enables "Next ISS pass over you" and Local Sidereal Time accuracy.
- If denied: show the denial state in the widget; do not re-prompt.
- Coordinates are used only client-side; do not send them anywhere.

---

## 6. Canvas & 3D Pieces

Three.js work is gated behind two conditions:
- Viewport width ≥ 768px (mobile gets static SVG fallbacks).
- `prefers-reduced-motion: no-preference`.

Use `@react-three/fiber` and `@react-three/drei` to keep React idioms. Lazy-load all 3D pieces via dynamic imports — they should not block initial paint.

### 6.1 Hero Earth + ISS (signature piece)

A stylized Earth in the center of the hero HUD.

- **Style:** low-poly or thin-line wireframe; **not photoreal**. The aesthetic is "instrument representation of Earth", not "Google Earth screenshot." Aim for ~200–500 triangles. Wire/edge color is `--instrument`; faces transparent or very dark.
- **Rotation:** slow, real-time-locked rotation matching Earth's actual axial rotation rate (one rotation per sidereal day). Not faster.
- **Markers:**
  - A pulsing dot at Kuala Lumpur (3.139°N, 101.687°E).
  - A small ISS marker following the real ISS orbit (~51.6° inclination, ~408km altitude, ~93min period). Update its position from the live ISS feed every 5s.
- **Interaction:** none by default. No drag-to-rotate; that's a different kind of toy. If we want interactivity, gate it behind a "MANUAL" toggle.
- **Fallback (mobile / reduced motion):** a static SVG of Earth with the same two markers and a small note `[STATIC VIEW]`.

Don't add: atmospheric glow, cloud layer, sun halo, lens flares, stars in the background of the canvas (the page already has a hairline grid backdrop — adding stars there competes with it).

### 6.2 Personal Pulsar Map (Manifest section)

The Voyager Golden Record's pulsar map, rendered faithfully.

- 14 line segments radiating from a central point (Sol). Each line's length corresponds to a real pulsar's distance from Sol. Each line is overlaid with a binary tick pattern encoding the pulsar's pulse period (this is the iconic look).
- At the bottom, the hyperfine hydrogen unit (two atoms and the 21cm wavelength reference) — the universal "this is what time means" element.
- Centerpiece annotation: `IF YOU FIND THIS DRIFTING, HERE'S WHERE I AM. — SD` in `Newsreader` italic.
- **Rendering:** SVG, not canvas. Static. Inline in the page so it's accessible.
- **Interaction:** hovering a line reveals the pulsar's name and distance in a small tooltip. Hovering the hyperfine glyph reveals: `THE UNIT IS 1420.405 MHz — THE 21CM HYDROGEN LINE — IF YOU UNDERSTAND THIS, YOU UNDERSTAND THE TIMES BELOW.`

Reference the original Voyager Golden Record cover image when implementing. Real pulsar names and distances are public — use the actual 14, not invented ones.

### 6.3 Photography panorama (Downlink section)

For photos Siddhant flags as `panorama: true` in their metadata, mount the photo on a sphere in Three.js and let the user drag-pan around it. For regular photos, just show them in the gallery.

- Use `THREE.SphereGeometry` with inverted normals (camera inside the sphere).
- Texture is the panorama image (equirectangular projection).
- Drag-to-pan, no zoom (zoom is a different UX and adds bugs).
- Auto-pan slowly when idle so the panorama feels alive.
- Mobile: replace with the static photo; don't try to do drag-pan on touch.

Even if Siddhant has no panoramas to start, build the capability. He can add later.

### 6.4 Small live math demo (Onboard Systems section, optional)

In the **COMPUTE / INFERENCE** subsystem card, embed a tiny canvas showing one of:
- A live gradient-descent demo (a ball rolling down a 2D loss surface, restarting from random starts).
- A tiny attention-mechanism visualizer (a few tokens, animated attention weights).
- A 3-body simulation (gravitational, three masses, drawing trails).

Recommendation: **3-body**. It's mathematically beautiful, runs forever without needing labels, ties to space rather than ML, and is a known cool-thing-to-watch. Use Verlet integration, ~100px square, autoplay, never repeats.

Keep this strictly under 200 lines of TS. If it grows, cut it.

### 6.5 Constellation overlay (cross-section connector)

A fixed-position canvas overlay on top of the page (`pointer-events: none`, z-index above content but below modals) that draws hairline lines between key headings as the user scrolls. The effect: as you move from section to section, faint lines connect the previously-visible heading to the newly-arriving one — a "constellation" forming.

Use the `--inert` color, very low opacity (0.15–0.25). Fade in and out, never solid. Disable under `prefers-reduced-motion`.

If this feels like too much, ship without it; the page works fine without.

---

## 7. Photography Section (DOWNLINK)

This is a new section. Spec it carefully.

### 7.1 Conceptual frame

Siddhant's general landscape photography, *framed thematically as imagery returned from the surface*. The frame is in the copy and metadata — the photos themselves are presented honestly (no fake "Mars overlay" filters or kitsch).

### 7.2 Data model

Photos live in `public/photography/` as JPEGs. Metadata lives in `content/photography/index.json`:

```json
[
  {
    "id": "img-001",
    "src": "/photography/cameron-highlands-2023.jpg",
    "title": "Cameron Highlands, MY",
    "captured_at": "2023-08-14",
    "location": { "lat": 4.470, "lon": 101.388, "name": "Cameron Highlands, Pahang" },
    "exif": { "camera": "Fujifilm X-T4", "lens": "16-80mm", "focal": "23mm", "aperture": "f/8", "shutter": "1/250s", "iso": 200 },
    "caption": "Tea estate, morning. The clouds were lower than the road.",
    "featured": true,
    "panorama": false
  },
  ...
]
```

EXIF can be extracted at build time with `exifr` or hand-entered. If a field is unknown, omit it; don't show `null`.

### 7.3 Layout

- Top: one large featured photo (rotated daily or per page load from those flagged `featured: true`).
- Below: a masonry-ish grid of thumbnails (CSS grid with `grid-auto-rows: 200px` and `grid-row: span N` based on aspect ratio).
- Click a thumbnail → full-screen lightbox with the photo, caption, and metadata sidebar.
- The metadata sidebar styling reads like an APOD entry:

```
DOWNLINK · IMG-001
─────────────────────────
CAPTURED   2023-08-14
SECTOR     CAMERON HIGHLANDS, MY
COORDS     4.470°N  101.388°E
INSTRUMENT FUJIFILM X-T4 · 16-80MM
EXPOSURE   1/250s @ f/8 · ISO 200

NOTES      Tea estate, morning. The clouds
           were lower than the road.
```

### 7.4 Behavior

- Lightbox supports left/right arrow nav between photos, ESC to close, swipe on mobile.
- If `panorama: true`, the lightbox shows the panorama viewer (section 6.3) instead of the flat image.
- The grid lazy-loads images using `next/image` with `placeholder="blur"` so they ladder in cleanly.
- Total photos at launch: start with 6–12; the system supports more.

### 7.5 What not to do

- Don't add a "filter" toggle (B&W, vintage, etc.) on top of the photos. The metaphor doesn't need it and it cheapens the photography.
- Don't add captions overlaid on the photos in the grid. Captions live in the lightbox metadata.
- Don't add a "share to social" button. The site is the destination.

---

## 8. Easter Eggs & Personality Hooks

These are small, optional, but they're what make a visitor remember the site.

### 8.1 Boot sequence (first visit only, 2–3 seconds)

On first load of the page, before the hero renders, show a centered terminal-style boot sequence. Lines appear one at a time with ~250ms delay between, in `--instrument` cyan on `--bg` void:

```
> ESTABLISHING UPLINK ...
> HANDSHAKE  ............  OK
> AUTHENTICATING OPERATOR  ............  SD-01
> LOADING TELEMETRY ARRAY  ............  OK
> WELCOME, OPERATOR.
> SCROLL TO ENTER LOG.
```

After the last line, fade the boot panel out (300ms) and reveal the hero HUD beneath it.

- Skippable: any key press, click, or scroll skips to the end immediately.
- Plays at most once per session (track in `sessionStorage`).
- Disabled under `prefers-reduced-motion` — go straight to hero.
- Mobile: shorten to 1.5s, fewer lines (drop "AUTHENTICATING" and "LOADING").

### 8.2 Console signal (dev console Easter egg)

On every page load, log a quiet ASCII signature to the dev console — nothing flashy, just a thoughtful touch for devs who open inspector:

```
%c
       /\
      /  \
     / SD \      SD-01
    /------\     siddhantdube1.github.io
   /        \
  /          \   Try: signal()
 /____________\
```

And expose `window.signal()` which returns a short curated message, e.g.:

```
> signal()
"In the long arc of cosmic time, hello. — SD"
```

Keep it dry. No Rick Roll. No ASCII art of a rocket. The dev console is a quiet room; whisper.

### 8.3 Philosophy crossfades (sparing)

At three or four scroll positions across the page, a small italicized quote fades in at the edge of the viewport, stays for ~4 seconds, then fades out. Curate to 3–4 quotes total:

- After Manifest: *"It from bit."* — Wheeler (this matches the inscription; use a different one here if duplication bothers you)
- Between Mission Log and Onboard Systems: *"Mathematics is the music of reason."* — Sylvester
- Between Active Payloads and Downlink: *"The eye sees only what the mind is prepared to comprehend."* — Bergson
- Before Open Channel: *"The universe is under no obligation to make sense to you."* — Tyson

Position these at low contrast, in `Newsreader` italic, never blocking interactive content. Disable under `prefers-reduced-motion`.

### 8.4 404 — Signal Lost

The 404 page (`app/not-found.tsx`):

```
TELEMETRY DROPOUT
─────────────────
SIGNAL LOST AT  [requested path]
ATTEMPTING RECONNECT . . .

[ RETURN TO BASE ]
```

The "attempting reconnect" line gets a blinking cursor at the end. Clicking "RETURN TO BASE" navigates to `/`.

### 8.5 Mission patches

Each of the five payload cards gets a unique small SVG mission patch. Design language: thin stroke, circular badge, single accent color, geometric. Recommend hand-drawing these in Figma or Affinity Designer, exporting as SVG, dropping in `public/patches/`. Five is a small enough number to do well; don't farm out to an icon library.

If patches aren't ready at launch, use simple geometric placeholders (circle, hexagon, triangle, square, rhombus) — better than emoji or stock icons.

---

## 9. Tech Stack Additions

### 9.1 Add

- `three` (Three.js core)
- `@react-three/fiber` (React renderer for Three.js)
- `@react-three/drei` (helpers — OrbitControls, useTexture, etc.)
- `astronomy-engine` (local computation of moon phase, sun position, sidereal time, planet positions)
- `exifr` (build-time EXIF extraction from photography JPEGs) — optional, dev dependency

### 9.2 Keep

- `next` 15.x — App Router, RSC, Route Handlers
- `react` 19.x
- `typescript`
- `tailwindcss` — extend the theme with the CSS variables in section 3.3
- `lucide-react` — functional icons only; not for decorative SVGs

### 9.3 Don't add

- `framer-motion` — the motion vocabulary here is mechanical, and CSS transitions + Web Animations API are sufficient. Don't import a 30kb animation library to do what `transition-opacity duration-200` already does.
- A UI component library (shadcn, Radix beyond what's needed for the menu, Headless UI) — the design is custom enough that these will fight you more than help.
- A 3D model loader unless you actually need to load a model. The Earth in 6.1 is procedural.

---

## 10. What to Preserve (Don't Touch the Wires)

These pieces work; the rebuild is about presentation, not infrastructure.

- `app/api/contact/route.ts` — the contact form handler.
- `lib/blog.ts` — markdown blog reader.
- `content/blog/` — existing posts.
- `app/blog/` route structure (page + `[slug]`).
- `public/Profile.jpg` — keep the file; reuse for the operator avatar in Ground Station's identity block.
- `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs` — only modify if needed.
- The dark-mode toggle mechanism (`localStorage` persistence, `prefers-color-scheme` initial detection, `document.documentElement.classList`) — keep the machinery, change the labels and what each mode looks like.

All experience bullets, education entries, project descriptions, stats numbers, and contact details remain content-preserved. Only the **presentation** of this content changes.

---

## 11. What to Discard / Replace

- The blue → purple → indigo gradient palette, everywhere it appears. Replace with the two-mode token system in section 3.3.
- All `hover:-translate-y-1`, `hover:-translate-y-2`, `hover:-translate-y-3`, `hover:scale-105` motion. Replace with brightening hover.
- All `bg-gradient-to-*` decorative gradients. Replace with solid panel surfaces (`--bg-elevated`).
- The current emoji project icons (🎓 🏥 📊 🧠 ⚡). Replace with SVG mission patches.
- The "Get In Touch" CTA in the hero. Remove. The hero is not a landing page.
- The bouncing chevron in the hero. Remove.
- The "Featured Projects", "Technical Expertise", "About Me", "Let's Connect", "Professional Experience" headlines. Replace with the section names in section 4.1.
- The animated blurred blob backgrounds in the hero (`bg-blue-200 ... rounded-full ... animate-pulse`). Remove. The hairline grid and the 3D Earth do this work better.
- Soft drop shadows (`shadow-lg`, `shadow-xl`, `shadow-2xl`). Replace with hairline borders (`border border-[--inert]`) plus optional inner glow on focus/hover.
- The contact section's separate green "Call" button color. Standardize all four direct-frequency buttons to use `--instrument`.

---

## 12. Anti-Patterns (Do Not Do)

If any of these appear in the build, the metaphor has failed:

1. **A floating astronaut illustration** anywhere on the page.
2. **A rocket-shaped cursor** or a custom cursor of any kind.
3. **A generic CSS starfield** with twinkling white dots as the *primary* space cue. (The Earth canvas + grid are enough. Stars-as-background is the laziest space-theme move there is.)
4. **"Exploring the universe of [code/data/ideas]"** in any tagline, hero copy, blog post title, or about paragraph. Same for "infinite possibilities" and "to infinity and beyond."
5. **Planet emoji** as section icons (🪐 🌍 🌙 ☄️).
6. **A solar system where the planets are clickable nav links** that scroll you to each section. This is the most common "creative" space portfolio cliché.
7. **Parallax-scrolling nebulae** in the background.
8. **Lottie animations of orbiting things** anywhere on the page.
9. **Light mode that is just "dark mode but inverted"** — Daylight Recovery is a different posture, not a chromatic flip. See section 3.1.
10. **Bouncy, springy, elastic motion** anywhere. The vocabulary is mechanical.
11. **Centered text-only hero** with name + tagline + two CTAs. The HUD is the hero.
12. **A "loading screen" longer than 2 seconds.** The boot sequence is the only welcome animation and caps at 3s skippable.
13. **Hard-coded `Loading...` text** displayed for more than 1 second. Show the data, the stale data, or the last-known value — always something.

---

## 13. Implementation Phases

Build in this order. Don't move to the next phase until the current one is stable.

### Phase 0 — Setup (small, ~half day)
- Install `three`, `@react-three/fiber`, `@react-three/drei`, `astronomy-engine`.
- Extend Tailwind config with the CSS variable system (section 3.3).
- Add `next/font` for `Space Mono`, `Inter`, `Newsreader`.
- Add the hairline-grid background to `globals.css`.
- Verify dark/light toggle still works with the new tokens.

### Phase 1 — Skeleton & typography (most of day 1)
- Rebuild `app/page.tsx` with new section structure and copy from section 4.2.
- New nav bar (section 4.3).
- No live data yet — use static placeholder values.
- No canvas yet — use a placeholder div where the Earth will go.
- Reframe the contact form with new labels (mechanics unchanged).
- Reframe the blog list and post pages.
- At end of phase: the site is content-complete and aesthetically committed, just static.

### Phase 2 — Live telemetry (day 2)
- Build the `app/api/telemetry/*` Route Handlers (section 5.2).
- Wire up all 6 hero widgets (section 5.1).
- Implement the fallback hierarchy (section 5.3).
- Add the bottom-strip ticker.
- Verify caching and refresh cadences.

### Phase 3 — Hero Earth + ISS (day 3)
- Implement section 6.1 with `@react-three/fiber`.
- Make sure ISS marker pulls from the live ISS feed.
- Add mobile/reduced-motion SVG fallback.
- Add the pulsing KL marker.

### Phase 4 — Manifest & pulsar map (day 4)
- Build the Manifest section layout.
- Render the Voyager pulsar map as SVG (section 6.2). This is detailed work — give it the time.
- Hover tooltips on pulsar lines.
- Inscription quote with mode-aware typography.

### Phase 5 — Photography section (day 5)
- Implement section 7 end to end.
- Stub `content/photography/index.json` with 2–3 placeholder entries; Siddhant can fill in real photos after.
- Lightbox + panorama viewer.

### Phase 6 — Polish (day 6)
- Boot sequence (8.1).
- Console signal Easter egg (8.2).
- Philosophy crossfades (8.3) — sparingly.
- 404 page (8.4).
- Mission patches (8.5) — placeholders if final patches aren't ready.
- Audio toggle (3.6) if shipping audio.
- Optional: 3-body math demo (6.4), constellation overlay (6.5).

### Phase 7 — A11y, performance, mobile (day 7)
- Lighthouse pass: target 95+ on performance, 100 on a11y, 100 on best-practices.
- Test under `prefers-reduced-motion`.
- Test with screen reader.
- Test on a real phone (not just devtools).
- Verify keyboard navigation through every section.

Total estimate: 7 working days for a careful single-developer build. Less if Phases 5–7 are scoped down.

---

## 14. Accessibility & Performance (Non-Negotiables)

- All color combinations must hit WCAG AA (4.5:1). Verify both themes.
- All canvas/3D content must have an `aria-hidden="true"` wrapper and a text equivalent nearby (e.g., the hero's identity block fully describes what the Earth canvas conveys visually).
- All telemetry numerics use `aria-live="polite"` so screen readers announce updates without interrupting.
- Every interactive element is keyboard-reachable with a visible focus ring (hairline `--instrument` in Night Ops, hairline `--ink` in Daylight Recovery).
- `prefers-reduced-motion` kills: boot sequence, Earth rotation, ISS animation, philosophy crossfades, constellation overlay, panorama auto-pan, 3-body demo.
- LCP target: < 2.0s on a Moto G Power on 4G.
- Total JS shipped to the client should stay under 300kb gzipped. If Three.js + dependencies push past this, dynamic-import the 3D pieces so they're not in the initial bundle.
- All photos served via `next/image` with `loading="lazy"` and `placeholder="blur"`.

---

## 15. Open Questions & Decisions Deferred to Implementation

These are things the implementer can decide if the spec doesn't pin them down. Document the choice in code comments.

1. **Exact pulsar set in 6.2.** The original 14 is the safe choice. If any are now considered uncertain in the literature, swap to verified ones.
2. **Which philosophy quote in the Manifest inscription.** Default Wheeler; Siddhant can override.
3. **Whether to ship the 3-body demo (6.4) and constellation overlay (6.5).** Both are nice-to-haves. If the build is running long, defer to v2.
4. **Mission patch designs.** Five patches needed. If not ready, ship with geometric placeholders.
5. **Daylight Recovery sound design.** Spec says silence; if you find a tiny "page-turn" sound that doesn't feel kitsch, propose it.
6. **Whether to allow Earth interaction (drag-to-rotate).** Default off — the spec argues no. If the implementer feels strongly, ship behind a `MANUAL` toggle.
7. **Blog post numbering (TX-001, TX-002, ...).** Auto-generate from sorted creation date, or store explicit `tx_number` in frontmatter? Recommend auto-generate.

---

## 16. One-Line Mission Statement

> *A working ground-station console, operating one mission: Siddhant.*

If a design or copy decision contradicts that statement, the statement wins.

---

*End of specification. Build carefully.*