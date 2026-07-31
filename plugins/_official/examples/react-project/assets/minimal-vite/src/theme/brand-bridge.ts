/**
 * @od-component theme/brand-bridge
 * @notes Turns Open Design tokens into the shapes MUI's theme wants.
 *
 *   MUI asks for a five-step scale per colour (`lighter light main dark
 *   darker` + `contrastText`); the token contract guarantees a single value
 *   plus, for the accent, a hover and an active step. So `main`, `dark`,
 *   `darker` and `contrastText` come straight from tokens where the brand
 *   declares them, and the two light steps are derived.
 *
 *   Derived steps APPROXIMATE rather than reproduce a hand-tuned ramp. Round
 *   tripping `mui-minimal` gives back its exact main/dark/darker/contrastText,
 *   but its `light`/`lighter` are hand-picked and come back close, not equal.
 *   That is the honest limit of deriving a scale from a point.
 *
 *   `secondary` and `info` have no token at all — the contract covers only
 *   `--accent --success --warn --danger`. Both are rotated off the accent's
 *   hue, the same technique the shadcn seed uses, so the catalog's palette
 *   domain keeps working without shrinking.
 * @posicube-minimal version=0.1.0
 */

import { brandTokens } from './brand-tokens';
import type { BrandTokens } from './brand-tokens-type';

/** One MUI palette colour: five steps plus the text drawn on top of `main`. */
export interface PaletteRamp {
  lighter: string;
  light: string;
  main: string;
  dark: string;
  darker: string;
  contrastText: string;
}

// Chosen against Minimal's own ramp: its `light` sits roughly 40% toward white
// and `lighter` roughly 76%, so a brand that declares only `--accent` lands in
// the same visual territory as the seed it replaces.
const LIGHT_MIX = 0.4;
const LIGHTER_MIX = 0.76;
const DARK_MIX = 0.24;
const DARKER_MIX = 0.48;

/** White or near-black, whichever stays legible on `background`. */
function readableOn(background: string): string {
  try {
    const [r, g, b] = decompose(background);
    // Rec. 601 luma — the same rule of thumb MUI's own contrastText uses.
    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#1C252E' : '#FFFFFF';
  } catch {
    return '#FFFFFF';
  }
}

/**
 * Mix toward white / black by `amount` (0–1).
 *
 * Deliberately not MUI's `lighten`/`darken`, though they do the same channel
 * mix: keeping this file free of runtime imports is what lets the derivation be
 * tested without installing the seed's dependencies.
 */
function mix(hex: string, amount: number, toward: 0 | 255): string {
  const channels = decompose(hex).map((v) =>
    Math.round(v + (toward - v) * amount),
  );
  return `#${channels.map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

const lighten = (hex: string, amount: number) => mix(hex, amount, 255);
const darken = (hex: string, amount: number) => mix(hex, amount, 0);

/** `#rgb` / `#rrggbb` / `#rrggbbaa` → `[r, g, b]`. */
function decompose(hex: string): [number, number, number] {
  const raw = hex.trim().replace('#', '');
  const full = raw.length === 3
    ? raw.split('').map((c) => c + c).join('')
    : raw;
  if (full.length < 6) throw new Error(`unsupported colour: ${hex}`);
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/**
 * Rotate a colour's hue by `degrees`, preserving its saturation and lightness.
 *
 * Used only for `secondary` and `info`, which the token contract does not
 * cover. Keeping them tied to the accent means a brand switch moves them
 * together rather than leaving a stale hue behind.
 */
function rotateHue(hex: string, degrees: number): string {
  const [r, g, b] = decompose(hex).map((v) => v / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  h = (h * 60 + degrees + 360) % 360;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const seg: [number, number, number] =
    h < 60 ? [c, x, 0]
    : h < 120 ? [x, c, 0]
    : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c]
    : h < 300 ? [x, 0, c]
    : [c, 0, x];
  const to255 = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${seg.map(to255).join('')}`.toUpperCase();
}

/**
 * Build a five-step ramp around `main`.
 *
 * `dark`/`darker`/`contrastText` are used when the brand declares them and
 * derived otherwise, so a brand that spells out its pressed states keeps them
 * exactly.
 */
export function ramp(
  main: string,
  opts: {
    dark?: string | undefined;
    darker?: string | undefined;
    contrastText?: string | undefined;
  } = {},
): PaletteRamp {
  // A brand that simply omits `--accent-on` reaches here as an empty string,
  // not undefined, so `??` alone would hand MUI a blank colour.
  const declared = (value: string | undefined) =>
    value && value.trim().length > 0 ? value : undefined;
  return {
    lighter: lighten(main, LIGHTER_MIX),
    light: lighten(main, LIGHT_MIX),
    main,
    dark: declared(opts.dark) ?? darken(main, DARK_MIX),
    darker: declared(opts.darker) ?? darken(main, DARKER_MIX),
    contrastText: declared(opts.contrastText) ?? readableOn(main),
  };
}

/** Hue offsets that keep `secondary`/`info` distinct from the accent but related. */
const SECONDARY_ROTATION = 64;
const INFO_ROTATION = -28;

export interface BrandPalette {
  primary: PaletteRamp;
  secondary: PaletteRamp;
  info: PaletteRamp;
  success: PaletteRamp;
  warning: PaletteRamp;
  error: PaletteRamp;
}

/** The six semantic MUI colours, built from the active design system. */
export function brandPalette(tokens: BrandTokens = brandTokens): BrandPalette {
  return {
    primary: ramp(tokens.accent, {
      dark: tokens.accentHover,
      darker: tokens.accentActive,
      contrastText: tokens.accentOn,
    }),
    secondary: ramp(rotateHue(tokens.accent, SECONDARY_ROTATION)),
    info: ramp(rotateHue(tokens.accent, INFO_ROTATION)),
    success: ramp(tokens.success),
    warning: ramp(tokens.warn),
    error: ramp(tokens.danger),
  };
}

/** `--radius-md` as the number MUI's `shape.borderRadius` multiplies. */
export function brandBorderRadius(tokens: BrandTokens = brandTokens): number {
  const parsed = Number.parseFloat(tokens.radiusMd);
  return Number.isFinite(parsed) ? parsed : 8;
}
