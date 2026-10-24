import Link from 'next/link';
import type { Metadata } from 'next';
import { Arrow, Wordmark } from '@/components/pulse/marketing/Wordmark';
import { RunStudio } from '@/components/pulse/run/RunStudio';
export const metadata: Metadata = { title: 'Run studio — RYVO', description: 'Run a deterministic simulation with local music and adaptive tempo.' };
export default function RunPage() {
  return <div className="run-page"><a className="skip-link" href="#main">Skip to content</a><header className="preview-header shell"><Wordmark /><Link className="text-link" href="/">Back to RYVO <Arrow /></Link></header><main id="main" className="shell"><div className="run-intro"><div><span className="small-label">RYVO / Simulation studio</span><h1>Your next<br />starting line.</h1></div><div><p>Set your cadence. Bring your music. Hear your rhythm change.</p><Link className="text-link" href="/#demo">Try the rhythm demo <Arrow /></Link></div></div><RunStudio /></main></div>;
}
