# GenOS Design System

> Canonical source of truth for tokens, primitives, and the app contract. Other docs (`LOOK_AND_FEEL.md`, `PRODUCT_DIRECTION.md`, `OS_BEHAVIOR_MODEL.md`, `THEME_SYSTEM.md`) describe **intent**; this doc describes **what is in the codebase** and how to use it. If those docs disagree with this one, this doc wins for implementation.

## Overview

GenOS uses a layered design system. A change should be made at the lowest layer that owns the decision, then flow up. New visual decisions do **not** live in app components.

```
Layer 1  Primitive color channels        — src/index.css : --primitive-gray-*
         (raw HSL/RGB values, never used directly in components)
            ↓
Layer 2  OS + semantic CSS variables     — src/index.css : --os-* / --color-bg-* / --color-fg-* / --color-stroke-*
         (named slots that components and tailwind utilities resolve to)
            ↓
Layer 3  Theme presets                    — src/store/themeStore.ts
         (Generative Studio, Product Mono, etc. — override Layer 2 at runtime)
            ↓
Layer 4  Tailwind utilities + os-* CSS    — tailwind.config.js + src/index.css @layer utilities
         (bg-os-ink-950, text-os-text-muted, os-type-body, os-interactive, etc.)
            ↓
Layer 5  Shared component primitives      — src/components/ui/
         (Button, SystemRow, AppShell, Typography, control.tsx, MediaSurface)
            ↓
Layer 6  App components                   — src/components/apps/*
         (composed from AppShell + Layer 5 + Layer 4 utilities)
```

**Do not skip layers.** App components must source color from Layer 4 utilities (or Layer 5 primitives that wrap them). They must not use raw hex (`bg-[#141414]`), raw white-alpha (`border-white/[0.08]`), or Tailwind palette colors (`bg-blue-500`) when a semantic token exists.

## Purpose

This document exists so we stop redesigning the same surface three times in three different apps. Every shell component, every input, every card-like surface, every row in a list should resolve back to one of the primitives below. If you find yourself reaching for raw hex or raw alpha inside an app component, the primitive you need either exists and you missed it, or the primitive needs to be added here first.

---

## Token Reference

### Layer 1 — Primitive color channels

Raw grayscale ladder. Defined as space-separated RGB triplets so they work with Tailwind's `rgb(var(--token) / <alpha-value>)` syntax. **Never use these directly in components.**

| Token | Value | Use through |
|---|---|---|
| `--primitive-gray-50` | `250 250 250` | semantic `bg-primary` |
| `--primitive-gray-100` | `245 245 243` | semantic `bg-secondary` |
| `--primitive-gray-200` | `235 235 235` | semantic `bg-tertiary` |
| `--primitive-gray-300` | `214 214 214` | control active |
| `--primitive-gray-400` | `184 184 184` | foreground disabled |
| `--primitive-gray-600` | `115 115 115` | foreground tertiary |
| `--primitive-gray-800` | `69 69 69` | foreground disabled (dark mode) |
| `--primitive-gray-1000` | `44 44 44` | `--os-ink-700`, chrome raised |
| `--primitive-gray-1300` | `26 26 26` | `--os-ink-800`, chrome floating |
| `--primitive-gray-1700` | `17 17 17` | `--os-ink-950`/`--os-ink-900`, chrome base |
| `--primitive-gray-2100` | `8 8 8` | reserved |

### Layer 2 — OS tokens (Product Mono base)

These are the workhorses of OS chrome and content. They are **not** theme-variable — switching themes does not change them.

