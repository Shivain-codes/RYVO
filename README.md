# RYVO

**Run to Your Own Rhythm.** An editorial frontend with a working local running simulation, audio player, and adaptive music MVP. M1 foundation and M2 landing implementation are documented in `docs/IMPLEMENTATION_M1_M2.md`; the roadmap is `tasks.md`.

## Run locally

Use Node.js 22.12+ or 24 LTS and npm in `/Users/shivain/Desktop/chenyun project`.

```sh
npm ci
npm run build
npm run start
```

Open `http://127.0.0.1:3000`. `npm run dev` is available for development; verification uses a production build.

## Implemented scope

- `/`: responsive navigation, a Kelvin-layout adaptation with original thermal running imagery, Hubot Sans/Kalnia typography, editorial stories, GSAP poster/gallery scroll sequences and automatic reduced-motion support, accessible native disclosures, and the rhythm lab.
- Rhythm lab (“Find your frequency”): yellow editorial section with a cream instrument; direct `/#demo` links restore correctly after scroll animation initialization. Controls support 40–240 steps/min cadence, three beats:steps ratios, computed BPM, keyboard slider and increment controls, reset, and honest out-of-track-range feedback. This is a visual Simulation, not a recorded run or audio processor.
- `/run/new`: prepare/start/pause/resume/end, seeded 120–200 cadence, real local audio and ordered playlists, bounded WAV BPM estimation/manual correction, beat matching, native pitch-preserving tempo control, and actual audio visualization. Temporary local session: reload/navigation discards files and session.
- Self-hosted fonts with OFL notices; semantic colors/type/spacing, contrast checks, visible focus, reduced motion, 320px reflow, and static/no-JavaScript story content.

The bounded local MVP is implemented; full roadmap milestones remain partial. No device sensors/GPS, durable storage, database, authentication, APIs or deployment are included. Read `IMPLEMENTATION_STATUS.md` and `docs/FUNCTIONAL_MVP.md` for current evidence, limits, and the manual test flow.

## Try the studio

Open `/run/new`, Load demo beat (or import an authorized local file), Prepare simulation, then Start session. Change cadence, ratio, or adaptation mode; inspect the applied playback rate and listen to the beat. Pause/resume/end, seek, volume, track selection/reordering/removal are functional. For compressed audio, enter BPM manually. The studio uses source-tempo fallback when native pitch preservation is unavailable.

## Verification

```sh
npm run pr-check:quick
npm run test:integration
```

`pr-check:quick` runs generated-route type checking, lint, production build, unit/component tests, and Chromium browser tests. Playwright starts its own production server on port 3100 and never reuses an unrelated server. Run `npm run build` before standalone `npm run test:e2e -- --project=chromium`. Install Chromium once with `npx playwright install chromium` if necessary.

Current verification is recorded in `IMPLEMENTATION_STATUS.md`. The earlier 43-test landing-only count is historical. Run `npm run test:e2e -- --workers=1` for all configured browsers, and install their official runtimes with `npx playwright install chromium firefox webkit`.

The tests cover ratio arithmetic/bounds, semantic contrast, menu and control behavior, no capability/API access, responsive 320/390/768/1440px layouts, reduced motion, no JavaScript, 200% text enlargement, navigation, console errors, and axe WCAG A/AA checks. Screenshots are written to ignored `test-results/` directories. `test:integration` explicitly reports deferred PostgreSQL integration; it is a no-op and is not integration evidence.

`docs/ASSET_MANIFEST.md` records asset provenance. `docs/M2_DEPENDENCIES.json` records the new pinned dependency metadata. Preserve the existing deleted AskMongo baseline; do not restore it.
