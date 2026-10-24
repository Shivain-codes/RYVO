# RYVO functional MVP

Date: 2026-10-24. This is the current local implementation contract, superseding the older preparation-only and worklet-only assumptions for this explicitly requested MVP. The original design verdict and full roadmap acceptance criteria are not silently marked complete.

## Application flow

Open `/run/new`. Prepare simulation, optionally import local audio or load the original demo WAV, then Start session. The pure controller tracks active time with a monotonic clock. Pause freezes active time and audio, resume resets cadence and tempo stabilization, and End stops and rewinds audio and presents a temporary summary. Hidden pages pause automatically. No sensor, location, microphone, account, database, or API is involved.

Simulation is seeded with 42, indexed by active seconds, bounded to 120–200 steps/min, with an optional repeatable sine/jitter variation. Cadence passes through a five-sample median and alpha .2 EWMA. Ratio math is shared with the existing landing demo; cadence, target BPM, source BPM and output BPM estimate remain separate.

## Audio and matching

One HTMLAudioElement owns streaming playback. One gesture-created AudioContext connects its MediaElementAudioSource through an analyser and gain to the destination. The visualizer samples that analyser at 4Hz and is flat when playback is inactive. Volume operates on the gain; position is read from the media element. Play rejection, decode failure, buffering, missing BPM, source-tempo fallback and context suspension have explicit UI states. File object URLs, contexts, nodes, listeners and timers are released on route cleanup. Ending a run retains the temporary playlist so it can be reused; navigating away releases it.

Imports validate nonempty content signatures (WAV/MP3/M4A/Ogg/FLAC), browser metadata decoding, filename length, duration <=30 minutes, 20 MiB per-file, 100 MiB total and 20-track limits. Codec/channel decoding/downmix is delegated to the native streaming decoder, not represented as validated stereo PCM. No unrestricted compressed-file PCM decoding occurs. Filename, format, bytes and duration are actual metadata; embedded artist/album tags are not parsed. The in-memory list supports selection, removal and up/down ordering. Files and sessions are explicitly temporary and unsaved.

Automatic BPM estimation covers 16-bit mono/stereo PCM WAV up to 8 MiB. Analysis reads at most 30 seconds, produces a 200Hz energy-onset envelope and autocorrelation over 40–240 BPM, and surfaces half/double-time ambiguity. Other formats and low-confidence/failed analysis remain playable at source tempo; manual correction accepts 40–240 BPM, one decimal. Clearing correction makes BPM unknown and disables adaptation.

Playlist scores are max(0, BPM error + confidence penalty + recency penalty − keep bias). The last four selections receive recency penalties 6/4/2/0 BPM. Unknown BPM and failed tracks are excluded. Ties follow playlist order. Ratio is user-locked. Automatic replacement requires 90 seconds active playback hold, 45 seconds cooldown, two eligible windows separated by two seconds and the specified 8 BPM OR 12% improvement. Pauses do not count as played time. Switching occurs at the next estimated beat (<=4 seconds), using a single media element; small transition gaps are possible and seamless crossfading is not claimed. Manual Next/Select actions bypass automatic hold by design. Natural end advances the ordered playlist in playlist mode; tempo mode never automatically changes tracks.

Tempo mode uses HTMLMediaElement playbackRate with preservesPitch, feature-detected. The pure controller updates at most every two seconds, uses one eight-second exponential approach, rate-limits to .03 ratio units/second, and clamps .80–1.25. Source BPM multiplied by the actual media playbackRate gives the displayed output estimate. A target outside bounds is always marked limited; missing BPM and unsupported pitch preservation use source tempo. No custom DSP/worklet is used or claimed. Playback state, context state, buffering and actual media-clock progress gate synchronization; a clock stalled for two seconds freezes adaptation and exposes retry; a paused/silent stream never claims active sync.

## Readiness and architecture decisions

