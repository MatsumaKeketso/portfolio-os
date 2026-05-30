# Keketso OS — Contributor Guide

Built by Generative Studio. This is a browser-native OS simulator, not a website with a desktop theme.

**Read this first:** [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) is the canonical reference for tokens, primitives, and the app contract. The "Surface Contract" and "Visual Rules" sections below are the short version — the full reference (token inventory, surface taxonomy, migration guide, current-app audit) lives there.

Current priority handoff: read `docs/CLAUDE_HANDOFF_SYSTEM_UPDATES.md` before continuing implementation. It contains the latest system-wide update brief from the owner.

---

## Adding a New App — 5 Steps

### 1. Register it in `src/store/desktopStore.ts`

```ts
{
  id: 'my-app',
  name: 'My App',
  icon: 'lucide-icon-name',      // kebab-case Lucide icon
  type: 'component',
  component: 'MyApp',
  surfaceMode: 'glass',          // ALWAYS set this — see Surface Contract below
  pinnedToTaskbar: false,
  pinnedToDesktop: true,
  defaultSize: { width: 700, height: 500 },
  minSize: { width: 480, height: 360 },
  description: 'One-line description shown in Start Menu',
}
```

### 2. Create `src/components/apps/MyApp.tsx`

Use `AppShell` from `src/components/ui/AppShell.tsx` as the layout wrapper. Never build the layout from scratch with raw divs and hardcoded colors.

```tsx
import { AppShell, AppToolbar, AppBody, AppSidebar, AppContent, AppCard } from '../ui/AppShell';

export function MyApp() {
  return (
    <AppShell>
      <AppToolbar>
        {/* breadcrumbs, action buttons, search */}
      </AppToolbar>
      <AppContent className="p-4">
        {/* main body */}
      </AppContent>
    </AppShell>
  );
}
```

For two-pane layout (sidebar + content):

```tsx
<AppShell>
  <AppToolbar>…</AppToolbar>
  <AppBody>
    <AppSidebar>…nav…</AppSidebar>
    <AppContent>…</AppContent>
  </AppBody>
</AppShell>
```

### 3. Register the component in `src/components/WindowManager.tsx`

```tsx
case 'MyApp': return <MyApp />;
```

### 4. For in-app dialogs use `<AppModal>`

```tsx
import { AppModal } from '../ui/AppShell';

{showDialog && (
  <AppModal onClose={() => setShowDialog(false)} panelClassName="w-[400px] p-6">
    …dialog content…
  </AppModal>
)}
```

### 5. For input fields, use `appInputClass`

```tsx
import { appInputClass } from '../ui/AppShell';

<input className={cn(appInputClass, 'px-3 py-2 text-sm w-full')} />
<select className={cn(appInputClass, 'px-2 py-1 text-xs')} />
```

---

## Surface Contract

Performance note: the owner has reported lag while dragging blurred windows. Do not add new heavy backdrop blur to draggable window bodies. Prefer solid or low-cost gradient surfaces, and see `docs/CLAUDE_HANDOFF_SYSTEM_UPDATES.md` before changing `Window.tsx`.

The older glass contract below may still describe existing code, but it is no longer the target direction for draggable app windows.

| Layer | Component | Background |
|---|---|---|
| Window body | `Window.tsx` (automatic) | Solid or low-cost gradient surface |
| Toolbar / action bar | `<AppToolbar>` | `bg-white/[0.06]` |
| Sidebar / left nav | `<AppSidebar>` | `bg-black/50` |
| Main content area | `<AppContent>` | transparent |
| Card / section panel | `<AppCard>` | `bg-os-ink-900` + `border-os-line-dark` |
| Input / select / textarea | `appInputClass` | `bg-white/[0.08]` |
| Sticky list header | `<AppStickyHeader>` | `bg-black/40 backdrop-blur-sm` |
| In-app dialog | `<AppModal>` | `bg-black/80 backdrop-blur-md` |

**Never** use `bg-os-ink-*` inside an app component. Those tokens are for OS chrome only (taskbar, title bar, context menus). If you find yourself reaching for them in app code, use the table above instead.

---

## Visual Rules

- **Color sourcing:** components must not use arbitrary hex classes such as `bg-[#141414]`, `text-[#...]`, or `border-[#...]`. If a color is needed, add or reuse a primitive token, map it through a semantic token, then use the semantic utility in components.
- **Chrome backgrounds:** use `bg-background-chrome`, `bg-background-chrome-raised`, `bg-background-floating`, or existing semantic OS utilities. Do not hardcode the equivalent hex in JSX.
- **Borders:** always `border-white/[0.08]`. Never hardcode a border color.
- **Text:** `text-white/80` content · `text-white/50` muted · `text-white/30` hints · `text-white` active/selected
- **Dividers:** `<AppDivider />` or `h-px bg-white/[0.08]`
- **Section labels:** `text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30`
- **Focus ring:** `focus:border-white/[0.20]` on inputs, `focus-visible:ring-2 focus-visible:ring-primary-500` on buttons
- **Radius:** `rounded` (4px) for small controls · `rounded-lg` (8px) for cards/panels · `rounded-xl` for sidebar wrappers · `rounded-2xl` for the taskbar island
- **No hardcoded hex colors inside app components.** Use Tailwind opacity utilities (`white/[0.08]`, `black/30`) or semantic tokens (`text-primary-400`, `bg-background-chrome`, `bg-background-floating`).

---

## Existing Shared Primitives

| Component | File | Use for |
|---|---|---|
| `<Button>` | `src/components/ui/button.tsx` | All interactive buttons |
| `<Typography>` | `src/components/ui/Typography.tsx` | Canonical text roles |
| `<SystemRow>` | `src/components/ui/SystemRow.tsx` | List rows in sidebars and menus |
| `<AppShell>` etc. | `src/components/ui/AppShell.tsx` | App layout structure |
| `<ContextMenu>` | `src/components/ContextMenu.tsx` | Right-click menus |
| `<MediaSurface>` | `src/components/ui/surface.tsx` | Images with halftone hover |

---

## OS Chrome vs App Content

| Area | surfaceMode | Background token |
|---|---|---|
| Taskbar | — (not a window) | `bg-[#141414]/80 backdrop-blur-md` |
| Window title bar | — (always dark) | `bg-os-ink-950` |
| Context menus | — (floating) | `bg-background-floating` |
| All app windows | `'glass'` | `bg-black/20 backdrop-blur-xl` |

---

## State & Data

- **6 Zustand stores** in `src/store/` — never create a new store for local UI state; use `useState`.
- Apps read user data from `userStore`, files from `fileStore`, app list from `desktopStore`.
- Backend is **Firebase only** — Firestore (`db`), Storage (`storage`), Auth (`auth`) from `src/lib/firebase.ts`.
- Never import from or reference Supabase.

---

## What NOT to Do

- `bg-os-ink-950/900/800/700/600` inside app components → use AppShell primitives
- Hardcoded hex colors (`bg-[#111111]`) inside app components → use opacity utilities
- Raw `<div>` with backdrop-blur as an app container → use `<AppShell>` (Window provides the blur)
- Inline `style={{ background: '...' }}` for surface backgrounds → use className
- A new Zustand store for a single app's UI state → use `useState`
- `z-index` values without checking `src/theme/theme.ts` zIndex map
