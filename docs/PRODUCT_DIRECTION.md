# PortfolioOS Product Direction

> PortfolioOS is not a portfolio website with desktop styling. It is Keketso's portfolio expressed as an operating system concept, built by Generative Studio.

## Core Idea

PortfolioOS should feel like a real system that happens to be Keketso's portfolio. The operating system itself is the work: the desktop, windows, app model, file explorer, admin panel, theme system, motion language, and interaction patterns are all evidence of the portfolio.

The user should not feel like they opened a normal portfolio and then clicked through separate portfolio apps. They should feel like they entered a designed computing environment where every app, folder, project, setting, and system detail communicates Keketso's taste for systems, complexity, dynamic interfaces, and pattern-making.

## Narrative

The product should constantly communicate three truths:

1. **This is Keketso's portfolio.**
   The OS is a personal creative and technical artifact. It should carry Keketso's name, authorship, projects, CV, and system-building philosophy.

2. **This is an operating system concept.**
   The desktop metaphor is not decorative. It is the organizing principle. Projects are apps, content lives in folders, configuration happens through system tools, and exploration feels like using a custom OS.

3. **This was built by Generative Studio.**
   Generative Studio should be visible as the builder/studio identity behind the system. It should appear in system-level surfaces, boot/about moments, credits, and subtle chrome language without overpowering Keketso's portfolio.

Recommended phrasing:

- `Keketso OS`
- `A portfolio operating system by Keketso`
- `Built by Generative Studio`
- `A Generative Studio system concept`
- `Explore Keketso's work as an operating system`

## Keketso's Creative Positioning

The OS should make room for this point of view:

Keketso likes systems, complexity, dynamic motion graphics, complicated interfaces, and the work of unraveling patterns. He likes taking complex interface ideas, finding their internal logic, and turning them into reusable pattern systems.

This should show up in the product through:

- Layered but understandable interfaces
- Motion that explains structure
- Dense UI that still scans cleanly
- Systems within systems: apps, folders, settings, themes, admin workflows
- Patterns repeated deliberately across different surfaces
- Visible configuration and customization tools
- A sense that the portfolio is alive and operable, not a static document

Do not flatten the product into a simple brochure. The complexity is part of the identity. The goal is to make the complexity legible.

## Information Architecture

### The OS Is The Portfolio

Portfolio should not exist as a separate app whose job is to duplicate the whole experience. The OS shell is already the portfolio.

Projects should be represented as:

- Desktop apps
- Start menu entries
- File Explorer folders or assets
- Admin-created application records
- Windowed experiences
- Optional project details inside the app launch flow

The admin panel already supports adding applications. That workflow should become the primary portfolio publishing workflow:

1. Create or register a project.
2. Choose whether it launches as a component, iframe, static content view, or external link.
3. Add icon, description, tags, screenshots, status, and default window size.
4. Pin it to desktop or taskbar when it deserves first-level presence.

In this model, launching a project app is equivalent to viewing portfolio work.

### CV, Skills, Contact, And Resume

Resume, Skills, and Contact should not be separate top-level apps by default.

They belong inside a single CV/resume experience:

- **Overview**: name, title, short profile, location, availability
- **Experience**: roles, projects, clients, responsibilities
- **Skills**: grouped capabilities, tools, technologies, proficiency, years
- **Education and Certifications**
- **Contact**: email, socials, website, relevant links
- **Download or export CV**

This can be a single `CV` or `Resume` app with tabs. It may also be accessible from the system About screen, Start menu, and desktop shortcut, but the content should not be split across many apps.

Recommended tab names:

- `Profile`
- `Experience`
- `Skills`
- `Projects`
- `Contact`
- `Files`

The `Projects` tab should summarize notable work, but project exploration should still happen through the OS app model.

### About Is System-Level

About should remain independent, but it should be treated as a system-level option, not a personal profile clone.

The About surface should answer:

- What is this OS?
- Who is Keketso?
- What is Generative Studio?
- Why does this portfolio exist as an operating system?
- What version/build is this?
- What technologies and systems power it?

Recommended About sections:

- `System`
- `Concept`
- `Keketso`
- `Generative Studio`
- `Credits`
- `Build`

The About screen can link into the CV/resume, but it should not duplicate the full CV.

## App Model

### Keep As System Apps

These apps support the operating system metaphor and should remain top-level:

- File Explorer
- Settings
- Task Manager or System Monitor
- Admin Panel
- Calculator if it feels like a small OS utility
- Notepad only if visitor text creation is disabled or kept private/admin-only
- Weather only if it supports the world-building or personal context

### Convert To Tabs Or Sections

These should not be separate default apps:

- Resume
- Skills
- Contact
- Portfolio

Recommended destination:

- Resume, Skills, and Contact become tabs inside `CV` or `Resume`.
- Portfolio becomes the OS itself plus the app/project registry.

### Keep As Project Apps

Individual projects can and should become apps. This is the core portfolio mechanic.

Examples:

- A project iframe app
- A case study app
- A prototype app
- A motion graphics viewer
- A code/demo app
- A gallery app for a specific body of work

Each project app should feel like a real object in the OS, with metadata, launch behavior, and a place in the desktop/start menu system.

## Visitor File Explorer Space

The File Explorer should include a constrained public contribution area where visitors can create folders and upload images.

Recommended name:

- `Visitors`
- `Guest Folder`
- `Public Drop`
- `Community Folder`
- `Visitor Gallery`

Best fit for this product:

`Visitor Gallery`

This folder should feel like a small participatory layer inside Keketso OS, not an unrestricted file system.

### Visitor Capabilities

Visitors may:

- Create folders inside the visitor area.
- Upload image files only.
- Rename their own folders if ownership/session rules allow it.
- View public images.
- Leave lightweight image metadata only if it is sanitized and not linkable.

Visitors may not:

- Upload text files.
- Create freeform text documents.
- Add links.
- Upload executable files, archives, SVG with scripts, HTML, PDF, video, or unknown file types.
- Edit system folders.
- Delete other visitors' content unless moderation rules allow it.

### Why Images Only

Text files and freeform comments can carry malicious links, spam, phishing, harassment, or unsafe content. The visitor area should start with images because the moderation surface is simpler and the purpose is clearer.

If comments are added later, they should be:

- Plain text only.
- Link-stripped.
- Length-limited.
- Moderated or rate-limited.
- Stored separately from executable/rendered content.
- Rendered as escaped text, never HTML.

### Image Limits

Recommended upload constraints:

- File types: JPEG, PNG, WebP, GIF only if animation is acceptable.
- Avoid SVG for visitor uploads because SVG can contain scripts or external references.
- Max file size: 2MB to 5MB per image.
- Max dimensions: 4096px on the longest edge.
- Max uploads per session: configurable.
- Max folders per session: configurable.
- Strip metadata where possible.
- Generate thumbnails server-side or through a trusted image pipeline where possible.

### Moderation And Safety

The visitor area should be treated as untrusted public input.

Required rules:

- Validate MIME type and file extension.
- Re-encode images when possible.
- Store visitor uploads in a separate bucket/path from admin portfolio assets.
- Disable scriptable formats.
- Rate-limit uploads.
- Add admin moderation controls.
- Keep public read separate from write permissions.
- Preserve an audit trail: created time, approximate session/user identifier, original filename, file size, MIME type.

Recommended storage structure:

```text
/portfolio-assets/      Admin-controlled portfolio assets
/visitor-gallery/       Public visitor image uploads
/system/                Built-in OS assets
```

## Admin Publishing Workflow

The admin panel should be reframed as the publishing console for Keketso OS.

Primary admin jobs:

- Add, edit, and remove project apps.
- Pin project apps to the desktop or taskbar.
- Manage project metadata.
- Manage CV/resume data.
- Manage visitor gallery moderation.
- Manage system theme and backgrounds.
- Manage system credits and Generative Studio branding.
- Export/import system configuration.

Recommended admin sections:

- `Apps`
- `Projects`
- `CV`
- `Visitor Gallery`
- `Appearance`
- `System`
- `Data`

## Branding Placement

The OS should remind users of Keketso and Generative Studio without turning every surface into an advertisement.

Recommended placements:

- Boot or loading screen: `Keketso OS` and `Built by Generative Studio`.
- Start menu footer: compact `Generative Studio` mark or text.
- About screen: full explanation of concept, authorship, and build.
- Settings/System: OS name, version, build info.
- Window chrome or taskbar: subtle system identity.
- Visitor Gallery empty state: explain that this is a public folder inside Keketso OS.

Avoid:

- Repeating full slogans in every app body.
- Large brand blocks that interrupt utility.
- Making Generative Studio visually louder than the portfolio owner.

## UX Acceptance Criteria

Use this checklist when refactoring the product architecture.

- The OS itself clearly acts as the portfolio.
- `Portfolio` is not a separate default app duplicating the whole experience.
- `Resume`, `Skills`, and `Contact` are unified inside a CV/resume app with tabs.
- `About` is a system-level concept/about/build screen.
- Project work is published as apps through the admin workflow.
- Visitor-created content is limited to a clearly scoped image-only folder.
- Visitor uploads cannot include text files, links, SVG, scripts, PDFs, videos, archives, or executable content.
- Generative Studio is visible as the builder.
- Keketso is visible as the concept owner and portfolio subject.
- The product still celebrates complex systems, motion, and pattern thinking without becoming confusing.

## Implementation Phases

### Phase 1: Rename The Product Center

- Decide on the system name, such as `Keketso OS`.
- Update About, boot, taskbar/start menu text, and docs to reflect the concept.
- Make Generative Studio visible in system-level surfaces.

### Phase 2: Simplify Default Apps

- Remove separate default `Portfolio`, `Skills`, and `Contact` apps from first-level navigation.
- Keep or rename `Resume` as `CV`.
- Move skills/contact content into CV tabs.
- Keep About as a system app.

### Phase 3: Make Projects The App Layer

- Treat admin-added apps as portfolio project entries.
- Add metadata fields where needed: status, tags, screenshots, role, year, links.
- Improve launch surfaces so project apps feel intentionally curated.

### Phase 4: Build Visitor Gallery

- Add a protected visitor root folder in File Explorer.
- Enable visitor folder creation inside that root only.
- Enable image-only uploads with strict size/type validation.
- Add moderation tools in Admin Panel.

### Phase 5: System Polish

- Align the IA changes with `LOOK_AND_FEEL.md`.
- Make the CV tab experience visually strong.
- Ensure branding, About, and project apps tell one coherent story.
