# Packaging and internal distribution

How to produce an installer people can double-click, and what they have to know
when they get it.

## Identity

This fork ships as **robi Design Studio**, not as Open Design. That is not
cosmetic: four surfaces identify an install, and sharing any of them with
upstream's build means two apps fighting over the same slot.

| Surface | Value |
| --- | --- |
| `appId` | `io.posicube.robi-design-studio` |
| macOS bundle | `robi Design Studio.app` |
| Windows uninstall key | `…\Uninstall\robi Design Studio-<namespace>` |
| IPC socket / pipe | `/tmp/robi-design-studio/ipc/<namespace>` |

Apache-2.0 §6 grants no trademark rights, so shipping a fork under upstream's
name would have been the weaker reading anyway.

## Version

`0.16.1-posicube.1` — upstream's version, plus our build number.

Read it as "upstream 0.16.1, first internal build on top". Merging upstream
bumps the base and the counter restarts (`0.17.0-posicube.1`). Both halves of
the question — *which upstream are we on* and *how many internal builds since* —
are answerable from the string alone.

**Do not put `beta`, `betas`, `preview` or `prerelease` in the version.**
`releaseChannelFromVersion` matches those words anywhere in the string and
switches the app's whole identity: product name, appId, and which updater feed
it reads. `posicube` matches nothing, which is why it is safe.

The version lives in three `package.json` files — root, `apps/desktop`, and
`apps/packaged` — and they must agree.

## Building

Each platform builds on its own machine. There is no cross-compilation path:
upstream's own release pipeline uses a macOS runner for mac and a Windows runner
for Windows, and the Windows build rewrites the `.exe` version resource, which is
a Windows-native operation.

```bash
# macOS — run on a Mac
pnpm tools-pack mac build --to dmg
pnpm exec tsx scripts/posicube/release-artifact.ts mac

# Windows — run on a Windows PC
pnpm tools-pack win build --to nsis
pnpm exec tsx scripts/posicube/release-artifact.ts win
```

`release-artifact.ts` copies the finished artifact into `dist/release/` under a
name carrying the version and architecture:

```
robi-design-studio-0.16.1-posicube.1-arm64.dmg
robi-design-studio-0.16.1-posicube.1-x64-setup.exe
```

It renames on the way out rather than changing what the build produces, because
`tools-pack`'s install, start, uninstall and smoke commands all locate artifacts
by re-deriving the build-time name in each platform's `paths.ts`. Renaming at the
source means changing that pattern in a dozen coupled places.

Both facts in the name earn their keep. Without the version, a second download
lands as `… (1).dmg` and nobody can tell which is current. Without the
architecture, someone on an Intel Mac takes the arm64 build and reports only that
it will not open.

### A seed with `node_modules` breaks the build

If anyone has run an install inside `plugins/_official/examples/react-project/assets/*`,
delete it before packaging:

```bash
rm -rf plugins/_official/examples/react-project/assets/*/node_modules
```

Those trees are copied into the bundle, and `node_modules/.bin` entries are
absolute symlinks into the developer's checkout — electron-builder rejects the
bundle with `invalid destination for symbolic link in bundle`. The packaging copy
now filters them out (`EXCLUDED_RESOURCE_ENTRIES` in `tools/pack/src/resources.ts`,
mirroring the daemon's `SEED_COPY_EXCLUDE`), so this should not recur; the manual
step is here for older checkouts.

A build that *succeeded* with them would have been worse — shipping tens of
thousands of stale files pinned to whatever one machine resolved.

## What the recipient has to do

Two steps, and both generate support questions if they are not written down.

### 1. The build is unsigned

`--signed` is off by default, and signing needs an Apple Developer account
(macOS) and a code-signing certificate (Windows).

- **macOS** — Gatekeeper blocks it. Right-click the app → **Open**, then confirm.
  Double-clicking will not work the first time.
- **Windows** — SmartScreen warns. **More info → Run anyway.**

For internal distribution this is a line in the announcement, not a blocker. If
it becomes one, `--signed` removes it.

### 2. An agent CLI must be installed and signed in

The packaged app carries the daemon and the web UI, but **not** an agent. The
daemon discovers agent CLIs on `PATH`, so without one there is nothing to run a
job. Installing Claude Code and signing in is a prerequisite, not an optional
extra.

This does not go away by hosting the app somewhere — the agent runs wherever the
daemon runs. On each person's own machine it is at least their own account and
their own budget.

## Why desktop rather than a hosted web app

The daemon is single-tenant by design: it spawns processes, owns a filesystem
data root, and has no user concept. Add to that the preview, which loads
`http://127.0.0.1:<port>` — the daemon's loopback, not the browser's — and a
remote browser cannot reach it at all.

Hosting is possible, but through isolation rather than a rewrite: one daemon per
user (container or VM), plus a proxy so the daemon serves its own dev-server
ports. That work belongs with the `robiflow` integration, which has not started.
Until then, desktop is both simpler and safer.
