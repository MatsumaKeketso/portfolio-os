# GenOS Documentation

Welcome to the GenOS documentation directory. This folder contains detailed technical documentation, architecture guides, and additional resources for developers.

## 📚 Documentation Index

### Core Documentation

- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - **Canonical design system reference** ⭐
  - Layered architecture (primitive tokens → CSS variables → theme presets → Tailwind utilities → primitives → apps)
  - Full token reference (OS ink/canvas/line/text, semantic bg/fg/stroke, typography scale, interaction primitives)
  - Component primitive inventory (what's in use, what's dead legacy)
  - The five-step AppShell app contract
  - Surface taxonomy (chrome / content / floating / inset / media)
  - Visual rules, migration guide, audit of current app adoption
  - This doc takes precedence over older planning docs for current implementation behavior

- **[PROJECT_KNOWLEDGE_BASE.md](./PROJECT_KNOWLEDGE_BASE.md)** - Current documentation source of truth
  - Defines the web-based operating system portfolio intent
  - Records terminology constraints and unresolved naming decisions
  - Sets the required documentation structure for future system and feature docs
  - Identifies core systems, constraints, dependencies, edge cases, and open questions

- **[CLAUDE_HANDOFF_SYSTEM_UPDATES.md](./CLAUDE_HANDOFF_SYSTEM_UPDATES.md)** - Current implementation handoff for Claude
  - Captures latest owner feedback as system-wide implementation tasks
  - Covers About app editing, CV content, background persistence, window performance, Admin Panel, milestones, taskbar icon configuration, and permissions
  - Defines risks, dependencies, open questions, and recommended work order

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture and technical overview
  - Original comprehensive documentation (formerly READMEAI.md)
  - Project structure and component breakdown
  - Technology stack details
  - Built-in applications overview
  - State management with Zustand
  - Design system and patterns

- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and feature evolution
  - Major updates from v1.0 to v2.0
  - New features documentation (formerly READMEAI_2.md)
  - Authentication system overview
  - Theme customization details
  - User profile management
  - Migration guides

- **[LOOK_AND_FEEL.md](./LOOK_AND_FEEL.md)** - Product mono visual direction
  - Reference-image interpretation for the OS interface
  - Dark chrome and light work-surface design rules
  - Component guidance for taskbar, start menu, windows, apps, and admin surfaces
  - Implementation phases and acceptance checklist

- **[PRODUCT_DIRECTION.md](./PRODUCT_DIRECTION.md)** - GenOS product architecture
  - Positions the OS itself as the portfolio
  - Defines project apps, CV tabs, system About, and Generative Studio branding
  - Documents the image-only visitor folder concept
  - Provides app simplification and implementation phases

- **[OS_BEHAVIOR_MODEL.md](./OS_BEHAVIOR_MODEL.md)** - Windows-inspired web OS behavior model
  - Defines desktop, taskbar, window, File Explorer, app, and settings behaviors
  - Specifies context-aware right-click menu contexts and action groups
  - Separates web-supported OS features from native-only capabilities
  - Provides implementation phases for OS-like frontend behavior

- **[INCREMENTAL_REFINEMENT_PLAN.md](./INCREMENTAL_REFINEMENT_PLAN.md)** - Codebase-aware refinement sequence
  - Reviews the current implementation foundation
  - Defines section-by-section execution without repeated overhauls
  - Identifies current gaps in context menus, File Explorer, windows, surfaces, and feedback
  - Adds the Feedback app as a web-native experience

- **[IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)** - Current actioned vs pending tracker
  - Audits sections 1-5 against the actual codebase
  - Lists what is implemented, partially implemented, and pending
  - Identifies next smallest actions by section
  - Tracks future sections for Feedback and system components

- **[APP_MEDIA_SYSTEM_PLAN.md](./APP_MEDIA_SYSTEM_PLAN.md)** - Media app and mini player implementation plan
  - Defines audio, PDF, video, and image app routing from Archive
  - Specifies Music app and floating mini player behavior
  - Keeps the taskbar untouched while adding a separate playback surface
  - Provides Claude-ready implementation notes and acceptance criteria

- **[LOOK_AND_FEEL_UPDATE_SPEC.md](./LOOK_AND_FEEL_UPDATE_SPEC.md)** - Build spec for the new OS experience
  - Defines the phased UI and IA update plan
  - Maps changes to likely source files
  - Specifies Product Mono, CV tabs, project apps, Visitor Gallery, chrome restyling, system components, and OS behavior
  - Includes acceptance criteria for implementation

### Technical References

- **[ADMINPANEL_AUDIT.md](./ADMINPANEL_AUDIT.md)** - Admin panel functionality audit
  - Pre-fix analysis report (2025-12-31)
  - Detailed feature testing results
  - Critical issues and fixes
  - Working features documentation (28 features)
  - Code examples and recommendations

## 🗂️ Root Documentation

The following documentation files are kept in the project root for easy access:

- **[../README.md](../README.md)** - Main project README
  - Quick start guide
  - Installation instructions
  - Feature overview
  - Technology stack
  - Development guide

