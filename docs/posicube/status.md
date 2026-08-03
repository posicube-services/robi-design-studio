# Status and next steps

_Last updated: 2026-07-31._

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
| Brand tokens reach a generated project | working — the scaffolder writes them on both the run and CLI paths; verified on a live daemon, not yet eyeballed in a browser |
| A2UI on shadcn + Tailwind (`a2ui-shadcn`) | working — seed complete (all 31 blocks, typecheck + build clean, the MUI seed's spec renders unchanged), and a real agent produced a gate-valid spec on its first attempt. It also duplicated the screen as React code — see below. |
| A2UI on MUI Minimal (`a2ui`) | working — the token bridge lands the picked brand on MUI's theme; `minimal`/`plain` MUI seeds still lack it |
| Dark mode | out of scope by contract — 1 of 152 brands defines any dark construct (our own `mui-minimal`) |

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

### The first real-agent run on shadcn (2026-07-30) — passes the gate, but duplicates itself

Same brief (signup screen), `a2ui-shadcn` variant, GitHub design system. The
agent produced a **gate-valid spec on the first attempt**:

| Checked | Result |
| --- | --- |
| `a2ui-spec.json` vs the seed placeholder | different — the agent wrote it |
| Structure | 7 nodes, `Page → [PageHeader, Stack(Button×2), Divider, Form]` |
| Node types | all inside the catalog |
| `validateSpec` | `success: true` |
| `src/authoring` / `src/genui` / `src/blocks` | untouched — the read-only boundary held |

So the substrate works end to end with a real agent, and the previous run's
contract-editing failure did **not** recur.

The defect this run exposed is different: **the agent built the same screen
twice.** Alongside the spec it wrote `src/app/signup/` and
`src/components/signup/`, and pointed `src/app/page.tsx` at `/signup` with a
redirect. Both implementations carry byte-identical copy, so which one a preview
shows cannot be told apart by reading the files.

That is two sources of truth for one screen. Editing the spec no longer changes
what `/` serves, which is precisely the property D1 exists to provide.

An earlier diagnosis in this file's history called this a *bypass* — "the agent
never wrote a spec". That was measured mid-run, before the agent had written it,
and is wrong. Check a finished run's files, not a running one's.

The instruction layer was fixed for this (`SKILL.md` gained a "FIRST: which
project am I in?" branch; the plugin query names `a2ui-spec.json` as the sole
A2UI deliverable) but the fix is **not yet verified** — it needs one clean run
that produces a spec and no `.tsx`.

Also unexercised: the `plain` and `minimal` variants, and the `react/build` path.
(`react/build` cannot render an A2UI screen at all — `/a2ui` is `force-dynamic`,
so it is a per-request read of `a2ui-spec.json`, not a static artifact. Build mode
stays a plain-react-project affordance.)

One claim in this file is still only *probably* true: seed **idempotency**. A
second run on the same project did not visibly clobber anything — the spec
survived and the dev server kept serving — but the `[react] materialized …`
daemon log line was not captured, so the skip branch was never positively
observed. Confirm it with a deliberate edit-then-rerun before trusting it.

### Brands did not reach generated projects at all (2026-07-31)

Picking Slack produced the seed's default blue. **Nothing in the pipeline ever
wrote a brand into a generated project** — the seeds' `globals.css` documents
brand application as "replace `brand-tokens.css` with that brand's `tokens.css`
verbatim", and that instruction had no executor. The agent sometimes read the
comment and did the copy itself, which is why GitHub *looked* applied; tightening
the A2UI instruction to "the spec is your only deliverable" removed that accident
and left every project unbranded.

Fixed by making it the system's job (D4): the scaffolder writes the tokens, on
both the run path and `POST /api/projects/:id/react/scaffold` (+ `od react
scaffold`), resolved through the same design-system seam the system prompt uses
so a project and its prompt cannot disagree about the active brand.

Three defects surfaced on the way, each worth remembering:

- **A comment above a declaration ate the property name.** Stripping `/* … */`
  only from the value side left a section header glued to the next `--token`, so
  every annotated declaration was dropped — which is most of them.
- **An omitted token arrived as `''`, not `undefined`**, so `??` happily used it
  and MUI got a blank colour.
- **Brand resolution sat in front of the seed copy and threw.** `registerRunRoutes`
  was handed a `paths` object missing the design-system roots its *type*
  declared, so `path.join(undefined, …)` blew up and took the whole materialize
  down: no seed at all, and the agent hand-copied 400+ files. Resolution is now
  non-fatal. An unbranded project is cosmetic; an unseeded one is a broken run.

Verified on a live daemon: `[react] materialized 425 next/a2ui seed files …
(brand: slack)`, and the project's `brand-tokens.ts` carried `#4a154b`.

### The MUI A2UI seed now wears the design system too (2026-07-31)

`a2ui` used to ignore the brand by construction — the defect that motivated
`a2ui-shadcn`. It no longer does; see "The MUI token bridge" in
`architecture-decisions.md` for the mapping and its limits. The acceptance test
is a round trip: `mui-minimal` was extracted *from* this theme, so feeding it
back returns the theme's own colours exactly wherever a token backs the step.

The chip is now `A2UI 화면 (MUI)` in all 19 locales, and both chip descriptions
name their substrate — "styled by the design system" stopped being a
differentiator the moment both were.

Confirmed in the browser: `A2UI 화면 (MUI)` + Slack renders in Slack's aubergine.

Two defects surfaced between the API-level check and that screen, both worth
keeping:

- **Brands do not all write plain hex.** Across the 152 packs the colour slots
  hold 1394 hex, **219 `color-mix()`**, **48 `var()` aliases** and 19
  rgb/hsl/oklch. Slack's `--surface-warm: var(--surface)` reached
  `createPaletteChannel` verbatim and killed the theme at module evaluation with
  `Invalid hex color: var(--surface)`. `var()` chains are now followed to their
  literal, rgb/hsl pass through, and anything MUI cannot parse is omitted so the
  seed derives that step — which for the color-mix pressed states is close to
  right anyway. A sweep over every bundled brand pins it; a sample would have
  missed this, since the syntax varies pack by pack.
- **Omitting a field means the generated module is no longer a complete
  `BrandTokens`**, so the defaults moved to their own never-generated file and
  the generated one spreads them.

### Every variant now wears the brand (2026-07-31)

The bridge was ported from the a2ui seed to `minimal-next` and `minimal-vite`,
and the injector learned the other two filenames seeds use for the same job.

| Seed | Brand file | Was it written before? |
| --- | --- | --- |
| `shadcn-next-a2ui` | `src/app/brand-tokens.css` | yes |
| `minimal-next-a2ui` | `src/theme/brand-tokens.ts` + `src/styles/tokens.css` | the `.ts` only |
| `minimal-next` / `minimal-vite` | same pair | **no** |
| `scaffold-next` | `src/app/tokens.css` | **no** |
| `scaffold` | `src/styles/tokens.css` | **no** |

Every one of those CSS files carried the same "replace this with the active
design system's tokens.css verbatim" comment and had no executor — the original
defect, repeated per seed under three different filenames. The three MUI seeds
share a byte-identical `src/theme`, so the port was four files copied plus three
edits repeated, with no divergence left behind.

### shadcn reaches Tier 2 as well (2026-08-03)

`Next.js 프로젝트` and `React 프로젝트` were MUI-only; both substrates are now
selectable, and both wear the brand.

| Checked on a live daemon | Result |
| --- | --- |
| Seed chosen for `Vite + React` + `shadcn + Tailwind` | `[react] materialized 39 vite/shadcn seed files … (brand: slack)` |
| `src/styles/brand-tokens.css` in the project | `--accent: #4a154b` — Slack's aubergine |
| `src/ui` in the project | 12 files |
| Both seeds standalone | `npm ci` → typecheck → build, clean |

The component set is the part that had to be written rather than ported, and it
is now ours to maintain — the cost named in `architecture-decisions.md` before
starting, accepted deliberately. No new dependencies: `Tabs` owns its ARIA and
keyboard handling, `Dialog` is the native `<dialog>`.

Four react-project chips became six. That is a lot for a rail that already has to
be scrolled, and the labels are now the only thing separating them — every chip
names its substrate for exactly that reason.

### Dark mode is out of scope, by contract

Worth recording so it is not rediscovered as a bug: **1 of 152 design systems
defines any dark-mode construct**, and that one is our own `mui-minimal`.
`github/tokens.css` has no dark block; neither does `design-systems/shadcn`
(which ships a `system/kit.dark.html` reference fixture without dark tokens). So
every generated screen is light-only because that is all a brand declares.

The MUI seed did define a full dark `colorScheme` of its own — the same pattern
as the missing `secondary`/`info` tokens and the missing chart palette: MUI
supplying what the token contract does not. The shadcn seed is light-only, so
moving off MUI does drop that capability. Two ways to get it back, neither taken:
derive a dark scheme from the light tokens (cheap, but a good dark theme is not
an inversion — surfaces and contrast need re-deriving, so per-brand quality would
be uneven), or add a dark layer to the token contract (152 brands, upstream-scale,
but brand-authored and therefore correct).

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
