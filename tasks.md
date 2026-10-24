# RYVO — Codex implementation roadmap

**Status:** M1 and M2 verified on 2026-10-24; M3–M7 have a bounded local MVP subset; full milestones and M8–M10 remain planned. A milestone may be marked complete only after its outputs exist and the named verification evidence is recorded.

**Repository rule:** Work directly in `/Users/shivain/Desktop/chenyun project`. Preserve the deleted AskMongo baseline files shown by `git status`; do not restore them or introduce MongoDB. Build the PULSE application as a new Next.js App Router application.

**Design-gate note:** The preparation documents are the product and architecture source of truth for implementation. The current `.agents/tasks/pulse-preparation/design-verdict.json` contains `CHANGES_REQUESTED`, so Codex must reconcile the associated review findings before claiming the design gate is approved or starting product-feature work. The overall design gate remains unapproved. The direct M1–M2 implementation request and the scoped reconciliation in `docs/IMPLEMENTATION_M1_M2.md` authorize this presentation milestone; later feature gates remain in force.

**Current UI:** RYVO; “Try RYVO” opens the functional rhythm demo. The secondary setup link reaches the redesigned, explicitly labeled preparation preview. Initial `/#demo` navigation is regression-tested. Internal pulse paths and historical specification naming are retained.

## M1 — Development environment and design foundation

**Implementation status: Complete.** Clean dependency install and production-backed `pr-check:quick` passed on 2026-10-24: typecheck, lint, build, 1 unit test, 1 component test, and 1 Chromium test. Fixed the Node/jsdom engine mismatch (jsdom 26.1.0), explicit Turbopack root, and Playwright production-server ownership. See `docs/IMPLEMENTATION_M1_M2.md`.

- **Objective:** Establish a minimal, runnable Next.js App Router foundation in strict TypeScript and encode the PULSE design tokens and module boundaries without implementing the product features. Preserve a server-renderable root route and keep browser-only capabilities behind infrastructure boundaries.
- **Dependencies:** None. First inspect `git status --short`, the seven preparation documents, `design-verdict.json`, and `design-review.md`.
- **Exact expected outputs:** `package.json` and `package-lock.json` with target scripts; `next.config.ts`; `tsconfig.json`; `postcss.config.mjs`; `eslint.config.mjs`; `vitest.config.ts`; `playwright.config.ts`; `.env.example`; `app/layout.tsx`; `app/page.tsx`; `app/globals.css`; `components/pulse/` primitive placeholders; `src/domain/{shared,run,sensor,audio,playlist,simulation}/` boundary files; and a short foundation README section documenting Node/npm prerequisites and the validation commands.
- **Main files/modules:** `app/`, `components/pulse/`, `src/domain/`, `src/infrastructure/`, `package.json`, `next.config.ts`, `tsconfig.json`, test/build configuration.
- **Acceptance criteria:** `npm run dev` serves the App Router root; `npm run typecheck`, `npm run lint`, and `npm run build` pass; the root page renders without importing `window`, `navigator`, `AudioContext`, Zustand browser state, or Prisma; design tokens include the documented semantic colors, typography fallbacks, spacing, focus, and reduced-motion rules; no PULSE feature is presented as implemented; and the design-gate status is not falsely changed to approved.
- **Verification approach:** From a clean install run `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:unit`, `npm run test:components`, and `npm run test:e2e -- --project=chromium`. Confirm the root smoke test passes and inspect the rendered page at 320px and desktop widths.
- **Priority:** P0.
- **Estimated complexity:** Medium.

## M2 — Premium landing page

**Implementation status: Complete for the authorized M2 frontend scope, including the Kelvin layout/motion adaptation and RYVO branding/rhythm-section revision.** See `docs/IMPLEMENTATION_M1_M2.md`: production typecheck/lint/build, 29 unit tests, 5 component tests, and 9 Chromium tests passed for the current revision. Browser coverage includes 320/390/768/1440px, keyboard controls, reduced motion, no JavaScript, 200% text enlargement/reflow, no capability/API access, and zero axe A/AA findings. `/run/new` is the explicitly documented preparation-preview destination only; its real run lifecycle remains M3. The overall preparation verdict is still `CHANGES_REQUESTED` for the deferred findings.

