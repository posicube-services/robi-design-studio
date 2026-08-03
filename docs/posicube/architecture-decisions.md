# Architecture decisions

These came out of a requirements interview (2026-07-22) and a Planner /
Architect / Critic consensus pass (2026-07-23). The verbatim interview and plan
are in [`history/`](./history/); this file is the durable summary.

## The business problem

Posicube sells `robi G` to B2B customers who each want their **own** screens.
Custom screens are the competitive requirement, but hand-built ones vary by
whoever builds them. Letting an LLM write UI freely reproduces that variance in
a new form. So: constrain the LLM's vocabulary, and the output becomes
consistent regardless of author.

## D1 — The artifact is a spec rendered at runtime, not generated code

A screen node's output is an **A2UI spec (JSON)**. A shared renderer, deployed
with the customer app, walks the spec and draws it. Saving a new spec changes
the screen with no rebuild.

Code generation was rejected as the primary artifact: it reintroduces the
variance the whole design exists to remove.

## D2 — Data binding is forward: inject the API schema into the prompt

The upstream workflow node's output schema is extracted at run time and injected
into the LLM prompt, so the spec binds to real field names. (The alternative —
the screen declaring a contract that an adapter satisfies — was rejected as
more machinery for the same result.)

## D3 — One node is one page; sections are an edit operation

Page = one node keeps the canvas simple. "Regenerate just this section" is an
editing operation on the spec, not a separate node type.

## D4 — Per-customer customization is theme tokens plus screen composition

What varies per customer: **design tokens** (color, type, radius, logo) and
**which screens exist, in what order**. What does not vary: the grammar inside
a screen. Design systems are a *finite curated set*, not one per customer.

## D5 — Consistency is decided mechanically: gate + linter

Pass/fail is the **Zod gate** (structure, id uniqueness, reachability, prop
shapes) **and** a design-rule linter. Human review is a secondary check, not the
first gate.

> **Status:** the gate exists. The design-rule linter **does not exist yet** —
> see `status.md`. Until it does, "consistency" rests on the catalog boundary
> and the gate alone.

## D6 — The generation core lives where iteration is cheap

Schema, catalog, gate, renderer and prompt builder live together and are
consumed as a service/artifact rather than reimplemented inside the workflow
engine. The workflow-side node stays a thin client.

## D7 — Core and shell are separate; the shell launches in a new tab

The renderer core is one thing; the authoring shell that wraps it is another.
The workflow node opens the shell in a **new tab** (not an iframe), following
the in-house precedent of `robi-g-admin` → `robi-scenario-builder-web`:

- token handed over in the **URL hash fragment** (never a query string, so it
  stays out of server logs)
- shell posts `{sign:"initialize"}`; the launcher replies with the context
- on completion the shell posts a **signal only** — the spec itself was already
  written to shared storage, so the launcher just re-fetches
- separate origins; the launcher validates `event.origin`

## D8 — Two tiers, because not every screen should be spec-driven

| | Tier 1 — regular screens | Tier 2 — rich/bespoke screens |
| --- | --- | --- |
| Examples | dashboards, forms, lists, admin | brand landing pages with strong identity |
| Output | A2UI spec → runtime render | a real code project |
| Enforcement | **hard** (catalog + Zod gate) | **soft** (tokens + prompt) |

Two axes were being conflated and had to be separated:

- **More design systems** (MUI Minimal, Untitled UI, …) is *normal expansion
  inside* Tier 1 — same spec model, different component set. Curate a finite
  number; do not mint one per customer.
- **Abandoning the grammar** (a clinic landing page that wants to look like
  nothing else) is Tier 2, *outside* A2UI. Do not force A2UI there.

## How D8 is realised in this repo — the `variant` dial

Enforcement is chosen at project creation:

