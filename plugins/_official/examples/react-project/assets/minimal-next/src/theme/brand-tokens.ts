/**
 * @od-component theme/brand-tokens
 * @notes The active Open Design design system's tokens, as values.
 *
 *   The daemon REWRITES this file at scaffold time from the picked design
 *   system's `tokens.css` — the same moment the shadcn seed gets its
 *   `src/app/brand-tokens.css`. One injection point, two substrates.
 *
 *   Values rather than `var(--accent)` references on purpose: the MUI theme
 *   does alpha math on these (`createPaletteChannel`, `varAlpha`), and that
 *   math cannot run on an unresolved CSS custom property.
 *
 *   Un-injected, this is exactly `mui-minimal`, so the seed still builds and
 *   looks like stock Minimal on its own.
 * @posicube-minimal version=0.1.0
 */

import { DEFAULT_BRAND_TOKENS } from './brand-tokens-default';
import type { BrandTokens } from './brand-tokens-type';

export const brandTokens: BrandTokens = { ...DEFAULT_BRAND_TOKENS };
