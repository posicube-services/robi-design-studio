# Design System Inspired by Minimal (MUI Theme)

> Category: Professional & SaaS Dashboard
> The Minimal MUI dashboard kit — a high-density, light-first product surface where emerald-green primary actions ride on near-white surfaces, balanced by a deep slate text hierarchy and a deliberately calm secondary purple. Designed as the default look for admin consoles, CRM dashboards, and back-office tooling.
>
> All values in this document are sourced directly from the Minimal_Web Figma file's design variables — every color, spacing, radius, shadow, and typography number is what the kit emits, not an approximation.

## 1. Visual Theme & Atmosphere

The Minimal theme leans on the canonical light-mode SaaS dashboard formula: a paper-white canvas (`#ffffff`), soft neutral surfaces (`#f4f6f8`), and dark slate text (`grey.800` `#1c252e`) — but pushes against blandness with a saturated emerald primary (`#00a76f`) and a confident violet secondary (`#8e33ff`). The result feels modern, calm, and purposeful: the kit disappears so a busy operator can move quickly through tables, forms, and detail pages.

Typography is built on **Public Sans Variable** for body and UI, with **Barlow** stepping in for headlines and a single oversized `hero` display style. Public Sans is a humanist sans-serif with open apertures and even rhythm — it sets long-form tables and dense forms without strain. Barlow brings a slight industrial flavor at display sizes (`h1`–`h3` and `hero`): touch condensed, touch geometric, with `extrabold (800)` weight producing assertive but never shouty section openers.

The palette is structured around six semantic color rails — primary, secondary, info, success, warning, error — and each rail ships with five tonal stops (`lighter`, `light`, `main`, `dark`, `darker`) plus a `contrastText` companion **and** an explicit eight-step alpha ladder (`8%`, `12%`, `16%`, `20%`, `24%`, `32%`, `40%`, `48%`). A 10-step neutral grey ladder (`50` → `900`) carries borders, dividers, hover overlays, and disabled states; the alpha overlays referenced as `action.*` are derived from the `grey/500` channel (`#919eab14`, `#919eab29`, `#919eab3d`, etc.) so they stay tonally consistent across the app.

Shadows are MUI's full 25-step elevation ladder, plus three composite tokens (`shadow/card`, `shadow/dropdown`, `shadow/dialog`) and one solid-fill brand-shadow per rail (e.g. `shadow/primary = 0 8 16 #00a76f3d`). The plain `z1`–`z24` ladder anchors on `#919eab29` (grey/500 @ 16%) in light mode and pure `common.black` in dark mode; `shadow/dialog` and the brand shadows have their own color anchors, so they read as paired highlights rather than a generic blur.

**Key Characteristics:**
- Light-mode-first dashboard with a parallel, well-tuned dark mode (`data-color-scheme` selector)
- Two-font system: Public Sans Variable (body/UI) + Barlow (display/hero)
- Five-stop semantic color rails (`lighter` → `main` → `darker`) + eight-step alpha ladder per rail
- Emerald `#00a76f` primary; violet `#8e33ff` secondary; cyan `#00b8d9` info; green `#22c55e` success; amber `#ffab00` warning (dark contrast text); coral `#ff5630` error
- 10-step grey scale `#fcfdfd` → `#141a21` with 10-step grey/500 alpha overlay for action states
- Composite shadow tokens for card, dropdown, dialog separate from the 25-step z-ladder
- Component-specific typography tokens (`button/sm`, `button/md`, `button/lg`, `nav/item`, `nav/item-mini`, `nav/subheader`, `input/label`, `input/value`, `chip`, `table/head`, etc.) — not just the t/h scale
- Class prefix `minimal-*`; CSS custom properties surface variables for runtime mode switching

## 2. Color Palette & Roles

### Canonical role tokens

These bullets are the showcase-parseable spine of the palette — the values every render surface (preview, showcase HTML, agent prompt builder) reaches for first. Every value is also present in the structured tables below.

- **Brand primary:** `#00a76f` — Primary CTA color; main brand mark.
- **Primary CTA:** `#00a76f` — Single dominant call-to-action per view, hover `#007867`.
- **Brand secondary:** `#8e33ff` — Foil accent; never co-equal with primary.
- **Background:** `#ffffff` — Page background (light mode).
- **Surface:** `#f4f6f8` — Sidebar, secondary panel, grouped dense regions.
- **Paper:** `#ffffff` — Card / dialog / popover surface.
- **Primary text:** `#1c252e` — Headlines and primary body text on light.
- **Body text:** `#637381` — Default running text and secondary copy.
- **Secondary text:** `#637381` — Captions, metadata, muted labels.
- **Muted:** `#919eab` — Placeholder text; alpha anchor for `action.*` overlays.
- **Border:** `#919eab33` — Default divider / outlined input border (grey/500 @ 20%).
- **Hairline:** `#919eab33` — Same alpha; used as table cell border and section rule.
- **Success:** `#22c55e` — Positive status accent.
- **Warning:** `#ffab00` — Caution status; pairs with dark text `#1c252e`.
- **Error:** `#ff5630` — Destructive / error accent.
- **Info:** `#00b8d9` — Neutral informational accent.

Font roles (for the same parser):

- Display: Barlow
- Heading: Public Sans Variable
- Body: Public Sans Variable
- Mono: ui-monospace, "JetBrains Mono", monospace

(Barlow at ExtraBold 800 for `hero`/h1–h2; Bold 700 for h3. Public Sans at Bold 700 / SemiBold 600 for h4–h6. See §3 for the full stack and weight axis.)

### Brand rails (light mode, light-side anchors)

Each rail ships five solid stops (`lighter` / `light` / `main` / `dark` / `darker`) and a `contrastText`, **plus** an eight-step alpha ladder anchored on `main` (`8%` … `48%`) used for hover overlays, soft-variant fills, focus rings, and disabled states.

| Rail | lighter | light | main | dark | darker | contrastText |
|------|---------|-------|------|------|--------|--------------|
| **primary** (emerald) | `#c8fad6` | `#5be49b` | `#00a76f` | `#007867` | `#004b50` | `#ffffff` |
| **secondary** (violet) | `#efd6ff` | `#c684ff` | `#8e33ff` | `#5119b7` | `#27097a` | `#ffffff` |
| **info** (cyan) | `#cafdf5` | `#61f3f3` | `#00b8d9` | `#006c9c` | `#003768` | `#ffffff` |
| **success** (green) | `#d3fcd2` | `#77ed8b` | `#22c55e` | `#118d57` | `#065e49` | `#ffffff` |
| **warning** (amber) | `#fff5cc` | `#ffd666` | `#ffab00` | `#b76e00` | `#7a4100` | **`#1c252e`** |
| **error** (coral) | `#ffe9d5` | `#ffac82` | `#ff5630` | `#b71d18` | `#7a0916` | `#ffffff` |

Alpha ladder per rail (all rails share the same alpha steps):

