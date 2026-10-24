# Minimal PULSE foundation and Codex handoff

The preparation change adds only a small Next.js App Router foundation and Codex handoff for PULSE. It provides a server-renderable root, semantic tokens, two accessible primitives, runtime-agnostic domain boundaries, and the narrow unit/component/Chromium harness needed for those boundaries. The product and architecture documents describe future behavior without adding product routes, sensors, audio processing, persistence, APIs, authentication, or history. The recorded verification covers the requested command sequence, while the design gate remains explicitly `CHANGES_REQUESTED`.

Watch for: **confirmed** `design-review.md` still describes the PULSE artifacts as untracked and says there is no current PULSE implementation, although the reviewed state contains the foundation and handoff documents. Update that stale snapshot before handing the repository to Codex.

**Verdict**: NEEDS_CHANGES

## High-level view

The implementation is within the preparation scope. The App Router root is server-safe, the domain barrels contain only type-level contracts, and the shared worktree has no restored AskMongo paths, secrets, product routes, or browser/audio/server integrations. The root page labels itself as a preparation foundation and defers feature behavior.

The recorded verification matches the checked scripts and smoke-test source. FEAT-001 and FEAT-002 are accurately completed for their foundation scopes: the evidence includes clean-install, build, unit/component, integration-boundary, browser smoke, quick-check, and diff-hygiene results. M1–M10 remain planned, the preparation task remains pending, and the design verdict remains `CHANGES_REQUESTED`.

The remaining **confirmed** defect is handoff metadata accuracy. The design findings and caveat are preserved, but the design review’s repository-state assumptions describe an earlier state than the one Codex will receive.

<details>
<summary>Issues (1)</summary>

1. **Stale design-review repository snapshot** [confirmed] — `design-review.md` says PULSE artifacts are untracked and that no current PULSE implementation exists, while the reviewed state contains the tracked foundation and handoff documents. Mark those statements historical or update them to the current state so the next handoff does not inspect the wrong baseline.

</details>

<details>
<summary>Details</summary>

## Foundation boundaries and accessibility evidence

The root route contains no client directive, browser API, network call, permission request, audio path, database access, or product route. A static scan found no browser, React, Next.js, Prisma, AudioBuffer, or worklet references in `src/domain/**/*.ts`; the App Router page tree likewise has no deferred capability imports. The old Vite/Express/MongoDB source and review assets are absent from the shared worktree, and no common committed-secret patterns or copied Kelvin assets were found.

The CSS contains the documented semantic tokens, fallback typography, responsive layout, visible focus treatment, 44px sizing, and reduced-motion rules. The smoke test checks the root heading and status, instruments geolocation/media/notification/motion/orientation capability methods, checks `/api/` traffic, sets a 320px viewport with reduced motion, and asserts no capability access, protected requests, overflow, or missing reduced-motion rule. The implemented `--pulse-dim: #9D939E` value is documented as the F-15 correction; the overall gate is not presented as approved.

## Recorded command results and completion claims

FEAT-001 records successful `npm ci`, typecheck, lint, build, local dev smoke, unit, component, integration-boundary, Playwright Chromium, quick-check, and `git diff --check` results. FEAT-002 records the same test/handoff evidence plus the runtime-agnostic static scan. The evidence does not claim device-level sensor/audio quality or product-feature completion, and the checked roadmap has no M1–M10 heading marked complete.

No full installation, lint, typecheck, test, or build suite was rerun for this review. The command results above are the coder’s recorded evidence, as requested. FEAT-001 and FEAT-002 can remain `completed` for their scoped foundation work; that status does not mark any product milestone complete or change the design verdict.

## Stale repository-state text in the design review

**Confirmed:** `.agents/tasks/pulse-preparation/design-review.md` says that the PULSE documents and tasks are untracked, that the committed tree contains only the AskMongo baseline, and that there is no current PULSE implementation. The reviewed state instead contains the tracked PULSE foundation and handoff documents, the App Router root, tests, and configuration; only the old AskMongo paths are deleted in the shared worktree. The implementation plan and `context.json` describe this newer state, so the design review contradicts its neighboring handoff records.

Mark those statements as an earlier design-review snapshot or replace them with the current state: tracked PULSE foundation/documents, deleted AskMongo paths in the shared worktree, and no product-feature implementation. Keep the 18 findings, F-15 disposition, and `CHANGES_REQUESTED` verdict unchanged. This is a handoff-correctness fix, not a request to resolve the design findings during foundation preparation.

</details>

<details>
<summary>File map</summary>

The reviewed baseline is `origin/main` plus the current shared-worktree deletions; the full comparison is available with `git diff origin/main`.

- `.agents/tasks/pulse-preparation/implementation-plan.md`, `context.json`, `task.json` — preparation scope, repository context, and task state.
- `.agents/tasks/pulse-preparation/design-review.md`, `design-verdict.json` — design findings, F-15 disposition, and unresolved `CHANGES_REQUESTED` gate.
- `.agents/tasks/pulse-preparation/features/FEAT-001.json`, `FEAT-002.json` — feature scopes, acceptance criteria, and recorded verification evidence.
- `README.md`, `tasks.md`, `docs/CODEX_HANDOFF.md` — foundation commands, planned M1–M10 roadmap, and Codex handoff rules.
- `docs/PRODUCT_SPEC.md`, `DESIGN_SYSTEM.md`, `FEASIBILITY_REPORT.md`, `AUDIO_ENGINE.md`, `SENSOR_ENGINE.md`, `ARCHITECTURE.md`, `API_AND_DATA_MODEL.md` — planned product, visual, feasibility, engine, architecture, and API contracts.
- `package.json`, `package-lock.json`, `.env.example`, `.gitignore`, `next.config.ts`, `next-env.d.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs` — Next.js foundation, dependency lock, environment boundary, and tool configuration.
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css` — server-safe root and visual/accessibility foundation.
- `components/pulse/Rule.tsx`, `SignalBadge.tsx`, `index.ts` — accessible presentation primitives.
- `src/domain/shared/*`, `src/domain/{run,sensor,audio,playlist,simulation}/index.ts` — branded units, error contracts, and runtime-agnostic ports.
- `src/infrastructure/{audio,browser,persistence}/.gitkeep`, `src/server/.gitkeep` — reserved future boundaries with no implementation.
- `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `__tests__/domain/shared.test.ts`, `__tests__/components/signal-badge.test.tsx`, `e2e/foundation.spec.ts` — deterministic unit, component, and browser smoke harnesses.
- Deleted AskMongo baseline paths — `AGENTS.md`, `LICENSE`, `components.json`, `index.html`, `vite.config.ts`, `public/favicon.svg`, `server/`, `server/tests/`, `shared/types.ts`, old `src/`, `scripts/repair-evidence.ts`, and `review/` evidence/assets — remain absent in the shared worktree.

</details>
