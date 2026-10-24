# PULSE — Feasibility Report

**Current MVP addendum (2026-10-24):** `FUNCTIONAL_MVP.md` records the user-authorized native-media simulator/audio implementation, explicit temporary-storage policy, measured browser evidence boundary, and deviations from this historical full-product plan. See root `IMPLEMENTATION_STATUS.md` for verified status; this specification is not proof that every planned feature exists.

**Status:** Research and implementation boundary. No capability is claimed implemented.
**Research check:** 2026-10-24. Browser and package behavior must be rechecked at implementation and release time.

## Executive conclusion

A strong foreground browser demonstration is feasible when motion, location, and audio are optional adapters. A modern browser can request motion permission, consume geolocation, estimate cadence, decode a user-selected local file, analyze BPM, and run deterministic Simulation. Browser-local pitch-preserving tempo processing is feasible for decoded local audio with an AudioWorklet, but it is the highest-risk feature and requires real-device quality and battery tests. Reliable lock-screen/background capture and processing of third-party streams are not browser promises.

## Capability classification

| Capability | Classification | Product decision |
|---|---|---|
| Deterministic Simulation | Fully feasible | Build first; reference test path. |
| Local session metrics | Fully feasible | Keep live state on device; persist aggregates. |
| Device motion | Permission-gated/browser-limited | Feature-detect, request after gesture, offer Simulation/Manual. |
| GPS distance/coarse pace | Permission-gated/noisy | `watchPosition`, accuracy filtering, no raw upload by default. |
| Cadence from phone motion | Permission-gated/placement-sensitive | Estimate with confidence; no accuracy guarantee. |
| Local file selection/decode | Feasible subject to codec | User gesture, decoder validation, local by default. |
| BPM analysis | Feasible, quality-variable | Analyze locally and permit manual correction. |
| AudioWorklet | Feasible in supporting modern browsers | Feature-detect secure context and module registration. |
| Pitch-preserving stretch | Feasible with CPU/quality limits | Custom bounded worklet, source-tempo fallback. |
| Foreground audio | Feasible with gesture/autoplay rules | Resume only from explicit user action when required. |
| Background sensors/audio | Browser-limited | Foreground only; native-preferred later. |
| Streaming tempo adaptation | Not supported by product boundary | Local files only. |
| Server history/aggregate sync | Feasible | Authenticated, low-frequency, user-scoped. |

## Motion sensors

`DeviceMotionEvent` may require secure context and a permission request triggered by a user gesture. The permission method is not universal, so feature detection is mandatory. Event frequency, coordinate conventions, timestamps, and permission behavior vary across browsers and devices. The current MDN static-method reference is [DeviceMotionEvent.requestPermission()](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent/requestPermission_static); the former non-static URL is not used.

Decision: request motion only from Prepare/Start, normalize fields at ingress, publish confidence and freshness, handle revocation and lifecycle suspension, and retain Simulation/Manual. Phone placement affects quality and must be explained. A desktop mock proves logic only, not sensor quality.

## GPS speed, pace, and distance

`navigator.geolocation.watchPosition()` requires secure context and user permission. Position `speed` can be null or noisy. Haversine distance between accepted points is a better basis for total distance than instantaneous speed, while short-run GPS drift can inflate distance. PULSE stores meters and derives pace in `seconds/meter`; it displays `min/km` or `min/mi`. Pace is never used as cadence.

