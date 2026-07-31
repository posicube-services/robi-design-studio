// React-project scaffold materialization.
//
// New react-projects are generated on top of a bundled seed. The `minimal`
// variant (curated MUI "minimal" design system) runs to ~150 files — too many
// for an agent to copy by hand — so the daemon copies the seed tree from the
// bundled `example-react-project` plugin's assets into the project directory.
// This runs automatically at react-project run start, and is also exposed via
// `POST /api/projects/:id/react/scaffold` + `od react scaffold` (UI/CLI
// dual-track).
//
// Seed asset layout under `<plugin.fsPath>/assets/`:
//   minimal-vite/   minimal-next/       ← curated MUI minimal seeds (default)
//   minimal-next-a2ui/                  ← A2UI on MUI Minimal
//   shadcn-next-a2ui/                   ← A2UI on shadcn + Tailwind v4, where the
//                                         active design system's tokens actually
//                                         drive the blocks
//   scaffold/       scaffold-next/      ← lightweight `plain` starters (fallback)

import { existsSync } from 'node:fs';
import { cp, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type {
  ReactScaffoldFramework,
  ReactScaffoldState,
  ReactScaffoldVariant,
} from '@open-design/contracts';
import { resolveDesignSystemAssets } from './design-systems/index.js';

/** Seed asset directory name for a framework + variant. */
function seedDirName(
  framework: ReactScaffoldFramework,
  variant: ReactScaffoldVariant,
): string {
  // Both a2ui variants carry the spec renderer + Zod gate and are Next apps;
  // there is no Vite twin of either, so a vite request degrades to plain
  // `minimal` below.
  if (variant === 'a2ui-shadcn') {
    return framework === 'next' ? 'shadcn-next-a2ui' : 'minimal-vite';
  }
  if (variant === 'a2ui') {
    return framework === 'next' ? 'minimal-next-a2ui' : 'minimal-vite';
  }
  if (variant === 'minimal') {
    return framework === 'next' ? 'minimal-next' : 'minimal-vite';
  }
  return framework === 'next' ? 'scaffold-next' : 'scaffold';
}

/**
 * Resolve the seed directory to copy, honoring the requested variant with a
 * graceful fallback: a missing `minimal` seed degrades to the `plain` starter
 * rather than failing, so a partially-built repo still generates *something*.
 * Returns the absolute seed dir and the variant actually chosen, or null when
 * no seed exists at all.
 */
export function resolveReactSeedDir(
  pluginAssetsRoot: string,
  framework: ReactScaffoldFramework,
  variant: ReactScaffoldVariant,
): { dir: string; variant: ReactScaffoldVariant } | null {
  const primary = path.join(pluginAssetsRoot, seedDirName(framework, variant));
  if (existsSync(primary)) return { dir: primary, variant };
  // Either a2ui variant on vite (or a missing a2ui seed) lands on the MUI
  // Minimal starter: same design system, no spec gate. Report `minimal` so the
  // caller sees the variant it actually got rather than the one it asked for.
  if (variant === 'a2ui' || variant === 'a2ui-shadcn') {
    const fallback = path.join(pluginAssetsRoot, seedDirName(framework, 'minimal'));
    if (existsSync(fallback)) return { dir: fallback, variant: 'minimal' };
  }
  if (variant === 'minimal' || variant === 'a2ui' || variant === 'a2ui-shadcn') {
    const fallback = path.join(pluginAssetsRoot, seedDirName(framework, 'plain'));
    if (existsSync(fallback)) return { dir: fallback, variant: 'plain' };
  }
  return null;
}

/** Count files (not directories) under a tree, recursively. */
/**
 * Seed entries that must never reach a generated project.
 *
 * A seed is a source tree, but it lives in a working directory where anyone may
 * have run `npm install` or a build — and none of that is tracked in git, so it
 * is invisible until it is copied. Copying `node_modules` is actively harmful,
 * not just wasteful: `runDev` installs only when `node_modules` is absent, so a
 * copied one means the install never runs and the seed's lockfile is never
 * honored. That silently defeats the whole point of pinning
 * (`docs/posicube/generated-project-stack.md`), and the tree it leaves behind was
 * resolved from whatever the lockfile said at the time someone ran install.
 *
 * Measured on a machine where a seed had been installed once: 30,315 files
 * copied instead of ~370.
 */
const SEED_COPY_EXCLUDE = new Set([
  'node_modules',
  '.next',
  'out',
  'dist',
  '.turbo',
  'tsconfig.tsbuildinfo',
]);

function isExcludedSeedEntry(seedRoot: string, absPath: string): boolean {
  const rel = path.relative(seedRoot, absPath);
  if (!rel) return false;
  return rel.split(path.sep).some((segment) => SEED_COPY_EXCLUDE.has(segment));
}

async function countFiles(dir: string, seedRoot = dir): Promise<number> {
  let total = 0;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (isExcludedSeedEntry(seedRoot, full)) continue;
    if (entry.isDirectory()) total += await countFiles(full, seedRoot);
    else total += 1;
  }
  return total;
}

