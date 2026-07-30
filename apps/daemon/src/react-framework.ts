// React-project framework detection + per-framework command/output config.
//
// A react-project is either a Vite + React project or a Next.js project. The
// user picks the framework at creation time (the `framework` plugin input),
// the agent generates the matching project tree, and the daemon detects which
// one it got by inspecting the project files — no metadata plumbing. Both the
// dev-server runner (react-dev.ts) and the static-build runner (react-build.ts)
// branch their commands and output locations through this module so there is a
// single source of truth for "what does each framework run, and where does it
// emit its preview entry".

import type { ReactBuildPackageManager } from '@open-design/contracts';

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export type ReactFramework = 'vite' | 'next';

// ---- dependency install -----------------------------------------------------

/**
 * `frozen` installs exactly what the lockfile says and fails if package.json has
 * drifted from it. `update` is the permissive install that resolves ranges and
 * rewrites the lockfile.
 */
export type ReactInstallMode = 'frozen' | 'update';

const LOCKFILE_BY_PM: Record<ReactBuildPackageManager, string> = {
  npm: 'package-lock.json',
  pnpm: 'pnpm-lock.yaml',
  yarn: 'yarn.lock',
};

const FROZEN_ARGS: Record<ReactBuildPackageManager, readonly string[]> = {
  npm: ['ci'],
  pnpm: ['install', '--frozen-lockfile'],
  yarn: ['install', '--immutable'],
};

/**
 * Resolve how to install a project's dependencies.
 *
 * Seeds ship a lockfile precisely so two projects generated weeks apart get the
 * same tree — but a plain `install` resolves the `^` ranges in package.json and
 * rewrites that lockfile, which is how a dependency silently moves under a
 * generated project (the `apexcharts` bar-chart regression in
 * `docs/posicube/status.md` is one of these). So prefer the frozen install
 * whenever a lockfile is present.
 *
 * When no lockfile exists there is nothing to be faithful to, so fall back to
 * the permissive install rather than failing the project.
 */
export function reactInstallCommand(
  pm: ReactBuildPackageManager,
  projectDir: string,
): { args: string[]; mode: ReactInstallMode; reason: string } {
  const lockfile = LOCKFILE_BY_PM[pm];
  if (existsSync(path.join(projectDir, lockfile))) {
    return { args: [...FROZEN_ARGS[pm]], mode: 'frozen', reason: `${lockfile} present` };
  }
  return { args: ['install'], mode: 'update', reason: `no ${lockfile}` };
}

/**
 * The permissive retry for a frozen install that failed. A frozen install also
 * fails when package.json and the lockfile genuinely disagree — which happens
 * legitimately when the agent adds a dependency mid-turn — and refusing to build
 * in that case would be worse than losing pinning for that one project. Callers
 * log which path ran so a silent downgrade is still visible.
 */
export function reactInstallFallbackCommand(): { args: string[]; mode: ReactInstallMode } {
  return { args: ['install'], mode: 'update' };
}

const NEXT_CONFIG_FILES = [
  'next.config.ts',
  'next.config.js',
  'next.config.mjs',
  'next.config.cjs',
] as const;

/**
 * Detect the framework of an on-disk react-project. A `next.config.*` file is
 * the strongest signal; failing that, a `next` dependency in package.json. Any
 * project without those markers is treated as Vite (the default scaffold), so
 * detection degrades safely toward the original Milestone B/C behavior.
 */
export function detectReactFramework(projectDir: string): ReactFramework {
  for (const file of NEXT_CONFIG_FILES) {
    if (existsSync(path.join(projectDir, file))) return 'next';
  }
  try {
    const raw = readFileSync(path.join(projectDir, 'package.json'), 'utf8');
    const pkg = JSON.parse(raw) as {
      dependencies?: Record<string, unknown>;
      devDependencies?: Record<string, unknown>;
    };
    if (pkg.dependencies?.next || pkg.devDependencies?.next) return 'next';
  } catch {
    // missing/unparseable package.json → fall through to Vite default.
  }
  return 'vite';
}

/**
 * The dev-server binary (under `node_modules/.bin`) and its argv for a given
 * framework and port. Both Vite and Next bind a single long-lived process we
 * can kill directly. Vite: `vite --port P --strictPort --host 127.0.0.1`.
 * Next: `next dev --port P --hostname 127.0.0.1`.
 */
export function reactDevCommand(
  framework: ReactFramework,
  port: number,
): { bin: string; args: string[] } {
  if (framework === 'next') {
    return {
      bin: 'next',
      args: ['dev', '--port', String(port), '--hostname', '127.0.0.1'],
    };
  }
  return {
    bin: 'vite',
    args: ['--port', String(port), '--strictPort', '--host', '127.0.0.1'],
  };
}

/**
 * Directory (project-root-relative) the framework's production build writes to:
 * Vite emits `dist/`, Next static export (`output: 'export'`) emits `out/`.
 */
export function reactBuildOutDir(framework: ReactFramework): string {
  return framework === 'next' ? 'out' : 'dist';
}

/** Project-root-relative path to the built preview entry HTML. */
export function reactBuildOutEntry(framework: ReactFramework): string {
  return path.join(reactBuildOutDir(framework), 'index.html');
}
