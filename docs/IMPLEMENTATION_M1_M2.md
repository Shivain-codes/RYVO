# RYVO M1–M2 implementation evidence

Date: 2026-10-24. Canonical checkout: `/Users/shivain/Desktop/chenyun project`.

## Motion control removal (2026-10-24)

Removed the floating Pause motion / Resume motion button at the user’s request. The automatic hero heat/aura effects now finish after four seconds rather than looping indefinitely. Scroll-driven animation and operating-system reduced-motion support remain. Historical pause/resume evidence below describes the previous revision. Typecheck, lint, production build, and the targeted Chromium motion-cleanup regression pass. The running local preview was restarted and visually checked.

## Current revision — RYVO (2026-10-24)

The public product is now RYVO. The hero, navigation, footer, page metadata, package name, and favicon have been updated. Internal `components/pulse` paths and semantic token identifiers remain for architecture compatibility; historical preparation specifications retain their original project name.

The rhythm section is now “Find your frequency”: a yellow editorial spread with thermal stride imagery, expanded serif typography, and a cream instrument with condensed numerals, thin rules, and native accessible controls. The old dark dashboard treatment is removed from this section and the linked preparation preview. “Try RYVO” opens the working demo; the secondary setup link opens the matching cream editorial preview.

Cadence, all three ratios, out-of-range feedback, and reset work. Initial hash navigation is restored after GSAP establishes scroll geometry, fixing direct links to `/#demo`. The fix has a dedicated regression test. Live browser checks verified 173 steps/min → 86.5 BPM, double time, reset, and preview return navigation.

Verification: strict typecheck, lint, production build, 29 unit/contrast tests, 5 component tests, and 9 Chromium tests pass (43 total). Responsive checks cover 320/390/768/1440px, zero axe A/AA findings, keyboard controls, reduced motion and pause/resume, no JavaScript, 200% text enlargement, and no capability/API access. RYVO branding is asserted on both routes. The preview and rhythm section were visually inspected in the running production site.

M1 and M2 remain verified. M3 was not started. Run recording, audio, and sensors remain planned; `/run/new` explicitly identifies itself as a preview. Missing Kiro files, deferred design-review findings, and non-Chromium/device validation limitations remain as recorded below. No new blocking frontend issue is known.

## Previous M2 revision — Kelvin layout and motion (2026-10-24)

The user explicitly requested Kelvin’s layout and motion adapted to PULSE, then requested an exact design copy. This supersedes the earlier loosely inspired direction for the marketing page. The implementation closely reconstructs the observed composition and motion while using PULSE copy and newly generated running imagery. It is not a pixel-identical copy: branding, content, imagery, the functional BPM instrument, and accessible mobile/static layouts are adapted.

Reference inspected live in the browser: 64px cream navigation, Hubot Sans variable display/body type, Kalnia 200 expanded editorial headings, giant thermal wordmark, central portrait with animated natural-light band, elliptical rule, bordered intro, dark metric block, reflected wordmark, pinned unfolding posters, staggered pink/yellow/blue panels, and a horizontal heat-to-light gallery. These elements were rebuilt with original component code. No Kelvin photographs, logo, page text, or source code were downloaded or reused.

The revision retains the M1–M2 boundary. The real cadence/ratio demonstration works; sensors, audio, run lifecycle, storage, and API behavior remain unimplemented. `/run/new` remains an honest preparation preview. No M3 work was started.

### Verified revision

- Strict typecheck, lint, and production build passed.
- 29 domain/contrast tests and 5 component tests passed.
- All 8 Chromium production browser tests passed after the final visual fixes.
- Zero axe A/AA findings and no page/console errors at 320, 390, 768, and 1440px.
- Keyboard controls, menu/Escape focus, FAQ, demo ratios/reset, route navigation, 200% text enlargement, and no-JavaScript rendering passed.
- GSAP is disabled for reduced motion. An accessible Pause motion / Resume motion control stops continuous effects and restores the full static page. The tests verify pin removal, gallery restoration, media changes, and navigation cleanup.
- Fixed wordmark cropping, mobile reading order, 320px expanded-type overflow, and a GSAP gallery starting transform that persisted during pause/resume. Static CSS guarantees every gallery image remains visible without the scroll enhancement.
- Visually reviewed production screenshots at phone/tablet/desktop widths and the full page. Live browser checks confirmed the mobile menu, 173 steps/min → 86.5 BPM at 1:2, reset to 172/1:1, and return navigation.
- New Hubot Sans and Kalnia packages are exactly pinned at 5.3.0; OFL notices and registry release metadata are recorded. All photographs and fonts are self-hosted.

