# PULSE preparation implementation plan

**Scope:** Establish only the minimal runnable Next.js foundation and the Codex handoff materials. Do not implement the landing page experience, run lifecycle, Simulation engine, local audio, playlist matching, tempo DSP, mobile sensors, database, APIs, history, or deployment in this preparation run. Those are future milestones in `/Users/shivain/Desktop/chenyun project/tasks.md`.

**Worktree:** Work directly in `/Users/shivain/Desktop/chenyun project`. Do not create or use another worktree. The current branch contains the tracked PULSE preparation foundation and handoff documents, while the original AskMongo Vite/Express/MongoDB paths remain deleted in the shared worktree. Preserve those deletions and do not restore the AskMongo application.

**Design-source assumption:** The seven `docs/` files are the intended PULSE contracts. The inspected `/Users/shivain/Desktop/chenyun project/.agents/tasks/pulse-preparation/design-verdict.json` currently says `CHANGES_REQUESTED` and points to 18 findings in `design-review.md`; the implementation must not claim that gate is approved. Resolve or explicitly carry forward those findings before product-feature work. This preparation plan may create a foundation, but it does not silently change the verdict or redesign the product.

## Ordered implementation steps

- [ ] 1. Establish the working-tree and preparation baseline before changing code.
      Read `docs/PRODUCT_SPEC.md`, `docs/DESIGN_SYSTEM.md`, `docs/FEASIBILITY_REPORT.md`, `docs/AUDIO_ENGINE.md`, `docs/SENSOR_ENGINE.md`, `docs/ARCHITECTURE.md`, `docs/API_AND_DATA_MODEL.md`, `.agents/tasks/pulse-preparation/design-verdict.json`, `.agents/tasks/pulse-preparation/design-review.md`, and `tasks.md`. Read the tracked foundation files in the worktree, and use the original baseline paths from `origin/main` or `git show HEAD:<path>` only when comparing the deleted AskMongo implementation and its guidance.
      Files: `/Users/shivain/Desktop/chenyun project/docs/`, `/Users/shivain/Desktop/chenyun project/.agents/tasks/pulse-preparation/`, baseline files available with `git show HEAD:<path>`.
      Verify: `git -C "/Users/shivain/Desktop/chenyun project" status --short --branch` shows the existing deleted AskMongo files and PULSE preparation artifacts; no separate worktree is created; `git -C "/Users/shivain/Desktop/chenyun project" diff -- tasks.md` contains only the intended roadmap replacement after later steps.

- [ ] 2. Preserve and complete the two handoff artifacts before feature implementation.
      Keep `tasks.md` as the dependency-aware M1–M10 roadmap, with every milestone still planned. Keep this file as the implementation-only preparation plan. Record the design-gate mismatch and unresolved review findings rather than changing `design-verdict.json` or claiming product readiness.
      Files: `/Users/shivain/Desktop/chenyun project/tasks.md`, `/Users/shivain/Desktop/chenyun project/.agents/tasks/pulse-preparation/implementation-plan.md`.
      Verify: `python3 - <<'PY'
from pathlib import Path
text = Path('tasks.md').read_text()
assert [f'## M{i} —' for i in range(1, 11)] == [line for line in text.splitlines() if line.startswith('## M')]
assert 'Status:** Planned' in text
assert 'CHANGES_REQUESTED' in Path('.agents/tasks/pulse-preparation/implementation-plan.md').read_text()
PY` passes and the design verdict JSON remains unchanged.

- [ ] 3. Replace the absent Vite foundation with a minimal Next.js App Router runtime.
      Create the target package manifest and lockfile using the versions selected after a fresh compatibility/license check. Include only dependencies needed for the foundation and its tests: Next, React, React DOM, Tailwind CSS integration, TypeScript, ESLint/Next ESLint configuration, Vitest, React Testing Library, `@testing-library/jest-dom`, and Playwright. Do not install GSAP, Motion, Zustand, TanStack Query, Prisma, Auth.js, Web Audio libraries, or sensor libraries until the corresponding milestone has its own dependency decision and tests.
      Files: `/Users/shivain/Desktop/chenyun project/package.json`, `/Users/shivain/Desktop/chenyun project/package-lock.json`, `/Users/shivain/Desktop/chenyun project/next.config.ts`, `/Users/shivain/Desktop/chenyun project/tsconfig.json`, `/Users/shivain/Desktop/chenyun project/postcss.config.mjs`, `/Users/shivain/Desktop/chenyun project/eslint.config.mjs`, `/Users/shivain/Desktop/chenyun project/.env.example`.
      Verify: `npm ci`; `npm run typecheck`; `npm run lint`; `npm run build` all exit 0. `npm run dev` must serve a local App Router page and must not start the deleted Express/MongoDB server.

