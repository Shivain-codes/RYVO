import { describe, expect, it } from 'vitest';
import { asBpm, asMeters, type PulseError } from '@/src/domain/shared';

describe('shared domain contracts', () => {
  it('keeps unit-branded values and stable errors runtime-agnostic', () => {
    const distance = asMeters(1200);
    const tempo = asBpm(172);
    const error: PulseError = {
      code: 'SENSOR_LOST',
      message: 'Cadence is temporarily unavailable.',
      retryable: true,
    };

    expect(distance).toBe(1200);
    expect(tempo).toBe(172);
    expect(error.code).toBe('SENSOR_LOST');
    expect(error.retryable).toBe(true);
  });
});