### Remaining limits

No known blocking issue remains for this M2 revision. Real iOS/Android devices and Safari/Firefox have not been exercised; Chromium emulation does not establish those results. Automated accessibility checks are not a full manual assistive-technology audit. Image treatments are artistic, not measured thermal data. The original preparation verdict remains CHANGES_REQUESTED for deferred product-feature findings. The three `.kiro/specs/pulse/` files remain absent; available root/docs specifications were used. The working tree remains uncommitted with the intentional AskMongo deletions preserved.

The evidence below records the initial M1–M2 delivery. Its earlier dark contour hero, font choices, and motion limits are historical and superseded by this revision.

## Scope and repository inspection

The direct user request authorizes M1 and M2 in sequence, superseding the older M1-only first prompt in the handoffs. Starting revision: `dd7acc7` on `main`. The existing deleted AskMongo files are intentional and are preserved. All requested root/docs files exist. `.kiro/` does not exist; the three requested `.kiro/specs/pulse/{requirements,design,tasks}.md` files are absent. Root `tasks.md` and the seven preparation specifications supply the available contracts; no missing Kiro content was inferred.

## M1 evidence

`npm ci --offline --no-audit --no-fund` succeeded. Initial checks passed but reported a Node 24.14.1 mismatch with jsdom 30.1.3. Pinned the test-only DOM to jsdom 26.1.0 (Node >=18), kept strict TypeScript, added Node engine guidance, and set the Turbopack root explicitly. Playwright now owns a production `next start` on port 3100 and cannot silently reuse an unrelated dev server.

After these fixes, `npm run pr-check:quick` passed: typecheck, lint, production build, 1 domain test, 1 component test, 1 Chromium foundation check. The smoke verifies 320px, reduced motion, no capability prompts, and no API requests. This is foundation evidence, not proof of sensors/audio. M1 was marked complete before M2 implementation.

## M2 design decisions and scoped review reconciliation

The Kelvin page was inspected in the browser before implementation: oversized type, overlapping asymmetric fields, thermal color, and strong light/dark transitions. PULSE uses original vector running-track geometry and its specified Space Grotesk/Inter/JetBrains Mono families. No reference assets, CSS, text, or logo were copied. Composition: dark oversized left-aligned hero with a heated track on the right; quiet light editorial explanation; two distinct mode stories; a flat, interactive cadence/ratio instrument; privacy and browser limits; final CTA.

- F-15: corrected dim token retained; verify all intended text/surface pairs in M2 checks.
- F-13: remove the dead MDN lifecycle citation; current canonical Chrome lifecycle source checked 2026-10-24.
- F-14, M2 subset: exact pinned GSAP/Motion/font packages verified via npm. GSAP official 3.13 release and pricing pages explicitly permit free commercial use. Include core and ScrollTrigger for this website as requested; preserve package notices. The standard-license page currently redirects to a forums-offline page, so do not claim a new legal approval or complete dependency audit. Font OFL notices are bundled; Motion is MIT. Auth.js and later dependency decisions remain deferred.
- F-01/02/06/07/08/12/16: no readiness, file import, matching, DSP, storage, or sensor behavior is implemented in this milestone. Storytelling identifies both audio modes as planned; the working demo is a visual ratio calculator labeled Simulation, not the M4 run simulator.
- The M2 CTA must reach `/run/new`, while that route's lifecycle belongs to M3. Provide only an honest preparation-preview destination with a working link back to the ratio demo. No fake Prepare/Start success or permission prompt.
- F-18: the demo changes integer cadence and computes target BPM to one decimal; it does not accept manual track BPM or implement the M5/M9 validation contract. Derived target values may be 20–480 BPM; distinguish them from the future supported track-BPM range of 40–240.

The original design verdict remains `CHANGES_REQUESTED`. This scoped reconciliation permits the user-authorized M2 presentation work only. F-01–12, F-14's full audit/Auth.js work, F-16–18 remain gates for their later milestones. M3 must not begin in this task.

## Verification and remaining issues

M2 is implemented and verified for the authorized frontend scope. M3 was not started.

### Implemented

