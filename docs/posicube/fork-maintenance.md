# Fork maintenance

## Branches

| Branch | Role |
| --- | --- |
| `main` | **Upstream mirror only.** Never commit here. GitHub's "Sync fork" keeps it fast-forwardable. |
| `posicube-main` | **Our product default branch** (the GitHub default). Feature branches merge here. |
| `feat/*` | Working branches. |

### Syncing upstream

```bash
# once per clone
git remote add upstream https://github.com/nexu-io/open-design.git

git fetch upstream
git checkout main && git merge --ff-only upstream/main && git push
git checkout posicube-main && git merge main
```

The merge into `posicube-main` should be near-conflict-free by construction —
see the contact surface below.

## Why this is a real fork now

The predecessor, `fe-open-design-minimal-theme`, was a **file snapshot** of
open-design v0.9.0 committed as a fresh history: zero commits in common with
upstream and no `upstream` remote, so `git merge` was impossible. It stayed at
v0.9.0 while upstream reached v0.16.1. `robi-design-studio` is a genuine GitHub
fork of `nexu-io/open-design`, so upstream tracking actually works.

The customizations were re-applied onto upstream v0.16.1 rather than copied
wholesale — several were dropped on the way (see "What we removed").

## Contact surface with upstream — keep it small

The value of this fork is that it stays mergeable. As of the re-base:

| Metric | Value |
| --- | --- |
| Files added (ours) | 1,283 |
| Upstream files **modified** | 37 — of which **20 are i18n** |
| Lines in those modifications | **+643 / −5** (i18n: +180, everything else: +463 / −5) |
| Upstream files **deleted** | 0 |

Measured 2026-07-30 with `git diff --numstat --diff-filter=M
a7e205939..posicube-main`. Measure against **the upstream commit actually
merged**, not `upstream/main` — that ref moves, and diffing a newer
`upstream/main` makes upstream's own later edits look like deletions on our
side.

Every modification is an *insertion at an existing extension point* — a union
member, a switch case, one route registration, one JSX branch, a brand-token
registration. No upstream logic was restructured.

**Read the file count with the i18n split in mind.** 20 of the 37 are the 19
locale files plus `i18n/types.ts`, and they are touched purely because
`types.ts` is a typed `Dict`: every user-facing string we add costs 20 upstream
file touches and cannot be avoided (a missing locale is a typecheck error, per
the root `AGENTS.md`). They are pure key insertions and have never conflicted.
The number that actually predicts merge pain is the **17 non-i18n files** —
keep *that* small.

**Preserve this property.** When a change appears to need upstream code
reshaped, look for the extension point first; if there genuinely isn't one,
prefer adding a new file over reshaping an existing one.

### The upstream files we touch, and why

