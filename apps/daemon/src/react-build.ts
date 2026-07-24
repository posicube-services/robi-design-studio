// React-project build runner (Milestone B).
//
// Installs dependencies and runs `vite build` for a `react-project` kind
// project, streaming combined stdout/stderr into an in-memory job so the web
// Build & Preview panel and the `od react build` CLI can poll progress. Build
// state is deliberately NOT persisted: it is ephemeral process work, one job
// per project, and a daemon restart simply drops it (re-run to rebuild).
//
// Uses `node:child_process` rather than the node-pty terminal stack — install
// and build are non-interactive, so a plain spawn keeps this off the native
// PTY dependency.

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import type {
  ReactBuildPackageManager,
  ReactBuildState,
} from '@open-design/contracts';
import {
  detectReactFramework,
  reactBuildOutDir,
  reactBuildOutEntry,
} from './react-framework.js';

// Keep only the most recent lines so a chatty build cannot grow the log
// unbounded in memory.
const MAX_LOG_LINES = 600;

interface ActiveBuild {
  state: ReactBuildState;
  child: ChildProcess | null;
  canceled: boolean;
}

const builds = new Map<string, ActiveBuild>();

function idleState(
  projectId: string,
  packageManager: ReactBuildPackageManager = 'npm',
): ReactBuildState {
  return {
    projectId,
    status: 'idle',
    packageManager,
    log: [],
    distEntry: null,
    error: null,
    startedAt: null,
    finishedAt: null,
  };
}

/** Current build state for a project, or a synthetic idle state if none. */
export function getReactBuildState(projectId: string): ReactBuildState {
  return builds.get(projectId)?.state ?? idleState(projectId);
}

function isRunning(state: ReactBuildState): boolean {
  return state.status === 'installing' || state.status === 'building';
}

/**
 * Detect which package manager owns the project tree. Running the wrong one
 * is not a soft mismatch: `npm install` on a pnpm-created `node_modules`
 * (symlinked `.pnpm` layout) crashes npm outright ("Cannot read properties
 * of null (reading 'matches')"). Agent-generated react-projects routinely
 * ship a `pnpm-lock.yaml` because the agent installed with pnpm during
 * generation, so the explicit request wins, then the `packageManager` field,
 * then the lockfile on disk, then npm.
 */
