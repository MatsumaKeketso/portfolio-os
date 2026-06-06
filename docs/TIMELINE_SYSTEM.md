# Timeline System

> Covers three tightly-coupled subsystems: **Timeline** (the public activity record and its app), **Observatory** (topics/threads that group timeline entries), and **Changelog** (system-update records that import into the Timeline). They share one storage pattern and one visibility model, so they are documented together.

## Overview

The Timeline is a live, owner-curated record of progress, updates, ideas, and system evolution. It is exposed to users as the **Timeline app** and is intended to make the OS feel like an evolving system rather than a static portfolio.

The Observatory is a layer above the Timeline: long-running **topics** (research threads, areas of focus) that reference timeline entries, reads, apps, and external links. Observatory topics are surfaced inside the Timeline app rather than as a separate app.

The Changelog is a feed of system-update records. It exists so OS changes can be imported into the Timeline as `system-update` entries without re-typing them.

## Purpose

These subsystems keep portfolio narrative content inside the OS, persisted to Firebase, and gated by a single role-aware visibility model — instead of being hardcoded into components or scattered across stores.

## User Experience

Users open the **Timeline app** (`history` icon, pinned to desktop) and see a chronological record of entries. Entries carry a type (win, milestone, system-update, project-update, idea, research, observation, read, media, note), each with its own icon and `<Badge>` tone. Featured entries are promoted as larger "chapter" cards on the horizontal timeline tape.

Observatory topics appear within the Timeline app as a way to group related entries into ongoing threads.

A superuser sees everything — drafts, archived, private, and admin-only entries/topics. Every other visitor sees only `public` + `published` content.

## Functional Behavior

### Storage

Each subsystem is one Firestore document under `os-site_content`, storing a `data` array — the same single-document pattern as Reads:

| Subsystem | Document | Array element type | Library | Store |
|---|---|---|---|---|
| Timeline | `os-site_content/timeline` | `TimelineEntry` | `src/lib/timeline.ts` | `src/store/timelineStore.ts` |
| Observatory | `os-site_content/observatory` | `ObservatoryTopic` | `src/lib/observatory.ts` | `src/store/observatoryStore.ts` |
| Changelog | `os-site_content/changelog` | `ChangelogEntry` | `src/lib/changelog.ts` | (imported into `timelineStore`) |

Each library normalizes raw records on read (validating enum fields, defaulting missing values) and writes the whole array back with a `setDoc`. Timeline entries are sorted newest-first by `createdAt`; changelog entries by `date`.

### Loading and boot

`Desktop.tsx` runs `loadTimeline` and `loadObservatory` as boot tasks (`timeline`, `observatory` in `BOOT_TASKS`). Both stores fall back to seed data (`src/data/timelineSeed.ts`, `src/data/observatorySeed.ts`) when their Firestore document is empty, so the app never shows a blank state on first load. After authentication changes, `Desktop.tsx` re-runs both loaders so a superuser sign-in promotes the view from public-only to full content.

### Visibility model

`filterTimelineByVisibility` / `filterObservatoryByVisibility` apply the client-side role filter:

- **Superuser:** sees all entries/topics regardless of status or visibility.
- **Everyone else:** `visibility === 'public'` and (for timeline) `status === 'published'`; archived observatory topics are hidden.

The shared types are `ContentVisibility = 'public' | 'private' | 'admin'` and `TimelineEntryStatus = 'draft' | 'published' | 'archived'`.

### Writes

Both stores guard writes with `canWrite()` — `auth.currentUser?.email === 'admin@os.com'` — and debounce saves (~800ms). `timelineStore` exposes `addEntry`, `updateEntry`, `removeEntry`, `archiveEntry`, and selectors (`getByType`, `getByTopic`, `getPublic`). `observatoryStore` exposes `addTopic`, `updateTopic`, `removeTopic`, `setTopicStatus`, plus `attachTimelineEntry`/`detachTimelineEntry` for the topic↔entry join.

### Changelog import

`timelineStore.importChangelogEntries(changelog)` maps each `ChangelogEntry` to a `system-update` timeline entry. It is **idempotent**: an entry is skipped if a timeline entry already exists with `source === 'changelog'` and the same `sourceId`. `importChangelogFromFirestore()` fetches `os-site_content/changelog` first, then imports. Imported entries carry `source: 'changelog'` and `sourceId` = the changelog entry's id.

## Rules & Constraints

- All three documents are written only by the superuser (`admin@os.com`); Firestore rules for `os-site_content` are the source of truth, and the stores enforce the same boundary client-side.
- Visibility filtering is a UX convenience, not a security boundary — never rely on it to hide data a visitor must not read; that belongs in Firestore rules.
- Changelog import must stay idempotent; do not change the `(source, sourceId)` dedupe key without a migration plan.
- `featured` is set explicitly by the author. Do not derive it from type or size.
- Timeline/Observatory chips, tags, and status indicators use the canonical `<Badge>` primitive (`src/components/ui/Badge.tsx`), not ad-hoc pill spans.

## Dependencies

- Firebase Firestore (`src/lib/firebase.ts`).
- Types: `TimelineEntry`, `TimelineEntryType`, `TimelineEntryStatus`, `TimelineEntrySource`, `TimelineMedia`, `TimelineLink`, `TimelineMetric`, `ObservatoryTopic`, `ObservatoryTopicStatus`, `ChangelogEntry`, `ContentVisibility` in `src/types.ts`.
- Libraries: `src/lib/timeline.ts`, `src/lib/observatory.ts`, `src/lib/changelog.ts`, `src/lib/timelineMedia.ts`.
- Stores: `src/store/timelineStore.ts`, `src/store/observatoryStore.ts`.
- Seeds: `src/data/timelineSeed.ts`, `src/data/observatorySeed.ts`.
- App: `src/components/apps/Timeline.tsx`, registered in `desktopStore.ts` (`id: 'timeline'`) and `WindowManager.tsx` (`case 'Timeline'`).
- Boot wiring: `src/components/Desktop.tsx` (`BOOT_TASKS`, `loadTimeline`, `loadObservatory`).
- `<Badge>` primitive: `src/components/ui/Badge.tsx`.

## Edge Cases

- Empty Firestore document → seed fallback. Once a superuser publishes, the remote document overrides the seed.
- A changelog entry without an `id` is skipped by the importer.
- Visibility filter runs on already-fetched data; a role change (sign-in/out) requires re-running `loadTimeline`/`loadObservatory` (handled in `Desktop.tsx`).

## Open Questions

- **Admin authoring UI is not yet built.** The data layer, seeds, read-only app, and changelog importer all exist in code, but the Admin Panel has no Timeline/Observatory/Changelog tab. Entry/topic creation and the changelog import currently have no UI entry point. This is the main pending work for the subsystem.
- Should the single-document `data`-array storage migrate to per-entry documents as the working set grows? (Currently small; one read / one write.)
- Should `source: 'read'` timeline entries auto-generate from the Reads system, mirroring the changelog import path?
- Should the changelog be populated from `docs/CHANGELOG.md` or an in-app source of truth?
