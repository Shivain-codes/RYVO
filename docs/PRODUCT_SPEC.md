# PULSE — Product Specification

**Current MVP addendum (2026-10-24):** `FUNCTIONAL_MVP.md` records the user-authorized native-media simulator/audio implementation, explicit temporary-storage policy, measured browser evidence boundary, and deviations from this historical full-product plan. See root `IMPLEMENTATION_STATUS.md` for verified status; this specification is not proof that every planned feature exists.

**Status:** Preparation specification. All behavior below is planned; this preparation step does not implement the product.
**Product:** PULSE — Run to Your Own Rhythm
**Tagline:** Your pace changes. Your music follows.

## Summary

PULSE turns a runner's measured movement into a musical control signal. The browser estimates cadence locally, derives a target musical BPM, and either selects a suitable local track or gradually changes the tempo of the current supported local track. Cadence is steps per minute; running pace is time per distance. They are separate metrics and are never substituted for one another.

The first release is a foreground browser product. It includes a deterministic Simulation mode that needs no sensor, location, audio, or account permission. Real sensor and location access is permission-gated. Local audio remains on the device by default. Authenticated server features store user-scoped metadata and low-frequency aggregates, never raw motion, precise location, or PCM by default.

This document is a product contract, not an implementation report. The repository currently contains a deleted-in-working-tree AskMongo Vite/Express/MongoDB baseline. Those deletions are preserved. Codex must create the Next.js foundation deliberately and must label planned, simulated, permission-gated, browser-limited, and native-preferred behavior accurately.

## Assumptions and product boundary

- Production server authentication uses Auth.js with a configured Google OAuth provider. A development-only signed local adapter may be enabled by an explicit environment flag. Anonymous users can run Simulation and keep library data locally, but must sign in before server history, server playlists, or server preferences.
- A browser session is foreground-only. Returning to a hidden or suspended page requires lifecycle recovery and cadence re-stabilization; PULSE does not promise lock-screen recording.
- “Audio constraints” means local import and adaptation policy: maximum file size, maximum channel count, supported browser decoding, tempo bounds, and original-tempo fallback. It does not mean access to a device music library.
- Manual metrics are an explicit fallback, not a hidden estimate: cadence is a finite `40..240 steps/min`, optional pace is `0.1..20 seconds/meter`, values update at most once per second, and the UI labels the source `Manual` with confidence `0.50`.
- Beat-to-step notation is beats:steps. `1:1` means target BPM equals cadence, `2:1` means twice cadence, and `1:2` means half cadence.

## Goals and non-goals

PULSE must explain the movement-to-music relationship quickly, support two independent adaptation modes, expose signal quality and units, degrade safely when capabilities fail, feel like a premium experimental editorial product, provide a repeatable simulation, and preserve useful history without high-frequency uploads.

PULSE does not guarantee background execution, medical-grade measurements, third-party streaming tempo processing, cloud audio upload, native mobile behavior, social features, route navigation, or a complete music-library integration.

## Users and primary journeys

### Start a real run

The runner opens Start Run, chooses units and an adaptation mode, selects local audio if needed, and sees capability readiness. An explicit Prepare action performs non-prompting checks. The app enters `preparing`; after the selected sources are available and audio is prepared or intentionally skipped, it enters `ready`. The runner then presses Start. A short stabilization period follows. A run can continue muted or without GPS/audio. The runner can pause, resume, or end. An end summary is saved even if an affected capability failed.

### Demonstrate PULSE

A visitor selects Demo Run. The deterministic simulation produces cadence, target BPM, track decisions, and aggregate metrics without asking for permissions. Every surface displays `Simulation`, and the completed session records `isSimulation=true`. The simulation may use a visual or source-tempo audio surrogate, but never claims that an actual audio file was pitch-preservingly stretched.

### Use Beat-Matched Playlist

The runner provides tracks with estimated or manually corrected BPM. PULSE evaluates the enabled ratios, scores candidates in BPM-equivalent units, applies keep bias, a minimum hold, cooldown, and two-window hysteresis, and switches only when the exact threshold policy is met. It schedules the next estimated beat and waits no longer than four seconds unless the current track fails.

