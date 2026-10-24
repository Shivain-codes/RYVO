/** Beats:steps. Pure arithmetic shared by the educational demo; not a run engine. */
export const BEAT_RATIOS = [
  { id: '1:2', beats: 1, steps: 2, name: 'Half time', explanation: 'One beat for every two steps.' },
  { id: '1:1', beats: 1, steps: 1, name: 'Every step', explanation: 'One beat for every step.' },
  { id: '2:1', beats: 2, steps: 1, name: 'Double time', explanation: 'Two beats for every step.' },
] as const;

export type BeatRatioId = (typeof BEAT_RATIOS)[number]['id'];

export function calculateDemoTarget(cadenceSpm: number, ratioId: BeatRatioId): number {
  if (!Number.isFinite(cadenceSpm) || cadenceSpm < 40 || cadenceSpm > 240) {
    throw new RangeError('Cadence must be between 40 and 240 steps/min.');
  }
  const ratio = BEAT_RATIOS.find(({ id }) => id === ratioId);
  if (!ratio) throw new RangeError('Unsupported beat-to-step ratio.');
  return Math.round(cadenceSpm * ratio.beats / ratio.steps * 10) / 10;
}
