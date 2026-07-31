// The MUI A2UI seed takes its colour from a JS theme, so picking Slack used to
// change nothing — the defect that made the shadcn seed necessary. The bridge
// closes it: the daemon parses the picked design system's `tokens.css` into
// `src/theme/brand-tokens.ts`, and the theme is built from those values.
//
// This spec lives in e2e because it spans two boundaries — the seed's
// derivation under `plugins/_official/**` and the brand files under
// `design-systems/**` — which is what `e2e/tests/` is for. The daemon's own
// half (parsing `tokens.css`, writing the module) is pinned daemon-locally in
// `apps/daemon/tests/react-scaffold-brand-tokens.test.ts`.
//
// The round trip is the acceptance test. `mui-minimal` is the brand pack
// extracted FROM this theme, so feeding it back has to return the theme's own
// colours. Where a token backs a step the match is exact; the two light steps
// are derived from a single point and only land close, which is the honest
// limit of deriving a scale — so exactness is asserted only where a token
// backs it.

import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  brandPalette,
  brandBorderRadius,
} from '../../plugins/_official/examples/react-project/assets/minimal-next-a2ui/src/theme/brand-bridge.js';
import type { BrandTokens } from '../../plugins/_official/examples/react-project/assets/minimal-next-a2ui/src/theme/brand-tokens-type.js';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../..');

/**
 * Read a brand's light-mode custom properties.
 *
 * Deliberately a local helper rather than a reach into the daemon's
 * `parseRootTokens`: e2e must not import an app's private source. The daemon's
 * parser is pinned by its own spec; this one only has to be right enough to
 * feed the derivation under test.
 */
function tokensFor(css: string): BrandTokens {
  const body = css.slice(css.indexOf('{', css.indexOf(':root')) + 1);
  const t: Record<string, string> = {};
  const decls = body.slice(0, body.indexOf('}')).replace(/\/\*[\s\S]*?\*\//g, '').split(';');
  for (const decl of decls) {
    const at = decl.indexOf(':');
    if (at === -1) continue;
    const name = decl.slice(0, at).trim();
    if (name.startsWith('--')) t[name] = decl.slice(at + 1).trim().replace(/\s+/g, ' ');
  }
  return {
    accent: t['--accent'] ?? '',
    accentOn: t['--accent-on'] ?? '#FFFFFF',
    accentHover: t['--accent-hover'],
    accentActive: t['--accent-active'],
    success: t['--success'] ?? '',
    warn: t['--warn'] ?? '',
    danger: t['--danger'] ?? '',
    bg: t['--bg'] ?? '',
    surface: t['--surface'] ?? '',
    surfaceWarm: t['--surface-warm'],
    fg: t['--fg'] ?? '',
    fg2: t['--fg-2'] ?? '',
    fontBody: t['--font-body'] ?? '',
    fontDisplay: t['--font-display'] ?? '',
    radiusMd: t['--radius-md'] ?? '8px',
  };
}

const readBrand = (id: string) =>
  readFile(path.join(REPO_ROOT, 'design-systems', id, 'tokens.css'), 'utf8');

const luma = (hex: string) => {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000;
};

describe('mui-minimal round trip', () => {
  it('returns the theme its own tokens were extracted from', async () => {
    const palette = brandPalette(tokensFor(await readBrand('mui-minimal')));

    expect(palette.primary.main.toLowerCase()).toBe('#00a76f');
    expect(palette.primary.dark.toLowerCase()).toBe('#007867');
    expect(palette.primary.darker.toLowerCase()).toBe('#004b50');
    expect(palette.primary.contrastText.toLowerCase()).toBe('#ffffff');
    expect(palette.success.main.toLowerCase()).toBe('#22c55e');
    expect(palette.warning.main.toLowerCase()).toBe('#ffab00');
    expect(palette.error.main.toLowerCase()).toBe('#ff5630');
  });

  it('derives the light steps without inverting the ramp', async () => {
    const { primary } = brandPalette(tokensFor(await readBrand('mui-minimal')));
    expect(luma(primary.lighter)).toBeGreaterThan(luma(primary.light));
    expect(luma(primary.light)).toBeGreaterThan(luma(primary.main));
    expect(luma(primary.main)).toBeGreaterThan(luma(primary.dark));
    expect(luma(primary.dark)).toBeGreaterThan(luma(primary.darker));
  });
});

describe('a different brand actually changes the theme', () => {
  it('gives Slack its aubergine, not the seed default', async () => {
    const palette = brandPalette(tokensFor(await readBrand('slack')));
    expect(palette.primary.main.toLowerCase()).toBe('#4a154b');
    expect(palette.primary.main.toLowerCase()).not.toBe('#00a76f');
  });

  // secondary/info have no token in the contract; rotating off the accent is
  // what keeps the catalog's palette domain usable without shrinking it.
  it('derives secondary and info from the accent rather than leaving them stale', async () => {
    const slack = brandPalette(tokensFor(await readBrand('slack')));
    const github = brandPalette(tokensFor(await readBrand('github')));
    expect(slack.secondary.main).not.toBe(github.secondary.main);
    expect(slack.info.main).not.toBe(github.info.main);
    expect(slack.secondary.main).not.toBe(slack.primary.main);
  });

  it('takes the container radius from the brand', async () => {
    expect(brandBorderRadius(tokensFor(await readBrand('github')))).toBe(6);
  });

  // A dark accent needs a light label; a bright warning needs a dark one.
  it('picks a readable contrast text when the brand declares none', async () => {
    const tokens = tokensFor(await readBrand('slack'));
    const palette = brandPalette({ ...tokens, accentOn: '' });
    expect(palette.primary.contrastText).toBe('#FFFFFF');
    expect(luma(palette.warning.contrastText)).toBeLessThan(luma(palette.warning.main));
  });
});