### Use Real-Time Tempo Adaptation

The runner imports an authorized local file. If decoding, source BPM, processor capability, and performance checks pass, PULSE sends bounded tempo commands to the AudioWorklet. The processor changes tempo while attempting to preserve pitch. If it fails or underruns repeatedly, PULSE freezes corrections and offers original-tempo playback without claiming adaptation is active.

### Review history

History lists completed and interrupted sessions with distance, active duration, average pace, best 30-second pace, average cadence, adaptation mode, and synchronization percentage when a denominator existed. A session detail shows aggregate samples only when retention is enabled. No route is shown because the base product does not store coordinates.

## Terminology and units

| Term | Meaning | Canonical value / display |
|---|---|---|
| Cadence | Steps per minute | `steps/min`, rounded integer display |
| Pace | Time per distance | `seconds/meter` internally; `min/km` or `min/mi` |
| Distance | Accumulated accepted travel | meters internally |
| Active duration | Elapsed time excluding pauses | integer milliseconds |
| Track BPM | Estimated or corrected musical rate | BPM, one decimal |
| Target BPM | Cadence-derived musical target | BPM, one decimal |
| Ratio | Beats:steps relationship | `1:1`, `2:1`, `1:2` |
| Confidence | Estimate reliability | `0..1` |
| Sensor loss | No usable estimate within timeout | status; never zero cadence |

## Functional requirements

### FR-1. Landing and education

The landing page contains a cinematic hero, oversized display type, editorial explanations of cadence and both adaptation modes, an interactive ratio/BPM demonstration, technology and privacy sections, feature storytelling, and a final Demo Run CTA. It remains understandable with JavaScript animation disabled and with reduced motion. It distinguishes simulation from real sensors and does not imply universal browser support.

### FR-2. Session lifecycle and recovery

The application exposes separate `prepare()` and `start()` operations. `prepare()` moves `idle` or `error` to `preparing`, performs capability checks, and reaches `ready` only when: selected source adapters are constructed, required permissions are granted or the chosen mode is Simulation/Manual, selected audio is decoded or the runner chose no audio, and all required local persistence objects exist. Preparation times out after 12 seconds and reports a recoverable readiness error. `start()` accepts only `ready` and moves to `running` after the initial active timestamp is captured.

The lifecycle is `idle → preparing → ready → running ↔ paused → completing → completed`. Fatal preparation moves to `error`, where the runner can retry or choose `saveWithoutAudio`; that path finalizes a valid session with audio disabled. Resume moves `paused → preparingResume → running` after listeners restart, the audio buffer refills, and one fresh cadence window is available, or after a 12-second timeout with a visible “running without fresh cadence” state. Browser unload moves `running|paused → interruptedLocal`; the local outbox later calls the idempotent interruption reconciliation endpoint. Interrupted sessions are never silently presented as completed.

Only `running` accumulates active duration and accepts metric updates. Pause freezes adaptation and active duration. End is idempotent. A sensor or audio failure never ends the session by itself.

### FR-3. Live run display

The active view shows active elapsed time, distance, pace with `/km` or `/mi`, cadence with `steps/min`, target BPM, current track and BPM, mode, ratio, sync status, and a textual rhythm visualization. The UI marks stale values and never presents lost cadence as zero. It provides accessible pause, resume, and end controls and a persistent actionable status when motion, GPS, audio, or processing is lost.

### FR-4. Beat-Matched Playlist

For each candidate track and enabled ratio, calculate `targetBpm = cadenceSpm × beats / steps`. Calculate one nonnegative score in BPM-equivalent units:

`scoreBpm = abs(trackBpm - targetBpm) + (1 - confidence) × 12 + recencyPenaltyBpm + unavailablePenaltyBpm - keepBiasBpm`.

Defaults are `recencyPenaltyBpm=0..6`, `unavailablePenaltyBpm=1000`, and `keepBiasBpm=4` for the current playable track. The lowest score is the candidate. A switch or automatic ratio change is eligible only when the current track has played at least 90 seconds, post-switch cooldown of 45 seconds has elapsed, the candidate is playable, and it wins two scoring windows at least two seconds apart. The exact improvement rule is `currentScoreBpm - candidateScoreBpm >= 8 || (currentScoreBpm - candidateScoreBpm) / max(currentScoreBpm, 1) >= 0.12`. A locked ratio disables automatic ratio changes. A current-track failure bypasses hold and cooldown.