- [ ] 4. Encode the PULSE visual foundation without implementing a product page.
      Create a server-safe root layout and a minimal root page that identifies PULSE, states that the current build is the preparation foundation, and links to no unimplemented product behavior. Add the semantic CSS tokens and fallback typography from `DESIGN_SYSTEM.md`, visible `:focus-visible` treatment, 44px interaction sizing, responsive base layout, and reduced-motion media rules. Do not add copied Kelvin assets or unlicensed imagery.
      Files: `/Users/shivain/Desktop/chenyun project/app/layout.tsx`, `/Users/shivain/Desktop/chenyun project/app/page.tsx`, `/Users/shivain/Desktop/chenyun project/app/globals.css`, `/Users/shivain/Desktop/chenyun project/components/pulse/SignalBadge.tsx`, `/Users/shivain/Desktop/chenyun project/components/pulse/Rule.tsx`, `/Users/shivain/Desktop/chenyun project/components/pulse/index.ts`.
      Verify: `npm run build` passes; `npm run test:components -- --run`; `npm run test:e2e -- --project=chromium`; the browser smoke test sees the PULSE heading and foundation status; the rendered page has no horizontal overflow at 320px; and `prefers-reduced-motion: reduce` disables nonessential transitions.

- [ ] 5. Establish explicit runtime-agnostic module boundaries and only the contracts needed by the foundation.
      Add strict TypeScript barrel/types for unit-branded shared values, stable error-code shape, and empty ports for run, sensor, audio, playlist, and simulation domains. These are boundaries, not implementations: no browser globals in `src/domain`, no Prisma imports, no AudioBuffer/File/object URL in Zustand or domain types, and no cadence/audio behavior beyond type-level contracts.
      Files: `/Users/shivain/Desktop/chenyun project/src/domain/shared/units.ts`, `/Users/shivain/Desktop/chenyun project/src/domain/shared/errors.ts`, `/Users/shivain/Desktop/chenyun project/src/domain/shared/index.ts`, `/Users/shivain/Desktop/chenyun project/src/domain/run/index.ts`, `/Users/shivain/Desktop/chenyun project/src/domain/sensor/index.ts`, `/Users/shivain/Desktop/chenyun project/src/domain/audio/index.ts`, `/Users/shivain/Desktop/chenyun project/src/domain/playlist/index.ts`, `/Users/shivain/Desktop/chenyun project/src/domain/simulation/index.ts`, `/Users/shivain/Desktop/chenyun project/src/infrastructure/browser/.gitkeep`, `/Users/shivain/Desktop/chenyun project/src/infrastructure/audio/.gitkeep`, `/Users/shivain/Desktop/chenyun project/src/infrastructure/persistence/.gitkeep`, `/Users/shivain/Desktop/chenyun project/src/server/.gitkeep`.
      Verify: `npm run typecheck` passes; `npm run test:unit -- --run`; a boundary test or static import check demonstrates that domain modules do not import `window`, `navigator`, `AudioContext`, Prisma, or Next server APIs.

- [ ] 6. Add the smallest useful automated test harness and browser smoke path.
      Configure Vitest for pure unit tests and React Testing Library for a component smoke test. Configure Playwright to start the Next dev server or production server through the package script, use a Chromium smoke project, and avoid permissions, network calls, audio fixtures, database connections, and real sensors. Add one deterministic unit test for a shared value/error contract and one accessible component test for `SignalBadge`.
      Files: `/Users/shivain/Desktop/chenyun project/vitest.config.ts`, `/Users/shivain/Desktop/chenyun project/vitest.setup.ts`, `/Users/shivain/Desktop/chenyun project/playwright.config.ts`, `/Users/shivain/Desktop/chenyun project/__tests__/domain/shared.test.ts`, `/Users/shivain/Desktop/chenyun project/__tests__/components/signal-badge.test.tsx`, `/Users/shivain/Desktop/chenyun project/e2e/foundation.spec.ts`.
      Verify: `npm run test:unit -- --run`, `npm run test:components -- --run`, and `npx playwright install --with-deps chromium` followed by `npm run test:e2e -- --project=chromium` pass. The e2e test must confirm the page renders and does not request protected APIs or browser permissions.

- [ ] 7. Add exact target scripts and document how Codex must validate each later milestone.
      The foundation `package.json` must expose these scripts, or an equivalent documented script with the same behavior: `dev`, `build`, `start`, `lint`, `typecheck`, `test:unit`, `test:components`, `test:integration`, `test:e2e`, and `pr-check:quick`. `pr-check:quick` runs typecheck, lint, build, unit tests, component tests, and the Chromium smoke test; `test:integration` may be a clearly marked no-op in this foundation only, but it must become PostgreSQL-backed before M9. Document the future commands and the device/browser evidence gates in `docs/CODEX_HANDOFF.md` without claiming they already pass.
      Files: `/Users/shivain/Desktop/chenyun project/package.json`, `/Users/shivain/Desktop/chenyun project/docs/CODEX_HANDOFF.md`, `/Users/shivain/Desktop/chenyun project/README.md`.
      Verify: `npm run pr-check:quick` passes from a clean dependency install; `npm run test:integration` exits successfully with an explicit foundation-only message; and `npm run start` serves the production build for the Playwright smoke test.

