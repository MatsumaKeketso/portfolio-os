import { ReactNode, MouseEvent } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * SplitCard — the "floating island" card pattern.
 *
 * A fixed-format tile and an independent floating detail surface:
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
 * - Detail is absolutely positioned below the tile; selection never changes
 *   grid row heights. The containing file surface owns scrolling.
 *
 * Animation:
 * - Detail fades without changing tile dimensions; reduced motion removes
 *   translation and transition duration.
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
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={cn('relative flex flex-col items-stretch w-full', expanded && 'z-30', className)}
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
        whileHover={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        className={cn(
          'group/hero relative aspect-square w-full overflow-hidden rounded-lg',
          'bg-background-chrome-raised border transition-colors duration-200',
          'cursor-pointer select-none',
          selected
            ? 'border-stroke-brand'
            : 'border-os-line-dark hover:border-os-line-dark-hover',
        )}
      >

        {/* Media */}
        <div className="absolute inset-x-0 top-0 bottom-16 flex items-center justify-center">
          {media}
        </div>


        {/* Bottom row: title + action */}
        <div className="absolute inset-x-0 bottom-0 flex min-h-16 items-center justify-between gap-2 bg-background-chrome-raised p-3">
          <div className="min-w-0 flex-1">
            <div className="os-type-body-strong text-fg-primary truncate">
              {title}
            </div>
            {subtitle && (
              <div className="mt-0.5 os-type-caption text-fg-secondary truncate">
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

      {/* Detail panel */}
      <AnimatePresence initial={false}>
        {hasDetail && expanded && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: reducedMotion ? 0 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            className="absolute inset-x-0 top-[calc(100%+8px)] max-h-80 overflow-y-auto rounded-lg border border-stroke-secondary bg-background-floating shadow-os-window"
          >
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: 0 }}
              exit={{ y: 0 }}
              transition={SPRING}
              className={cn(
                'text-fg-primary',
                'p-4 flex flex-col gap-3 relative',
              )}
            >

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
                      <span className="os-type-caption text-fg-secondary">
                        {stat.label}
                      </span>
                      <span className="os-type-body-strong text-fg-primary break-words">
                        {stat.value}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {description && (
                <div className="os-type-caption text-fg-secondary break-words pt-1">
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
