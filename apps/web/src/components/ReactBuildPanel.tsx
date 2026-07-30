import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ReactBuildState,
  ReactBuildStatus,
  ReactDevState,
  ReactDevStatus,
} from '@open-design/contracts';
import { Button } from '@open-design/components';
import {
  cancelReactBuild,
  fetchReactBuildState,
  startReactBuild,
  fetchReactDevState,
  startReactDev,
  stopReactDev,
  reactDistUrl,
} from '../providers/daemon';
import styles from './ReactBuildPanel.module.css';

// Preview panel for `react-project` kind projects.
//   Live (Milestone C):  daemon runs `vite dev`; the iframe loads its URL with
//                        HMR, so edits reflect instantly.
//   Build (Milestone B): daemon runs `vite build`; the iframe loads the static
//                        dist/ output served by the daemon.
// react-project previews default to Live. Mounted by ProjectView only when
// project.metadata.kind === 'react-project'.

type Mode = 'live' | 'build';

// Keep a dev server running only while its preview is being viewed. When the
// panel unmounts (the user leaves the Preview tab / switches project / closes
// it) we stop the dev server after a grace window — long enough that real work
// in the Files/Design tabs (reading source, editing a design file) doesn't kill
// the preview out from under the user, short enough that genuinely abandoned
// projects don't pile up dev servers (each `next dev`/`vite` burns CPU on
// file-watch + recompiles, which starves the main thread and lags the app).
// A 15s window was too aggressive: a brief tab switch silently stopped vite and
// the preview came back blank. Five minutes covers normal tab-hopping while
// still reaping servers the user has clearly walked away from.
const DEV_IDLE_GRACE_MS = 5 * 60_000;
const pendingDevStops = new Map<string, number>();

function buildRunning(s: ReactBuildStatus): boolean {
  return s === 'installing' || s === 'building';
}
function devPending(s: ReactDevStatus): boolean {
  return s === 'installing' || s === 'starting';
}

const BUILD_LABEL: Record<ReactBuildStatus, string> = {
  idle: 'Not built yet',
  installing: 'Installing…',
  building: 'Building…',
  succeeded: 'Built',
  failed: 'Failed',
  canceled: 'Canceled',
};
const DEV_LABEL: Record<ReactDevStatus, string> = {
  stopped: 'Stopped',
  installing: 'Installing…',
  starting: 'Starting…',
  running: 'Live',
  failed: 'Failed',
};

