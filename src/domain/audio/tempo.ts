export function validBpm(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value >= 40 && value <= 240;
}
export function parseBpm(value: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  if (!validBpm(number) || Math.abs(number * 10 - Math.round(number * 10)) > 1e-7) throw new RangeError('Enter 40–240 BPM, with at most one decimal.');
  return number;
}
export class TempoController {
  private ratio = 1;
  private at = 0;
  reset(now: number) { this.ratio = 1; this.at = now; }
  update(target: number | null, source: number | null, now: number) {
    if (!Number.isFinite(now) || now < this.at || target === null || !Number.isFinite(target) || target <= 0 || !validBpm(source)) return { rate: this.ratio, limited: false, valid: false };
    const requested = target / source;
    const limited = requested < .8 || requested > 1.25;
    const seconds = (now - this.at) / 1000;
    if (seconds >= 2) {
      const bounded = Math.max(.8, Math.min(1.25, requested));
      const desired = this.ratio + (1 - Math.exp(-seconds / 8)) * (bounded - this.ratio);
      const maxChange = .03 * seconds;
      this.ratio += Math.max(-maxChange, Math.min(maxChange, desired - this.ratio));
      this.at = now;
    }
    return { rate: this.ratio, limited, valid: true };
  }
}
