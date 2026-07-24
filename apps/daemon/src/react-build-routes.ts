// React-project build + dev HTTP routes (Milestones B & C).
//
// Static build (B):
//   `POST /api/projects/:id/react/build`        — start (or reuse) a build
//   `GET  /api/projects/:id/react/build`        — poll status + log
//   `POST /api/projects/:id/react/build/cancel` — cancel an in-flight build
//   `GET  /api/projects/:id/react/dist/*`       — serve the built dist tree
//
// Live dev server (C):
//   `POST /api/projects/:id/react/dev`          — start (or reuse) vite dev
//   `GET  /api/projects/:id/react/dev`          — poll status + url
//   `POST /api/projects/:id/react/dev/stop`     — stop the dev server
//
// All resolve the project's on-disk directory the same way the project detail
// route does, then delegate to the in-memory runners. Both surfaces (web
// preview panel, `od react …` CLI) call these endpoints — the daemon HTTP
// layer is the single source of truth per the UI/CLI dual-track rule.

import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Express } from 'express';
import type {
  ReactBuildPackageManager,
  ReactBuildStartRequest,
  ReactBuildCancelResponse,
  ReactBuildStartResponse,
  ReactBuildStatusResponse,
  ReactDevStartRequest,
  ReactDevStartResponse,
  ReactDevStatusResponse,
  ReactDevStopResponse,
  ReactScaffoldFramework,
  ReactScaffoldRequest,
  ReactScaffoldResponse,
  ReactScaffoldVariant,
} from '@open-design/contracts';
import { getInstalledPlugin } from './plugins/registry.js';
import { materializeReactScaffold } from './react-scaffold.js';

// The bundled scenario plugin that ships the react-project seed assets.
const REACT_PROJECT_PLUGIN_ID = 'example-react-project';
import type { RouteDeps } from './server-context.js';
import {
  cancelReactBuild,
  getReactBuildState,
  startReactBuild,
} from './react-build.js';
import {
  getReactDevState,
  startReactDev,
  stopReactDev,
} from './react-dev.js';
import { detectReactFramework, reactBuildOutDir } from './react-framework.js';

export interface RegisterReactBuildRoutesDeps
  extends RouteDeps<'db' | 'http' | 'paths' | 'projectStore' | 'projectFiles'> {}

function normalizePackageManager(
  value: unknown,
): ReactBuildPackageManager | undefined {
  return value === 'npm' || value === 'pnpm' || value === 'yarn'
    ? value
    : undefined;
}

