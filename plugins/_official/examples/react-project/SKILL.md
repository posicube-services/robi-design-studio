---
name: react-project
description: |
  Multi-file React + TypeScript project — Vite + React or Next.js, chosen by
  the user via the `framework` input. The project is auto-seeded with the
  curated MUI "minimal" design system (theme + components + layouts), so new
  UI is consistent. Your job is to build the brief's real screens on top of
  that seed — NOT a single self-contained HTML file. Use when the user wants
  React source they can install, run, build, and keep developing.
triggers:
  - "react"
  - "react project"
  - "vite"
  - "next.js"
  - "nextjs"
  - "mui"
  - "component"
  - "typescript app"
  - "frontend project"
od:
  mode: prototype
  platform: desktop
  scenario: design
  preview:
    type: html
    entry: dist/index.html
  design_system:
    requires: true
    sections: [color, typography, layout, components]
---

# React Project Skill

Produce a **real, multi-file React + TypeScript project** — not a single
self-contained HTML file. The project is **auto-seeded** before your first turn
with the curated MUI **"minimal"** design system: a working theme, ~24
reusable components, dashboard + auth layouts, and a demo dashboard screen.
Your job is to **replace the demo with the brief's real screens**, reusing the
minimal components so the result looks cohesive and production-ready.

> This is the one skill where the "single self-contained `index.html`" rule
> does **not** apply. Write separate files.

## FIRST: which project am I in?

The `variant` input selects one of three different seeds, and they want different
things from you. Decide by looking at the files, not by guessing — then read only
the sections that apply.

```bash
ls src/authoring/catalog.ts src/theme 2>/dev/null; grep -l tailwindcss package.json
```

| What you find | Project | What you deliver |
| --- | --- | --- |
| `src/authoring/catalog.ts` exists | **A2UI** | `a2ui-spec.json` — **and nothing else** |
| `src/theme/` + `@mui/material` | MUI Minimal | screens built from the minimal components |
| `tailwindcss` in package.json, no `src/theme/` | shadcn + Tailwind | screens built from Tailwind utilities + brand tokens |

### If this is an A2UI project — stop and read this

**Your only deliverable is `a2ui-spec.json` at the project root.** It is a JSON
spec — `{version, root, nodes[]}` — composed from the fixed block catalog. The
`/a2ui` route validates it through a Zod gate and renders it. That spec, not
code, is the screen.

So, in an A2UI project:

- **Do NOT write or edit any `.tsx`/`.ts`.** No new routes, no new components, no
  editing `src/app/page.tsx`. Writing a React screen means you have built the
  wrong thing — the run looks finished while `/a2ui` still shows the seed's
  placeholder spec.
- **Read `src/authoring/catalog.ts`** for the vocabulary: the node `type` values
  you may emit and each one's declared props. Emitting a type that is not in the
  catalog fails the gate.
- **`src/authoring/**`, `src/genui/**` and `src/blocks/**` are read-only.** They
  are the gate's own definition; editing them makes your spec pass by
  construction and destroys the guarantee. If the catalog cannot express the
  brief, say so plainly instead of widening it — that gap gets fixed once,
  centrally, for every project.
- Everything below about MUI components, `theme.palette` and component priority
  **does not apply to you.** Skip it.

### If this is the shadcn + Tailwind seed

There is no `src/theme/`, no `src/layouts/`, and no MUI. Style with Tailwind
utilities that resolve to the brand's tokens (`bg-surface`, `text-fg`,
`bg-accent`, `rounded-md`, `text-sm`, …) — the active design system's
`tokens.css` is wired in at `src/app/brand-tokens.css`, so those utilities follow
the brand automatically. Do not add MUI, and do not hardcode hex.

## You start from a working app (do NOT re-scaffold)

The daemon has already copied the seed for the selected framework into the
project. When you open it, `package.json`, `src/theme/`, `src/components/`,
`src/layouts/` and a demo entry already exist and the live preview already
runs. **Do not copy a seed or recreate these** — read them, then build on top.
(If, exceptionally, the project is empty, run `od react scaffold --project
<id> --framework <vite|next>` once to materialize it.)

## Framework

The user picked **`framework`** = `Vite + React` or `Next.js`. The seed matches:

| Framework | Entry | Routing | Dev / Build |
| --- | --- | --- | --- |
| **Vite + React** | `src/main.tsx` → `src/App.tsx` | `src/routes/` (react-router-dom) | `vite` / `vite build` → `dist/` |
| **Next.js** | App Router `src/app/{layout,page}.tsx` | `src/routes/` (next/navigation) + app segments | `next dev` / `next build` → `out/` |

Both share the SAME `src/theme`, `src/components`, `src/layouts` — so the UI is
identical across frameworks. The preview defaults to the live dev server.

## Minimal design system — component catalog

Everything below already exists under `src/`. Import with the `src/...` path
(the seed sets `baseUrl: '.'`). **Reuse these before writing anything custom.**

**Layouts** (`src/layouts/`)
- `DashboardLayout` — app shell: collapsible sidebar (`nav-section`, driven by
  `src/layouts/nav-config-dashboard.tsx`) + top bar. Wrap dashboard/app screens.
- `AuthCenteredLayout` / `AuthSplitLayout` — sign-in / sign-up screens.

