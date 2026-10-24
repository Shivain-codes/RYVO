export interface BpmEstimate { bpm: number | null; confidence: number; note: string }
export function detectBeat(onsets: readonly number[], hz: number): BpmEstimate {
  if (onsets.length < hz * 4 || !Number.isFinite(hz) || hz <= 0) return { bpm: null, confidence: 0, note: 'Too short to estimate; enter BPM manually.' };
  let energy = 0; for (const value of onsets) energy += value * value;
  if (energy < 1e-7) return { bpm: null, confidence: 0, note: 'No clear beat; enter BPM manually.' };
  const peaks: { lag: number; score: number }[] = [];
  for (let lag = Math.ceil(hz * 60 / 240); lag <= Math.floor(hz * 60 / 40); lag++) {
    let score = 0, a = 0, b = 0;
    for (let i = lag; i < onsets.length; i++) { score += onsets[i] * onsets[i - lag]; a += onsets[i] ** 2; b += onsets[i - lag] ** 2; }
    peaks.push({ lag, score: score / Math.max(1e-10, Math.sqrt(a * b)) });
  }
  const strongest = Math.max(...peaks.map(p => p.score));
  // Prefer the shortest strong period; half/double ambiguity remains visible.
  const best = peaks.find(p => p.score >= strongest * .93) ?? peaks[0];
  if (best.score < .25) return { bpm: null, confidence: best.score, note: 'Uncertain rhythm; enter BPM manually.' };
  return { bpm: Math.round(60 * hz / best.lag * 10) / 10, confidence: Math.min(.9, best.score), note: 'Estimated from WAV onsets. Check half/double-time ambiguity.' };
}
/** Bounded PCM WAV analysis: <=8 MiB, 30 seconds, at most two channels. No full decoded cache. */
export function analyzeWav(buffer: ArrayBuffer): BpmEstimate {
  const view = new DataView(buffer);
  const text = (at: number, count: number) => String.fromCharCode(...new Uint8Array(buffer, at, count));
  const fallback = { bpm: null, confidence: 0, note: 'Manual BPM needed for this file.' };
  if (buffer.byteLength < 44 || buffer.byteLength > 8 * 1024 * 1024 || text(0, 4) !== 'RIFF' || text(8, 4) !== 'WAVE') return fallback;
  let format = 0, channels = 0, rate = 0, bits = 0, offset = 0, size = 0;
  for (let at = 12; at + 8 <= buffer.byteLength;) {
    const length = view.getUint32(at + 4, true), start = at + 8;
    if (start + length > buffer.byteLength) return fallback;
    if (text(at, 4) === 'fmt ' && length >= 16) { format = view.getUint16(start, true); channels = view.getUint16(start + 2, true); rate = view.getUint32(start + 4, true); bits = view.getUint16(start + 14, true); }
    if (text(at, 4) === 'data') { offset = start; size = length; }
    at = start + length + (length % 2);
  }
  if (format !== 1 || ![1, 2].includes(channels) || bits !== 16 || rate < 8000 || rate > 192000 || !offset) return fallback;
  const hop = Math.max(1, Math.round(rate / 200));
  const frames = Math.min(Math.floor(size / (channels * 2)), rate * 30);
  const onset: number[] = []; let previous = 0;
  for (let frame = 0; frame + hop <= frames; frame += hop) {
    let energy = 0;
    for (let i = frame; i < frame + hop; i++) for (let ch = 0; ch < channels; ch++) energy += Math.abs(view.getInt16(offset + (i * channels + ch) * 2, true) / 32768);
    energy /= hop * channels; onset.push(Math.max(0, energy - previous)); previous = energy;
  }
  return detectBeat(onset, rate / hop);
}
