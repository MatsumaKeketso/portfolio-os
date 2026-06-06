# GenOS Theme System

> This file describes the **runtime theme layer** — how presets switch the brand colors and a few semantic tokens at runtime. For the full design system (primitive tokens, OS tokens, AppShell contract, primitives), see [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md). That doc takes precedence; this file only covers the theme preset mechanism.

## What the theme layer actually does

The theme layer is a thin runtime override on top of the static OS design tokens. It does **not** control most of the OS surface language — chrome, canvas, line, text, and ink tokens are defined statically in `src/index.css` and are not theme-variable. As of 2026-06-06 the theme is a **single brand color**: there is no secondary/tertiary/accent and no light mode. The theme layer is responsible for:

1. **One brand color** (`primary`). From that single hex, `src/lib/brandRamp.ts` generates an 11-stop tint/shade ramp (`--brand-50 … --brand-2100` + `--brand` = the verbatim hex) in OKLCH. Every brand-related decision (focus, hover, subtle fill, border, glow) derives from a ramp stop.
2. The brand semantic tokens that resolve to ramp stops (`bg-brand-solid` → `--brand-600`, `fg-brand` → `--brand-300`, `stroke-brand` → `--brand-600`, `stroke-focus` → `--brand-400`, accent → brand).
3. Border radius, spacing density, and icon style global preferences.

Secondary/tertiary/accent were removed from the theme model. The legacy `--color-secondary/tertiary/accent` CSS vars are still emitted (pointed at the brand) so any un-migrated `secondary-*`/`accent-*` utility stays on-brand instead of breaking, but they are not distinct colors anymore.

**Light mode was dropped.** `:root` in `src/index.css` is now the single canonical dark palette; the old `.dark` override block is gone. Genuine light islands (the start button, content-mode windows) use the separate `--os-canvas` / `--os-text-strong` tokens directly — not a light/dark theme switch.

If you want to change a surface color, a border treatment, or a text tone, do it in `src/index.css` or `tailwind.config.js`, not in a theme preset. Presets exist so visitors can pick a brand hex without us shipping multiple design systems.

## Architecture

```
src/
├── index.css                       # primitive + OS + semantic CSS variables (Layer 1–2)
├── theme/
│   ├── theme.ts                    # static TS theme object: spacing, shadows, z-index, component defaults
│   ├── ThemeProvider.tsx           # React context provider
│   ├── helpers.ts                  # getColor / getSpacing / getShadow / etc.
│   └── index.ts                    # public API
└── store/themeStore.ts             # runtime preset store — overrides Layer 2 brand vars + radius/spacing
```

## Default theme

The default preset is **Generative Studio** — brand red `#ef4444`. It is the first entry in the preset list and the fallback both at startup and when CSS variables haven't loaded yet. (A preset is now just one hex; the ramp does the rest.)

Earlier docs described Star Citizen cyan as the default. That changed in session 3 (2026-05-05). Anywhere a doc shows `#667eea` blue, `glass.dark`, or a "blue → purple gradient" — that is legacy. The current direction uses Generative Studio red routed through `--color-bg-brand-*` and `--color-fg-brand` semantic tokens.

## Available presets

| Preset | Brand hex | Use case |
|---|---|---|
| **Generative Studio** (default) | red `#ef4444` | the brand default |
| **Product Mono** | ink `#111111` | clean mono tone |
| **Star Citizen** | cyan `#00d9ff` | legacy/sci-fi look |
| **Ocean Blue / Forest Green / Purple Haze / Sunset Orange / Monochrome / Cyberpunk** | one hex each | legacy color variants |

Each preset is now a single brand hex (plus the independent radius/spacing/icon-style prefs). All presets live in `src/store/themeStore.ts`. Adding a preset means adding `{ name, theme: { colors: { primary } } }` — do not introduce a new component variant per theme.

## How a preset applies

`themeStore.applyThemeToDom()` takes the one brand hex and:

```
generateBrandRamp(hex) →  --brand-50 … --brand-2100  (space-separated "r g b")
                          --brand                     (verbatim hex)
```

It also emits legacy `--color-primary` (comma `R, G, B`) and points `--color-secondary/tertiary/accent` at the same brand value for backward compatibility. The brand **semantic** tokens (`--color-bg-brand-*`, `--color-fg-brand`, `--color-stroke-brand`, `--color-stroke-focus`, accent) are wired in `src/index.css` to ramp stops and do **not** need to be set per preset — they cascade from `--brand-*`.