- Server-rendered `app/(marketing)/page.tsx` replaces the foundation root; `app/layout.tsx` remains server-safe. Presentation is passed as children to the isolated marketing animation component.
- Original contour-track hero, oversized typography, asymmetric stories, light/dark contrast, reusable semantic tokens, responsive navigation, native FAQ disclosures, metadata, and original favicon.
- GSAP/ScrollTrigger own entrances (24px / 700ms), artwork reveal (900ms), and bounded 2% scroll displacement. Match-media contexts revert on reduced-motion changes and unmount. Motion owns local demo value transitions only. Static content stays available if animation imports fail.
- Working integer-cadence slider and step buttons, native radio ratios, one-decimal target output, illustrative trace and text equivalent, reset, and out-of-track-range explanation. The formula uses beats:steps and does not clamp legitimate derived targets to the future track-input range.
- Self-hosted Latin fonts, four weights/files total, bundled OFL notices, and original asset manifest. No copied reference imagery or third-party browser asset requests.
- `/run/new` is a clearly labeled preview, with a working return to the demonstration. No session is created and no permission, audio, sensor, database, or API capability is invoked.

### Final verification (2026-10-24)

| Check | Evidence |
|---|---|
| Clean install | `npm ci --offline --no-audit --no-fund`: 457 packages installed; no engine incompatibility warnings. |
| Type checking | `npm run typecheck` passed with `next typegen && tsc --noEmit`; strict mode retained. Stale dev route output from the old root was removed once. |
| Lint | `npm run lint` passed with no lint errors or warnings. |
| Production build | `npm run build` passed; `/`, `/run/new`, and icon statically generated. |
| Domain and contrast | 29 tests passed, including all ratios, invalid bounds, derived targets, 16 normal-text color pairings and control-border contrast. |
| Components | 5 tests passed: badge, ratio/bounds/reset behavior, menu disclosure/Escape/focus. |
| Chromium | 8 tests passed against an owned production server on port 3100. |
| Accessibility | Zero axe WCAG 2 A/AA, 2.1 AA, and 2.2 AA violations at 320, 390, 768, and 1440px. Keyboard range/radio/menu use and focus restoration verified. |
| Reflow/motion | No horizontal overflow at the four widths. Controls work at 640px with 200% root text enlargement. GSAP transforms revert when reduced motion is enabled; no-JavaScript storytelling/disclosures/navigation work. |
| Privacy/console | Instrumented motion, location, media, notification and AudioContext access remained empty through landing/preview navigation. No API requests. No console errors/page exceptions in responsive flows. |
| Dependency audit | `npm audit --omit=dev --json`: zero reported production vulnerabilities. New dependency versions/releases/licenses in `M2_DEPENDENCIES.json`. |
| Integration command | Ran successfully and explicitly printed its deferred PostgreSQL status. This is a no-op, not integration coverage. |
| Visual inspection | Inspected the live site in the in-app browser, exercised demo/reset and mobile menu navigation, and reviewed production screenshots at desktop/tablet/320px. |

The initial browser failures were incorrect test selectors for the changing Menu/Close name and the decorative accordion plus sign; the implementation behaved correctly. Selectors were corrected and the full clean-install suite passed. Reset checks explicitly verify radio selection as well as numeric output. Full-page capture restores the viewport to the top so the sticky header is represented correctly.

### Remaining issues and boundaries

1. `.kiro/specs/pulse/requirements.md`, `design.md`, and `tasks.md` are missing. The available root/docs source of truth was used.
2. The working demo is an educational ratio calculator, not M4's seeded full-run Simulation. There is no run lifecycle, sensor/GPS measurement, audio import/playback/tempo processing, persistence, authentication, or server API. `/run/new` intentionally explains this boundary.
3. The overall design verdict remains `CHANGES_REQUESTED`. F-13's dead citation is corrected; F-15 is verified by contrast tests. F-14 is only addressed for installed M2 packages, with its standard-license source outage recorded. The remaining preparation findings must be resolved before their later milestones; no general design approval is claimed.
4. Browser evidence covers Chromium and the desktop in-app browser. Physical iOS/Android sensors, audio quality/battery, and native browser 200% zoom were not evaluated. The automated zoom-related evidence is 200% text enlargement plus responsive reflow, not a claim of a device lab certification.
5. The existing ESLint 9.39.1 and transitive whatwg-encoding package emit install deprecation notices. Lint passes and the production audit is clean; unrelated major tooling upgrades were not made.
6. Production deployment, database integration, and release certification are outside this milestone. The local production preview uses port 3000.

### Repository preservation

The original AskMongo deletions were recorded before implementation and remain deleted. The only additional source deletion is `app/page.tsx`, deliberately replaced by `app/(marketing)/page.tsx`. No secrets were added; no commit or remote publication was performed. The managed Next.js agent-guidance block was generated by the original foundation dev-server smoke, verified against `node_modules/next/dist/server/lib/generate-agent-files.js`, and retained. Relevant installed Next.js route-group and server/client-boundary documentation was reviewed.
