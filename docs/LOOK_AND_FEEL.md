# PortfolioOS Look And Feel Direction

> Design target: a calm, premium, product-grade operating system inspired by the supplied reference image. The OS should feel like a precise black chrome layer floating above clean white work surfaces, not like a neon HUD or a marketing landing page.

## Intent

PortfolioOS is already an operating-system metaphor: desktop, taskbar, windows, start menu, file explorer, settings, project apps, admin tools, themes, and persistent user content. This document defines the visual direction for evolving that system into a more refined UI language.

The reference image has three important lessons for PortfolioOS:

1. **Chrome is dark and compact.** Navigation, menus, side panels, and command surfaces live in near-black panels with subtle borders.
2. **Content is light and spacious.** Plans, tables, documents, profiles, file previews, and portfolio content sit on white or near-white canvases.
3. **Interaction is quiet.** Hover states use small contrast shifts, not heavy glow, gradients, or oversized motion.

The result should feel like a professional web operating system for a portfolio: practical, elegant, fast to scan, and confident.

## Product Principles

### 1. The OS Is The Frame, Not The Show

The desktop shell should help users move between portfolio content, not compete with that content. Taskbar, start menu, window chrome, app switchers, context menus, and admin controls should be visually restrained.

Use dark chrome for:

- Taskbar
- Start menu
- Context menus
- Window title bars
- Admin navigation
- Command palettes
- Mega menus and launchers
- Modal headers and footers

Use light work surfaces for:

- File Explorer content
- CV/resume tabs, project content, visitor galleries, and About content
- Tables, forms, previews, editor bodies, cards, and settings panels
- Admin content regions where users compare or edit structured data

### 2. Density Beats Drama

The reference UI is compact and information-rich. PortfolioOS should adopt that same discipline. Prefer tight rows, small labels, clear grouping, and fast scanning over large decorative blocks.

Avoid:

- Oversized hero-like app interiors
- Neon borders around every surface
- Decorative gradients as primary structure
- Card stacks inside larger cards
- Big rounded pill buttons everywhere
- Heavy glow as a default hover state

Use:

- 12px metadata labels
- 13px to 14px body text in chrome
- 14px to 16px body text in content surfaces
- 8px radius for most panels
- 1px borders
- Subtle shadows only for floating layers

### 3. Portfolio Content Gets The Brightest Stage

The user's work should be the brightest object on screen. The OS frame can be dark, but portfolio pages, project cards, resumes, and file previews should feel clean and readable.

When a window contains creator content, default to a light canvas unless the app is inherently a tool that benefits from dark mode, such as Calculator, Task Manager, Terminal, or a system monitor.

### 4. The OS Is The Portfolio

Do not treat `Portfolio`, `Resume`, `Skills`, `Contact`, and `About` as equal standalone app concepts. The operating system itself is the portfolio. Individual projects should become apps. CV, skills, and contact should live together as tabs inside a focused CV/resume experience. About should remain system-level: it explains the OS concept, Keketso, Generative Studio, credits, and build details.

For product architecture, follow [PRODUCT_DIRECTION.md](./PRODUCT_DIRECTION.md).

## Visual Anatomy

### Desktop

The desktop should be quiet and atmospheric. Backgrounds may still be configurable, but the default should support the new direction.

Recommended default:

- Base: `#f7f7f5` or `#f5f5f3`
- Optional dot grid: very low opacity, `rgba(0,0,0,0.04)`
- No bright sci-fi gradients by default
- No large decorative color blobs

Desktop icons should feel like small tools pinned to a work surface:

- 72px to 84px footprint
- 36px to 44px icon tile
- 12px label
- Dark icon tile or white tile depending on background contrast
- Selection state as a 1px black border or subtle filled tint

### Taskbar

The taskbar is the main OS chrome and should be black, slim, and calm.

Recommended:

- Height: 48px desktop, 52px touch-friendly layouts
- Background: `#141414` or `rgba(20,20,20,0.96)`
- Border: `1px solid rgba(255,255,255,0.08)`
- Radius: 0 when docked to viewport edge
- Icons: 18px to 20px
- Active app state: small underline or 2px dot, not a full glowing pill
- Clock text: 11px to 12px, muted gray