| Token | Value | When to use |
|---|---|---|
| `--os-ink-950` | `gray-1700` (#111) | taskbar, start menu, title bar, admin nav, base chrome |
| `--os-ink-900` | `gray-1700` (#111) | menus, raised chrome (AppToolbar) |
| `--os-ink-800` | `gray-1300` (#1a1a1a) | inputs on dark chrome, raised tiles |
| `--os-ink-700` | `gray-1000` (#2c2c2c) | inset wells |
| `--os-canvas` | `#ffffff` | light app body |
| `--os-canvas-warm` | `#f7f7f5` | desktop bg, secondary panels |
| `--os-canvas-raised` | `#fbfbfa` | cards/controls on light surfaces |
| `--os-line-dark` | `rgba(255,255,255,.055)` | default border on chrome |
| `--os-line-dark-hover` | `rgba(255,255,255,.11)` | hover border on chrome |
| `--os-line-light` | `#e8e8e5` | default border on canvas |
| `--os-line-light-hover` | `#d8d8d4` | hover border on canvas |
| `--os-text-strong` | `#171717` | primary text on canvas |
| `--os-text-muted` | `#666666` | secondary text on canvas |
| `--os-text-faint` | `#9a9a9a` | tertiary text on canvas |
| `--os-text-inverse` | `#ffffff` | primary text on chrome |

Tailwind utilities expose these as `bg-os-ink-950`, `border-os-line-dark`, `text-os-text-strong`, etc.

### Layer 2 — Semantic tokens

Used by buttons, cards, surfaces, and theme presets. These **do** flip on dark mode.

```
Surface backgrounds          Brand backgrounds (from the brand ramp)
bg-primary    bg-secondary   bg-brand-solid    bg-brand-subtle
bg-tertiary   bg-elevated    bg-brand-solid-hover
bg-overlay    bg-chrome      bg-brand-solid-focus
bg-chrome-raised             bg-brand-subtle-hover
bg-floating                  bg-brand-50 … bg-brand-2100 (ramp stops)

Accent (folded into brand ramp)        Feedback
bg-accent                              bg-success / bg-success-subtle
bg-accent-hover                        bg-error   / bg-error-subtle

Control                                Foreground
bg-control            fg-primary       fg-on-primary
bg-control-hover     fg-secondary      fg-on-secondary
bg-control-active    fg-tertiary       fg-brand / fg-brand-hover
bg-control-disabled  fg-disabled       fg-success / fg-warning / fg-error / fg-info

Stroke
stroke-primary       stroke-brand
stroke-secondary     stroke-focus
stroke-success / stroke-warning / stroke-error / stroke-info
```

### Layer 2 — Typography

Ant Design–inspired scale. All sizes/line heights live in CSS variables; shared components should consume them through the `<Typography>` primitive. The `os-type-*` utility classes remain available for class-helper strings and legacy code, but new JSX should prefer `<Typography>`.

| Class | Size / line | Weight | Use |
|---|---|---|---|
| `os-type-display` | 38 / 46 | 600 | hero values |
| `os-type-title-1` | 30 / 38 | 600 | page titles |
| `os-type-title-2` | 24 / 32 | 600 | section titles |
| `os-type-title-3` | 20 / 28 | 600 | card titles |
| `os-type-title-4` | 16 / 24 | 600 | row titles |
| `os-type-body` | 14 / 22 | 400 | body text |
| `os-type-body-strong` | 14 / 20 | 600 | emphasized body |
| `os-type-secondary` | 14 / 22 | 400 | muted body |
| `os-type-caption` | 12 / 16 | 400 | metadata |
| `os-type-label` | 12 / 16 | 600 uppercase | small uppercase labels |
| `os-type-menu-title` | 13 / 18 | 600 | menu/row titles |
| `os-type-menu-description` | 12 / 16 | 400 | menu/row descriptions |
| `os-type-window-title` | 13 / 18 | 600 | title bars |
| `os-type-value` | 32 / 40 | 600 | large numeric values |
| `os-type-code` | 12 / 16 | mono | code/keyboard |

Never hardcode `text-[14px] leading-[22px]`. Use `<Typography variant="…">`, or an `os-type-*` class only when authoring a reusable class helper.

### Layer 2 — Interaction primitives

Defined in `src/index.css @layer utilities`. These encode the OS's motion + focus language so it can be tuned in one place.

| Class | Purpose |
|---|---|
| `os-interactive` | 180ms cubic-bezier transition + 1px lift on hover, neutralized on active. Respects `prefers-reduced-motion`. |
| `os-focus-ring` | 1px hairline + 3px brand glow on `:focus-visible`. |
| `os-row-hover` | 160ms transition + subtle dark fill on hover. For SystemRow-style rows. |
| `os-surface-soft` | `bg-os-ink-900/0.82` + `border-os-line-dark`. |
| `os-surface-raised` | `bg-os-ink-800/0.72` + `border-os-line-dark-hover`. |
| `halftone-hover` | Editorial dot screen on hover; used by `MediaSurface`. |

### Layer 3 — Theme presets (single brand color)

As of 2026-06-06 the theme is **one brand color**. A preset is a single hex; `src/lib/brandRamp.ts` generates an 11-stop OKLCH tint/shade ramp from it (`--brand-50 … --brand-2100`, plus `--brand` = the verbatim hex). Themes only set that one color — they do not change OS ink/canvas/line/text tokens. Secondary, tertiary, and accent **no longer exist** as distinct theme colors (legacy `--color-secondary/tertiary/accent` are still emitted, pointed at the brand, for backward compatibility only).

The brand **semantic** tokens cascade from the ramp in `src/index.css` and should not be set per preset:

| Semantic token | Ramp stop |
|---|---|
| `--color-fg-brand` / `fg-brand` | `--brand-300` (light, for contrast on `#111`) |
| `--color-fg-brand-hover` | `--brand-200` |
| `--color-bg-brand-solid` | `--brand-600` |
| `--color-bg-brand-solid-hover` | `--brand-800` |
| `--color-bg-brand-subtle` | `rgb(var(--brand) / 0.10)` |
| `--color-stroke-brand` | `--brand-600` |
| `--color-stroke-focus` | `--brand-400` |
| `--color-bg-accent` (legacy accent) | `--brand-300` |

The default at startup is **Generative Studio** (red `#ef4444`). Product Mono, Star Citizen, and the older list (Ocean Blue, Forest Green, Purple Haze, Sunset Orange, Monochrome, Cyberpunk) remain selectable — each is now just one hex.

**Light mode was dropped.** `:root` is the single canonical dark palette; there is no `.dark` block. Light islands use `--os-canvas`/`--os-text-strong` directly.

**Brand usage rules:** the bright brand stops (`fg-brand`/`brand-300`) are for focus rings, active tab/row indicators, selection marks, small badges, critical CTAs, upload progress, and inline content links. Brand must never be a default surface, page background, or repeated divider. Tailwind exposes the ramp as `bg-brand-600`, `text-brand-300`, `border-brand`, etc. (with `/<alpha>` support).

---

## Component Primitives

Everything lives in `src/components/ui/`.

### Currently-in-use primitives

| File | Exports | Used in |
|---|---|---|
| `AppShell.tsx` | `AppShell`, `AppToolbar`, `AppBody`, `AppSidebar`, `AppContent`, `AppSection`, `AppCard`, `AppDivider`, `AppModal`, `AppStickyHeader`, plus class helpers `appInputClass`, `appSelectClass`, `appInteractiveClass`, `appIconButtonClass`, `appSoftButtonClass`, `appTableClass`, `appTableHeaderClass`, `appTableBodyClass`, `appTableRowClass` | every app (12+ apps) |
| `button.tsx` | `Button`, `buttonVariants` | widespread |
| `SystemRow.tsx` | `SystemRow`, `SystemRowGroup`, `SystemRowDivider` | StartMenu, AboutOS |
| `Typography.tsx` | `Typography`, `typographyVariants` | canonical text primitive for shared shell components and new JSX |
| `control.tsx` | `ControlInput`, `ControlSelect`, `AnchoredPanel`, `anchoredPanelClass` | Browser, Finance |
| `surface.tsx` | `MediaSurface` only (other exports are unused legacy) | FileExplorer |
| `SplitCard.tsx` | `SplitCard`, `SplitCardStat`, `SplitCardProps` | FileExplorer grid view (the "floating island" card pattern) |
| `Icon3D.tsx` | `Icon3D`, `Icon3DType`, `Icon3DProps`, `resolveIcon3DType` | FileExplorer grid (rotating 3D file/folder icons) |
| `Badge.tsx` | `Badge`, `BadgeTone`, `BadgeSize`, `BadgeProps` | Timeline chips, tags, status indicators — canonical chip/tag pill |

### Dead exports (do not adopt)

These primitives are compatibility-only or dead legacy. They contradict the current direction (Cyberpunk angled corners, Aceternity backgrounds, blue defaults) and should not be adopted by new code. **Do not add new imports of:**

- `src/components/ui/card.tsx` — compatibility card exports. Prefer `<AppCard>` and add a focused primitive only when there is a real shared need.
- `src/components/ui/input.tsx` — `Input`
- removed `src/components/ui/surface.tsx` exports — `Surface`, `ChromeSurface`, `ContentSurface`, `FloatingSurface`, `InsetSurface`, `SurfaceHeader`, `SurfaceContent`, `SurfaceFooter`, `SurfaceDivider`, `SurfaceGlow`

For card-like containers use `<AppCard>` from AppShell. For inputs use `<input className={appInputClass} …>` or `<ControlInput />` from `control.tsx`. For media use `<MediaSurface>`.

### What's missing (planned)

- `DateRangePicker` (see `LOOK_AND_FEEL.md`).
- A canonical `SettingsShell` (Settings.tsx still defines local `panelClass`/`rowClass`).
- A canonical `MediaToolbarButton` so PDFReader/VideoPlayer/Music/ImageViewer stop styling toolbar action buttons differently.

### Badge — the canonical chip/tag pill

`<Badge>` from `src/components/ui/Badge.tsx` replaces the ad-hoc `<span class="…px-2 py-0.5 rounded text-fg-brand…">` chips that were drifting across apps. Single surface treatment for every tone — color only ever arrives through the leading icon or accent dot, so a wall of badges reads as a family instead of a rainbow.

```tsx
<Badge tone="brand" leading={<Icons.Flag />}>Milestone</Badge>
<Badge tone="warning" leading={<Icons.Lock />}>Private</Badge>
<Badge tone="neutral">design-system</Badge>
<Badge tone="success" indicator>Saved</Badge>   {/* dot instead of icon */}
```

Tone meaning:
- `neutral` — default. Generic tag / category / metadata.
- `brand` — theme-bound. Tracks `--color-primary`, so a "system" badge in the Forest Green theme reads green, and red in Generative Studio. Use for tags affiliated with the system but not carrying semantic state.
- `success` / `warning` / `error` / `info` — fixed semantic meaning. Use sparingly for actual feedback signals (saved, private, restricted, sync state).

Size: `sm` (default — 10px, matches existing chip language) or `md` (11px, used for toolbar pills).

Replaces (do not write new instances of these patterns — refactor to `<Badge>`):
- `<span class="px-2 py-0.5 rounded text-fg-brand bg-brand-subtle border-stroke-brand/40">`
- `<span class="px-2 py-0.5 rounded text-white/55 bg-os-ink-800 border-os-line-dark">`
- Any other inline "small uppercase pill with icon".

### Display cards (SplitCard) and 3D icons (Icon3D)

A separate pattern for "browsable, focusable" tiles — used by FileExplorer's grid view today; intended to spread to Visitor Gallery and any future content browser. These are **not** generic container primitives — use `<AppCard>` for normal panels.

**SplitCard — the "floating island" tile.** Two stacked surfaces (hero + detail) with a gap between them. The detail panel opens when `expanded` is true; collapses by deselection (no chevron). Mirrors the same visual logic as the taskbar dock and window notch: an island floats with breathing room around it instead of being a single rectangle.

```tsx
import { SplitCard, type SplitCardStat } from '../ui/SplitCard';

const stats: SplitCardStat[] = [
  { label: 'Size', value: '3.81 MB' },
  { label: 'Modified', value: '2d ago' },
  { label: 'Type', value: 'PDF' },
];

<SplitCard
  selected={isSelected}
  expanded={isSelected}                       // selection drives expansion
  onClick={(e) => handleSelect(file, e)}
  onDoubleClick={() => openFile(file)}
  onContextMenu={openMenu}
  media={<Icon3D type="folder" animate={isSelected} />}
  title={file.name}
  subtitle="Folder · 12 items"
  action={<button>Open</button>}              // bottom-right of hero
  stats={stats}                               // vertical list, label-above-value
  description="Located in /Documents."
  detailActions={<>…buttons…</>}
/>
```

Notes:
- Layout: place inside a CSS-grid container with `auto-rows-min items-start`. Expansion grows that one column; sibling columns stay frozen.
- Shadows: a layered 3-stop shadow stack ships out of the box (`PANEL_SHADOW` and `PANEL_SHADOW_RAISED`); selected cards use the raised stack.
- Stats: keep to 3-5 items. Each row is `label` (10px uppercase muted) above `value` (14px medium white), with a hairline divider between rows.
- Animation: detail panel uses `{ stiffness: 280, damping: 30 }` — the same spring used by the taskbar island. Reuse those constants when adding sibling primitives.

**Icon3D — viewport-gated rotating 3D icon.** Powered by `@react-three/fiber` (R3F v8) and `three`. Variants for every common file type and named system folder.

```tsx
import { Icon3D, resolveIcon3DType } from '../ui/Icon3D';

<Icon3D
  type={resolveIcon3DType(file)}              // or pass a literal: 'folder' | 'pdf' | …
  size={120}                                   // pixel square
  animate={isSelected}                         // spin only when focused
  tint="#f5b340"                               // optional override
/>
```

Performance contract — **do not bypass:**
1. The canvas mounts only when its container is inside the viewport (+200px buffer). Off-screen cards render a flat Lucide fallback in pure DOM.
2. `frameloop="demand"` is the default — the canvas renders one frame and stops. Set `animate` to spin continuously and pay the GPU cost.
3. Default `animate` to `false`. Flip it true only for the currently focused/selected item. A grid of 30 idle cards = 1 active animation loop, not 30.
4. Variants: `folder`, `folder-{documents,downloads,projects,cv,images,system,trash,gallery,desktop}`, `file`, `pdf`, `image`, `video`, `audio`, `doc`, `code`, `text`. Add new variants by extending `Icon3DType` + `DEFAULT_TINTS` + `FALLBACK_2D_ICON` together.
5. Future migration path: when we standardize a PNG asset pack, swap the internals of `Icon3D` to load a static image without changing any caller. Keep callers using `Icon3D` (don't import `<Canvas>` directly).

Lighting + materials: three-point setup (warm key, cool fill, soft rim) baked into the canvas. Meshes use `MeshPhysicalMaterial` with subtle clearcoat for a soft plastic feel. Tweak in `Icon3D.tsx`'s `<Canvas>` lights and mesh material props — not in callers.

Dependencies: `three`, `@react-three/fiber`, `@react-three/drei` (R3F v8 line, pinned for React 18 compatibility).

---

## The App Contract

Every app inside the OS window system must follow the same five-step contract. This is the rule that keeps app interiors consistent regardless of who built them.

### 1. Register in `desktopStore.ts` with surface metadata

```ts
{
  id: 'my-app',
  name: 'My App',
  icon: 'lucide-icon-name',           // kebab-case Lucide icon name
  type: 'component',
  component: 'MyApp',
  surfaceMode: 'glass',                // 'glass' | 'content' | 'utilityDark' | 'immersive' | 'iframe'
  preferredWindowMode: 'floating',     // 'floating' | 'maximized' | 'fixed'
  mobileBehavior: 'maximize',          // 'maximize' | 'fullscreen' | 'hide'
  minSize: { width: 480, height: 360 },
  defaultSize: { width: 700, height: 500 },
  pinnedToTaskbar: false,
  pinnedToDesktop: true,
  description: 'One-line description shown in Start Menu',
}
```

`surfaceMode` is the contract between the app and `Window.tsx`. It must be set, even if the answer is `'glass'`.

### 2. Build the app body using AppShell primitives

Never compose the layout from raw `<div>`s with hardcoded backgrounds.

```tsx
import {
  AppShell, AppToolbar, AppBody, AppSidebar, AppContent, AppCard, appInputClass,
} from '../ui/AppShell';

export function MyApp() {
  return (
    <AppShell>
      <AppToolbar>{/* breadcrumbs, actions, search */}</AppToolbar>
      <AppBody>
        <AppSidebar>{/* nav */}</AppSidebar>
        <AppContent>{/* main */}</AppContent>
      </AppBody>
    </AppShell>
  );
}
```

### 3. Register the component in `WindowManager.tsx`

```tsx
case 'MyApp': return <MyApp />;
```

### 4. Use `<AppModal>` for in-app dialogs

```tsx
{showDialog && (
  <AppModal onClose={() => setShowDialog(false)} panelClassName="w-[400px] p-6">
    …dialog content…
  </AppModal>
)}
```

### 5. Use `appInputClass`/`appSelectClass` for inputs

```tsx
<input  className={cn(appInputClass,  'px-3 py-2 text-sm w-full')} />
<select className={cn(appSelectClass, 'px-2 py-1 text-xs')} />
```

For toolbar action buttons, use `appIconButtonClass` (icon-only) or `appSoftButtonClass` (icon + label). Do not invent local `bg-white/[0.06] hover:bg-white/[0.10]` patterns.

---

## Surface Taxonomy

The OS divides every drawable area into one of five surface roles. Pick the right role first, then look up the primitive that owns it.

| Role | Where it lives | Primitive | Visual recipe |
|---|---|---|---|
| **Chrome** | Taskbar, Start Menu, window title bar, admin nav, context menu | `bg-background-chrome` (`#111`) + `border-os-line-dark` | Opaque dark, no blur on draggable surfaces. |
| **Window body** | Inside `<Window>` (any app) | `Window.tsx` — solid by default | **No backdrop-blur.** Drag perf regresses with blur. See `CLAUDE_HANDOFF_SYSTEM_UPDATES.md` §4. |
| **App content** | Inside `<AppContent>` | transparent (inherits window body) | App composes content from `<AppCard>` + opacity utilities. |
| **Floating** | Dropdowns, notification panels, date pickers, popovers | `bg-background-floating` + `border-os-line-dark-hover` + shadow | Allowed to use `backdrop-blur-md` because not draggable. |
| **Inset** | Input wells, selected rows, nested controls | `bg-os-ink-800` + `border-os-line-dark` | Indicates "you can type here" or "this is the selected one". |
| **Media** | Image/video previews | `<MediaSurface halftone>` | Halftone hover effect for project/gallery imagery. Don't use on small icons or profile photos. |

**Never use `bg-os-ink-*` directly inside an app body** — those tokens are for OS chrome. App bodies use `<AppCard>` or `<AppShell>` primitives which already resolve to the correct surface.

---

## Visual Rules

These are absolutes. CI/code review should reject violations.

### Color sourcing

- **No raw hex** in app components: `bg-[#141414]`, `text-[#171717]`, `border-[#e8e8e5]` — wrong. Use the semantic token (`bg-background-chrome`, `text-os-text-strong`, `border-os-line-light`).
- **No raw Tailwind palette** for brand intent: `bg-blue-500`, `text-emerald-300` — wrong when the meaning is "primary action" or "success". Use `bg-brand-solid` / `fg-success` etc. Tailwind palette is OK for purely decorative one-offs (project artwork, gradient placeholders).
- **Raw white-alpha is allowed**, but prefer the named token: `border-white/[0.08]` → `border-os-line-dark` is identical and reads better.

### Borders, radius, focus

| Surface | Border | Hover border | Radius |
|---|---|---|---|
| Card / panel | `border-os-line-dark` | `border-os-line-dark-hover` | `rounded-lg` (8px) |
| Small control | `border-os-line-dark` | `border-os-line-dark-hover` | `rounded` (4px) |
| Sidebar wrapper | `border-os-line-dark` | — | `rounded-xl` (12px) |
| Taskbar island | `border-os-line-dark` | — | `rounded-2xl` (16px) |
| Modal | `border-os-line-dark` | — | `rounded-lg` |

Focus is always `os-focus-ring` for interactive elements; inputs additionally use `focus:border-stroke-brand`.

### Text

| Role | Token |
|---|---|
| Primary content (on chrome) | `text-os-text-inverse` (white) |
| Secondary content (on chrome) | `text-white/70` |
| Muted (on chrome) | `text-white/50` |
| Hint (on chrome) | `text-white/30` |
| Primary content (on canvas) | `text-os-text-strong` |
| Secondary content (on canvas) | `text-os-text-muted` |
| Hint (on canvas) | `text-os-text-faint` |
| Brand link / active | `text-fg-brand` |

Section labels use `os-type-label text-white/30` on chrome or `os-type-label text-os-text-faint` on canvas.

### Dividers

`<AppDivider />` (1px `bg-os-line-dark`) or `h-px bg-os-line-dark` inline. Avoid `border-t` on layout containers — use a divider element.

---

## What Apps Use Today (Audit, 2026-05-30 — post full sweep; Timeline added 2026-06-06)

All 22 apps now use AppShell and source color from semantic tokens. After the 2026-06-07 brand sweep + semantic stabilization, raw-color debt across `src/components/` is **0 raw hex, 0 inline-style hex, and 0 palette colors** except the two intentional non-themeable contexts below (Resume print CV, DesktopIcons wallpaper contrast). Down from 261 pre-sweep. (The 2026-05-30 sweep covered 21 apps; Timeline shipped after, already token-clean and built on `<Badge>`.)

| App | Uses AppShell | Notes |
|---|---|---|
| AboutOS | ✅ | full AppShell + AppBody + AppSidebar |
| About | ✅ | AppShell — 79 violations cleaned via token sweep |
| Browser | ✅ | AppShell + control.tsx primitives + tokenized hover states |
| Calculator | ✅ | AppShell + AppBody + AppSidebar + AppContent |
| Contact | ✅ | AppShell wrap — token sweep complete |
| CV | ✅ | AppShell + AppCard + appSoftButtonClass + semantic feedback tokens; brand-CTA Populate button intentional |
| Feedback | ✅ | full AppShell + AppCard + appInputClass + semantic feedback tokens |
| FileExplorer (Archive) | ✅ | AppShell wrap + MediaSurface; layout intentionally local |
| FileViewer | ✅ | AppShell + appSoftButtonClass |
| Finance | ✅ | AppShell + ControlInput |
| ImageViewer | ✅ | AppShell + AppToolbar + appSoftButtonClass; brand fit chip via tokens; error icon → `fg-error` |
| Music | ✅ | AppShell + AppContent + appIconButtonClass; brand play button + `accent-brand-600` slider; warning → `fg-warning` |
| Notepad | ✅ | AppShell + AppToolbar + AppContent |
| PDFReader | ✅ | AppShell + AppToolbar + appSoftButtonClass |
| Portfolio | ✅ | AppShell wrap — token sweep complete |
| Resume | ✅ | AppShell wrap — printable white-paper CV; grays + blue pills intentional (see "Intentional palette exceptions") |
| Settings | ✅ | AppShell + appPanelClass + appRowClass + appSelectClass |
| Skills | ✅ | AppShell wrap — token sweep complete |
| TaskManager | ✅ | AppShell |
| Timeline | ✅ | AppShell + AppToolbar + `<Badge>`; horizontal tape, per-type icon/tone, Observatory topics inline (see `docs/TIMELINE_SYSTEM.md`) |
| VideoPlayer | ✅ | AppShell + AppToolbar + appSoftButtonClass |
| Weather | ✅ | AppShell wrap — was already token-clean |

### Intentional palette exceptions (2026-06-07 — post brand sweep + semantic stabilization)

As of 2026-06-07 the full component tree uses **only** semantic/brand/feedback tokens. The legacy `primary-*`/`secondary-*`/`tertiary-*`/`accent-*` utilities were migrated to `brand-*` / `fg-brand` / `fg-on-primary`, and red/amber palette colors used for status were migrated to feedback tokens (`fg-error`, `bg-error-subtle`, `border-stroke-error`, `fg-warning`, `fill-fg-warning`).

The **only** remaining raw Tailwind palette colors are in two files, both intentional and **not** violations — they are deliberately *outside* the themeable surface system:

| Location | Pattern | Reason |
|---|---|---|
| `Resume.tsx` (whole component) | `bg-white text-gray-900`, `text-gray-600/700/500`, `bg-blue-100 text-blue-800` (+ `print:` overrides) | The Resume is a **printable white-paper CV**, not a themeable OS surface. Brand/chrome tokens are tuned for dark chrome (`#111`) and would be illegible on white paper. Grays are paper body text; blue pills + `print:bg-gray-200` are paper styling. It intentionally does not participate in theming. |
| `DesktopIcons.tsx` icon labels | `contrastMode === 'light' ? 'text-gray-950 …' : 'text-white …'` | Dynamic **contrast against the user's wallpaper** (dark text on light wallpapers, white on dark), computed in `useDesktopContrast`. This contrasts with an arbitrary background image, not a theme surface, so a fixed near-black/white pair is correct. |

Everything else — every brand CTA (Music play, CV Populate, ImageViewer fit chip), every status indicator, every shell/app/admin surface — now resolves through tokens, so a brand or token change cascades everywhere.

### Shell components

All 25+ shell + supporting components (Window, Taskbar, StartMenu, Desktop, DesktopIcons, AdminPanel, ContextMenu, WindowManager, CustomizationSettings, MiniPlayer, NotificationContainer/Panel, UploadProgress, LoginModal, ErrorBoundary, WelcomeScreen, KeyboardShortcutsHelp, PWAInstallPrompt, CalendarPopup, VolumePopup, Timeline, MilestoneCard, DesktopWidgets, ArticleComments) are token-clean and use semantic feedback tokens (`fg-error`, `bg-success-subtle`, etc.) for status/state.

### Dead code removed

- `src/components/aceternity/` folder deleted (was unused after `ui/surface.tsx` + `ui/card.tsx` cleanup).
- All Aceternity imports severed.

---

## Migration Guide

### Raw alpha → semantic token

```diff
- <div className="bg-[#141414] border border-white/[0.08] text-white/80">
+ <div className="bg-background-chrome border border-os-line-dark text-white/80">
```

### Local input wrapper → appInputClass

```diff
- <input className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500" />
+ <input className={cn(appInputClass, 'px-4 py-3 rounded-lg')} />
```

### Card-in-card → AppCard + AppSection

```diff
- <div className="bg-white/[0.04] rounded-lg p-4 border border-white/[0.08]">
-   <div className="bg-white/[0.02] rounded-lg p-3">
-     …
-   </div>
- </div>
+ <AppCard className="p-4">
+   <AppSection title="Optional title">…</AppSection>
+ </AppCard>
```

### Toolbar action button → appIconButtonClass

```diff
- <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-xs text-white/60 hover:text-white transition-colors">
-   <Icons.Download className="w-3 h-3" /> Download
- </button>
+ <button className={cn(appSoftButtonClass, 'flex items-center gap-1.5 px-3 py-1.5 text-xs')}>
+   <Icons.Download className="w-3 h-3" /> Download
+ </button>
```

### Status pill → semantic feedback token

```diff
- 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
+ 'bg-info-subtle text-fg-info border border-stroke-info'

- 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
+ 'bg-success-subtle text-fg-success border border-stroke-success'
```

### Hardcoded font sizes → Typography

```diff
- <span className="text-[12px] font-semibold uppercase tracking-[0.08em]">
+ <Typography as="span" variant="label">
```

---

## Rules & Constraints

1. **No raw hex** inside `src/components/apps/` or `src/components/ui/` except where a semantic token genuinely does not exist (rare — usually means a token should be added).
2. **No `bg-os-ink-*` inside an app body.** Those are chrome tokens. Apps use `<AppCard>`, `<AppShell>` primitives, or opacity utilities.
3. **No backdrop-blur on draggable window bodies.** Performance regression confirmed in production. Blur is allowed on floating surfaces (popovers, modals) because they don't drag.
4. **No new imports of `ui/card.tsx`, `ui/input.tsx`, or non-`MediaSurface` exports of `ui/surface.tsx`.** They are dead-code legacy from the Cyberpunk/Aceternity era and contradict the current direction.
5. **Brand accent is never a page background.** Only focus rings, active indicators, selection, small badges, critical CTAs, upload progress, content links.
6. **Theme presets only override Layer 2 semantic tokens and brand vars.** They do not touch OS ink/canvas/line/text tokens.
7. **Every app sets `surfaceMode` in `desktopStore.ts`.** Even if the answer is `'glass'`.
8. **`z-index` values must come from `src/theme/theme.ts` `zIndex` map.** No magic numbers.

---

## Dependencies

This design system depends on:

- `tailwind.config.js` — declares the `os-ink-*`, `os-line-*`, `os-text-*`, `background-*`, `foreground-*`, `stroke-*` Tailwind utilities from CSS variables.
- `src/index.css` — declares the primitive, OS, semantic, and typography CSS variables, plus the `os-type-*` / `os-interactive` / `os-focus-ring` / `os-row-hover` / `halftone-hover` utilities.
- `src/store/themeStore.ts` — runtime theme preset overrides for Layer 2 semantic tokens.
- `src/theme/theme.ts` — TypeScript theme object (spacing, shadows, z-index) consumed by helpers and component defaults.
- `src/components/ui/AppShell.tsx` — the canonical app layout contract.
- `src/components/ui/button.tsx` — the canonical button primitive.
- `src/components/ui/SystemRow.tsx` — the canonical row primitive.
- `src/components/ui/control.tsx` — the icon-prefixed input/select primitive.
- `src/components/ui/surface.tsx` — only `MediaSurface` is current; the rest is legacy.
- `src/components/ui/Typography.tsx` — canonical wrapper around the `os-type-*` utilities for shared text roles.
- `src/components/Window.tsx` — reads `surfaceMode` from `WindowState` and applies the right body background.

---

## Edge Cases

- The doc index lists `docs/DESIGN_SYSTEM.ms` (typo, never existed). That should be removed once this file lands.
- `THEME_SYSTEM.md` historically shows `#667eea` blue and `glass-morphism` defaults — that file is being rewritten to point at this doc.
- `docs/CHANGELOG.md` and `docs/ARCHITECTURE.md` describe earlier states (Aceternity backgrounds, blue accent system, Star Citizen as default). They are intentionally preserved as history; this doc takes precedence for current behavior.
- The old Aceternity background components have been removed from `src/components/aceternity/`. Current `ui/surface.tsx` exports only `MediaSurface`; `ui/card.tsx` no longer imports `BorderGlow`.

---

## Open Questions

- Should `ui/card.tsx` and `ui/input.tsx` be deleted outright, or refactored into clean tokenized primitives so apps can finally adopt a real `Card`/`Input`? Currently apps either skip them (using `<AppCard>` / raw `<input className={appInputClass}>`) or compose locally. A real `<Card>` and `<Input>` with the right semantics would simplify legacy app migration.
- Should `ContentSurface` survive as a real primitive (light app body with token wrappers) once `surfaceMode: 'content'` apps actually exist, or should that role just be `<AppShell>` + an opt-in `lightCanvas` flag?
- ~~Should brand accent state live in the theme preset object only, or also in semantic tokens? Currently both paths exist (`--color-primary` legacy + `--color-bg-brand-*` semantic).~~ **Resolved 2026-05-31:** semantic brand tokens (`--color-fg-brand`, `--color-bg-brand-solid`, `--color-bg-brand-subtle`, `--color-stroke-brand`) now derive from `--color-primary` via `rgb()` / `rgba()` wrappers. Theme presets only write `--color-primary` and `--color-primary-hover`; everything brand-related cascades. Do **not** hardcode brand hex in `index.css` going forward.
- Should the remaining app-level `os-type-*` usages be migrated to `<Typography>` opportunistically as each app is touched, or should app interiors continue using utility classes where that keeps markup simpler?
- ~~Should there be a `<Badge>` primitive for status pills?~~ **Resolved 2026-05-31:** `<Badge>` shipped at `src/components/ui/Badge.tsx`. New chips/tags/status pills must use it. CV and AdminPanel still hold raw chip spans — refactor opportunistically when each app is touched.
- Should AppShell expose a `<SettingsShell>`/`<SettingsRow>` pair so Settings.tsx stops defining `panelClass`/`rowClass` locally?