export function detectReactBuildPackageManager(
  projectDir: string,
): ReactBuildPackageManager {
  try {
    const raw = readFileSync(path.join(projectDir, 'package.json'), 'utf8');
    const pm = (JSON.parse(raw) as { packageManager?: unknown }).packageManager;
    if (typeof pm === 'string') {
      if (pm.startsWith('pnpm')) return 'pnpm';
      if (pm.startsWith('yarn')) return 'yarn';
      if (pm.startsWith('npm')) return 'npm';
    }
  } catch {
    // missing/unparseable package.json falls through to lockfile sniffing;
    // the build itself will surface the real error.
  }
  if (existsSync(path.join(projectDir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(path.join(projectDir, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

/**
 * Child env for install/build steps. The daemon itself is usually launched
 * through `pnpm tools-dev`, which leaks `npm_*` lifecycle/config vars
 * (npm_config_*, npm_lifecycle_*, …) into `process.env`. Those describe the
 * DAEMON's package context, not the generated project's — npm prints
 * "Unknown env config" warnings for them and they can poison registry or
 * workspace resolution. Strip the whole prefix.
 */
export function buildChildEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (/^npm_/i.test(key)) continue;
    env[key] = value;
  }
  return env;
}

function appendLog(active: ActiveBuild, chunk: string): void {
  const lines = chunk.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) return;
  const next = [...active.state.log, ...lines];
  active.state.log = next.length > MAX_LOG_LINES
    ? next.slice(next.length - MAX_LOG_LINES)
    : next;
}

function markFailed(active: ActiveBuild, reason: string): void {
  active.child = null;
  active.state.status = 'failed';
  active.state.error = reason;
  active.state.finishedAt = Date.now();
}

export interface StartReactBuildInput {
  projectId: string;
  /** Absolute path to the project root (resolved by the caller). */
  projectDir: string;
  packageManager?: ReactBuildPackageManager | undefined;
  /** Remove an existing `dist/` before building. */
  clean?: boolean | undefined;
}

/**
 * Start (or reuse) a build for a project. If a build is already in flight the
 * current state is returned unchanged — one job per project. The actual work
 * runs detached; callers poll `getReactBuildState`.
 */
export function startReactBuild(input: StartReactBuildInput): ReactBuildState {
  const existing = builds.get(input.projectId);
  if (existing && isRunning(existing.state)) {
    return existing.state;
  }

  const packageManager =
    input.packageManager ?? detectReactBuildPackageManager(input.projectDir);
  const active: ActiveBuild = {
    state: {
      projectId: input.projectId,
      status: 'installing',
      packageManager,
      log: [],
      distEntry: null,
      error: null,
      startedAt: Date.now(),
      finishedAt: null,
    },
    child: null,
    canceled: false,
  };
  builds.set(input.projectId, active);
  void runBuild(active, input);
  return active.state;
}

/** Cancel an in-flight build. No-op if nothing is running. */
export function cancelReactBuild(projectId: string): ReactBuildState {
  const active = builds.get(projectId);
  if (!active) return idleState(projectId);
  if (isRunning(active.state)) {
    active.canceled = true;
    active.child?.kill();
    active.child = null;
    active.state.status = 'canceled';
    active.state.finishedAt = Date.now();
  }
  return active.state;
}

async function runBuild(active: ActiveBuild, input: StartReactBuildInput): Promise<void> {
  const { projectDir } = input;
  const pm = active.state.packageManager;
  const framework = detectReactFramework(projectDir);
  const outDir = reactBuildOutDir(framework);
  const outEntry = reactBuildOutEntry(framework);
  try {
    if (input.clean) {
      await rm(path.join(projectDir, outDir), { recursive: true, force: true });
    }

    appendLog(active, `$ ${pm} install`);
    const installOk = await runStep(active, pm, ['install'], projectDir);
    if (active.canceled) return;
    if (!installOk) {
      markFailed(active, `${pm} install failed`);
      return;
    }

    active.state.status = 'building';
    appendLog(active, `$ ${pm} run build`);
    const buildOk = await runStep(active, pm, ['run', 'build'], projectDir);
    if (active.canceled) return;
    if (!buildOk) {
      markFailed(active, `${pm} run build failed`);
      return;
    }

    if (!existsSync(path.join(projectDir, outEntry))) {
      markFailed(
        active,
        framework === 'next'
          ? `build did not produce ${outEntry} — set output: 'export' in next.config for a static preview`
          : `build did not produce ${outEntry}`,
      );
      return;
    }

    active.child = null;
    active.state.status = 'succeeded';
    active.state.distEntry = outEntry;
    active.state.finishedAt = Date.now();
  } catch (err) {
    markFailed(active, err instanceof Error ? err.message : String(err));
  }
}

function runStep(
  active: ActiveBuild,
  command: string,
  args: string[],
  cwd: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    // `shell: true` on win32 so `npm`/`pnpm`/`yarn` resolve their `.cmd`
    // shims; POSIX resolves the bare binary from PATH.
    const child = spawn(command, args, {
      cwd,
      env: buildChildEnv(),
      shell: process.platform === 'win32',
    });
    active.child = child;
    child.stdout?.on('data', (data: Buffer) => appendLog(active, data.toString()));
    child.stderr?.on('data', (data: Buffer) => appendLog(active, data.toString()));
    child.on('error', (error: Error) => {
      appendLog(active, `[error] ${error.message}`);
      resolve(false);
    });
    child.on('close', (code: number | null) => {
      if (active.child === child) active.child = null;
      resolve(code === 0);
    });
  });
}

/** Test/maintenance helper: drop all in-memory build state. */
export function __resetReactBuilds(): void {
  builds.clear();
}