- **Objective:** Implement the original PULSE marketing page as a cinematic editorial experience that explains cadence, both adaptation modes, capability limits, privacy, and the Demo Run path without copying Kelvin assets or text.
- **Dependencies:** M1, and explicit reconciliation of any design-gate findings that affect page behavior or visual tokens.
- **Exact expected outputs:** `app/(marketing)/page.tsx`; marketing components under `components/pulse/marketing/`; original asset manifest under `public/` or `docs/`; accessible hero, editorial sections, BPM ratio demonstration, technology/privacy explanation, and final CTA linking to `/run/new`; GSAP/ScrollTrigger timelines and Motion transitions with one animation owner each.
- **Main files/modules:** `app/(marketing)/page.tsx`, `components/pulse/marketing/`, `src/infrastructure/telemetry/` if page diagnostics are added, `public/` asset manifest, `app/globals.css`.
- **Acceptance criteria:** The page remains understandable with JavaScript animation disabled and reduced motion; it labels the BPM demonstration as Simulation; it distinguishes cadence (`steps/min`) from pace; keyboard focus and text alternatives exist; no copied Kelvin logo, copy, images, or proprietary assets appear; and the CTA reaches the preparation route without requesting permissions.
- **Verification approach:** Run `npm run test:components` and `npm run test:e2e -- --project=chromium`; verify navigation, reduced motion, keyboard focus, 320px/768px/1440px layouts, and browser-console cleanliness. Record licensed/generated asset evidence.
- **Priority:** P0.
- **Estimated complexity:** Large.

## Current functional delivery — bounded local MVP

The simulator/audio/adaptation subset of M3–M7 is implemented under the user's functional-phase request. Exact evidence and remaining limits are in `IMPLEMENTATION_STATUS.md`; the superseding MVP contract is `docs/FUNCTIONAL_MVP.md`. Full milestone completion is deliberately not claimed:

| Roadmap area | Delivered MVP | Still outside this delivery |
|---|---|---|
| M3 | Prepared/start/pause/resume/end lifecycle, active timer, temporary summary, hidden-page pause | Durable outbox/history/recovery and server lifecycle |
| M4 | Seeded cadence 120–200, median/EWMA, deterministic clock and ratio targets | Raw sensor/GPS fixtures, real estimators and pace/distance |
| M5 | Local streaming player, bounded imports, temporary playlist, basic metadata and WAV BPM/manual correction | Durable blobs/library pages, general codec BPM analysis and embedded tags |
| M6 | Score/keep/recency, hold/cooldown/two-window matching, estimated beat switching, reorder controls | Seamless crossfade, automatic ratio changes and server playlists |
| M7 | Native preservesPitch playback with bounded smoothing, rate limits, fallback and real analyser | Custom worklet/DSP and physical-device/music-quality certification |

Database/authentication/deployment remain unstarted. Historical specifications below are retained as future acceptance criteria, not current completion claims.

## M3 — Running dashboard

- **Objective:** Implement the run lifecycle and the preparation/active-run UI before connecting real sensors or audio. Make readiness, failure, pause/resume, interruption, and degraded capability behavior explicit.
- **Dependencies:** M1; M2 for shared presentation primitives; the run contracts from `docs/ARCHITECTURE.md` and `docs/PRODUCT_SPEC.md`.
- **Exact expected outputs:** `src/domain/run/run-session-controller.ts`; typed run state/events and injected clock; local interruption/outbox ports under `src/infrastructure/persistence/`; `app/run/new/page.tsx`; `app/run/[sessionId]/page.tsx`; run components under `components/pulse/run/`; status/error mapping; and tests for `idle`, `preparing`, `ready`, `running`, `paused`, `preparingResume`, `completing`, `completed`, `error`, and `interruptedLocal`.
- **Main files/modules:** `src/domain/run/`, `src/domain/shared/`, `src/infrastructure/persistence/`, `components/pulse/run/`, `app/run/`.
- **Acceptance criteria:** `prepare()` and `start()` are separate and `start()` accepts only `ready`; preparation has a 12-second timeout; storage failure blocks readiness with a recoverable error; pause freezes active time and adaptation; resume stabilizes or reports its bounded warning; end and interruption reconciliation are idempotent; Simulation and Manual remain available after permission denial; and the UI never displays lost cadence as zero.
- **Verification approach:** Run `npm run test:unit`, `npm run test:components`, and `npm run test:e2e -- --project=chromium`; use fake-clock transition tests and a browser flow covering prepare, start, pause, resume, end, and interruption recovery. Confirm anonymous simulation does not call protected APIs.
- **Priority:** P0.
- **Estimated complexity:** Large.