A preset **must not** override:
- `--os-ink-*`, `--os-canvas`, `--os-canvas-*`, `--os-line-*`, `--os-text-*` — these are the static OS surface system.
- `--primitive-gray-*` — the raw color ladder.
- `--os-type-*` and `--os-font-*` — typography is system-wide.

## Border radius, spacing, icon style

These are global preferences set via `data-*` attributes on `<html>`, not via CSS variables:

```html
<html data-border-radius="md" data-spacing="normal" data-icon-style="default">
```

Options:

| `data-border-radius` | Effect |
|---|---|
| `none` / `sm` / `md` / `lg` / `xl` | overrides `.window`, `.rounded`, `.rounded-lg`, `.rounded-xl` globally |

| `data-spacing` | Effect |
|---|---|
| `compact` / `normal` / `comfortable` | scales `.p-*` and `.gap-*` via `--spacing-multiplier` |

| `data-icon-style` | Effect |
|---|---|
| `default` (8px radius) / `rounded` (circle) / `sharp` (0 radius) | applies to `.desktop-icon`, `.app-icon` |

These are set from the Settings app and persisted by `themeStore`/`desktopStore`.

## Using the theme in components

Most components should **not** call `useTheme()`. They should use Tailwind utilities that resolve to semantic tokens:

```tsx
// Preferred — semantic Tailwind utility
<button className="bg-brand-solid hover:bg-brand-solid-hover text-fg-on-primary">
  Save
</button>

// Also preferred — OS chrome utility
<div className="bg-os-ink-900 border border-os-line-dark text-os-text-inverse">
  …
</div>
```

The `useTheme()` hook is only needed when a component reads spacing, shadows, z-index, or component defaults from `src/theme/theme.ts`:

```tsx
import { useTheme } from '../theme';

function FloatingPanel() {
  const { theme } = useTheme();
  return <div style={{ zIndex: theme.zIndex.tooltip }}>…</div>;
}
```

Or use the helpers:

```tsx
import { getZIndex, getSpacing } from '../theme/helpers';

<div style={{ zIndex: getZIndex('tooltip'), padding: getSpacing('md') }} />
```

## Component defaults

`src/theme/theme.ts` defines default `variant`/`size`/`padding` for shared primitives. These are reference values — current components (Button, AppShell, SystemRow) source their variants directly from their own CVA definitions in `src/components/ui/`. The `theme.components.*` object is preserved for future centralization but is not the live source of truth for variant styling.

## Best practices

### Do

- Source color from Tailwind utilities that resolve to semantic tokens (`bg-os-ink-900`, `text-fg-brand`, `border-os-line-dark`).
- Pick the surface role first (chrome/content/floating/inset/media) and reach for the matching primitive.
- Use `os-type-*` classes or `<Typography>` for type. Use `os-interactive` + `os-focus-ring` for interaction.
- Use the AppShell contract for every app body (see [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) §The App Contract).

### Don't

- Don't hardcode hex (`bg-[#141414]`) or Tailwind palette colors (`bg-blue-500`) for brand intent. Use semantic tokens.
- Don't override OS ink/canvas/line tokens from a theme preset. Those are system-wide.
- Don't import from `src/components/ui/card.tsx`, `ui/input.tsx`, or non-`MediaSurface` exports of `ui/surface.tsx`. They are dead-code legacy.
- Don't add backdrop-blur to draggable window bodies. Drag performance regresses.
- Don't add magic `z-index` numbers. Use the `theme.zIndex` map.

## Migration from older theme code

If you find code that looks like this:

```tsx
// Legacy — do not copy
<div style={{ background: 'rgba(17, 24, 39, 0.95)', backdropFilter: 'blur(40px)' }}>
<div className="bg-gradient-to-r from-blue-600 to-purple-600">
<div className="bg-[#141414]">
```

Migrate to:

```tsx
<div className="bg-background-floating backdrop-blur-md">           {/* if floating */}
<div className="bg-brand-solid hover:bg-brand-solid-hover">          {/* if brand button */}
<div className="bg-background-chrome">                               {/* if chrome */}
```

For the full migration recipe (toolbar buttons, status pills, inputs, cards), see [docs/DESIGN_SYSTEM.md §Migration Guide](./docs/DESIGN_SYSTEM.md#migration-guide).