- **[../THEME_SYSTEM.md](../THEME_SYSTEM.md)** - Theme system guide
  - Centralized design system documentation
  - Theme structure and usage
  - Component defaults
  - Customization guide
  - Best practices

- **[../UPLOAD_SETUP.md](../UPLOAD_SETUP.md)** - Upload functionality setup guide
- **[../FILE_UPLOAD_GUIDE.md](../FILE_UPLOAD_GUIDE.md)** - File upload and authentication setup guide

## 📖 Quick Links

### For New Users
1. Start with [../README.md](../README.md) for project overview
2. Follow the Quick Start guide for installation
3. Review [CHANGELOG.md](./CHANGELOG.md) for latest features

### For Developers
1. Read [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) **first** — it is the canonical reference for tokens, primitives, and the app contract
2. Read [PROJECT_KNOWLEDGE_BASE.md](./PROJECT_KNOWLEDGE_BASE.md) for documentation rules, current intent, and unresolved decisions
3. Read [CLAUDE_HANDOFF_SYSTEM_UPDATES.md](./CLAUDE_HANDOFF_SYSTEM_UPDATES.md) for the current implementation handoff
4. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
4. Read [PRODUCT_DIRECTION.md](./PRODUCT_DIRECTION.md) for product architecture
5. Read [OS_BEHAVIOR_MODEL.md](./OS_BEHAVIOR_MODEL.md) for OS-like interaction behavior
6. Check [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md) for current actioned vs pending work
7. Use [APP_MEDIA_SYSTEM_PLAN.md](./APP_MEDIA_SYSTEM_PLAN.md) for the next app/media wave
8. Use [INCREMENTAL_REFINEMENT_PLAN.md](./INCREMENTAL_REFINEMENT_PLAN.md) for codebase-aware sequencing
9. Use [LOOK_AND_FEEL_UPDATE_SPEC.md](./LOOK_AND_FEEL_UPDATE_SPEC.md) for the implementation plan
10. Study [../THEME_SYSTEM.md](../THEME_SYSTEM.md) for styling
11. Follow [LOOK_AND_FEEL.md](./LOOK_AND_FEEL.md) for the target OS visual language
12. Check [ADMINPANEL_AUDIT.md](./ADMINPANEL_AUDIT.md) for admin features
13. Review component examples in source code

### For Contributors
1. Review [../README.md](../README.md) Contributing section
2. Understand the architecture in [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Follow code standards and TypeScript best practices
4. Test admin features per [ADMINPANEL_AUDIT.md](./ADMINPANEL_AUDIT.md)

## 🔧 Documentation Structure

```
portfolio-os/
├── README.md                    # Main project documentation
├── THEME_SYSTEM.md             # Theme system guide
├── docs/                       # Additional documentation
│   ├── README.md              # This file
│   ├── DESIGN_SYSTEM.md       # Canonical design system reference
│   ├── ARCHITECTURE.md        # System architecture
│   ├── CHANGELOG.md           # Version history
│   ├── IMPLEMENTATION_PROGRESS.md # Current actioned vs pending tracker
│   ├── INCREMENTAL_REFINEMENT_PLAN.md # Codebase-aware refinement sequence
│   ├── LOOK_AND_FEEL.md       # Visual direction
│   ├── LOOK_AND_FEEL_UPDATE_SPEC.md # New OS experience implementation spec
│   ├── OS_BEHAVIOR_MODEL.md   # Web OS behavior model
│   ├── PRODUCT_DIRECTION.md   # Product architecture
│   ├── ADMINPANEL_AUDIT.md    # Admin panel audit
│   ├── CLAUDE_HANDOFF_SYSTEM_UPDATES.md # Current Claude implementation handoff
│   └── PROJECT_KNOWLEDGE_BASE.md # Documentation source of truth
├── firebase.json              # Firebase deploy config
└── .firebaserc                # Firebase project aliases
```

## 📝 Documentation Standards

When adding new documentation:

1. **Format**: Use Markdown (.md) files
2. **Structure**: Include table of contents for long documents
3. **Code Examples**: Use proper syntax highlighting
4. **Screenshots**: Place in `/docs/images/` (create if needed)
5. **Updates**: Keep version history and last updated date
6. **Cross-references**: Link to related documentation

## 🔄 Keeping Documentation Updated

Documentation should be updated when:

- New features are added
- Major refactoring occurs
- Breaking changes are introduced
- Architecture patterns change
- New dependencies are added
- API changes are made

## 🤝 Contributing to Documentation

To improve documentation:

1. Identify gaps or outdated information
2. Create a branch: `docs/your-improvement`
3. Make clear, concise updates
4. Include examples where helpful
5. Submit a pull request
6. Tag with `documentation` label

## 📞 Support

For documentation questions or improvements:
- Open an issue with the `documentation` label
- Tag @MatsumaKeketso for review
- Suggest improvements via pull request

---

**Last Updated:** 2026-05-01
**Maintained by:** Keketso Matsuma