## M4 — Cadence simulation engine

- **Objective:** Build the deterministic, permission-free Simulation path and the pure cadence/pace domain engines using the same ports that future motion and GPS adapters will use.
- **Dependencies:** M3 run controller and M1 domain contracts.
- **Exact expected outputs:** `src/domain/simulation/` seeded clock/source/fixtures; `src/domain/sensor/cadence-estimator.ts`; `src/domain/sensor/gps-pace-estimator.ts`; normalization, resampling, filters, autocorrelation, harmonic handling, median/EWMA smoothing, haversine and GPS validation; `src/domain/sensor/manual-source.ts`; and documented default fixture matching `docs/SENSOR_ENGINE.md`.
- **Main files/modules:** `src/domain/simulation/`, `src/domain/sensor/`, `components/pulse/run/`, `e2e/` simulation specs.
- **Acceptance criteria:** The same seed reproduces samples, targets, playlist inputs, and aggregates; the default fixture includes calibration, cadence changes, sensor loss, and recovery; cadence is `steps/min` and pace is `seconds/meter` internally; gaps produce `stabilizing`/`lost` with cadence `null`; manual values enforce finite `40..240` cadence and optional `0.1..20` seconds/meter at one update per second; and every surface labels Simulation or Manual honestly.
- **Verification approach:** Run `npm run test:unit` with synthetic motion/GPS fixtures and fake clocks, then `npm run test:e2e -- --project=chromium` for a fixed-seed run. Confirm deterministic replay and distinct cadence/pace labels.
- **Priority:** P0.
- **Estimated complexity:** Large.

## M5 — Local audio player and BPM metadata

- **Objective:** Add authorized local audio import, durable local-only metadata/blob handling, BPM analysis and correction, and source-tempo playback without implementing tempo adaptation.
- **Dependencies:** M1 contracts, M3 session lifecycle, and M4 Simulation fixtures for browser tests.
- **Exact expected outputs:** `app/library/page.tsx`; `src/infrastructure/audio/` file validator, IndexedDB/blob persistence, object-URL lifecycle, decoder, and source-tempo engine; `src/domain/audio/` `AudioEngine` and analyzer ports; a BPM worker; Track metadata client; manual correction UI; and decoded-audio memory budget/error states derived from the feasibility review.
- **Main files/modules:** `app/library/`, `components/pulse/library/`, `src/domain/audio/`, `src/infrastructure/audio/`, `src/infrastructure/persistence/`, `public/audio-worklet/` only for shared future contracts, and `e2e/` local-audio specs.
- **Acceptance criteria:** File selection requires a user action; files are validated by bytes, filename length, decoder support, channel count, decoded-memory budget, and duration policy; rejected files are never uploaded; local records contain a Blob, `clientAssetId`, metadata, schema version, and byte count but never an object URL; reload recreates and cleanup revokes URLs; BPM values are bounded to `40..240` with one decimal precision; low confidence and analysis failure permit source-tempo playback; and server metadata never contains audio bytes or object URLs.
- **Verification approach:** Run `npm run test:unit`, `npm run test:components`, and `npm run test:e2e -- --project=chromium`; inspect network requests for fixture bytes; run mocked AudioContext tests and the documented browser/device audio decode matrix.
- **Priority:** P0.
- **Estimated complexity:** Large.

## M6 — Beat-matched playlist engine