| step | primary | secondary | info | success | warning | error |
|------|---------|-----------|------|---------|---------|-------|
| 8%   | `#00a76f14` | `#8e33ff14` | `#00b8d914` | `#22c55e14` | `#ffab0014` | `#ff563014` |
| 12%  | `#00a76f1f` | `#8e33ff1f` | `#00b8d91f` | `#22c55e1f` | `#ffab001f` | `#ff56301f` |
| 16%  | `#00a76f29` | `#8e33ff29` | `#00b8d929` | `#22c55e29` | `#ffab0029` | `#ff563029` |
| 20%  | `#00a76f33` | `#8e33ff33` | `#00b8d933` | `#22c55e33` | `#ffab0033` | `#ff563033` |
| 24%  | `#00a76f3d` | `#8e33ff3d` | `#00b8d93d` | `#22c55e3d` | `#ffab003d` | `#ff56303d` |
| 32%  | `#00a76f52` | `#8e33ff52` | `#00b8d952` | `#22c55e52` | `#ffab0052` | `#ff563052` |
| 40%  | `#00a76f66` | `#8e33ff66` | `#00b8d966` | `#22c55e66` | `#ffab0066` | `#ff563066` |
| 48%  | `#00a76f7a` | `#8e33ff7a` | `#00b8d97a` | `#22c55e7a` | `#ffab007a` | `#ff56307a` |

### Neutral grey ladder

| step | hex | role |
|------|-----|------|
| 50  | `#fcfdfd` | Page tint over white |
| 100 | `#f9fafb` | Row striping |
| 200 | `#f4f6f8` | `background.neutral` — sidebars, secondary surfaces |
| 300 | `#dfe3e8` | Default border, default Avatar bg, filled-default Chip/Label bg |
| 400 | `#c4cdd5` | Disabled iconography, filled-default hover bg |
| 500 | `#919eab` | Placeholder text **and** the alpha-channel source for all `action.*` overlays |
| 600 | `#637381` | Secondary body text (light mode), default `action.active` icon color |
| 700 | `#454f5b` | Strong secondary, filled-inherit hover bg |
| 800 | `#1c252e` | Primary text (light mode); paper surface (dark mode); tooltip bg |
| 900 | `#141a21` | Default surface (dark mode) |

Grey/500 alpha ladder (used everywhere as `divider`, action overlays, soft-variant fills):

| step | hex | usage |
|------|-----|-------|
| 8%  | `#919eab14` | `action.hover` |
| 16% | `#919eab29` | `action.selected`; soft-variant inherit bg; `shadow/16%` (z1–z24 anchor) |
| 24% | `#919eab3d` | `action.focus`; `action.disabledBackground`; `shadow/24%` |
| 32% | `#919eab52` | Outlined Button border; Underline TextField; soft-variant hover bg |
| 48% | `#919eab7a` | Switch off-track; rating empty star; slider marks |
| 80% | `#919eabcc` | `action.disabled` (text color on disabled controls) |

Also defined and used: `40%`, `56%`, `64%`, `72%` for niche tints.

### Surface & text roles

| Role | Light | Dark |
|------|-------|------|
| `background.default` | `#ffffff` | `#141a21` (`grey.900`) |
| `background.paper`   | `#ffffff` | `#1c252e` (`grey.800`) |
| `background.paper-blur` | `#ffffffe5` + `backdrop-blur: 40px` | mode-matched |
| `background.neutral` | `#f4f6f8` (`grey.200`) | `#28323d` |
| `text.primary`       | `#1c252e` (`grey.800`) | `#ffffff` |
| `text.secondary`     | `#637381` (`grey.600`) | `#919eab` (`grey.500`) |
| `text.disabled`      | `#919eab` (`grey.500`) | `#637381` (`grey.600`) |
| `components.divider` | `#919eab33` (grey/500 @ 20%) | same |
| `components.backdrop` | **`#161c247a`** (≈48% slate-near-black) | same |

> The backdrop is **not** `grey.800 / 0.80` — it's a custom slate `#161c24` at ~48% alpha. Use the `components/backdrop` token directly.

### Action overlays (alpha-of-grey/500)

| Token | Hex | Role |
|-------|-----|------|
| `action.hover` | `#919eab14` (8%) | All hover backgrounds, ghost-button hover |
| `action.selected` | `#919eab29` (16%) | Selected list/menu items, soft fills |
| `action.focus` | `#919eab3d` (24%) | Focus ring backings |
| `action.active` | `#637381` (grey/600) | Icon active color, action-icon defaults |
| `action.disabled` | `#919eabcc` (80%) | Disabled text and icon foregrounds |
| `action.disabledBackground` | `#919eab3d` (24%) | Disabled button/input backgrounds |

### Shape & component tints

| Token | Value | Used on |
|-------|-------|---------|
| `shape.filled.inherit.bgcolor` | `#1c252e` | Inherit-color filled (chip, label, button) |
| `shape.filled.inherit.color` | `#ffffff` | Inherit-color filled foreground |
| `shape.filled.inherit.hover` | `#454f5b` (grey/700) | Inherit-color filled hover |
| `shape.filled.default.bgcolor` | `#dfe3e8` (grey/300) | Default-color filled (chip, label, avatar) |
| `shape.filled.default.color` | `#1c252e` | Default-color filled foreground |
| `shape.filled.default.hover-bgcolor` | `#c4cdd5` (grey/400) | Default-color filled hover |
| `shape.soft.inherit.bgcolor` | `#919eab29` (16%) | Soft-variant chip, soft button |
| `shape.soft.inherit.hover-bgcolor` | `#919eab52` (32%) | Soft-variant hover |
| `components.button.outlined` | `#919eab52` (32%) | Outlined Button/ToggleButton border |
| `components.input.outlined` | `#919eab33` (20%) | Outlined TextField/Select border |
| `components.input.underline` | `#919eab52` (32%) | Filled/Standard TextField underline |
| `components.divider` | `#919eab33` (20%) | All dividers/borders |
| `components.avatar.bgcolor` | `#dfe3e8` (grey/300) | Empty-state avatar fill |
| `components.tooltip.bgcolor` | `#1c252e` | Tooltip surface |
| `components.tooltip.color` | `#ffffff` | Tooltip text |
| `components.slider.rail-bgcolor` | `#919eab1f` (12%) | Inactive slider rail |
| `components.slider.marks-color` | `#919eab7a` (48%) | Slider tick marks |
| `components.paper.bg-paper-blur` | `#ffffffe5` + `BACKGROUND_BLUR(radius: 40)` | Translucent headers/panels |

## 3. Typography Rules

### Font families

- **Primary (body / UI)**: `"Public Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Display (headlines / hero)**: `"Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- All sizes have `letterSpacing: 0`; all line-heights are absolute pixel values that map cleanly to MUI's unitless ratios (`24 / 16 = 1.5`).

### Weight scale

| Token | Value |
|-------|-------|
| `fontWeightLight` | 300 |
| `fontWeightRegular` | 400 |
| `fontWeightMedium` | 500 |
| `fontWeightSemiBold` | 600 |
| `fontWeightBold` | 700 |
| `fontWeightExtraBold` | 800 |

### Hierarchy (verified pixel values)

