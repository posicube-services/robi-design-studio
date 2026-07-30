// React-project dev server runner (Milestone C — live HMR preview).
//
// Runs `vite` dev on an ephemeral loopback port and keeps it alive so the web
// preview iframe can load it directly (HMR included). One server per project.
// State is in-memory like react-build.ts; a daemon restart drops everything.
//
// We spawn the project's own `node_modules/.bin/vite` binary directly rather
// than `<pm> run dev`, so the dev server is a SINGLE process we can reliably
// kill — `npm run dev` would fork npm → vite and leave an orphan vite holding
// the port. react-project scaffolds always ship vite as a devDependency
// (the skill makes vite the contract), so `.bin/vite` is expected to exist
// after install; if it doesn't, the dev server fails with a clear message
// rather than degrading to a process we can't cleanly stop.

import { spawn, type ChildProcess } from 'node:child_process';
import { createServer, connect } from 'node:net';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type {
  ReactBuildPackageManager,
  ReactDevState,
} from '@open-design/contracts';
import {
  buildChildEnv,
  detectReactBuildPackageManager,
} from './react-build.js';
import {
  detectReactFramework,
  reactDevCommand,
  reactInstallCommand,
  reactInstallFallbackCommand,
} from './react-framework.js';

const MAX_LOG_LINES = 400;
const READY_TIMEOUT_MS = 60_000;
const READY_POLL_MS = 300;

interface ActiveDev {
  state: ReactDevState;
  child: ChildProcess | null;
  stopped: boolean;
}

const servers = new Map<string, ActiveDev>();

// Kill every spawned vite dev server when the daemon process exits, so a
// crash or Ctrl-C doesn't leave orphan servers holding loopback ports.
// Registered lazily on first start; `exit` handlers must be synchronous, and
// child.kill() is a synchronous signal send.
let exitHookInstalled = false;
function installExitHook(): void {
  if (exitHookInstalled) return;
  exitHookInstalled = true;
  process.on('exit', () => stopAllReactDev());
}

// Kill a dev server and its whole process group. `next dev` forks a
// `next-server` worker that ignores a SIGTERM sent only to the parent, so we
// SIGKILL the negative pid (the process group created by `detached: true`).
// Falls back to a direct kill on win32 / if the group send fails.
function killProcessTree(child: ChildProcess | null): void {
  if (!child || child.pid == null) return;
  if (process.platform !== 'win32') {
    try {
      process.kill(-child.pid, 'SIGKILL');
      return;
    } catch {
      /* group gone or never created — fall through to direct kill */
    }
  }
  try {
    child.kill('SIGKILL');
  } catch {
    /* already dead */
  }
}

function stoppedState(
  projectId: string,
  packageManager: ReactBuildPackageManager = 'npm',
): ReactDevState {
  return {
    projectId,
    status: 'stopped',
    packageManager,
    url: null,
    port: null,
    log: [],
    error: null,
    startedAt: null,
  };
}

export function getReactDevState(projectId: string): ReactDevState {
  return servers.get(projectId)?.state ?? stoppedState(projectId);
}

function isLive(state: ReactDevState): boolean {
  return (
    state.status === 'installing' ||
    state.status === 'starting' ||
    state.status === 'running'
  );
}

function appendLog(active: ActiveDev, chunk: string): void {
  const lines = chunk.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) return;
  const next = [...active.state.log, ...lines];
  active.state.log =
    next.length > MAX_LOG_LINES ? next.slice(next.length - MAX_LOG_LINES) : next;
}

function markFailed(active: ActiveDev, reason: string): void {
  if (active.state.status === 'running') return; // already serving; ignore late noise
  active.child = null;
  active.state.status = 'failed';
  active.state.error = reason;
}

/** Reserve a free loopback TCP port by binding to 0 then releasing it. */
function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      srv.close(() => (port ? resolve(port) : reject(new Error('no port'))));
    });
  });
}

/** Resolve once the port accepts a TCP connection, or reject on timeout. */
function waitForPort(port: number, signal: { stopped: boolean }): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (signal.stopped) return reject(new Error('stopped'));
      if (Date.now() > deadline) return reject(new Error('dev server did not become ready in time'));
      const sock = connect(port, '127.0.0.1');
      sock.once('connect', () => {
        sock.destroy();
        resolve();
      });
      sock.once('error', () => {
        sock.destroy();
        setTimeout(tick, READY_POLL_MS);
      });
    };
    tick();
  });
}

/**
 * Install dependencies, preferring the lockfile-faithful command. A frozen
 * install that fails is retried permissively — see `reactInstallFallbackCommand`
 * — and both attempts are logged so the downgrade is visible in the preview
 * panel's Log rather than silent.
 */
async function runInstall(
  active: ActiveDev,
  pm: ReactBuildPackageManager,
  cwd: string,
): Promise<boolean> {
  const first = reactInstallCommand(pm, cwd);
  appendLog(active, `[install] ${first.mode} (${first.reason})`);
  if (await spawnInstall(active, pm, first.args, cwd)) return true;
  if (first.mode !== 'frozen') return false;

  const retry = reactInstallFallbackCommand();
  appendLog(
    active,
    `[install] frozen install failed — retrying with \`${pm} ${retry.args.join(' ')}\`. `
      + 'package.json and the lockfile disagree; regenerate the lockfile to restore pinning.',
  );
  return spawnInstall(active, pm, retry.args, cwd);
}

