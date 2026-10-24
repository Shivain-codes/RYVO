# RYVO implementation status

Audit: 2026-10-24, before functional implementation. Canonical checkout: Desktop/chenyun project. Existing uncommitted frontend changes and intentional AskMongo deletions are preserved. `.kiro/specs/` is absent; no contents are inferred. Root tasks.md, docs/, source, tests, dependency manifest, and preparation review were inspected.

## Implemented and verified at audit

Next.js App Router, strict TypeScript, self-hosted fonts/images, responsive RYVO landing, GSAP scroll motion with reduced-motion support, accessible navigation/disclosures, cadence-to-BPM educational calculator and reset. Fresh baseline: typecheck/lint/build pass; 29 domain and 5 component tests pass; 8 of 9 Chromium tests pass. No sensor/audio permissions or API access on initial landing/preview navigation.

## Partial features

`/run/new` is a styled preparation preview only. Domain folders expose placeholder `kind` ports. Landing 172 steps/min is an explicitly labeled demo value, not a measured run. Local ratio controls work but are disconnected from audio. Start/prepare/player controls do not yet exist. Existing links navigate correctly; the setup link cannot start a run.

## Missing functionality

Session controller/timer, deterministic simulator and smoothing, audio import and playback, playlist controls, metadata/BPM analysis/correction, matching/hysteresis, native pitch-preserving tempo control, real playback visualization, synchronization state, lifecycle/error recovery, and functional integration tests. Database/auth/deployment, device sensors/GPS and durable history remain outside this request.

## Known bugs

Fresh baseline finds 2px horizontal overflow at 640px with 200% root text (one browser test fails). Previous documentation's 43-pass statement describes an earlier run and is not fresh audit evidence. Historical docs contain PULSE names and superseded readiness/source-tempo assumptions.

## Technical risks and scoped decisions

- User's current functional-MVP request supersedes the historical M1/M2-only boundary and explicitly permits browser-native HTMLMediaElement playbackRate + preservesPitch evaluation. Do not label the older granular-worklet milestone complete.
- Keep pure controllers in src/domain and browser APIs/lifecycle under src/infrastructure. Use serializable workspace snapshots with a React effect subscription for this single local workspace; do not add a state dependency merely for a wrapper. No server state or requests.
- Resolve F-01/F-02 for this MVP: prepare simulation independently, optional audio failure never prevents a silent run. Explicit temporary/unsaved mode; reload/navigation discards sessions and files. No claim of durable recovery. Hidden pages auto-pause and require explicit resume.
- Resolve F-06 with native streaming playback, a conservative 20 MiB per-file/100 MiB total/20-track budget, metadata validation, and bounded PCM analysis only for small WAV files. Other codecs remain playable with manual BPM. Avoid unrestricted full compressed-file decoding.
- Resolve F-07/F-08: clamp matcher scores nonnegative, finite BPM 40–240 only, confidence penalty, deterministic ties, 0..6 recency policy. Keep 90s hold/45s cooldown/two-window policy and estimated beat boundary; manual track selection is explicit.
- Tempo: one eight-second controller, two-second cadence of commands, <=.03 ratio units/second, .80..1.25 bounds; unsupported preservesPitch falls back to source tempo. Actual applied rate and playback events drive displayed state; no false sync when paused/buffering/missing BPM/out of range.
- Native time stretching can alter transients; automation cannot establish subjective quality or physical-device compatibility. Record browser evidence separately from perceptual/device validation.
- F-03/04/05/09/10/11/12/17 related server contracts remain deferred; historical design verdict is not changed to approved.

## Remaining priorities

1. Implement and test pure lifecycle/simulator/target engines.
2. Implement local player, resource cleanup, metadata/BPM, and playlists.
3. Implement matching and native tempo adaptation with real playback state.
4. Wire the existing run route and landing entry points without redesigning marketing.
5. Verify all checks, browser audio flow, responsive/accessibility and regressions; record exact outcomes below.

## Final verified state — 2026-10-24

The sections above preserve the before-change audit. This section records the implemented MVP and supersedes the missing/partial entries for its bounded scope.

### Implemented and verified

- Deterministic prepared/running/paused/completed lifecycle, active timer, seeded 120–200 steps/min simulation, median/EWMA cadence smoothing, shared ratio/target calculations and live dashboard.
- Real local streaming audio: import validation, native metadata, playback/pause/resume/seek/volume, actual position, playlist selection/reorder/removal and object-URL cleanup. An original 72-second synthesized demo WAV is included.
- Bounded PCM WAV BPM estimation and manual correction; unknown BPM remains playable without false adaptation.
- Beat-matched selection with hold/cooldown/hysteresis, and native pitch-preserving tempo control with gradual commands, rate limits and 0.80–1.25 bounds.
- Actual media/context/playback progress gates synchronization. The visualizer reads the production analyser. Stalled playback freezes adaptation and offers explicit recovery; hidden pages pause the session.
- Existing RYVO landing design remains; navigation opens the functional studio. Temporary/unsaved state is disclosed.

### Verification results

- Lint, strict type checking and production build: passed.
- Domain tests: 39 passed. Component tests: 5 passed.
- Full browser suite: 39 passed (19 Chromium, 10 Firefox, 10 WebKit). A subsequently added stalled-playback regression passed separately in all three browsers. Total verified: 86 tests, including 42 browser cases. The entire 42-case browser suite was not rerun after this test-only addition.
- Browser checks cover real playback progress, seek/volume, lifecycle, matching, errors/retry, invalid BPM/files, unsupported pitch fallback, cleanup, responsive layouts, accessibility, reduced motion and landing regressions. Run studio axe checks pass at 320/768/1440px; enlarged-text checks pass. The baseline 2px overflow was not reproduced in the final passing suite; no unverified root cause is asserted.
- A 440Hz fixture measured through the actual production player/analyser remained within 430–450Hz while playback rate exceeded 1.08 in Chromium, Firefox and WebKit. This verifies a synthetic signal, not subjective quality of all music.
- Final browser tests ran serially with the Mac kept awake (`caffeinate -di npm run test:e2e -- --workers=1`), after host idle/audio timing disrupted an earlier run. Production UI was also inspected in the in-app browser with real demo playback and tempo adaptation.

### Partial functionality and remaining limitations

No known unresolved failure in the verified MVP checks. Device and perceptual validation remains incomplete. Automated browsers use desktop Chromium/Firefox/WebKit; physical mobile Safari, Android, Bluetooth, battery behavior and long music listening have not been verified. Native codec support varies; automated audio fixtures use PCM WAV. Auto BPM is limited to small 16-bit PCM WAV and may have half/double-time ambiguity. Embedded artist/album tags are not parsed. Native tempo quality varies; estimated beat transitions can have gaps and are not seamless crossfades.

All files and sessions are temporary; reload/navigation discards them. Persistent storage/history, sensors/GPS, custom DSP, authentication, database and deployment remain missing by explicit scope. The full historical M3–M7 roadmap and design-review acceptance criteria are not marked complete.

### Remaining priorities

1. Manual listening and physical-device evaluation before expanding native tempo support claims.
2. Broader codec/metadata coverage and improved BPM analysis if required.
3. Durable storage, sensors and backend work only under a subsequent authorized phase.

See docs/FUNCTIONAL_MVP.md for architecture decisions, exact limitations and manual verification steps.
