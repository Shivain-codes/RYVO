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

# Codex handoff

## Current boundary

This preparation foundation stops at a server-safe Next.js App Router root. It does not implement the PULSE product. The root page, accessible `components/pulse/` primitives, and `src/domain/` ports provide only presentation and type boundaries. The domain modules are runtime-agnostic and must not import React, Next.js, browser globals, Prisma, or audio worklet objects.

The following boundaries remain reserved for later milestones:

- `src/infrastructure/browser/` owns browser permissions, motion, GPS, and lifecycle adapters.
- `src/infrastructure/audio/` owns files, object URLs, Web Audio, decoding, and AudioWorklet processing.
- `src/infrastructure/persistence/` owns local persistence and later synchronization.
- `src/server/`, `app/api/`, and Prisma own server-only persistence and API behavior.

Product routes, simulation behavior, sensors, audio processing, database, authentication, history, and API behavior remain unimplemented. `test:integration` is an explicit foundation-only no-op and must become PostgreSQL-backed before M9 is accepted.

## Foundation scripts

The target scripts are `dev`, `build`, `start`, `lint`, `typecheck`, `test:unit`, `test:components`, `test:integration`, `test:e2e`, and `pr-check:quick`. The expected clean-install command sequence is:

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

The Chromium smoke test starts the App Router page with capability APIs instrumented and verifies that the root makes no permission-capability calls or protected API, database, audio, or sensor requests. It also checks the required 320px layout and reduced-motion stylesheet branch. The smoke path is not evidence that those future capabilities work.

## Ordered Codex handoff checks

Before beginning M2 or another main product feature, Codex must:

1. Run `npm run pr-check:quick` from a clean dependency install.
2. Confirm the App Router root renders and the deleted AskMongo Vite/Express/MongoDB baseline remains deleted.
3. Confirm `tasks.md` contains planned M1–M10 milestones and points to the preparation documents.
4. Review `design-verdict.json` and `design-review.md`. The verdict remains `CHANGES_REQUESTED`; no implementation report may call the design approved without resolving the findings.
5. Check that `src/domain/` remains runtime-agnostic and that browser, audio, persistence, and server dependencies stay behind their stated boundaries.
6. Confirm the foundation smoke test still makes no permission, protected API, database, audio, or sensor request.
7. Start future work with deterministic Simulation and failure-state UI before permission prompts or AudioWorklet DSP.

Device and browser evidence is required for motion, GPS, audio quality, battery, lifecycle, and accessibility claims. The foundation smoke test records browser evidence for the 320px no-overflow and reduced-motion requirements; desktop mocks do not replace device evidence. PostgreSQL integration tests, Auth.js, real sensor adapters, local audio processing, and product feature behavior belong to later milestones.
