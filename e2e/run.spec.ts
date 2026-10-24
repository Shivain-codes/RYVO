import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
function wav(bpm = 160, duration = 120, sineOnly = false) {
  const rate = 16000, samples = rate * duration, buffer = Buffer.alloc(44 + samples * 2);
  buffer.write('RIFF'); buffer.writeUInt32LE(buffer.length - 8,4); buffer.write('WAVEfmt ',8); buffer.writeUInt32LE(16,16); buffer.writeUInt16LE(1,20); buffer.writeUInt16LE(1,22); buffer.writeUInt32LE(rate,24); buffer.writeUInt32LE(rate * 2,28); buffer.writeUInt16LE(2,32); buffer.writeUInt16LE(16,34); buffer.write('data',36); buffer.writeUInt32LE(samples*2,40);
  for(let i=0;i<samples;i++) { const t=i/rate; const phase=t%(60/bpm); const value=sineOnly ? Math.sin(2*Math.PI*440*t)*.5 : Math.sin(2*Math.PI*220*t)*Math.exp(-phase*30)*.7; buffer.writeInt16LE(Math.round(value*32767),44+i*2); }
  return buffer;
}
test('real local audio, tempo adaptation, pause/resume/seek/volume and completion', async ({ page }) => {
  test.setTimeout(60000);
  const requests: string[] = []; const errors: string[] = [];
  page.on('request', r => { if (r.method() !== 'GET' || r.url().includes('/api/')) requests.push(r.url()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/run/new');
  await page.getByLabel('Simulated cadence', { exact: false }).fill('190');
  await page.getByLabel('Import local audio files').setInputFiles({ name: 'local-160.wav', mimeType: 'audio/wav', buffer: wav() });
  await expect(page.locator('.run-track')).toHaveCount(1);
  await page.getByLabel('Track BPM', { exact: true }).fill('160'); await page.getByRole('button', { name:'Save BPM' }).click();
  await page.getByRole('button', { name:'Prepare simulation' }).click();
  await expect(page.getByTestId('run-phase')).toHaveText('ready');
  await page.getByRole('button', { name:'Start session' }).click();
  const media = page.getByTestId('local-audio');
  await expect(media).toHaveJSProperty('paused', false);
  await expect.poll(() => media.evaluate((e: HTMLAudioElement) => e.currentTime)).toBeGreaterThan(1);
  await expect.poll(() => media.evaluate((e: HTMLAudioElement) => e.playbackRate), { timeout:10000 }).toBeGreaterThan(1.03);
  await expect(media).toHaveJSProperty('preservesPitch',true);
  await expect.poll(() => page.locator('.run-visualizer span').evaluateAll(nodes => nodes.some(n => parseFloat((n as HTMLElement).style.height) > 2))).toBe(true);
  await expect(page.getByTestId('sync-state')).toContainText(/Adapting|In sync/);
  await page.getByLabel('Playback position').fill('20'); await expect.poll(() => media.evaluate((e: HTMLAudioElement) => e.currentTime)).toBeGreaterThanOrEqual(20);
  await page.getByLabel('Volume').fill('0.3'); await expect(page.getByLabel('Volume')).toHaveValue('0.3');
  await page.getByRole('button', {name:'Pause session'}).click(); await expect(media).toHaveJSProperty('paused',true);
  const frozen = await page.getByTestId('session-time').textContent(); await page.waitForTimeout(1250); await expect(page.getByTestId('session-time')).toHaveText(frozen!);
  await expect(page.getByTestId('sync-state')).toContainText('paused');
  await page.getByRole('button', {name:'Resume session'}).click(); await expect(media).toHaveJSProperty('paused',false);
  await page.getByLabel('Beat : step ratio').selectOption('1:2'); await expect(page.getByTestId('run-target')).toHaveText('95.0'); await expect(page.getByTestId('sync-state')).toContainText('Tempo limit');
  await page.getByLabel('Adaptation mode').selectOption('off'); await expect(media).toHaveJSProperty('playbackRate',1);
  await page.getByRole('button', {name:'Pause audio'}).click(); await expect(page.getByTestId('run-phase')).toHaveText('running'); await expect(media).toHaveJSProperty('paused',true);
  await page.getByRole('button', {name:'Play audio'}).click(); await expect(media).toHaveJSProperty('paused',false);
  await page.getByRole('button', {name:'End session'}).click(); await expect(page.getByTestId('run-phase')).toHaveText('completed'); await expect(media).toHaveJSProperty('paused',true); await expect(media).toHaveJSProperty('currentTime',0);
  expect(requests).toEqual([]); expect(errors).toEqual([]);
});
test('playlist switches only after hold and hysteresis, with actual new audio', async ({ page }) => {
  await page.clock.install(); await page.goto('/run/new');
  await page.getByLabel('Simulated cadence', { exact:false }).fill('120');
  await page.getByLabel('Import local audio files').setInputFiles([{name:'slow.wav',mimeType:'audio/wav',buffer:wav(120)}, {name:'fast.wav',mimeType:'audio/wav',buffer:wav(190)}]);
  await expect(page.locator('.run-track')).toHaveCount(2);
  for (const [index,bpm] of ['120','190'].entries()) { const row=page.locator('.run-track').nth(index); await row.getByLabel('Track BPM').fill(bpm); await row.getByRole('button',{name:'Save BPM'}).click(); }
  await page.getByLabel('Adaptation mode').selectOption('playlist'); await page.getByRole('button',{name:'Prepare simulation'}).click(); await page.getByRole('button',{name:'Start session'}).click();
  await expect(page.getByTestId('local-audio')).toHaveJSProperty('paused',false); await expect(page.locator('.run-now strong')).toHaveText('slow.wav');
  await expect(page.getByTestId('sync-state')).toContainText('In sync');
  await expect.poll(() => page.getByTestId('local-audio').evaluate((e:HTMLAudioElement)=>e.currentTime)).toBeGreaterThan(.1);
  const media=page.getByTestId('local-audio');
  const advance=async(seconds:number)=>{for(let i=0;i<seconds;i++){const position=await media.evaluate((e:HTMLAudioElement)=>e.currentTime);await expect.poll(()=>media.evaluate((e:HTMLAudioElement)=>e.currentTime),{intervals:[25,50,100]}).toBeGreaterThan(position);await page.clock.runFor(1000);}};
  await page.getByLabel('Simulated cadence', { exact:false }).fill('190'); await advance(85);
  await expect(page.locator('.run-now strong')).toHaveText('slow.wav'); await advance(10);
  await expect(page.locator('.run-now strong')).toHaveText('fast.wav'); await expect(page.getByTestId('local-audio')).toHaveJSProperty('playbackRate',1);
  await page.getByRole('button',{name:'End session'}).click();
});
test('invalid files, manual correction, unknown BPM, playlist management, and silent session', async ({page}) => {
  await page.goto('/run/new');
  await page.getByLabel('Import local audio files').setInputFiles({name:'fake.wav',mimeType:'audio/wav',buffer:Buffer.from('not audio')}); await expect(page.locator('.run-error')).toContainText('Unsupported file contents');
  await page.getByRole('button',{name:'Load demo beat'}).click(); await expect(page.locator('.run-track')).toHaveCount(1);
  await page.getByLabel('Track BPM').fill(''); await page.getByRole('button',{name:'Save BPM'}).click(); await page.getByRole('button',{name:'Prepare simulation'}).click(); await page.getByRole('button',{name:'Start session'}).click();
  await expect(page.getByTestId('sync-state')).toContainText('BPM needed'); await expect(page.getByTestId('local-audio')).toHaveJSProperty('playbackRate',1);
  await page.getByLabel('Track BPM').fill('1000'); await page.getByRole('button',{name:'Save BPM'}).click(); expect(await page.getByLabel('Track BPM').evaluate((e:HTMLInputElement)=>e.validity.valid)).toBe(false);
  await page.getByRole('button',{name:/Remove RYVO demo/}).click(); await expect(page.locator('.run-track')).toHaveCount(0); await expect(page.getByTestId('sync-state')).toContainText('No audio'); await expect(page.getByTestId('run-phase')).toHaveText('running');
  await page.getByRole('button',{name:'End session'}).click(); await page.getByRole('button',{name:'New session'}).click(); await expect(page.getByTestId('run-phase')).toHaveText('idle');
});
for (const width of [320,768,1440]) test(`run studio accessible and responsive at ${width}`, async ({page}, info) => {
  await page.setViewportSize({width,height:1000}); await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/run/new');
  await expect(page.getByRole('button',{name:'Prepare simulation'})).toBeVisible();
  expect(await page.locator('html').evaluate(e=>e.scrollWidth)).toBeLessThanOrEqual(width);
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze(); expect(results.violations).toEqual([]);
  await page.screenshot({path:info.outputPath(`run-${width}.png`),fullPage:true});
});
test('native pitch preservation retains a 440Hz tone while playback speed changes', async ({page}) => {
  await page.addInitScript(()=>{
    const create=AudioContext.prototype.createAnalyser;
    AudioContext.prototype.createAnalyser=function(){const analyser=create.call(this);Object.assign(window,{__ryvoAnalyser:analyser});return analyser;};
  });
  await page.goto('/run/new');
  await page.getByLabel('Import local audio files').setInputFiles({name:'pitch-fixture.wav',mimeType:'audio/wav',buffer:wav(160,60,true)});
  await expect(page.locator('.run-track')).toHaveCount(1);
  await page.getByLabel('Track BPM').fill('160'); await page.getByRole('button',{name:'Save BPM'}).click();
  await page.getByLabel('Simulated cadence',{exact:false}).fill('200');
  await page.getByRole('button',{name:'Prepare simulation'}).click(); await page.getByRole('button',{name:'Start session'}).click();
  const media=page.getByTestId('local-audio');
  await expect.poll(()=>media.evaluate((e:HTMLAudioElement)=>e.playbackRate),{timeout:15000}).toBeGreaterThan(1.08);
  await page.evaluate(()=>{const analyser=(window as Window & {__ryvoAnalyser?:AnalyserNode}).__ryvoAnalyser!;analyser.fftSize=8192;});
  await expect.poll(()=>page.evaluate(()=>{
    const analyser=(window as Window & {__ryvoAnalyser?:AnalyserNode}).__ryvoAnalyser!;
    const bins=new Float32Array(analyser.frequencyBinCount); analyser.getFloatFrequencyData(bins);
    let max=-Infinity,index=0;for(let i=1;i<bins.length;i++)if(bins[i]>max){max=bins[i];index=i;}
    return index*analyser.context.sampleRate/analyser.fftSize;
  }),{timeout:10000}).toBeGreaterThan(430);
  const frequency=await page.evaluate(()=>{const a=(window as Window & {__ryvoAnalyser?:AnalyserNode}).__ryvoAnalyser!;const b=new Float32Array(a.frequencyBinCount);a.getFloatFrequencyData(b);let best=0;for(let i=1;i<b.length;i++)if(b[i]>b[best])best=i;return best*a.context.sampleRate/a.fftSize;});
  expect(frequency).toBeLessThan(450); await expect(media).toHaveJSProperty('preservesPitch',true);
  await page.getByRole('button',{name:'End session'}).click();
});

test('autoplay rejection is recoverable and hiding the page pauses an active session', async ({page}) => {
  await page.addInitScript(() => {
    const original=HTMLMediaElement.prototype.play; let first=true;
    HTMLMediaElement.prototype.play=function() { if(first){first=false;return Promise.reject(new DOMException('Gesture required','NotAllowedError'));} return original.call(this); };
  });
  await page.goto('/run/new'); await page.getByRole('button',{name:'Load demo beat'}).click(); await expect(page.locator('.run-track')).toHaveCount(1);
  await page.getByRole('button',{name:'Prepare simulation'}).click(); await page.getByRole('button',{name:'Start session'}).click();
  await expect(page.locator('.run-error')).toContainText('Playback was blocked'); await expect(page.getByTestId('run-phase')).toHaveText('running');
  await page.getByRole('button',{name:'Play audio'}).click(); await expect(page.getByTestId('local-audio')).toHaveJSProperty('paused',false);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(page.getByTestId('run-phase')).toHaveText('paused'); await expect(page.getByTestId('local-audio')).toHaveJSProperty('paused',true); await expect(page.getByText('Simulation paused because the page became hidden.',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'End session'}).click();
});
test('missing pitch preservation uses source tempo and resource cleanup revokes URLs', async ({page}) => {
  await page.addInitScript(()=>{
    Object.defineProperty(HTMLMediaElement.prototype,'preservesPitch',{configurable:true,writable:true,value:undefined});
    const evidence={created:0,revoked:0}; Object.assign(window,{__audioUrls:evidence});
    const create=URL.createObjectURL.bind(URL), revoke=URL.revokeObjectURL.bind(URL);
    URL.createObjectURL=blob=>{evidence.created++;return create(blob);}; URL.revokeObjectURL=url=>{evidence.revoked++;revoke(url);};
  });
  await page.goto('/run/new'); await page.getByRole('button',{name:'Load demo beat'}).click(); await expect(page.locator('.run-track')).toHaveCount(1);
  await page.getByLabel('Track BPM').fill('160'); await page.getByRole('button',{name:'Save BPM'}).click();
  await page.getByRole('button',{name:'Prepare simulation'}).click(); await page.getByRole('button',{name:'Start session'}).click();
  await expect(page.getByTestId('sync-state')).toContainText('Pitch preservation unavailable'); await expect(page.getByTestId('local-audio')).toHaveJSProperty('playbackRate',1);
  await page.getByRole('button',{name:'End session'}).click(); await page.getByRole('link',{name:'Back to RYVO',exact:true}).click();
  await expect(page.getByRole('heading',{name:'RYVO — Run to your own rhythm'})).toBeVisible();
  await expect.poll(()=>page.evaluate(()=> {const urls=(window as unknown as Window & {__audioUrls:{created:number;revoked:number}}).__audioUrls;return urls.created>0 && urls.created===urls.revoked;})).toBe(true);
});
test('track reorder and selection are reflected in real media; 200% text remains usable', async ({page}) => {
  await page.setViewportSize({width:640,height:1000}); await page.goto('/run/new');
  await page.addStyleTag({content:'html { font-size: 200%; }'});
  await page.getByLabel('Import local audio files').setInputFiles([{name:'one.wav',mimeType:'audio/wav',buffer:wav(120,8)}, {name:'two.wav',mimeType:'audio/wav',buffer:wav(180,8)}]);
  await expect(page.locator('.run-track')).toHaveCount(2); await page.getByRole('button',{name:'Move two.wav up'}).click(); await expect(page.locator('.run-track').first()).toContainText('two.wav');
  await page.getByRole('button',{name:'Select two.wav',exact:true}).click(); await expect(page.locator('.run-now strong')).toHaveText('two.wav');
  await expect(page.locator('html')).toHaveJSProperty('scrollWidth',640);
  await page.getByRole('button',{name:'Play audio'}).click(); await expect(page.getByTestId('local-audio')).toHaveJSProperty('paused',false);
  await page.getByRole('button',{name:'Pause audio'}).click();
});

test('stalled playback freezes adaptation and can recover on explicit retry', async ({page}) => {
  await page.goto('/run/new'); await page.getByRole('button',{name:'Load demo beat'}).click(); await expect(page.locator('.run-track')).toHaveCount(1);
  await page.getByLabel('Simulated cadence',{exact:false}).fill('190'); await page.getByRole('button',{name:'Prepare simulation'}).click(); await page.getByRole('button',{name:'Start session'}).click();
  const media=page.getByTestId('local-audio'); await expect.poll(()=>media.evaluate((e:HTMLAudioElement)=>e.currentTime)).toBeGreaterThan(.2);
  await media.evaluate((e:HTMLAudioElement)=>{const position=e.currentTime;Object.defineProperty(e,'currentTime',{configurable:true,get:()=>position});});
  await expect(page.getByTestId('sync-state')).toContainText('Playback stalled');
  const rate=await media.evaluate((e:HTMLAudioElement)=>e.playbackRate); await page.waitForTimeout(2100); await expect(media).toHaveJSProperty('playbackRate',rate);
  await page.getByRole('button',{name:'Play audio'}).click(); await media.evaluate(e=>{Reflect.deleteProperty(e,'currentTime');});
  await expect(page.getByTestId('sync-state')).not.toContainText('stalled'); await expect(media).toHaveJSProperty('paused',false);
  await page.getByRole('button',{name:'End session'}).click();
});
