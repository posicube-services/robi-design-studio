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

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export type ReactFramework = 'vite' | 'next';

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
