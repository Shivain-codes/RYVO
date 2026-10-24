export function validateCadence(value: number) {
  if (!Number.isFinite(value) || value < 120 || value > 200) throw new RangeError('Simulation cadence must be 120–200 steps/min.');
  return value;
}
/** Indexed seeded noise makes samples independent of UI callback timing. */
export function simulatedCadence(seed: number, index: number, base: number, variation: boolean) {
  validateCadence(base);
  if (!Number.isInteger(seed) || !Number.isInteger(index) || index < 0) throw new RangeError('Invalid simulation seed or index.');
  let n = (seed ^ Math.imul(index + 1, 0x45d9f3b)) | 0;
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n ^= n >>> 16;
  const jitter = ((n >>> 0) / 4294967295 - .5) * 4;
  return Math.min(200, Math.max(120, base + (variation ? jitter + Math.sin(index / 12) * 4 : 0)));
}
export class CadenceSmoother {
  private values: number[] = [];
  private value: number | null = null;
  reset() { this.values = []; this.value = null; }
  update(sample: number) {
    validateCadence(sample);
    this.values.push(sample); if (this.values.length > 5) this.values.shift();
    const sorted = [...this.values].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    this.value = this.value === null ? median : this.value + .2 * (median - this.value);
    return Math.round(this.value * 10) / 10;
  }
}
