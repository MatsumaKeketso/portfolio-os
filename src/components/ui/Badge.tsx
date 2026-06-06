import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * Badge — canonical chip/tag primitive.
 *
 * One surface treatment for every tone (calm, low-contrast pill). Color
 * arrives only through the leading icon / dot accent, so a wall of badges
 * reads as a family rather than a rainbow.
 *
 * `brand` is theme-bound (follows the active theme preset via
 * `--color-fg-brand`). The semantic tones (`success`, `warning`, `error`,
 * `info`) keep their fixed meaning and are not theme-bound — use them
 * sparingly for actual semantic signals (errors, warnings, success states).
 *
 * Pick the right tone:
 *   - `neutral`  default tag / category chip / generic metadata
 *   - `brand`    "system" tag, follows theme — Timeline type chips,
 *                Observatory topic links, brand-affiliated metadata
 *   - `success`  positive outcome (uploaded, saved, online)
 *   - `warning`  cautionary state (private, draft, pending)
 *   - `error`    failed / restricted state (admin-only, error, offline)
 *   - `info`     informational (system update, sync state)
 *
 * @example
 * <Badge tone="brand" leading={<Icons.Flag />}>Milestone</Badge>
 * <Badge tone="warning" leading={<Icons.Lock />}>Private</Badge>
 * <Badge tone="neutral">design-system</Badge>
 * <Badge tone="success" indicator>Saved</Badge>
 */

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md';

const TONE_ACCENT: Record<BadgeTone, string> = {
  neutral: 'text-white/55',
  brand: 'text-fg-brand',
  success: 'text-fg-success',
  warning: 'text-fg-warning',
  error: 'text-fg-error',
  info: 'text-fg-info',
};

// Dots use the same hue as the icon accent so brand-toned badges in the
// Forest Green theme show a green dot, etc. `--color-fg-*` carries the
// brightness we want (tuned for dark chrome), so we read it via an
// arbitrary-value bg. Confined to this primitive.
const TONE_DOT_BG: Record<BadgeTone, string> = {
  neutral: 'bg-white/40',
  brand: 'bg-[var(--color-fg-brand)]',
  success: 'bg-[var(--color-fg-success)]',
  warning: 'bg-[var(--color-fg-warning)]',
  error: 'bg-[var(--color-fg-error)]',
  info: 'bg-[var(--color-fg-info)]',
};

const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-[11px] gap-1.5',
};

const ICON_SIZE: Record<BadgeSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
};

const DOT_SIZE: Record<BadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual tone. Default `neutral`. */
  tone?: BadgeTone;
  /** Size variant. Default `sm`. */
  size?: BadgeSize;
  /** Leading icon (sized automatically — pass a Lucide icon component). */
  leading?: ReactNode;
  /** Render a small accent dot instead of an icon (mutually exclusive with leading). */
  indicator?: boolean;
  /** Uppercase the label. Default true to match the OS chip language. */
  uppercase?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = 'neutral', size = 'sm', leading, indicator, uppercase = true, className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        // Shared surface — calm, consistent across every tone so badges
        // read as a family. Color only ever lives in the leading accent.
        'inline-flex items-center rounded-full font-semibold tracking-[0.06em]',
        'bg-white/[0.06] border border-white/[0.08] text-white/80',
        'whitespace-nowrap leading-none',
        uppercase && 'uppercase',
        SIZE_STYLES[size],
        className,
      )}
      {...rest}
    >
      {indicator && (
        <span
          className={cn('inline-block rounded-full shrink-0', DOT_SIZE[size], TONE_DOT_BG[tone])}
          aria-hidden
        />
      )}
      {!indicator && leading && (
        <span className={cn('inline-flex shrink-0', ICON_SIZE[size], TONE_ACCENT[tone])} aria-hidden>
          {leading}
        </span>
      )}
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
});

Badge.displayName = 'Badge';
