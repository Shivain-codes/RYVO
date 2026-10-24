import Link from 'next/link';
import { Navigation } from '@/components/pulse/marketing/Navigation';
import { MarketingMotion } from '@/components/pulse/marketing/MarketingMotion';
import { BpmDemo } from '@/components/pulse/marketing/BpmDemo';
import { Arrow, Wordmark } from '@/components/pulse/marketing/Wordmark';
import { ThermalPhoto, ThermalFilters, ThermalWord } from '@/components/pulse/marketing/ThermalPhoto';

const studies = [
  { name: 'Move', caption: 'Your steps become a signal', image: 'runner', alt: 'Runner in motion on an athletics track' },
  { name: 'Match', caption: 'A track to meet your stride', image: 'portrait', alt: 'Runner wearing coral sports glasses' },
  { name: 'Adapt', caption: 'The same song, a new tempo', image: 'stride', alt: 'Orange running shoes suspended above a blue track' },
  { name: 'Choose', caption: 'Your files. Your soundtrack.', image: 'portrait', alt: 'Portrait study of a runner' },
  { name: 'Control', caption: 'Find your beat-to-step ratio', image: 'stride', alt: 'A close study of two runners’ strides' },
  { name: 'Own it', caption: 'Your run stays yours', image: 'runner', alt: 'An athlete running at dusk' },
];
const ratios = [
  { name: 'Half time', ratio: '1:2', number: '86', color: 'pink', image: 'portrait', description: 'A little room to breathe. One beat for every two steps.', note: '172 steps/min ÷ 2', title: 'Slow burn' },
  { name: 'Every step', ratio: '1:1', number: '172', color: 'yellow', image: 'runner', description: 'Right in the pocket. One beat for every step you take.', note: '172 steps/min × 1', title: 'In sync' },
  { name: 'Double time', ratio: '2:1', number: '344', color: 'blue', image: 'stride', description: 'Another way to feel it. Two beats for every step.', note: 'Outside the planned track range', title: 'Full flow' },
];

