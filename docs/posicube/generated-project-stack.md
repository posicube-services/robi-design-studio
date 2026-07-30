# The generated-project stack

What a react-project seed is allowed to depend on, at which version, and how a
version ever changes.

_Last updated: 2026-07-30._

## Why pin at all

The seed **is** the enforcement mechanism. This fork exists because free choice
produces screens that vary by whoever built them; a floating dependency set is
the same variance on a delay — two projects generated a month apart get different
code because they were generated on different *dates*, not by different people.
D4 promises that "the grammar inside a screen does not vary"; that promise leaks
if the grammar depends on which minor version resolved that morning.

There is already a scar from this: `apexcharts`' bar chart renders blank, and
`status.md` names a version pin as the real fix rather than a code workaround.

Two concrete second-order reasons: reproducing a customer bug needs the same
tree, and the agent writes code against whatever version is *installed* — a
silent minor bump can invalidate what it knows (MUI v5→v7 and Next 15→16 both
moved APIs enough to matter).

## The install contract

`reactInstallCommand` in `apps/daemon/src/react-framework.ts` resolves how to
install; both `react-dev.ts` and `react-build.ts` go through it.

| Package manager | Lockfile present → frozen | Fallback |
| --- | --- | --- |
| npm | `npm ci` | `npm install` |
| pnpm | `pnpm install --frozen-lockfile` | `pnpm install` |
| yarn | `yarn install --immutable` | `yarn install` |

A frozen install is preferred whenever a lockfile exists, because a plain
`install` resolves the ranges in package.json and **rewrites the lockfile** —
which is exactly how a dependency moves under a generated project without anyone
choosing it.

The fallback is deliberate, not laziness. A frozen install also fails when
package.json and the lockfile genuinely disagree, and that happens legitimately:
the agent may add a dependency mid-turn. Refusing to build in that case is worse
than losing pinning for that one project. Both attempts are logged — the preview
panel's **Log** shows `[install] frozen (…)` or the retry line — so a downgrade
stays visible instead of silent.

All five seeds ship a lockfile and all five pass `npm ci`. Keep it that way; a
seed without a lockfile silently opts out of pinning.

### The seed copy must exclude install output

`SEED_COPY_EXCLUDE` in `apps/daemon/src/react-scaffold.ts` keeps `node_modules`,
`.next`, `out`, `dist`, `.turbo` and `tsconfig.tsbuildinfo` out of the copy.

This is not tidiness — without it everything above does nothing. A seed lives in a
working directory, so anyone who runs `npm install` or a build inside one leaves
output that git never sees. `runDev` installs only when `node_modules` is
**absent**, so a copied `node_modules` means the install never runs and the
lockfile is never read: the project silently inherits whatever tree happened to be
on the generating machine.

Measured on a machine where one seed had been installed once: the copy wrote
**30,315 files instead of 371**. A `filesWritten` in the tens of thousands means
this filter has been bypassed.

## What is pinned

**Tier 0 — runtime.** Exact, and pinned *as a set*: `react`, `react-dom`,
`next` / `vite`, `typescript`. Previously `next` was exact while `react` floated
on `^`, which is the wrong way round — a React minor can break what a given Next
version expects, so the pair moves together or not at all.

**Tier 1 — the actual stack.** Exact. These three earned their place by being
imported by *our* code, not the vendored template's:

| Library | Why it is stack and not preference |
| --- | --- |
| `zod` | The A2UI gate is written in it (`src/authoring/spec-schema.ts`). The agent already sees zod in the contract, so familiarity is free. |
| `react-hook-form` + `@hookform/resolvers` | The `Form` block's validation. If the substrate ever becomes shadcn this stops being a choice at all — shadcn's Form is built on RHF. |
| `@tanstack/react-query` | `src/genui`'s hook and mutation registries — i.e. A2UI's data binding (D2). Load-bearing, not convenience. `@tanstack/react-query-devtools` is pinned to the same version: it reaches into react-query's internals, so a skew between the two is its own failure mode. |

Pinning was applied by reading the version the lockfile *already* had, so it
changed no dependency tree. Verify that property whenever you re-pin: a pinning
commit that also bumps versions is two changes wearing one hat.

## What is deliberately not pinned

| Not pinned | Reason |
| --- | --- |
| State manager (zustand / redux / …) | `@tanstack/react-query` covers server state; most screens need no client-global state. Pinning one would be speculative. |
| i18n | The customer's call. A2UI specs carry literal strings today. |
| Animation | `framer-motion`'s 29 files are the vendored template's appetite, not a product requirement. |
| Date library | Nothing in *our* code uses one — `dayjs` appears only in template code and `date-fns` zero times. Genuinely open, and best decided together with the component substrate: shadcn's Calendar is react-day-picker, which depends on `date-fns`, so picking `dayjs` would mean carrying both. |

## Template baggage — not our stack

The `minimal-*` seeds' 44 dependencies are mostly the vendored MUI Minimal
template's own list, not a curated choice. Measured by which files import them:

| Library | Where it is imported | |
| --- | --- | --- |
| `minimal-shared` | components 56 · theme 29 · layouts 22 | 0 in `blocks`/`genui`/`authoring` |
| `framer-motion` | components 23 · layouts 6 | 0 in ours |
| `dayjs` | locales · components · utils · types | 0 in ours |
| `es-toolkit`, `nprogress`, `simplebar-react`, `autosuggest-highlight`, `mui-one-time-password-input`, `@iconify/react`, `apexcharts`, `stylis`, `i18next` | vendored areas only | 0 in ours |

Worth knowing before any substrate change: if the vendored `src/components`,
`src/theme` and `src/layouts` go away, every one of those leaves with them — not
because we removed them, but because nothing imports them any more. Do not
re-add them to a new seed out of habit.

## Changing a pinned version

Pinning moves the upgrade cadence onto us; security patches no longer arrive on
their own. Left unattended this becomes a tree nobody dares touch, so the
cadence is part of the decision, not an afterthought.

**Cadence:** review Tier 0 + Tier 1 once per release cycle, and immediately for a
CVE that actually reaches a generated project. Bump one tier at a time so a
regression has one suspect.

**The ritual**, per seed:

```bash
cd plugins/_official/examples/react-project/assets/<seed>
#  1. edit package.json to the new exact version
npm install --package-lock-only --no-audit --no-fund   # 2. lockfile follows
npm ci --dry-run --no-audit --no-fund                  # 3. must pass
```

Then prove it still runs — installing is not the same as working:

```bash
#  4. in a scratch copy (never in the seed — node_modules must not land there)
npm ci && npm run build
```

Skipping step 4 is how the `apexcharts` bar chart shipped broken.
