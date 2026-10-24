# RYVO functional MVP — current handoff

Updated 2026-10-24. The user explicitly authorized the simulator, local audio, and adaptive synchronization MVP after M1/M2. `/run/new` is now the functional run studio, not a placeholder. Read `IMPLEMENTATION_STATUS.md` for the before/after audit and final test evidence, and `docs/FUNCTIONAL_MVP.md` for the current contract and manual verification steps.

Implemented scope: prepare/start/pause/resume/end, active timer, seeded 120–200 cadence with smoothing, target ratios, real local audio import/playback/seek/volume, ordered temporary playlist, limited WAV BPM analysis with manual correction, exact automatic matching hysteresis, browser-native pitch-preserving bounded tempo adaptation, and an analyser-driven visualizer. The existing landing visual language and motion are preserved. The removed Pause motion button remains absent.

The user-approved native MVP supersedes the earlier worklet-only plan for this phase. Full original M3–M7 criteria are not declared complete: durable storage/recovery, GPS/raw-motion simulation, crossfades and custom AudioWorklet remain unimplemented. Sessions and files are explicitly unsaved and temporary. Database, authentication and deployment must not be started in this task. The historical preparation verdict is retained rather than falsely approved.

Use `npm run typecheck`, `npm run lint`, `npm run test:unit -- --run`, `npm run test:components -- --run`, `npm run build`, and `npm run test:e2e -- --workers=1`. The e2e config has Chromium plus Firefox/WebKit run-workspace suites and owns port 3100. On macOS, keep the machine awake during real audio tests; `caffeinate -di npm run test:e2e -- --workers=1` scopes that to the test process. `test:integration` remains deferred database work, not audio evidence. Audio integration is exercised with actual WAV files in Playwright.

Preserve the intentional deleted AskMongo baseline and source boundaries. No commit/deployment is implied. Historical handoff follows for context only.

---

# RYVO current handoff — M1 and M2

**Updated 2026-10-24.** M1 foundation and M2 premium landing are implemented and verified in `/Users/shivain/Desktop/chenyun project`. The direct user request authorized both milestones in sequence. M3–M10 remain planned; no later milestone was started.

Read `docs/IMPLEMENTATION_M1_M2.md` for scope, decisions, final verification, and unresolved issues; `tasks.md` records the current status. The overall design verdict remains `CHANGES_REQUESTED`. Do not use the historical preparation-only statements below as the current implementation state.

Current visual revision: public branding is RYVO. The yellow “Find your frequency” section uses a cream editorial instrument, and the preparation preview matches the current visual language. “Try RYVO” opens the working demo. Direct hash links are restored after GSAP initialization. All 43 tests pass; see the current RYVO revision in the implementation evidence.

Current routes: `/` is `app/(marketing)/page.tsx`, with server-rendered storytelling and isolated navigation, GSAP, and BPM-demo client components; `/run/new` is a preparation preview only. The demo is visual Simulation with cadence/ratio math; there is no run controller, seeded run simulation, permission flow, sensor/GPS adapter, audio import/DSP, authentication, database, or API behavior.

Verification: clean locked install; strict typecheck; lint; production build; 29 unit tests; 5 component tests; 9 Chromium browser tests; zero axe A/AA findings at four viewport widths; zero production audit vulnerabilities. `test:integration` remains an explicitly deferred no-op. Use `npm run pr-check:quick`; browser tests own a production server at port 3100. The local user preview runs at port 3000.

Preserve the deleted AskMongo baseline, server/browser/domain boundaries, self-hosted font notices, and honest feature labels. The next authorized implementation must reconcile the M3 readiness/storage findings before building the run lifecycle. Do not infer permission to start M3 from this handoff.

## Historical preparation handoff (superseded by the update above)

# PULSE handoff to Codex

## Project summary

PULSE, **Run to Your Own Rhythm**, is a planned foreground browser product. It turns locally estimated running cadence into a musical target, then either selects a beat-matched local track or gradually adapts the tempo of the current supported local track. Cadence is `steps/min`; pace is time per distance. They remain separate metrics.

This repository is a preparation foundation, not the product. It currently provides a server-safe Next.js App Router root, semantic PULSE tokens, accessible `Rule` and `SignalBadge` primitives, runtime-agnostic domain contracts, and foundation tests. Product routes, Simulation behavior, real sensors, GPS, local audio processing, database persistence, authentication, history, and API workflows remain unimplemented. M1–M10 remain planned/incomplete in `tasks.md`.

The deleted AskMongo Vite/Express/MongoDB baseline is intentional working-tree state. Do not restore those files or introduce MongoDB.

## Current repository structure

The current PULSE foundation includes:

```text
app/layout.tsx
app/page.tsx
app/globals.css
components/pulse/index.ts
components/pulse/Rule.tsx
components/pulse/SignalBadge.tsx
src/domain/shared/index.ts
src/domain/shared/units.ts
src/domain/shared/errors.ts
src/domain/run/index.ts
src/domain/sensor/index.ts
src/domain/audio/index.ts
src/domain/playlist/index.ts
src/domain/simulation/index.ts
__tests__/domain/shared.test.ts
__tests__/components/signal-badge.test.tsx
e2e/foundation.spec.ts
next.config.ts
tsconfig.json
postcss.config.mjs
eslint.config.mjs
vitest.config.ts
vitest.setup.ts
playwright.config.ts
.env.example
package.json
package-lock.json
README.md
tasks.md
```

The preparation and review material is under `.agents/tasks/pulse-preparation/`. The old AskMongo files remain deleted in the working tree. No PULSE product route, API route, Prisma schema, sensor adapter, audio worklet, server persistence module, or authentication module is part of the current foundation.

## Completed preparation work

- Replaced the old application direction with a minimal Next.js App Router foundation.
- Added strict TypeScript, lint, build, Vitest, React Testing Library, and Playwright configuration.
- Added a server-renderable root that does not request permissions or import browser-only capabilities.
- Added semantic color, typography, spacing, focus, responsive, and reduced-motion tokens in `app/globals.css`.
- Added accessible foundation primitives and runtime-agnostic unit/error contracts.
- Added unit, component, and Chromium foundation coverage for no capability prompts, no protected API request, 320px no-overflow, and reduced motion.
- Wrote the seven preparation specifications and the M1–M10 implementation roadmap. Their status remains preparation/planned, not product-complete.
- Kept `docs/CODEX_HANDOFF.md` as the detailed source handoff. This root file is the required Codex-facing entry point and summarizes the same boundary, decisions, risks, checks, and first prompt. Keep both aligned when a technical decision changes; do not silently delete or create a divergent handoff.

## Architecture decisions

- Use Next.js App Router with server-rendered presentation and client-only islands for sensors, local audio, and Simulation.
- Keep runtime-agnostic domain code separate from React, Next.js, browser globals, Prisma, and AudioWorklet objects.
- Keep browser permissions, DeviceMotion, Geolocation, visibility, File APIs, Web Audio, AudioWorklet, and local persistence behind infrastructure boundaries.
- Keep Auth.js, user-scoped PostgreSQL/Prisma persistence, Zod validation, and route handlers on the server side.
- Keep raw motion, precise GPS, decoded audio, PCM, and object URLs local by default. Upload only bounded, privacy-preserving aggregates when the authenticated user has opted in.
- Separate `prepare()` from `start()`. Use the documented run state machine, injected clocks, idempotent completion/interruption, explicit degraded states, and local recovery.
- Keep Beat-Matched Playlist and Real-Time Tempo Adaptation independent. Playlist mode changes tracks; tempo mode keeps the current track. `TempoController` owns tempo smoothing and rate limiting, while the AudioWorklet owns sample-clock DSP.
- Build deterministic Simulation and Manual paths through the same typed ports intended for real adapters. Never present simulation or a surrogate audio path as real sensor measurement or pitch-preserving DSP.

## Design requirements

Follow `docs/DESIGN_SYSTEM.md`: use semantic tokens, the original PULSE visual direction, flat ruled surfaces, visible focus, text equivalents for visualizations, keyboard controls, 44px targets, reduced-motion branches, 320px support, and 200% zoom support. Do not copy Kelvin assets, logo treatment, typography, text, or proprietary assets.

Product contracts require honest units and status: cadence uses `steps/min`, pace uses `min/km` or `min/mi`, lost cadence is `null` rather than zero, and color is never the only status signal. Permission prompts occur only after an explicit action. Simulation and Manual remain usable after capability denial. Local audio is user-selected and validated by bytes, filename, decoder support, channel count, and decoded-memory policy before future audio work is accepted.

The preparation review contains 18 findings. Finding F-15 is already disposed by the `--pulse-dim` correction, but the overall design verdict remains `CHANGES_REQUESTED`. Resolve the remaining findings in the specifications and record the decision before claiming design approval.

## Setup commands

Use Node.js 22.12+ or 24 LTS and npm in `/Users/shivain/Desktop/chenyun project`:

```sh
npm ci
npm run typecheck
npm run lint
npm run build
npm run test:unit -- --run
npm run test:components -- --run
npm run test:integration
npx playwright install --with-deps chromium
npm run test:e2e -- --project=chromium
npm run pr-check:quick
```

`test:integration` is deliberately a foundation-only no-op. It must become PostgreSQL-backed before M9 is accepted. Do not use watch mode or a development server as a verification command.

## Known technical risks

