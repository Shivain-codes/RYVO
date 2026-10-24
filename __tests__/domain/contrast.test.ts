import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('app/globals.css', 'utf8');
function luminance(token: string) {
  const hex = css.match(new RegExp(`--pulse-${token}: #(\\w{6});`))?.[1];
  if (!hex) throw new Error(`Missing token ${token}`);
  const rgb = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + .05) / (values[1] + .05);
}
describe('semantic color contrast', () => {
  for (const background of ['void', 'panel', 'panel-raised']) {
    for (const foreground of ['ink', 'ash', 'dim', 'orange']) {
      it(`${foreground} text on ${background} meets normal-text AA`, () => {
        expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
  it.each([['void', 'ink'], ['paper-muted', 'ink'], ['void', 'orange'], ['void', 'yellow']])('%s on %s meets normal-text AA', (foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
  it('control boundaries meet non-text contrast on dark surfaces', () => {
    expect(contrast('control-border', 'void')).toBeGreaterThanOrEqual(3);
  });
});
