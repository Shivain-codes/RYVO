import { validBpm } from '../audio/tempo';
export interface MatchTrack { id: string; bpm: number | null; confidence: number; playable: boolean }
export function trackScore(track: MatchTrack, target: number, current: string | null, recent: readonly string[]) {
  if (!track.playable || !validBpm(track.bpm) || !Number.isFinite(target) || target <= 0) return Infinity;
  const index = recent.indexOf(track.id);
  const recency = index < 0 ? 0 : Math.max(0, 6 - index * 2);
  return Math.max(0, Math.abs(track.bpm - target) + (1 - Math.min(1, Math.max(0, track.confidence))) * 12 + recency - (track.id === current ? 4 : 0));
}
export class PlaylistMatcher {
  private selectedAt = 0;
  private lastSwitch = -Infinity;
  private candidate: string | null = null;
  private candidateAt = 0;
  private recent: string[] = [];
  selected(id: string, now: number) {
    this.selectedAt = now; this.lastSwitch = now; this.candidate = null;
    this.recent = [id, ...this.recent.filter(value => value !== id)].slice(0, 4);
  }
  choose(tracks: readonly MatchTrack[], current: string | null, target: number, now: number, force = false): string | null {
    if (!Number.isFinite(target) || target <= 0 || !Number.isFinite(now)) return null;
    const ranked = tracks.map(track => ({ id: track.id, score: trackScore(track, target, current, this.recent) })).filter(t => Number.isFinite(t.score)).sort((a, b) => a.score - b.score);
    const best = ranked[0];
    if (!best) { this.candidate = null; return null; }
    const present = ranked.find(t => t.id === current);
    if (force || !present) return best.id;
    const improvement = present.score - best.score;
    if (best.id === current || now - this.selectedAt < 90_000 || now - this.lastSwitch < 45_000 || !(improvement >= 8 || improvement / Math.max(present.score, 1) >= .12)) { this.candidate = null; return null; }
    if (this.candidate !== best.id) { this.candidate = best.id; this.candidateAt = now; return null; }
    return now - this.candidateAt >= 2000 ? best.id : null;
  }
}
export function nextBeatDelay(position: number, bpm: number | null) {
  if (!validBpm(bpm) || !Number.isFinite(position) || position < 0) return 0;
  const period = 60 / bpm;
  return Math.min(4000, (period - position % period) * 1000);
}
