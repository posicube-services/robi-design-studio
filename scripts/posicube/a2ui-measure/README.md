# A2UI generation-consistency measurement

Answers the two open questions in [`docs/posicube/status.md`](../../../docs/posicube/status.md)
"Next" — **#1 first-attempt gate-pass rate** and **#3 whether generation is
consistent at all**. Both are listed there as unmeasured, and the product
premise (a fixed catalog removes author variance) rests on them.

Two commands. `collect.ts` spends the agent budget and writes raw evidence to
disk; `analyze.ts` turns that evidence into numbers. They are split because
agent runs cost money and minutes — you can change how a metric is computed and
re-analyze the same runs for free.

## What it measures

| | Metric | Reads |
| --- | --- | --- |
| ① | Spec written, then **gate pass rate** | `a2ui-spec.json` vs the pristine seed's Zod gate |
| ② | **Skeleton agreement** — modal share of `nodes[root].children.map(type)` | the spec's top-level shape |
| ③ | **Ceiling collisions** — contract edits and stray `.tsx` | project tree diffed against the pristine seed |

③ is the one that pays for itself twice. Both real-agent failures recorded in
`status.md` (the run that edited `catalog.ts`, and the run that wrote
`src/app/signup/` alongside its spec) are the same underlying signal — the agent
hitting the catalog ceiling and routing around it. Counting them tells you what
to add to the catalog next.

## Prerequisites

```bash
pnpm install
pnpm --filter @open-design/daemon build   # collect.ts shells out to apps/daemon/dist/cli.js
pnpm tools-dev                            # daemon must be up
```

## Run it

```bash
# ① collect — the expensive half
pnpm exec tsx scripts/posicube/a2ui-measure/collect.ts \
  --brief a-customer-dashboard --runs 10 --no-retry

# ② analyze — free, re-runnable
pnpm exec tsx scripts/posicube/a2ui-measure/analyze.ts \
  --in .tmp/a2ui-measure/a-customer-dashboard
```

Useful flags: `--variant` (default `a2ui-shadcn`), `--design-system` (default
`github`), `--agent`, `--data-dir`, `--daemon-url`, and `--json` on the analyzer.
`collect.ts --help` lists the registered briefs.

### Dry-run against the mocks first

Verify the plumbing without touching a provider budget, per the root
`AGENTS.md` validation strategy:

```bash
export PATH="$PWD/mocks/bin:$PATH" OD_MOCKS_NO_DELAY=1
pnpm exec tsx scripts/posicube/a2ui-measure/collect.ts --brief a-customer-dashboard --runs 1
```

Mock agents replay a recorded trace, so the *numbers* are meaningless — only the
pipeline is being checked. Do the real measurement with a real agent.

## Reading the result

Decide the thresholds **before** you look at the output. Reading first and
deciding after is how a measurement turns into a rationalization.

| Result | Meaning | Do next |
| --- | --- | --- |
| gate ↑ · skeleton ↑ | Premise holds | Continue. The design-rule linter (D5) is less urgent than assumed |
| gate ↑ · skeleton ↓ | Structurally valid, **not consistent** | Move archetype selection *before* generation — a prop-level linter cannot close a skeleton-level gap |
| ceiling collisions frequent | **Catalog coverage is short** | Catalog expansion outranks everything else, including any plumbing change |
| gate ↓ · ceiling ↑ · skeleton ↓ | The catalog cannot hold the requirement | Re-examine D1: code generation with a strong seed and review gate may beat spec + runtime render |

## Design notes

**The gate comes from the seed, never the project.** `validateSpec` checks a
spec against a catalog, so a run that edited `src/authoring/**` would pass by
construction — the exact drift recorded in `status.md` on 2026-07-30. The
analyzer stages a validator sandbox from the pristine seed and validates every
spec there, outside any agent's reach.

**Briefs come in two kinds and must not be mixed.** The seed ships five data
hooks; a brief needing data outside that set makes the agent hit the ceiling no
matter how stable generation is. Kind `A` briefs are fully expressible with the
shipped catalog and measure *generation consistency*; kind `B` briefs are
realistic customer work and measure *catalog coverage*. See `briefs.ts`.

**Briefs are requirement-level, never structure-level.** A brief that names the
blocks would score a perfect consistency rate while proving nothing — the brief,
not the catalog, would be doing the work.

**`--no-retry` is an instruction, not a flag.** `design-templates/a2ui-spec/SKILL.md`
tells the agent to re-validate and retry up to 3 times; that loop converges by
construction and would flatter the number. There is no daemon-level switch for
it, so the suppression is appended to the brief. Without `--no-retry` the
analyzer labels the output as *not* a first-attempt rate.

## Caveats

- Projects created by the collector are **left in place** under the daemon data
  dir. Each is ~550 KB for the shadcn seed (no `npm install` is run). Clean them
  up yourself when a measurement session is done.
- `collect.ts` parses `od --json` output defensively but does assume the id
  field is reachable as `id`/`projectId`/`runId`, possibly nested one level. If
  the CLI envelope changes, the per-iteration `*.log` files hold the raw output.
- ① counts a run as gate-passing only if a spec exists. A run that produced no
  spec at all is reported separately — it is a different failure from an invalid
  spec.
