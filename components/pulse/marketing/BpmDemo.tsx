'use client';

import { useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { BEAT_RATIOS, calculateDemoTarget, type BeatRatioId } from '@/src/domain/shared/beat-ratio';

export function BpmDemo() {
  const [cadence, setCadence] = useState(172);
  const [ratioId, setRatioId] = useState<BeatRatioId>('1:1');
  const reducedMotion = useReducedMotion();
  const target = calculateDemoTarget(cadence, ratioId);
  const ratio = BEAT_RATIOS.find(({ id }) => id === ratioId)!;
  const outOfTrackRange = target < 40 || target > 240;
  const wave = Array.from({ length: 161 }, (_, index) => {
    const x = index * 5;
    const y = 30 - Math.sin(index / 160 * Math.PI * 2 * target / 22) * 18;
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  return <div className="lab-instrument">
    <div className="lab-topline"><span className="small-label">RYVO / Rhythm study</span><span className="lab-simulation">Simulation</span></div>
    <div className="lab-readouts">
      <div><span className="small-label">Your steps</span><p className="lab-number">{cadence}</p><span className="lab-unit">steps / min</span></div>
      <span className="lab-arrow" aria-hidden="true">↗</span>
      <div><span className="small-label">Your beat</span><p className="lab-number"><motion.span key={target} initial={reducedMotion ? false : { opacity: .65 }} animate={{ opacity: 1 }} transition={{ duration: reducedMotion ? 0 : .25 }}>{target.toFixed(1)}</motion.span></p><span className="lab-unit">beats / min</span></div>
    </div>
    <figure className="lab-trace"><svg viewBox="0 0 800 60" preserveAspectRatio="none" aria-hidden="true"><path d={wave} /></svg><figcaption>{ratio.explanation}</figcaption></figure>
    <div className="lab-cadence"><label htmlFor="cadence">01 / Set your cadence <span>{cadence} steps/min</span></label><div className="lab-slider-row">
      <button type="button" className="lab-step" aria-label="Decrease cadence" disabled={cadence === 40} onClick={() => setCadence(value => value - 1)}>−</button>
      <input id="cadence" type="range" min="40" max="240" step="1" value={cadence} style={{ '--range-progress': `${(cadence - 40) / 2}%` } as CSSProperties} aria-valuetext={`${cadence} steps per minute`} onChange={event => setCadence(Number(event.target.value))} />
      <button type="button" className="lab-step" aria-label="Increase cadence" disabled={cadence === 240} onClick={() => setCadence(value => value + 1)}>+</button>
    </div><div className="lab-limits"><span>40</span><span>240</span></div></div>
    <fieldset className="lab-ratios"><legend>02 / Choose your beat : step ratio</legend><div>{BEAT_RATIOS.map(item => <label key={item.id}><input type="radio" name="beat-ratio" value={item.id} checked={ratioId === item.id} onChange={() => setRatioId(item.id)} /><span><strong>{item.id}</strong><small>{item.name}</small></span></label>)}</div></fieldset>
    <div className="lab-result"><p role="status" aria-live="polite" aria-atomic="true"><strong>{cadence} × {ratio.beats} ÷ {ratio.steps} = {target.toFixed(1)} BPM.</strong>{' '}{outOfTrackRange ? 'This target is outside the planned 40–240 BPM track range. Try another ratio.' : ratio.explanation}</p><button type="button" onClick={() => { setCadence(172); setRatioId('1:1'); }}>Reset demo <span aria-hidden="true">↺</span></button></div>
    <p className="lab-disclosure">Visual demonstration only. No sensor measurement, audio playback, or run recording. Cadence is steps per minute; pace is time per distance.</p>
  </div>;
}
