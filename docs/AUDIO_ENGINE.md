# PULSE — Audio Engine Design

**Current MVP addendum (2026-10-24):** `FUNCTIONAL_MVP.md` records the user-authorized native-media simulator/audio implementation, explicit temporary-storage policy, measured browser evidence boundary, and deviations from this historical full-product plan. See root `IMPLEMENTATION_STATUS.md` for verified status; this specification is not proof that every planned feature exists.

**Status:** Implementation design. No audio engine is implemented in this preparation step.
**Locked runtime:** Web Audio API, AudioWorklet, custom bounded granular processor first; no mandatory DSP package.

## Overview and ownership

A user gesture creates/resumes one `AudioContext`. A selected local file is validated, decoded to PCM, analyzed locally, and represented by a stable `TrackId`. The main thread owns product policy, lifecycle, track scheduling, and user-facing status. The AudioWorklet owns sample-clock DSP. React never drives audio timing.

Beat-Matched Playlist and Real-Time Tempo Adaptation share track metadata and target math but have separate controllers. Playlist mode changes tracks and does not stretch them. Tempo mode keeps the current track and changes tempo; it does not select a replacement. The sensor estimator owns displayed cadence smoothing. `TargetBpmCalculator` emits an unsmoothed eligible target. `PlaylistMatcher` owns track/ratio hysteresis. `TempoController` alone owns the eight-second DSP smoothing and rate limit. The processor performs no product hysteresis.

## Typed boundaries

These contracts belong in `src/domain/audio/`; browser implementations belong in `src/infrastructure/audio/`.

```ts
type TrackId = string & { readonly __brand: 'TrackId' };
type MonoMs = number & { readonly __brand: 'MonoMs' };
type Bpm = number & { readonly __brand: 'Bpm' };
type TempoRatio = number & { readonly __brand: 'TempoRatio' };

type AudioSource = {
  kind: 'local'; trackId: TrackId; fileName: string; mimeType: string;
  bytes: number; durationMs: number; sourceBpm: Bpm | null;
  bpmConfidence: number; objectUrl: string;
};

type AudioProcessingMode = 'source' | 'tempo-worklet' | 'unavailable';
type AudioFailureCode =
  | 'audio-unavailable' | 'processor-unavailable' | 'decode-error'
  | 'analysis-failed' | 'gesture-required' | 'unsupported' | 'underrun-threshold';

type AudioReady = {
  trackId: TrackId; durationSeconds: number; sourceBpm: Bpm | null;
  processingMode: AudioProcessingMode; maxChannels: 1 | 2;
};

type TempoRequest = {
  targetBpm: Bpm; sourceBpm: Bpm; requestedRatio: TempoRatio;
  minRatio: TempoRatio; maxRatio: TempoRatio;
  reason: 'initial' | 'cadence-change' | 'resume' | 'manual';
};

type TempoCommandResult =
  | { kind: 'applied'; previousRatio: TempoRatio; nextRatio: TempoRatio; appliedAt: MonoMs }
  | { kind: 'range-limited'; requestedRatio: number; appliedRatio: TempoRatio }
  | { kind: 'unavailable'; code: AudioFailureCode };

type AudioEvent =
  | { type: 'ready'; ready: AudioReady; at: MonoMs; recoverable: true }
  | { type: 'playing' | 'paused' | 'ended'; positionSeconds: number; at: MonoMs; recoverable: true }
  | { type: 'decode-error' | 'processor-error' | 'quality-limited'; code: AudioFailureCode; at: MonoMs; recoverable: boolean }
  | { type: 'buffer-underrun'; count: number; fillMs: number; at: MonoMs; recoverable: true }
  | { type: 'suspended' | 'route-change' | 'gesture-required'; at: MonoMs; recoverable: true }
  | { type: 'cleanup-confirmed'; at: MonoMs; recoverable: true };

interface TempoProcessorPort {
  prepare(input: { channels: 1 | 2; sampleRate: number; durationSeconds: number }): Promise<void>;
  writePcm(channels: readonly Float32Array[]): void;
  setRatio(ratio: TempoRatio): void;
  pause(): void;
  resume(): Promise<void>;
  flush(): Promise<void>;
  metrics(): { fillMs: number; underruns: number; renderBudgetRatio: number };
  dispose(): Promise<void>;
}

interface AudioEngine {
  prepare(source: AudioSource): Promise<AudioReady>;
  play(): Promise<void>;
  pause(): void;
  stop(): Promise<void>;
  position(): { positionSeconds: number; durationSeconds: number };
  setVolume(value: number): void; // 0..1
  setMuted(muted: boolean): void;
  setTempo(request: TempoRequest): TempoCommandResult;
  setMode(mode: 'playlist' | 'tempo' | 'off'): void;
  subscribe(listener: (event: AudioEvent) => void): () => void;
}
```

