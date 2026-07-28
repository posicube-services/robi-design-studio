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

| variant | Vocabulary | Enforcement | Seed |
| --- | --- | --- | --- |
| `plain` | none — agent writes what it likes | soft: active design system's `tokens.css` | `scaffold` / `scaffold-next` |
| `minimal` | MUI Minimal component library | medium: components fixed, composition free | `minimal-vite` / `minimal-next` |
| `a2ui` | MUI Minimal **+ fixed spec catalog** | hard: Zod gate | `minimal-next-a2ui` |

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
