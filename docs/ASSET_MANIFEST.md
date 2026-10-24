# RYVO M2 asset manifest

Current revision: 2026-10-24. Kelvin’s layout and motion were visually inspected and reconstructed at the user’s request. Its photos, logo, page copy, and source code are not used.

| Asset | Provenance / permission | Usage |
|---|---|---|
| `public/images/portrait.webp` | Newly generated with the built-in imagegen tool for this project; fictional adult runner, no brand marks. | Hero, editorial poster, gallery. Meaningful alt text on the natural image; decorative thermal overlay hidden from accessibility. |
| `public/images/runner.webp` | Newly generated for PULSE: running athlete on a track at dusk. | Editorial poster, ratio panel, gallery and closing section. |
| `public/images/stride.webp` | Newly generated for PULSE: orange shoes above a blue running track. | Editorial poster, ratio panel and gallery. |
| Thermal photo treatment | Original SVG luminance color map in `ThermalPhoto.tsx`; CSS/GSAP clipping. | Artistic heat colors; never presented as measured sensor data. |
| Thermal RYVO wordmark and ellipse | Original HTML/CSS/SVG implementation using openly licensed Hubot Sans. | Decorative visual within a named H1; mirrored duplicate is accessibility-hidden. |
| Hubot Sans variable Latin | `@fontsource-variable/hubot-sans@5.3.0`, OFL-1.1. Copyright 2021 The Hubot Sans Project Authors. [Project](https://github.com/github/hubot-sans). | Self-hosted display, body, labels, with width and weight axes. `public/licenses/hubot-sans-OFL.txt`. |
| Kalnia variable Latin | `@fontsource-variable/kalnia@5.3.0`, OFL-1.1. Copyright 2022 The Kalnia Project Authors. [Project](https://github.com/fridamedrano/Kalnia-Typeface). | Self-hosted editorial type, 200 weight / 125% width. `public/licenses/kalnia-OFL.txt`. |
| JetBrains Mono Latin 500 | `@fontsource/jetbrains-mono@5.3.0`, OFL-1.1. | Retained foundation font; current instrument uses Hubot Sans. `public/licenses/jetbrains-mono-OFL.txt`. |
| Rhythm trace | Original computed SVG in `BpmDemo.tsx`. | Illustrated cadence ratio; caption and numeric formula provide text equivalents. |
| Track contours / favicon | Original `HeatTrack.tsx` retained unused; `app/icon.svg` is a new thermal R monogram. | No current route renders the old contours. The preparation preview uses the generated runner photo; the RYVO favicon uses original SVG geometry. |

Three generated PNG masters remain in the tool’s generated-image folder. Optimized WebP copies (500,274 bytes combined) are inside the project. Next Image serves responsive derivatives; there are no remote runtime photo or font requests. Each image’s duplicated visual layer is decorative and uses the same cached asset. Original master filenames: `exec-20f00336-62cf-4c9b-ba1e-1b91df79c67c.png` (portrait), `exec-b3b1e30d-33b1-461f-ab23-49e9d398a529.png` (runner), `exec-05200eb0-9255-4263-9f6f-65bd8f2c368e.png` (stride).

The old Space Grotesk/Inter packages and OFL notices remain available from the foundation but are not imported by the current layout. No overall project license is imposed; the pre-existing deleted LICENSE is preserved.

GSAP 3.15.0 owns page-level motion and Motion 14.6.0 owns local demo value transitions. Their earlier official licensing/source checks and the GSAP standard-license-page limitation are retained in the implementation evidence. New font release metadata is in `M2_DEPENDENCIES.json`.

## Functional MVP audio

`public/audio/ryvo-demo-160.wav` is an original 72-second synthesized mono PCM beat at 160 BPM, generated for RYVO from sine/percussive envelopes. It contains no sampled music. Test WAV fixtures are synthesized in `e2e/run.spec.ts`; no user files or copyrighted recordings are committed.
