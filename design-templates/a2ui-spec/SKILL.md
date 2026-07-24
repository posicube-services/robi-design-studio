---
name: a2ui-spec
description: |
  Generate a screen as an A2UI declarative spec (flat adjacency-list JSON) rendered by the embedded MUI-Minimal A2UI runtime inside a minimal-next react project. The agent composes ONLY from the fixed component catalog + declared props — it never writes JSX/CSS/MUI code — so every generated screen holds consistent quality and design.
  Trigger for structured admin/business screens under the Minimal design system: dashboards, forms, lists, detail views, stat rows. Do NOT use for rich/bespoke brand landing pages that need free-form visual design — those belong to the code-build path (react-project), not A2UI.
triggers:
  - "a2ui"
  - "a2ui spec"
  - "a2ui screen"
  - "규격 화면"
  - "genui screen"
  - "spec ui"
od:
  mode: prototype
  # This template renders through the minimal-next react-project pipeline: the
  # ported genui core exposes GET /a2ui, which reads a2ui-spec.json from the
  # project root and renders it. Preview = the project's dev-server /a2ui route.
  preview:
    type: react
    route: /a2ui
  design_system:
    requires: true
  outputs:
    primary: a2ui-spec.json
  capabilities_required:
    - file_write
---

# A2UI Spec Skill

Generate a screen as an **A2UI spec** — a flat adjacency-list JSON (`{version, root, nodes[]}`) written to `a2ui-spec.json` at the project root. The embedded A2UI runtime (`src/genui`, `src/blocks`, ported from genui-studio) renders it through a fixed MUI-Minimal component catalog at `GET /a2ui`.

This is the **hard-gated (Tier 1)** authoring path: consistency holds because you may only compose catalog component `type` values + their declared props, never raw JSX/CSS/MUI code.

## When to use

Use for a regular, structured admin/business screen (dashboard, form, list, detail, stat row) that should look and behave consistently regardless of who generates it. Do NOT use for rich/bespoke brand landing pages needing free-form visual design — use the plain react-project (code-build) path for those.

## The contract you must honor

1. **Vocabulary only.** Emit node `type` values that exist in the catalog (`src/genui/registry.tsx`). A hallucinated type renders as a visible `UnknownNode` diagnostic and fails. Never emit MUI/JSX.
2. **Flat adjacency list.** `nodes[]` is a flat array; parent→child is expressed by a node's `children: [childId, ...]`. The renderer walks from `root`.
3. **Gate pass.** The spec must pass the Zod gate (`src/authoring/spec-schema.ts`): structure, id uniqueness, root exists, child-ref integrity, reachability, and per-node prop shapes. On failure, read the error, fix, retry (max 3).
4. **Design system is authoritative.** Bind the active DESIGN.md tokens; do not invent colors/spacing/typography outside the Minimal palette.

## Component vocabulary (from the ported registry)

- **Pattern blocks** (compose screens): `Page`, `PageHeader`, `SearchField`, `FilterChips`, `StatCardRow`, `StatCard`, `DataTable`, `Form`, `KeyValue`, `Chart`, `SelectFilter`, `AnalyticsWidget`, `Timeline`, `Stepper`, `Invoice`, `Rating`, `Banner`.
- **Primitive blocks** (free composition inside Minimal prop domains): `Stack`, `Grid`, `Box`, `Typography`, `Button`, `Chip`, `Alert`, `Avatar`, `Divider`, `LinearProgress`, `Tabs`, `Accordion`, `List`.

Prefer pattern blocks over primitives. Read the corresponding `src/blocks/<name>.tsx` when unsure of a block's exact prop shape (especially `Form.fields`, `DataTable.columns`, `PageHeader.breadcrumbs`).

## Workflow

1. Read the requirement and pick the pattern blocks that realize each intent (list → `DataTable`, create/submit → `Form`, KPIs → `StatCardRow`/`StatCard`, filter → `SearchField`/`FilterChips`).
2. Compose the screen as a flat `nodes[]` with a `Page` root.
3. Write `a2ui-spec.json` to the project root via your file-write tool.
4. The `/a2ui` route re-validates through the gate and renders. If the gate rejects it, read the error, fix the spec, retry.

## Example (minimal, valid against the gate)

```json
{
  "version": "0.1.0",
  "root": "root",
  "nodes": [
    { "id": "root", "type": "Page", "children": ["header", "table"] },
    { "id": "header", "type": "PageHeader", "props": { "title": "고객 목록", "subtitle": "가입 고객을 관리합니다." } },
    { "id": "table", "type": "DataTable", "props": { "title": "고객", "hook": "useCustomers", "statusField": "status", "pageSize": 10, "columns": [ { "field": "name", "header": "이름", "format": "entity", "secondaryField": "email" }, { "field": "company", "header": "회사" }, { "field": "status", "header": "상태" } ] } }
  ]
}
```

## Notes

- **Data binding**: data-bound blocks (`DataTable`, `Form`, `StatCard`, `KeyValue`, `Chart`, `AnalyticsWidget`) reference a `hook` name from the ported `src/genui/hook-registry.ts`. This spike ships the `useCustomers` mock; real workflow-API-node schema injection (spec D2) replaces this later.
- **Config**: API keys / provider config reuse open-design's existing agent config (`apps/daemon/src/app-config.ts` claude env allowlist). Do NOT add a parallel config surface.
- **Design-rule linter (spec D5)** is not built yet — the "consistency" guarantee currently rests on the gate + catalog boundary only. The linter is a follow-up.
