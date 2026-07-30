import themeEnums from './extracted/theme-enums.json';

/**
 * @od-component authoring/catalog
 * @notes The machine-readable vocabulary manifest — single source of truth for
 *   (a) the LLM prompt, (b) the zod gate (per-block props schemas are COMPILED
 *   from these PropSpecs), and (c) documentation. Data-only (no React/MUI
 *   imports) so authoring + validation run under plain node/tsx.
 *
 *   Two layers (M2):
 *     - `pattern`   — curated composite blocks (DataTable, Form, StatCard...).
 *       Prefer these when one matches the requirement.
 *     - `primitive` — MUI/Minimal primitives (Typography, Button, Grid...) for
 *       free composition when no pattern fits. Their prop domains (variant/
 *       color/size enums) mirror the Minimal theme; token lists (typography
 *       variants, palette keys) are grounded by scripts/extract-theme-enums.ts
 *       → extracted/theme-enums.json.
 *
 *   INVARIANT: every `type` here MUST be registered in src/genui/registry.tsx,
 *   and every hook `name` MUST be in src/genui/hook-registry.ts.
 * @posicube-minimal version=0.2.0
 */

// ---------------------------------------------------------------------------
// Prop spec — compiled to zod by spec-schema.ts, rendered to prose by prompt.ts

export type PropSpec = {
  kind: 'string' | 'number' | 'boolean' | 'enum' | 'hook' | 'mutation' | 'json';
  /** enum only — allowed values. */
  values?: readonly (string | number)[];
  required?: boolean;
  description: string;
};

export type BlockManifest = {
  type: string;
  layer: 'pattern' | 'primitive';
  /** Whether the block renders child nodes. */
  acceptsChildren: boolean;
  /** Whether the block binds to a data hook (reads `props.hook`). */
  dataBound?: boolean;
  description: string;
  props: Record<string, PropSpec>;
};

export type HookManifest = {
  name: string;
  returns: string;
  fields: string[];
  statusValues?: string[];
};

export type MutationManifest = {
  name: string;
  description: string;
  /** Form field names the mutation understands (unknown fields are ignored). */
  accepts: string[];
};

export type Catalog = {
  blocks: BlockManifest[];
  hooks: HookManifest[];
  mutations: MutationManifest[];
};

// ---------------------------------------------------------------------------
// Shared domains (Minimal theme vocabulary)

export const PALETTE_COLORS = themeEnums.paletteColorKeys as readonly string[];

/** Minimal typography scale, extracted from the live theme. */
export const TYPOGRAPHY_VARIANTS = themeEnums.typographyVariants as readonly string[];

/** Spacing rhythm (MUI units, 1 = 8px): 4/8/12/16/20/24/32/40/48px. */
export const SPACING_VALUES = [0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6] as const;

const TEXT_COLORS = [
  'text.primary',
  'text.secondary',
  'text.disabled',
  ...PALETTE_COLORS.map((c) => `${c}.main`),
] as const;

// ---------------------------------------------------------------------------

