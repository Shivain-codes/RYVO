export type RunPhase = 'idle' | 'ready' | 'running' | 'paused' | 'completed';
export interface RunSnapshot { phase: RunPhase; elapsedMs: number }
/** Monotonic clock is supplied by the caller; only active time accumulates. */
export class RunSession {
  private phase: RunPhase = 'idle';
  private activeMs = 0;
  private startedAt = 0;
  private lastNow = 0;
  private time(now: number) {
    if (!Number.isFinite(now) || now < this.lastNow) throw new RangeError('Clock must be finite and monotonic.');
    this.lastNow = now;
    return now;
  }
  prepare() { if (this.phase === 'idle') this.phase = 'ready'; }
  start(now: number) {
    this.time(now);
    if (this.phase !== 'ready') return false;
    this.startedAt = now; this.phase = 'running'; return true;
  }
  pause(now: number) {
    this.time(now);
    if (this.phase !== 'running') return false;
    this.activeMs += now - this.startedAt; this.phase = 'paused'; return true;
  }
  resume(now: number) {
    this.time(now);
    if (this.phase !== 'paused') return false;
    this.startedAt = now; this.phase = 'running'; return true;
  }
  end(now: number) {
    this.time(now);
    if (this.phase !== 'running' && this.phase !== 'paused') return false;
    if (this.phase === 'running') this.activeMs += now - this.startedAt;
    this.phase = 'completed'; return true;
  }
  snapshot(now: number): RunSnapshot {
    this.time(now);
    return { phase: this.phase, elapsedMs: this.activeMs + (this.phase === 'running' ? now - this.startedAt : 0) };
  }
}
