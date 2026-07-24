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
//   minimal-vite/   minimal-next/   ← curated MUI minimal seeds (default)
//   scaffold/       scaffold-next/  ← lightweight `plain` starters (fallback)

import { existsSync } from 'node:fs';
import { cp, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import type {
  ReactScaffoldFramework,
  ReactScaffoldState,
  ReactScaffoldVariant,
} from '@open-design/contracts';

/** Seed asset directory name for a framework + variant. */
function seedDirName(
  framework: ReactScaffoldFramework,
  variant: ReactScaffoldVariant,
): string {
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
  if (variant === 'minimal') {
    const fallback = path.join(pluginAssetsRoot, seedDirName(framework, 'plain'));
    if (existsSync(fallback)) return { dir: fallback, variant: 'plain' };
  }
  return null;
}

/** Count files (not directories) under a tree, recursively. */
async function countFiles(dir: string): Promise<number> {
  let total = 0;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += await countFiles(full);
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
    // the project-level non-clobber guard already ran above.
    await cp(resolved.dir, input.projectDir, {
      recursive: true,
      force: true,
      errorOnExist: false,
    });
    state.variant = resolved.variant;
    state.source = resolved.dir;
    state.filesWritten = await countFiles(resolved.dir);
    return state;
  } catch (err) {
    state.error = err instanceof Error ? err.message : String(err);
    return state;
  }
}
