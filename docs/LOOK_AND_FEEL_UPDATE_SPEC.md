# Look And Feel Update Spec

> Build target: evolve PortfolioOS into Keketso OS, a refined portfolio operating system built by Generative Studio. The update should make the OS itself feel like the portfolio, not a desktop-themed site with many portfolio apps.

## Scope

This spec turns the product and visual direction docs into implementation work. It covers:

- Default product naming and system identity.
- App model cleanup.
- Product Mono visual system.
- Theme-to-config-to-surface architecture.
- OS chrome restyle.
- System component language for calendar, notifications, and settings.
- Halftone/dot hover image treatment.
- CV tab consolidation.
- Project-as-app workflow.
- Visitor Gallery image-only file space.
- Admin publishing changes.
- Windows-inspired frontend OS behavior model.
- Acceptance criteria for the new experience.

Related docs:

- [PRODUCT_DIRECTION.md](./PRODUCT_DIRECTION.md)
- [LOOK_AND_FEEL.md](./LOOK_AND_FEEL.md)
- [OS_BEHAVIOR_MODEL.md](./OS_BEHAVIOR_MODEL.md)
- [INCREMENTAL_REFINEMENT_PLAN.md](./INCREMENTAL_REFINEMENT_PLAN.md)

## Target Experience

When a visitor opens the site, they should understand:

1. They are inside **Keketso OS**.
2. The OS is Keketso's portfolio.
3. Generative Studio built the system.
4. Projects are launched as apps.
5. CV, skills, and contact live together in one tabbed CV surface.
6. File Explorer includes a constrained public Visitor Gallery where guests can create folders and upload images only.

The experience should feel compact, precise, alive, and system-driven. Complexity is welcome, but it must be patterned and legible.

## Non-Goals

- Do not create a marketing landing page before the OS.
- Do not keep `Portfolio` as a duplicate first-level app.
- Do not keep `Resume`, `Skills`, and `Contact` as separate default apps.
- Do not allow visitor text files, links, SVG, PDF, video, archives, HTML, scripts, or executable uploads.
- Do not make the default visual language neon/cyber/HUD-heavy. Those can remain as optional themes.

## Phase 1: Identity And Naming

### Desired Changes

- Rename the user-facing system concept to `Keketso OS`.
- Use `Built by Generative Studio` as a recurring but subtle builder credit.
- Keep `PortfolioOS` as the repo/project name if needed, but the interface should present as Keketso OS.

### Surfaces To Update

- Boot/loading/welcome screen.
- Start menu header or footer.
- About app.
- Settings/System tab.
- Taskbar system area if there is a brand mark.
- README/docs where product-facing wording matters.

### Copy Guidelines

Use:

- `Keketso OS`
- `A portfolio operating system by Keketso`
- `Built by Generative Studio`
- `A Generative Studio system concept`

Avoid:

- `Portfolio showcase app`
- `Portfolio website`
- Repeated large brand slogans inside every app.

### Candidate Files

- `src/components/WelcomeScreen.tsx`
- `src/components/StartMenu.tsx`
- `src/components/Taskbar.tsx`
- `src/components/apps/About.tsx`
- `src/components/apps/Settings.tsx`
- `src/store/desktopStore.ts`

## Phase 2: App Model Cleanup

### Current Problem

The default app list includes portfolio-shaped apps:

- `Resume`
- `Portfolio`
- `Skills`
- `Contact`
- `About Me`

This makes the OS feel like a launcher for portfolio sections instead of the portfolio itself.

### Desired Default App Model

Keep top-level system apps:

- `File Explorer`
- `CV`
- `About This OS`
- `Settings`
- `Task Manager` or `System Monitor`
- `Calculator`, if retained as a utility
- `Browser`, if it serves project previews or external exploration

Make project apps the portfolio layer:

- Admin-created project apps.
- Pinned project shortcuts.
- Project folders/assets in File Explorer.
- Optional featured project launchers in Start Menu.

Remove from first-level defaults:

- `Portfolio`
- `Skills`
- `Contact`

Rename or consolidate:

- `Resume` becomes `CV`.
- `About Me` becomes `About This OS`.

### Candidate Files