- **Objective:** Implement independent playlist matching and ordered playlist management using the exact ratio, score, hysteresis, cooldown, and beat-boundary rules in `docs/AUDIO_ENGINE.md`.
- **Dependencies:** M4 cadence/target inputs and M5 track metadata/source-tempo playback. Database-backed playlist APIs may be delivered with M9, but the pure matcher must remain independent of persistence.
- **Exact expected outputs:** `src/domain/playlist/target-bpm-calculator.ts`; `src/domain/playlist/playlist-matcher.ts`; exact score and recency-penalty policy; transition scheduler; bounded playback-event types; playlist UI and keyboard reorder controls; and playlist/track API integration points.
- **Main files/modules:** `src/domain/playlist/`, `src/domain/audio/`, `src/infrastructure/audio/`, `components/pulse/library/`, `components/pulse/run/`, `app/library/`.
- **Acceptance criteria:** Only `1:1`, `2:1`, and `1:2` are enabled; matcher eligibility requires playable decoded audio plus finite BPM `40..240`, while low-confidence BPM remains eligible with its penalty and missing BPM is excluded; score is explicitly nonnegative after keep bias; no eligible track yields a visible status; switching requires 90-second hold, 45-second cooldown, two windows at least two seconds apart, and the exact `8 BPM OR 12%` improvement unless the current track fails; transitions wait for the next estimated beat no longer than four seconds; and playlist mode never changes tempo on the current track.
- **Verification approach:** Run `npm run test:unit`, `npm run test:components`, and PostgreSQL-backed integration tests once M9 APIs exist. Use table/property tests for boundary thresholds, recency penalties, ratio locks, no-eligible-track behavior, and transition fallbacks; exercise a Simulation playlist flow in Playwright.
- **Priority:** P0.
- **Estimated complexity:** Large.

## M7 — Pitch-preserving tempo adaptation

- **Objective:** Implement the bounded granular AudioWorklet path and independent TempoController for supported local files, with honest source-tempo fallback when processing is unavailable or poor quality.
- **Dependencies:** M4 target inputs and M5 decoder/source-tempo engine. M6 target calculation may be reused, but playlist selection must remain independent.
- **Exact expected outputs:** `public/audio-worklet/tempo-processor.js`; typed `TempoProcessorPort`, ring-buffer and command protocol under `src/domain/audio/` and `src/infrastructure/audio/`; `src/domain/audio/tempo-controller.ts`; underrun telemetry/fallback; tempo-mode UI/status; and synthetic DSP fixtures.
- **Main files/modules:** `src/domain/audio/`, `src/infrastructure/audio/`, `public/audio-worklet/`, `components/pulse/run/`, `components/pulse/library/`.
- **Acceptance criteria:** Ratios are validated to `0.80..1.25`; commands are no more frequent than every two seconds; every update satisfies `abs(nextRatio - previousRatio) <= 0.03 * elapsedSeconds`; controller smoothing is the single eight-second/rate-limited policy; `process()` performs no steady-state allocations and emits no NaN/Infinity; low-water/underrun thresholds freeze then fall back to source tempo; missing BPM, unsupported decode, worklet failure, and processor failure never claim adaptation is active; and tempo mode never selects a different track.
- **Verification approach:** Run `npm run test:unit`, integration worklet harness tests, `npm run test:components`, and `npm run test:e2e -- --project=chromium`; execute sine/impulse/ratio-ramp/stereo/end-of-buffer invariants and the real-device audio quality and battery matrix before calling the capability complete.
- **Priority:** P0.
- **Estimated complexity:** Extra large.

## M8 — Mobile sensor integration

- **Objective:** Connect permission-gated DeviceMotion and Geolocation adapters to the existing ports, with foreground lifecycle recovery and explicit browser limitations.
- **Dependencies:** M4 pure estimators and M3 run lifecycle. M5/M7 audio must already expose independent degraded states.
- **Exact expected outputs:** `src/infrastructure/browser/device-motion-source.ts`; `src/infrastructure/browser/geolocation-source.ts`; capability/permission probes; lifecycle and visibility adapters; permission/error UI; iOS Safari and Android Chrome test evidence; and updated feasibility/device notes.
- **Main files/modules:** `src/infrastructure/browser/`, `src/domain/sensor/`, `src/domain/run/`, `components/pulse/run/`, `docs/FEASIBILITY_REPORT.md` evidence appendix.
- **Acceptance criteria:** No permission prompt occurs on page load; requests occur only after explicit Prepare/Start action; Simulation and Manual survive denial/unsupported APIs; GPS is optional and denial disables pace/distance without ending a run; motion denial requires Manual for real cadence; malformed samples, revocation, stale gaps, visibility suspension, and cleanup are recoverable; GPS accepts only deterministic accuracy/jump rules and uploads no raw coordinates; and foreground-only/background limits are visible in the UI.
- **Verification approach:** Run mocked permission/location tests, `npm run test:e2e -- --project=chromium`, and the documented iOS Safari/Android Chrome device matrix over secure context. Record actual browser evidence; desktop mocks alone do not satisfy completion.
- **Priority:** P0.
- **Estimated complexity:** Large.

