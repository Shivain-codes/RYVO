import { expect, test } from '@playwright/test';

test('renders RYVO without capability prompts or protected requests', async ({ page }) => {
  const protectedRequests: string[] = [];

  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const capabilityAccess: string[] = [];
    const instrumentedWindow = window as Window & { __pulseCapabilityAccess?: string[] };
    instrumentedWindow.__pulseCapabilityAccess = capabilityAccess;

    const wrapMethod = (target: object | undefined, method: string, label: string) => {
      if (!target) return;
      const original = (target as Record<string, unknown>)[method];
      if (typeof original !== 'function') return;
      (target as Record<string, unknown>)[method] = function (...args: unknown[]) {
        capabilityAccess.push(label);
        return (original as (...methodArgs: unknown[]) => unknown).apply(this, args);
      };
    };

    wrapMethod(navigator.geolocation, 'getCurrentPosition', 'geolocation');
    wrapMethod(navigator.geolocation, 'watchPosition', 'geolocation');
    wrapMethod(navigator.mediaDevices, 'getUserMedia', 'media');
    wrapMethod(window.Notification, 'requestPermission', 'notifications');
    wrapMethod(window.DeviceMotionEvent, 'requestPermission', 'motion');
    wrapMethod(window.DeviceOrientationEvent, 'requestPermission', 'orientation');
    const OriginalAudioContext = window.AudioContext;
    if (OriginalAudioContext) window.AudioContext = new Proxy(OriginalAudioContext, {
      construct(target, args) { capabilityAccess.push('audio-context'); return Reflect.construct(target, args); },
    });
    const originalAdd = window.addEventListener;
    window.addEventListener = function (this: Window, ...args: Parameters<typeof originalAdd>) {
      if (args[0] === 'devicemotion' || args[0] === 'deviceorientation') capabilityAccess.push(args[0]);
      originalAdd.apply(this, args);
    } as typeof originalAdd;
  });

  page.on('request', (request) => {
    if (request.url().includes('/api/')) {
      protectedRequests.push(request.url());
    }
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'RYVO — Run to your own rhythm' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('172.0 BPM');
  await expect(page.getByText('Visual demonstration only.', { exact: false })).toBeVisible();

  await page.getByRole('link', { name: 'Explore run setup' }).click();
  await expect(page.getByRole('button', { name: 'Prepare simulation' })).toBeVisible();

  const browserEvidence = await page.evaluate(() => {
    const reducedMotionRule = [...document.styleSheets]
      .flatMap((sheet) => {
        try {
          return [...sheet.cssRules];
        } catch {
          return [];
        }
      })
      .find((rule) => rule.cssText.includes('prefers-reduced-motion'));
    const instrumentedWindow = window as Window & { __pulseCapabilityAccess?: string[] };

    return {
      capabilityAccess: instrumentedWindow.__pulseCapabilityAccess ?? [],
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      reducedMotionRule: reducedMotionRule?.cssText ?? '',
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });

  expect(browserEvidence.capabilityAccess).toEqual([]);
  expect(protectedRequests).toEqual([]);
  expect(browserEvidence.reducedMotion).toBe(true);
  expect(browserEvidence.reducedMotionRule).toContain('transition-duration');
  expect(browserEvidence.reducedMotionRule).toContain('animation-duration');
  expect(browserEvidence.scrollWidth).toBeLessThanOrEqual(browserEvidence.viewportWidth);
});
