# Status and next steps

_Last updated: 2026-07-28._

## Where we are

The fork is re-based onto upstream v0.16.1, the react-project pipeline is wired
end to end **in code**, and A2UI is a selectable variant.

| Capability | State |
| --- | --- |
| Everything upstream does | untouched |
| Generate a runnable React/Next project | code complete — scaffold + dev server + build + API routes |
| A2UI spec authoring (hard-gated) | code complete — renderer, 31-block catalog, Zod gate, `/a2ui` route, authoring skill |
| Pick enforcement at creation (`plain` / `minimal` / `a2ui`) | code complete |
| Live preview in the workspace | code complete — `ReactBuildPanel` renders for react-projects |
| Upstream tracking | working — real fork, small append-only contact surface |

**Verified:** `pnpm --filter @open-design/{contracts,daemon,web} typecheck` and
`pnpm guard` all pass.

**Not verified:** none of it has been exercised by actually running the daemon.
See "Next" below — that is the single most valuable next action.

## What is deliberately not here

**The workflow-side screen node.** The full product spans two repos:

```
robiflow (Dify fork)              robi-design-studio (this repo)
  screen node   ── new tab ──▶      A2UI authoring + preview
      ▲                                     │
      └──────── postMessage signal ─────────┘
```

This repo is the right-hand half. The screen node in `robiflow` is **not
started**. That said, this repo stands alone: creating an A2UI screen and
previewing it needs nothing from `robiflow`.

## Next

### 1. Run it (highest value, unblocks everything else)

```bash
pnpm install     # if this is a fresh clone
pnpm tools-dev
```

Then create a react-project with `variant = A2UI` and watch the loop:
project created → seed materialised on the first run → agent writes
`a2ui-spec.json` → `/a2ui` gate-validates and renders → `ReactBuildPanel` shows
the live preview.

Specifically unverified and worth watching:

- does the agent actually emit a catalog-valid spec, or does it drift?
- does the first-run seed land (it is idempotent — it skips when the project
  already has a `package.json`)?
- does `/a2ui` render in the browser?

Whatever breaks here **is** the remaining work list.

### 2. Build the design-rule linter (D5's missing half)

D5 defines pass/fail as *gate **and** linter*. The linter does not exist. Until
it does, a screen can pass the gate while still looking unlike its siblings —
the gate checks structural validity, not design consistency. Rules to encode:
one primary button per screen, primary-color share, typography hierarchy,
pattern blocks preferred over primitives.

### 3. Measure whether generation is consistent at all (the product premise)

The premise of the whole design is that a fixed catalog removes author
variance. That has not been measured. The cheap experiment: generate the same
requirement N=10 times, then compute how often the top-level skeleton
(`nodes[root].children.map(type)`) matches.

- If it is already highly consistent, the linter matters less than assumed.
- If it is wildly inconsistent, a prop-level linter cannot close the gap and
  archetype selection has to move *before* generation.

Do this on first-attempt output with retries disabled — the retry loop
converges by construction and would flatter the result.

### 4. Smaller follow-ups

- **Chart `bar` renders blank.** A pre-existing incompatibility between
  `apexcharts@5.15.0` / `react-apexcharts@1.9.0` and the vendored
  `src/components/chart` wrapper's container measurement — **not** caused by
  the A2UI port (a hook-free literal bar chart reproduces it). A loading guard
  and memoisation reduced the error class; a version pin is the real fix.
  Line, area, donut and sparkline are fine.
- **Data hooks are mock-backed.** A2UI's data-bound blocks resolve a `hook`
  name from `src/genui/hook-registry.ts`, currently the `useCustomers` mock.
  Real workflow-API schema injection (D2) replaces this.
