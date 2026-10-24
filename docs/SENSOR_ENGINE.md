# PULSE — Sensor and Cadence Engine Design

**Current MVP addendum (2026-10-24):** `FUNCTIONAL_MVP.md` records the user-authorized native-media simulator/audio implementation, explicit temporary-storage policy, measured browser evidence boundary, and deviations from this historical full-product plan. See root `IMPLEMENTATION_STATUS.md` for verified status; this specification is not proof that every planned feature exists.

**Status:** Implementation design. No sensor integration is implemented in this preparation step.
**Canonical units:** acceleration `m/s²`, cadence `steps/min`, speed `m/s`, distance `m`, pace `seconds/meter`, active time `ms`.

## Overview

The sensor engine is a local adapter pipeline. Device motion is permission-gated and placement-sensitive. Geolocation is permission-gated and noisy. Simulation and Manual sources implement the same application ports. Every estimate carries confidence and freshness. Missing cadence is `null`/lost, never zero.

## Typed boundaries and clock domains

Browser device-motion timestamps are not assumed to use the same clock as `performance.now()`. Geolocation timestamps are epoch milliseconds. Adapters convert or preserve both values at ingress:

```ts
type MonoMs = number & { readonly __brand: 'MonoMs' };
type EpochMs = number & { readonly __brand: 'EpochMs' };
type CadenceSpm = number & { readonly __brand: 'CadenceSpm' };
type Meters = number & { readonly __brand: 'Meters' };

type MotionSample = {
  sourceTimestampMs: number | null;       // event timestamp, source-defined
  receivedAtMonoMs: MonoMs;               // used for all intervals
  x: number | null; y: number | null; z: number | null;
  accelerationIncludingGravity: boolean;
  source: 'device-motion' | 'simulation' | 'manual';
};

type PositionSample = {
  sourceTimestamp: EpochMs;               // GeolocationPosition.timestamp
  receivedAtMonoMs: MonoMs;               // used for interval arithmetic
  latitude: number; longitude: number; accuracyM: number;
  speedMps: number | null;
  source: 'geolocation' | 'simulation';
};

type CadenceEstimate = {
  cadenceSpm: CadenceSpm | null; confidence: number;
  sampleTimestamp: MonoMs; windowMs: number;
  status: 'stable' | 'stabilizing' | 'lost' | 'unsupported' | 'permission-denied' | 'manual';
  method: 'periodicity' | 'simulation' | 'manual';
};

type PaceEstimate = {
  secondsPerMeter: number | null; speedMps: number | null;
  distanceM: Meters; confidence: number;
  status: 'valid' | 'stale' | 'poor-accuracy' | 'permission-denied' | 'unsupported' | 'manual';
};

type SensorError =
  | { kind: 'permission-revoked' | 'permission-denied'; capability: 'motion' | 'location'; recoverable: true }
  | { kind: 'unsupported' | 'unavailable' | 'timeout' | 'lifecycle-suspended'; capability: 'motion' | 'location'; recoverable: true }
  | { kind: 'malformed-sample'; capability: 'motion' | 'location'; droppedCount: number; recoverable: true }
  | { kind: 'adapter-failed'; capability: 'motion' | 'location'; recoverable: false };

type SourceHandlers<T> = {
  onSample: (sample: T) => void;
  onError: (error: SensorError) => void;
  onStatus?: (status: 'started' | 'stopped' | 'stale' | 'recovering') => void;
};

interface MotionSource {
  requestPermission(): Promise<'granted' | 'denied' | 'unsupported'>;
  start(handlers: SourceHandlers<MotionSample>): Promise<void>;
  stop(): void; // idempotent
}

interface LocationSource {
  requestPermission(): Promise<'granted' | 'denied' | 'unsupported'>;
  start(handlers: SourceHandlers<PositionSample>): Promise<void>;
  stop(): void; // idempotent
}
```

The adapter receives an injected clock. If the browser timestamp is usable, it is retained for diagnostics only; `receivedAtMonoMs` is the field used for windows, gaps, and joins. A geolocation epoch timestamp is never subtracted from a monotonic timestamp. A source emits a typed error for post-start revocation, timeout, unavailability, malformed input, and lifecycle suspension. `stop()` may be called repeatedly and must clear listeners/watch IDs without throwing.

## Permission and lifecycle flow

1. Probe secure context and feature presence without prompting.
2. Explain motion and location separately.
3. On explicit Prepare/Start, request motion permission. Request location only when pace/distance is enabled.
4. On denial, emit `permission-denied` once, do not retry in a loop, and preserve Simulation/Manual.
5. On pause, stop or ignore callbacks according to battery policy. On resume, restart sources, reset filters, and publish `stabilizing`.
6. On visibility/lifecycle suspension, emit `lifecycle-suspended`, mark values stale, and recover on foreground.
7. On end, stop all adapters in `finally`.

Sources: [MDN DeviceMotionEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent), [MDN DeviceMotionEvent.requestPermission()](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent/requestPermission_static), [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API), [MDN watchPosition](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition), [MDN Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API).

## Motion normalization

Prefer `acceleration` without gravity. If only `accelerationIncludingGravity` exists, subtract a per-axis low-pass gravity estimate. Drop non-finite samples, backwards source timestamps when comparable, and magnitudes over 8g as corrupt input. Resample to 50Hz with linear interpolation only for gaps under 200ms. Reset filters and publish `stabilizing` for larger gaps. The scalar signal is filtered vector magnitude; high-pass removes orientation drift and band-pass retains approximately 1.2–4.0Hz (72–240 steps/min), an initial algorithm range rather than a guarantee.