Pinned apps should use icon-only buttons with tooltips. Text labels belong in hover previews, menus, or app switchers.

### Start Menu

The start menu should resemble the reference mobile menu: black panel, compact rows, clear app grouping, and a lower utility area.

Recommended structure:

- Top: logo/name and close/search affordance
- Primary list: pinned apps and core apps
- Secondary section: profile, settings, admin, support/contact
- Bottom actions: sign in/out and customization where relevant

Recommended styling:

- Width: 320px to 380px on desktop
- Background: `#151515`
- Border: `1px solid rgba(255,255,255,0.08)`
- Radius: 8px
- Shadow: `0 18px 50px rgba(0,0,0,0.28)`
- Row height: 40px to 48px
- Hover: `rgba(255,255,255,0.06)`

### Mega Menus And Launchers

The reference desktop menu is a wide black command surface with columns. This pattern is ideal for PortfolioOS app launchers, profile navigation, admin resource menus, and project directories.

Use columns such as:

- **Work**: Project apps, CV, selected case studies
- **System**: File Explorer, Settings, Task Manager
- **Personal**: About, Timeline, Visitor Gallery
- **Admin**: Apps, Backgrounds, Theme, Data

Each item should include:

- Small Lucide icon
- 13px to 14px title
- 12px muted description
- Optional status badge for admin-only or coming soon items

Selected or hovered items should use a slightly raised black-gray tile, as in the reference. Keep the hover patch subtle.

### Windows

Windows are where the OS metaphor becomes real. The new language should split chrome from content.

Window shell:

- Outer background: dark chrome or transparent wrapper
- Radius: 8px
- Border: `1px solid rgba(0,0,0,0.16)` on light desktop, `rgba(255,255,255,0.08)` on dark backgrounds
- Shadow: `0 24px 60px rgba(0,0,0,0.24)`
- No default colored glow

Title bar:

- Height: 40px
- Background: `#151515`
- Text: white, 13px, medium weight
- Controls: small, familiar symbols
- Mac-style dots are acceptable for this direction, especially because the reference uses them. Keep them small and consistent.

Window body:

- Default app body: `#ffffff`
- Secondary app background: `#f6f6f4`
- Text: `#171717`
- Muted text: `#6b6b6b`
- Divider: `#e8e8e5`

### App Surfaces

App interiors should use a product-dashboard rhythm:

- Header row with title, optional tabs, and compact actions
- Content area with tables, lists, editors, or cards
- Repeated items may be cards, but do not wrap entire page sections in decorative cards
- Keep card radius at 8px or below

Good patterns:

- Pricing-table-like comparison grids for skills, project metrics, and resume history
- Compact file rows with metadata columns
- Two-column settings layouts with a left label column and right controls
- Segmented controls for modes
- Icon buttons for tool actions

## System Component Language

The newer references introduce a more complete OS component vocabulary: date range pickers, notification panels, settings windows, sidebars, list rows, announcement bars, and media cards. These should become reusable system patterns, not isolated one-off designs.

### Date Range And Calendar Panels

Use the dark calendar reference for system-level date picking, filtering, analytics, project timelines, visitor-gallery moderation, and admin reports.

Structure:

- Floating dark panel.
- Left preset rail for quick ranges.
- Two-month grid for custom selection.
- Compact footer with selected dates and actions.
- Primary action uses the accent color, not a gradient.

Recommended styling:

- Panel background: `#1f1f21` to `#262628`.
- Inner sections: `#2b2b2d`.
- Border: `rgba(255,255,255,0.10)`.
- Radius: 8px.
- Day cells: 32px to 36px.
- Selected day: lavender/accent fill only when a date is active.
- In-range dates: subtle gray band.
- Event dot: 3px to 4px.
- Footer height: 48px to 56px.

Behavior:

- Presets should be rows, not large buttons.
- Keyboard focus must be visible.
- Range selection should preview on hover before commit.
- Apply/cancel actions belong in the footer.

### Notification And Announcement Panels

Use the dark notification reference for system tray notifications, update panels, release notes, project announcements, and Generative Studio system messages.

Structure:

- Top announcement bar for one-line system-wide notices.
- Notification list or card panel underneath.
- Cards can contain a title, summary, image preview, and compact action.

Recommended styling:

- Panel background: `#1d1d1f`.
- Card background: `#252527`.
- Card border: `rgba(255,255,255,0.10)`.
- Muted body text: `#a8a8a8`.
- Card radius: 8px.
- Image radius: 5px to 6px.
- Button height: 34px to 38px.

Behavior:

- Announcements should be dismissible.
- Notifications should support read/unread states.
- Images may use the halftone hover treatment when they preview projects or media.
- Keep notification actions compact: `Read more`, `Open`, `Dismiss`.

### Settings Windows

Use the settings reference as the model for Settings, Admin subpanels, CV editing, account-like areas, and system configuration.

Structure:

- Light floating window over a soft or blurred desktop.
- Left sidebar with account/system groups.
- Right content pane with focused settings content.
- Rows, dividers, and compact controls.
- Close action in the top-right corner.

Recommended styling:

- Outer shell: `#f4f4f2` or `rgba(255,255,255,0.86)`.
- Content pane: `#ffffff`.
- Sidebar selected row: `rgba(0,0,0,0.05)`.
- Divider: `#e7e7e2`.
- Text strong: `#171717`.
- Text muted: `#707070`.
- Radius: 10px for the window, 8px or less for inner controls.
- Shadow: `0 24px 60px rgba(0,0,0,0.18)`.

Behavior:

- Sidebar groups should be collapsible only when there is enough depth to justify it.
- Selected row should be quiet and obvious.
- Content headers should include title and short description.
- Destructive actions belong at the bottom of sections.

### Sidebar Rows And List Items

Across all system panels, list rows should follow one rhythm:

- 36px to 44px row height.
- 16px to 18px icon.
- 13px to 14px label.
- Optional 11px to 12px muted metadata.
- Hover state: subtle fill.
- Selected state: slightly stronger fill plus optional 2px accent rail.

This row pattern should be shared by Start Menu, Settings sidebar, Admin sections, File Explorer navigation, notification lists, and date presets.

## Color System

The current `themeStore` exposes four color channels: primary, secondary, tertiary, and accent. This direction should use those channels sparingly, not as dominant background color.

## Theme To Window System

The look and feel should flow through a clear stack:

```text
Theme tokens
  -> system configuration
  -> surface primitives
  -> shell components
  -> app windows
  -> interaction behavior
```

This keeps the OS coherent as it grows. A visual decision should not be recreated separately in Taskbar, Start Menu, Settings, Admin, and Window. It should be expressed once as a token, config value, surface variant, or window behavior rule.

### Theme Tokens

Tokens define raw values:

- Ink, canvas, line, text, and accent colors
- Radius
- Spacing density
- Shadows
- Motion
- Blur

### System Configuration

Configuration defines how the OS uses those tokens:

- Preferred theme
- Density
- Taskbar position and size
- Window chrome style
- Window body mode
- Reduced motion
- Default mobile window behavior
- Image treatment

### Surface Primitives

Surfaces should be reusable:

- `ChromeSurface`: taskbar, Start Menu, title bars, admin navigation
- `ContentSurface`: CV, File Explorer, Settings, About, project details
- `FloatingSurface`: calendar panels, notification panels, dropdowns
- `InsetSurface`: inputs, selected rows, nested controls
- `MediaSurface`: project previews and image thumbnails

### Window Behavior

Windows should be controlled by system rules:

- Desktop windows float, focus, minimize, maximize, close, and cascade predictably.
- Mobile windows open maximized by default.
- App metadata can choose body mode: `content`, `utilityDark`, `immersive`, or `iframe`.
- Window frame behavior should not be rewritten per app.

### Base Palette

```text
Ink 950       #111111  Main chrome
Ink 900       #151515  Menus, title bars
Ink 800       #1f1f1f  Hover tiles, raised chrome
Ink 700       #2a2a2a  Inputs on dark chrome
Line dark     rgba(255,255,255,0.08)

Canvas        #ffffff  Main app body
Canvas warm   #f7f7f5  Desktop and app background
Canvas raised #fbfbfa  Cards and controls
Line light    #e8e8e5

Text strong   #171717
Text muted    #666666
Text faint    #9a9a9a
Text inverse  #ffffff
```