## M9 — Database and run history

- **Objective:** Add PostgreSQL/Prisma persistence, Auth.js ownership boundaries, aggregate session APIs, idempotent interruption/completion, playlists, preferences, and history while preserving local-first privacy.
- **Dependencies:** M1 foundation, M3 lifecycle, M5 metadata contracts, and explicit resolution of the design-review findings affecting API contracts, retention, serialization, and Auth.js dependency evidence.
- **Exact expected outputs:** `prisma/schema.prisma` and PostgreSQL migrations; `src/server/db/`, `src/infrastructure/auth/`, shared Zod request/response schemas and DTO mappers; all route files from `docs/API_AND_DATA_MODEL.md`, including dynamic history, playlist, track, playback-event, session, and preferences routes; local sync/outbox services; `app/history/`, `app/settings/`; and integration/contract tests.
- **Main files/modules:** `prisma/`, `src/server/`, `src/infrastructure/auth/`, `src/domain/shared/schemas.ts`, `app/api/`, `app/history/`, `app/settings/`, `components/pulse/history/`, `components/pulse/settings/`, `tests/integration/`.
- **Acceptance criteria:** PostgreSQL migrations apply; Auth.js Google OAuth is production-only with explicit development mode; every protected query is user-scoped and relation-bearing write checks ownership transactionally; anonymous Simulation/local library never calls protected APIs; JSON DTOs define safe BigInt/Decimal representations; session snapshots include all behavior-affecting settings; metrics/status/source schemas and idempotency are shared and bounded; completion/interruption replay is safe; client-authoritative best pace is validated only within documented bounds; `sync-v1` is versioned; retention deletion cannot destroy an active session before reconciliation; and raw motion, precise location, PCM, object URLs, and audio bytes are absent from requests/logs.
- **Verification approach:** Run `npm run prisma:validate`, `npm run test:integration`, `npm run test:unit`, and `npm run test:e2e -- --project=chromium` against PostgreSQL. Test migrations, auth expiry/logout, ownership, cross-user rejection, idempotency conflicts/replays, pagination, retention, DTO serialization, best-pace/sync arithmetic, and privacy request inspection.
- **Priority:** P0.
- **Estimated complexity:** Extra large.

## M10 — Performance, accessibility, testing, deployment

- **Objective:** Prove the integrated product meets performance, privacy, accessibility, browser/device, operational, and release requirements rather than treating mocks or a desktop build as evidence.
- **Dependencies:** M2–M9; all design-gate findings relevant to release must be resolved and documented.
- **Exact expected outputs:** CI workflow and clean-install runbook; profiling/battery evidence; accessibility and privacy audit; Playwright release suite; health/readiness endpoint; deployment and migration runbook; feature flag for disabling tempo adaptation; monitoring/error-code map; and a final handoff evidence index.
- **Main files/modules:** `.github/workflows/`, `package.json`, `playwright.config.ts`, `e2e/`, `__tests__/` or `tests/`, `src/infrastructure/telemetry/`, deployment configuration, `docs/` release evidence.
- **Acceptance criteria:** Clean checkout installs and builds; typecheck, lint, unit, component, integration, and Playwright suites pass; Simulation works at 320px and 200% zoom with keyboard and reduced motion; no critical accessibility findings remain; sensor updates do not cause sustained long tasks; worklet/render/memory/battery budgets are recorded on representative devices; object URLs/nodes/listeners clean up; no raw data leaks; preview smoke passes; and migration rollback/forward-fix and tempo-disable procedures are documented. No M1–M10 milestone is marked complete without its evidence.
- **Verification approach:** Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run prisma:validate`, `npm run test:unit`, `npm run test:components`, `npm run test:integration`, and `npm run test:e2e -- --project=chromium`; repeat the release/device/accessibility/privacy checks from the preparation documents and archive results.
- **Priority:** P0.
- **Estimated complexity:** Large.
