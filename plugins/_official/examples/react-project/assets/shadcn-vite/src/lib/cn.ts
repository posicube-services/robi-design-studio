import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * The catalog's colour domain is `primary|success|warning|error|info|grey`, but
 * the OD token contract only guarantees `--accent --success --warn --danger
 * --muted`. `info` has no token, so it borrows `--accent` here. That is a
 * standing assumption, not a decision — the real options are to drop `info`
 * from the semantic domain or to add a token to the contract.
 */
export const SEMANTIC_BG: Record<string, string> = {
  primary: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warn',
  error: 'bg-danger',
  info: 'bg-accent',
  grey: 'bg-muted',
};

export const SEMANTIC_SOFT: Record<string, string> = {
  primary: 'bg-accent/12 text-accent',
  success: 'bg-success/15 text-success',
  warning: 'bg-warn/15 text-warn',
  error: 'bg-danger/15 text-danger',
  info: 'bg-accent/12 text-accent',
  grey: 'bg-muted/15 text-muted',
};

/** Map a free-form status string onto the semantic domain. */
export function statusTone(value: unknown): string {
  const s = String(value ?? '').toLowerCase();
  if (/(active|success|paid|done|완료|성공)/.test(s)) return 'success';
  if (/(pending|trial|warn|대기|진행)/.test(s)) return 'warning';
  if (/(churn|fail|error|cancel|실패|취소)/.test(s)) return 'error';
  return 'grey';
}

/**
 * Chart series palette. The token contract has exactly one brand colour
 * (`--accent`), so a multi-series chart has nothing to draw a second colour
 * from. Derive them by rotating hue off the accent at render time: brand-led,
 * deterministic, and no new tokens. MUI hid this gap by shipping its own
 * hardcoded chart palette independent of the design system.
 */
export function seriesColors(count: number): string[] {
  const steps = [0, 32, -28, 64, -56, 96];
  return Array.from({ length: count }, (_, i) => {
    const rotate = steps[i % steps.length] ?? 0;
    return rotate === 0
      ? 'var(--accent)'
      : `oklch(from var(--accent) l c calc(h + ${rotate}))`;
  });
}

export const fmt = {
  currency: (v: unknown) =>
    typeof v === 'number' ? `₩${v.toLocaleString('ko-KR')}` : String(v ?? ''),
  number: (v: unknown) =>
    typeof v === 'number' ? v.toLocaleString('ko-KR') : String(v ?? ''),
  date: (v: unknown) => String(v ?? ''),
};
