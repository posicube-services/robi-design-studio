# Design System Inspired by Untitled UI

> Category: Modern SaaS & Application Toolkit
> The Untitled UI React kit — a comprehensive, accessibility-first design system built on Tailwind CSS 4's CSS-first config, React Aria Components, and a generous 11-stop color ramp per family. The default look reads as "well-engineered modern SaaS": Inter typography, brand-violet primary, multi-family neutrals (gray / cool / warm / iron / blue), and an exhaustive shadow ladder that supports everything from product marketing to dense dashboards.

## 1. Visual Theme & Atmosphere

Untitled UI is the Figma-canonical "modern SaaS" look codified in code: Inter Variable across the entire surface, a brand-violet primary (`#7F56D9` / `brand-600`) backed by a calm purple ramp (`brand-25` → `brand-950`), and a *choice* of neutral families — gray, gray-cool, gray-warm, gray-modern, gray-neutral, gray-iron, gray-blue — so the same component library can express different brand temperatures without rewriting components. The default neutral is `gray` (the iron-leaning `#0A0D12` → `#FDFDFD` ramp), but swapping a brand to `gray-warm` or `gray-cool` only changes a single token alias.

The system is built on **Tailwind CSS 4's CSS-first configuration**: every token lives inside `@theme { ... }` as a `--color-*`, `--text-*`, `--shadow-*`, or `--radius-*` custom property. There is no `tailwind.config.js`. This means tokens are *the* API: brand customization happens by overriding CSS variables in a downstream stylesheet, not by patching JS config. The `dark-mode` variant is custom (`@custom-variant dark (&:where(.dark-mode, .dark-mode *))`), letting consumers wrap any subtree in `.dark-mode` for inline theme islands.

Components are React Aria Components under the hood, which means accessibility behavior (focus management, keyboard navigation, ARIA semantics, screen-reader announcements) is the default rather than a retrofit. Visual states are surfaced via `data-*` attributes (`data-disabled`, `data-loading`, `data-focused`, `data-pressed`) — Tailwind variants target those attributes, so styling is declarative and parallel to the underlying state machine. Class composition uses a `sortCx` pattern with `tailwind-merge` so consumers can pass `className` overrides without conflict.

Typography uses Inter as both `--font-body` and `--font-display`, with a semantic two-tier scale: a body scale (`xs` 12px → `xl` 20px) and a display scale (`display-xs` 24px → `display-2xl` 144px). Display sizes carry negative letter-spacing (-0.72px → -1.44px) for compressed, confident headlines. Line-heights and font-sizes are derived from the `--spacing` base via `calc()`, so the entire vertical rhythm scales by changing one variable.

The shadow system is unusually deep — `xs` through `3xl` for standard elevation, plus dedicated `shadow-skeumorphic` (1px inset border + 2px inset highlight), `shadow-xs-skeumorphic`, and a full `modern-mockup-inner-*` / `modern-mockup-outer-*` family used for product screenshot mockups in marketing pages.

**Key Characteristics:**
- Tailwind CSS 4 CSS-first: every token is a CSS custom property, no JS config
- Brand violet `#7F56D9` (`brand-600`) primary; 11-stop ramps (`25/50/100/200/300/400/500/600/700/800/900/950`) for brand, error, warning, success, plus 7 neutral families
- Inter Variable for body and display; full weight range
- Two-tier type scale: body `xs–xl` (12–20px) + display `xs–2xl` (24–144px)
- React Aria Components foundation — accessibility is structural, not bolted on
- `data-*` attribute styling: `data-disabled`, `data-loading`, `data-focused`, `data-pressed`
- 7 neutral families (gray, gray-cool, gray-warm, gray-modern, gray-neutral, gray-iron, gray-blue) — pick one per brand
- Custom `dark-mode` variant (`.dark-mode` class on any subtree)
- Comprehensive shadow ladder: `xs/sm/md/lg/xl/2xl/3xl` + `skeumorphic` + `modern-mockup-*`
- 1280px container max-width; breakpoints at `xxs:320 / xs:600 / sm / md / lg / xl / 2xl`

## 2. Color Palette & Roles

