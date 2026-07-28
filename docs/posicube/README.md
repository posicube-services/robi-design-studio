# Posicube fork — start here

This directory is **posicube-owned documentation**. Upstream (`nexu-io/open-design`)
has no `docs/posicube/` path, so nothing here can collide when we sync upstream.
Keep every posicube-specific note in this directory for that reason.

If you are an agent or a new engineer opening this repo, read this file first,
then the one that matches what you are about to do.

| Document | Read it when |
| --- | --- |
| [`fork-maintenance.md`](./fork-maintenance.md) | Syncing upstream, branching, or wondering what we changed vs upstream |
| [`architecture-decisions.md`](./architecture-decisions.md) | Touching A2UI, the react-project pipeline, or asking "why is it built this way" |
| [`status.md`](./status.md) | Picking up work — what is done, what is unverified, what is next |
| [`history/`](./history/) | Wanting the original requirements interview and the re-base plan verbatim |

## What this repo is, in one paragraph

`robi-design-studio` is Posicube's fork of Open Design. It keeps everything
upstream does, and adds one capability upstream lacks: generating a **real,
runnable multi-file React/Next project** (upstream only renders a single JSX
file in a sandboxed iframe). On top of that project pipeline it adds **A2UI** —
a spec-driven authoring mode where the agent composes a validated JSON spec
from a fixed component catalog instead of writing JSX, so screens come out
consistent regardless of who generated them.

## The one idea that explains most decisions

Design enforcement is a **dial, not a switch**. A project picks its strength at
creation time through the `variant` input:

| variant | Component vocabulary | Enforcement |
| --- | --- | --- |
| `plain` | none — agent writes what it likes | soft: the active design system's `tokens.css` |
| `minimal` | MUI Minimal component library | medium: components fixed, composition free |
| `a2ui` | MUI Minimal **+ fixed spec catalog** | hard: Zod gate rejects anything off-catalog |

`a2ui` is Next.js-only (its renderer is a Next app); a Vite request degrades to
`minimal` and reports the variant it actually got.

## Working agreement for this fork

1. **Never restructure upstream code.** Add at extension points (union members,
   switch cases, route registration, JSX branches). See `fork-maintenance.md`
   for the current contact surface — keep it small on purpose.
2. **Posicube docs go in `docs/posicube/`.** Never in root `AGENTS.md` or
   upstream doc paths.
3. Upstream's own rules still apply — read the root `AGENTS.md` before touching
   `apps/`, `packages/`, `tools/`, or `e2e/`.