| Role | Font | Size | Line-height | Weight | Notes |
|------|------|------|-------------|--------|-------|
| `hero` | Barlow | 72 | 90 | 800 | Landing/display-only — not in `h1`–`overline` ladder |
| `h1` | Barlow | 64 | 80 | 800 | |
| `h2` | Barlow | 48 | 64 | 800 | |
| `h3` | Barlow | 32 | 48 | 700 | |
| `h4` | Public Sans | 24 | 36 | 700 | |
| `h5` | Public Sans | 20 | 30 | 700 | |
| `h6` | Public Sans | 18 | 28 | 600 | |
| `subtitle1` | Public Sans | 16 | 24 | 600 | |
| `subtitle2` | Public Sans | 14 | 22 | 600 | Default table head / list item primary |
| `body1` | Public Sans | 16 | 24 | 400 | |
| `body2` | Public Sans | 14 | 22 | 400 | Most-used UI text |
| `caption` | Public Sans | 12 | 18 | 400 | `caption-500`/`caption-600` siblings exist |
| `overline` | Public Sans | 12 | 18 | 700 | UPPERCASE |

### Component-specific typography tokens

These are direct Figma variables; reference them rather than hard-coding a number.

| Token | Size | LH | Weight |
|-------|------|----|--------|
| `components.button.small` | 13 | 22 | 700 |
| `components.button.medium` | 14 | 24 | 700 |
| `components.button.large` | 15 | 26 | 700 |
| `components.nav.subheader` | 11 | 18 | 700 |
| `components.nav.item` (default) | 14 | 22 | 500 |
| `components.nav.item` (active) | 14 | 22 | 600 |
| `components.nav.item-mini` (default) | 10 | 16 | 500 |
| `components.nav.item-mini` (active) | 10 | 16 | 600 |
| `components.input.label` | 12 | 18 | 600 |
| `components.input.text` | 15 | 24 | 400 |
| `components.label.text` | 12 | 20 | 700 |
| `components.tab.label` (default) | 14 | 22 | 500 |
| `components.tab.label` (active) | 14 | 22 | 600 |
| `components.chip.label` | 13 | 18 | 500 |
| `components.table.head` | 14 | 24 | 600 |
| `components.avatar.group` | 12 | 18 | 500 |
| `components.carousel.text` | 20 | 36 | 400 |
| `components.chart.legend` | 13 | 22 | 500 |
| `components.settings.label-md` | 13 | 18 | 600 |
| `components.settings.label-sm` | 11 | 14 | 600 |

### Principles

- **Display = Barlow, body = Public Sans** — section openers stay confident and industrial while data remains dense and legible.
- **Buttons override MUI's default UPPERCASE**: `textTransform: 'unset'` — sentence case keeps copy approachable.
- **`overline` is the only UPPERCASE class** — reserve it for category labels, table column headers, and metadata captions.
- **Responsive headlines**: h1/h2/h3 use `pxToRem` and step up at `sm`/`md`/`lg` breakpoints; below `sm` the mobile size holds.
- **Use the component-specific tokens** (`components.button.medium`, `components.nav.item`, etc.) over the global `body2`/`subtitle2` whenever an MUI surface ships its own role — the kit explicitly carries them because line-height and weight diverge from `body2` in ways that matter.

## 4. Spacing, Radius, Borders

### Spacing scale (`theme.spacing(n) = n * 8` for integer n)

| Token | Pixels |
|-------|--------|
| `spacing-0,5` | 4 |
| `spacing-0,75` | 6 |
| `spacing-1` | 8 |
| `spacing-1,5` | 12 |
| `spacing-2` | 16 |
| `spacing-2,5` | 20 |
| `spacing-3` | 24 |
| `spacing-5` | 40 |
| `spacing-10` | 80 |
| `spacing-2px` | 2 |

### Radius scale

| Token | Pixels | Common use |
|-------|--------|------------|
| `radius-0,5` | 4 | Slider label, very small chips |
| `radius-0,75` | 6 | Tooltip, MenuItem, NavHorizontal item, label, chip-sm corners alt |
| `radius-1` | **8** | **Default — Button, Alert, Accordion, TextField, NavVertical item, ToggleButton, Pagination rounded** |
| `radius-1,25` | 10 | Chip-md, slim cards |
| `radius-1,5` | 12 | Snackbar, Avatar-rounded, Menu container |
| `radius-2` | 16 | LinearProgress band, large panels |
| `radius-50%` (`500`) | pill / circle | IconButton, Fab, Slider thumb, Switch, Badge, Pagination circular, Avatar circular, Radio thumb |

### Border widths

- Default 1px on `outlined` paper, dividers, dropdown hairlines.
- `[nav]-border-width: 1` on the NavVertical container right edge.
- 2px on the NavVertical active-item left indicator and on filled Tab indicator.
- Component-specific border colors:
  - Inputs: `#919eab33` (20%)
  - Buttons (outlined): `#919eab52` (32%)
  - Dividers / Paper-outlined / NavVertical edge: `#919eab33` (20%)

## 5. Depth & Elevation

### Plain z-ladder

Color anchor `shadow/16%` = `#919eab29` in light mode, `common.black @ 16%` in dark mode.

| Token | Offset (x, y) | Blur | Spread | Use |
|-------|---------------|------|--------|-----|
| `z1` | (0, 1) | 2 | 0 | Resting cards, list items, header on scroll |
| `z4` | (0, 4) | 8 | 0 | Raised cards, button hover |
| `z8` | (0, 8) | 16 | 0 | Menus, popovers, Snackbar, brand-button rest |
| `z12` | (0, 12) | 24 | **-4** | Mid drawers |
| `z16` | (0, 16) | 32 | -4 | Drawers, side panels |
| `z20` | (0, 20) | 40 | -4 | High drawers, mega-menus |
| `z24` | (0, 24) | 48 | 0 | Modals, command palette default |

> The `-4` spread on z12/z16/z20 tightens the inner edge of the blur — do not omit it when porting to CSS; it's what keeps these elevations from feeling fuzzy.

### Composite shadows

These are layered drop-shadow stacks; render them as two CSS `box-shadow` values.

**`shadow/card`** — default Card / Paper elevated state:
```
0 12px 24px -4px #919eab1f,  /* grey/12% outer */
0 0 2px 0 #919eab33          /* grey/20% hairline */
```

**`shadow/dropdown`** — Menu, Select, Autocomplete, Popover, sidebar Menus:
```
-20px 20px 40px -4px #919eab3d,  /* grey/24% directional */
0 0 2px 0 #919eab3d              /* grey/24% hairline */
```

**`shadow/dialog`** — Dialog / Modal surface:
```
-40px 40px 80px -8px #0000003d   /* black/24% directional */
```

### Brand shadows (per rail)

Applied to filled-brand buttons, Fab, IconButton when colored. All share `0 8px 16px 0` with the rail's `24%` alpha:

| Token | Color |
|-------|-------|
| `shadow/primary` | `#00a76f3d` |
| `shadow/secondary` | `#8e33ff3d` |
| `shadow/info` | `#00b8d93d` |
| `shadow/success` | `#22c55e3d` |
| `shadow/warning` | `#ffab003d` |
| `shadow/error` | `#ff56303d` |

### Backdrop-blur

`blur/paper` = `BACKGROUND_BLUR(radius: 40)` paired with `#ffffffe5` (`paper @ 90%`) for translucent app-bar/header treatments.

## 6. Component pixel specs

### Button