### Accent Use

Use the theme accent only for:

- Focus rings
- Active tab indicators
- Selection checkmarks
- Small badges
- Critical call-to-action buttons
- Upload progress
- Links inside content

Do not use accent gradients as a default frame, page background, or repeated divider.

### Recommended Preset

Add a new preset named **Product Mono**:

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

This preset gives the OS the black-and-white base from the reference while preserving a small green success/accent signal.

## Typography

Use the existing system font stack. The reference depends on clean proportions, not a novelty typeface.

Recommended scale:

```text
Chrome label        11px / 16px, medium, uppercase optional
Chrome body         12px to 13px / 18px
Menu item title     13px / 18px, semibold
Menu description    12px / 16px, regular
Window title        13px / 18px, semibold
App body            14px / 20px
App section title   16px / 24px, semibold
Large value         32px to 40px, semibold
```

Rules:

- Letter spacing should stay at `0`.
- Use uppercase only for small metadata labels.
- Avoid viewport-scaled font sizes.
- Keep button text short and action-oriented.

## Radius, Borders, Shadows

The image uses soft rectangles, but not bubbly UI.

Recommended:

- Default radius: 8px
- Small controls: 6px
- Icon buttons: 6px or 8px
- Modals/windows: 8px
- Avoid `rounded-2xl` and fully rounded pills unless the control is naturally circular.

Borders:

- Use 1px borders for separation.
- On black chrome: `rgba(255,255,255,0.08)` default, `rgba(255,255,255,0.14)` hover.
- On light content: `#e8e8e5` default, `#d8d8d4` hover.

Shadows:

- Floating menu: `0 18px 50px rgba(0,0,0,0.28)`
- Window: `0 24px 60px rgba(0,0,0,0.24)`
- Light card hover: `0 8px 24px rgba(0,0,0,0.06)`
- Avoid colored glow except for rare focus or active feedback.

## Motion

Motion should reinforce the OS feeling without becoming ornamental.

Recommended:

- Menu open: fade + 4px vertical movement, 120ms to 160ms
- Window open: scale from 0.98 to 1, opacity, 140ms to 180ms
- Hover: background or border change, not scale by default
- Dragging: shadow deepens while moving
- Resize: immediate response, no laggy animation

Use Framer Motion where it already exists, but keep easing restrained:

```text
cubic-bezier(0.16, 1, 0.3, 1)
```

## Image Treatment

Use a dotted halftone hover effect as a signature visual pattern for project and preview imagery. On hover or keyboard focus, an image may reveal a fine black dot screen with a sparse accent-dot layer. The image should still be recognizable, but it should feel processed through the OS.

Use it for:

- Project previews
- Case study thumbnails
- Visitor Gallery images
- About/concept imagery
- CV project summaries

Avoid using it for:

- Small app icons
- Profile photos where identity clarity matters
- Dense admin rows
- Images that users need to inspect precisely

The effect should feel like a system texture: editorial, precise, and restrained. It should fade in without layout shift and respect reduced-motion preferences.

## Component Guidance

### Buttons

Primary buttons should be black on light surfaces and white on dark surfaces.

Use:

- Filled black for primary actions on light app bodies
- Outline or ghost for secondary actions
- Icon-only buttons for tools
- Compact heights: 32px to 40px

Avoid:

- Default blue-purple gradients
- Large pill buttons
- Full-width buttons except in mobile menus or login panels

### Inputs

On light surfaces:

- Background: white
- Border: `#deded8`
- Focus ring: accent, 2px outer or 1px border

On dark chrome:

- Background: `#202020`
- Border: `rgba(255,255,255,0.10)`
- Text: white

### Cards

Cards are for repeated items: projects, plans, files, skills, timeline entries, certifications.

Recommended:

- White or `#fbfbfa`
- 1px border
- 8px radius
- Minimal shadow
- Dense content

Avoid nested cards. If a section already has a framed surface, use rows, separators, or columns inside it.

### Tables And Comparison Views

The pricing grid in the reference is useful for PortfolioOS.