- [ ] 8. Run the complete foundation validation sequence and capture evidence for the handoff.
      Use a clean dependency install, build the production bundle, run all configured tests, and inspect the root route at 320px and desktop widths. Confirm no preparation step has added feature routes or claimed Simulation, sensor, audio, database, auth, or history behavior. Record commands and outcomes in the FEAT artifact `findings` field and in the implementation review evidence, not by marking M1–M10 complete.
      Files: `/Users/shivain/Desktop/chenyun project/.agents/tasks/pulse-preparation/features/FEAT-001.json`, `/Users/shivain/Desktop/chenyun project/.agents/tasks/pulse-preparation/features/FEAT-002.json`, `/Users/shivain/Desktop/chenyun project/.agents/tasks/pulse-preparation/context.json`, `/Users/shivain/Desktop/chenyun project/.agents/tasks/pulse-preparation/task.json`.
      Verify, in this order:
      1. `git status --short --branch`.
      2. `npm ci`.
      3. `npm run typecheck`.
      4. `npm run lint`.
      5. `npm run build`.
      6. `npm run test:unit -- --run`.
      7. `npm run test:components -- --run`.
      8. `npm run test:integration`.
      9. `npx playwright install --with-deps chromium` once per environment, then `npm run test:e2e -- --project=chromium`.
      10. `npm run pr-check:quick`.
      Expected outcome: every foundation command exits 0; the smoke test passes; no secrets are added; and the review evidence explicitly says main product features remain unimplemented.

- [ ] 9. Perform the Codex handoff checks and commit only the preparation/foundation change set.
      Check that `tasks.md` contains exactly M1–M10 and no completed milestone, that all seven design docs remain present, that the design verdict/review paths are present, and that the new foundation has the modular boundaries and scripts above. Review the diff for accidental AskMongo restoration, raw audio/sensor handling, secrets, copied Kelvin assets, and unrequested feature implementation. Commit locally on the existing branch; never push.
      Files: all files changed by steps 2–8, especially `/Users/shivain/Desktop/chenyun project/tasks.md`, `/Users/shivain/Desktop/chenyun project/.agents/tasks/pulse-preparation/implementation-plan.md`, `package.json`, `app/`, `components/pulse/`, `src/domain/`, and test/config files.
      Verify: `git diff --check`; `git status --short`; `git diff --stat`; repeat `npm run pr-check:quick`; and inspect the final commit with `git show --stat --oneline HEAD`. Expected outcome: only the intentional PULSE foundation and handoff artifacts are committed, the old deleted baseline remains deleted, and no M1–M10 status is changed to complete.

## Modular boundary contract for Codex

- `app/` and `components/pulse/` render UI. Server Components must not import browser APIs or Zustand browser state.
- `src/domain/` is runtime-agnostic strict TypeScript. It owns units, pure calculations, state contracts, and ports. It never imports React, Next.js, Prisma, `window`, `navigator`, `File`, `AudioContext`, or worklet nodes.
- `src/infrastructure/browser/` alone touches DeviceMotion, Geolocation, visibility, permissions, and other browser globals.
- `src/infrastructure/audio/` alone touches File, Blob, object URLs, Web Audio, AudioWorklet, and decoder APIs. Object URLs and audio buffers remain lifecycle-managed and are never persisted in serializable view state.
- `src/infrastructure/persistence/` owns IndexedDB/local outbox and later server synchronization. It does not upload raw motion, precise coordinates, PCM, or local audio bytes.
- `src/server/`, `app/api/`, and Prisma belong to server-only code. Route handlers validate shared Zod schemas, resolve Auth.js users, enforce `(resourceId, currentUserId)` ownership, and map typed errors to the documented envelope. None of this is implemented in the preparation foundation.
- Zustand, when introduced in a later milestone, stores serializable view state only. It does not own clocks, raw samples, callbacks, Files, AudioBuffers, object URLs, or worklet nodes.
- GSAP/ScrollTrigger, Motion, and the session clock are separate concerns. The foundation does not need the animation libraries; later marketing code must assign one owner per animation.

## Codex handoff checks

Before beginning M2 or any main product feature, Codex must confirm:

- `npm run pr-check:quick` passes from a clean install.
- The App Router root renders from `app/` and the old Vite/Express/MongoDB baseline is still preserved as deletions.
- `tasks.md` remains planned M1–M10 and points to the seven preparation documents.
- `design-verdict.json` and `design-review.md` have an explicitly resolved or consciously carried-forward status; no implementation report calls the design approved while its JSON says `CHANGES_REQUESTED`.
- Domain imports remain runtime-agnostic and browser/server dependencies stay behind their stated boundaries.
- The foundation smoke test makes no permission, protected API, database, audio, or sensor request.
- The next feature starts with deterministic Simulation and the failure-state UI, not with mobile permission prompts or AudioWorklet DSP.