Malformed samples increment a bounded diagnostic counter and log a throttled debug event containing capability and count, never raw values.

## Cadence estimator

Use an 8-second rolling window at 50Hz with a 2-second hop. For each window, filter/normalize, calculate autocorrelation over 72–240 steps/min periods, inspect peak prominence and neighboring peak ratio, cross-check recent peak intervals, and compute confidence from prominence, interval consistency, sample coverage, and signal energy. Convert period with `cadenceSpm = 60 / periodSeconds`; an invalid out-of-range candidate is rejected, not snapped.

Use the median of the last five valid windows to reject one-window outliers. Apply displayed-cadence EWMA after that median: balanced `alpha=.20` default, responsive `.35`, steady `.10`. This smoothing belongs to the estimator and is snapshotted per session. Reset median/EWMA after source gaps or permission restart. `stable` requires three valid windows, confidence >=.60, and no active-window gap >=500ms. No valid estimate for 5 seconds means `lost` and cadence `null`.

One peak per step versus two peaks per stride can create half/double ambiguity. Compare harmonics, prefer continuity from the previous stable cadence, and expose calibration feedback for implausible values. Ratios do not silently repair a wrong sensor estimate.

## GPS pace and distance

Use `watchPosition` with default `{ enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }`; battery saver may reduce accuracy and lengthen cache age. Validate latitude `[-90,90]`, longitude `[-180,180]`, finite positive accuracy, and finite `receivedAtMonoMs`. Reject accuracy >100m for pace. Calculate haversine distance from the last accepted point; reject implied speed >8m/s unless a sustained sequence supports it. Do not add distance across a gap >30s; start a new segment. Prefer browser speed only when finite and bounded; otherwise derive speed from distance / monotonic interval. Smooth accepted speed with EWMA alpha `.25` and compute pace only above `.5m/s`.

Display `secondsPerMeter × 1000 / 60` as min/km or convert consistently for miles. At zero speed or pause, show `—` or Paused, never infinity. Keep accepted aggregate distance local. No coordinate is uploaded in the base product.

## Manual metric adapter

Manual mode is a real fallback path. The UI accepts cadence `40..240 steps/min` and optional pace `0.1..20 seconds/meter`. Both must be finite; cadence is required for adaptation, pace is optional. Values may update at most once per second. The adapter emits cadence status `manual`, source `manual`, and confidence `0.50`; missing optional pace is `null`. Invalid input is rejected inline without changing the previous valid value. Manual input continues through sensor denial but is paused with the session and marked stale when the user stops editing. It never claims device measurement.

## Target handoff ownership

The sensor engine emits displayed cadence, confidence, and freshness only. `TargetBpmCalculator` receives stable cadence, enabled ratios, and ratio policy and emits raw target candidates plus eligibility. It does not smooth target BPM. `PlaylistMatcher` owns score hysteresis, hold, cooldown, and ratio switching. `TempoController` owns its own eight-second DSP smoothing and rate limit. This prevents double smoothing and keeps playlist and tempo modes behaviorally independent.

If cadence is null, confidence is below session threshold, paused, or stale, the calculator emits no new target and marks the previous target stale. It does not substitute zero.

## Loss and error policy

| Condition | Published status | Behavior |
|---|---|---|
| Permission denied/revoked | permission-denied | Keep run/simulation/manual; explain retry settings. |
| API absent | unsupported | Disable real source; do not throw. |
| Gap <5s | stabilizing | Mark last cadence stale; hold target. |
| Gap >=5s | lost | Cadence/target unavailable; freeze adaptation; audio policy may continue current track. |
| GPS denied | permission-denied | Pace/distance unavailable; cadence continues. |
| GPS timeout/unavailable | stale | Mark pace stale; log info; retry through browser source. |
| Poor accuracy | poor-accuracy | Do not advance invalid distance or derive pace. |
| Hidden/suspended page | stale | Reduce visualization; recover and recalibrate on foreground. |
| Pause | paused | Stop/ignore samples; no active metric accumulation. |
| Estimator numerical failure | stabilizing | Reset window; warn with algorithm version; session continues. |
| Storage failure | local persistence warning | Live display continues; show Not saved locally; error log omits payload. |

Expected capability errors are recoverable statuses. An unexpected adapter exception is fatal only to that adapter and is surfaced with a retry action.

## Deterministic Simulation

`SimulationSource` accepts `{ seed, baseCadenceSpm, segments[] }` and emits the same typed motion/position/status ports as real sources. Segments support duration, cadence ramp, bounded jitter, pause, loss, and GPS speed. The default fixture is:

```text
0–10s: calibrating at 158 spm
10–70s: 168 spm with ±2 spm jitter
70–100s: ramp to 178 spm
100–115s: sensor loss
115–180s: 172 spm
```

The clock advances explicitly in tests and can run in real time in the demo. Every surface shows Simulation; completed history records `isSimulation=true`.

## Testing strategy

Unit tests cover normalization, resampling gaps, filters, autocorrelation fixtures, harmonic ambiguity, median/EWMA thresholds, haversine, GPS jumps, pace formatting, manual bounds, lifecycle timeout, and determinism. Integration tests mock permission APIs and verify start/pause/resume/end cleanup, runtime errors, visibility recovery, target handoff, and local persistence. Playwright covers fixed-seed Simulation, distinct pace/cadence labels, permission denial, lost-sensor banner, and ending without GPS. Real device tests on iOS Safari and Android Chrome are required for sensor quality.