| variant | Vocabulary | Enforcement | Brand reaches the screen | Seed |
| --- | --- | --- | --- | --- |
| `plain` | none — agent writes what it likes | soft: active design system's `tokens.css` | yes, via `tokens.css` | `scaffold` / `scaffold-next` |
| `minimal` | MUI Minimal component library | medium: components fixed, composition free | yes, via the MUI token bridge | `minimal-vite` / `minimal-next` |
| `shadcn` | shadcn + Tailwind v4 component set | medium: components fixed, composition free | yes, via Tailwind's `@theme` | `shadcn-vite` / `shadcn-next` |
| `a2ui` | MUI Minimal **+ fixed spec catalog** | hard: Zod gate | yes, via the MUI token bridge | `minimal-next-a2ui` |
| `a2ui-shadcn` | shadcn + Tailwind v4 **+ the same catalog** | hard: the same Zod gate | yes, via Tailwind's `@theme` | `shadcn-next-a2ui` |

**Every variant now honours the picked design system.** The three MUI seeds share
a byte-identical `src/theme`, so porting the bridge from the a2ui seed to the
other two was four files copied and three edits repeated — no divergence to
maintain.

### The shadcn Tier 2 seeds

Stripping A2UI out of `shadcn-next-a2ui` leaves ~30 files of which **`src/ui` was
exactly one** — the substrate's richness there is the 31 blocks we wrote, not
shadcn itself. So the component set had to be written, and it is now ours to
maintain: that was the cost of this choice, taken deliberately.

`src/ui` is 12 files (button, card, badge, avatar, fields, feedback, table, tabs,
dialog, stat-card, nav) plus `src/layouts/{dashboard,auth}`. `shadcn-next` and
`shadcn-vite` share all of it byte-for-byte; only the entry differs — Next app
router versus Vite + react-router.

**No new dependencies.** shadcn distributes components as copy-in source rather
than a package, so writing them *is* the model. Two consequences worth knowing:
`Tabs` carries its own ARIA roles and arrow-key handling, and `Dialog` is the
native `<dialog>` element — `showModal()` gives focus trapping, page inertness
and Escape-to-close, which a div-with-overlay would have to reimplement and
usually gets wrong.

A `shadcn` request on a tree missing these seeds degrades to the MUI Tier 2 seed
rather than the plain starter: same job, different library.

### Why two a2ui variants

`a2ui-shadcn` is the same contract on a different substrate. It exists because of
a defect in `a2ui` that has since been fixed: **the design system did not reach
the screen.** MUI took its colour, type and radius from a hardcoded JS theme
(`themeConfig`), so picking Airbnb or Stripe changed nothing — a direct
contradiction of D4, which promises design tokens are exactly what varies per
customer.

**Both substrates now honour the design system** (see "The MUI token bridge"
below), so the choice between them is a real one — component library and styling
model — rather than "the one that works and the one that doesn't".

Tailwind fixes it for free rather than by construction: **150 of the 152 design
systems already ship a `tailwind-v4.css`** that maps their tokens onto Tailwind's
theme (57 mappings across colour, spacing, type, radius, shadow and motion), and
that file is byte-identical across brands — so a brand switch is one file. The two
brands that lack it are `tom-modern` and our own `mui-minimal`, which is its own
signal.

Verified before committing to it: the same spec rendered under Stripe,
Neobrutalism and Apple produced three genuinely different screens, and the
`a2ui-spec.json` shipped with the MUI seed renders on the shadcn seed **unchanged**
— no spec edit, no gate failure, no `UnknownNode` diagnostic. That portability is
D1 paying out: because the artifact is a spec and not code, the substrate is
replaceable.

Two gaps the port surfaced, both pre-existing and previously masked by MUI:

- The catalog's palette domain (`primary secondary info success warning error`,
  extracted from the MUI theme) has **no token for `secondary` or `info`** — the
  contract guarantees only `--accent --success --warn --danger`. Rather than shrink
  the catalog, both are derived by rotating hue off `--accent`. The catalog stays
  byte-identical, which is what keeps existing specs valid.
- A multi-series chart had no palette to draw from, for the same reason. Same
  technique, verified legible across all three test brands.