| File | Why |
| --- | --- |
| `apps/daemon/src/server.ts` | register `registerReactBuildRoutes`, beside the existing `registerBrandRoutes` call |
| `apps/daemon/src/routes/runs.ts` | seed a react-project before its first agent turn |
| `apps/web/src/components/FileWorkspace.tsx` | `REACT_PREVIEW_TAB` — a root tab hosting `ReactBuildPanel`, plus its tab button, default-tab entry and one line in the persisted-tab fallback guard |
| `apps/web/src/components/FileViewer.tsx` | skip upstream's single-file `react-component` Babel renderer for react-projects (see below) |
| `apps/web/src/components/HomeHero.tsx` | 4 chip-description cases |
| `apps/web/src/components/home-hero/chips.ts` | the 4 react-project chips, the `namesProject` field, and their slots in `CREATE_RAIL_ORDER` |
| `apps/web/src/components/home-hero/chip-labels.ts` | 4 chip-label cases |
| `apps/web/src/components/HomeView.tsx` | one line so a chip with `namesProject` names the project after itself instead of after the shared plugin title |
| `apps/web/src/providers/daemon.ts` | react build/dev API client (+114, append-only) |
| `apps/web/src/i18n/types.ts` + 19 `locales/*.ts` | 9 keys × 20 files — chip labels/descriptions and the preview tab label |
| `packages/contracts/src/index.ts` | export `api/react.js` (1 line) |
| `packages/contracts/src/api/projects.ts` | `ProjectKind` gains `'react-project'` |
| `packages/contracts/src/plugins/scenario-defaults.ts` | bind that kind to the `example-react-project` scenario |
| `packages/contracts/src/analytics/events/shared-enums.ts` | `TrackingProjectKind` gains `'react_project'` |
| `packages/contracts/src/analytics/events/mappers.ts` | map product kind → analytics kind |
| `packages/contracts/src/design-systems/token-schema.ts` | register `mui-minimal`'s tokens with upstream's token guard |
| `CLAUDE.md` | append the pointer to `docs/posicube/` (upstream's content untouched above it) |
| `.gitignore` | ignore `.omc/` and `.serena/` agent scratch; appended in a trailing posicube block so upstream's future appends land above ours |

### Why the react-project preview needs two of those touches

Upstream has one JSX preview path, `react-component`: a **self-contained** file,
imports rewritten to CDN globals, transpiled by Babel standalone in a sandboxed
iframe. A file inside a react-project is the opposite — a module of a real
multi-file app whose imports its own bundler resolves. Sending one down that path
produces nonsense; `import { z } from 'zod'` came out as `const { z } from 'zod'`
and the pane showed a SyntaxError instead of the screen. So `FileViewer` skips
that renderer for `react_project` (source view instead), and `FileWorkspace` hosts
the real preview — the dev server — on its own root tab.

The root tab matters more than it looks. An earlier revision hung the preview off
the main viewer under `!activeFile || .html || dist/`, which meant that the moment
the agent opened a `.tsx` it had just written — i.e. for the entire generation, the
one time you most want to watch the app — the pane fell through to `FileViewer`.
The predecessor repo had this right with a dedicated tab; the re-base narrowed it
and lost the behaviour without recording the loss. If you find yourself gating the
preview on which file is open, that is the same mistake.

## What we added

| Area | What |
| --- | --- |
| react-project pipeline | `apps/daemon/src/react-{scaffold,build,dev,framework,build-routes}.ts` — scaffold a real project tree, run its dev server, run its build |
| Seeds | `plugins/_official/examples/react-project/assets/{minimal-next,minimal-next-a2ui,shadcn-next-a2ui,minimal-vite,scaffold,scaffold-next}` — all six ship a lockfile and pass `npm ci` (see `generated-project-stack.md`) |
| A2UI core | inside each a2ui seed: `src/genui/` (schema, renderer, registry), `src/authoring/` (Zod gate + catalog), `src/blocks/` (30 blocks + the `unknown-node` fallback), the `/a2ui` route, `a2ui-spec.json`. `shadcn-next-a2ui` carries `genui/` and `authoring/` **byte-identical** to `minimal-next-a2ui` — only the blocks differ — which is why one spec renders on both. |
| Authoring skill | `design-templates/a2ui-spec/SKILL.md` |
| Design system | `design-systems/mui-minimal/` |
| Web UI | `apps/web/src/components/ReactBuildPanel.tsx` |
| Contracts | `packages/contracts/src/api/react.ts` |

## What we removed, and why

Carried in the old snapshot, deliberately **not** brought over. Do not re-add
without a reason that survives the same checks.

| Removed | Evidence |
| --- | --- |
| `mui-packages/` (1,808 files, 16 MB) | Not in `pnpm-workspace.yaml`; zero imports; zero references anywhere; its `src/theme` was **byte-identical** to the seed's. It also carried committed agent scratch under `.omc/state/sessions/`, which the root `AGENTS.md` forbids in git. |
| `design-systems/untitled-ui/` | A lone `DESIGN.md` with no catalog or registry behind it; nothing referenced it. |
| `OpenFileInEditorButton` | Upstream already ships `HandoffButton` over `openProjectInEditor`/`fetchHostEditors`. Keeping ours was the *only* reason we had modified the host-tools route and contract, `providers/registry`, and the i18n dictionary — all reverted to upstream verbatim. |
| `GenerationPreviewStage` + `runtime/generation-preview.ts` | Upstream redesigned retry/recovery into `ChatPane`'s error card; reviving the v0.9.0 component would duplicate that redesign. |

The governing rule: **if upstream already does it, use upstream's.** Ours stays
only for what upstream lacks. The same rule decided `DesignSystemPicker` and
`WorkingDirPicker` — upstream's are used, our older variants were dropped.

## Contributing back

The react-project pipeline is the strongest upstream candidate: upstream
v0.16.1 still cannot scaffold, dev-serve, or build a real multi-file React/Next
project — its `react-component` artifact is a single JSX string rendered
through CDN Babel in a sandboxed iframe. If you propose it upstream, follow the
root `AGENTS.md` three-surface rule (HTTP route + web UI + `od` CLI subcommand
in the same PR).
