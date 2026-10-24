# RYVO — Design System

**Status:** M1 tokens and M2 marketing implementation verified on 2026-10-24. Later product surfaces remain planned. See `IMPLEMENTATION_M1_M2.md` for evidence and scoped design-review dispositions.
**Reference reviewed:** [Kelvin](https://kelvin.8b.com/), inspected 2026-10-24. The user explicitly requested Kelvin’s layout and motion adapted to PULSE. The current marketing page closely reconstructs its composition using PULSE content, original generated imagery, openly licensed fonts, and original component code. This revision supersedes the initial loosely inspired direction.

## Current RYVO revision

Public branding is RYVO. The rhythm experiment uses a yellow field, cream instrument, black rules, condensed Hubot numerals, and expanded Kalnia heading. Avoid the earlier dark dashboard styling on this section and the preparation preview. The main CTA opens the working demo. Internal `--pulse-*` tokens remain compatible with the foundation; earlier product specifications below are historical guidance where superseded by this implemented revision.

## Overview

PULSE should feel like a night run edited into an art-direction reel: a dark field, one hot signal, disciplined typography, and motion that behaves like a measured pulse. Marketing uses large editorial statements and asymmetrical compositions. The active run uses sparse instrumentation and exact units. The product must never become a generic SaaS dashboard, a set of identical rounded cards, or a wall of glass panels.

Kelvin's reachable page provides concrete inspiration: dark plum and warm off-white fields, narrow uppercase navigation, a large display serif with a restrained sans, a thermal spectrum from blue/cyan through yellow/orange/red/magenta, oversized hero type, asymmetric image/text compositions, 12-column editorial grids, thin rules, long section spacing, line/ring geometry, and staged entrance motion. It uses fluid sizing and reduced-motion branches. PULSE translates those ideas into heat, stride, signal lines, and licensed running imagery. It must not copy Kelvin's logo, photos, text, CSS, or assets.

## Brand principles

1. Movement is the brand mark. Lines, numerals, and gradients imply a changing pace.
2. Heat is information. Red, orange, and magenta indicate energy or signal state, not decoration everywhere.
3. Editorial comes before instrumentation. Narrative establishes the product before controls appear.
4. Precision belongs at the point of action. Units, confidence, permissions, and status are explicit.
5. Quiet surfaces make the pulse legible. Prefer flat fields, rules, and negative space over glass effects.
6. Athlete imagery is licensed, consented, varied, and paired with useful alt text.

## Color tokens

Define these in `app/globals.css` and mirror semantic aliases in Tailwind. Components must consume semantic tokens rather than raw hex values.

| Token | Value | Use |
|---|---:|---|
| `--pulse-void` | `#110D19` | page background |
| `--pulse-ink` | `#F1EDE4` | primary text |
| `--pulse-ash` | `#B9B0B8` | secondary text |
| `--pulse-dim` | `#9D939E` | tertiary text, never sole status signal |
| `--pulse-rule` | `#302833` | rules and quiet borders |
| `--pulse-panel` | `#151118` | solid instrument surface |
| `--pulse-panel-raised` | `#1D1620` | focused controls and menus |
| `--pulse-red` | `#FF2D3F` | error and hot signal |
| `--pulse-orange` | `#FF7A1A` | active signal |
| `--pulse-magenta` | `#F044A7` | adaptation accent |
| `--pulse-yellow` | `#FFD447` | caution/high energy |
| `--pulse-cool` | `#6DA7FF` | informational only |
| `--pulse-success` | `#A6D875` | ready/saved/granted |

Signal gradient: `linear-gradient(115deg, #FF2D3F 0%, #FF7A1A 38%, #FFD447 58%, #F044A7 100%)`. Use it for hero accents, waveform strokes, and active progress, not paragraph text without a contrast check. Body text must meet 4.5:1 and large text 3:1. Status always includes text or an accessible icon; color is never the only signal.

The foundation uses `#9D939E` for `--pulse-dim`. This supersedes the earlier `#756E78` draft value identified by design-review finding F-15 as below the normal-text contrast target. The overall design gate remains `CHANGES_REQUESTED` until the other review findings are reconciled.

## Typography

Current marketing typography uses self-hosted Hubot Sans variable (weight 200–900, width 75–125%) and Kalnia variable (weight 100–700, width 100–125%), pinned Fontsource 5.3.0 packages with OFL notices. JetBrains Mono remains the metric font. `--pulse-font-display`, `--pulse-font-text`, `--pulse-font-editorial`, and `--pulse-font-mono` expose reusable families.

| Style | Font | Treatment |
|---|---|---|
| Thermal wordmark | Hubot Sans 300 / 75% width | Fluid viewport-scale type, vertical stretch, full-spectrum gradient |
| Editorial headings | Kalnia 200 / 125% width | Fluid 2.3–6.8rem sizes, near-unit line height, negative tracking |
| Body | Hubot Sans 400 | 16–20px, 1.4–1.55 line height |
| Labels / navigation | Hubot Sans 650–850 | Small uppercase labels; 75–100% width |
| Metrics | JetBrains Mono 500 | Tabular numerals, explicit units |

Use sentence case for product copy and uppercase only for short labels. Numeric values use tabular numerals so changing values do not shift nearby layout.

## Responsive layout

Use fluid CSS first. Breakpoints change structure only:

- Below 768px: 20px gutters, disclosed navigation, intro followed by portrait/metric pair, two-column editorial posters, stacked ratio panels.
- 768–999px: 3vw gutters, desktop navigation and layered hero, static editorial/gallery layouts.
- From 1000px: 3vw gutters, pinned poster unfolding and horizontal gallery when motion is allowed; complete static grids otherwise.
- Content shell is capped at 1920px. All static content remains in the reading order.

Editorial sections may place copy in columns 1–5 and media/instrumentation in 7–12. The active run at `lg` has a seven-column metric field and five-column track/control rail. At mobile, controls precede secondary details and the primary metric remains first in reading order. Test at 320px width and 200% zoom.

## Spacing and grid

Use a 4px base scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160px`. Section separation is `clamp(80px, 12vw, 192px)`. Interactive controls are at least 44px tall with 8px minimum gap. Rules are 1px and use `--pulse-rule`.

## Components

### Wordmark and navigation

The current marketing wordmark is condensed, heavy PULSE text. The original three-bar favicon remains; the inline glyph is hidden in this revision. Header links are Product, How it works, Demo, and Start a run. On mobile, use a labeled menu button. During a run, hide marketing navigation or use a solid fixed header that cannot obscure controls.

### Signal badge

A badge contains a 6px dot, status word, and optional explanation. States include Ready, Listening, Synchronized, Stabilizing, Sensor lost, Audio limited, and Simulation. A dot alone is invalid.

### Hero and metric field

The current hero layers a viewport-scale thermal PULSE title, a central generated athlete portrait with an animated natural-light band, an elliptical rule, bordered intro, and dark simulation metric. It uses cream and pink fields above a dark reflected-wordmark transition. A large illustrative number such as `172 steps/min` is explicitly labeled Simulation. A metric field includes label, value, unit, trend/status, and optional sparkline. It is a ruled flat region, not a rounded card. Pace, cadence, and target BPM always use separate labels.

### Run instrument

The active run contains cadence as the dominant value, a text-equivalent rhythm trace, target BPM, current track, ratio selector, pace/distance row, persistent status, and pause/end controls. SVG or canvas is an enhancement; all values remain in text.

### Track list and controls

Tracks appear in a ruled editorial list with title, artist, Local source, BPM, confidence, and play state. Keyboard reorder controls supplement any drag handle. Primary actions are rectangular with a 1px border and signal-gradient hover/focus. End run requires confirmation on touch. Sliders expose numeric values and keyboard increments.

### Permission and failure panel

Use a solid field with a left signal rule. State capability, reason, limitation, and next action: “Motion access is blocked. Continue in Simulation, or open browser settings and try again.” Use a modal only when the action cannot continue otherwise.

## Motion principles

GSAP and ScrollTrigger own page-level marketing reveals and image treatment. Motion for React owns local status/list transitions. One library owns each animation. Neither owns the session clock.

The user-authorized reference revision uses staggered wordmark entrances (1.4s), portrait reveal (1.1s), a reversible thermal scan and aura, bounded portrait parallax, 30px editorial reveals, desktop pinned poster unfolding, and a horizontal heat-to-light gallery. Pause motion restores the static composition, and reduced motion bypasses the enhancement entirely. Static content remains visible if JavaScript is unavailable. The run visualizer updates from a smoothed cadence envelope no more than 30 times per second. Audio has its own clock. Metric interpolation lasts 250ms only when a value changes meaningfully. Do not animate every sensor sample. Reduced motion disables parallax, morphing, auto-scroll, and nonessential transitions, leaving immediate state changes and a static rhythm trace.

## Accessibility

Every control has visible text or an accessible name and a 2px `:focus-visible` outline with 3px offset. Announce permission outcomes and meaningful warnings through a polite live region, never each cadence sample. Provide text summaries for cadence plots, sync timelines, and history charts. Support keyboard navigation, Escape for menus, and non-drag reorder. Provide captions/transcripts for video and meaningful alt text for action imagery. Audio controls include mute, volume, and a local-processing explanation.

## Page direction

- **Landing `/`:** near-black asymmetric hero, original title, simulation readout, ratio demonstration, two-mode split, dramatic image/motion sections, privacy/capability explanation, final CTA. Sections are separated by rules and space rather than panels.
- **Run preparation `/run/new`:** quiet technical sequence for mode, audio, permissions, and readiness. Simulation is offered first and clearly labeled.
- **Active run `/run/[id]`:** cadence dominates; target, track, pace, and distance remain immediate but subordinate. No marketing navigation competes with controls.
- **History `/history`:** an editorial archive list. Detail uses one cadence/target visualization and plain-language sync events, not a dense dashboard.
- **Library `/library`:** vertical track and playlist lists, BPM/confidence column, local-only import copy, inline manual correction. Explain why streaming tracks cannot be processed.
- **Settings `/settings`:** Run, Audio, Permissions, and Privacy rows with descriptions. Audio rows expose file size, channel, ratio bounds, and original-tempo fallback. Permission status and retry behavior are explicit.

## Asset and implementation rules

Use only licensed or generated imagery with an asset manifest, source, license, and alt text. Do not copy Kelvin assets or proprietary typography. Encode tokens in `app/globals.css`, Tailwind aliases, and tested primitives under `components/pulse/`. M1/M2 tokens, primitives, marketing components, and asset manifest now exist. Later product components remain planned.

## Current marketing composition

Cream layered thermal hero → dark reflected-wordmark manifesto and four metrics → cream unfolding six-poster study → pink/yellow/blue beat-ratio panels → dark heat/light gallery → cream brand statement → dark functional rhythm instrument → cream FAQ → dark runner/CTA and editorial footer. This user-authorized reference adaptation supersedes earlier landing composition suggestions; future run surfaces remain planned.
