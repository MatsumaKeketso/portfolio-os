# Lock Screen

## Intent

GenOS starts at a wallpaper-based lock screen after boot. The reference supplies placement, not colors: GenOS typography, semantic tokens, and existing controls remain authoritative. There is no separate screensaver stage or inactivity timer.

## Flow

- Boot completes, then the clock/date screen appears.
- Click the wallpaper, activate Enter GenOS / Unlock, or swipe upward to reveal sign-in. The background blurs and the content fades; reduced-motion preferences remove animation duration.
- Anonymous visitors may continue to the public desktop, sign in as owner, or use the existing guest-account flow. New guest emails retain the existing account-creation behavior.
- Signed-in users must reauthenticate the current Firebase user with their password to resume that session. Continue as guest asks for confirmation, signs out, and only then enters the public desktop; it never bypasses reauthentication into a privileged session.
- Cancel or Escape returns to the clock screen. During authentication, cancellation is disabled.
- Lock is available in the Start menu, desktop context menu, and Ctrl+Shift+L. Sign-out also returns to the lock screen.

## State And Security

`desktopStore.isScreenLocked` is transient and defaults to true. On initial boot, desktop UI is not mounted until entry. Boot completion is reported before paint, so the lock screen replaces boot without an intervening desktop frame. After first entry, desktop windows remain mounted to preserve in-memory work, but their wrapper is visually hidden, inert, and hidden from assistive technology while locked. Focus is contained in the lock surface and restored on return. Desktop shortcuts and upload drops are gated.

This is an interface lock, not a backend security boundary. Firebase remains signed in while locked; Firestore and Storage rules remain responsible for authorization. Reauthentication never invokes guest creation or replaces the current account. Passwords stay in component state and are cleared on transitions and completion.

The selected desktop wallpaper is reused, with the bundled wallpaper as an image-load fallback. Media controls appear only for an active track and use the existing audio engine; playback is not reset by locking.

## Verification

- `npm run test:lock-screen`: four isolated authentication tests cover absent sessions, exact-user reauthentication, invalid credentials, and account changes during requests.
- TypeScript and token lint checks cover the integration.
- Live localhost checks cover anonymous owner/guest forms, visitor entry, Ctrl+Shift+L, Cancel, signed-in password-only UI, and narrow-screen layout.
- Successful live password reauthentication and active-track playback have not been exercised with real credentials/media. No full WCAG conformance claim is made.