- `src/store/desktopStore.ts`
- `src/components/WindowManager.tsx`
- `src/components/StartMenu.tsx`
- `src/components/DesktopIcons.tsx`
- `src/components/apps/Resume.tsx`
- `src/components/apps/Skills.tsx`
- `src/components/apps/Contact.tsx`
- `src/components/apps/Portfolio.tsx`
- `src/components/apps/About.tsx`

### Compatibility Note

Existing saved app configurations may still contain old app IDs. The implementation should either:

- Migrate old app records to the new model, or
- Hide/deprioritize old default apps without deleting user-created apps.

Do not blindly delete user-created apps from persisted storage.

## Phase 3: CV Tab Surface

### Desired Behavior

Create a single `CV` app that contains the information currently split across Resume, Skills, and Contact.

Required tabs:

- `Profile`
- `Experience`
- `Skills`
- `Projects`
- `Contact`
- `Files`

The `Projects` tab should summarize selected work, but deeper project exploration should happen through project apps.

### Layout

Use a light app body with compact product UI:

- Top header: name, title, compact metadata, download/export action.
- Tab bar: segmented or underline tabs.
- Main content: table/list/card patterns.
- Side rail optional: contact shortcuts, availability, socials.

### Data Source

Prefer existing `userStore` profile data where possible:

- Personal information.
- Social links.
- Resume experience.
- Skills.
- Projects.
- Certifications.
- Preferences/privacy.

### Candidate Implementation

Options:

1. Refactor `src/components/apps/Resume.tsx` into the new `CV` app.
2. Keep `Resume.tsx` filename but change the app name to `CV`.
3. Extract reusable sections from `Skills.tsx` and `Contact.tsx`.
4. Stop registering `Skills` and `Contact` as default apps.

### Acceptance Criteria

- CV opens as one window.
- Skills and contact are available as tabs.
- The old Skills/Contact app shortcuts are not first-level defaults.
- Contact privacy settings still apply.
- Content is readable on desktop and mobile.

## Phase 4: Product Mono Theme

### Desired Changes

Add a default or preferred visual preset named `Product Mono`.

Token values:

```typescript
{
  name: 'Product Mono',
  theme: {
    colors: {
      primary: '#111111',
      secondary: '#666666',
      tertiary: '#f5f5f3',
      accent: '#10b981'
    },
    borderRadius: 'md',
    spacing: 'compact',
    iconStyle: 'default'
  }
}
```

### Visual Rules

- Dark chrome: taskbar, start menu, title bars, menus, admin navigation.
- Light work surfaces: CV, File Explorer body, project details, settings content, admin forms.
- No default gradient buttons.
- No default colored glow.
- 8px max radius for standard cards and windows.
- Accent color is used sparingly for focus, active states, checks, upload progress, and critical CTAs.

### Candidate Files

- `src/store/themeStore.ts`
- `src/theme/theme.ts`
- `tailwind.config.js`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`
- `THEME_SYSTEM.md`

### Acceptance Criteria

- Product Mono is selectable.
- Product Mono can become the default for new installs.
- Existing Star Citizen/Cyberpunk style remains available as a preset.
- Chrome and content surfaces no longer feel like one dark neon layer.

## Phase 5: Theme, Config, Surfaces, And Window Behavior

### Desired Behavior

The new look and feel should be implemented as a system, not as scattered component classes. A change in theme should flow into config, config should shape surfaces, and surfaces should define predictable window behavior.

Use this model:

```text
Theme tokens
  -> system configuration
  -> surface primitives
  -> shell components
  -> app windows
  -> interaction behavior
