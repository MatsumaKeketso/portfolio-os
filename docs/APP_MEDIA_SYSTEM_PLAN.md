# App Media System

## Overview

The App Media System defines how GenOS should handle uploaded and curated media files as distinct OS applications instead of forcing every file type through the generic `FileViewer` surface.

This system covers:

- music/audio playback
- PDF viewing
- video viewing
- image viewing
- Archive file launch behavior
- a floating mini player outside the taskbar

## Purpose

The current Archive/FileViewer flow can identify images, videos, audio files, and PDFs, but the experience is still generic and visually underdeveloped. GenOS should feel like an operating system: opening different file types should launch purpose-built applications with their own controls, layouts, and persistent system behavior.

The music system also supports the portfolio atmosphere by allowing owner-curated, license-free tracks to play while visitors explore the OS.

## User Experience

When a user opens a media file in Archive:

- audio opens in a dedicated Music app
- PDFs open in a dedicated PDF reader app
- videos open in a dedicated video player app or improved video viewer
- images open in a dedicated image preview/gallery app or improved image viewer
- unsupported files show a calm unsupported-file state with download/open options

When music is playing or paused:

- a floating mini player appears next to the taskbar
- the mini player is separate from the taskbar and must not alter taskbar layout
- there is a visible gap between the taskbar container and the mini player
- the mini player disappears only when playback is stopped
- pausing playback keeps the mini player visible

Clicking the mini player should open the full Music app.

## Functional Behavior

### File Launch Routing

Archive should route files by `viewerType` from `src/lib/fileUtils.ts`.

Current known viewer types:

- `image`
- `video`
- `audio`
- `pdf`
- `text`
- `code`
- `browser`
- `notepad`
- `none`

The generic `FileViewer` should remain as fallback, but the primary path should become:

- `audio` -> Music app
- `pdf` -> PDF Reader app
- `video` -> Video Player app
- `image` -> Image Viewer app

### Music App

The Music app should:

- play local uploaded audio files already available through Archive
- support owner-curated license-free music files
- display track title, file name, duration, progress, and playback status
- support play, pause, stop, previous, next, and seek
- continue playback when the Music app window is closed or minimized, unless stopped
- reopen/focus the Music app when the mini player is clicked

### Mini Player

The mini player should:

- render outside the taskbar
- position near the taskbar with a consistent gap
- never be a child of the taskbar
- never change taskbar width, height, icon spacing, or cutout calculations unless intentionally added later
- show thumbnail/artwork area
- use a generated color/gradient background when no artwork exists
- show progress
- show play/pause, previous, next, and stop controls
- remain visible while playback is active or paused
- disappear when playback is stopped or no track is loaded

The mini player should visually relate to the taskbar:

- rounded dark chrome surface
- tokenized border
- controlled shadow
- compact layout
- no shared container with the taskbar

### PDF Reader App

The PDF reader should:

- open PDFs in a dedicated window
- support inline viewing where browser capabilities allow it
- provide fallback actions when inline rendering fails
- avoid relying only on an iframe if content disposition, CORS, or browser restrictions block rendering
- include open/download controls
- use OS chrome and content surface tokens

### Video Player App

The video player should:

- improve on the current generic video display
- support native video controls initially
- use a richer media surface around the video
- show file metadata
- avoid autoplay unless explicitly requested

### Image Viewer App

The image viewer should:

- improve on the current generic image preview
- support fit/fill/actual-size controls when practical
- show filename and metadata
- keep image inspection clean and uncluttered

## Rules & Constraints

- Do not touch the taskbar layout when implementing the mini player.
- Do not place the mini player inside the taskbar.
- Do not make the mini player part of the fullscreen window taskbar cutout unless explicitly requested later.
- Uploaded music must be license-free or owner-curated.
- Public visitors should not be able to upload arbitrary audio files unless a future moderated workflow is explicitly defined.
- Visitor Gallery remains image-only.
- Keep file-type routing explicit and predictable.
- Keep the generic `FileViewer` as fallback for unsupported or legacy paths.
- Use semantic design tokens for surfaces, borders, foregrounds, controls, and focus states.
- Avoid raw hex values and raw white-alpha styling in new media app surfaces.

## Dependencies

- `src/lib/fileUtils.ts`
  - Existing file type detection and `viewerType` mapping.

- `src/components/apps/FileExplorer.tsx`
  - Archive file open behavior.

- `src/components/apps/FileViewer.tsx`
  - Current fallback viewer and source of existing PDF/audio/video handling.

- `src/components/WindowManager.tsx`
  - App routing and lazy-loaded app components.

- `src/store/desktopStore.ts`
  - App registry, window open/focus behavior, and persisted app definitions.

- Firebase Storage
  - Owner-curated media storage paths.

- Firebase Firestore
  - Optional track metadata collection if music is curated as library data rather than only file uploads.

## Edge Cases

- PDF fails to render inline because of browser or storage response restrictions.
- Audio file has no metadata or duration until loaded.
- Audio playback is blocked until user interaction.
- Track is deleted while playing.
- Mini player overlaps with taskbar, system tray popups, notifications, or window cutouts.
- Multiple audio files are opened in quick succession.
- User closes Music app while playback continues.
- User signs out while owner-curated media is playing.
- Visitor opens a file they can read but cannot edit.
- Unsupported audio format is uploaded.

## Open Questions

- What should the Music app be called publicly: `Music`, `Player`, or another name?
- Where should owner-curated music files live in Firebase Storage?
- Should curated track metadata live in `os-site_content` or a dedicated `os-music` collection?
- Should the Music app ship with default tracks or only show uploaded owner-curated files?
- Should the mini player support volume, mute, and shuffle in version one?
- Should PDFs use a library-based renderer later, or is browser-native rendering acceptable for version one?
- Should videos have a playlist/library mode or only open single files from Archive?

## Implementation Notes For Claude

1. Preserve the current taskbar and `TaskbarStrip` behavior.
2. Add a media playback store for audio state:
   - current track
   - queue
   - playing/paused/stopped state
   - current time
   - duration
   - volume
3. Add a hidden/shared audio element controller at shell level, not inside a single window.
4. Add a `Music` app surface that reads/writes the playback store.
5. Add `MiniPlayer` as a shell-level floating component near the taskbar.
6. Update Archive/FileExplorer file open routing so `audio` launches Music rather than generic FileViewer.
7. Add dedicated PDF Reader app or split PDF behavior out of FileViewer.
8. Keep FileViewer as fallback.
9. Update app registry/window routing for the new media apps.
10. Smoke test with:
    - MP3
    - WAV or OGG
    - PDF
    - MP4
    - image
    - unsupported document

## Acceptance Criteria

- Audio files open the Music app.
- Playback continues if the Music app is minimized or closed.
- Mini player appears while audio is playing or paused.
- Mini player disappears when audio is stopped.
- Mini player is separate from the taskbar and does not change taskbar geometry.
- Clicking the mini player opens/focuses Music.
- PDF opens in a dedicated PDF reader surface or clearly separated PDF app path.
- Video and image handling look intentional, not generic debug surfaces.
- Generic FileViewer remains available as fallback.
- No new raw hex or raw alpha styling is introduced for new app chrome.