**Components** (`src/components/`)
- `iconify` — `<Iconify icon="solar:cart-3-bold" />`. ALL icons (Iconify sets). Never raw `<svg>`.
- `label` — `<Label color="success">Paid</Label>`. Status pills / badges.
- `chart` — `Chart` + `useChart` (ApexCharts wrapper). ALL charts.
- `table` — `useTable`, `TableHeadCustom`, `TablePaginationCustom`, `TableNoData`, `TableEmptyRows`, `TableSelectedAction`. Data tables on top of MUI `Table`.
- `hook-form` — `Form` + `Field.Text/Select/Checkbox/RadioGroup/Switch/Autocomplete/...` (react-hook-form + zod). ALL forms.
- `upload` — `Upload` / `UploadBox` / `UploadAvatar` (react-dropzone). File & image uploads.
- `nav-section` — sidebar/nav rendering. Edit `nav-config-dashboard.tsx` to change sections.
- `custom-breadcrumbs` — `CustomBreadcrumbs` page header (title + breadcrumb + action slot).
- `custom-dialog` — `ConfirmDialog` and dialog primitives.
- `custom-popover` — `CustomPopover` + `usePopover` for menus/popovers.
- `snackbar` — `toast.success(...)` / `<Snackbar />` (sonner). Toasts.
- `settings` — theme settings drawer + `useSettingsContext()` (mode, layout, color).
- `animate` — `MotionViewport`, `varFade`, … (framer-motion) for entrance/scroll motion.
- `loading-screen`, `progress-bar`, `empty-content`, `search-not-found`, `file-thumbnail`, `flag-icon`, `logo`, `image`, `svg-color`, `scrollbar`, `color-utils`.

What the seed deliberately **omits** (don't assume these exist): rich-text
editor, maps, lightbox, full calendar, carousel, org-chart, and backend SDKs.
If the brief truly needs one, add the dependency and build it with ② / ③.

## Component priority (the rule)

For every UI element, pick the highest tier that fits:

1. **① Reuse a minimal component** from the catalog above. Icon → `Iconify`;
   status → `Label`; chart → `Chart`; form field → `Field.*`; table →
   `table` helpers; confirm → `ConfirmDialog`; menu → `CustomPopover`; upload →
   `Upload`; page header → `CustomBreadcrumbs`; toast → `toast.*`.
2. **② Compose from MUI base + the minimal theme.** When no minimal component
   fits, use MUI (`Button`, `Card`, `Stack`, `Grid`, `Box`, `Typography`,
   `Tabs`, `Menu`, `Drawer`, `TextField`, …). They are already styled by the
   minimal theme — use `sx` with `theme.palette` / `theme.vars`, not raw hex.
3. **③ Custom (CSS Module / styled) only as a last resort** — for genuinely
   bespoke visuals MUI + the theme can't express. Stay within the theme palette
   and spacing; never hardcode off-palette colors.

## Workflow

### Step 0 — Learn the conventions
Read the demo entry (`src/App.tsx` for Vite, `src/app/page.tsx` for Next) and
2–3 catalog components (e.g. `chart`, `hook-form`, `table`) to see how the seed
composes MUI + minimal. Read the active **DESIGN.md** in your system prompt — if
the brief implies a brand, align the theme palette in `src/theme/` to it.

### Step 1 — Plan the screens
State, in one sentence to the user, the screens/components you'll build and
which layout each uses (DashboardLayout vs an auth layout) — they can redirect
cheaply now.

### Step 2 — Build the screens
Replace the demo entry with the real screens. One component per meaningful UI
unit under `src/components/` (your own, app-specific) or `src/sections/`,
composed from the catalog via ①②③. Wire routing: Vite → add routes in
`src/routes/` + `react-router`; Next → add `src/app/<segment>/page.tsx`. Update
`nav-config-dashboard.tsx` so the sidebar reflects your real sections (remove
the demo sections you don't use). Keep typed props and accessibility (headings,
labels, focus, alt text).

### Step 3 — Self-check
Run through `references/checklist.md`. The live preview updates as you edit.
Confirm: real screens replace the demo, components reuse the catalog (①②③),
nav reflects the app, no raw off-palette hex, the project still builds.

### Step 4 — Finish
Summarize **briefly**: the screens/components you built, the minimal components
you reused, and how to run it. Do NOT emit an `<artifact>` block — the project
tree on disk is the deliverable; the user sees it in their panel.

## Hard rules

- **A2UI projects deliver a spec, not code.** If `src/authoring/catalog.ts`
  exists, `a2ui-spec.json` is the only file you write, and
  `src/authoring/**` / `src/genui/**` / `src/blocks/**` are read-only. See
  "FIRST: which project am I in?" — the rest of these rules assume a code seed.
- **Build on the seed; don't re-scaffold.** The seed's theme/components/layouts
  (MUI seed) or brand tokens (shadcn seed) are already there — reuse them.
- **Component priority ①②③.** Minimal component → MUI + theme → custom. Never
  reach for custom CSS when a catalog component or MUI base fits.
- **One framework.** Match the selected framework's entry/routing; never mix
  Vite and Next files.
- **Theme is the palette contract.** Color/spacing via the MUI theme
  (`theme.palette` / `theme.vars`) — no raw off-palette hex.
- **Buildable + runnable.** Keep working `dev`/`build` scripts so the live
  preview and static build keep working.
- **No filler.** Replace demo sections with the brief's real screens; don't
  leave unused demo pages just to look complete.