```

### Layer 1: Theme Tokens

Theme tokens define raw visual values:

- Color channels.
- Surface colors.
- Text colors.
- Border colors.
- Radius.
- Spacing density.
- Shadows.
- Motion duration/easing.
- Blur strength.

Required token groups:

```text
theme.colors.ink
theme.colors.canvas
theme.colors.line
theme.colors.text
theme.colors.accent
theme.radius
theme.spacing
theme.shadow
theme.motion
theme.blur
```

Candidate files:

- `src/store/themeStore.ts`
- `src/theme/theme.ts`
- `tailwind.config.js`

Acceptance criteria:

- Product Mono tokens exist in one place.
- Components do not hardcode repeated color/radius/shadow values when a token exists.
- Star Citizen/Cyberpunk can still override tokens through presets.

### Layer 2: System Configuration

System configuration decides how the OS uses the tokens.

Examples:

- `preferredTheme`: Product Mono, Star Citizen, etc.
- `surfaceMode`: light content / dark chrome.
- `windowChromeStyle`: black, translucent, compact.
- `windowBodyStyle`: light, dark, app-controlled.
- `reducedMotion`: true/false.
- `density`: compact, normal, comfortable.
- `taskbarPosition`.
- `taskbarSize`.
- `defaultWindowBehavior`: floating, maximized on mobile.
- `imageTreatment`: none, halftone on hover.

Candidate files:

- `src/store/themeStore.ts`
- `src/store/desktopStore.ts`
- `src/theme/helpers.ts`
- `src/types.ts`

Acceptance criteria:

- Appearance settings can influence the OS globally.
- Window and surface behavior reads from configuration instead of one-off props wherever practical.
- Mobile window behavior is controlled intentionally, not through incidental CSS breakpoints only.

### Layer 3: Surface Primitives

Surfaces are the reusable building blocks of the OS.

Required surface primitives:

- `ChromeSurface`: dark taskbar/start/menu/title-bar/admin navigation.
- `ContentSurface`: light app body, settings pane, CV pane.
- `FloatingSurface`: dropdowns, date pickers, notification panels.
- `InsetSurface`: input wells, selected rows, nested controls.
- `MediaSurface`: image previews with optional halftone hover.

Candidate implementation:

- Extend existing `src/components/ui/surface.tsx` if present.
- Or create `src/components/ui/Surface.tsx`.
- Use variants rather than new ad hoc wrappers.

Suggested API:

```tsx
<Surface variant="chrome" />
<Surface variant="content" />
<Surface variant="floating" />
<Surface variant="inset" />
<Surface variant="media" interactive />
```

Acceptance criteria:

- Taskbar, Start Menu, floating panels, settings panes, and app bodies visibly share the same surface system.
- No card-inside-card pattern appears just to create spacing.
- Surface variants handle borders, radius, background, and shadow consistently.

### Layer 4: Window Behavior

Windows are a core part of the portfolio OS and need explicit behavior rules.

Default desktop behavior:

- Windows open floating unless the app requests otherwise.
- New windows cascade with a small offset.
- Focus raises z-index and deepens shadow/border.
- Minimize keeps the app available from taskbar.
- Maximize fills the safe desktop area inside taskbar constraints.
- Close removes the window state.

Default mobile behavior:

- Windows open maximized by default.
- Dragging and resizing are disabled or heavily constrained.
- Title bar remains visible.
- App content scrolls inside the window body.
- Start Menu becomes primary navigation.

Window anatomy:

- `WindowFrame`: position, size, z-index, focus, resize, drag.
- `WindowChrome`: title bar, icon, controls, status.
- `WindowBody`: surface variant chosen by app type.
- `WindowControls`: close, minimize, maximize/restore.

Window body modes:

- `content`: light default for CV, File Explorer, project details, settings.
- `utilityDark`: dark default for Calculator, Task Manager/System Monitor, technical tools.
- `immersive`: app controls its own surface, useful for project demos.
- `iframe`: constrained browser/project iframe surface.

Candidate files:

- `src/components/Window.tsx`
- `src/components/WindowManager.tsx`
- `src/store/desktopStore.ts`
- `src/types.ts`

Acceptance criteria:

- Window behavior is predictable across all apps.
- App type can influence body surface without duplicating window frame code.
- Focus, minimized, maximized, and mobile states are visually distinct.
- Window resizing cannot create unreadable or overlapping controls.

### Layer 5: App Surface Contracts

Every app should declare what kind of surface it needs.

Suggested metadata:

```typescript
interface App {
  surfaceMode?: 'content' | 'utilityDark' | 'immersive' | 'iframe';
  preferredWindowMode?: 'floating' | 'maximized' | 'fixed';
  minSize?: { width: number; height: number };
  mobileBehavior?: 'maximize' | 'fullscreen' | 'hide';
}
```

Use examples:

- `CV`: `surfaceMode: 'content'`
- `File Explorer`: `surfaceMode: 'content'`
- `Settings`: `surfaceMode: 'content'`
- `About This OS`: `surfaceMode: 'content'`
- `Task Manager`: `surfaceMode: 'utilityDark'`
- `Calculator`: `surfaceMode: 'utilityDark'`
- Project iframe apps: `surfaceMode: 'iframe'`
- Immersive demos: `surfaceMode: 'immersive'`

Acceptance criteria:

- WindowManager does not need hardcoded special cases for every app.
- New admin-created project apps can choose sensible window/surface defaults.
- System apps and project apps feel coherent while still allowing special experiences.

## Phase 6: OS Chrome Restyle

### Taskbar

Target:

- Black docked bar.
- 48px desktop height.
- Icon-only pinned apps.
- Active state is a small dot/underline, not a glowing block.
- Clock and system area use muted gray text.

Candidate file:

- `src/components/Taskbar.tsx`

### Start Menu

Target:

- Compact black panel.
- Header: Keketso OS.
- App groups: System, Work, Personal, Admin.
- Footer: Built by Generative Studio.
- Rows include icon, title, short description.

Candidate file:

- `src/components/StartMenu.tsx`

### Windows

Target:

- Black title bars.
- Light default body.
- 8px radius.
- No default colored glow.
- Clear focus state through shadow/border depth.

Candidate files:

- `src/components/Window.tsx`
- `src/components/WindowManager.tsx`

### Desktop Icons

Target:

- Smaller and calmer.
- Icon tile plus 12px label.
- Selection via subtle border/fill.

Candidate file:

- `src/components/DesktopIcons.tsx`

## Phase 7: Windows-Inspired OS Behavior

### Desired Behavior

Align the frontend behavior with familiar desktop operating system patterns before adding custom Keketso OS flourishes. The OS should support real shell behaviors: desktop, taskbar, windows, side-nav locations, file operations, app registration, context-aware menus, shortcuts, and system utilities.

Use [OS_BEHAVIOR_MODEL.md](./OS_BEHAVIOR_MODEL.md) as the detailed behavior reference.

### Key Requirements

- File Explorer has common OS locations: Desktop, Documents, Downloads, Projects, CV, Images, Visitor Gallery, System.
- Context menus are context-aware across desktop, taskbar, windows, File Explorer, notifications, settings, and admin records.
- Common file/folder CRUD works where permissions allow it.
- Apps can be registered through Admin as installable project apps.
- Windows have predictable focus, drag, resize, minimize, maximize, restore, and close behavior.
- Keyboard shortcuts cover common OS actions inside the web app.
- Web-native experiences are allowed when they are intentionally framed as apps or system spaces.

### Candidate Files

- `src/components/ContextMenu.tsx`
- `src/components/Desktop.tsx`
- `src/components/DesktopIcons.tsx`
- `src/components/Taskbar.tsx`
- `src/components/Window.tsx`
- `src/components/WindowManager.tsx`
- `src/components/apps/FileExplorer.tsx`
- `src/store/desktopStore.ts`
- `src/store/fileStore.ts`
- `src/types.ts`
- New helper candidate: `src/lib/contextMenuRegistry.ts`

### Acceptance Criteria

- Right-clicking different surfaces shows different menus.
- Common actions such as open, copy, paste, rename, delete, properties, pin, and app info are grouped consistently.
- File type and permission affect available actions.
- Visitor Gallery menus are restricted.
- The OS does not expose native-only features it cannot support safely in the browser.

### Feedback As A Web-Native App

Do not treat public feedback as generic file-system comments. Instead, create a dedicated `Feedback` app or experience when ready.

Feedback app requirements:

- Visitors can leave short feedback about the platform.
- Feedback is stored as plain text.
- Links are stripped or made inert.
- Submissions are rate-limited.
- Admin can moderate feedback.
- Approved feedback can affect the space visually, such as a dot field, constellation, wall, or ambient panel.

This keeps website affordances available while preserving the operating-system structure.

## Phase 8: Project Apps As Portfolio

### Desired Behavior

The admin panel should become the publishing console for project apps.

Project app metadata should support:

- Name.
- Description.
- Icon or custom image.
- Type: component, iframe, static, external link.
- Status: live, featured, work in progress, archived.
- Tags/technologies.
- Role.
- Year.
- Screenshots.
- Links.
- Default window size.
- Desktop/taskbar pinning.

### UI Changes

Admin should present project apps as a structured list/table, not just generic app records.

Start Menu and desktop should surface featured project apps naturally.

### Candidate Files

- `src/components/AdminPanel.tsx`
- `src/store/desktopStore.ts`
- `src/types.ts`
- `src/components/StartMenu.tsx`
- `src/components/DesktopIcons.tsx`
- `src/components/WindowManager.tsx`

### Acceptance Criteria

- Adding a project through Admin can create a launchable app.
- Featured projects can be pinned.
- The OS experience itself is enough to understand the portfolio.
- `Portfolio` is not required as a separate default app.

## Phase 9: Halftone Image Hover Effect

### Desired Behavior

Use a dotted halftone hover treatment on important image previews. The reference effect turns a normal image into a structured field of black dots, with a second layer of small accent symbols/dots over parts of the image. It feels technical, graphic, and system-like without becoming loud.

This should become a reusable visual pattern for Keketso OS.

### Where To Use It

Good uses:

- Project app preview thumbnails.
- Case study screenshots.
- Visitor Gallery image thumbnails.
- About This OS concept imagery.
- Featured project cards in the Start Menu or launcher.
- CV project summaries.

Avoid using it on:

- Every small icon.
- Dense tables where it harms scanning.
- Profile photos when identity clarity matters.
- Images that need precise inspection.

### Interaction

Default state:

- Show the image normally.
- Keep the surface clean, with only a subtle border and radius.

Hover/focus state:

- Fade in a dot-screen overlay.
- Slightly reduce image contrast or saturation.
- Add small accent dots/symbols in the lower or focal area.
- Keep the image recognizable.
- Do not zoom so much that layout shifts.

Recommended timing:

- Overlay fade: 140ms to 220ms.
- Image filter transition: 180ms.
- Accent dot movement, if animated: slow and subtle.

### Visual Recipe

Implementation can use CSS pseudo-elements or an absolutely positioned overlay:

```css
.image-dot-hover {
  position: relative;
  overflow: hidden;
}

