import { describe, expect, it } from 'vitest';
import { calculateDemoTarget, type BeatRatioId } from '@/src/domain/shared/beat-ratio';

describe('educational beats:steps conversion', () => {
  it.each([['1:1', 172], ['1:2', 86], ['2:1', 344]] as const)('172 steps/min at %s gives %i BPM', (ratio, bpm) => {
    expect(calculateDemoTarget(172, ratio)).toBe(bpm);
  });
  it('preserves derived targets outside the future track range instead of silently clamping', () => {
    expect(calculateDemoTarget(40, '1:2')).toBe(20);
    expect(calculateDemoTarget(240, '2:1')).toBe(480);
    expect(calculateDemoTarget(171, '1:2')).toBe(85.5);
  });
  it.each([NaN, Infinity, -Infinity, 0, 39, 241])('rejects invalid cadence %s', (value) => {
    expect(() => calculateDemoTarget(value, '1:1')).toThrow(RangeError);
  });
  it('rejects unsupported runtime ratios', () => {
    expect(() => calculateDemoTarget(172, '2:2' as BeatRatioId)).toThrow(RangeError);
  });
});