export function registerReactBuildRoutes(
  app: Express,
  ctx: RegisterReactBuildRoutesDeps,
): void {
  const { db } = ctx;
  const { sendApiError } = ctx.http;
  const { PROJECTS_DIR } = ctx.paths;
  const { getProject } = ctx.projectStore;
  const { resolveProjectDir } = ctx.projectFiles;

  // Resolve the project's on-disk root, mirroring projectDetailResolvedDir in
  // project-routes.ts (absolute baseDir wins, else resolveProjectDir).
  function resolveDir(projectId: string): string | null {
    const project = getProject(db, projectId);
    if (!project) return null;
    const baseDir = typeof project?.metadata?.baseDir === 'string'
      ? path.normalize(project.metadata.baseDir)
      : null;
    if (baseDir && path.isAbsolute(baseDir)) return baseDir;
    return resolveProjectDir(PROJECTS_DIR, project.id, project.metadata, {
      allowUnavailableSandboxImportedProject: true,
    });
  }

  app.post('/api/projects/:id/react/build', async (req, res) => {
    const dir = resolveDir(req.params.id);
    if (!dir) {
      sendApiError(res, 404, 'NOT_FOUND', 'project not found');
      return;
    }
    const body = (req.body ?? {}) as ReactBuildStartRequest;
    const state = startReactBuild({
      projectId: req.params.id,
      projectDir: dir,
      packageManager: normalizePackageManager(body.packageManager),
      clean: body.clean === true,
    });
    const response: ReactBuildStartResponse = { state };
    res.json(response);
  });

  app.get('/api/projects/:id/react/build', async (req, res) => {
    const dir = resolveDir(req.params.id);
    if (!dir) {
      sendApiError(res, 404, 'NOT_FOUND', 'project not found');
      return;
    }
    const response: ReactBuildStatusResponse = {
      state: getReactBuildState(req.params.id),
    };
    res.json(response);
  });

  app.post('/api/projects/:id/react/build/cancel', async (req, res) => {
    const dir = resolveDir(req.params.id);
    if (!dir) {
      sendApiError(res, 404, 'NOT_FOUND', 'project not found');
      return;
    }
    const response: ReactBuildCancelResponse = {
      state: cancelReactBuild(req.params.id),
    };
    res.json(response);
  });

  // Serve the built dist/ tree so the preview iframe can load
  // dist/index.html with its relative ./assets URLs resolved (Vite's
  // base: './'). Empty splat → index.html.
  app.get('/api/projects/:id/react/dist/*splat', async (req, res) => {
    const dir = resolveDir(req.params.id);
    if (!dir) {
      sendApiError(res, 404, 'NOT_FOUND', 'project not found');
      return;
    }
    const splatParam = (req.params as { splat?: string | string[] }).splat;
    const rel = Array.isArray(splatParam)
      ? splatParam.join('/')
      : String(splatParam ?? '');
    // Serve from the framework's actual output dir (Vite `dist/`, Next
    // static-export `out/`); the `/react/dist/*` URL stays stable either way.
    const distRoot = path.join(dir, reactBuildOutDir(detectReactFramework(dir)));
    const target = path.resolve(distRoot, rel || 'index.html');
    // Confine to the build output — reject path traversal.
    if (target !== distRoot && !target.startsWith(distRoot + path.sep)) {
      sendApiError(res, 403, 'FORBIDDEN', 'path escapes build output');
      return;
    }
    if (!existsSync(target)) {
      sendApiError(res, 404, 'NOT_FOUND', 'not built yet');
      return;
    }
    res.sendFile(target);
  });

  // --- Live dev server (Milestone C) ---

  app.post('/api/projects/:id/react/dev', async (req, res) => {
    const dir = resolveDir(req.params.id);
    if (!dir) {
      sendApiError(res, 404, 'NOT_FOUND', 'project not found');
      return;
    }
    const body = (req.body ?? {}) as ReactDevStartRequest;
    const state = startReactDev({
      projectId: req.params.id,
      projectDir: dir,
      packageManager: normalizePackageManager(body.packageManager),
    });
    const response: ReactDevStartResponse = { state };
    res.json(response);
  });

  app.get('/api/projects/:id/react/dev', async (req, res) => {
    const dir = resolveDir(req.params.id);
    if (!dir) {
      sendApiError(res, 404, 'NOT_FOUND', 'project not found');
      return;
    }
    const response: ReactDevStatusResponse = {
      state: getReactDevState(req.params.id),
    };
    res.json(response);
  });

  app.post('/api/projects/:id/react/dev/stop', async (req, res) => {
    const dir = resolveDir(req.params.id);
    if (!dir) {
      sendApiError(res, 404, 'NOT_FOUND', 'project not found');
      return;
    }
    const response: ReactDevStopResponse = {
      state: stopReactDev(req.params.id),
    };
    res.json(response);
  });

  // --- Scaffold materialization ---
  // Copy the bundled react-project seed (minimal MUI by default) into the
  // project directory. Runs automatically at react-project run start; also
  // reachable here + via `od react scaffold` for manual (re-)materialization.
  app.post('/api/projects/:id/react/scaffold', async (req, res) => {
    const dir = resolveDir(req.params.id);
    if (!dir) {
      sendApiError(res, 404, 'NOT_FOUND', 'project not found');
      return;
    }
    const body = (req.body ?? {}) as ReactScaffoldRequest;
    const framework: ReactScaffoldFramework =
      body.framework === 'next' ? 'next' : 'vite';
    const variant: ReactScaffoldVariant =
      body.variant === 'plain' ? 'plain' : 'minimal';
    const plugin = getInstalledPlugin(db, REACT_PROJECT_PLUGIN_ID);
    if (!plugin?.fsPath) {
      sendApiError(
        res,
        500,
        'PLUGIN_MISSING',
        `${REACT_PROJECT_PLUGIN_ID} plugin not installed`,
      );
      return;
    }
    const state = await materializeReactScaffold({
      projectId: req.params.id,
      projectDir: dir,
      pluginAssetsRoot: path.join(plugin.fsPath, 'assets'),
      framework,
      variant,
      force: body.force === true,
    });
    const response: ReactScaffoldResponse = { state };
    res.json(response);
  });
}
