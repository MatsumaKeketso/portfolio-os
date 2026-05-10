# Reads System

## Overview
The Reads system is a controlled Browser experience for portfolio articles and long-form notes.

## Purpose
It keeps reading content inside the operating system instead of relying on external iframe rendering.

## User Experience
Users open Browser and land on a database-backed Reads page. Articles appear in a bento grid with thumbnails, metadata, and short summaries. Selecting a read opens a native article page inside the Browser window.

## Functional Behavior
Reads are fetched from `os-site_content/reads` in Firestore. The document stores a `data` array of article records generated from `Reads.csv`.

The Admin Panel has a Reads import tab. The superuser uploads a CSV file, the system parses it in the browser, compares imported articles against the current Firestore document by `slug`, and only appends new articles.

The Browser supports:
- `browser://reads` for the Reads homepage.
- `browser://reads/[slug]` for article pages.
- `browser://reads/tag/[tag]` for curated tag pages capped at eight articles.
- External URLs as controlled references, not iframe-rendered pages.

Article pages include previous/next navigation. The previous button is hidden on the first article. Navigation buttons show the target article title.

Article pages include a Discuss section powered by the existing Disqus setup. The Disqus page identifier is the article slug.

## Rules & Constraints
Visitors can read published reads.

Only the superuser account can write reads to Firestore.

CSV imports do not overwrite existing reads. Existing rows are skipped when their slug already exists in the target content document.

Article HTML is sanitized before rendering. Scripts, inline event handlers, unsupported iframes, and unsafe links are removed or constrained.

## Dependencies
The system depends on:
- Firebase Firestore.
- `src/lib/reads.ts`.
- `src/components/apps/Browser.tsx`.
- `src/components/AdminPanel.tsx`.
- `scripts/importReadsFromCsv.mjs`.
- `ReadArticle` in `src/types.ts`.

## Edge Cases
If Firestore is empty, Browser shows an empty state.

If an article slug is missing from the loaded data, Browser shows a read unavailable state.

If images are remote URLs, the importer keeps them as-is. If images are local files, the importer can upload them when run with `--upload-images`.

## Open Questions
Project bookmarks are undefined. The Browser has a controlled bookmark area, but the source for future project-specific bookmarks still needs to be defined.

Article moderation workflow is undefined. Current import assumes owner-curated CSV content.