Sources: [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API), [MDN watchPosition](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition), [W3C Geolocation](https://www.w3.org/TR/geolocation/).

Decision: request high accuracy only during an active real run by default, use `maximumAge=2000` and `timeout=10000`, reject accuracy over 100m for pace, reject implausible jumps over 8m/s unless sustained, and keep cadence/elapsed time running when GPS fails.

## Lifecycle and background execution

Source correction (2026-10-24, F-13): removed the dead MDN Page Lifecycle URL; the canonical Chrome source below was rechecked successfully.

Page Visibility and Page Lifecycle events do not guarantee that timers, motion callbacks, location callbacks, or Web Audio continue after backgrounding or lock. Mobile operating systems may suspend or reclaim the page. On return, PULSE records a lifecycle event, marks metrics stale, restarts sources where possible, and requires fresh cadence stabilization. Reliable lock-screen behavior, OS sensor batching, and durable audio controls are native-preferred.

Sources: [MDN Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API), [web.dev Page Lifecycle](https://developer.chrome.com/docs/web-platform/page-lifecycle-api).

## Audio decoding and processing

Web Audio can decode user-selected audio into `AudioBuffer`; AudioWorklet runs custom DSP on the audio rendering thread. Processing still shares CPU and has a finite render budget. Codec support is platform-dependent. AudioContext creation/resume follows autoplay gesture rules. Use `decodeAudioData`, a fixed ring buffer, a bounded prebuffer, and `AudioBufferSourceNode` fallback. Do not use deprecated ScriptProcessorNode.

Sources: [MDN Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API), [MDN AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet), [MDN AudioWorkletProcessor](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor), [Web Audio specification](https://webaudio.github.io/web-audio-api/), [MDN autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).

## Pitch-preserving tempo adaptation

`AudioBufferSourceNode.playbackRate` changes pitch with tempo. Pitch-preserving output requires granular overlap-add or a phase vocoder. Granular processing is selected first because its bounded memory and synthetic-signal tests are straightforward. It can smear transients or sound phasey and must not be marketed as transparent on every device. The product caps ratios at `0.80..1.25`, measures underruns, freezes corrections under buffer pressure, and falls back to source tempo.

## BPM analysis

A local analyzer can downmix PCM, window frames, calculate spectral flux, and select a candidate period by autocorrelation or tempo histogram across 40–240 BPM. Half/double-time ambiguity is unavoidable. Analysis runs in a worker for long files, returns confidence and version, and enables manual correction below `0.55` confidence. The browser does not need to upload audio.

## Buffering and glitches

Use one fixed `Float32Array` ring buffer per channel with a single-producer/single-consumer index protocol. Prebuffer 500ms before play; report a 150ms low-water warning. Send worklet telemetry every 250–500ms rather than per sample. Freeze tempo corrections on low buffer, then fall back after the configured underrun threshold. Do not correct a glitch by abruptly changing playback rate.

## Battery

Motion sampling, high-accuracy GPS, FFT analysis, DSP, and animation can be expensive together. PULSE resamples motion at 50Hz, estimates cadence in windows, requests GPS only during active runs, analyzes each track once, throttles visualization to 30Hz, reduces detail when hidden, and offers a battery-saver setting. Battery claims require device evidence.

Sources: [MDN geolocation options](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition), [Web Audio autoplay guidance](https://developer.chrome.com/blog/web-audio-autoplay), [W3C DeviceOrientation](https://www.w3.org/TR/orientation-event/).

## Streaming restrictions

PULSE does not route Spotify, Apple Music, YouTube, or another provider's licensed stream through its DSP. Provider playback SDKs do not provide arbitrary PCM access for this use and provider terms constrain content handling. Local files selected by the user are the supported adaptation source.

Sources: [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk), [Spotify Developer Terms](https://developer.spotify.com/terms), [Apple MusicKit JS](https://developer.apple.com/documentation/musickitjs).

## Dependency and font record

The table records candidate pins checked against npm registry metadata and canonical repositories on 2026-10-24. It is evidence for the preparation decision, not a promise that versions will remain current. Codex must run a fresh audit before installation and record the final lockfile. SPDX terms and canonical links are included so legal review does not depend on package descriptions.

| Package | Candidate version | SPDX/license source | Maintenance evidence at check | Browser/support role and decision |
|---|---:|---|---|---|
| `next` | 16.4.3 | MIT, [repo](https://github.com/vercel/next.js), [license](https://github.com/vercel/next.js/blob/canary/license.md) | npm version published; active upstream repo | Server/runtime and App Router; choose. |
| `react`, `react-dom` | 19.3.1 | MIT, [repo](https://github.com/facebook/react/blob/main/LICENSE) | npm version published; active upstream repo | UI in evergreen browsers; choose. |
| `tailwindcss` | 4.3.3 | MIT, [license](https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE) | npm version published; active upstream repo | CSS generation; choose for tokens/utilities. |
| `gsap` | 3.15.0 | GSAP standard no-charge license, [terms](https://gsap.com/standard-license/), [repo](https://github.com/greensock/GSAP) | npm version published; active upstream repo | Marketing timelines; include only after legal acceptance of standard terms. |
| `motion` | 14.6.0 | MIT, [repo](https://github.com/motiondivision/motion/blob/main/LICENSE.md) | npm version published; active upstream repo | Local transitions; choose where GSAP is excessive. |
| `zustand` | 5.0.16 | MIT, [license](https://github.com/pmndrs/zustand/blob/main/LICENSE) | npm version published; active upstream repo | Serializable view state only; choose. |
| `@tanstack/react-query` | 5.104.5 | MIT, [license](https://github.com/TanStack/query/blob/main/LICENSE) | npm version published; active upstream repo | Server cache/mutations, not sensor polling; choose only where needed. |
| `zod` | 4.6.7 | MIT, [license](https://github.com/colinhacks/zod/blob/main/LICENSE) | npm version published; active upstream repo | Runtime validation; choose. |
| `prisma`, `@prisma/client` | 7.10.1 | Apache-2.0, [license](https://github.com/prisma/prisma/blob/main/LICENSE) | matching stable candidate and active upstream repo | PostgreSQL server ORM; choose matching versions. |
| `vitest` | 5.0.5 | MIT, [license](https://github.com/vitest-dev/vitest/blob/main/LICENSE) | npm version published; active upstream repo | Pure engine tests; choose. |
| `@testing-library/react` | 16.3.3 | MIT, [license](https://github.com/testing-library/react-testing-library/blob/main/LICENSE) | npm version published; active upstream repo | Component behavior tests; choose. |
| `@playwright/test` | 1.64.1 | Apache-2.0, [license](https://github.com/microsoft/playwright/blob/main/LICENSE) | npm version published; active upstream repo | Browser flows and permission mocks; choose. |
| Web Audio / AudioWorklet | Browser standards | W3C standard, [spec](https://webaudio.github.io/web-audio-api/) | vendor-maintained browser APIs | Prefer native APIs; no package. |
| `soundtouchjs` | 0.3.0 | LGPL-2.1, [repo](https://github.com/cutterbl/SoundTouchJS), [license](https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html) | version published but smaller/uneven project risk | Evaluated only; excluded from mandatory bundle because copyleft obligations and integration risk. |

Font candidates are `@fontsource/space-grotesk@5.3.0`, `@fontsource/inter@5.3.0`, and `@fontsource/jetbrains-mono@5.3.0`; each is OFL-1.1, [font license](https://openfontlicense.org/), and distributed from [fontsource/font-files](https://github.com/fontsource/font-files). They are selected for self-hosting and predictable fallback behavior. Bundle only the weights actually used. If a font is not bundled, use the documented system fallback. Rubber Band and aubio are not dependencies: their GPL/native/WASM licensing and integration cost require a separate decision.

## Release feasibility gates

1. Test current Safari iOS, Safari macOS, Chrome Android, Chrome desktop, Firefox desktop, and a desktop without sensors.
2. Test short/long local files, mono/stereo, supported/unsupported codecs, ratios 0.80/1.00/1.25, visibility changes, Bluetooth routes, and a low-power device.
3. Test motion with stationary, walking, running, pocket/arm-band placement, irregular timestamps, denied permissions, and unsupported browsers.
4. Record cadence error, sync formula output, worklet render budget, underruns, memory, and battery behavior.
5. Do not call a permission-gated or browser-limited feature complete from a desktop mock alone.
