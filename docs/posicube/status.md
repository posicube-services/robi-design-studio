# Status and next steps

_Last updated: 2026-07-28._

## Where we are

The fork tracks upstream at `a7e205939` (v0.16.1 + 29 commits, merged
2026-07-28), the react-project pipeline is wired end to end, and A2UI is a
selectable variant. **The A2UI loop has now been run against a live daemon** —
see "Verified by running it" below.

| Capability | State |
| --- | --- |
| Everything upstream does | untouched |
| Generate a runnable React/Next project | working — verified against a live daemon |
| A2UI spec authoring (hard-gated) | working — renderer, 30-block catalog, Zod gate, `/a2ui` route, authoring skill |
| Pick enforcement at creation (`plain` / `minimal` / `a2ui`) | code complete — only `a2ui` has been exercised |
| Live preview in the workspace | working — own root tab (`REACT_PREVIEW_TAB`), verified in the browser; A2UI projects preview `/a2ui`, not `/` |
| Upstream tracking | working — 29-commit merge produced exactly one conflict (`.gitignore`) |

Upstream moved again during that same session (`89d6d4ef2`, one commit past what
we merged). Nothing urgent; it is noted so the next sync starts from a known
point rather than a surprise.

**Verified statically:** `pnpm guard` and `pnpm typecheck` pass on the
post-merge tree.

### Verified by running it

Run on 2026-07-28 with `pnpm tools-dev run web --daemon-port 17456
--web-port 17573`, mock agents on `PATH` (`mocks/bin`) so no provider budget
was spent. Each step below was observed, not inferred:

| Step | Evidence |
| --- | --- |
| `react-project` kind auto-binds the scenario | `POST /api/projects` returned an `appliedPluginSnapshotId` with no explicit `pluginId` — our `scenario-defaults.ts` insertion resolves |
| First-run seed materialises | `POST /api/runs` produced 1,872 source files including all 30 blocks, `a2ui-spec.json`, the Zod gate and the `/a2ui` route |
| Dev server starts | `POST /api/projects/:id/react/dev` → `npm install` (160 pkgs, 9s) → `next dev` → `status: running` on a daemon-assigned port |
| `/a2ui` renders the spec | HTTP 200; every visible string from `a2ui-spec.json` (`문의 접수`, `이메일`, `접수내역`, …) present in the SSR HTML; MUI `Table`/`TextField`/`Button`/`Card` classes emitted; zero `Unknown node type` diagnostics; only console error was a favicon 404 |
| The gate really is hard | `validateSpec` **accepted** the shipped spec and **rejected** an off-catalog node type (`RawHtmlInjection`), a dangling `root` ref, and a missing `version` |

### The first real-agent run (2026-07-30) — one finding that matters

Asked for a signup screen, a real agent produced a working A2UI screen. It also
**edited `src/authoring/catalog.ts` and `src/blocks/form.tsx`**, adding a
`password` field type plus `minLength` and `matchField`.

The gate did not fail; it was **moved**. `validateSpec` checks a spec against the
catalog, so once the catalog is edited the spec passes *by construction*. D5's
"pass/fail is decided mechanically" has a hole: the mechanism's own definition sat
inside the agent's writable workspace.

Fair to the agent: its *diagnosis* was right — a signup form genuinely cannot be
expressed without a password field, and its implementation was good (consent-switch
handling, cross-field match via `superRefine`, password masked in the success
summary). What was wrong was the *action*. A catalog gap has to surface, not get
patched locally, or nothing learns from it and every project's vocabulary drifts
apart — the "screens vary by whoever built them" problem, one level up.

Both halves are now fixed:

- those three props ship in the seed catalog + form block, centrally
- `design-templates/a2ui-spec/SKILL.md` marks `src/authoring/**`, `src/genui/**`
  and `src/blocks/**` read-only, and tells the agent to report a gap instead of
  widening the catalog

**Still open:** first-attempt catalog-valid rate across repeated runs (status.md
"Next #3"). One run is an anecdote; the drift mode it revealed is the thing worth
measuring.

Also unexercised: the `plain` and `minimal` variants, and the `react/build` path.
(`react/build` cannot render an A2UI screen at all — `/a2ui` is `force-dynamic`,
so it is a per-request read of `a2ui-spec.json`, not a static artifact. Build mode
stays a plain-react-project affordance.)

One claim in this file is still only *probably* true: seed **idempotency**. A
second run on the same project did not visibly clobber anything — the spec
survived and the dev server kept serving — but the `[react] materialized …`
daemon log line was not captured, so the skip branch was never positively
observed. Confirm it with a deliberate edit-then-rerun before trusting it.

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

### 1. Measure drift across repeated runs (highest value)

One real-agent run is done (see above) and it already produced a finding. What is
still missing is the *rate*.

```bash
pnpm install     # if this is a fresh clone
pnpm tools-dev
```

Create A2UI screens from the same brief N≈10 times and record how often the
agent's `a2ui-spec.json` passes `validateSpec` on the **first** attempt, with
retries disabled — the retry loop converges by construction and would flatter the
number. Two failure modes to separate:

- **in-vocabulary drift** — a hallucinated node `type` or an invented prop shape.
  The gate catches this.
- **contract editing** — reaching for `catalog.ts` / `spec-schema.ts` / a block to
  make the spec fit. The skill now forbids it, so treat any recurrence as evidence
  the instruction is not enough and a write guard is needed.

Also still unexercised: the `plain` and `minimal` variants — only `a2ui` has been
run end to end.

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
