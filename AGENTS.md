# RYVO Codex instructions

Work directly in `/Users/shivain/Desktop/chenyun project`. This repository is the PULSE preparation foundation for **Run to Your Own Rhythm**. Do not restore the deleted AskMongo baseline, add MongoDB, or commit secrets.

## Before implementation

Read the actual PULSE source-of-truth files before changing implementation code:

- `tasks.md`
- `docs/PRODUCT_SPEC.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/FEASIBILITY_REPORT.md`
- `docs/AUDIO_ENGINE.md`
- `docs/SENSOR_ENGINE.md`
- `docs/ARCHITECTURE.md`
- `docs/API_AND_DATA_MODEL.md`
- `HANDOFF_TO_CODEX.md`

`docs/CODEX_HANDOFF.md` is the existing detailed handoff source that the root handoff complements. Review `.agents/tasks/pulse-preparation/design-verdict.json` and `.agents/tasks/pulse-preparation/design-review.md` before implementation. The design verdict is `CHANGES_REQUESTED`; do not call it approved without resolving its findings.

## Implementation rules

- Implement exactly one roadmap milestone, M1 through M10, at a time. Keep the current milestone planned until its outputs and verification evidence exist.
- Follow the design system in `docs/DESIGN_SYSTEM.md` and the module ownership and server/browser boundaries in `docs/ARCHITECTURE.md`.
- Write functioning code with real behavior and failure handling. Do not add fake APIs, placeholder success states, or claims that an unimplemented capability works.
- Test significant features with the appropriate existing unit, component, integration, and browser checks. Keep Simulation deterministic and label permission-gated or degraded behavior honestly.
- Preserve accessibility and mobile support, including keyboard operation, visible focus, reduced motion, 320px layouts, and 200% zoom requirements.
- Update the relevant documentation when a technical decision or contract changes. Avoid unnecessary rewrites and unrelated refactors.
- Keep raw motion, precise location, audio bytes, PCM, object URLs, and secrets out of logs, requests, and committed files unless an approved specification explicitly changes that boundary.

## Current functional MVP boundary

The current user-authorized simulator/audio MVP is implemented in `/run/new`; see `IMPLEMENTATION_STATUS.md` and `docs/FUNCTIONAL_MVP.md` for exact verification and limits. The historical M1/M2-only paragraph below is superseded for this scope. Keep sessions/files temporary, preserve the landing design, and do not infer authorization for database, authentication, deployment, real sensors, or full historical M3–M7 completion.

## Historical implementation boundary

M1 and M2 are now verified; see `docs/IMPLEMENTATION_M1_M2.md` and `tasks.md`. The root route lives in `app/(marketing)/page.tsx`, with server-safe layout, semantic tokens, original marketing components, and an interactive visual BPM demonstration. `app/run/new/page.tsx` is a preparation preview only, not the M3 run lifecycle. Accessible `Rule`/`SignalBadge` primitives and runtime-agnostic domain boundaries remain. Sensors, GPS, audio processing, database, authentication, history, and API workflows are unimplemented. Do not treat the visual ratio demo as the M4 seeded run simulator. M3–M10 remain planned.

Use the scripts and setup documented in `package.json` and `README.md`. Run single-shot checks, never watch mode or a development server as a validation command. Preserve the existing deletion state and inspect the final diff for restored AskMongo files or credentials before committing.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
