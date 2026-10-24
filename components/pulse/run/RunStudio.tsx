'use client';
import { useEffect, useRef, useState } from 'react';
import { BEAT_RATIOS, type BeatRatioId } from '@/src/domain/shared/beat-ratio';
import { initialWorkspace, RunWorkspace, type AdaptationMode } from '@/src/infrastructure/browser/run-workspace';
import type { LocalTrack } from '@/src/infrastructure/audio/local-player';
function time(seconds: number) { return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`; }
function TrackRow({ track, index, count, selected, workspace }: { track: LocalTrack; index: number; count: number; selected: boolean; workspace: () => RunWorkspace | null }) {
  return <li className={selected ? 'run-track is-selected' : 'run-track'}>
    <div className="run-track-name"><span className="small-label">{String(index + 1).padStart(2, '0')} / {selected ? 'Selected' : 'Local file'}</span><strong>{track.name}</strong><span>{time(track.duration)} · {(track.bytes / 1048576).toFixed(1)} MiB · {track.type}</span><small>{track.note} {track.bpm !== null && track.confidence < .55 ? 'Check BPM.' : ''}</small></div>
    <form key={`${track.id}-${track.bpm}`} onSubmit={event => { event.preventDefault(); workspace()?.setBpm(track.id, String(new FormData(event.currentTarget).get('bpm') ?? '')); }} className="run-bpm-form"><label htmlFor={`bpm-${track.id}`}>Track BPM</label><div><input id={`bpm-${track.id}`} name="bpm" type="number" min="40" max="240" step="0.1" defaultValue={track.bpm ?? ''} placeholder="Unknown" /><button type="submit">Save BPM</button></div></form>
    <div className="run-track-actions"><button type="button" onClick={() => workspace()?.select(track.id)} aria-pressed={selected}>Select<span className="sr-only"> {track.name}</span></button><button type="button" disabled={index === 0} onClick={() => workspace()?.move(track.id, -1)} aria-label={`Move ${track.name} up`}>↑</button><button type="button" disabled={index === count - 1} onClick={() => workspace()?.move(track.id, 1)} aria-label={`Move ${track.name} down`}>↓</button><button type="button" onClick={() => workspace()?.remove(track.id)} aria-label={`Remove ${track.name}`}>Remove</button></div>
  </li>;
}
export function RunStudio() {
  const media = useRef<HTMLAudioElement>(null);
  const engine = useRef<RunWorkspace | null>(null);
  const [view, setView] = useState(initialWorkspace);
  useEffect(() => {
    if (!media.current) return;
    const workspace = new RunWorkspace(media.current); engine.current = workspace;
    const unsubscribe = workspace.subscribe(() => setView(workspace.getSnapshot()));
    return () => { unsubscribe(); workspace.dispose(); engine.current = null; };
  }, []);
  const phase = view.run.phase;
  const current = view.tracks.find(track => track.id === view.currentId);
  return <section className="run-studio" aria-label="Running simulation and local music">
    <audio ref={media} data-testid="local-audio" preload="metadata" />
    <noscript><p className="run-notice">Enable JavaScript to use the running simulation and local player.</p></noscript>
    <div className="run-notice"><strong>Simulation · temporary session.</strong> No sensors or location. Files stay in this tab; navigating away or reloading clears this session and playlist. Keep this page visible; hiding it pauses the simulation.</div>
    <div className="run-session-head"><span className="small-label">01 / Your movement</span><span className="run-state" data-testid="run-phase" role="status">{phase}</span></div>
    <div className="run-metrics">
      <div><span>Active time</span><strong data-testid="session-time">{time(view.run.elapsedMs / 1000)}</strong><small>Excludes paused time</small></div>
      <div><span>Smoothed cadence</span><strong data-testid="run-cadence">{view.cadence.toFixed(1)}</strong><small>steps / min · simulated</small></div>
      <div><span>Target rhythm</span><strong data-testid="run-target">{view.target.toFixed(1)}</strong><small>beats / min · {view.ratio}</small></div>
    </div>
    <div className="run-actions">
      {phase === 'idle' && <button className="button" onClick={() => engine.current?.prepare()}>Prepare simulation</button>}
      {phase === 'ready' && <button className="button" onClick={() => engine.current?.start()}>Start session</button>}
      {phase === 'running' && <button className="button" onClick={() => engine.current?.pause()}>Pause session</button>}
      {phase === 'paused' && <button className="button" onClick={() => engine.current?.resume()}>Resume session</button>}
      {['running', 'paused'].includes(phase) && <button onClick={() => engine.current?.end()}>End session</button>}
      {phase === 'completed' && <><p>Completed {time(view.run.elapsedMs / 1000)} of active simulation. This summary is not saved.</p><button onClick={() => engine.current?.newRun()}>New session</button></>}
      {phase === 'ready' && <p>Ready · simulation needs no permissions. Audio is optional.</p>}
    </div>
    {view.message && <p className="run-notice" role="status">{view.message}</p>}
    <div className="run-settings">
      <div><label htmlFor="run-cadence">Simulated cadence <strong>{view.inputCadence} steps/min</strong></label><input id="run-cadence" type="range" min="120" max="200" step="1" value={view.inputCadence} disabled={phase === 'completed'} onChange={event => engine.current?.setCadence(Number(event.target.value))} /><div className="run-range-ends"><span>120</span><span>200</span></div><label className="run-checkbox"><input type="checkbox" checked={view.variation} onChange={event => engine.current?.setVariation(event.target.checked)} />Seeded cadence variation</label></div>
      <div><label htmlFor="run-ratio">Beat : step ratio</label><select id="run-ratio" value={view.ratio} onChange={event => engine.current?.setRatio(event.target.value as BeatRatioId)}>{BEAT_RATIOS.map(ratio => <option key={ratio.id} value={ratio.id}>{ratio.id} · {ratio.name}</option>)}</select><p>Cadence is steps/min. Target BPM is cadence × beats ÷ steps. Smoothing follows changes gradually.</p></div>
    </div>
    <div className="run-audio-grid">
      <section className="run-player" aria-labelledby="player-title"><span className="small-label">02 / Your sound</span><h2 id="player-title">Music that moves.</h2><label htmlFor="adaptation-mode">Adaptation mode</label><select id="adaptation-mode" value={view.mode} onChange={event => engine.current?.setMode(event.target.value as AdaptationMode)}><option value="tempo">Adapt this track’s tempo</option><option value="playlist">Beat-matched playlist</option><option value="off">Original tempo</option></select>
        <p className="run-mode-help">{view.mode === 'tempo' ? 'Native pitch preservation, limited to 0.80–1.25×. Corrections arrive every 2 seconds and settle gradually. Quality varies by browser and music.' : view.mode === 'playlist' ? 'Original-speed tracks. Matching waits for a 90-second hold, 45-second cooldown, and two winning windows; then switches near the next estimated beat.' : 'Play at source tempo without adaptation.'}</p>
        <div className="run-now"><span className="small-label">Now selected</span><strong>{current?.name ?? 'Bring your own soundtrack.'}</strong><p>{current?.bpm ? `${current.bpm.toFixed(1)} BPM source` : 'BPM not set'} · <span data-testid="applied-rate">{view.rate.toFixed(3)}×</span> applied · <span data-testid="output-bpm">{current?.bpm ? (current.bpm * view.rate).toFixed(1) : '—'}</span> BPM output estimate</p></div>
        <div className="run-visualizer" role="img" aria-label={view.playing && view.visualizer ? 'Frequency levels from actual audio playback' : 'Audio visualization inactive'}>{view.levels.map((level, index) => <span key={index} style={{ height: `${Math.max(2, level * 100)}%` }} />)}</div>
        <p className="run-sync" role="status" data-testid="sync-state">{view.sync}</p>
        <div className="run-actions"><button disabled={!current || phase === 'paused' || phase === 'completed'} onClick={() => view.playing ? engine.current?.pauseAudio() : void engine.current?.play()}>{view.playing ? 'Pause audio' : 'Play audio'}</button><button disabled={!view.tracks.length || phase === 'paused' || phase === 'completed'} onClick={() => engine.current?.nextTrack()}>Next track</button></div>
        <label htmlFor="playback-position">Playback position <span>{time(view.position)} / {time(view.duration)}</span></label><input id="playback-position" type="range" min="0" max={view.duration || 1} step="0.1" value={Math.min(view.position, view.duration)} disabled={!current} onChange={event => engine.current?.seek(Number(event.target.value))} />
        <label htmlFor="audio-volume">Volume <span>{Math.round(view.volume * 100)}%</span></label><input id="audio-volume" type="range" min="0" max="1" step="0.01" value={view.volume} onChange={event => engine.current?.volume(Number(event.target.value))} />
      </section>
      <section className="run-library" aria-labelledby="library-title"><span className="small-label">03 / Your collection</span><h2 id="library-title">Keep it local.</h2><p>WAV, MP3, M4A, Ogg, or FLAC, when your browser supports them. Up to 20 MiB per file, 30 minutes, 20 tracks / 100 MiB total. Nothing is uploaded.</p><label htmlFor="local-files" className="small-label">Import local audio files</label><input id="local-files" type="file" accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac" multiple disabled={view.importing} onChange={event => { void engine.current?.importFiles(Array.from(event.target.files ?? [])); event.target.value = ''; }} /><button disabled={view.importing} onClick={() => void engine.current?.demo()}>Load demo beat</button><p className="run-help">Demo beat is an original synthesized WAV, not commercial music. Automatic BPM estimates support small PCM WAV files; other formats use manual BPM. Filename, duration, size, and format are shown; embedded artist tags are not parsed.</p>
        {view.importing && <p role="status">Checking local files…</p>}
        <ol className="run-tracks">{view.tracks.map((track, index) => <TrackRow key={track.id} track={track} index={index} count={view.tracks.length} selected={track.id === view.currentId} workspace={() => engine.current} />)}</ol>
        {!view.tracks.length && <p className="run-empty">Your playlist starts here.<br />Import a file or load the demo beat.</p>}
      </section>
    </div>
    {view.error && <p role="alert" className="run-error">{view.error}</p>}
  </section>;
}