.image-dot-hover::after {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.72) 1px, transparent 1.4px);
  background-size: 5px 5px;
  mix-blend-mode: multiply;
  transition: opacity 180ms ease;
}

.image-dot-hover:hover::after,
.image-dot-hover:focus-within::after {
  opacity: 0.8;
}
```

Optional accent layer:

```css
.image-dot-hover::before {
  content: "";
  position: absolute;
  inset: auto 0 12px 0;
  height: 56px;
  opacity: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(245, 180, 0, 0.9) 1.5px, transparent 2px);
  background-size: 16px 12px;
  transition: opacity 180ms ease, transform 220ms ease;
  z-index: 1;
}

.image-dot-hover:hover::before,
.image-dot-hover:focus-within::before {
  opacity: 0.85;
  transform: translateY(-2px);
}
```

The exact dot size can vary by image size, but the effect should remain fine-grained and editorial, not chunky or cartoonish.

### Accessibility

- Apply the same effect on keyboard focus where the image is inside a focusable card/link.
- Do not communicate critical information only through the hover overlay.
- Respect reduced-motion settings by disabling dot movement and only fading the overlay.
- Keep image alt text meaningful.

### Candidate Files

- `src/components/apps/Portfolio.tsx` if kept for legacy/project summary views.
- `src/components/apps/FileExplorer.tsx`
- `src/components/apps/FileViewer.tsx`
- `src/components/apps/About.tsx`
- `src/components/apps/Resume.tsx` or the new CV app.
- `src/components/DesktopIcons.tsx` only for large project preview tiles, not normal icons.
- Shared utility/component candidate: `src/components/ui/ImageHoverPreview.tsx`.

### Acceptance Criteria

- The halftone effect exists as a reusable class or component.
- It is used on project/preview imagery, not everywhere.
- Hover and keyboard focus both reveal the effect.
- Reduced motion disables movement.
- The effect does not cause layout shift.
- Images remain recognizable and readable.

## Phase 10: System Component Patterns

### Desired Behavior

Build a consistent system component language for date range selection, notification panels, settings windows, and repeated sidebar/list rows. These patterns should feel like they belong to the same OS as the taskbar, windows, and Start Menu.

### Calendar / Date Range Picker

Use for:

- Admin analytics filters.
- Visitor Gallery moderation dates.
- Project timelines.
- CV date editing where a full calendar is useful.
- System logs or activity filters.

Required anatomy:

- Floating dark panel.
- Left preset list: Today, Yesterday, This week, Last week, This month, Last month, This year, Last year, All time, Custom.
- Two-month calendar grid.
- Footer with selected start/end dates.
- Cancel and Apply actions.

Visual requirements:

- Background: dark neutral panel.
- Preset rail selected state uses subtle fill plus accent rail.
- Selected date uses accent/lavender fill.
- In-range dates use a muted gray band.
- Event markers are tiny dots.
- Radius stays around 8px.

Candidate files:

- New shared component: `src/components/ui/DateRangePicker.tsx`.
- Potential use in `src/components/AdminPanel.tsx`.
- Potential use in `src/components/apps/Settings.tsx`.

Acceptance criteria:

- Keyboard navigation works.
- Range preview does not commit until Apply.
- Cancel restores previous value.
- Component works in dark Product Mono chrome.

### Notification Panel

Use for:

- System updates.
- Upload status history.
- Project announcements.
- Generative Studio/Keketso OS messages.
- Visitor Gallery moderation alerts.

Required anatomy:

- Optional top announcement bar.
- Notification cards with title, summary, timestamp/status, optional image, and compact action.
- Dismiss/read controls.

Visual requirements:

- Dark panel with slightly raised cards.
- 8px card radius.
- Muted body copy.
- Compact buttons.
- Image previews can use the halftone hover treatment.

Candidate files:

- Existing `src/store/notificationStore.ts`.
- Existing `src/components/NotificationContainer.tsx`.
- New panel candidate: `src/components/NotificationPanel.tsx`.
- Potential system tray trigger in `src/components/Taskbar.tsx`.

Acceptance criteria:

- Toast notifications and notification history have a coherent relationship.
- Users can dismiss notifications.
- Read/unread state is visually clear.
- Panel does not cover critical window controls on small screens.

### Settings Window Pattern

Use for:

- Main Settings app.
- Admin nested settings.
- Account/system configuration.
- CV editing settings.

Required anatomy:

- Light floating settings shell.
- Left grouped sidebar.
- Right content pane.
- Header with title and short description.
- Compact rows and controls.
- Close action in the top-right.

Visual requirements:

- Soft light shell over desktop.
- White content pane.
- Quiet selected sidebar state.
- 1px dividers.
- 8px or smaller inner control radius.

Candidate files:

- `src/components/apps/Settings.tsx`.
- `src/components/CustomizationSettings.tsx`.
- `src/components/AdminPanel.tsx` for admin subpanels.
- New shared layout candidate: `src/components/ui/SettingsShell.tsx`.

Acceptance criteria:

- Settings feels like a native OS control surface.
- Sidebar row styling is shared with other system lists.
- Content panes are scannable and not card-inside-card heavy.
- Mobile layout collapses sidebar into tabs or a menu.

### Shared Row Pattern

Create or standardize a reusable row style for:

- Start Menu app rows.
- Settings sidebar rows.
- Admin navigation.
- File Explorer navigation.
- Date presets.
- Notification list items.

Required row behavior:

- 36px to 44px height.
- Icon, label, optional metadata.
- Hover fill.
- Selected fill plus optional accent rail.
- Keyboard focus ring.

Candidate shared component:

- `src/components/ui/SystemRow.tsx`

## Phase 11: Visitor Gallery

### Desired Behavior

File Explorer includes a public `Visitor Gallery` root folder. Visitors can create folders inside it and upload images only.

### Visitor Permissions

Visitors can:

- View public visitor images.
- Create folders inside `Visitor Gallery`.
- Upload approved image files into visitor folders.

Visitors cannot:

- Upload text files.
- Create text documents.
- Add links.
- Upload SVG, PDF, video, archive, HTML, scripts, executable, or unknown file types.
- Modify system folders.
- Delete other visitor content.

### Upload Rules

Recommended:

- Allowed: JPG, JPEG, PNG, WebP.
- Optional: GIF only if animated uploads are desired.
- Disallowed: SVG.
- Max size: 2MB to 5MB.
- Max dimension: 4096px longest edge.
- Store under separate path/bucket prefix: `/visitor-gallery/`.
- Capture audit metadata.

### Moderation

Admin Panel should include:

- Visitor upload list.
- Preview thumbnail.
- File size/type.
- Created date.
- Folder path.
- Approve/hide/delete controls.

### Candidate Files

- `src/components/apps/FileExplorer.tsx`
- `src/components/apps/FileViewer.tsx`
- `src/store/fileStore.ts`
- `src/lib/uploadUtils.ts`
- `src/components/AdminPanel.tsx`
- `storage-setup.sql`
- `supabase-setup.sql` or Firebase equivalents if the app is now using Firebase paths.

### Security Acceptance Criteria

- Client validates file type, size, and extension.
- Server/storage rules also enforce allowed upload paths and permissions.
- SVG is rejected.
- Text document creation is unavailable in Visitor Gallery.
- Visitor uploads cannot overwrite system/admin assets.
- Visitor content is isolated from portfolio assets.

## Phase 12: About This OS

### Desired Behavior

`About This OS` is a system-level concept screen, not a duplicate CV.

Sections:

- `System`: OS name, version, build, stack.
- `Concept`: why the portfolio is an OS.
- `Keketso`: short author note.
- `Generative Studio`: builder credit.
- `Credits`: libraries, tools, inspirations.
- `Build`: deployment/runtime notes where appropriate.

### Candidate File

- `src/components/apps/About.tsx`

### Acceptance Criteria

- About explains the concept clearly.
- About links to CV but does not duplicate it.
- Generative Studio is visible.
- Keketso is visible as concept owner and portfolio subject.

## Phase 13: Responsive Behavior

### Desired Behavior

On small screens:

- Start Menu becomes primary navigation.
- Windows open maximized by default.
- Drag/resize affordances are reduced or disabled.
- Toolbar controls remain at least 40px tall.
- Text does not overlap or shrink below readable sizes.

### Candidate Files

- `src/components/Desktop.tsx`
- `src/components/Window.tsx`
- `src/components/WindowManager.tsx`
- `src/components/StartMenu.tsx`
- `src/components/Taskbar.tsx`

## Build Order

Recommended sequence:

1. Add Product Mono tokens and preset.
2. Define theme-to-config-to-surface architecture.
3. Define context-aware OS behavior and menu registry.
4. Restyle taskbar, start menu, and windows.
5. Rename user-facing system identity to Keketso OS.
6. Consolidate Resume, Skills, and Contact into CV tabs.
7. Remove/deprioritize standalone Portfolio, Skills, and Contact defaults.
8. Add the halftone image hover component/pattern.
9. Add shared system component patterns for calendar, notifications, settings shell, and rows.
10. Update About This OS.
11. Improve Admin project publishing fields.
12. Build Visitor Gallery with image-only upload constraints.
13. Add moderation controls.
14. Polish responsive behavior and run visual checks.

For codebase-specific sequencing, follow [INCREMENTAL_REFINEMENT_PLAN.md](./INCREMENTAL_REFINEMENT_PLAN.md).

## Final Acceptance Checklist

- The default UI reads as Keketso OS, not a generic portfolio desktop.
- Generative Studio appears as builder in system-level surfaces.
- The OS itself acts as the portfolio.
- Project apps are the main portfolio publishing mechanism.
- CV is one tabbed app containing profile, experience, skills, projects, contact, and files.
- About is system-level.
- Portfolio, Skills, and Contact are not separate first-level default apps.
- Product Mono is available and visually matches the new black chrome/light work surface direction.
- Theme tokens, configuration, surface primitives, and window behavior are connected rather than hardcoded per component.
- Desktop, taskbar, windows, File Explorer, app registry, and context menus follow familiar OS behaviors.
- Project and preview images can use the halftone dot hover treatment.
- Calendar, notification, settings, and list-row patterns share one design language.
- Taskbar, Start Menu, and windows use compact black chrome.
- File Explorer has a constrained Visitor Gallery concept.
- Visitor uploads are image-only and safely isolated.
- The interface remains complex, dynamic, and system-like without becoming confusing.