### Brand — Violet (default primary)
- `brand-25`  `rgb(252 250 255)` — Whisper tint, hover surfaces over white
- `brand-50`  `rgb(249 245 255)` — Section backgrounds, soft brand wash
- `brand-100` `rgb(244 235 255)` — Active hover states on brand surfaces
- `brand-200` `rgb(233 215 254)` — Disabled brand backgrounds
- `brand-300` `rgb(214 187 251)` — Borders on brand surfaces
- `brand-400` `rgb(182 146 246)` — Secondary brand accents
- `brand-500` `rgb(158 119 237)` — Mid-tone brand
- `brand-600` `rgb(127 86 217)` `#7F56D9` — **Primary CTA backgrounds, brand marks**
- `brand-700` `rgb(105 65 198)` — Primary CTA hover/pressed
- `brand-800` `rgb(83 56 158)` — Maximum-contrast brand text on light surfaces
- `brand-900` `rgb(66 48 125)` — Deep brand text
- `brand-950` `rgb(44 28 95)` — Darkest brand, decorative gradients

### Error — Coral Red
- `error-25` `rgb(255 251 250)` … `error-600` `rgb(217 45 32)` `#D92D20` (default error) … `error-950` `rgb(85 22 12)`
- Use `error-50/100` for error surfaces, `error-300/700` for borders/text on those surfaces

### Warning — Amber
- `warning-25` `rgb(255 252 245)` … `warning-600` `rgb(220 104 3)` `#DC6803` (default warning) … `warning-950` `rgb(78 29 9)`

### Success — Green
- `success-25` `rgb(246 254 249)` … `success-600` `rgb(7 148 85)` `#079455` (default success) … `success-950`

### Neutral Families
The system ships **seven** neutral ramps. Pick one per brand and treat it as `neutral`:

| Family | 50 | 600 | 900 | Character |
|--------|----|----|-----|-----------|
| **gray** (default) | `#FAFAFA` | `#535862` | `#181D27` | Iron-leaning, slight cool cast |
| **gray-cool** | `#F9F9FB` | `#4A5578` | `#111322` | Blue-violet undertone |
| **gray-modern** | `#F8FAFC` | `#4B5565` | `#121926` | Crisp blue-gray |
| **gray-neutral** | `#F9FAFB` | `#4D5761` | `#111927` | Tailwind-default-ish neutral |
| **gray-iron** | `#FAFAFA` | `#51525C` | (deepest) | True iron, no cast |
| **gray-blue** | `#F8F9FC` | `#3E4784` | `#101323` | Strong cool/blue lean |
| **gray-warm** (separate ramp) | — | — | — | Warm beige neutral |

Each family ships the full `25/50/100/200/300/400/500/600/700/800/900/950` ladder.

### Semantic Color Tokens (text / fg / bg / border)
Untitled UI exposes **semantic** tokens layered above the raw color ramps. Components reference these, not the raw `gray-700`:

- `--color-text-primary` — Default body text
- `--color-text-secondary` — Subdued body, helper text
- `--color-text-tertiary` — Captions, metadata
- `--color-text-quaternary` — Disabled, placeholders
- `--color-text-brand-primary` — Brand-colored heading
- `--color-text-brand-secondary` — Brand-colored secondary
- `--color-text-error-primary` — Error state text
- `--color-text-warning-primary` / `--color-text-success-primary`
- `--color-text-disabled` / `--color-text-placeholder`
- `--color-text-white`

Parallel families exist for `--color-fg-*` (icons/iconography), `--color-bg-*` (surfaces), `--color-border-*` (dividers/strokes), each with `primary/secondary/tertiary/quaternary/brand/error/disabled` variants. This means component CSS reads `bg-bg-secondary text-text-primary border-border-secondary` rather than `bg-gray-50 text-gray-900 border-gray-200` — brand re-skinning happens by re-binding the semantic layer.

