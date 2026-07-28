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
| Files added (ours) | ~830 |
| Upstream files **modified** | 10 |
| Lines in those modifications | **+226 / −2** |
| Upstream files **deleted** | 0 |

Every modification is an *insertion at an existing extension point* — a union
member, a switch case, one route registration, one JSX branch, a brand-token
registration. No upstream logic was restructured.

**Preserve this property.** When a change appears to need upstream code
reshaped, look for the extension point first; if there genuinely isn't one,
prefer adding a new file over reshaping an existing one.

### The upstream files we touch, and why

| File | Why |
| --- | --- |
| `apps/daemon/src/server.ts` | register `registerReactBuildRoutes`, beside the existing `registerBrandRoutes` call |
| `apps/daemon/src/routes/runs.ts` | seed a react-project before its first agent turn |
| `apps/web/src/components/FileWorkspace.tsx` | render `ReactBuildPanel` for react-projects |
| `apps/web/src/providers/daemon.ts` | react build/dev API client (+114, append-only) |
| `packages/contracts/src/index.ts` | export `api/react.js` (1 line) |
| `packages/contracts/src/api/projects.ts` | `ProjectKind` gains `'react-project'` |
| `packages/contracts/src/plugins/scenario-defaults.ts` | bind that kind to the `example-react-project` scenario |
| `packages/contracts/src/analytics/events/shared-enums.ts` | `TrackingProjectKind` gains `'react_project'` |
| `packages/contracts/src/analytics/events/mappers.ts` | map product kind → analytics kind |
| `packages/contracts/src/design-systems/token-schema.ts` | register `mui-minimal`'s tokens with upstream's token guard |

## What we added

| Area | What |
| --- | --- |
| react-project pipeline | `apps/daemon/src/react-{scaffold,build,dev,framework,build-routes}.ts` — scaffold a real project tree, run its dev server, run its build |
| Seeds | `plugins/_official/examples/react-project/assets/{minimal-next,minimal-next-a2ui,minimal-vite,scaffold,scaffold-next}` |
| A2UI core | inside the `minimal-next-a2ui` seed: `src/genui/` (schema, renderer, registry), `src/blocks/` (31 blocks), `src/authoring/` (Zod gate + catalog), the `/a2ui` route, `a2ui-spec.json` |
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