The user's current request authorizes this bounded simulator/audio MVP, not the entire historical M3–M7 roadmap. Simulation preparation is synchronous and permission-free, so no async capability wait needs a 12-second readiness timeout. Audio import is independent, optional and has a 12-second metadata timeout. Audio failure can never block a silent simulation. This is the explicitly labeled UNSAVED_LOCAL path resolving the earlier ambiguous storage-readiness contract for the MVP; durable outbox/history remains future work.

Domain code is browser-independent. Browser resources live in infrastructure; React subscribes to serializable workspace snapshots. The existing installed stack is preserved without additional runtime dependencies. The earlier planned Zustand wrapper, Zod server validators and server cache are deferred because this single local workspace has no server state. Inputs use explicit domain/runtime validation.

## Manual verification

1. From the Desktop Kiro checkout run `npm ci`, `npm run build`, then `npm run start`. Open http://127.0.0.1:3000/run/new.
2. Load demo beat (an original 72-second synthesized WAV) or choose your own audio. For compressed formats, enter the track's BPM and Save BPM. Use authorized local files only.
3. Prepare simulation and Start session. Change cadence from 160 toward 190/200. Smoothed cadence settles gradually; tempo commands arrive every two seconds. Watch the applied rate, actual playback position and measured spectrum; listen for the beat changing while pitch remains approximately stable.
4. Choose 1:2 or 2:1 to exercise range-limited status. Switch Original tempo to return to 1.000×.
5. Pause session, confirm both timer/audio stop, Resume, then End. Pause audio separately to keep simulation running silently. Test seek and volume.
6. Import two tracks with different corrected BPM. Choose Beat-matched playlist, start near the first BPM, then move cadence toward the second. After the 90-second active-playback hold and consecutive decision windows, the selected track changes. Use long enough files; short tracks naturally advance first.
7. Try invalid bytes, clear BPM, remove a selected track, reorder tracks, hide the tab, and return. Check visible fallback/status messages. Reload only after ending: it intentionally clears session and files.

## Browser/quality limits

Automated verification uses Playwright desktop Chromium, Firefox and WebKit. WebKit automation is not physical iPhone/iPad or branded Safari certification. A synthetic 440Hz tone is measured through the production player/analyser during real tempo adaptation; that checks pitch, not perceived quality on real music. Percussive/vocal quality, Bluetooth, battery, mobile interruption and long listening sessions still require manual/device evaluation. A custom DSP implementation would only be justified after those results show native processing is insufficient. MP3/AAC/Ogg/FLAC support follows the installed browser and platform decoder; current automated audio fixtures are PCM WAV.

Not included: device sensors/GPS, pace/distance claims, durable session/file storage, server history, authentication, database, deployment, phase/phrase alignment or seamless crossfades.

## Native API references checked

- https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/preservesPitch
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate
- https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode

The media-element API differs from AudioBufferSourceNode.playbackRate: pitch correction is explicitly enabled on the former. Browser property support alone is not quality evidence; the automated signal and playback tests are required.

## Verification recorded on 2026-10-24

Lint, strict TypeScript and production build pass. 39 domain and 5 component tests pass. The full 39-case browser run passed in Chromium/Firefox/WebKit, followed by three passing instances of the newly added stalled-playback regression: 86 verified tests total. The final 42 browser cases were verified across these two runs, not one combined rerun. Browser audio checks ran serially with the Mac awake. No unresolved failing MVP check remains; physical-device and subjective music-quality limits above still apply.

Repeat checks: `npm run lint`, `npm run typecheck`, `npm run test:unit -- --run`, `npm run test:components -- --run`, `npm run build`, then `npm run test:e2e -- --workers=1`. On macOS, prefix the browser command with `caffeinate -di` to prevent idle sleep during real-audio tests. Browser binaries must be installed for Playwright. The existing `test:integration` script is a deferred database placeholder and is not counted as integration proof; real audio integration is tested by the browser suite.