### Light / Dark Surface Pairs (default `gray` family)
| Role | Light | Dark |
|------|-------|------|
| `bg-primary` | `#FFFFFF` | `~gray-950` (`#0A0D12`) |
| `bg-secondary` | `~gray-50` (`#FAFAFA`) | elevated dark surface |
| `bg-tertiary` | `~gray-100` | deeper elevated |
| `text-primary` | `~gray-900` | `~gray-50` |
| `text-secondary` | `~gray-700` | `~gray-300` |
| `text-tertiary` | `~gray-600` | `~gray-400` |
| `text-quaternary` | `~gray-500` | `~gray-500` |
| `border-primary` | `~gray-300` | `~gray-700` |
| `border-secondary` | `~gray-200` | `~gray-800` |

### Alpha Whites & Blacks
- `--color-alpha-white` / `--color-alpha-black` — invertible in dark mode (becomes the opposite color on `.dark-mode`)
- Use these for overlays, scrims, and translucent borders that should flip with theme

## 3. Typography Rules

### Font Family
- **Body & Display**: `var(--font-inter, "Inter"), -apple-system, "Segoe UI", Roboto, Arial, sans-serif`
- **Mono**: `ui-monospace, "Roboto Mono", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`
- Inter is loaded via Next's `next/font` and exposed as `--font-inter` so SSR doesn't FOUT.

### Body Scale (UI / paragraph text)
| Token | Size | Line Height | Notes |
|-------|------|-------------|-------|
| `text-xs` | 12px (`spacing × 3`) | 18px | Captions, metadata |
| `text-sm` | 14px (`spacing × 3.5`) | 20px | Default UI label |
| `text-md` | 16px (`spacing × 4`) | 24px | Default body paragraph |
| `text-lg` | 18px (`spacing × 4.5`) | 28px | Lead paragraph, section intro |
| `text-xl` | 20px (`spacing × 5`) | 30px | Subsection heading |

### Display Scale (headlines)
| Token | Size | Line Height | Letter Spacing |
|-------|------|-------------|----------------|
| `text-display-xs` | 24px | 32px | normal |
| `text-display-sm` | 30px | 38px | normal |
| `text-display-md` | 36px | 44px | -0.72px |
| `text-display-lg` | 48px | 60px | -0.96px |
| `text-display-xl` | 60px | 72px | -1.20px |
| `text-display-2xl` | 72px | 90px | -1.44px |

(Sizes are computed via `calc(var(--spacing) * N)`. The display-md and up gain progressively tighter tracking — the same compressed-headline pattern as Linear/Stripe.)

### Weight Scale
Inter Variable supplies the full `100–900` range. Conventional weights in use:
- `font-normal` 400 — Body, descriptions
- `font-medium` 500 — Buttons, labels, emphasized inline text
- `font-semibold` 600 — Subheadings, card titles, table headers
- `font-bold` 700 — Display headlines, primary numbers (KPIs)

### Principles
- **Two scales, two purposes** — `text-*` for paragraph and UI text; `text-display-*` for marketing/hero headlines. Don't mix them.
- **Line-height tracks the spacing variable** — change `--spacing` and the entire vertical rhythm rescales proportionally.
- **Display sizes trim letter-spacing** — only at 36px+ does negative tracking kick in; below that, normal spacing keeps body text legible.
- **Weight `500` is the workhorse for buttons and nav** — it sits between regular and semibold and reads as "interactive" without shouting.
- **Inter only** — both body and display share the same family; the personality difference comes from size, weight, and tracking, not from face-mixing.
- **Mono for code / kbd / tabular numbers** — never for body or labels.

## 4. Component Stylings

### Buttons (`base/buttons/button`)
The `Button` component supports `size` (`sm | md | lg | xl`) × `color` (`primary | secondary | tertiary | primary-destructive | secondary-destructive | tertiary-destructive | link-gray | link-color`).

**Primary**
- Background: `brand-600` `#7F56D9`
- Text: `white`
- Hover: `brand-700`
- Pressed: `brand-800` (or focus ring)
- Disabled: `bg-disabled` token, `text-disabled` text, `data-disabled` attribute on the React Aria Button
- Radius: `radius-md` (6px) at `sm`/`md`; `radius-lg` (8px) at `lg`/`xl`
- Padding: `sm` (8px 14px) → `md` (10px 16px) → `lg` (12px 20px) → `xl` (16px 28px)
- Skeumorphic shadow option: `shadow-xs-skeumorphic` (subtle inset border + highlight + drop shadow)