- DeviceMotion and Geolocation are permission-gated, placement-sensitive, noisy, and foreground/browser limited. Real iOS Safari and Android Chrome evidence is required.
- GPS accuracy, jump rejection, distance segments, stale gaps, and pace aggregation need deterministic rules before implementation.
- Pitch-preserving tempo adaptation is the highest-risk capability. AudioWorklet render budget, memory, underruns, quality, autoplay, route changes, and battery behavior require synthetic and real-device evidence, with source-tempo fallback.
- Local audio persistence must use durable Blob metadata and recreate object URLs after reload without persisting URLs or uploading bytes. Decoded-memory limits must be enforced before accepting a file.
- Auth.js package/version evidence, API ownership, DTO serialization for Prisma `BigInt`/`Decimal`, retention during active sessions, settings snapshots, best-pace validation, and shared sample schemas remain design decisions called out by the review.
- The current verdict is `CHANGES_REQUESTED`, and the preparation documents include unresolved contract and source-audit findings. Do not infer approval from a passing foundation build.

## Remaining tasks

`tasks.md` is the implementation roadmap. Keep all milestones planned until their outputs and named evidence exist:

- **M1:** validate and maintain the development environment, tokens, boundaries, and foundation checks.
- **M2:** implement the accessible, original premium landing page.
- **M3:** implement the run lifecycle and preparation/active-run UI before real sensors or audio.
- **M4:** implement deterministic Simulation and pure cadence/pace engines.
- **M5:** implement local audio import, durable local metadata/blob handling, BPM analysis, and source-tempo playback.
- **M6:** implement independent beat-matched playlist selection and transition scheduling.
- **M7:** implement bounded pitch-preserving tempo adaptation with honest fallback.
- **M8:** integrate permission-gated mobile motion and geolocation adapters.
- **M9:** implement PostgreSQL/Prisma, Auth.js ownership, aggregate APIs, history, preferences, and sync.
- **M10:** complete performance, accessibility, privacy, device, operational, deployment, and release evidence.

Do not start a later milestone while its dependencies or the design gate are unresolved.

## First Codex milestone

Start with **M1 only**. Before editing, inspect the current status, read all seven preparation specifications and `tasks.md`, review `.agents/tasks/pulse-preparation/design-verdict.json` and `.agents/tasks/pulse-preparation/design-review.md`, and run the foundation checks. Reconcile any design-gate issue that blocks M1 without implementing M2–M10 behavior. Preserve the server-safe root and keep all browser-only capabilities behind future infrastructure boundaries. Record evidence before changing any milestone status.

## Relevant specification files

These files exist and are the source of truth for implementation:

- `tasks.md`
- `docs/PRODUCT_SPEC.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/FEASIBILITY_REPORT.md`
- `docs/AUDIO_ENGINE.md`
- `docs/SENSOR_ENGINE.md`
- `docs/ARCHITECTURE.md`
- `docs/API_AND_DATA_MODEL.md`
- `docs/CODEX_HANDOFF.md`
- `.agents/tasks/pulse-preparation/design-review.md`
- `.agents/tasks/pulse-preparation/design-verdict.json`

## Verification status

Verified during this correction pass:

- `AGENTS.md` and `HANDOFF_TO_CODEX.md` exist at the exact repository root paths, and every file named by those handoff documents exists.
- `tasks.md`, all seven required preparation specifications, `docs/CODEX_HANDOFF.md`, and the review verdict files remain present.
- `tasks.md` still states `Planned` and `M1–M10 are not complete`. No milestone status was changed.
- Static inspection and the Chromium smoke test confirm that the current root remains foundation-only. No PULSE product routes, sensor adapters, audio processing, database workflows, or API workflows were added. The smoke test observed no capability prompts or protected API requests.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `npm run test:unit -- --run` passed: 1 test.
- `npm run test:components -- --run` passed: 1 test.
- `npm run test:integration` passed as the documented foundation-only no-op.
- `npm run test:e2e -- --project=chromium` passed: 1 test.
- `git diff --check` passed. The final diff review must continue to preserve the deleted AskMongo files and contain no secrets.

Passing foundation checks is not evidence that any PULSE product capability is implemented.

## Exact first Codex prompt

> Work directly in `/Users/shivain/Desktop/chenyun project`. Read `AGENTS.md`, `tasks.md`, `docs/PRODUCT_SPEC.md`, `docs/DESIGN_SYSTEM.md`, `docs/FEASIBILITY_REPORT.md`, `docs/AUDIO_ENGINE.md`, `docs/SENSOR_ENGINE.md`, `docs/ARCHITECTURE.md`, `docs/API_AND_DATA_MODEL.md`, and `HANDOFF_TO_CODEX.md` before editing. Review `.agents/tasks/pulse-preparation/design-verdict.json` and `.agents/tasks/pulse-preparation/design-review.md`; the verdict is `CHANGES_REQUESTED` and must not be changed to approved without resolving the findings. Implement M1 only, one milestone at a time. Use the existing Next.js foundation, follow the design system and architecture, write functioning code rather than fake APIs or success states, preserve accessibility and mobile support, test significant changes with the existing single-run checks, update documentation when technical decisions change, and avoid unnecessary rewrites. Do not implement M2–M10 product features, permissions, sensors, audio processing, database workflows, or API workflows. Preserve the deleted AskMongo files and inspect the final diff for secrets and accidental restoration before committing.
