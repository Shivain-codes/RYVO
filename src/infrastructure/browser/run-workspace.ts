import { RunSession, type RunSnapshot } from '@/src/domain/run/session';
import { CadenceSmoother, simulatedCadence, validateCadence } from '@/src/domain/simulation/cadence';
import { calculateDemoTarget, type BeatRatioId } from '@/src/domain/shared/beat-ratio';
import { parseBpm, TempoController, validBpm } from '@/src/domain/audio/tempo';
import { nextBeatDelay, PlaylistMatcher } from '@/src/domain/playlist/matcher';
import { LocalPlayer, type LocalTrack } from '@/src/infrastructure/audio/local-player';
export type AdaptationMode = 'tempo' | 'playlist' | 'off';
export interface WorkspaceSnapshot {
  run: RunSnapshot; cadence: number; inputCadence: number; variation: boolean; ratio: BeatRatioId; target: number;
  tracks: LocalTrack[]; currentId: string | null; mode: AdaptationMode; position: number; duration: number;
  playing: boolean; buffering: boolean; rate: number; volume: number; levels: number[]; visualizer: boolean;
  importing: boolean; error: string; message: string; sync: string; pitchSupported: boolean;
}
export const initialWorkspace: WorkspaceSnapshot = {
  run: { phase: 'idle', elapsedMs: 0 }, cadence: 160, inputCadence: 160, variation: false, ratio: '1:1', target: 160,
  tracks: [], currentId: null, mode: 'tempo', position: 0, duration: 0, playing: false, buffering: false, rate: 1, volume: .65,
  levels: Array(16).fill(0) as number[], visualizer: false, importing: false, error: '', message: '', sync: 'Prepare a simulation to begin.', pitchSupported: false,
};
export class RunWorkspace {
  private state: WorkspaceSnapshot = initialWorkspace;
  private listeners = new Set<() => void>();
  private run = new RunSession();
  private smoother = new CadenceSmoother();
  private tempo = new TempoController();
  private matcher = new PlaylistMatcher();
  private lastSample = -1;
  private matchedPlaybackMs = 0;
  private previousTick = 0;
  private previousPosition = 0;
  private progressedAt = 0;
  private timer: ReturnType<typeof setInterval>;
  private pending: { id: string; at: number } | null = null;
  private removedListeners: (() => void)[] = [];
  private disposed = false;
  readonly player: LocalPlayer;
  constructor(media: HTMLAudioElement, private now = () => performance.now()) {
    this.player = new LocalPlayer(media);
    this.previousTick = this.now(); this.progressedAt = this.previousTick;
    this.state = { ...initialWorkspace, pitchSupported: this.player.preservesPitch };
    const listen = (event: string, handler: () => void) => { media.addEventListener(event, handler); this.removedListeners.push(() => media.removeEventListener(event, handler)); };
    listen('playing', () => this.patch({ playing: true, buffering: false, error: '' }));
    listen('pause', () => this.patch({ playing: false, buffering: false }));
    listen('waiting', () => this.patch({ buffering: true }));
    listen('error', () => {
      const id = this.state.currentId;
      if (id) { const asset = this.player.assets.get(id); if (asset) asset.track.playable = false; }
      this.patch({ playing: false, buffering: false, tracks: this.tracks(), error: 'Audio could not be decoded. Remove this track or choose another.' });
    });
    listen('ended', () => { this.patch({ playing: false }); if (this.state.mode === 'playlist' && this.state.run.phase === 'running') this.nextTrack(); });
    const hidden = () => { if (document.hidden && this.state.run.phase === 'running') { this.pause(); this.patch({ message: 'Simulation paused because the page became hidden. Resume when ready.' }); } };
    const beforeUnload = (event: BeforeUnloadEvent) => { if (['running', 'paused'].includes(this.state.run.phase)) { event.preventDefault(); event.returnValue = ''; } };
    document.addEventListener('visibilitychange', hidden); window.addEventListener('beforeunload', beforeUnload);
    this.removedListeners.push(() => document.removeEventListener('visibilitychange', hidden), () => window.removeEventListener('beforeunload', beforeUnload));
    this.timer = setInterval(() => this.tick(), 250);
  }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  getSnapshot = () => this.state;
  private patch(value: Partial<WorkspaceSnapshot>) { if (this.disposed) return; this.state = { ...this.state, ...value }; this.listeners.forEach(fn => fn()); }
  private tracks() { return this.state.tracks.map(t => this.player.assets.get(t.id)?.track).filter((t): t is LocalTrack => !!t); }
  private error(error: unknown) { this.patch({ error: error instanceof Error ? error.message : 'Operation failed. Try again.' }); }
  private resetTempo() { this.tempo.reset(this.now()); this.player.rate(1); this.pending = null; }
  prepare = () => { this.run.prepare(); this.tick(); };
  start = () => {
    if (!this.run.start(this.now())) return;
    this.smoother.reset(); this.lastSample = -1; this.resetTempo();
    const current = this.state.currentId;
    if (current) this.matcher.selected(current, this.matchedPlaybackMs);
    if (this.state.mode === 'playlist') {
      const best = this.matcher.choose(this.state.tracks, current, this.state.target, this.matchedPlaybackMs, true);
      if (best && best !== current) this.select(best, false);
    }
    this.tick(); if (this.state.currentId) void this.play();
  };
  pause = () => { this.run.pause(this.now()); this.pending = null; this.player.pause(); this.tick(); };
  resume = () => {
    if (!this.run.resume(this.now())) return;
    this.smoother.reset(); this.lastSample = Math.floor(this.state.run.elapsedMs / 1000) - 1; this.resetTempo();
    this.patch({ message: '' }); this.tick(); if (this.state.currentId) void this.play();
  };
  end = () => { this.run.end(this.now()); this.pending = null; this.player.stop(); this.tick(); };
  newRun = () => { this.run = new RunSession(); this.matchedPlaybackMs = 0; this.smoother.reset(); this.lastSample = -1; this.resetTempo(); this.patch({ message: '', error: '' }); this.tick(); };
  setCadence = (value: number) => { try { validateCadence(value); this.patch({ inputCadence: value, error: '' }); } catch (e) { this.error(e); } };
  setVariation = (variation: boolean) => this.patch({ variation });
  setRatio = (ratio: BeatRatioId) => { try { calculateDemoTarget(this.state.cadence, ratio); this.pending = null; this.patch({ ratio }); this.tick(); } catch (e) { this.error(e); } };
  setMode = (mode: AdaptationMode) => { if (!['tempo', 'playlist', 'off'].includes(mode)) return; this.resetTempo(); this.patch({ mode }); this.tick(); };
  async importFiles(files: File[]) {
    if (this.state.importing) return;
    this.patch({ importing: true, error: '' }); const errors: string[] = [];
    for (const file of files) {
      if (this.disposed) break;
      try {
        const track = await this.player.import(file);
        this.patch({ tracks: [...this.state.tracks, track] });
        if (!this.state.currentId) this.select(track.id, false);
      } catch (e) { errors.push(e instanceof Error ? e.message : 'Import failed.'); }
    }
    this.patch({ importing: false, error: errors.join(' ') });
  }
  async demo() {
    try {
      const response = await fetch('/audio/ryvo-demo-160.wav'); if (!response.ok) throw new Error('Demo audio could not load. Import your own file.');
      await this.importFiles([new File([await response.blob()], 'RYVO demo beat — 160 BPM.wav', { type: 'audio/wav' })]);
    } catch (e) { this.error(e); }
  }
  select = (id: string, autoPlay = this.state.playing) => {
    try { this.player.select(id); this.resetTempo(); this.matcher.selected(id, this.matchedPlaybackMs); this.patch({ currentId: id, error: '', position: 0, playing: false }); if (autoPlay) void this.play(); this.tick(); } catch (e) { this.error(e); }
  };
  async play() {
    if (this.state.run.phase === 'paused' || this.state.run.phase === 'completed') { this.patch({ error: 'Resume or create a new simulation before playing audio.' }); return; }
    try { this.player.pause(); this.resetTempo(); this.progressedAt = this.now(); this.previousPosition = this.player.media.currentTime; await this.player.play(); this.tick(); } catch (e) { this.error(e); }
  }
  pauseAudio = () => { this.pending = null; this.player.pause(); this.tick(); };
  seek = (seconds: number) => { try { this.pending = null; this.player.seek(seconds); this.tick(); } catch (e) { this.error(e); } };
  volume = (value: number) => { try { this.player.volume(value); this.patch({ volume: value }); } catch (e) { this.error(e); } };
  setBpm = (id: string, input: string) => {
    try {
      const bpm = parseBpm(input); const asset = this.player.assets.get(id); if (!asset) return;
      asset.track = { ...asset.track, bpm, confidence: bpm === null ? 0 : 1, note: bpm === null ? 'BPM not set.' : 'Manually corrected BPM.' };
      if (id === this.state.currentId) this.resetTempo(); this.patch({ tracks: this.tracks(), error: '' }); this.tick();
    } catch (e) { this.error(e); }
  };
  remove = (id: string) => { this.pending = null; this.player.remove(id); this.patch({ tracks: this.tracks(), currentId: this.player.currentId }); this.tick(); };
  move = (id: string, direction: -1 | 1) => {
    const tracks = [...this.state.tracks], index = tracks.findIndex(t => t.id === id), to = index + direction;
    if (index < 0 || to < 0 || to >= tracks.length) return;
    [tracks[index], tracks[to]] = [tracks[to], tracks[index]]; this.patch({ tracks });
  };
  nextTrack = () => {
    const tracks = this.state.tracks.filter(t => t.playable); if (!tracks.length) return;
    const current = tracks.findIndex(t => t.id === this.state.currentId);
    this.select(tracks[(current + 1) % tracks.length].id, true);
  };
  tick = () => {
    if (this.disposed) return;
    const now = this.now(), run = this.run.snapshot(now); let cadence = this.state.cadence;
    if (run.phase === 'running') {
      const index = Math.floor(run.elapsedMs / 1000);
      // Catch up indexed samples, never use interval count as elapsed time.
      for (let i = this.lastSample + 1; i <= index; i++) cadence = this.smoother.update(simulatedCadence(42, i, this.state.inputCadence, this.state.variation));
      this.lastSample = index;
    } else if (run.phase === 'idle' || run.phase === 'ready') cadence = this.state.inputCadence;
    const target = calculateDemoTarget(cadence, this.state.ratio), media = this.player.media;
    const current = this.state.tracks.find(t => t.id === this.state.currentId);
    if (Math.abs(media.currentTime - this.previousPosition) > .001 || media.paused) this.progressedAt = now;
    this.previousPosition = media.currentTime;
    const stalled = !media.paused && !media.ended && now - this.progressedAt > 2000;
    const playing = !media.paused && !media.ended && media.readyState >= 2 && !this.player.contextSuspended && !stalled;
    const tickDelta = Math.max(0, now - this.previousTick); this.previousTick = now;
    if (run.phase === 'running' && playing && !this.state.buffering) this.matchedPlaybackMs += tickDelta;
    let sync = 'Prepare a simulation to begin.';
    if (run.phase === 'running' && playing && !this.state.buffering && this.state.mode === 'tempo' && validBpm(current?.bpm ?? null) && this.player.preservesPitch) {
      const result = this.tempo.update(target, current!.bpm, now); this.player.rate(result.rate);
    } else if (this.state.mode !== 'tempo' || !validBpm(current?.bpm ?? null) || !this.player.preservesPitch) this.player.rate(1);
    if (run.phase === 'running' && playing && this.state.mode === 'playlist') {
      const candidate = this.matcher.choose(this.state.tracks, this.state.currentId, target, this.matchedPlaybackMs);
      if (candidate && candidate !== this.state.currentId && !this.pending) this.pending = { id: candidate, at: now + nextBeatDelay(media.currentTime, current?.bpm ?? null) };
      if (this.pending && now >= this.pending.at) { const id = this.pending.id; this.pending = null; this.select(id, true); return; }
    }
    if (run.phase === 'paused') sync = 'Simulation paused · adaptation frozen';
    else if (run.phase === 'completed') sync = 'Session complete · audio stopped';
    else if (!current) sync = 'No audio · import a track or run silently';
    else if (this.state.buffering) sync = 'Buffering · waiting for real playback';
    else if (stalled) sync = 'Playback stalled · press Play audio to retry';
    else if (media.ended) sync = 'Track ended · play again or choose another track';
    else if (this.player.contextSuspended) sync = 'Audio suspended · press Play audio to resume';
    else if (!playing) sync = 'Audio paused · no active synchronization';
    else if (run.phase !== 'running') sync = 'Preview playback · start simulation to adapt';
    else if (this.state.mode === 'off') sync = 'Original tempo · adaptation off';
    else if (!validBpm(current.bpm)) sync = 'BPM needed · original tempo';
    else if (this.state.mode === 'tempo' && !this.player.preservesPitch) sync = 'Pitch preservation unavailable · original tempo';
    else if (this.state.mode === 'tempo' && (target / current.bpm < .8 || target / current.bpm > 1.25)) sync = 'Tempo limit · target is outside 0.80–1.25×';
    else if (this.state.mode === 'playlist' && this.pending) sync = 'Switching at the next estimated beat';
    else if (Math.abs(current.bpm * media.playbackRate - target) <= Math.max(5, target * .03)) sync = 'In sync · playback matches target';
    else sync = this.state.mode === 'tempo' ? 'Adapting · approaching target' : 'Holding track · 90s hold / 45s cooldown';
    this.patch({ run, cadence, target, position: Number.isFinite(media.currentTime) ? media.currentTime : 0, duration: current?.duration ?? 0, playing, rate: media.playbackRate, levels: this.player.levels(), visualizer: this.player.visualizationAvailable, sync });
  };
  dispose = () => { this.disposed = true; clearInterval(this.timer); this.pending = null; this.removedListeners.forEach(fn => fn()); this.player.dispose(); this.listeners.clear(); };
}
