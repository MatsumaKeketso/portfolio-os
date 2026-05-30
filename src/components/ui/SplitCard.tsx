import { ReactNode, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * SplitCard — the "floating island" card pattern.
 *
 * Two stacked, independent surfaces with a visible gap between them:
 *
 *   ┌──────────────┐    ← hero panel (always visible)
 *   │   [media]    │      rounded-2xl, soft 3D shadow
 *   │  title  CTA  │
 *   └──────────────┘
 *                        ← gap acts as the separator (no chevron)
 *   ┌──────────────┐    ← detail panel (only when expanded)
 *   │ Label        │      vertical stat list — label above value,
 *   │ Value        │      one row per stat
 *   │ ───────────  │
 *   │ Label        │
 *   │ Value        │
 *   │ Description  │
 *   └──────────────┘
 *
 * Behavior:
 * - Click anywhere on the card → selects it (parent decides what selection
 *   means; typically: select + expand).
 * - Click another card or the background → collapses.
 * - There is no chevron toggle; collapsing is driven by deselection.
 *
 * Layout:
 * - Designed to live inside a CSS-grid container so vertical expansion only
 *   grows the card's column; sibling columns stay frozen.
 *
 * Visual depth:
 * - Layered shadow stack (key + ambient + bottom-bloom) gives a soft 3D
 *   "lifted" feel without backdrop blur.
 *
 * Animation:
 * - Detail panel expand/collapse via Framer Motion height spring tuned to
 *   the taskbar island (stiffness 280, damping 30).
 */

export interface SplitCardStat {
  label: string;
  value: ReactNode;
}

export interface SplitCardProps {
  /** Visual content for the hero (image, 3D icon, etc). */
  media: ReactNode;
  /** Primary label shown over the hero's bottom-left. */
  title: ReactNode;
  /** Optional small line under the title. */
  subtitle?: ReactNode;
  /** Hero CTA — usually an "Open" button. Rendered bottom-right. */
  action?: ReactNode;
  /** Whether the detail panel is open. */
  expanded?: boolean;
  /** Whether the card is currently selected (drives accent border + shadow). */
  selected?: boolean;
  /** Click handler for the hero — typically used for selection. */
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  /** Double-click handler — typically used to open the item. */
  onDoubleClick?: (e: MouseEvent<HTMLDivElement>) => void;
  /** Right-click handler — typically used to open context menus. */
  onContextMenu?: (e: MouseEvent<HTMLDivElement>) => void;
  /** Detail panel: vertical stat list. */
  stats?: SplitCardStat[];
  /** Detail panel: body paragraph(s). */
  description?: ReactNode;
  /** Detail panel: bottom action row. */
  detailActions?: ReactNode;
  /** Extra classes on the outer wrapper. */
  className?: string;
  /** Optional drag handlers (mirrors HTMLDivElement). */
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const SPRING = { type: 'spring' as const, stiffness: 280, damping: 30, mass: 0.7 };

// Layered "3D lift" shadow used on both panels. Reads as ambient base +
// directional mid + soft bottom bloom — gives a card-on-a-plane feel
// without any backdrop blur.
const PANEL_SHADOW = [
  '0_1px_2px_rgba(0,0,0,0.35)',
  '0_8px_18px_-6px_rgba(0,0,0,0.45)',
  '0_22px_44px_-16px_rgba(0,0,0,0.55)',
].join(',');

const PANEL_SHADOW_RAISED = [
  '0_2px_3px_rgba(0,0,0,0.4)',
  '0_14px_28px_-8px_rgba(0,0,0,0.55)',
  '0_34px_60px_-20px_rgba(0,0,0,0.65)',
].join(',');

export function SplitCard({
  media,
  title,
  subtitle,
  action,
  expanded = false,
  selected = false,
  onClick,
  onDoubleClick,
  onContextMenu,
  stats,
  description,
  detailActions,
  className,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: SplitCardProps) {
  const hasDetail = Boolean(stats?.length || description || detailActions);

  return (
    <div
      className={cn('flex flex-col items-stretch w-full', className)}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Hero panel */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        className={cn(
          'group/hero relative aspect-[5/4] w-full overflow-hidden rounded-2xl',
          'bg-os-ink-900 border transition-colors duration-200',
          'cursor-pointer select-none',
          selected
            ? 'border-stroke-brand ring-2 ring-primary-500/30'
            : 'border-os-line-dark hover:border-os-line-dark-hover',
        )}
        style={{ boxShadow: selected ? PANEL_SHADOW_RAISED : PANEL_SHADOW }}
      >
        {/* Top inner highlight — sells the lit-from-above feel */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/[0.04] to-transparent" />

        {/* Media */}
        <div className="absolute inset-0 flex items-center justify-center">
          {media}
        </div>

        {/* Bottom gradient for legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* Bottom row: title + action */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-white truncate leading-tight">
              {title}
            </div>
            {subtitle && (
              <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/60 truncate">
                {subtitle}
              </div>
            )}
          </div>
          {action && (
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              {action}
            </div>
          )}
        </div>
      </motion.div>

      {/* Gap between hero and detail — sells the "two floating islands" feel.
          When collapsed the gap is zero so cards sit tight on their grid row. */}
      {hasDetail && expanded && <div className="h-3" />}

      {/* Detail panel */}
      <AnimatePresence initial={false}>
        {hasDetail && expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -8 }}
              animate={{ y: 0 }}
              exit={{ y: -8 }}
              transition={SPRING}
              className={cn(
                'rounded-2xl border border-os-line-dark bg-os-ink-900',
                'p-4 flex flex-col gap-3 relative',
              )}
              style={{ boxShadow: PANEL_SHADOW }}
            >
              {/* Top inner highlight */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08] rounded-t-2xl" />

              {stats && stats.length > 0 && (
                <ul className="flex flex-col">
                  {stats.map((stat, i) => (
                    <li
                      key={i}
                      className={cn(
                        'flex flex-col gap-0.5 py-2',
                        i < stats.length - 1 && 'border-b border-os-line-dark/60',
                      )}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">
                        {stat.label}
                      </span>
                      <span className="text-sm font-medium text-white truncate">
                        {stat.value}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {description && (
                <div className="text-xs leading-relaxed text-white/65 pt-1">
                  {description}
                </div>
              )}

              {detailActions && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {detailActions}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