- `radius: 8`, `min-width: 64`, internal `gap: 8` (icon ↔ label)
- **Small** — `min-height: 30`, `padding: 4px 8px`, font `button/small` (13 / 22 / 700)
- **Medium** — `min-height: 36`, `padding: 6px 12px`, font `button/medium` (14 / 24 / 700)
- **Large** — `min-height: 48`, `padding: 8px 16px`, font `button/large` (15 / 26 / 700)
- **X-Large** — `min-height: 56`
- Text-only (no fill) horizontal padding overrides: `small 4 / medium 8 / large 12` (matching MUI's `text` variant gutter rule)
- **Outlined** border: `1px solid #919eab52` (32%); hover bg `#919eab14`
- **Soft** variant: bg `#919eab29` (16%) → hover `#919eab52` (32%); when colored, uses `rail/16%` → `rail/32%`
- **Filled** (default contained): bg `rail/main`, fg `rail/contrastText`, hover `rail/dark`, rest shadow = `shadow/<rail>` (e.g. emerald shadow on a primary CTA), non-brand uses `shadow/z8`
- Disabled: bg `#919eab3d` (24%), text `#919eabcc` (80%)
- Brand button gets the corresponding `shadow/<rail>` token at rest, **not** a generic z-shadow

### IconButton

- `radius: 500` (circle)
- sm: `p: 5` → 26-box
- md: `p: 8` → 40-box
- lg: `p: 12` → 48-box
- Default color: `action.active` `#637381`
- Hover overlay: `action.hover` `#919eab14`
- When colored, hover bg = `rail/8%`; pressed = `rail/16%`

### Fab

- `radius: 500`, gap 8, icon size 24
- Circular: sm 40, md 48, lg 56
- Extended: sm 36 (px 8 / py 4), md 40 (px 12 / py 6), lg 48 (px 16 / py 8)
- Rest shadow: `shadow/z8` (neutral) or `shadow/<rail>` (colored)

### ToggleButton / ToggleButtonGroup

- Standalone: sm 40 (p 8), md 48 (p 12), lg 56 (p 16)
- `radius: 8`, gap 8
- Outlined border: `#919eab52`
- Selected bg: `rail/8%`; selected fg: `rail/main`

### ButtonGroup

- Inherits Button sizing, dividers between buttons use `components.button.outlined` (32%)

### Text Field

- `radius: 8`
- Typography: input value 15 / 24 / 400; floating label 12 / 18 / 600
- **Outlined** — px 14; py 16 (md); md `min-height: 56`; sm py 8
- **Filled** — pl 12, pr 10; pt 24, pb 8 (md); pt 20, pb 4 (sm); collapsed-label py 16 (sm 12)
- **Standard** — pt 4, pb 4; mt 16 (sm pt 0); multiline mt 20; pr 12 for textarea
- Border (outlined): `#919eab33` (20%) → focus `primary.main`; error → `error.main`; disabled bg `#919eab3d`
- Underline (filled/standard): `#919eab52` (32%) → focus `primary.main`
- Error helper bg tint: `#ff563014` (8%)
- Disabled text: `#919eabcc`

### Textarea

- `min-height: 98`
- Outlined: px 14, py 16; Filled: px 12, py 16, gap 6
- Same border tokens as Text Field

### Form Helper Text

- Caption (12 / 18 / 400)
- Icon size 16, gap 4
- Left padding 12, top padding 6
- Tone-bound color: text/secondary, success/main, error/main

### Checkbox

- p: 8 (touch box = 40), sm icon 20, md icon 24
- Sprite radius: 4 inside the touch box (separate from outer ripple)
- Hover overlay: `rail/8%`
- Active color: `rail/main` (defaults to `primary.main`)
- Disabled: `action.disabled` (#919eabcc)

### Radio

- p: 8, thumb radius 500, sm icon 20, md icon 24
- Active dot color: `rail/main`
- Hover overlay: `rail/8%`

### Switch

- Track radius 500, p 3 (rail inset)
- md: width 33 × height 38 (with thumb), spacing 9 (to label)
- sm: width 25 × height 24, spacing 7
- Off-track: `grey/48%` (`#919eab7a`)
- On-track: `rail/main` (default `primary.main`)
- Thumb: `#ffffff`
- Disabled: `action.disabled` overlay; text `#919eab`

### Slider

- Rail radius 500
- md: rail height 10, thumb 20
- sm: rail height 6, thumb 16
- Active rail: `primary.main`
- Inactive rail: `components.slider.rail-bgcolor` `#919eab1f` (12%)
- Marks: `components.slider.marks-color` `#919eab7a` (48%)
- Thumb shadow: `shadow/z1`
- Value label (tooltip): bg `grey.800` `#1c252e`, color `#ffffff`, px 6 py 3, radius 4, caption typography

### Rating

- Icon sizes: xx-sm 12, x-sm 16, sm 20, md 24, lg 28
- Filled: `warning.main` `#ffab00`
- Empty: `grey/48%` `#919eab7a`
- Spacing 8

### Chip

- **Small** — height 24, `padding: 0 3px`, radius 8, gap 5, delete icon 16
- **Medium** — height 32, `padding: 0 4px`, radius 10, gap 8, delete icon 22
- Typography: `components.chip.label` (13 / 18 / 500)
- **Default (soft)**: bg `#919eab29`, text/primary
- **Outlined**: 1px `#919eab52` border, text/primary
- **Filled inherit**: bg `#1c252e`, text `#ffffff`
- **Filled default**: bg `#dfe3e8`, text `#1c252e`
- **Tone-soft (status)**: bg `rail/16%`, text `rail.dark` (e.g. success `#22c55e29` + `#118d57`)
- Group overlap: spacing `-2px`

### Avatar / AvatarGroup

- Empty bg: `#dfe3e8` (grey/300)
- Circular radius 500; rounded radius 12; square radius 0
- Group label uses `components.avatar.group` (12 / 18 / 500)
- Standard sizes: 24 / 32 / 40 / 48 / 64 / 96 (kit ships 32/40/48/64 as primary)

### Badge

- Standard: 20px round, px 6, radius 500
- Dot: 10px round
- Status (md): 10px round
- Ring color matches `background.paper` so the badge separates from the host
- Fill follows the chosen rail; tone uses `rail.main` + `rail.contrastText`

### Label

- Height 24, radius 6, min-width 24, px 6, gap 6
- Typography: `components.label.text` (12 / 20 / 700)
- **Filled default**: bg `#dfe3e8`, color `#1c252e`
- **Filled inherit**: bg `#1c252e`, color `#ffffff`
- **Soft inherit**: bg `#919eab29`
- **Tone soft per rail**: bg `rail/16%`, color `rail.dark` (e.g. error `#ff563029` + `#b71d18`)
- **Outlined per rail**: 1px border `rail.main` + text `rail.main`

### Alert

- `radius: 8`, `padding: 6px 8px 6px 16px` (py 6 / pl 16 / pr 8)
- Icon size 24, gap 12
- Body: `body2` (14 / 22 / 400); title `subtitle2`
- Close: IconButton sm (p 5, radius 500)
- **Tone soft**: bg `rail/16%`, color `rail.dark` (e.g. success `#22c55e29` + `#118d57`)
- **Outlined per rail**: 1px `rail.main` + lighter bg `rail/lighter` (via `swap/lighter-darker-*` in dark mode)
- **Filled per rail**: bg `rail.main` + `rail.contrastText`

### Snackbar

- `radius: 12` (note: different from button 8)
- pl 4, py 4, gap 12
- Inner icon-button container 40 (md) with `rail/8%` tint behind the leading icon
- Body uses `subtitle2` (14 / 22 / 600)
- Surface: `background.paper`; shadow `shadow/z8`
- Trailing close icon-button: 24 inside p 8 (md, radius 500)

### Tooltip

- `radius: 6`, px 6, py 3
- Surface: `components.tooltip.bgcolor` `#1c252e`
- Color: `components.tooltip.color` `#ffffff`
- Text: `caption` (12 / 18 / 400)

### Backdrop

- `components.backdrop` `#161c247a` (≈48% on slate near-black) — use this token, not `grey.800 / 0.80`

### Dialog

- **Title**: pl 24 / py 24 / pr 12; gap 16; `h6` (18 / 28 / 600); close = IconButton md (p 8, radius 500)
- **Actions**: px 24 / py 24, gap 12; buttons use `button/medium`
- Surface: `background.paper`, `radius: 16`
- Shadow: `shadow/dialog` (`-40 40 80 -8 #0000003d`)
- Backdrop: `components.backdrop`

### Card / Paper

- Default elevated surface: `background.paper` + `shadow/card` (composite)
- **CardHeader**: pl 24 / py 24 / pr 16; gap 16; title `h6` (18 / 28 / 600)
- Paper radius: typically 16 (12 acceptable on dense panels); avatar slot 12; rocket-tier hero radius 16
- Outlined variant: 1px `#919eab33` border, no shadow — never combine
- Paper-blur surface: `#ffffffe5` + `blur/paper`

### Accordion

- `radius: 8`
- Summary: pl 16 / py 16 / pr 8; chevron icon 18
- Details: px 16 / pb 16; expand-mb 16
- Summary title: `subtitle1` (16 / 24 / 600); body: `body1`
- Divider between rows: `#919eab33`
- Default elevation 0; expanded uses `shadow/z8`

### Tabs

- Tab item: py 12, min-width / min-height 48; CustomTab px 16
- Indicator: 2px line in `primary.main` under the active tab
- Label: `components.tab.label` (14 / 22 / 500) → active 14 / 22 / 600
- Color: text/secondary (default) → text/primary (active) → primary.main (selected indicator + icon)
- Tab list horizontal spacing: 40 (desktop) / 24 (mobile)
- Tabs control buttons (scrollers) container: 200×120 (arrows)
- Disabled opacity: 48

### Pagination

- Item radii: 8 (rounded) or 500 (circular)
- Sizes (item box): **sm 26, md 32, lg 40**
- Icon sizes: sm 18, md 20, lg 22; gap: sm 16, md 6, lg 6
- Typography: body2 (default) / subtitle2 14/22/600 (active)
- Active fill (filled-inherit): bg `#1c252e` + text `#ffffff`
- Active fill (soft variant): bg `primary/8%` + text `primary.main`
- Outlined item border: `#919eab52`
- Disabled opacity: 48

### Breadcrumbs

- Typography: `body2` (14 / 22 / 400)
- Default color: `text.secondary`; current item `text.primary`
- Separator: `text.disabled`
- Spacing 4 between separator and label

### Menu / MenuItem / ListItem

- Menu list: padding 4, item gap 4
- MenuItem: px 8 / py 6, radius 6, gap 8
  - Primary text: `subtitle2` 14 / 22 / 600
  - Secondary text: `body2` 14 / 22 / 400
- ListItem: px 8 / py 8, gap 16
- Hover bg: `#919eab14`; selected bg: `#919eab29`
- Menu container: bg `background.paper`, radius 12, `shadow/dropdown`
- ListItemText spacing inside ListItem follows the 8px gap rule

### Table

- Head row typography: `components.table.head` (14 / 24 / 600)
- Body cell typography: `body2` (14 / 22 / 400)
- Cell stack:
  - **Head cell**: 308×136 (40 padding around 160-wide content; sortable variant adds chevron action 68×68)
  - **Body cell (Td)**: 308×152 (40 padding around 160 + 72-tall content stack)
- Cell bottom border: `#919eab33` (20%)
- Row hover: `#919eab14`
- Selected row: `primary/8%` (`#00a76f14`) with a 3px-wide `primary.main` left indicator
- Selection toolbar: full-width strip, height 52, bg `primary/8%`
- Action column slot: 68×68; visualization column: 160×56
- Striping (when used): alternate `grey/50` background

### DataGrid

- Cell stacks share the 336×132 box (40 padding around the content)
- Toolbar: 1080×88 (desktop) / 343×316 (mobile)
- Toolbar buttons (settings/export/filters/columns/more): 30-tall pills
- Action slot: 52×52; visualization slot: 180×52

### Stepper

- **Horizontal**: 1200×142 default for 4 steps; connector is a 2px line
- **Vertical**: 740×260 default
- Connector color: `primary.main` complete / `#919eab29` pending
- Step circle: 24 (radius 500); active ring `primary.main`; pending `grey.300`
- Label `subtitle2` 14 / 22 / 600; description `body2` 14 / 22 / 400; optional caption `caption` 12 / 18 / 400 in `text.secondary`

### LinearProgress

- Track radius 16; height 4 (default) / 6 / 8
- Track bg: `rail/24%` (e.g. `#00a76f3d`)
- Bar: `rail.main`
- Indeterminate animation reuses the same colors

### CircularProgress

- Sizes: 24 / 40 / 56 (standard kit)
- Stroke color: `rail.main`
- Track (when ring rendered): `rail/24%`

### Timeline

- Dot: 12 box, radius 500
- Rail (vertical line): 2px; `primary.main` when complete, `#919eab29` pending
- Item gap: spacing-1,5 (12)
- Title `subtitle2`; timestamp `caption` 12 / 18 / 400 in `text.secondary`

### Carousel

- Card image radius 16
- Title `components.carousel.text` (20 / 36 / 400)
- Indicator dots: 8×8, gap 8; default `grey/300`, active `primary.main`
- Arrow buttons: IconButton md (p 8, radius 500) with `shape.filled.inherit` styling

### Divider

- 1px line, color `#919eab33` (20%)

### TreeItem

- Item label region: 280×30 (root), 280×30 (expanded)
- Hover / selected use action overlays; chevron icon button sm (p 5)
- Expanded children inset: 24 (spacing-3)

### Walktour / Coachmark

- Container 380×208 default
- Surface: `background.paper`, `radius: 12`, `shadow/z8`
- Body uses body2 + caption

### Upload

- Standard region: 560×288 with dashed border
- Avatar slot: 144×144 round
- Box slot: 344×106
- Mini: 64×64
- States: enabled / disabled / error each pre-renders the same matrix
- Disabled text uses `action.disabled`; error border `error.main` with bg `#ff563014`

### Editor

- Card 800×700 default
- Toolbar row separated from canvas by `#919eab33` divider
- Toolbar buttons: 28-tall IconButton sm

## 7. Layout

### Header

| Variant | Height | Horizontal padding |
|---------|--------|--------------------|
| Main desktop | 72 | 40 |
| Main mobile | 64 | 16 |
| Dashboard horizontal | 64 | 40 |
| Dashboard mobile | 64 | 16 |

- Container `main` padding-x: 144 (desktop), 16 (mobile)
- On scroll: applies `shadow/z1`
- Transparent + paper-blur background variant uses `#ffffffe5` + `blur/paper`

### NavVertical (Sidebar, expanded)

- Width **280**, border-width 1 on the right edge; bg `#ffffff00` (transparent)
- Padding-x 16, item gap 4
- **Root item**: height 44, pl 12 / pr 8 / py 4, radius 8, icon 24 (mr 12), gap 16
- **Sub item**: height 36, indent 24 from the root, radius 8
- Item active (root): bg `primary/8%` `#00a76f14`, fg `primary.main`; left indicator 2px `primary.main`
- Item active (sub): bg `grey/8%` `#919eab14`, fg `text.primary`
- Subheader: `components.nav.subheader` 11 / 18 / 700, `text.secondary`
- Shape divider tint between sections: `#edeff2`

### NavMini (Sidebar, collapsed)

- Width **88**, padding-x 4, item gap 4
- **Root item**: 76×58, pt 8 / pb 6, icon 22 (pt 11), gap 6
- **Sub item**: 240×36, px 6
- Root font: `components.nav.item-mini` 10 / 16 / 500 → active 600
- Sub-item font: `components.nav.item` 14 / 22 / 500

### NavHorizontal (top nav row)

- Height 64
- Item root: 32 height, px 6, radius 6, icon 22 (mr 8), gap 6
- Sub item: 36 height, px 6
- Item font: `components.nav.item` 14 / 22 / 500 → active 600
- Active item: fg `primary.main`, bg `primary/8%`

### Footer

- Desktop: 1440 wide × ~450 tall (or 164 simple); horizontal padding 144
- Mobile: 375 wide × ~876 tall; padding 16
- Section vertical padding: 24 / 40 / 80
- Social brand colors: facebook `#1877f2`, linkedin `#0a66c2`
- Divider above footer: `#919eab33`
- Body copy: body2 + caption + overline mix

### Portal / popovers (anchored panels)

| Panel | Width | Typical height |
|-------|-------|----------------|
| Language | 160 | 118 |
| Workspaces | 240 | 205 |
| AccountPopover | 200 | 250 |
| Contacts | 320 | 532 |
| Notifications | 420 | 1200 (scrollable) |
| AccountDrawer | 320 | 1024 |
| Settings | 360 | 1280 |
| MainMenu | 1200 | 480 |

- All use `shadow/dropdown` and `radius: 12`

### Grid & Container

- Standard MUI `Grid` (12 columns, 24px gutter)
- Dashboard max-width: `lg` (1200px) or `xl` (1536px) depending on density
- Spacing system: 4 / 8 / 12 / 16 / 24 / 40 / 80 are the canonical steps

### Whitespace philosophy

- **Density first, breathing room second** — this is a dashboard kit; assume tables, lists, KPI cards stacked tight
- Use `background.neutral` to *group* dense regions instead of adding more padding
- Reserve generous whitespace for marketing-style hero sections and empty states

## 8. Iconography

### Stroke / glyph families used

| Family | Role |
|--------|------|
| **Solar** (`ic-solar:*` solid + duotone) | Primary working set — actions, objects, status |
| **Eva** (`ic-eva:*`) | Arrows, search, checkmark, ellipsis, attach |
| **Mingcute** (`ic-mingcute:*`) | Calendar variants, fullscreen, OS marks, density toggles |
| **Custom** (`ic-custom:*`) | Sidebar fold/unfold, drag handle, send, loading, flash |
| **Carbon** (`ic-carbon:*`) | Logistics — rocket, bicycle, delivery, skill levels |
| **Material Symbols rounded** | Table density rounded |
| **Flowbite** | Column-density toggles |
| **Ic (round-*)** | round-vpn-key, round-filter-list, round-label-important |

### Inline UI icon sizes

| Size | Use |
|------|-----|
| 24 | Default — table action, alert leading icon, nav-vertical icon, Fab/Avatar slot |
| 22 | Nav-horizontal / nav-mini icon, Pagination lg arrow |
| 20 | TextField adornments, MenuItem leading, Checkbox/Radio sm, rating sm |
| 18 | Accordion chevron, Pagination sm arrow |
| 16 | Helper-text icon, Chip-sm delete icon, rating x-sm |
| 12 | Rating xx-sm, mini badge tick |

### Composite icons / iconography slots

| Slot | Size |
|------|------|
| Empty-state icons (`icons/empty/*`) | 120×120 |
| "Other" badge icons (password, email-inbox) | 96×96 |
| Plan icons (`ic-plans/*`) | 64×64 |
| Glass illustrations | 64×64 |
| Faqs icons | 64×64 |
| Booking icons | 120×120 |
| Home tile icons (`ic-design`, `ic-development`, `ic-make-brand`) | 48×48 |
| Arrow tip | 48×48 |
| File-type icons | 40×40 |
| Brand logos (Spotify / Netflix / Amazon / IBM / HBO / LYA) | height 40, variable width |
| Country flags | 28×20 |
| Payment cards | mastercard / visa 36×24, paypal 24×24 |
| Settings nav glyphs (vertical / horizontal / mini render) | 86×64 |
| Social icons (facebook / instagram / linkedin / twitter / github / google) | 24×24 |
| Notification subtype icons (chat / mail / order / delivery) | 24×24 |
| App icons (dropbox / drive / onedrive) | 24×24 |
| Platform icons (figma / js / ts / nextjs / amplify / supabase / mui / vite / auth0 / firebase / jwt / react) | 24×24 |

### Icon opacity convention

`_other/icon-opacity = 40` — the muted opacity step used on duotone backgrounds and on inactive icon variants.

### Logo

- **Single mark**: 512×512 (Primary / Light variants)
- **Full lockup** (icon + wordmark): 360×128 (Primary / Secondary / Light variants)

## 9. Backgrounds & Illustrations

### Shape backgrounds (used as decorative overlays)

| Token | Variants | Size |
|-------|----------|------|
| `background/shape-circle` | Style 1–5 | 240×240 each |
| `background/shape-square` | Style 1–4 | 240×240 (Style 4: 320×240) |
| `background/shape-grid` | — | 1152×346 |
| `background/overlay` | — | 1440×1024 |
| `background/background-2` | — | 1440×1080 |
| `background/background-3` | + blur companion (1440×1080) | 1440×1080 |
| `background/background-4` | — | 960×720 |
| `background/background-5/6/7` | — | 640×360 |

### Illustrations

| Token | Size |
|-------|------|
| `illustration-dashboard` | 720×540 |
| `illustration-rocket-large` | 480×480 |
| `illustration-rocket-small` | 112×112 |
| `illustration-receipt` | 360×360 |
| `illustration-upgrade` | 120×150 |
| `illustration-motivation` / `seo` / `order-complete` / `coming-soon` / `maintenance` / `upload` / `404` / `403` / `500` | 480×360 |
| `illustration-background` | 480×360 |

### Characters (480-tall illustration set)

| Character | Width |
|-----------|-------|
| `character-happy-jump` | 345 |
| `character-fly` | 338 |
| `character-maintenance` | 307 |
| `character-notification` | 275 |
| `character-present` | 264 |
| `character-study` | 264 |
| `character-reject` | 242 |
| `character-question` | 220 |

## 10. Responsive Behavior

### Breakpoints (MUI defaults)

| Name | Width | Key changes |
|------|-------|-------------|
| `xs` | <600px | Single column, mobile headlines, sidebar collapses to drawer |
| `sm` | 600–900px | Two-column grids begin, h1/h2/h3 step up, tab list spacing 24 |
| `md` | 900–1200px | Sidebar visible, h1/h2/h3 step up further, container px 144 |
| `lg` | 1200–1536px | Standard desktop, h1/h2/h3 reach final size |
| `xl` | ≥1536px | Wide dashboards, multi-pane layouts |

### Container & header

- Container `main` padding-x: 144 (desktop), 16 (mobile)
- Header desktop padding-x: 40
- Header heights: 72 (main desktop), 64 (dashboard/mobile)

### Form control heights

| Control | sm | md | lg | xl |
|---------|----|----|----|----|
| Button | 30 | 36 | 48 | 56 |
| ToggleButton standalone | 40 | 48 | 56 | — |
| Fab circular | 40 | 48 | 56 | — |
| Fab extended | 36 | 40 | 48 | — |
| IconButton (p) | 5 | 8 | 12 | — |
| TextField outlined | 36 (py 8) | 56 (py 16) | — | — |
| Switch height | 24 | 38 | — | — |
| Switch width | 25 | 33 | — | — |
| Slider thumb / rail | 16 / 6 | 20 / 10 | — | — |
| Rating icon | 20 | 24 | 28 | — |
| Chip height | 24 | 32 | — | — |
| Pagination item | 26 | 32 | 40 | — |

### Table row heights

- Head row ≈ 56; body row ≈ 72 (default density); compact 52

### Collapsing strategy

- Sidebar: 280 expanded → 88 mini → drawer overlay on `xs`/`sm`
- Multi-column dashboard: 4-up KPI cards → 2-up at `md` → 1-up at `xs`
- Tables: progressive column hiding, then horizontal scroll, then card-list fallback at `xs`
- Dialogs: full-screen on `xs`, centered modal from `sm` upward
- Display headlines: 64 (`lg`) → 58 (`md`) → 52 (`sm`) → 40 (`xs`) for `h1`
- Tab list spacing: 40 desktop, 24 mobile

## 11. Do's and Don'ts

### Do

- Use `primary.main` `#00a76f` for the page's primary CTA — exactly one per view
- Pair `rail/16%` background with `rail.dark` text for soft status chips/alerts (e.g. success `#22c55e29` + `#118d57`)
- Drive all hover/selected/focus states from the `action.*` overlays (alpha grey-500), never custom rgba
- Use Barlow only for `hero`, `h1`–`h3` display roles; let Public Sans handle `h4`–`h6` and below
- Keep buttons in sentence case — the `textTransform: 'unset'` override is intentional
- Use `background.neutral` `#f4f6f8` to group dense regions before adding padding
- Match border colors to `#919eab33` (20%) for default borders; `#919eab52` (32%) only when a control specifically asks for it (outlined button, switch off-track)
- Use `shadow/card`, `shadow/dropdown`, `shadow/dialog` composites for their named surfaces — don't reach for the plain `z*` ladder for those
- Apply brand shadows (`shadow/<rail>`) only on filled-brand controls (CTA buttons, Fab, colored IconButton) — the kit uses them as a rest-state highlight, not as a hover
- Use the `components.backdrop` token (`#161c247a`) for modal scrims — it's a specific slate-tinted alpha, not generic grey/80%

### Don't

- Don't use `secondary.main` `#8e33ff` as a co-equal CTA — it's a foil, not a primary action
- Don't UPPERCASE button labels — Minimal explicitly removes MUI's default uppercase
- Don't use Barlow for body text or table cells — Public Sans is the data face
- Don't combine an `outlined` border with a non-zero `elevation` shadow on the same surface
- Don't introduce off-palette colors when a semantic rail (info/success/warning/error) already covers it
- Don't use pure `#000` for shadows in light mode — the `grey/500` channel produces the correct warm-cool diffusion
- Don't skip `contrastText` — every rail ships one, and `warning.contrastText` is `#1c252e` (slate), not white
- Don't override the line-heights with px values that aren't the ratio (e.g. body2's 22/14, h6's 28/18)
- Don't apply primary green to disabled states — disabled foreground is `#919eabcc` (action.disabled), bg `#919eab3d`
- Don't hard-code button padding as `8px 22px` — the kit uses `6px 12px` (md), `4px 8px` (sm), `8px 16px` (lg)
- Don't reuse `radius: 8` for everything — Snackbar is 12, Chip-md is 10, Tooltip is 6, Menu/Popover containers are 12
- Don't use a single alpha (`0.20`) to render every divider — the kit's tokens differ (input outlined 20%, button outlined 32%, slider rail 12%, slider marks 48%)

## 12. Agent Prompt Guide

### Quick color reference

```
Primary CTA               #00a76f      Hover/pressed         #007867
Secondary accent          #8e33ff      Info                  #00b8d9
Success                   #22c55e      Success bg (soft)     #22c55e29
Warning                   #ffab00      Warning text contrast #1c252e
Error                     #ff5630      Page background       #ffffff
Card surface              #ffffff      Subtle surface        #f4f6f8
Heading text              #1c252e      Body text             #637381
Border                    #919eab33    Hover overlay         #919eab14
Selected overlay          #919eab29    Focus overlay         #919eab3d
Disabled text             #919eabcc    Disabled bg           #919eab3d
Tooltip surface           #1c252e      Tooltip text          #ffffff
Modal backdrop            #161c247a    Switch off-track      #919eab7a
```

### Quick measurement reference

```
Radius default            8            Snackbar radius        12
Tooltip radius            6            Modal radius           16
Button md padding         6 × 12       Button md min-height   36
Button radius             8            Button gap             8
Chip md height            32           Chip md radius         10
Chip sm height            24           Chip sm radius         8
TextField outlined md     56 (py 16)   TextField px           14
NavVertical width         280          NavMini width          88
Header desktop / mobile   72 / 64      Container px           144 / 16
Card shadow                shadow/card (12 24 -4 grey/12% + 0 0 2 grey/20%)
Dropdown shadow            shadow/dropdown (-20 20 40 -4 grey/24% + 0 0 2 grey/24%)
Dialog shadow              shadow/dialog (-40 40 80 -8 black/24%)
```

### Example component prompts

- **KPI card** — "Build a KPI card on `#ffffff` background, 16px radius, 24px padding, `shadow/card` (composite: `0 12px 24px -4px #919eab1f, 0 0 2px 0 #919eab33`). Caption `12px / 18 / 400 / #637381` for the metric label, then a 32px Public Sans 700 number for the value, then a soft success chip below: `#d3fcd2` bg with `#118d57` text, 10px radius, 0 4px padding, 32px height, font `13 / 18 / 500`."

- **Primary CTA** — "Primary medium Button: `#00a76f` background, `#ffffff` text, Public Sans 14/24/700 sentence case (no uppercase), 8px radius, padding 6px 12px, min-height 36, min-width 64, gap 8 between icon and label. Shadow: `0 8px 16px 0 #00a76f3d` at rest. Hover: bg `#007867`. Disabled: bg `#919eab3d`, text `#919eabcc`. No shadow when disabled."

- **Outlined Button** — "Outlined medium Button: transparent bg, `#1c252e` text, 1px `#919eab52` border, 6px 12px padding, min-height 36, 8px radius, Public Sans 14/24/700. Hover: bg `#919eab14` (no border change). Focus ring: bg `#919eab3d`."

- **Data table** — "Data table: head row 56px tall, `subtitle2`-style cells (14/24/600 `#1c252e`) on `#f4f6f8` head bg; body cells `body2` (14/22/400) with 40px vertical padding, default row height 72, alternating row tint `#ffffff` / `#fcfdfd`, cell bottom border `1px solid #919eab33`. Row hover bg `#919eab14`. Selected row bg `#00a76f14` with a 3px-wide `#00a76f` left indicator."

- **Sidebar nav (vertical, expanded)** — "Sidebar 280px wide, transparent bg, 1px right border `#919eab33`. Internal padding-x 16, item gap 4. Each root item: 44px tall, padding 4px 8px 4px 12px, 8px radius, 14/22/500 `#637381` text, 24px leading icon (margin-right 12), 16px gap to label. Active root: bg `#00a76f14`, text/icon `#00a76f`, weight 600, plus a 2px-wide `#00a76f` left indicator. Sub-item: 36px tall, same radius, no icon, indented 24."

- **Sidebar nav (mini, collapsed)** — "Sidebar 88px wide, padding-x 4. Each item: 76×58, padding 8px top / 6px bottom, 22px icon (padding-top 11), 10/16/500 label beneath the icon with 6px gap. Active: bg `#00a76f14`, icon + text `#00a76f`, weight 600."

- **Modal dialog** — "Dialog: `#ffffff` surface, 16px radius, max-width 560px, shadow `-40px 40px 80px -8px #0000003d`. Header pl 24 / py 24 / pr 12; title `h6` (Public Sans 18/28/600), close button = 40-box circular icon-button on the right. Body content padding px 24. Actions footer: px 24 py 24, gap 12, right-aligned with outlined secondary button + primary green button. Backdrop `#161c247a`."

- **Status chip set (soft)** — "Status chips, 32px tall, 10px radius, padding 0 4px, gap 8, `13/18/500`. Variants: success `#d3fcd2`/`#118d57`, warning `#fff5cc`/`#b76e00`, error `#ffe9d5`/`#b71d18`, info `#cafdf5`/`#006c9c`, primary `#c8fad6`/`#007867`."

- **Tooltip** — "Tooltip: `#1c252e` background, `#ffffff` text, 6px radius, padding 3px 6px, caption typography (12/18/400)."

- **Snackbar** — "Snackbar: `#ffffff` paper bg, 12px radius, shadow `0 8px 16px 0 #919eab29`. Leading icon container: 40-box with `rail/8%` tint. Body subtitle2 (14/22/600). Trailing close icon-button md (p 8, radius 500). Inner padding: pl 4, py 4, gap 12."

- **Slider (md)** — "Slider: 10px-tall rail, 500-radius. Inactive rail `#919eab1f`, active rail `#00a76f`. Thumb 20×20 circle, white fill with `shadow/z1`. Marks `#919eab7a`. Value label tooltip: `#1c252e` bg, `#ffffff` caption text, 4px radius, padding 3px 6px."

### Iteration guide

1. **Choose the rail before the value** — pick `primary` / `secondary` / `info` / `success` / `warning` / `error` based on meaning, then use `lighter` / `main` / `dark` / `darker` stops; never mix custom hex into a semantic slot.
2. **One primary CTA per view** — emerald `#00a76f` is the page's call to action; everything else uses outlined, text, or a softer rail.
3. **Body in Public Sans, display in Barlow** — Barlow ends at `h3` (and `hero`); do not pull it into `h4` or smaller.
4. **Sentence case buttons** — Minimal removes MUI's default UPPERCASE.
5. **Action states from `grey/500` alpha overlays** — `0.08` hover, `0.16` selected, `0.24` focus, `0.80` disabled foreground, `0.24` disabled background.
6. **Choose elevation OR border, not both** — outlined cards skip shadow; elevated cards skip border.
7. **Status colors are paired tints** — the `rail/16%` background + `rail.dark` text combination is the canonical soft pattern.
8. **Shadows track the active mode** — light mode uses `grey/500`-channel alpha; dark mode uses `common.black` alpha; don't paste `rgba(0,0,0,…)` directly.
9. **Use composite shadow tokens for named surfaces** — `shadow/card` for cards, `shadow/dropdown` for menus/popovers, `shadow/dialog` for modals; reach for the `z*` ladder only for ad-hoc layered surfaces.
10. **Use brand shadows on rest, not hover** — `shadow/primary` belongs at-rest on a primary CTA; hover swaps to `rail.dark` background without adding more shadow.
11. **Use the component-specific typography tokens** — `components.button.medium`, `components.nav.item`, `components.chip.label` — instead of guessing from `body2`/`subtitle2`; weights and line-heights diverge by design.
12. **Backdrop is a specific token** — `#161c247a` (`components.backdrop`), not `grey.800 / 0.80`.

## 13. Reference fixture

This system ships **two** sibling files agents must reach for before
writing markup:

- [`tokens.css`](./tokens.css) — the `:root` block containing every
  token named above as a CSS variable. Paste it verbatim into the first
  `<style>` of any artifact and reference values through `var(--…)` —
  the standard schema names (`--bg`, `--surface`, `--fg`, `--muted`,
  `--border`, `--accent`, `--success`, `--warn`, `--danger`,
  `--font-display`, `--font-body`) satisfy the daemon lint
  (`apps/daemon/src/lint-artifact.ts`), and the `--minimal-*` prefix
  carries the rich Minimal kit (semantic rails × 5 stops × alpha,
  z-ladder, composite + brand shadows, component typography slots, and
  component dimensions).
- [`components.html`](./components.html) — paste-ready reference markup
  for the kit's signature components, all under the `.minimal-*` class
  prefix. Sections covered: color rails, full typography ladder,
  Button (sm/md/lg × contained/outlined/soft/text × all rails) +
  IconButton, Form controls (Input/Select/Textarea/Checkbox/Radio/
  Switch + helper text), Chip/Label/Badge/Avatar, Alert/Tooltip/
  Snackbar, Breadcrumb/Tabs/Pagination, Main + Dashboard Header,
  NavVertical/NavMini/NavHorizontal sidebars, Card (elevated/
  outlined/gradient), Table (with selected-row indicator), and
  Dialog.

If a render agent needs the canonical Minimal Header (or Card, or
Table, or Sidebar), it should copy the corresponding selector block
out of `components.html` rather than re-deriving the markup from this
prose. The fixture and the prose stay in sync because every value in
both files traces back to the same Minimal_Web Figma source
(`jsT3dVXUUS7iHkk4CGY8oe`).

Dark mode is selected by setting `data-color-scheme="dark"` on the
`<html>` element (or any ancestor). `tokens.css` ships the matching
override block.