`AudioBufferSourceNode` is one-shot. Pause captures `positionSeconds = context.currentTime - startedContextTime + startOffset`, stops the node, and resume creates a new source with the saved offset. A source is never reused after `stop()`. The worklet is paused by stopping input/feed and silencing its gain, not by draining an empty buffer. `cleanup-confirmed` is emitted only after nodes, listeners, object URLs, and worklet ports are released.

## Pipeline

```text
FilePicker -> FileValidator -> ArrayBuffer -> decodeAudioData
  -> PCM cache/BPM worker -> AudioScheduler
  -> playlist: AudioBufferSourceNode -> GainNode
  -> tempo: bounded ring buffer -> AudioWorkletNode -> GainNode
  -> optional AnalyserNode -> AudioContext.destination
```

Only user-selected local files are accepted. Remote URLs are not accepted by the import path. The server stores metadata and playlist membership, not bytes or object URLs.

## Validation and lifecycle errors

The picker must be opened by a user action. Accept is a hint; validate `1..209715200` bytes, filename <=255 Unicode code points, decoder support, finite metadata, and one or two channels. Reject empty, oversized, corrupt, or unsupported files without upload. Manual BPM is finite `40..240`, one decimal. Volume is `0..1`. Ratio is bounded by validated session min/max, defaults `0.80..1.25`.

| Operation/failure | Caller receives | Recoverability, action, logging |
|---|---|---|
| Context creation fails/insecure | `audio-unavailable` | Recoverable: continue muted; info once with capability code. |
| Worklet module/CSP fails | `processor-unavailable` | Recoverable: source-tempo fallback; error with build/version, never PCM. |
| Decode fails | `decode-error` | Recoverable: remove from playable queue; user-safe message; log track ID/code only. |
| Analysis times out/fails | `analysis-failed` or low confidence | Recoverable: manual BPM or source-tempo playback; warning once. |
| Autoplay/context suspended | `gesture-required` | Recoverable: show Resume control; no retry loop. |
| Ring buffer underruns | `buffer-underrun` | Recoverable initially: freeze commands/refill; after threshold switch to source tempo and warn. |
| Processor throws/NaN/channel mismatch | `processor-error` | Fatal to tempo path, not run: fade out worklet and use source tempo if possible; error log with track ID. |
| Visibility/route suspends context | `suspended`/`route-change` | Recoverable: preserve run; request gesture/resume and recalibrate if needed; info log. |
| Natural track end | `ended` | Recoverable: playlist controller chooses next; otherwise remain ready. |
| Stop/cleanup failure | typed cleanup warning | Session completion remains local; retry cleanup; error log without audio payload. |

Expected failures are status values, not thrown UI exceptions. Unexpected adapter exceptions are caught at the session boundary.

## BPM analysis

`BpmAnalyzer` accepts decoded mono PCM and sample rate. It uses a bounded analysis window, Hann frames such as 2048 samples with 50% overlap, spectral flux, and autocorrelation or a tempo histogram over 40–240 BPM. It scores half/double candidates, returns BPM/confidence/duration/version/warnings, and runs in a worker for long files. Confidence below `0.55` enables correction. The source remains playable if analysis fails.

## Playlist score and transition policy

For each enabled ratio `{ beats, steps }`, `targetBpm = cadenceSpm * beats / steps`. Use one unit for every term:

```text
scoreBpm = abs(trackBpm - targetBpm)
         + (1 - bpmConfidence) * 12
         + recencyPenaltyBpm       // 0..6, documented function of recent plays
         + unavailablePenaltyBpm   // 0 for playable, 1000 otherwise
         - keepBiasBpm             // 4 for current playable track, otherwise 0
```

