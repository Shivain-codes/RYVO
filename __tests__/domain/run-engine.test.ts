import { describe, it, expect } from 'vitest';
import { RunSession } from '@/src/domain/run/session';
import { simulatedCadence, CadenceSmoother } from '@/src/domain/simulation/cadence';
import { TempoController, parseBpm } from '@/src/domain/audio/tempo';
import { PlaylistMatcher, trackScore, nextBeatDelay } from '@/src/domain/playlist/matcher';
import { analyzeWav, detectBeat } from '@/src/domain/audio/wav';
import { calculateDemoTarget } from '@/src/domain/shared/beat-ratio';
describe('run lifecycle', () => {
  it('requires preparation; duplicate start/end are safe, paused time is excluded', () => {
    const run = new RunSession(); expect(run.start(0)).toBe(false); run.prepare(); expect(run.start(10)).toBe(true); expect(run.start(20)).toBe(false);
    expect(run.snapshot(1010)).toEqual({ phase: 'running', elapsedMs: 1000 }); run.pause(2010); run.pause(3010);
    expect(run.snapshot(5000).elapsedMs).toBe(2000); run.resume(6000); expect(run.snapshot(6500).elapsedMs).toBe(2500);
    expect(run.end(7000)).toBe(true); expect(run.end(8000)).toBe(false); expect(run.resume(9000)).toBe(false);
    expect(run.snapshot(10000)).toEqual({ phase: 'completed', elapsedMs: 3000 });
  });
  it('rejects invalid clocks', () => { const r = new RunSession(); r.snapshot(100); expect(() => r.snapshot(99)).toThrow(); expect(() => r.snapshot(NaN)).toThrow(); });
});
describe('cadence and targets', () => {
  it('is reproducible across indexed samples and bounded at extremes', () => {
    const a = Array.from({ length: 500 }, (_, i) => simulatedCadence(42, i, 200, true));
    expect(a).toEqual(Array.from({ length: 500 }, (_, i) => simulatedCadence(42, i, 200, true)));
    expect(a.every(v => v <= 200 && v >= 120)).toBe(true);
    expect(simulatedCadence(42, 12, 160, false)).toBe(160); expect(() => simulatedCadence(42, 1, NaN, true)).toThrow();
  });
  it('rejects outliers and approaches new cadence with one smoothing owner', () => {
    const s = new CadenceSmoother(); for (let i = 0; i < 5; i++) s.update(160);
    expect(s.update(200)).toBe(160); let value = 160; for (let i = 0; i < 25; i++) value = s.update(200);
    expect(value).toBeGreaterThan(199); s.reset(); expect(s.update(120)).toBe(120);
    expect(calculateDemoTarget(173, '1:2')).toBe(86.5); expect(calculateDemoTarget(200, '2:1')).toBe(400);
  });
});
describe('tempo policy', () => {
  it('updates at 2-second intervals, stays in bounds and rate limits every step', () => {
    const t = new TempoController(); t.reset(0); expect(t.update(200, 160, 1999).rate).toBe(1);
    let rate = 1;
    for (let now = 2000; now <= 60000; now += 2000) { const next = t.update(now < 30000 ? 400 : 40, 160, now).rate; expect(Math.abs(next - rate)).toBeLessThanOrEqual(.0600001); expect(next).toBeGreaterThanOrEqual(.8); expect(next).toBeLessThanOrEqual(1.25); rate = next; }
    expect(t.update(400, 160, 62000).limited).toBe(true); expect(t.update(NaN, null, 64000).valid).toBe(false);
    t.reset(65000); expect(t.update(160, 160, 65000).rate).toBe(1);
  });
  it('manual corrections reject junk and preserve one decimal', () => { expect(parseBpm('173.5')).toBe(173.5); expect(parseBpm('')).toBe(null); for (const v of ['NaN','Infinity','-1','241','160.123']) expect(() => parseBpm(v)).toThrow(); });
});
describe('playlist matching', () => {
  const tracks = [{ id: 'a', bpm: 120, confidence: 1, playable: true }, { id: 'b', bpm: 180, confidence: 1, playable: true }];
  it('requires hold and consecutive windows; selects a replacement when current invalid', () => {
    const m = new PlaylistMatcher(); m.selected('a', 0);
    expect(m.choose(tracks, 'a', 180, 89000)).toBe(null);
    expect(m.choose(tracks, 'a', 180, 90000)).toBe(null);
    expect(m.choose(tracks, 'a', 180, 91000)).toBe(null);
    expect(m.choose(tracks, 'a', 180, 92000)).toBe('b'); m.selected('b', 92000);
    expect(m.choose(tracks, 'b', 120, 100000)).toBe(null);
    expect(m.choose([{ ...tracks[0], playable: false }, tracks[1]], 'a', 180, 100001)).toBe('b');
  });
  it('handles no BPM, nonnegative bias, small improvements, deterministic ordering', () => {
    const m = new PlaylistMatcher(); expect(m.choose([{...tracks[0], bpm:null}], null,160,0)).toBe(null);
    expect(trackScore(tracks[0],120,'a',[])).toBe(0); expect(m.choose(tracks,null,180,0,true)).toBe('b');
    m.selected('a', 0); expect(m.choose(tracks,'a',121,100000)).toBe(null); expect(m.choose(tracks,'a',NaN,102000)).toBe(null);
    expect(nextBeatDelay(1,120)).toBe(500); expect(nextBeatDelay(NaN,120)).toBe(0);
  });
});
describe('bounded BPM analysis', () => {
  it('finds a synthetic 120 BPM onset train and refuses silence', () => {
    const onsets = Array.from({length: 4000}, (_,i) => i % 100 === 0 ? 1 : 0);
    expect(detectBeat(onsets,200).bpm).toBe(120); expect(detectBeat(Array(4000).fill(0) as number[],200).bpm).toBe(null);
  });
  it('rejects malformed WAV without unsafe reads', () => { expect(analyzeWav(new ArrayBuffer(1)).bpm).toBe(null); expect(analyzeWav(new ArrayBuffer(50)).bpm).toBe(null); });
});