**Secondary**
- Background: `bg-primary` (white)
- Text: `text-secondary` (gray-700)
- Border: `1px solid border-primary`
- Hover: `bg-secondary` background
- Skeumorphic option for raised feel

**Tertiary**
- Background: transparent
- Text: `text-secondary`
- Hover: `bg-secondary` background
- No border

**Destructive variants** swap brand for `error-600/700`.

**Link variants** (`link-gray`, `link-color`) — no padding, underline on hover.

**Loading state**: spinner replaces icon; `data-loading` attribute on the underlying React Aria Button.

### Inputs (`base/input/input`)
- Background: `bg-primary` (white)
- Border: `1px solid border-primary` → `data-focused` swaps to `border-brand`
- Focus ring: `2px ring brand-500/24` outside the border (offset)
- Padding: 10px 14px (`md` size)
- Radius: `radius-md` (6px)
- Label: `text-sm` 500 weight, `text-secondary`
- Hint text: `text-sm` 400, `text-tertiary`
- Error state: border + ring + helper text shift to `error-*`
- Icon-leading / icon-trailing slots accept components or ReactNodes (`isReactComponent` check)

### Modals (`application/modals/modal`)
- Surface: `bg-primary`, `radius-xl` (12px) or `radius-2xl` (16px)
- Shadow: `shadow-xl` or `shadow-2xl`
- Backdrop: `bg-overlay` (semi-transparent dark)
- Padding: 24px header / 24px body / 24px footer
- Close button: top-right icon button, 40×40 hit area
- Built on React Aria's Modal with focus-trap and ESC handling

### Tables (`application/table/table`)
- Header: `text-xs` 600, `text-tertiary`, UPPERCASE optional, `bg-secondary` background
- Cell: `text-sm` 400, `text-primary`, 12px 24px padding
- Border: `1px solid border-secondary` between rows
- Row hover: `bg-secondary`
- Selected row: `bg-brand-25` with optional brand-colored left border
- Sticky header support

### Badges (`base/badges/badges`)
Two styles: **pill** (`radius-full`) and **rounded** (`radius-md`).
- Light variant: `brand-50` bg + `brand-700` text (or `success-50/700`, `error-50/700`, etc.)
- Outline variant: `bg-primary` + colored border + colored text
- Solid variant: `brand-600` bg + white text
- Padding: 2px 8px (`xs`) → 4px 12px (`md`)
- Font: `text-xs` 500 / `text-sm` 500

### Toggles (`base/toggle/toggle`)
- Track: `bg-tertiary` off → `brand-600` on
- Thumb: `bg-primary` (white)
- Width × height: 36×20 (`sm`) / 44×24 (`md`)
- Smooth 200ms transition
- Built on React Aria's Switch

### Tooltips (`base/tooltip/tooltip`)
- Background: `bg-primary-solid` (dark surface)
- Text: `text-white`, `text-xs` 500
- Padding: 8px 12px
- Radius: `radius-md`
- Shadow: `shadow-lg`
- Arrow: 8px triangle

### Cards & Containers
- Background: `bg-primary` (white) or `bg-secondary` (subtle gray)
- Border: optional `1px solid border-secondary`
- Radius: `radius-xl` (12px) for product cards, `radius-2xl` (16px) for hero cards
- Shadow: `shadow-xs` (resting) / `shadow-md` (hovered/elevated)
- Padding: 16–32px depending on density

### Navigation (`application/app-navigation`)
- Sidebar: `bg-secondary` background, 280px wide
- Active item: `bg-brand-50` background, `text-brand-700` text, optional `brand-600` left indicator
- Inactive: `text-secondary`, hover `bg-tertiary`
- Item: 40px tall, `text-sm` 500, 8px radius, leading icon at 20×20

### Notifications (Sonner-based, `application/notifications`)
- Toast surface: `bg-primary`, `radius-xl`, `shadow-lg`
- Border: `1px solid border-secondary`
- Width: 360px default
- Variants: success / error / warning / info — each gets a colored leading icon and matching `text-*-primary` accent

## 5. Layout Principles