Switch at the next estimated beat with a maximum four-second wait. BPM alone cannot identify a phrase, so the product does not promise phrase boundaries. If the beat phase is unavailable, use the next beat estimate; if scheduling fails, use a short crossfade or an immediate replacement only after the next source is ready. Every decision records its scores, ratio, reason, and whether a boundary or fallback was used.

### FR-5. Real-Time Tempo Adaptation

This mode does not select tracks. For a current local track with a valid source BPM, calculate `requestedRatio = targetBpm / sourceBpm`, clamp by the session's validated `0.80..1.25` bounds, and send gradual commands no more often than every two seconds. The controller owns the eight-second smoothing and `0.03 ratio units/second` rate limit. The processor owns sample-clock interpolation and does not perform product hysteresis. A requested value outside the bound is reported as `tempo-range-limited`; if bounded adaptation is disabled, playback stays at source tempo.

A track with missing BPM, unsupported decoding, missing worklet, fatal processor error, or repeated underruns is not advertised as adapted. It falls back to source-tempo playback when possible and exposes `Audio limited`.

### FR-6. Local audio and playlists

A user gesture opens the file picker or accepts an explicitly authorized drop. The first implementation accepts files from `1 byte` through `200 MiB`, validates filename length at 255 Unicode code points, confirms decoder support rather than trusting MIME, and supports at most two channels. Rejected files are not uploaded. Browser storage is opt-in. Server records metadata, a client asset identifier, and playlist membership, never audio bytes or object URLs.

### FR-7. BPM analysis and correction

Local analysis returns BPM, confidence, duration, analyzer version, and a bounded failure code. Values below confidence `0.55` are labeled `Check BPM`. Manual correction accepts finite `40..240 BPM` with one decimal precision and supersedes the estimate. Analysis failure still permits source-tempo playback.

### FR-8. Simulation

Simulation supports a seed, cadence segments, ramps, jitter, pauses, sensor loss, GPS distance, and a fixture playlist. It uses the same typed source, session, target, playlist, and audio-controller ports as real adapters. It is visible as Simulation in the run, history, and diagnostics. The default fixture is documented in `SENSOR_ENGINE.md`.

### FR-9. History and preferences

Settings include units, smoothing preset, allowed ratios, mode, `audioMaxFileBytes` (`1..209715200`), `audioMaxChannels` (`1..2`), minimum and maximum tempo ratio (`0.80..1.25`, min < max), `audioFallback` (`ORIGINAL_TEMPO` or `DISABLE_AUDIO`), aggregate upload, and history retention. Changes affect new sessions; each session stores a validated snapshot. A signed-in user can delete server history from Privacy settings.

### FR-10. Permissions, auth, and privacy

Permission prompts occur only after an explicit action and explain motion and location separately. Denial preserves Simulation and Manual paths. Auth.js maps the authenticated provider subject to a `User`; logout clears the server session, and expired sessions return 401. Anonymous users receive local-only simulation and local library behavior; server-backed history, playlists, and preferences require sign-in. Authenticated aggregate upload is opt-in and never includes raw accelerometer, precise coordinates, or PCM.

### FR-11. Best pace and synchronization summary

Best pace is the fastest valid rolling 30-second pace during active, non-paused time, using only pace samples with confidence at least `0.50`, accuracy-qualified GPS, and no stale gap. It is stored as `bestPaceSecPerM`; it is `null` when no qualifying 30-second interval exists.

Synchronization uses formula version `sync-v1`: `100 × matchedEligibleActiveAudioSeconds / eligibleActiveAudioSeconds`, rounded to two decimals, and is `null` when the denominator is zero. Eligibility excludes calibration, pause, lost cadence, no audio, source-tempo fallback, and mode `OFF`. In playlist mode a second is matched when playable track BPM is within `max(5 BPM, 3% of target)`; in tempo mode it is matched when the processor is active and applied ratio is within `0.02` of requested ratio. The client accumulates the two durations locally and sends the bounded totals at completion; the server validates their ranges but does not infer raw sensor data.