Use table-like layouts for:

- Skills by category and proficiency
- Project stack comparisons
- Resume milestones
- File metadata
- Admin app configuration
- Theme token previews

Rows should be 40px to 48px high with light dividers and clear columns.

### Badges

Badges should be small and functional:

- `Live`
- `Featured`
- `Admin`
- `Private`
- `WIP`
- `Coming soon`

Use muted backgrounds. Reserve accent colors for important states.

## Implementation Map

### Phase 1: Tokens And Theme Preset

Update the theme layer first so component work has a stable base.

Files to review:

- `src/store/themeStore.ts`
- `src/theme/theme.ts`
- `tailwind.config.js`
- `THEME_SYSTEM.md`

Tasks:

- Add the **Product Mono** preset.
- Reduce default glow use in component variants.
- Add neutral `ink`, `canvas`, and `line` tokens.
- Keep Star Citizen as an available preset, but stop treating it as the only design center.

### Phase 2: OS Chrome

Start with shell components, because they define the user's first impression.

Files to review:

- `src/components/Taskbar.tsx`
- `src/components/StartMenu.tsx`
- `src/components/Window.tsx`
- `src/components/WindowManager.tsx`
- `src/components/DesktopIcons.tsx`
- `src/components/ContextMenu.tsx` if present

Tasks:

- Convert taskbar and start menu to the black chrome language.
- Update window title bars to compact black chrome.
- Remove default neon/glow treatments from window focus.
- Ensure icon-only controls have accessible labels and tooltips.

### Phase 3: Core App Bodies

Move content-heavy apps to light work surfaces.

Files to review:

- `src/components/apps/FileExplorer.tsx`
- `src/components/apps/Resume.tsx`
- `src/components/apps/Skills.tsx`
- `src/components/apps/About.tsx`
- `src/components/apps/Contact.tsx`
- `src/components/apps/Settings.tsx`

Tasks:

- Use white/canvas bodies inside windows.
- Consolidate Resume, Skills, and Contact into a tabbed CV/resume surface.
- Treat project applications as the portfolio layer instead of maintaining a separate default Portfolio app.
- Replace decorative dark panels with tables, lists, and compact cards.
- Keep toolbars compact.
- Use icons for repeated file/app actions.

### Phase 4: Admin And Customization

Admin surfaces should feel like a serious control panel.

Files to review:

- `src/components/AdminPanel.tsx`
- `src/components/CustomizationSettings.tsx`
- `src/components/UploadProgress.tsx`

Tasks:

- Use dark navigation/sidebar chrome.
- Use light editing surfaces for forms and lists.
- Convert large colorful buttons to compact black/outline controls.
- Represent app/background/theme records as rows or compact cards.
- Add visitor-gallery moderation and image-upload controls when the public folder is implemented.

### Phase 5: Responsive Behavior

The supplied reference includes a mobile menu, so the OS should have a credible small-screen strategy.

Tasks:

- Treat the desktop as scrollable or app-focused on mobile.
- Use the black mobile start menu as the primary launcher.
- Maximize windows by default on small screens.
- Avoid tiny draggable targets on touch layouts.
- Keep title bars and toolbar controls at least 40px high on touch.

## Acceptance Checklist

Use this checklist before considering the look-and-feel migration complete.

- The default screen reads as a refined operating system, not a neon dashboard.
- Taskbar, start menu, context menus, and title bars use compact black chrome.
- Portfolio content uses light, readable app surfaces.
- Cards have 8px radius or less.
- Buttons do not rely on gradients as the default visual language.
- Hover states are subtle and consistent.
- Focus states are visible and accessible.
- App interiors use tables, rows, tabs, segmented controls, and compact action buttons where appropriate.
- No text overlaps in mobile or desktop viewports.
- No page sections are presented as cards inside cards.
- Star Citizen/cyber styling remains available as a theme, but the product mono direction is the default for this build track.

## Builder Notes

When implementing this direction, change one layer at a time:

1. Theme tokens and preset.
2. Taskbar, start menu, and windows.
3. App body surfaces.
4. Admin surfaces.
5. Responsive polish.

This keeps the OS usable during the migration and makes visual regressions easier to spot.