### Spacing System
- Base: `--spacing` (Tailwind 4 default `0.25rem` = 4px)
- Standard scale: `1` (4px), `2` (8px), `3` (12px), `4` (16px), `5` (20px), `6` (24px), `8` (32px), `10` (40px), `12` (48px), `16` (64px), `20` (80px), `24` (96px)
- Section vertical padding (marketing): 64–96px desktop, 48–64px mobile
- Card internal padding: 16–24px (`md`) / 24–32px (`lg`)

### Grid & Container
- `--max-width-container: 1280px` — Standard page max-width
- 12-column grids common in marketing layouts (24px gutter)
- Sidebar widths: 280px expanded
- Hero sections often `max-w-3xl` (~768px) for centered single-column copy

### Whitespace Philosophy
- **Generous-but-purposeful** — Untitled UI is not a dense dashboard kit by default; marketing pages and product pages get airy 64–96px section padding, while application surfaces tighten to 16–24px
- **Surfaces over shadows** — prefer stepping bg color (`bg-primary` → `bg-secondary` → `bg-tertiary`) for grouping before reaching for shadows or borders
- **Section dividers via background-color step**, not horizontal rules

### Border Radius Scale
| Token | Value | Use |
|-------|-------|-----|
| `radius-none` | 0 | Edge-to-edge |
| `radius-xs` | 2px | Inline tags, micro-elements |
| `radius-sm` | 4px | Small badges, tooltip pointers |
| `radius-md` | 6px | Buttons (sm/md), inputs |
| `radius-lg` | 8px | Buttons (lg/xl), nav items |
| `radius-xl` | 12px | Cards, dropdowns, toasts |
| `radius-2xl` | 16px | Modals, hero cards |
| `radius-3xl` | 24px | Marketing feature blocks |
| `radius-full` | 9999px | Pills, avatars, status dots |

## 6. Depth & Elevation

| Token | Treatment | Use |
|-------|-----------|-----|
| `shadow-xs` | `0px 1px 2px rgba(10,13,18,0.05)` | Resting buttons, subtle cards |
| `shadow-sm` | `0px 1px 3px + 0px 1px 2px -1px` | Default cards |
| `shadow-md` | `0px 4px 6px -1px + 0px 2px 4px -2px` | Hovered cards, raised buttons |
| `shadow-lg` | `0px 12px 16px -4px + ...` | Dropdowns, popovers, toasts |
| `shadow-xl` | `0px 20px 24px -4px + ...` | Drawers, side panels |
| `shadow-2xl` | `0px 24px 48px -12px + 0px 4px 4px -2px` | Modals, dialogs |
| `shadow-3xl` | `0px 32px 64px -12px + ...` | Hero showcase elements |
| `shadow-skeumorphic` | `0px 0px 0px 1px inset + 0px -2px 0px inset` | 1px inset border + 2px inset bottom highlight — gives buttons a "physical" pressed-edge feel |
| `shadow-xs-skeumorphic` | `skeumorphic + xs` | The signature primary-button treatment |
| `shadow-modern-mockup-inner-*` / `outer-*` | Multi-layer | Product screenshot framing in marketing pages |
| `drop-shadow-iphone-mockup` | `20px 12px 18px rgba(16,24,40,0.2)` | iPhone mockup shadows specifically |

**Shadow Philosophy**: Untitled UI uses a single shadow color anchor (`rgba(10, 13, 18, alpha)`) across the entire ladder — a desaturated near-black with a slight cool cast. Elevation is communicated by layering 2–3 shadows with different blur radii and y-offsets, producing the soft "lifted" diffusion that reads as modern SaaS. The skeumorphic shadow is the signature touch: a 1px-inset border combined with a 2px-inset bottom highlight makes primary buttons feel like physical objects rather than flat colored rectangles.

## 7. Do's and Don'ts

