/**
 * @od-component theme/brand-tokens-type
 * @notes The shape of the active design system's tokens.
 *
 *   Separate from `brand-tokens.ts` because the daemon OVERWRITES that file at
 *   scaffold time; a generated file cannot also be the home of the type it is
 *   declared against.
 *
 *   The daemon rewrites this file at scaffold time from the picked design
 *   system's `tokens.css` — the same moment the shadcn seed gets its
 *   `src/app/brand-tokens.css`. One injection point, two substrates.
 *
 *   Values rather than `var(--accent)` references on purpose: the MUI theme
 *   does alpha math on these (`createPaletteChannel`, `varAlpha`), and that
 *   math cannot run on an unresolved CSS custom property.
 *
 *   The defaults below are the `mui-minimal` design system, so an un-injected
 *   seed still builds and looks exactly like stock Minimal.
 * @posicube-minimal version=0.1.0
 */

export interface BrandTokens {
  /** Primary action colour — `--accent`. */
  accent: string;
  /** Foreground on top of `accent` — `--accent-on`. */
  accentOn: string;
  /** Pressed/hover step — `--accent-hover`. Falls back to a darkened accent. */
  accentHover?: string | undefined;
  /** Deepest step — `--accent-active`. Falls back to a darkened accent. */
  accentActive?: string | undefined;
  success: string;
  warn: string;
  danger: string;
  /** Page background — `--bg`. */
  bg: string;
  /** Raised surface (cards, menus) — `--surface`. */
  surface: string;
  /** Grouped/inset surface — `--surface-warm`. */
  surfaceWarm?: string | undefined;
  /** Body ink — `--fg`. */
  fg: string;
  /** Secondary ink — `--fg-2`. */
  fg2: string;
  /** Body typeface — `--font-body`. */
  fontBody: string;
  /** Display typeface — `--font-display`. */
  fontDisplay: string;
  /** Container radius — `--radius-md`, e.g. `12px`. */
  radiusMd: string;
}

