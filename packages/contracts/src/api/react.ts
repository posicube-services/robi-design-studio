// React-project build contract (Milestone B).
//
// The daemon installs dependencies and runs `vite build` for a project whose
// kind is `react-project` (see `ProjectKind` in `./projects.ts`), then serves
// the built `dist/index.html` to the in-app static preview. Builds are
// ephemeral process work, so the daemon keeps build state in memory (one job
// per project) rather than in SQLite — re-running a build replaces the state.
//
// Both surfaces consume these types: the web Build & Preview panel and the
// `od react build` CLI hit the same `/api/projects/:id/react/build` endpoints.

export type ReactBuildPackageManager = 'npm' | 'pnpm' | 'yarn';

export type ReactBuildStatus =
  // No build has run for this project yet (or daemon restarted — state is
  // in-memory and not persisted).
  | 'idle'
  // `<pm> install` is running.
  | 'installing'
  // `<pm> run build` (vite build) is running.
  | 'building'
  // Build finished and `dist/index.html` exists.
  | 'succeeded'
  // install or build exited non-zero, or dist was missing.
  | 'failed'
  // The user cancelled the in-flight build.
  | 'canceled';

export interface ReactBuildState {
  projectId: string;
  status: ReactBuildStatus;
  packageManager: ReactBuildPackageManager;
  // Combined stdout+stderr lines from install + build, in order. Bounded by
  // the daemon to a recent window so a noisy build can't grow unbounded.
  log: string[];
  // Project-root-relative path to the built entry HTML when the build
  // succeeded (e.g. `dist/index.html`); null otherwise.
  distEntry: string | null;
  // Short human-readable failure reason when status is `failed`; null
  // otherwise.
  error: string | null;
  // Epoch ms. `startedAt` is null only for the synthetic `idle` state.
  startedAt: number | null;
  finishedAt: number | null;
}

export interface ReactBuildStartRequest {
  // Defaults to the package manager declared in the project's package.json
  // scripts context, else `npm`.
  packageManager?: ReactBuildPackageManager;
  // When true, remove any existing `dist/` (and skip the install step if
  // node_modules already exists is decided daemon-side). Default false.
  clean?: boolean;
}

export interface ReactBuildStartResponse {
  state: ReactBuildState;
}

export interface ReactBuildStatusResponse {
  state: ReactBuildState;
}

export interface ReactBuildCancelResponse {
  state: ReactBuildState;
}

// ---------------------------------------------------------------------------
// React-project dev server (Milestone C — live HMR preview).
//
// Instead of a one-shot `vite build`, the daemon runs `<pm> run dev` (vite
// dev server) on an ephemeral loopback port and keeps it alive. The web
// preview iframe loads that URL directly, so editing `src/**` reflects
// instantly via HMR — no rebuild. One dev server per project; the daemon
// kills it on stop, on project switch, and on daemon shutdown.
//
// react-project previews default to this `live` mode; the static
// `vite build` → dist path remains available via a toggle and the
// `/react/build` endpoints above.
// ---------------------------------------------------------------------------

export type ReactDevStatus =
  // No dev server for this project.
  | 'stopped'
  // `<pm> install` is running before the server can start.
  | 'installing'
  // `vite dev` spawned, waiting for the port to accept connections.
  | 'starting'
  // Dev server is up; `url` is loadable.
  | 'running'
  // install or `vite dev` exited / failed to come up.
  | 'failed';

export interface ReactDevState {
  projectId: string;
  status: ReactDevStatus;
  packageManager: ReactBuildPackageManager;
  // Loopback URL the preview iframe should load when `running`
  // (e.g. `http://127.0.0.1:54123/`); null otherwise.
  url: string | null;
  // Ephemeral port the dev server bound to; null until known.
  port: number | null;
  // Recent combined stdout+stderr lines, bounded by the daemon.
  log: string[];
  error: string | null;
  startedAt: number | null;
}

export interface ReactDevStartRequest {
  packageManager?: ReactBuildPackageManager;
}

export interface ReactDevStartResponse {
  state: ReactDevState;
}

export interface ReactDevStatusResponse {
  state: ReactDevState;
}

export interface ReactDevStopResponse {
  state: ReactDevState;
}

// ---------------------------------------------------------------------------
// React-project scaffold materialization.
//
// A react-project is generated on top of a bundled seed. Two seed families
// exist per framework: `minimal` (the curated MUI "minimal" design system —
// theme + layouts + a useful component set) and `plain` (a tiny Vite/Next
// starter). The seeds for `minimal` run to ~150 files, far more than an agent
// can copy by hand, so the daemon materializes the seed tree into the project
// directory — either automatically at run start (react-project kind) or
// explicitly via `POST /api/projects/:id/react/scaffold` and the matching
// `od react scaffold` CLI. Both surfaces share these types.
// ---------------------------------------------------------------------------

export type ReactScaffoldFramework = 'vite' | 'next';

// `minimal` = curated MUI minimal design system seed (default for new
// react-projects, so generated UI is consistent). `plain` = the lightweight
// starter seed.
export type ReactScaffoldVariant = 'minimal' | 'plain';

export interface ReactScaffoldRequest {
  framework: ReactScaffoldFramework;
  // Defaults to `minimal` (falls back to `plain` if the minimal seed is not
  // present in the plugin assets).
  variant?: ReactScaffoldVariant;
  // Overwrite/merge into a non-empty project directory. Default false: the
  // daemon skips materialization when the project already has a package.json,
  // so a re-run never clobbers the agent's edits.
  force?: boolean;
}

export interface ReactScaffoldState {
  projectId: string;
  framework: ReactScaffoldFramework;
  variant: ReactScaffoldVariant;
  // Number of files copied into the project (0 when skipped).
  filesWritten: number;
  // True when the project already had files and `force` was not set.
  skipped: boolean;
  // Absolute path of the seed asset directory used; null when skipped or no
  // seed was found.
  source: string | null;
  error: string | null;
}

export interface ReactScaffoldResponse {
  state: ReactScaffoldState;
}
