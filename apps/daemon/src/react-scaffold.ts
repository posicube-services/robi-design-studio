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
  designSystemsDir: string,
  userDesignSystemsDir: string,
): Promise<string | undefined> {
  if (typeof designSystemId !== 'string' || designSystemId.length === 0) {
    return undefined;
  }
  const assets = await resolveDesignSystemAssets(
    designSystemId,
    designSystemsDir,
    userDesignSystemsDir,
  );
  return assets.tokensCss;
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
 * Returns the design system id when applied, else null. A no-op when the seed
 * has no `brand-tokens.css` (the MUI seeds take their palette from a JS theme)
 * or the caller resolved no tokens.
 */
async function applyBrandTokens(
  projectDir: string,
  designSystemId: string | null | undefined,
  brandTokensCss: string | null | undefined,
): Promise<string | null> {
  if (typeof brandTokensCss !== 'string' || brandTokensCss.length === 0) return null;
  const target = path.join(projectDir, BRAND_TOKENS_REL);
  if (!existsSync(target)) return null;
  await writeFile(target, brandTokensCss, 'utf8');
  return designSystemId ?? null;
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
