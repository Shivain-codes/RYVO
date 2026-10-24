import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [320, 390, 768, 1440]) {
  test(`responsive landing and demo at ${width}px`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page).toHaveTitle('RYVO — Run to Your Own Rhythm');
    await expect(page.locator('body')).not.toContainText('PULSE');
    await expect(page.getByRole('heading', { name: 'RYVO — Run to your own rhythm' })).toBeVisible();
    await expect(page.locator('.hero-line').first()).toHaveCSS('opacity', '1');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath(`hero-${width}.png`) });
    await expect(page.locator('html')).toHaveJSProperty('scrollWidth', width);
    if (width < 768) {
      const menu = page.locator('.menu-toggle');
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await page.getByRole('link', { name: 'Product', exact: true }).focus();
      await page.keyboard.press('Escape');
      await expect(menu).toBeFocused();
      await menu.click();
    }
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Demo', exact: true }).click();
    const slider = page.getByRole('slider');
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveValue('173');
    await page.getByRole('radio', { name: '1:2 Half time' }).check();
    await expect(page.getByRole('status')).toContainText('86.5 BPM');
    await page.getByRole('radio', { name: '2:1 Double time' }).check();
    await expect(page.getByRole('status')).toContainText('outside the planned');
    await page.getByRole('button', { name: /Reset demo/ }).click();
    await expect(slider).toHaveValue('172');
    await expect(page.getByRole('radio', { name: '1:1 Every step' })).toBeChecked();
    await expect(page.getByRole('radio', { name: '2:1 Double time' })).not.toBeChecked();
    await page.screenshot({ path: testInfo.outputPath(`demo-${width}.png`) });
    await page.locator('summary').filter({ hasText: 'Your files. Your soundtrack.' }).click();
    await expect(page.getByText(/Spotify, Apple Music, YouTube/)).toBeVisible();
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(audit.violations).toEqual([]);
    if (width === 1440 || width === 320) {
      await page.getByRole('heading', { name: 'RYVO — Run to your own rhythm' }).click();
      await page.screenshot({ path: testInfo.outputPath(`full-page-${width}.png`), fullPage: true });
    }
    await expect(page.locator('html')).toHaveJSProperty('scrollWidth', width);
    await page.getByRole('link', { name: 'Explore run setup' }).click();
    await expect(page).toHaveURL(/\/run\/new$/);
    await expect(page).toHaveTitle('Run studio — RYVO');
    await expect(page.locator('body')).not.toContainText('PULSE');
    await expect(page.getByRole('heading', { name: 'Your next starting line.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Prepare simulation' })).toBeVisible();
    await page.getByRole('link', { name: 'Try the rhythm demo' }).click();
    await expect(page).toHaveURL(/\/#demo$/);
    expect(errors).toEqual([]);
  });
}

test('GSAP enhancement cleans up on reduced-motion changes and navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.hero-line').first()).toHaveCSS('opacity', '1');
  await page.locator('#demo').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: 'Find your frequency.' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Pause motion|Resume motion/ })).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('.hero-track')).toHaveCSS('transform', 'none');
  await expect(page.locator('.gallery-stage')).not.toHaveAttribute('data-scroll-gallery');
  await expect(page.locator('.gallery-strip')).toHaveCSS('transform', 'none');
  for (const photo of await page.locator('.gallery-photo').all()) {
    const bounds = await photo.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1440);
  }
  for (const element of await page.locator('[data-reveal]').all()) await expect(element).toHaveCSS('opacity', '1');
  await page.getByRole('link', { name: 'Explore run setup' }).click();
  await page.getByRole('link', { name: 'Back to RYVO' }).click();
  await expect(page.getByRole('heading', { name: 'RYVO — Run to your own rhythm' })).toBeVisible();
});

test('server-rendered story and navigation work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3100/');
  await expect(page.getByRole('heading', { name: 'RYVO — Run to your own rhythm' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Navigation without JavaScript' }).getByRole('link', { name: 'Demo' }).click();
  await expect(page.getByText(/Enable JavaScript to adjust the demo/)).toBeVisible();
  await page.getByText('Made for the foreground', { exact: false }).click();
  await expect(page.getByText(/Background and lock-screen tracking/)).toBeVisible();
  await page.getByRole('link', { name: 'Explore run setup' }).click();
  await expect(page.getByRole('heading', { name: 'Your next starting line.' })).toBeVisible();
  await context.close();
});

test('200% text enlargement preserves controls and reflow', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  await expect(page.locator('html')).toHaveJSProperty('scrollWidth', 640);
  await page.getByRole('slider').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('status')).toContainText('173.0 BPM');
  await page.getByRole('radio', { name: '1:2 Half time' }).check();
  await expect(page.getByRole('status')).toContainText('86.5 BPM');
});


test('direct rhythm links survive scroll-animation initialization', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#demo');
  await expect(page.locator('.gallery-stage')).toHaveAttribute('data-scroll-gallery', 'true');
  await expect(page.getByRole('heading', { name: 'Find your frequency.' })).toBeInViewport();
  await page.getByRole('button', { name: 'Increase cadence' }).click();
  await page.getByRole('radio', { name: '1:2 Half time' }).check();
  await expect(page.getByRole('status')).toContainText('86.5 BPM');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('status')).toContainText('172.0 BPM');
  await page.locator('#demo').screenshot({ path: testInfo.outputPath('ryvo-rhythm.png'), animations: 'disabled' });
});
