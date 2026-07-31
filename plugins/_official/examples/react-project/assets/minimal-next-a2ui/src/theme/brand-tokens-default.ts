/**
 * @od-component theme/brand-tokens-default
 * @notes The `mui-minimal` design system, as the fallback every generated
 *   `brand-tokens.ts` spreads over.
 *
 *   Separate from the generated file so a brand can omit a token without
 *   leaving `BrandTokens` incomplete. A brand omits one whenever its value is
 *   something MUI's colour maths cannot read — `color-mix()`, `oklch()` — in
 *   which case falling back to Minimal's neutral is better than crashing the
 *   theme at module evaluation.
 * @posicube-minimal version=0.1.0
 */

import type { BrandTokens } from './brand-tokens-type';

export const DEFAULT_BRAND_TOKENS: BrandTokens = {
  accent: '#00a76f',
  accentOn: '#ffffff',
  accentHover: '#007867',
  accentActive: '#004b50',
  success: '#22c55e',
  warn: '#ffab00',
  danger: '#ff5630',
  bg: '#ffffff',
  surface: '#ffffff',
  surfaceWarm: '#f4f6f8',
  fg: '#1c252e',
  fg2: '#454f5b',
  fontBody: 'Public Sans Variable',
  fontDisplay: 'Barlow',
  radiusMd: '12px',
};