### Do
- Use `brand-600` (`#7F56D9`) for the primary CTA — every page has exactly one
- Reach for the **semantic** tokens (`text-primary`, `bg-secondary`, `border-primary`) in component CSS, not raw `gray-900`
- Use `data-*` attribute variants for state styling (`data-disabled:opacity-50`, `data-focused:ring-2`) — never reach inside React Aria's structure manually
- Apply `shadow-xs-skeumorphic` to primary buttons for the signature pressed-edge feel
- Pick **one** neutral family per brand and rebind it as the project's `gray` (do not mix gray-cool and gray-warm in the same product)
- Use the `dark-mode` custom variant on `.dark-mode` ancestors — supports nested theme islands
- Lean on Inter weight `500` for buttons, nav, and emphasized inline text
- Use `text-display-*` only for marketing/hero headlines; use `text-xl` and below for in-app subheadings
- Compose classes with `cx()` (the `tailwind-merge` wrapper) so consumer overrides win

### Don't
- Don't introduce custom hex values when a semantic token exists — re-skinning depends on the semantic indirection
- Don't UPPERCASE button labels by default — Untitled UI's buttons are sentence case
- Don't use `text-display-md` (36px) or larger for in-app UI — that scale is for marketing pages
- Don't stack two shadows from the elevation ladder (e.g. `shadow-md shadow-lg`) — pick one
- Don't bypass React Aria primitives by recreating buttons/inputs from scratch — accessibility behavior lives there
- Don't use `font-bold` (700) for body paragraph text — that's display territory
- Don't use the `modern-mockup-*` shadows on UI elements — they're scoped to marketing screenshot frames
- Don't apply the brand violet to non-interactive decoration — it's reserved for CTA, brand, and active states
- Don't mix neutral families (`gray-warm` + `gray-cool`) within a single product — pick one
- Don't override the `--max-width-container` per page — let layout components apply it consistently

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Notes |
|------|-------|-------|
| `xxs` | 320px | Smallest mobile |
| `xs` | 600px | Mobile (matches Sonner toast breakpoint) |
| `sm` | 640px | Tailwind default |
| `md` | 768px | Tablet |
| `lg` | 1024px | Small desktop |
| `xl` | 1280px | Standard desktop (matches `--max-width-container`) |
| `2xl` | 1536px | Large desktop |

### Touch Targets
- Minimum interactive target: 40px (`md` button) — meets WCAG 2.5.5 AAA (44px) at `lg` and above
- Icon-only buttons: 40×40 (`md`) / 44×44 (`lg`)
- Toggle/switch: 24px tall (`md`) — paired with a 44×44 hit area via padding
- Inputs: 44px tall (`md`)

### Collapsing Strategy
- Sidebar: 280px expanded → drawer overlay below `lg`
- Marketing hero: `text-display-2xl` (72px) → `text-display-lg` (48px) → `text-display-md` (36px) at mobile
- Multi-column grids: 4-up → 2-up at `md` → 1-up at `xs`
- Tables: progressive column hiding, then card-list fallback at `xs`
- Modals: full-screen sheet on `xs`, centered dialog from `sm` upward
- Toast notifications: bottom-stacked on mobile, top-right on desktop

### Image Behavior
- Product screenshots: `radius-xl` or `radius-2xl`, framed with `shadow-modern-mockup-outer-*` for marketing pages
- Avatars: 24 / 32 / 40 / 48 / 56 / 64 / 80 px standard sizes
- Icons: 16px (`xs`) / 20px (default UI) / 24px (large) — supplied by `@untitledui/icons`
- File-type icons: `@untitledui/file-icons` for PDFs, docs, etc. — typically 32–48px

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA: `brand-600` `#7F56D9`
- Primary CTA hover: `brand-700` `#6941C6`
- Primary CTA pressed: `brand-800` `#53389E`
- Page background: white (`#FFFFFF`)
- Subtle surface: `gray-50` `#FAFAFA`
- Card surface: white with `shadow-xs`
- Heading text: `gray-900` `#181D27` (or semantic `text-primary`)
- Body text: `gray-700` `#414651` (or `text-secondary`)
- Muted text: `gray-600` `#535862` (or `text-tertiary`)
- Placeholder/disabled: `gray-500` `#717680` (or `text-quaternary`)
- Border (default): `gray-300` (or `border-primary`)
- Border (subtle): `gray-200` (or `border-secondary`)
- Success: `success-600` `#079455` / Warning: `warning-600` `#DC6803` / Error: `error-600` `#D92D20`
- Brand surface tint: `brand-50` `#F9F5FF`
- Brand text on brand tint: `brand-700` `#6941C6`