/** True when the project directory already holds a generated project. */
function projectHasFiles(projectDir: string): boolean {
  return existsSync(path.join(projectDir, 'package.json'));
}

export interface MaterializeReactScaffoldInput {
  projectId: string;
  /** Absolute path to the project root (resolved by the caller). */
  projectDir: string;
  /** Absolute path to the plugin's `assets/` directory. */
  pluginAssetsRoot: string;
  framework: ReactScaffoldFramework;
  variant?: ReactScaffoldVariant | undefined;
  force?: boolean | undefined;
  /** Active design system id, recorded on the returned state for logging. */
  designSystemId?: string | null | undefined;
  /**
   * The active design system's `tokens.css`, verbatim. Resolved by the caller
   * (which owns design-system lookup) and written over the seed's
   * `src/app/brand-tokens.css` — see `applyBrandTokens`. Passing the text
   * rather than an id keeps this module pure filesystem work.
   */
  brandTokensCss?: string | null | undefined;
}

/** The one file a token-consuming seed changes when the brand changes. */
const BRAND_TOKENS_REL = path.join('src', 'app', 'brand-tokens.css');

/**
 * The MUI seed's equivalent. It needs the same tokens as *values*, because its
 * theme does alpha math on them (`createPaletteChannel`, `varAlpha`) and that
 * cannot run on an unresolved `var(--accent)`.
 */
const BRAND_TOKENS_TS_REL = path.join('src', 'theme', 'brand-tokens.ts');

/** OD token name → the field the MUI seed's `BrandTokens` calls it. */
const MUI_TOKEN_FIELDS: ReadonlyArray<readonly [string, string]> = [
  ['--accent', 'accent'],
  ['--accent-on', 'accentOn'],
  ['--accent-hover', 'accentHover'],
  ['--accent-active', 'accentActive'],
  ['--success', 'success'],
  ['--warn', 'warn'],
  ['--danger', 'danger'],
  ['--bg', 'bg'],
  ['--surface', 'surface'],
  ['--surface-warm', 'surfaceWarm'],
  ['--fg', 'fg'],
  ['--fg-2', 'fg2'],
  ['--font-body', 'fontBody'],
  ['--font-display', 'fontDisplay'],
  ['--radius-md', 'radiusMd'],
];

/**
 * Read the custom properties a brand declares for light mode.
 *
 * Only the FIRST `:root` block is read. A brand that ships a dark block
 * declares it in a later `:root` (or a media query) with the same property
 * names, and taking the last write would hand the theme a dark palette for its
 * light scheme. Exactly one of the 152 brands has such a block today, which is
 * precisely why this is easy to get wrong and worth pinning.
 */
