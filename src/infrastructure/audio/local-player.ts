import { analyzeWav, type BpmEstimate } from '@/src/domain/audio/wav';
export interface LocalTrack { id: string; name: string; type: string; bytes: number; duration: number; bpm: number | null; confidence: number; note: string; playable: boolean }
interface Asset { track: LocalTrack; url: string }
const MAX_FILE = 20 * 1024 * 1024;
export class LocalPlayer {
  readonly assets = new Map<string, Asset>();
  private context: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private gain: GainNode | null = null;
  private bins = new Uint8Array(64);
  private disposed = false;
  private generation = 0;
  private gainValue = .65;
  currentId: string | null = null;
  visualizationAvailable = false;
  constructor(readonly media: HTMLAudioElement) { media.preload = 'metadata'; media.volume = this.gainValue; }
  get contextSuspended() { return this.context !== null && this.context.state !== 'running'; }
  get preservesPitch() { return typeof this.media.preservesPitch === 'boolean'; }
  async import(file: File): Promise<LocalTrack> {
    if (this.disposed) throw new Error('Player closed.');
    if (!file.size || file.size > MAX_FILE) throw new Error('Choose a nonempty audio file up to 20 MiB.');
    if ([...file.name].length > 255) throw new Error('Filename is too long (maximum 255 characters).');
    if (this.assets.size >= 20 || [...this.assets.values()].reduce((sum, a) => sum + a.track.bytes, 0) + file.size > 100 * 1024 * 1024) throw new Error('Library limit: 20 tracks or 100 MiB. Remove a track first.');
    const bytes = new Uint8Array(await file.slice(0, 64).arrayBuffer());
    const tag = (a: number, b: number) => String.fromCharCode(...bytes.slice(a, b));
    const wav = tag(0, 4) === 'RIFF' && tag(8, 12) === 'WAVE';
    const supported = wav || tag(0, 3) === 'ID3' || (bytes[0] === 255 && (bytes[1] & 224) === 224) || tag(0, 4) === 'OggS' || tag(0, 4) === 'fLaC' || tag(4, 8) === 'ftyp';
    if (!supported) throw new Error('Unsupported file contents. Choose WAV, MP3, M4A, Ogg, or FLAC.');
    const url = URL.createObjectURL(file);
    const probe = new Audio(); probe.preload = 'metadata';
    try {
      const duration = await new Promise<number>((resolve, reject) => {
        const done = (error?: string) => { clearTimeout(timeout); probe.onloadedmetadata = null; probe.onerror = null; error ? reject(new Error(error)) : resolve(probe.duration); };
        const timeout = setTimeout(() => done('Audio metadata timed out. Try another file.'), 12000);
        probe.onloadedmetadata = () => done(); probe.onerror = () => done('This browser cannot decode this audio file.'); probe.src = url;
      });
      if (!Number.isFinite(duration) || duration <= 0 || duration > 1800) throw new Error('Track duration must be between 0 and 30 minutes.');
      let estimate: BpmEstimate = { bpm: null, confidence: 0, note: 'Enter BPM manually. Automatic estimation supports PCM WAV up to 8 MiB.' };
      if (wav && file.size <= 8 * 1024 * 1024) estimate = analyzeWav(await file.arrayBuffer());
      if (this.disposed) throw new Error('Player closed.');
      const track: LocalTrack = { id: crypto.randomUUID(), name: file.name, type: file.type || 'audio', bytes: file.size, duration, ...estimate, playable: true };
      this.assets.set(track.id, { track, url }); return track;
    } catch (error) { URL.revokeObjectURL(url); throw error; }
    finally { probe.removeAttribute('src'); probe.load(); }
  }
  select(id: string) {
    const asset = this.assets.get(id); if (!asset) throw new Error('Track is no longer available.');
    this.generation++; this.media.pause(); this.currentId = id; this.media.src = asset.url; this.media.load(); this.rate(1);
  }
  async play() {
    if (this.disposed || !this.currentId) throw new Error('Import and select a track first.');
    const generation = this.generation;
    // Build one graph per element. Context creation only follows a playback gesture.
    if (!this.context && typeof AudioContext !== 'undefined') {
      try {
        this.context = new AudioContext(); this.source = this.context.createMediaElementSource(this.media);
        this.analyser = this.context.createAnalyser(); this.analyser.fftSize = 128;
        this.gain = this.context.createGain(); this.gain.gain.value = this.gainValue;
        this.source.connect(this.analyser); this.analyser.connect(this.gain); this.gain.connect(this.context.destination);
        this.media.volume = 1; this.visualizationAvailable = true;
      } catch {
        this.visualizationAvailable = false;
        // A partially built graph must not strand the media element in silence.
        if (this.source && this.context) { this.source.disconnect(); this.source.connect(this.context.destination); }
      }
    }
    // Call play before yielding so transient user activation remains available.
    const playing = this.media.play();
    try {
      if (this.context?.state === 'suspended') await this.context.resume();
      await playing;
      if (this.disposed || generation !== this.generation) return;
    } catch { if (this.disposed || generation !== this.generation) return; throw new Error('Playback was blocked or interrupted. Press Play audio to retry.'); }
  }
  pause() { this.generation++; this.media.pause(); }
  stop() { this.pause(); if (this.media.readyState > 0) this.media.currentTime = 0; this.rate(1); }
  seek(seconds: number) {
    if (!Number.isFinite(seconds) || !Number.isFinite(this.media.duration)) throw new Error('Track is not ready to seek.');
    this.media.currentTime = Math.max(0, Math.min(this.media.duration, seconds));
  }
  volume(value: number) {
    if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error('Volume must be 0–100%.');
    this.gainValue = value;
    if (this.gain && this.context) this.gain.gain.setTargetAtTime(value, this.context.currentTime, .02);
    else this.media.volume = value;
  }
  rate(value: number) {
    if (!Number.isFinite(value) || value < .8 || value > 1.25) throw new Error('Tempo must be between 0.80× and 1.25×.');
    if (value !== 1 && !this.preservesPitch) { this.media.playbackRate = 1; return; }
    if (this.preservesPitch) this.media.preservesPitch = true;
    this.media.playbackRate = value;
  }
  levels(): number[] {
    if (!this.analyser || this.media.paused || this.media.ended || this.context?.state !== 'running') return Array(16).fill(0) as number[];
    this.analyser.getByteFrequencyData(this.bins);
    return Array.from({ length: 16 }, (_, index) => Math.max(...this.bins.slice(index * 4, index * 4 + 4)) / 255);
  }
  remove(id: string) {
    const asset = this.assets.get(id); if (!asset) return;
    if (this.currentId === id) { this.stop(); this.currentId = null; this.media.removeAttribute('src'); this.media.load(); }
    URL.revokeObjectURL(asset.url); this.assets.delete(id);
  }
  dispose() {
    this.disposed = true; this.stop(); this.media.removeAttribute('src'); this.media.load();
    this.source?.disconnect(); this.analyser?.disconnect(); this.gain?.disconnect();
    if (this.context) void this.context.close().catch(() => {});
    this.assets.forEach(asset => URL.revokeObjectURL(asset.url)); this.assets.clear();
  }
}
