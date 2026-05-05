# Project Knowledge Base

## Overview

This document is the working knowledge base for the web-based operating system portfolio project.

The project is a portfolio website presented as an operating system-like interface. It should simulate desktop, window, file, application, and settings behavior within the limits of a website.

This document does not define a new project name. The repository currently uses `genos` in `package.json` and `GenOS` in existing documentation. Whether `GenOS` is the canonical public name is unresolved.

## Purpose

This document preserves product intent, system behavior, terminology, and open decisions for future developers and agents.

It exists to prevent repeated redesign, duplicated planning, inconsistent naming, and undocumented changes to the operating-system concept.

## User Experience

Users should experience the site as a structured, tactile, interactive operating system-like environment.

The experience should include:

- A desktop workspace.
- App launching.
- Windowed applications.
- File browsing.
- Context-aware actions.
- Settings and system-level controls.
- Portfolio content expressed through the operating system itself.

The experience should still behave like a website where web-native interactions make sense.

## Functional Behavior

The system is organized around these documented areas:

- Desktop environment.
- Window management system.
- File system.
- User system.
- Design system.
- Application registry.
- Context menus.
- Settings and system utilities.
- Admin Panel and content management.
- Editable owner/system information.
- Background management.
- Milestone management.

New documentation should identify affected systems before proposing or implementing changes.

Each system or feature document should use this structure:

```text
# [System / Feature Name]

## Overview
## Purpose
## User Experience
## Functional Behavior
## Rules & Constraints
## Dependencies
## Edge Cases
## Open Questions
```

## Rules & Constraints

Do not invent project names, subsystem names, acronyms, feature labels, framework names, or architectural terminology.

If terminology is unclear:

- Mark it as undefined.
- Use generic descriptive language.
- Ask for clarification when the decision affects implementation or public-facing copy.

Do not document the project as a real low-level operating system. It does not include a kernel, driver model, hardware abstraction layer, native process system, or native file system access.

Do document the operating-system-like frontend behavior that the website can support.

Visitor-generated content must be constrained. Current direction allows visitor-created folders and image uploads in the Visitor Gallery. Text files, links, executable content, SVG, HTML, scripts, unknown file types, and unmoderated public comments should not be treated as general file-system features.

Feedback about the platform can exist as a bounded app or experience with moderation and safe rendering.

## Dependencies

This knowledge base connects to:

- [CLAUDE_HANDOFF_SYSTEM_UPDATES.md](./CLAUDE_HANDOFF_SYSTEM_UPDATES.md)
- [OS_BEHAVIOR_MODEL.md](./OS_BEHAVIOR_MODEL.md)
- [PRODUCT_DIRECTION.md](./PRODUCT_DIRECTION.md)
- [LOOK_AND_FEEL.md](./LOOK_AND_FEEL.md)
- [LOOK_AND_FEEL_UPDATE_SPEC.md](./LOOK_AND_FEEL_UPDATE_SPEC.md)
- [INCREMENTAL_REFINEMENT_PLAN.md](./INCREMENTAL_REFINEMENT_PLAN.md)
- [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)
- [../THEME_SYSTEM.md](../THEME_SYSTEM.md)

The implementation currently depends on the project codebase for actual behavior. Documentation should not claim a feature is complete unless it is visible in code or verified in the running app.

## Edge Cases

Existing documentation may contain names, labels, or claims that predate the current terminology rule.

Some documents currently describe planned behavior and implemented behavior in the same file. Future updates should separate:

- Current behavior.
- Planned behavior.
- Open decisions.

The file `docs/DESIGN_SYSTEM.ms` appears to contain Markdown content but does not use a `.md` extension. This should be reviewed before renaming, because it may be referenced externally.

## Open Questions

- Is `GenOS` the confirmed public project name, or only the current package/documentation label?
- Should the documentation use “Keketso” only, or is a longer owner name acceptable in credits?
- What is the relationship between `Kagetsu`, Keketso, and the portfolio identity?
- What is the correct email address for the About app?
- What is the Generative Studio website URL?
- Where should constrained About app editable content be stored?
- What is the confirmed superuser/admin account identity?
- Should admin status be based on Firebase custom claims, a Firestore profile field, an allowlisted UID, or config?
- What taskbar/start icon should replace the current square grid icon?
- What milestone tags should appear in the selectable dropdown?
- What image size limits should apply to milestones and backgrounds?
- What is the exact storage limit for visitor folders and image uploads?
- Should visitor-created folders be public immediately, or require moderation?
- Should feedback be named generically as “Feedback” until a product label is approved?
- Which current documents should be refactored first into the required documentation structure?