### Example Component Prompts
- "Build a primary CTA: `brand-600` (`#7F56D9`) background, white text, Inter 14px / 500 (medium), 8px 14px padding, `radius-md` (6px). Apply `shadow-xs-skeumorphic` for the signature pressed-edge feel: `0px 0px 0px 1px rgba(10,13,18,0.18) inset, 0px -2px 0px 0px rgba(10,13,18,0.05) inset, 0px 1px 2px rgba(10,13,18,0.05)`. Hover: `brand-700` background. Focus: 4px ring `brand-500/24` outside the border."
- "Design a card: white background, `1px solid var(--color-border-secondary)` (`gray-200`), `radius-xl` (12px), `shadow-xs`. Title `text-lg` (18px) Inter 600 weight, `text-primary` color. Body `text-sm` (14px) 400, `text-secondary`. 24px padding. Hover: lift to `shadow-md`."
- "Create a status badge (light variant, success): `success-50` background, `success-700` text, `success-200` border (1px), `radius-full` (pill), 4px 12px padding, `text-xs` 500 weight, leading 6px circle dot in `success-500`."
- "Build an input field: white background, `1px solid var(--color-border-primary)` (`gray-300`), `radius-md` (6px), 10px 14px padding, `text-md` 400 in `text-primary`, placeholder `text-quaternary`. Label above: `text-sm` 500 in `text-secondary`. Focus: border becomes `brand-600`, add 4px ring `brand-500/24`. Error: border + ring + helper text all flip to `error-600`."
- "Design a marketing hero: `text-display-2xl` (72px) Inter 600, line-height 90px, letter-spacing -1.44px, `text-primary` color. Subtitle `text-xl` (20px) 400, `text-tertiary`, max-width 768px centered. Two buttons below: primary `brand-600` and secondary white-with-`gray-300`-border, both `lg` size (12px 20px padding, `radius-lg`). Generous 96px vertical padding."
- "Create a sidebar nav (`bg-secondary` background, 280px wide). Each item: 40px tall, `text-sm` 500 in `text-secondary`, 8px radius, 12px horizontal padding, 16px gap to leading 20px icon from `@untitledui/icons`. Active: `bg-brand-50` background, `text-brand-700` text, `text-brand-600` icon. Hover (inactive): `bg-tertiary`."
- "Build a modal: white surface, `radius-2xl` (16px), `shadow-2xl`, max-width 480px. Header: `text-lg` 600 title + 40×40 close icon button. Body padding 24px. Footer right-aligned: secondary outlined button + primary `brand-600` button, 12px gap. Backdrop `rgba(0,0,0,0.5)`."

### Iteration Guide
1. **Semantic tokens first** — `bg-primary text-secondary border-secondary` reads brand-agnostic and re-skinnable; raw `gray-700` does not
2. **One brand color, used sparingly** — `brand-600` is the only chromatic accent in default UI chrome; everything else is grayscale + status colors
3. **Pick one neutral family per brand** — gray (default), gray-cool, gray-warm, gray-modern, gray-neutral, gray-iron, or gray-blue — and stick with it
4. **Inter Variable, weight 500 for interactive text** — buttons, nav, labels; weight 400 for body; weight 600 for subheadings; weight 700 only for display
5. **Two type scales, two purposes** — `text-*` (12–20px) for UI/body, `text-display-*` (24–144px) for marketing/hero
6. **Letter-spacing tightens at 36px+** — `display-md` and above use negative tracking (-0.72px → -1.44px); below that, normal
7. **Skeumorphic shadow is the primary-button signature** — `shadow-xs-skeumorphic` gives buttons a physical pressed-edge feel that distinguishes the system
8. **Surface stepping over shadows for grouping** — use `bg-primary` → `bg-secondary` → `bg-tertiary` to group regions before reaching for borders or shadows
9. **`data-*` attributes for state** — style `data-disabled`, `data-focused`, `data-pressed`, `data-loading`; never reach into React Aria's internals
10. **`dark-mode` is a class-based variant** — `<div class="dark-mode">` flips a subtree; nested light/dark islands work without theme-context juggling