export function ReactBuildPanel({
  projectId,
  // Route the preview lands on, relative to the dev server / dist root. A plain
  // react-project's deliverable is its `/` page, but an A2UI project's is the
  // `/a2ui` route that reads `a2ui-spec.json` — showing `/` there previews the
  // seed's stock dashboard and hides the screen the agent was asked to build.
  previewPath = '',
}: {
  projectId: string;
  previewPath?: string;
}) {
  const [mode, setMode] = useState<Mode>('live');
  const [build, setBuild] = useState<ReactBuildState | null>(null);
  const [dev, setDev] = useState<ReactDevState | null>(null);
  const [showLog, setShowLog] = useState(false);
  const buildPollRef = useRef<number | null>(null);
  const devPollRef = useRef<number | null>(null);
  const devStartedRef = useRef(false);

  const stopBuildPoll = useCallback(() => {
    if (buildPollRef.current !== null) {
      window.clearInterval(buildPollRef.current);
      buildPollRef.current = null;
    }
  }, []);
  const stopDevPoll = useCallback(() => {
    if (devPollRef.current !== null) {
      window.clearInterval(devPollRef.current);
      devPollRef.current = null;
    }
  }, []);

  // Auto-start the dev server the first time we land on a react-project, so
  // the default Live preview "just appears" without the user clicking.
  useEffect(() => {
    devStartedRef.current = false;
    let alive = true;
    void fetchReactDevState(projectId).then((s) => {
      if (!alive) return;
      if (s) setDev(s);
      if (!s || s.status === 'stopped' || s.status === 'failed') {
        devStartedRef.current = true;
        void startReactDev(projectId).then((started) => {
          if (alive && started) setDev(started);
        });
      } else {
        devStartedRef.current = true;
      }
    });
    void fetchReactBuildState(projectId).then((s) => {
      if (alive && s) setBuild(s);
    });
    return () => {
      alive = false;
      stopBuildPoll();
      stopDevPoll();
    };
  }, [projectId, stopBuildPoll, stopDevPoll]);

  // Latest dev status, readable from the unmount closure below.
  const devStatusRef = useRef<ReactDevStatus>('stopped');
  devStatusRef.current = dev?.status ?? 'stopped';

  // Stop the dev server when this preview is no longer being viewed. We're
  // viewing now, so cancel any pending stop for this project; on unmount,
  // schedule a stop after a grace window (cancelled if the panel remounts).
  // Crucially we only idle-stop a server that is actually `running` — never
  // abort an in-progress install/start, or a fresh-clone `npm install` (which
  // can take a while) would be killed every time the user switches tabs and
  // node_modules would never finish.
  useEffect(() => {
    const pending = pendingDevStops.get(projectId);
    if (pending != null) {
      window.clearTimeout(pending);
      pendingDevStops.delete(projectId);
    }
    return () => {
      if (devStatusRef.current !== 'running') return;
      const timer = window.setTimeout(() => {
        pendingDevStops.delete(projectId);
        void stopReactDev(projectId);
      }, DEV_IDLE_GRACE_MS);
      pendingDevStops.set(projectId, timer);
    };
  }, [projectId]);

  // Poll dev while it is coming up.
  useEffect(() => {
    if (dev && devPending(dev.status)) {
      if (devPollRef.current === null) {
        devPollRef.current = window.setInterval(() => {
          void fetchReactDevState(projectId).then((s) => s && setDev(s));
        }, 1200);
      }
    } else {
      stopDevPoll();
    }
  }, [dev, projectId, stopDevPoll]);

  // Poll build while it is running.
  useEffect(() => {
    if (build && buildRunning(build.status)) {
      if (buildPollRef.current === null) {
        buildPollRef.current = window.setInterval(() => {
          void fetchReactBuildState(projectId).then((s) => s && setBuild(s));
        }, 1500);
      }
    } else {
      stopBuildPoll();
    }
  }, [build, projectId, stopBuildPoll]);

  const onBuild = useCallback(
    async (clean: boolean) => {
      setMode('build');
      const s = await startReactBuild(projectId, { clean });
      if (s) setBuild(s);
    },
    [projectId],
  );

  const onCancelBuild = useCallback(async () => {
    const s = await cancelReactBuild(projectId);
    if (s) setBuild(s);
  }, [projectId]);

  const onRestartDev = useCallback(async () => {
    await stopReactDev(projectId);
    const s = await startReactDev(projectId);
    if (s) setDev(s);
  }, [projectId]);

  const devStatus: ReactDevStatus = dev?.status ?? 'stopped';
  const buildStatus: ReactBuildStatus = build?.status ?? 'idle';

  // Resolve what the preview iframe should show for the active mode.
  let previewUrl: string | null = null;
  let placeholder: string | null = null;
  // Live only. `dev.url` ends in `/`, so strip the leading slash rather than
  // producing `//a2ui`. Build mode deliberately ignores previewPath: it serves
  // `dist/index.html` (not a directory root, so appending would yield
  // `index.htmla2ui`), and `/a2ui` is `force-dynamic` anyway — it reads
  // `a2ui-spec.json` per request, so a static build cannot represent it.
  const previewSuffix = previewPath.replace(/^\/+/, '');
  if (mode === 'live') {
    if (devStatus === 'running' && dev?.url) previewUrl = dev.url + previewSuffix;
    else if (devStatus === 'failed') placeholder = dev?.error ?? 'Dev server failed to start.';
    else placeholder = DEV_LABEL[devStatus] + '…';
  } else {
    if (buildStatus === 'succeeded') previewUrl = reactDistUrl(projectId);
    else if (buildStatus === 'failed') placeholder = build?.error ?? 'Build failed.';
    else if (buildRunning(buildStatus)) placeholder = BUILD_LABEL[buildStatus];
    else placeholder = 'Press Build & Preview to compile a static preview.';
  }

  const log = (mode === 'live' ? dev?.log : build?.log)?.slice(-200) ?? [];

  return (
    <section className={styles.panel} aria-label="React preview">
      <header className={styles.header}>
        <div className={styles.toggle} role="tablist" aria-label="Preview mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'live'}
            className={mode === 'live' ? styles.toggleActive : styles.toggleBtn}
            onClick={() => setMode('live')}
          >
            <span className={styles.liveDot} data-on={devStatus === 'running'} />
            Live
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'build'}
            className={mode === 'build' ? styles.toggleActive : styles.toggleBtn}
            onClick={() => setMode('build')}
          >
            Build
          </button>
        </div>

        <span className={styles.status} data-status={mode === 'live' ? devStatus : buildStatus}>
          {mode === 'live' ? DEV_LABEL[devStatus] : BUILD_LABEL[buildStatus]}
        </span>

        <div className={styles.actions}>
          {mode === 'live' ? (
            <Button
              variant="subtle"
              onClick={() => void onRestartDev()}
              disabled={devPending(devStatus)}
            >
              {devStatus === 'failed' ? 'Retry' : 'Restart'}
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                onClick={() => void onBuild(false)}
                disabled={buildRunning(buildStatus)}
              >
                {buildRunning(buildStatus) ? 'Building…' : 'Build & Preview'}
              </Button>
              <Button
                variant="subtle"
                onClick={() => void onBuild(true)}
                disabled={buildRunning(buildStatus)}
              >
                Clean
              </Button>
              {buildRunning(buildStatus) ? (
                <Button variant="ghost" onClick={() => void onCancelBuild()}>
                  Cancel
                </Button>
              ) : null}
            </>
          )}
          {previewUrl ? (
            <a className={styles.openExternal} href={previewUrl} target="_blank" rel="noreferrer">
              Open ↗
            </a>
          ) : null}
          <button
            type="button"
            className={styles.logToggle}
            onClick={() => setShowLog((v) => !v)}
            aria-pressed={showLog}
          >
            {showLog ? 'Hide log' : 'Log'}
          </button>
        </div>
      </header>

      <div className={styles.previewArea}>
        {previewUrl ? (
          <iframe
            key={previewUrl}
            className={styles.previewFrame}
            src={previewUrl}
            title="React project preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
          />
        ) : (
          <div className={styles.placeholder}>{placeholder}</div>
        )}
      </div>

      {showLog && log.length > 0 ? (
        <pre className={styles.log}>{log.join('\n')}</pre>
      ) : null}
    </section>
  );
}
