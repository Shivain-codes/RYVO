# RYVO — Run to Your Own Rhythm

**Your pace changes. Your music follows.**

**Live demo: https://ahyeon.live**

RYVO is an adaptive running and music platform designed to synchronize your soundtrack with your movement.

Instead of adjusting your running pace to match a fixed playlist, RYVO aims to make the music adapt to you.

### Key Features

- **Adaptive BPM Synchronization** — Match supported music tempos with simulated running cadence.
- **Smart Music Playback** — Import and play local audio, manage a playlist, and adapt supported tracks with browser-native pitch preservation.
- **Running Session Controls** — Start, pause, resume, and end a session with an elapsed-time display.
- **Interactive Running Simulator** — Explore cadence-based music synchronization without physical sensors.
- **Immersive Interface** — A responsive editorial experience with original running imagery and reduced-motion support.

### Technology Stack

Next.js · TypeScript · Tailwind CSS · Web Audio API · GSAP

### Project Vision

To create a more immersive running experience where movement and music work together seamlessly.

### Current MVP

The current MVP provides a simulated cadence (120–200 steps per minute), local audio playback, beat-matched track selection, and browser-native tempo adaptation. Automatic BPM estimation is available for supported PCM WAV files; other tracks can use a manually entered BPM. Sessions and imported audio are temporary and are cleared when you leave or reload the studio.

Physical sensor tracking, pace and distance measurements, persistent session storage, accounts, and backend services are not implemented yet. Browser support and audio adaptation quality can vary by device and track.

See [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md) and [`docs/FUNCTIONAL_MVP.md`](docs/FUNCTIONAL_MVP.md) for implementation details, verification results, limitations, and manual testing instructions.

### Credits

The original idea for this project is credited to **Chenyun Yang, a CMU graduate**.

### Run locally

Requires Node.js 22.12+ (or Node.js 24 LTS) and npm.

```sh
npm ci
npm run build
npm run start
```

Then open <http://127.0.0.1:3000>. To try the MVP, visit `/run/new`, load the included demo beat or import a local audio file, prepare the simulation, and start a session.