function spawnInstall(
  active: ActiveDev,
  pm: string,
  args: string[],
  cwd: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    appendLog(active, `$ ${pm} ${args.join(' ')}`);
    const child = spawn(pm, args, {
      cwd,
      env: buildChildEnv(),
      shell: process.platform === 'win32',
    });
    active.child = child;
    child.stdout?.on('data', (d: Buffer) => appendLog(active, d.toString()));
    child.stderr?.on('data', (d: Buffer) => appendLog(active, d.toString()));
    child.on('error', (e: Error) => {
      appendLog(active, `[error] ${e.message}`);
      resolve(false);
    });
    child.on('close', (code: number | null) => {
      if (active.child === child) active.child = null;
      resolve(code === 0);
    });
  });
}

export interface StartReactDevInput {
  projectId: string;
  projectDir: string;
  packageManager?: ReactBuildPackageManager | undefined;
}

/**
 * Start (or reuse) the dev server for a project. If one is already live the
 * current state is returned unchanged. Work runs detached; callers poll
 * `getReactDevState`.
 */
export function startReactDev(input: StartReactDevInput): ReactDevState {
  const existing = servers.get(input.projectId);
  if (existing && isLive(existing.state)) return existing.state;

  // One RUNNING dev server at a time: stop every OTHER project's running
  // server before starting this one. Live previews auto-start on view, so
  // hopping between react-project tabs would otherwise pile up dev servers
  // (each `next dev` / `vite` burns CPU on file-watch + recompiles, starving
  // the UI thread). We skip servers that are still installing/starting so a
  // fresh-clone `npm install` is never aborted mid-flight.
  for (const [otherId, other] of servers) {
    if (otherId === input.projectId) continue;
    if (other.state.status === 'installing' || other.state.status === 'starting') continue;
    stopReactDev(otherId);
  }

  const packageManager =
    input.packageManager ?? detectReactBuildPackageManager(input.projectDir);
  const active: ActiveDev = {
    state: {
      projectId: input.projectId,
      status: 'starting',
      packageManager,
      url: null,
      port: null,
      log: [],
      error: null,
      startedAt: Date.now(),
    },
    child: null,
    stopped: false,
  };
  installExitHook();
  servers.set(input.projectId, active);
  void runDev(active, input.projectDir);
  return active.state;
}

async function runDev(active: ActiveDev, projectDir: string): Promise<void> {
  const pm = active.state.packageManager;
  try {
    // node_modules must exist for vite to run; install first if absent.
    if (!existsSync(path.join(projectDir, 'node_modules'))) {
      active.state.status = 'installing';
      const ok = await runInstall(active, pm, projectDir);
      if (active.stopped) return;
      if (!ok) {
        markFailed(active, `${pm} install failed`);
        return;
      }
    }

    active.state.status = 'starting';
    const port = await findFreePort();
    if (active.stopped) return;
    active.state.port = port;

    const framework = detectReactFramework(projectDir);
    const { bin, args } = reactDevCommand(framework, port);
    const devBin = path.join(
      projectDir,
      'node_modules',
      '.bin',
      process.platform === 'win32' ? `${bin}.cmd` : bin,
    );
    if (!existsSync(devBin)) {
      markFailed(
        active,
        `${bin} binary not found in node_modules/.bin — did install succeed for this ${framework} project?`,
      );
      return;
    }
    appendLog(active, `$ ${bin} ${args.join(' ')}`);
    const child = spawn(devBin, args, {
      cwd: projectDir,
      env: buildChildEnv(),
      shell: process.platform === 'win32',
      // Own process group (POSIX) so we can reap the WHOLE tree on stop —
      // `next dev` spawns a `next-server` worker that survives a plain
      // SIGTERM to the parent, orphaning the dev server. See killProcessTree.
      detached: process.platform !== 'win32',
    });
    active.child = child;
    child.stdout?.on('data', (d: Buffer) => appendLog(active, d.toString()));
    child.stderr?.on('data', (d: Buffer) => appendLog(active, d.toString()));
    child.on('error', (e: Error) => {
      appendLog(active, `[error] ${e.message}`);
      markFailed(active, e.message);
    });
    child.on('close', (code: number | null) => {
      if (active.child === child) active.child = null;
      // A close while we thought we were running means the server died.
      if (!active.stopped && active.state.status !== 'failed') {
        if (active.state.status === 'running') {
          active.state.status = 'stopped';
        } else {
          markFailed(active, `${bin} dev exited (code ${code ?? 'null'})`);
        }
      }
    });

    await waitForPort(port, active);
    if (active.stopped) return;
    active.state.status = 'running';
    active.state.url = `http://127.0.0.1:${port}/`;
  } catch (err) {
    if (active.stopped) return;
    markFailed(active, err instanceof Error ? err.message : String(err));
  }
}

/** Stop the dev server for a project. No-op if nothing is live. */
export function stopReactDev(projectId: string): ReactDevState {
  const active = servers.get(projectId);
  if (!active) return stoppedState(projectId);
  active.stopped = true;
  killProcessTree(active.child);
  active.child = null;
  active.state.status = 'stopped';
  active.state.url = null;
  return active.state;
}

/** Kill every dev server. Call on daemon shutdown to avoid orphan ports. */
export function stopAllReactDev(): void {
  for (const active of servers.values()) {
    active.stopped = true;
    killProcessTree(active.child);
    active.child = null;
    active.state.status = 'stopped';
    active.state.url = null;
  }
  servers.clear();
}