export const CATALOG: Catalog = {
  blocks: [
    // ======================================================== pattern layer
    {
      type: 'Page',
      layer: 'pattern',
      acceptsChildren: true,
      description: 'Page shell: centered container with vertical rhythm. Use as the root node.',
      props: {
        maxWidth: { kind: 'enum', values: ['sm', 'md', 'lg', 'xl'], description: 'container width (default "lg")' },
      },
    },
    {
      type: 'PageHeader',
      layer: 'pattern',
      acceptsChildren: false,
      description:
        'Page title + optional breadcrumbs trail + optional subtitle + optional primary action button (minimals page-header shape).',
      props: {
        title: { kind: 'string', required: true, description: 'page title' },
        breadcrumbs: {
          kind: 'json',
          description: 'array of trail labels ending at the current page, e.g. ["대시보드", "고객", "목록"]',
        },
        subtitle: { kind: 'string', description: 'one-line description under the title' },
        action: { kind: 'string', description: 'primary action button label' },
      },
    },
    {
      type: 'SearchField',
      layer: 'pattern',
      acceptsChildren: false,
      description:
        'Search text input. Give it the same `bind` key as a DataTable to filter that table live as the user types.',
      props: {
        placeholder: { kind: 'string', description: 'placeholder text' },
        bind: { kind: 'string', description: 'filter-bus key shared with a DataTable (e.g. "customers")' },
      },
    },
    {
      type: 'FilterChips',
      layer: 'pattern',
      acceptsChildren: false,
      description:
        'Row of selectable filter chips. With `bind` + `field` the selection filters the DataTable sharing the same bind key; include a first option { "value": "all" } to clear.',
      props: {
        options: {
          kind: 'json',
          required: true,
          description: 'array of { "value": string, "label": string } — values should match the data field values, plus "all"',
        },
        bind: { kind: 'string', description: 'filter-bus key shared with a DataTable' },
        field: { kind: 'string', description: 'row field the chips filter (e.g. "status")' },
      },
    },
    {
      type: 'StatCardRow',
      layer: 'pattern',
      acceptsChildren: true,
      description: 'Responsive row wrapper for StatCard children.',
      props: {},
    },
    {
      type: 'StatCard',
      layer: 'pattern',
      acceptsChildren: false,
      dataBound: true,
      description:
        'Single KPI tile. Prefer a live `source` that computes the value from a data hook over a static `value`.',
      props: {
        label: { kind: 'string', required: true, description: 'KPI label' },
        value: { kind: 'json', description: 'string | number — static fallback; omit when using source' },
        color: { kind: 'enum', values: PALETTE_COLORS, description: 'accent color (default "primary")' },
        source: {
          kind: 'json',
          description:
            '{ "hook": <hook name>, "agg": "count" | "countWhere" | "sum", "field"?: string, "equals"?: string|number, "where"?: { "field": string, "equals": string|number }, "format"?: "number"|"currency" }. ' +
            'count = row count; countWhere needs field+equals; sum needs field and may add a "where" filter. Use for "전체 N", "상태별 N", "조건부 합계" KPIs.',
        },
      },
    },
    {
      type: 'Form',
      layer: 'pattern',
      acceptsChildren: false,
      description:
        'A form card for create/edit screens. Validates per field rules and shows a success summary on submit. Declare all inputs in `fields`.',
      props: {
        title: { kind: 'string', description: 'card title' },
        submitLabel: { kind: 'string', description: 'submit button label (default "저장")' },
        mutation: {
          kind: 'mutation',
          description:
            'mutation NAME from the mutations catalog — submit then calls the real API and refreshes every block bound to the same data. Omit for a preview-only form.',
        },
        fields: {
          kind: 'json',
          required: true,
          description:
            'array of { "name": string, "label": string, "type"?: "text"|"textarea"|"email"|"password"|"number"|"select"|"switch"|"date"|"file", "required"?: boolean, "placeholder"?: string, "minLength"?: number, "matchField"?: string, "options"?: [{ "value": string, "label": string }] } in display order. Use "textarea" for multi-line text (설명, 소개, 메모), "password" for masked secrets (submitted values are masked in the success summary), "file" for a file/image upload picker. "minLength" enforces a character minimum (비밀번호 8자 이상), "matchField" names another field this one must equal (비밀번호 확인), and a required "switch" is a consent toggle that must be turned on (약관 동의).',
        },
      },
    },
    {
      type: 'DataTable',
      layer: 'pattern',
      acceptsChildren: false,
      dataBound: true,
      description:
        'Rich data table bound to a hook by name. Skeleton/empty states, status chips, sortable headers, and optional selection/pagination/row actions. Use for list views.',
      props: {
        title: { kind: 'string', description: 'card title' },
        hook: { kind: 'hook', required: true, description: 'data hook to bind rows from' },
        statusField: { kind: 'string', description: 'field rendered as a colored status chip' },
        emptyLabel: { kind: 'string', description: 'empty-state message when there are no rows' },
        bind: { kind: 'string', description: 'filter-bus key — SearchField/FilterChips with the same key filter this table' },
        searchFields: { kind: 'json', description: 'array of field names the search term matches (default: all fields)' },
        selectable: { kind: 'boolean', description: 'checkbox selection column (관리 화면 convention)' },
        pageSize: { kind: 'number', description: 'rows per page — set to enable pagination (e.g. 5 or 10)' },
        rowActions: {
          kind: 'json',
          description:
            'row action menu (⋮). Array of either a plain label string (visual only), or an actionable object: ' +
            '{ "label": string, "type": "navigate", "href": "/p/detail?id={id}" } (client nav; {field} templates the row) ' +
            'or { "label": string, "type": "mutation", "mutation": <mutations-catalog name>, "confirm"?: "정말 삭제할까요?" } ' +
            '(calls the mutation with the row; confirm gates destructive ones). e.g. [{"label":"삭제","type":"mutation","mutation":"deleteCustomer","confirm":"삭제하시겠습니까?"}]',
        },
        columns: {
          kind: 'json',
          required: true,
          description:
            'array of { "field": string, "header": string, "format"?: "currency"|"number"|"date"|"entity"|"progress", "secondaryField"?: string, "suffix"?: string } in display order. ' +
            '"entity" = avatar + name with secondaryField as the second line (use for the main name/product column); ' +
            '"progress" = small bar for 0–100 numeric fields (stock/usage; suffix like "in stock"); "currency" for money, "date" for dates.',
        },
      },
    },
    {
      type: 'Chart',
      layer: 'pattern',
      acceptsChildren: false,
      dataBound: true,
      description:
        'Chart card on the Minimal ApexCharts theme. Two data modes: (a) hook aggregation — bind a hook and either group rows by a field (categorical bar/donut) or project a time-series (line/area); (b) literal categories+series. Use for 추이/분포/대시보드 차트.',
      props: {
        title: { kind: 'string', description: 'card title' },
        type: { kind: 'enum', values: ['bar', 'line', 'area', 'donut'], description: 'chart type (default "bar")' },
        hook: { kind: 'hook', description: 'data hook (mode a)' },
        groupBy: { kind: 'string', description: 'field to group rows by → one bar/slice per value (categorical)' },
        agg: { kind: 'enum', values: ['count', 'sum'], description: 'aggregation for groupBy (default count); sum needs field' },
        field: { kind: 'string', description: 'numeric field for agg="sum"' },
        categoryField: { kind: 'string', description: 'x-axis field for time-series (with valueField), e.g. "month"' },
        valueField: { kind: 'string', description: 'y-axis numeric field for time-series, e.g. "revenue"' },
        seriesName: { kind: 'string', description: 'series label' },
        money: { kind: 'boolean', description: 'format values as currency' },
        categories: { kind: 'json', description: 'literal x labels (mode b)' },
        series: { kind: 'json', description: 'literal series: [{ "name": string, "data": number[] }] (mode b)' },
      },
    },
    {
      type: 'Invoice',
      layer: 'pattern',
      acceptsChildren: false,
      description:
        'Invoice / 견적서 document — header (번호·발행일·수신처·상태) + line-item table with computed amounts + totals (소계/세금/합계). Line amounts and totals are computed automatically. Use for 인보이스, 견적서, 청구서.',
      props: {
        invoiceNo: { kind: 'string', description: 'invoice/document number, e.g. "INV-2026-014"' },
        issueDate: { kind: 'string', description: '발행일' },
        billTo: { kind: 'string', description: '수신처(고객/회사)' },
        status: { kind: 'string', description: 'status chip, e.g. "발행" / "결제완료"' },
        taxRate: { kind: 'number', description: 'tax percent applied to subtotal (e.g. 10)' },
        items: {
          kind: 'json',
          required: true,
          description: 'array of { "description": string, "quantity": number, "unitPrice": number } — amount = quantity × unitPrice (computed)',
        },
      },
    },
    {
      type: 'Rating',
      layer: 'pattern',
      acceptsChildren: false,
      description: 'Read-only rating display (제품 평점, 만족도): big value + stars + optional review count.',
      props: {
        label: { kind: 'string', description: 'metric label, e.g. "고객 만족도"' },
        value: { kind: 'number', required: true, description: 'rating value (0–max), half precision' },
        count: { kind: 'number', description: 'number of reviews' },
        max: { kind: 'number', description: 'max stars (default 5)' },
      },
    },
    {
      type: 'Banner',
      layer: 'pattern',
      acceptsChildren: false,
      description:
        'Rich callout / welcome banner (환영, 프로모션, 업그레이드 안내) — richer than Alert: tone-colored surface, title + description + optional action button + optional icon. At most one per screen, near the top.',
      props: {
        title: { kind: 'string', required: true, description: 'headline' },
        description: { kind: 'string', description: 'supporting line' },
        tone: { kind: 'enum', values: ['primary', 'info', 'success', 'warning', 'error'], description: 'color tone (default "primary")' },
        action: { kind: 'string', description: 'action button label' },
        href: { kind: 'string', description: 'internal path the action navigates to (e.g. "/p/onboarding")' },
        icon: { kind: 'string', description: 'optional Iconify name, e.g. "solar:confetti-minimalistic-outline"' },
      },
    },
    {
      type: 'AnalyticsWidget',
      layer: 'pattern',
      acceptsChildren: false,
      dataBound: true,
      description:
        'Rich KPI widget (Minimal dashboard style): label + big total + optional trend % + optional sparkline. Prefer over StatCard when you want a trend or mini-chart. Total via live `source` (like StatCard) or static `total`.',
      props: {
        label: { kind: 'string', required: true, description: 'metric label' },
        total: { kind: 'json', description: 'static value; omit when using source' },
        source: { kind: 'json', description: 'live value: { "hook", "agg": "count"|"countWhere"|"sum", "field"?, "equals"?, "where"? } (same as StatCard)' },
        color: { kind: 'enum', values: PALETTE_COLORS, description: 'accent (default "primary")' },
        trend: { kind: 'number', description: 'trend percent, e.g. 12.5 or -3.2 (green up / red down)' },
        money: { kind: 'boolean', description: 'format total as currency' },
        sparkHook: { kind: 'hook', description: 'hook for the sparkline series (e.g. useMonthlyRevenue)' },
        sparkField: { kind: 'string', description: 'numeric field for the sparkline (e.g. revenue)' },
      },
    },
    {
      type: 'Timeline',
      layer: 'pattern',
      acceptsChildren: false,
      description:
        'Activity/history feed (주문 진행, 변경 이력, 감사 로그). Vertical dotted timeline.',
      props: {
        title: { kind: 'string', description: 'card title' },
        items: {
          kind: 'json',
          required: true,
          description: 'array of { "title": string, "time"?: string, "color"?: "primary"|"success"|"warning"|"error"|"info"|"grey" }',
        },
      },
    },
    {
      type: 'Stepper',
      layer: 'pattern',
      acceptsChildren: true,
      description:
        'Multi-step wizard. N labels + N children — the n-th child renders in the n-th step, with 이전/다음 navigation. Use for 온보딩, 다단계 등록, 설정 마법사.',
      props: {
        labels: { kind: 'json', required: true, description: 'array of step label strings, one per child' },
        finishLabel: { kind: 'string', description: 'last-step button label (default "완료")' },
      },
    },
    {
      type: 'SelectFilter',
      layer: 'pattern',
      acceptsChildren: false,
      description:
        'Dropdown filter (minimals table-toolbar Stock/Publish style). Share `bind` + `field` with a DataTable to filter it. First option should be an "all"/전체 no-op.',
      props: {
        label: { kind: 'string', description: 'field label above the select' },
        options: {
          kind: 'json',
          required: true,
          description: 'array of { "value": string, "label": string } — values match the data field, plus "all"',
        },
        bind: { kind: 'string', description: 'filter-bus key shared with a DataTable' },
        field: { kind: 'string', description: 'row field the select filters (e.g. "status")' },
      },
    },
    {
      type: 'KeyValue',
      layer: 'pattern',
      acceptsChildren: false,
      dataBound: true,
      description:
        'Detail card: label/value rows. Bind a hook + fields to show one record (rowIndex, default 0), or pass literal `items`. Use for 상세/detail views.',
      props: {
        title: { kind: 'string', description: 'card title' },
        hook: { kind: 'hook', description: 'data hook to read the record from' },
        rowIndex: { kind: 'number', description: 'which row of the hook data to show (default 0)' },
        fields: {
          kind: 'json',
          description:
            'array of { "field": string, "label": string, "format"?: "currency"|"number"|"date" } — used with hook',
        },
        items: {
          kind: 'json',
          description: 'literal rows: array of { "label": string, "value": string|number } — used without hook',
        },
      },
    },

    // ====================================================== primitive layer
    {
      type: 'Stack',
      layer: 'primitive',
      acceptsChildren: true,
      description: 'Flex container. Use for toolbars (direction "row") and vertical groups.',
      props: {
        direction: { kind: 'enum', values: ['row', 'column'], description: 'default "column"' },
        spacing: { kind: 'enum', values: SPACING_VALUES, description: 'gap between children (default 2)' },
        sx: { kind: 'json', description: 'escape hatch for flex alignment only, e.g. { "justifyContent": "space-between", "flexWrap": "wrap", "alignItems": "center" }' },
      },
    },
    {
      type: 'Grid',
      layer: 'primitive',
      acceptsChildren: true,
      description:
        'Responsive 12-column grid. Children are placed left→right. Use for dashboard layouts (cards side by side).',
      props: {
        spacing: { kind: 'enum', values: SPACING_VALUES, description: 'gutter (default 3)' },
        itemSpans: {
          kind: 'json',
          description:
            'array of md column spans (1–12), one per child, e.g. [8, 4]. Defaults to equal split. All items are 12 (stacked) on mobile.',
        },
      },
    },
    {
      type: 'Box',
      layer: 'primitive',
      acceptsChildren: true,
      description: 'Plain container for padding/alignment. No visual styling of its own.',
      props: {
        p: { kind: 'enum', values: SPACING_VALUES, description: 'padding' },
        textAlign: { kind: 'enum', values: ['left', 'center', 'right'], description: 'text alignment' },
      },
    },
    {
      type: 'Typography',
      layer: 'primitive',
      acceptsChildren: false,
      description:
        'Text element on the Minimal type scale. Use h4/h5/h6 for section titles, body2 for body, caption for hints. At most 1–2 heading levels per screen.',
      props: {
        text: { kind: 'string', required: true, description: 'the text content' },
        variant: { kind: 'enum', values: TYPOGRAPHY_VARIANTS, description: 'type scale variant (default "body2")' },
        color: { kind: 'enum', values: TEXT_COLORS, description: 'text color token (default "text.primary")' },
        align: { kind: 'enum', values: ['left', 'center', 'right'], description: 'alignment' },
      },
    },
    {
      type: 'Button',
      layer: 'primitive',
      acceptsChildren: false,
      description:
        'Action button. "contained primary" is the page\'s main action — use at most one or two per screen; use "soft" or "outlined" for secondary actions.',
      props: {
        label: { kind: 'string', required: true, description: 'button text' },
        variant: { kind: 'enum', values: ['contained', 'soft', 'outlined', 'text'], description: 'default "contained"' },
        color: { kind: 'enum', values: [...PALETTE_COLORS, 'inherit'], description: 'default "primary"' },
        size: { kind: 'enum', values: ['small', 'medium', 'large'], description: 'default "medium"' },
        fullWidth: { kind: 'boolean', description: 'stretch to container width' },
        href: { kind: 'string', description: 'navigate to this path on click' },
      },
    },
    {
      type: 'Chip',
      layer: 'primitive',
      acceptsChildren: false,
      description: 'Small status/tag label. Minimal convention: "soft" variant for status.',
      props: {
        label: { kind: 'string', required: true, description: 'chip text' },
        variant: { kind: 'enum', values: ['soft', 'filled', 'outlined'], description: 'default "soft"' },
        color: { kind: 'enum', values: ['default', ...PALETTE_COLORS], description: 'default "default"' },
        size: { kind: 'enum', values: ['small', 'medium'], description: 'default "small"' },
      },
    },
    {
      type: 'Alert',
      layer: 'primitive',
      acceptsChildren: false,
      description: 'Callout for notices/warnings. Use sparingly — one per screen.',
      props: {
        severity: { kind: 'enum', values: ['info', 'success', 'warning', 'error'], required: true, description: 'semantic tone' },
        title: { kind: 'string', description: 'bold first line' },
        text: { kind: 'string', required: true, description: 'alert body' },
        variant: { kind: 'enum', values: ['standard', 'filled', 'outlined'], description: 'default "standard"' },
      },
    },
    {
      type: 'Avatar',
      layer: 'primitive',
      acceptsChildren: false,
      description: 'Circular avatar showing the first letter of `name` (or an image via `src`).',
      props: {
        name: { kind: 'string', required: true, description: 'used for the initial letter + alt text' },
        color: { kind: 'enum', values: PALETTE_COLORS, description: 'background tone (default "primary")' },
        src: { kind: 'string', description: 'image URL (optional)' },
      },
    },
    {
      type: 'Divider',
      layer: 'primitive',
      acceptsChildren: false,
      description: 'Horizontal rule between sections. Optional centered label.',
      props: {
        label: { kind: 'string', description: 'optional text in the middle' },
      },
    },
    {
      type: 'LinearProgress',
      layer: 'primitive',
      acceptsChildren: false,
      description: 'Determinate progress bar (e.g. usage, quota, completion rate).',
      props: {
        value: { kind: 'number', required: true, description: '0–100' },
        color: { kind: 'enum', values: PALETTE_COLORS, description: 'default "primary"' },
        label: { kind: 'string', description: 'caption above the bar' },
      },
    },
    {
      type: 'Tabs',
      layer: 'primitive',
      acceptsChildren: true,
      description:
        'Tab switcher. Provide N labels and N children — the n-th child renders inside the n-th tab panel.',
      props: {
        labels: { kind: 'json', required: true, description: 'array of tab label strings, one per child' },
      },
    },
    {
      type: 'Accordion',
      layer: 'primitive',
      acceptsChildren: false,
      description: 'Expandable Q&A / detail sections.',
      props: {
        items: {
          kind: 'json',
          required: true,
          description: 'array of { "title": string, "content": string }',
        },
      },
    },
    {
      type: 'List',
      layer: 'primitive',
      acceptsChildren: false,
      description: 'Simple vertical list of text rows (activity feeds, simple menus).',
      props: {
        items: {
          kind: 'json',
          required: true,
          description: 'array of { "primary": string, "secondary"?: string }',
        },
      },
    },
  ],
  hooks: [
    {
      name: 'useCustomers',
      returns: 'Customer[]',
      fields: ['id', 'name', 'email', 'company', 'status', 'mrr', 'joinedAt'],
      statusValues: ['active', 'trialing', 'churned', 'suspended'],
    },
    {
      name: 'useUsers',
      returns: 'User[]',
      fields: ['id', 'name', 'email', 'role', 'status', 'lastActiveAt'],
      statusValues: ['active', 'invited', 'disabled'],
    },
    {
      name: 'useOrders',
      returns: 'Order[]',
      fields: ['id', 'orderNo', 'customer', 'amount', 'status', 'createdAt'],
      statusValues: ['paid', 'pending', 'refunded', 'failed'],
    },
    {
      name: 'useProducts',
      returns: 'Product[]',
      fields: ['id', 'name', 'category', 'createdAt', 'stock', 'price', 'status'],
      statusValues: ['published', 'draft'],
    },
    {
      name: 'useMonthlyRevenue',
      returns: 'MonthlyPoint[]',
      fields: ['month', 'revenue', 'orders'],
    },
  ],
  mutations: [
    {
      name: 'createCustomer',
      description:
        'Creates a customer from the submitted form values and refreshes useCustomers-bound blocks. (Form mutation)',
      accepts: ['name', 'email', 'company', 'status', 'mrr', 'trialing'],
    },
    {
      name: 'deleteCustomer',
      description:
        'Deletes a customer by row id and refreshes useCustomers-bound blocks. (DataTable rowAction mutation)',
      accepts: ['id'],
    },
  ],
};

export const BLOCK_TYPES: string[] = CATALOG.blocks.map((b) => b.type);
export const HOOK_NAMES: string[] = CATALOG.hooks.map((h) => h.name);
export const MUTATION_NAMES: string[] = CATALOG.mutations.map((m) => m.name);
export const BLOCKS_BY_TYPE: Record<string, BlockManifest> = Object.fromEntries(
  CATALOG.blocks.map((b) => [b.type, b])
);