export function parseRootTokens(css: string): Record<string, string> {
  const open = css.indexOf(':root');
  if (open === -1) return {};
  const brace = css.indexOf('{', open);
  const end = css.indexOf('}', brace);
  if (brace === -1 || end === -1) return {};
  // Strip comments across the whole block before splitting. Brands annotate
  // heavily and a comment sits either side of the semicolon — a section header
  // above a declaration would otherwise be read as part of its property name.
  const body = css.slice(brace + 1, end).replace(/\/\*[\s\S]*?\*\//g, '');
  const out: Record<string, string> = {};
  for (const decl of body.split(';')) {
    const at = decl.indexOf(':');
    if (at === -1) continue;
    const name = decl.slice(0, at).trim();
    if (!name.startsWith('--')) continue;
    const value = decl.slice(at + 1).trim().replace(/\s+/g, ' ');
    if (value.length > 0) out[name] = value;
  }
  return out;
}

/** Fields the MUI theme feeds to its colour maths, so they must be real colours. */
const MUI_COLOUR_FIELDS = new Set([
  'accent', 'accentOn', 'accentHover', 'accentActive',
  'success', 'warn', 'danger',
  'bg', 'surface', 'surfaceWarm', 'fg', 'fg2',
]);

/** What MUI's `decomposeColor` can actually read. */
const MUI_PARSABLE_COLOUR = /^(#|rgba?\(|hsla?\()/i;

/**
 * Follow `var(--x)` chains to a literal.
 *
 * 48 declarations across the brand packs are a bare alias — Slack's
 * `--surface-warm: var(--surface)`, for instance, saying "no warm tier here".
 * MUI needs the value those resolve to, not the reference.
 */
function resolveVarChain(value: string, tokens: Record<string, string>): string {
  let current = value;
  // Depth cap rather than cycle detection: brands alias one or two levels, and
  // a malformed cycle should degrade to "unusable", not hang.
  for (let i = 0; i < 5; i += 1) {
    const match = /^var\(\s*(--[a-z0-9-]+)\s*(?:,([^)]*))?\)$/i.exec(current.trim());
    if (!match) return current;
    const target = match[1] ? tokens[match[1]] : undefined;
    current = target ?? (match[2] ?? '').trim();
    if (!current) return '';
  }
  return current;
}

/**
 * Render the MUI seed's `brand-tokens.ts` from a brand's `tokens.css`.
 *
 * Colour fields that do not resolve to something MUI can parse are OMITTED
 * rather than passed through, so the seed's own derivation fills the gap. That
 * covers the 219 `color-mix()` declarations — most of them pressed states like
 * `color-mix(in oklab, var(--accent), black 8%)`, which is what deriving `dark`
 * from the accent already does — plus `oklch()`/`lab()`, which MUI cannot read
 * at all. Emitting them raised `Invalid hex color: var(--surface)` at module
 * evaluation and took the whole preview down.
 *
 * Returns null when the brand has no usable `--accent`: better to leave the
 * seed's defaults intact than to half-apply a brand.
 */
export function renderMuiBrandTokens(css: string): string | null {
  const tokens = parseRootTokens(css);
  const accent = resolveVarChain(tokens['--accent'] ?? '', tokens);
  if (!MUI_PARSABLE_COLOUR.test(accent)) return null;
  const lines: string[] = [];
  for (const [token, field] of MUI_TOKEN_FIELDS) {
    const raw = tokens[token];
    if (raw === undefined) continue;
    const isColour = MUI_COLOUR_FIELDS.has(field);
    const value = isColour ? resolveVarChain(raw, tokens) : raw;
    if (isColour && !MUI_PARSABLE_COLOUR.test(value)) continue;
    lines.push(`  ${field}: ${JSON.stringify(value)},`);
  }
  return [
    '// Generated at scaffold time from the picked design system\'s tokens.css.',
    '// Edit the design system, not this file — a re-scaffold overwrites it.',
    '//',
    '// Spread over the defaults rather than replacing them: a brand may omit a',
    '// token whose value MUI cannot read (color-mix(), oklch()), and an absent',
    '// field has to fall back rather than leave BrandTokens incomplete.',
    '',
    "import { DEFAULT_BRAND_TOKENS } from './brand-tokens-default';",
    "import type { BrandTokens } from './brand-tokens-type';",
    '',
    'export const brandTokens: BrandTokens = {',
    '  ...DEFAULT_BRAND_TOKENS,',
    ...lines,
    '};',
    '',
  ].join('\n');
}

/**
 * Resolve the active design system's `tokens.css` for `brandTokensCss`.
 *
 * Goes through the same seam the system prompt uses, so a generated project and
 * the prompt describing it can never disagree about which brand is active. Both
 * scaffold entry points — the run path and `POST /api/projects/:id/react/scaffold`
 * (plus `od react scaffold`) — call this, so the two surfaces stay identical per
 * the UI/CLI dual-track rule.
 */
export async function resolveBrandTokensCss(
  designSystemId: string | null | undefined,
  designSystemsDir: string | undefined,
  userDesignSystemsDir: string | undefined,
): Promise<string | undefined> {
  if (typeof designSystemId !== 'string' || designSystemId.length === 0) {
    return undefined;
  }
  // Never let a brand problem stop a project from being seeded. This threw once
  // — a caller passed roots its type promised but its object omitted, so
  // `path.join(undefined, …)` blew up and took the whole materialize with it,
  // leaving the agent to copy 400+ seed files by hand. An unbranded project is
  // a cosmetic loss; an unseeded one is a broken run.
  if (!designSystemsDir || !userDesignSystemsDir) {
    console.warn(
      `[react] design-system roots unavailable; skipping brand for ${designSystemId}`,
    );
    return undefined;
  }
  try {
    const assets = await resolveDesignSystemAssets(
      designSystemId,
      designSystemsDir,
      userDesignSystemsDir,
    );
    return assets.tokensCss;
  } catch (err) {
    console.warn(
      `[react] could not resolve tokens for ${designSystemId}: ${err instanceof Error ? err.message : String(err)}`,
    );
    return undefined;
  }
}

/**
 * Write the active design system's `tokens.css` over the seed's
 * `src/app/brand-tokens.css`, so a generated project actually wears the brand
 * the user picked.
 *
 * The token-consuming seeds document brand application in their `globals.css`
 * as "replace `brand-tokens.css` with that brand's `tokens.css` verbatim" —
 * which, until this existed, nothing did. The agent sometimes read that comment
 * and copied the file itself, so brands appeared to work; tightening the A2UI
 * instruction to "the spec is your only deliverable" removed that accident and
 * left every project on the seed's default palette. Applying the brand is the
 * system's job (D4 — per-customer variation *is* the tokens), not something to
 * hope an agent notices, so it happens here, deterministically.
 *
 * Two substrates read the brand two different ways, so this writes whichever
 * the seed actually has:
 *
 *   - shadcn seed → `src/app/brand-tokens.css`, the tokens verbatim, consumed
 *     as CSS custom properties by Tailwind utilities.
 *   - MUI seed → `src/theme/brand-tokens.ts`, the same tokens parsed into
 *     values, because that theme does alpha math they cannot stay symbolic for.
 *
 * Returns the design system id when either was written, else null — a seed with
 * neither file (the plain starters) is a legitimate no-op.
 */
async function applyBrandTokens(
  projectDir: string,
  designSystemId: string | null | undefined,
  brandTokensCss: string | null | undefined,
): Promise<string | null> {
  if (typeof brandTokensCss !== 'string' || brandTokensCss.length === 0) return null;
  let applied = false;

  const cssTarget = path.join(projectDir, BRAND_TOKENS_REL);
  if (existsSync(cssTarget)) {
    await writeFile(cssTarget, brandTokensCss, 'utf8');
    applied = true;
  }

  const tsTarget = path.join(projectDir, BRAND_TOKENS_TS_REL);
  if (existsSync(tsTarget)) {
    const rendered = renderMuiBrandTokens(brandTokensCss);
    if (rendered) {
      await writeFile(tsTarget, rendered, 'utf8');
      applied = true;
    }
  }

  return applied ? (designSystemId ?? null) : null;
}

function idleScaffoldState(
  input: MaterializeReactScaffoldInput,
  variant: ReactScaffoldVariant,
): ReactScaffoldState {
  return {
    projectId: input.projectId,
    framework: input.framework,
    variant,
    filesWritten: 0,
    skipped: false,
    source: null,
    brandTokensApplied: null,
    error: null,
  };
}

/**
 * Copy the seed tree into the project directory. Idempotent and non-clobbering:
 * if the project already has a package.json and `force` is not set, this is a
 * no-op (skipped=true) so re-running never overwrites the agent's work.
 */
export async function materializeReactScaffold(
  input: MaterializeReactScaffoldInput,
): Promise<ReactScaffoldState> {
  const variant = input.variant ?? 'minimal';
  const state = idleScaffoldState(input, variant);

  if (!input.force && projectHasFiles(input.projectDir)) {
    state.skipped = true;
    return state;
  }

  const resolved = resolveReactSeedDir(
    input.pluginAssetsRoot,
    input.framework,
    variant,
  );
  if (!resolved) {
    state.error = `no react seed found under ${input.pluginAssetsRoot} for ${input.framework}/${variant}`;
    return state;
  }

  try {
    const seedStat = await stat(resolved.dir);
    if (!seedStat.isDirectory()) {
      state.error = `seed path is not a directory: ${resolved.dir}`;
      return state;
    }
    // Recursive copy preserving dotfiles (.npmrc/.gitignore are part of the
    // seed). `force: true` here is the fs-level overwrite of identical files;
    // the project-level non-clobber guard already ran above. The filter keeps
    // local install/build output out of the project — see SEED_COPY_EXCLUDE.
    await cp(resolved.dir, input.projectDir, {
      recursive: true,
      force: true,
      errorOnExist: false,
      filter: (src) => !isExcludedSeedEntry(resolved.dir, src),
    });
    state.variant = resolved.variant;
    state.source = resolved.dir;
    state.filesWritten = await countFiles(resolved.dir);
    state.brandTokensApplied = await applyBrandTokens(
      input.projectDir,
      input.designSystemId,
      input.brandTokensCss,
    );
    return state;
  } catch (err) {
    state.error = err instanceof Error ? err.message : String(err);
    return state;
  }
}