The candidate is the lowest score among playable tracks and enabled ratios. `improvementBpm = currentScoreBpm - candidateScoreBpm`. A track or automatic ratio change requires `improvementBpm >= 8 || improvementBpm / max(currentScoreBpm, 1) >= 0.12`, plus current hold >=90 seconds, cooldown >=45 seconds after the last switch, and two consecutive eligible windows at least two seconds apart. A ratio lock disables ratio changes. A current decode/processor failure bypasses hold/cooldown for replacement.

BPM alone does not contain phrase phase. The scheduler therefore targets the next estimated beat using `beatPeriod = 60 / sourceBpm`, calculated from current playback position and last known phase. It waits at most four seconds. If phase is unknown, the next beat estimate starts at the next whole period. If a scheduled source cannot be prepared, keep the old source; if the old source ends, start the ready replacement with an 80–150ms equal-power crossfade when possible. At most current and next sources exist. Every decision emits a bounded `PlaybackEvent` with reason, old/new track and ratio, scores, cadence, target, and boundary/fallback result.

## Tempo controller

`TempoController` receives the target from `TargetBpmCalculator`; it does not receive raw motion. It updates no more frequently than every two seconds. On each update, from the prior output only:

```text
requested = clamp(targetBpm / sourceBpm, minRatio, maxRatio)
alpha = 1 - exp(-deltaSeconds / 8)
desired = previousRatio + alpha * (requested - previousRatio)
nextRatio = moveToward(previousRatio, desired, 0.03 * deltaSeconds)
```

`nextRatio` is the only output for that update. There is no second smoothing step. The fake-clock unit test must assert `abs(nextRatio - previousRatio) <= 0.03 * deltaSeconds` for every update, including a large request jump and a long interval. On resume, start from source tempo, refill the prebuffer, then apply the same controller after cadence stabilization. Missing/low-confidence cadence freezes at the last output and marks it stale. A missing source BPM makes tempo mode unavailable.

## Granular AudioWorklet

The first processor uses fixed per-channel `Float32Array` ring buffers, 40–80ms Hann-windowed grains, 50% overlap, and a source-read advance controlled by ratio while output stays at the AudioContext sample rate. It supports 44.1/48kHz decoder output and at most stereo. It targets 500ms prebuffer and reports a 150ms low-water warning. `process()` allocates nothing, validates finite values, and sends throttled metrics every 250–500ms. Commands are versioned; unknown commands are ignored and debug-logged.

A later phase-vocoder or licensed WASM processor may replace the kernel behind `TempoProcessorPort`, but it must pass the same fixture suite: sine frequency preservation, impulse behavior, ratio ramps, end-of-buffer, stereo consistency, and no NaN/Infinity.

## Scheduling, controls, and cleanup

The scheduler returns one of `scheduled-boundary`, `scheduled-immediate-fallback`, `not-ready`, or `failed`. It schedules slightly ahead where supported, owns a maximum two-source queue, and only stops the old source after the replacement is ready. Tempo mode keeps one processor and fades gain to zero only for stop or fatal failure. Volume is a perceptual gain curve with a separate mute flag. Route changes preserve session state and may require a user gesture. End releases nodes, revokes object URLs, closes or suspends the context according to app policy, and waits for cleanup confirmation.

## Testing strategy

Vitest covers BPM bounds/ambiguity, ratio math, the exact score predicate, hold/cooldown/two-window hysteresis, fake-clock rate limit, validators, command parsing, ring indices, and synthetic sine/impulse invariants. Integration tests mock AudioContext, AudioWorkletNode, decoder, clock, and scheduler to verify offset pause/resume, fallback, event order, and cleanup. Playwright covers local import, simulation, permission denial, suspended audio UI, and no network request containing fixture bytes. Real audio quality and battery require the device matrix in `FEASIBILITY_REPORT.md`.

## Source links

- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MDN AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)
- [MDN AudioWorkletProcessor](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor)
- [MDN AudioBufferSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode)
- [MDN decodeAudioData](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData)
- [MDN autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- [Web Audio specification](https://webaudio.github.io/web-audio-api/)
