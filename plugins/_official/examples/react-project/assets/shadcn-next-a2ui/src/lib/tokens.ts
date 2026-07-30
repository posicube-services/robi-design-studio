/**
 * Catalog enum → design-system token mapping.
 *
 * The catalog's prop domains were extracted from the MUI Minimal theme
 * (`src/authoring/extracted/theme-enums.json`), so they speak MUI's vocabulary:
 * six palette keys, 14 typography variants, spacing in 8px units. The Open
 * Design token contract speaks a smaller, brand-authored vocabulary. This module
 * is the whole translation, kept in one file so the blocks stay declarative.
 *
 * The catalog is NOT modified. Keeping it byte-identical to the MUI seed's copy
 * is what lets an existing `a2ui-spec.json` render here unchanged — the point of
 * D1 being a spec rather than code.
 */

/**
 * `secondary` and `info` have no token: the contract guarantees `--accent`,
 * `--success`, `--warn`, `--danger` and nothing else chromatic. Rather than
 * shrink the catalog's domain (which would cost an `info` alert, a very ordinary
 * thing), derive them by rotating hue off the brand accent — the same technique
 * the chart series palette uses, and visually verified across brands as
 * different as Stripe, Neobrutalism and Apple.
 *
 * The MUI seed never had to answer this because MUI ships its own six-colour
 * palette, i.e. it satisfied the domain by ignoring the design system.
 */
const DERIVED_SECONDARY = 'oklch(from var(--accent) l c calc(h + 64))';
const DERIVED_INFO = 'oklch(from var(--accent) l c calc(h - 28))';

export const PALETTE_VAR: Record<string, string> = {
  primary: 'var(--accent)',
  secondary: DERIVED_SECONDARY,
  info: DERIVED_INFO,
  success: 'var(--success)',
  warning: 'var(--warn)',
  error: 'var(--danger)',
  grey: 'var(--muted)',
  default: 'var(--muted)',
  inherit: 'currentColor',
};

/** Foreground that reads on top of the matching PALETTE_VAR fill. */
export const PALETTE_ON: Record<string, string> = {
  primary: 'var(--accent-on)',
  secondary: 'var(--accent-on)',
  info: 'var(--accent-on)',
  success: 'var(--bg)',
  warning: 'var(--bg)',
  error: 'var(--bg)',
  grey: 'var(--bg)',
  default: 'var(--bg)',
  inherit: 'currentColor',
};

export function paletteVar(key: unknown, fallback = 'primary'): string {
  return PALETTE_VAR[String(key ?? fallback)] ?? PALETTE_VAR[fallback]!;
}

export function paletteOn(key: unknown, fallback = 'primary'): string {
  return PALETTE_ON[String(key ?? fallback)] ?? PALETTE_ON[fallback]!;
}

/**
 * Typography. The catalog offers MUI's 14 variants; the token contract offers a
 * type scale (`--text-xs`…`--text-4xl`), two line heights and one display
 * tracking. Map each variant onto that scale plus a weight, so h1–h6 stay a
 * hierarchy and the brand's own scale decides the actual sizes.
 */
export const TYPOGRAPHY: Record<string, string> = {
  h1: 'font-display text-4xl leading-tight tracking-display font-bold',
  h2: 'font-display text-3xl leading-tight tracking-display font-bold',
  h3: 'font-display text-2xl leading-tight tracking-display font-semibold',
  h4: 'font-display text-xl leading-tight font-semibold',
  h5: 'font-display text-lg leading-tight font-semibold',
  h6: 'font-display text-base leading-tight font-semibold',
  subtitle1: 'text-base leading-body font-medium',
  subtitle2: 'text-sm leading-body font-medium',
  body1: 'text-base leading-body',
  body2: 'text-sm leading-body',
  caption: 'text-xs leading-body',
  overline: 'text-xs leading-body uppercase tracking-display',
  button: 'text-sm leading-tight font-medium',
  inherit: '',
};

/**
 * Spacing. The catalog's values are MUI units (1 = 8px); the brand contract has
 * an authored scale (`--space-1..6, 8, 12`) whose pixel values are the brand's
 * business, not ours. So map by RANK, not by pixel arithmetic — a spec asking
 * for "spacing 3" gets the brand's third-from-largest step rather than a literal
 * 24px that would fight a tight or airy brand.
 */
const SPACING_RANK: Record<string, string> = {
  '0': '0',
  '0.5': 'var(--space-1)',
  '1': 'var(--space-2)',
  '1.5': 'var(--space-2)',
  '2': 'var(--space-3)',
  '2.5': 'var(--space-4)',
  '3': 'var(--space-4)',
  '4': 'var(--space-5)',
  '5': 'var(--space-6)',
  '6': 'var(--space-8)',
};

export function spacingVar(value: unknown, fallback = '2'): string {
  return SPACING_RANK[String(value ?? fallback)] ?? SPACING_RANK[fallback]!;
}

export const MAX_WIDTH: Record<string, string> = {
  sm: '40rem',
  md: '56rem',
  lg: 'var(--container-max)',
  xl: 'min(90rem, var(--container-max))',
};

export const TEXT_ALIGN: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const BUTTON_SIZE: Record<string, string> = {
  small: 'px-3 py-1 text-xs',
  medium: 'px-4 py-2 text-sm',
  large: 'px-5 py-3 text-base',
};

export const CHIP_SIZE: Record<string, string> = {
  small: 'px-2 py-0.5 text-xs',
  medium: 'px-3 py-1 text-sm',
};

/** Map a free-form status value onto the semantic domain for status chips. */
export function statusTone(value: unknown): string {
  const s = String(value ?? '').toLowerCase();
  if (/(active|success|paid|approved|done|완료|성공|승인)/.test(s)) return 'success';
  if (/(pending|trial|processing|warn|대기|진행|검토)/.test(s)) return 'warning';
  if (/(churn|fail|error|cancel|reject|실패|취소|반려)/.test(s)) return 'error';
  return 'default';
}

/**
 * Chart series palette. The contract has exactly one brand colour, so a
 * multi-series chart has nothing to take a second colour from. Rotate hue off
 * the accent: deterministic, brand-led, and no new tokens required.
 */
export function seriesColors(count: number): string[] {
  const steps = [0, 32, -28, 64, -56, 96, -84];
  return Array.from({ length: count }, (_, i) => {
    const rotate = steps[i % steps.length] ?? 0;
    return rotate === 0 ? 'var(--accent)' : `oklch(from var(--accent) l c calc(h + ${rotate}))`;
  });
}

export const fmt = {
  currency: (v: unknown) =>
    typeof v === 'number' ? `₩${v.toLocaleString('ko-KR')}` : String(v ?? ''),
  number: (v: unknown) =>
    typeof v === 'number' ? v.toLocaleString('ko-KR') : String(v ?? ''),
  date: (v: unknown) => String(v ?? ''),
  compact: (v: unknown, money?: boolean) => {
    if (typeof v !== 'number') return String(v ?? '');
    const s = v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(1)}k` : String(v);
    return money ? `₩${s}` : s;
  },
};