export default function HomePage() {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Navigation />
    <noscript><nav className="no-script-nav" aria-label="Navigation without JavaScript"><a href="#product">Product</a><a href="#demo">Demo</a><Link href="/run/new">Run preview</Link></nav></noscript>
    <ThermalFilters />
    <MarketingMotion>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-aura" aria-hidden="true" />
          <h1 id="hero-title" aria-label="RYVO — Run to your own rhythm"><ThermalWord /></h1>
          <div className="hero-cover hero-track"><ThermalPhoto image="portrait" alt="Runner with coral sports glasses, shown through a thermal color treatment" priority /><span className="photo-stamp">Run in rhythm</span></div>
          <svg className="hero-orbit" viewBox="0 0 720 150" aria-hidden="true"><ellipse cx="360" cy="75" rx="358" ry="73" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
          <div className="hero-intro"><p>Your pace changes. Your music follows. A new connection between the way you move and the music you love.</p><div><a className="button" href="#demo">Try the demo</a><a className="inline-link" href="#product">Meet RYVO</a></div></div>
          <div className="hero-date"><span className="small-label">Your cadence · your music</span><strong>172<br />BPM</strong><span className="small-label">1:1 · visual simulation</span></div>
        </section>

        <section id="product" className="mirage" aria-labelledby="product-title">
          <div className="mirage-echo" aria-hidden="true"><ThermalWord /></div>
          <div className="shell mirage-body"><h2 id="product-title" data-reveal>Your feet set the tempo.<br />The music finds you.</h2>
            <p className="mirage-copy" data-reveal>Some runs are a slow burn. Others are all instinct. RYVO uses simulated running cadence to create a musical target. Keep your own rhythm. Let the music meet you there.</p>
            <dl className="signal-stats"><div><dt>2</dt><dd>Local audio modes</dd></div><div><dt>3</dt><dd>Beat-to-step ratios</dd></div><div><dt>172</dt><dd>Steps/min in this demo</dd></div><div><dt>0</dt><dd>Permissions to explore</dd></div></dl>
          </div>
        </section>

        <section id="how-it-works" className="lineup light-section" aria-labelledby="lineup-title">
          <div className="lineup-stage shell"><header className="lineup-intro"><h2 id="lineup-title">Six ways in.<br />One rhythm<br />of your own.</h2><p>Movement, music, and a little space between them. A closer look at the idea behind RYVO.</p></header>
            <div className="study-grid">{studies.map((study, index) => <article className={`study-poster study-poster--${index + 1}`} key={study.name}><ThermalPhoto image={study.image} alt={study.alt} /><div className="poster-caption"><h3>{study.name}</h3><p>{study.caption}</p></div></article>)}</div>
          </div>
          <div className="lineup-foot shell"><span className="small-label">Two approaches, one local studio</span><p><strong>Beat-Matched Playlist</strong> selects a local track to fit your cadence. <strong>Real-Time Tempo Adaptation</strong> gradually changes the tempo of your chosen track with browser-native pitch preservation. Supported files and browser capabilities will apply.</p></div>
        </section>

        <section className="wavelengths light-section" aria-labelledby="ratios-title"><div className="shell">
          <div className="split-heading"><h2 id="ratios-title" data-reveal>Three ratios,<br />three ways to feel it.</h2><p>A step doesn’t have to equal a beat. At the same cadence, a different ratio opens up a different musical target.</p></div>
          <div className="ratio-posters">{ratios.map((ratio) => <article key={ratio.ratio} className={`ratio-poster ratio-poster--${ratio.color}`}><span className="small-label">{ratio.ratio} · {ratio.name}</span><h3>{ratio.title}</h3><p>{ratio.description}</p><ThermalPhoto image={ratio.image} alt="" /><div className="ratio-number">{ratio.number}<span>BPM</span></div><p className="ratio-note">{ratio.note}</p><a className="poster-link" href="#demo">Explore the ratios <Arrow /></a></article>)}</div>
        </div></section>

        <section id="in-motion" className="motion-gallery" aria-labelledby="gallery-title"><div className="gallery-stage"><div className="split-heading shell"><h2 id="gallery-title">Every stride,<br />seen in heat.</h2><p>Energy you can feel. A visual study of movement, from the first step to the last light.</p></div><div className="gallery-divider" aria-hidden="true"><span>Heat</span><span>Light</span></div><div className="gallery-strip">
          {['runner', 'portrait', 'stride'].map((image, index) => <figure key={image} className={`gallery-photo gallery-photo--${index}`}><ThermalPhoto image={image} alt={studies.find(study => study.image === image)!.alt} /><figcaption>{['01 · The open track', '02 · A moment of focus', '03 · Off the ground'][index]}</figcaption></figure>)}
        </div><p className="gallery-note shell">Original editorial imagery. Thermal colors are an artistic treatment, not sensor data.</p></div></section>

        <section className="manifesto light-section"><div className="shell"><p className="manifesto-quote" data-reveal>“Somewhere between<br />the beat and the step,<br />you find your flow.”</p><div className="manifesto-bottom"><span className="small-label">The RYVO idea</span><p>Your pace is time per distance.<br />Your cadence is steps per minute.<br />Your rhythm is yours to choose.</p></div></div></section>

        <section id="demo" className="rhythm-lab" aria-labelledby="demo-title"><div className="shell lab-layout">
          <div className="lab-intro"><span className="small-label">The rhythm experiment / 01</span><h2 id="demo-title" data-reveal>Find your<br />frequency.</h2><p>A little slower. A little faster.<br />Move the slider and find where your steps meet the beat.</p><div className="lab-photo"><ThermalPhoto image="stride" alt="Orange running shoes above a blue track, with a thermal color treatment" /><span>Movement → music</span></div></div>
          <BpmDemo />
          <noscript><p className="lab-no-script">Enable JavaScript to adjust the demo. At 172 steps/min, a 1:1 ratio gives a target of 172 BPM; 1:2 gives 86 BPM; 2:1 gives 344 BPM.</p></noscript>
        </div></section>

        <section id="details" className="details-section light-section" aria-labelledby="details-title"><div className="shell section-space"><div className="details-grid"><div><h2 id="details-title">Before<br />you move.</h2><p className="details-intro">The local simulation is ready.<br />Here’s what comes next, and what to expect.</p></div><div className="details-list">
          <details open><summary>Local by design <span aria-hidden="true">+</span></summary><p>This demo sends no run data and uses no sensors. The studio plays local audio without uploading it. Sessions and playlists are temporary; real sensors and server history are not included.</p></details>
          <details><summary>Your files. Your soundtrack. <span aria-hidden="true">+</span></summary><p>Future audio features will use files you choose and are permitted to play. Spotify, Apple Music, YouTube, and other third-party streams cannot be imported or tempo-processed here.</p></details>
          <details><summary>Made for the foreground <span aria-hidden="true">+</span></summary><p>Real motion and GPS will need browser support and your explicit permission. Background and lock-screen tracking are not promised. The simulation studio needs no sensors. Manual real-run input remains planned.</p></details>
          <details><summary>A clear signal, always <span aria-hidden="true">+</span></summary><p>Cadence will be an estimate, not a medical measurement. Lost signals must be shown as unavailable. Today’s visual demo calculates a musical target only; it does not record a run or adapt audio.</p></details>
          <details><summary>What happens when audio can’t adapt? <span aria-hidden="true">+</span></summary><p>Audio quality and browser support vary. Original-tempo playback remains available if native pitch preservation is unsupported. The studio shows the applied tempo and any limits.</p></details>
        </div></div></div></section>

        <section className="closing-section shell" aria-labelledby="closing-title"><div className="closing-photo"><ThermalPhoto image="runner" alt="Runner on an open track at dusk" /><span className="small-label">A starting line, wherever you are.</span></div><div className="closing-copy"><span className="small-label">Move on your terms</span><h2 id="closing-title">Your next<br />starting line.</h2><p>The simulation studio is ready.<br />Bring a local track and find your rhythm.</p><Link href="/run/new" className="button button--paper">Explore run setup <Arrow diagonal /></Link><a className="inline-link" href="#demo">Back to the rhythm lab</a></div></section>
      </main>
      <footer className="site-footer shell"><h2>See you<br />in the flow.</h2><div className="footer-links"><span className="small-label">Explore</span><a href="#product">The idea</a><a href="#how-it-works">How it works</a><a href="#demo">Rhythm lab</a><a href="#details">Privacy & capabilities</a></div><div className="footer-bottom"><Wordmark /><span>RYVO · RUN TO YOUR OWN RHYTHM · 2026</span><a href="#main">Back to top ↑</a></div></footer>
    </MarketingMotion>
  </>;
}