## Non-functional requirements

- **Performance:** the run UI remains responsive; sensor work runs outside React renders; worklet `process()` performs no steady-state allocations.
- **Reliability:** capability failures degrade one capability; local completion and interruption records survive network failure and retry idempotently.
- **Privacy:** raw motion, raw GPS, decoded audio, and PCM remain local by default. Default aggregate batches are no more frequent than every 15 seconds.
- **Accessibility:** target WCAG 2.2 AA behavior, visible focus, text alternatives for visualizations, reduced motion, keyboard operation, and 44px controls.
- **Security:** Zod validates every external input; authenticated queries are user-scoped; local audio is never trusted by MIME alone; secrets stay server-side.
- **Testability:** clocks, browser sources, storage, auth, and audio ports are injectable; Simulation is deterministic.

## Acceptance criteria

1. A visitor can start and complete a labeled Simulation run without motion, location, audio, or account permissions.
2. `prepare()` reaches `ready` only after its stated readiness criteria, times out at 12 seconds, and `start()` cannot bypass `ready`.
3. Pause freezes active duration and adaptation; resume performs stabilization; end and completion replay are idempotent.
4. An unload-created `interruptedLocal` record is reconciled by an idempotent interruption request and remains visibly interrupted.
5. Live cadence is labeled `steps/min` and pace is labeled `min/km` or `min/mi`; no calculation or copy treats them as the same value.
6. Beat-Matched Playlist uses only enabled `1:1`, `2:1`, and `1:2` ratios and the exact BPM-unit score and switch predicate in FR-4.
7. Small cadence movement does not switch a track before hold/cooldown; two eligible windows and the threshold are required unless the current track fails.
8. Real-Time Tempo Adaptation never changes playlist selection, keeps each command within bounds, and satisfies `abs(nextRatio - previousRatio) <= 0.03 × elapsedSeconds` for every controller update.
9. Unsupported or failed audio shows source-tempo or unavailable behavior and never claims pitch-preserving adaptation is active.
10. Manual cadence and optional pace accept only the documented finite ranges and visibly report `Manual` source and confidence.
11. Permission denial, sensor loss, GPS timeout/poor accuracy, decode failure, worklet failure, underrun, and network failure each produce a distinct recoverable status without ending a run.
12. A seeded simulation reproduces cadence, targets, playlist decisions, and aggregate summaries in unit and Playwright tests.
13. Best pace is present in completion/history responses, uses the 30-second rule, and is `null` when no valid interval exists.
14. `syncPercent` uses `sync-v1`, has the documented denominator and exclusions, and is `null` when no eligible audio seconds exist.
15. Anonymous server requests are rejected with 401; signed-in records are user-scoped; aggregate sync contains no raw motion, precise location, or PCM.
16. Turning off history retention immediately removes server sessions, samples, and playback events and clears local session summaries and queued uploads after confirmation; local audio is deleted only through its separate remove action.
17. Reduced motion removes nonessential animation without hiding controls or metrics, and the product remains usable at 320px width and 200% zoom.
18. Implementation documentation reports real browser/device evidence before calling a permission-gated or browser-limited capability complete.

## Out of scope

- Native iOS/Android background execution, lock-screen guarantees, and wearable integrations.
- Tempo processing of Spotify, Apple Music, YouTube, or other third-party streams.
- Medical, coaching, injury, or performance claims.
- Automatic cloud upload of audio bytes, raw motion, or precise coordinates.
- Social feeds, sharing, leaderboards, commerce, subscriptions, and route navigation.
- Arbitrary codec support beyond the browser decoder.
- Main product implementation during this preparation step.

## Source notes

- Kelvin was inspected at [kelvin.8b.com](https://kelvin.8b.com/). Concrete observations and the original PULSE translation are in `DESIGN_SYSTEM.md`.
- Browser capability sources are linked in `FEASIBILITY_REPORT.md`, `AUDIO_ENGINE.md`, and `SENSOR_ENGINE.md`.
- Planned versus implemented status is explicit throughout this document; no requirement is evidence that code already exists.
