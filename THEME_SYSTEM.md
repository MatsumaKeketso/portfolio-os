# GenOS Theme System

> This file describes the **runtime theme layer** — how presets switch the brand colors and a few semantic tokens at runtime. For the full design system (primitive tokens, OS tokens, AppShell contract, primitives), see [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md). That doc takes precedence; this file only covers the theme preset mechanism.

## What the theme layer actually does

The theme layer is a thin runtime override on top of the static OS design tokens. It does **not** control most of the OS surface language — chrome, canvas, line, text, and ink tokens are defined statically in `src/index.css` and are not theme-variable. The theme layer is responsible for:

1. The four brand color channels (`primary`, `secondary`, `tertiary`, `accent`) that flow through the brand semantic tokens.
2. The few semantic tokens that should shift with a preset (`bg-brand-solid`, `fg-brand`, `stroke-brand`, etc.).
3. Border radius, spacing density, and icon style global preferences.

If you want to change a surface color, a border treatment, or a text tone for every theme, do it in `src/index.css` or `tailwind.config.js`, not in a theme preset. Presets exist so visitors can pick a brand palette without us shipping nine different design systems.

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

The default preset is **Generative Studio** — red brand colors (`#ef4444`, `#dc2626`, `#f97316`, `#fbbf24`). It is the first entry in the preset list and the fallback both at startup and when CSS variables haven't loaded yet.

Earlier docs described Star Citizen cyan as the default. That changed in session 3 (2026-05-05). Anywhere a doc shows `#667eea` blue, `glass.dark`, or a "blue → purple gradient" — that is legacy. The current direction uses Generative Studio red routed through `--color-bg-brand-*` and `--color-fg-brand` semantic tokens.

## Available presets

| Preset | Primary | Use case |
|---|---|---|
| **Generative Studio** (default) | red `#ef4444` | the brand default |
| **Product Mono** | ink `#111111` + emerald accent | clean dashboard tone |
| **Star Citizen** | cyan `#00d9ff` | legacy/sci-fi look |
| **Ocean Blue / Forest Green / Purple Haze / Sunset Orange / Monochrome / Cyberpunk** | varied | legacy color variants |

All presets live in `src/store/themeStore.ts`. Adding a new preset means adding an entry to the preset list — do not introduce a new component variant per theme.

## CSS variables a preset can override

A preset is expected to set:

```css
--color-primary: R, G, B            /* brand main */
--color-secondary: R, G, B
--color-tertiary: R, G, B
--color-accent: R, G, B
--color-primary-hover: R, G, B      /* derived ~10% darker */
```

Plus the brand semantic tokens (in dark mode the preset may also adjust `--color-bg-brand-subtle*` and `--color-bg-brand-solid-focus`).

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