### The MUI token bridge

`themeConfig` turned out to be the whole contact surface. All eight palette
entries resolve through it, **none of the 44 component overrides hardcodes a
hex**, and `custom-shadows` derives from the palette — so replacing that one
object re-colours the entire system, shadows included.

| Where the brand lands | How |
| --- | --- |
| `src/theme/brand-tokens.ts` | the daemon writes it at scaffold time, parsed from the picked brand's `tokens.css` — the same moment the shadcn seed gets its `brand-tokens.css`. One injection point, two substrates. |
| `themeConfig.palette` | `brandPalette()` in `src/theme/brand-bridge.ts` |
| `themeConfig.fontFamily` | `--font-body` / `--font-display` |
| `shape.borderRadius` | `--radius-md` |
| `text` / `background` in `core/palette.ts` | `--fg --fg-2 --bg --surface --surface-warm` |

Values, not `var(--accent)`: the theme does alpha math (`createPaletteChannel`,
`varAlpha`) that cannot run on an unresolved custom property.

MUI wants a five-step ramp per colour where the contract guarantees a point, so
`main`/`dark`/`darker`/`contrastText` come from tokens where the brand declares
them and the two light steps are derived. **Derived steps approximate rather than
reproduce a hand-tuned ramp** — round-tripping `mui-minimal` returns its exact
main/dark/darker/contrastText and its `light`/`lighter` only close. That round
trip is the acceptance test (`e2e/tests/react-seed-brand-bridge.test.ts`): the
brand pack was extracted *from* this theme, so feeding it back has to return the
theme's own colours.

`secondary` and `info` have no token at all, exactly as on shadcn, and are
rotated off the accent's hue by the same technique.

What still does not follow the brand: the neutral grey ramp, Minimal's spacing
rhythm, and the component silhouettes its 44 overrides define. A Slack-branded
Minimal is Slack's colour, type and radius on Minimal's craft — a legitimate
product, but not the same promise as shadcn, where the blocks read tokens
directly and a brand switch changes the screen's shape too.

`a2ui` stays because it is now a real alternative rather than a broken cell.
The seeds are selected by a `variant` value, so coexistence needed no new
machinery. Two byte-identical copies of the catalog remain a drift risk — see
`status.md`.

`a2ui`'s renderer is a Next app, so there is no Vite twin — a Vite request
degrades to `minimal` and reports the variant it actually got, rather than
silently pretending.

Note what `plain` really means: **no component library, but any of upstream's
~150 design systems still applies** — its `tokens.css` styles whatever the agent
writes. It is "free composition", not "no design".

## Where the A2UI machinery lives

Inside the `minimal-next-a2ui` seed, so it ships with the generated project:

| Path | Role |
| --- | --- |
| `src/genui/schema.ts` | the spec shape — a flat adjacency list `{version, root, nodes[]}` |
| `src/genui/renderer.tsx` | walks the spec; an unknown node type renders a visible diagnostic rather than crashing |
| `src/genui/registry.tsx` | **the design-consistency boundary** — the map from node `type` to a curated block |
| `src/blocks/*.tsx` | 30 blocks: 17 pattern (Page, DataTable, Form, StatCard…) + 13 primitive (Stack, Grid, Typography…). The directory holds 31 `.tsx` files — the 31st, `unknown-node.tsx`, is the diagnostic fallback the renderer reaches for when a type is *not* a block, so it is not part of the catalog. The gate's type enum, the registry, and this count all agree at 30. |
| `src/authoring/spec-schema.ts` | the Zod gate |
| `src/authoring/catalog.ts` | the vocabulary the LLM is shown |
| `src/app/a2ui/page.tsx` | reads `a2ui-spec.json` (force-dynamic) and renders it |
| `a2ui-spec.json` | what the agent writes |

The rule that makes it work: **the LLM never sees JSX, CSS, or MUI** — only
catalog block types and their declared prop domains.
