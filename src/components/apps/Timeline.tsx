import { useEffect, useMemo, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';
import { useTimelineStore } from '../../store/timelineStore';
import { useObservatoryStore } from '../../store/observatoryStore';
import { useAuthStore } from '../../store/authStore';
import { AppShell, AppToolbar, AppContent } from '../ui/AppShell';
import { Badge } from '../ui/Badge';
import type { BadgeTone } from '../ui/Badge';
import { cn } from '../../lib/utils';
import type { TimelineEntry, TimelineEntryType } from '../../types';

// ---------------------------------------------------------------------------
// Visual mapping for entry types.
//
// Tones use the canonical <Badge> tone vocabulary (see ui/Badge.tsx).
// `brand` is theme-bound; semantic tones (success/warning/info/error) are
// fixed for state meaning. The icon does the visual differentiation.
// ---------------------------------------------------------------------------

type TypeMeta = {
  label: string;
  icon: keyof typeof Icons;
  tone: BadgeTone;
};

const TYPE_META: Record<TimelineEntryType, TypeMeta> = {
  win: { label: 'Win', icon: 'Trophy', tone: 'success' },
  milestone: { label: 'Milestone', icon: 'Flag', tone: 'brand' },
  'system-update': { label: 'System update', icon: 'Cpu', tone: 'brand' },
  'project-update': { label: 'Project update', icon: 'Briefcase', tone: 'brand' },
  idea: { label: 'Idea', icon: 'Lightbulb', tone: 'warning' },
  research: { label: 'Research', icon: 'Microscope', tone: 'brand' },
  observation: { label: 'Observation', icon: 'Eye', tone: 'neutral' },
  read: { label: 'Read', icon: 'BookOpen', tone: 'brand' },
  media: { label: 'Media', icon: 'Image', tone: 'brand' },
  note: { label: 'Note', icon: 'StickyNote', tone: 'neutral' },
};

const TYPE_ORDER: TimelineEntryType[] = [
  'win',
  'milestone',
  'system-update',
  'project-update',
  'idea',
  'research',
  'observation',
  'read',
  'media',
  'note',
];

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatRelative(ts: number): string {
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  const day = Math.floor(diffSec / 86400);
  if (day < 30) return `${day}d ago`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month}mo ago`;
  return `${Math.floor(month / 12)}y ago`;
}

function formatAbsolute(ts: number): string {
  const d = new Date(ts);
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function monthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-');
  return `${MONTH_SHORT[Number(month)]} ${year}`;
}

// ---------------------------------------------------------------------------
// TimelineAxisWave — animated luminous wavy line for the tape axis.
//
// Echoes the motion vocabulary of `WindowHeaderStrip` / `LuminousStripSvg`
// (the strip that runs across every focused window header and the taskbar)
// but is theme-bound: stroke color derives from `--color-primary`, so Forest
// Green produces a green wave, Generative Studio a red one, etc.
//
// Self-contained: builds its own sine wave path with a framer-motion phase
// spring, animates indefinitely at ~60fps, degrades to a flat line under
// `prefers-reduced-motion`.
// ---------------------------------------------------------------------------

const WAVE_SAMPLES = 80;
const WAVE_CYCLES = 5;
const WAVE_AMPLITUDE = 1.4;

function buildSineWavePath(phase: number): string {
  let path = '';
  for (let i = 0; i <= WAVE_SAMPLES; i++) {
    const x = (i / WAVE_SAMPLES) * 100;
    const t = (i / WAVE_SAMPLES) * Math.PI * 2 * WAVE_CYCLES + phase;
    const y = 5 + Math.sin(t) * WAVE_AMPLITUDE;
    path += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)} `;
  }
  return path.trim();
}

/**
 * Pure wave — no positioning. The caller positions it as an absolute
 * overlay anchored to the exact dot-line band inside the entries row.
 *
 * The SVG fills its parent (preserveAspectRatio="none"); the sine wave's
 * y-center is at viewBox y=5/10, so the wave midline sits at 50% of the
 * parent box. Pair with a parent that straddles the dot line and the wave
 * threads through the dots. Keep the parent short (~32px) — making it
 * taller magnifies the amplitude proportionally.
 */
function TimelineAxisWave({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const shouldReduceMotion = useReducedMotion();
  const rawPhase = useMotionValue(0);
  const phase = useSpring(rawPhase, { stiffness: 32, damping: 18 });

  useEffect(() => {
    if (shouldReduceMotion) return;
    let raf = 0;
    let lastTs = performance.now();
    let phaseValue = 0;
    const tick = (ts: number) => {
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      // Phase advances ~1.2 rad/s — slow enough to feel ambient, not busy.
      phaseValue += dt * 1.2;
      if (phaseValue > Math.PI * 2000) phaseValue -= Math.PI * 2000;
      rawPhase.set(phaseValue);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rawPhase, shouldReduceMotion]);

  const wavePath = useTransform(phase, buildSineWavePath);

  if (shouldReduceMotion) {
    // Static fallback — single hairline at parent's vertical center.
    return (
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-x-0 top-1/2 -translate-y-px h-px bg-white/10', className)}
        style={style}
      />
    );
  }

  return (
    <svg
      aria-hidden
      // `w-full` is critical — without it the SVG falls back to its intrinsic
      // 300×150 default and the wave only covers the first ~300px of the
      // tape regardless of `left-0 right-0`. Browsers don't propagate
      // left/right anchoring to SVG width the way they do for divs.
      className={cn('pointer-events-none absolute w-full overflow-visible', className)}
      style={style}
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Stroke gradient — solid theme tint across nearly the full width,
            short fade-in at the left, longer fade-out at the right that
            lives between the last tape entry and the NowMarker. The wave
            reads as a continuous line through every entry, dying only into
            the "Now" zone instead of giving up after entry 2. */}
        <linearGradient id="timeline-wave-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(var(--color-primary), 0.10)" />
          <stop offset="4%" stopColor="rgba(var(--color-primary), 0.55)" />
          <stop offset="82%" stopColor="rgba(var(--color-primary), 0.58)" />
          <stop offset="100%" stopColor="rgba(var(--color-primary), 0)" />
        </linearGradient>
        {/* Soft halo so the line glows on dark chrome. */}
        <filter id="timeline-wave-glow" x="-2%" y="-200%" width="104%" height="500%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>
      {/* Glow layer — same gradient + path, blurred. Sharing the gradient
          means the glow fades at the right edge in lockstep with the crisp
          stroke, instead of leaving a solid halo hanging after the line
          itself has faded out. */}
      <motion.path
        d={wavePath}
        stroke="url(#timeline-wave-stroke)"
        strokeWidth={1.4}
        fill="none"
        filter="url(#timeline-wave-glow)"
        strokeLinecap="round"
      />
      {/* Crisp top line */}
      <motion.path
        d={wavePath}
        stroke="url(#timeline-wave-stroke)"
        strokeWidth={0.5}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Filter type
// ---------------------------------------------------------------------------

type TypeFilter = 'all' | TimelineEntryType;

// ---------------------------------------------------------------------------
// TypeChip (small Badge with type icon + label)
// ---------------------------------------------------------------------------

function TypeChip({ type }: { type: TimelineEntryType }) {
  const meta = TYPE_META[type];
  const Icon = Icons[meta.icon] as React.ComponentType<{ className?: string }>;
  return (
    <Badge tone={meta.tone} leading={Icon ? <Icon className="w-full h-full" /> : undefined}>
      {meta.label}
    </Badge>
  );
}

function VisibilityBadge({ visibility }: { visibility: TimelineEntry['visibility'] }) {
  if (visibility === 'public') return null;
  if (visibility === 'private') {
    return (
      <Badge tone="warning" leading={<Icons.Lock className="w-full h-full" />}>
        Private
      </Badge>
    );
  }
  return (
    <Badge tone="error" leading={<Icons.Shield className="w-full h-full" />}>
      Admin
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Hero panel — the journal-style "now reading" surface above the tape.
// ---------------------------------------------------------------------------

function HeroPanel({
  entry,
  relatedTopicTitles,
}: {
  entry: TimelineEntry;
  relatedTopicTitles: string[];
}) {
  const meta = TYPE_META[entry.type];
  const Icon = Icons[meta.icon] as React.ComponentType<{ className?: string }>;
  const firstMedia = entry.media?.[0];

  return (
    <motion.article
      key={entry.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', stiffness: 240, damping: 28 }}
      className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6 h-full"
    >
      {/* Body */}
      <div className="flex flex-col gap-4 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeChip type={entry.type} />
          <VisibilityBadge visibility={entry.visibility} />
          {entry.featured && (
            <Badge tone="brand" leading={<Icons.Sparkles className="w-full h-full" />}>
              Featured
            </Badge>
          )}
          {entry.status && entry.status !== 'published' && (
            <Badge tone="neutral">{entry.status}</Badge>
          )}
          <span className="ml-auto text-[11px] text-white/40 font-medium tracking-wide">
            {entry.dateLabel ?? formatAbsolute(entry.createdAt)}
            <span className="text-white/25"> · {formatRelative(entry.createdAt)}</span>
          </span>
        </div>

        <h2 className="text-[22px] md:text-[26px] font-semibold leading-tight text-white tracking-tight">
          {entry.title}
        </h2>

        {entry.description && (
          <p className="text-[14px] leading-relaxed text-white/70 max-w-prose">
            {entry.description}
          </p>
        )}

        {entry.metrics && entry.metrics.length > 0 && (
          <ul className="flex flex-wrap gap-4 pt-1">
            {entry.metrics.map((m, i) => (
              <li key={i} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35">
                  {m.label}
                </span>
                <span className="text-[13px] font-medium text-white/90">{m.value}</span>
              </li>
            ))}
          </ul>
        )}

        {(entry.tags.length > 0 || relatedTopicTitles.length > 0) && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 mt-auto">
            {relatedTopicTitles.map((topic) => (
              <Badge
                key={topic}
                tone="brand"
                leading={<Icons.Telescope className="w-full h-full" />}
                uppercase={false}
              >
                {topic}
              </Badge>
            ))}
            {entry.tags.map((tag) => (
              <Badge key={tag} tone="neutral" uppercase={false}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Media / icon column */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-black/40 overflow-hidden min-h-[180px] flex items-center justify-center">
        {firstMedia ? (
          firstMedia.type === 'image' ? (
            <img
              src={firstMedia.thumbnailUrl ?? firstMedia.url}
              alt={firstMedia.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40">
              <Icons.PlayCircle className="w-12 h-12" />
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-white/30">
            {Icon && <Icon className="w-12 h-12" />}
            <span className="text-[10px] uppercase tracking-[0.2em]">{meta.label}</span>
          </div>
        )}
        {/* Top-edge sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
      </div>
    </motion.article>
  );
}

// ---------------------------------------------------------------------------
// CountdownRing — draining ring drawn around the selected dot to visualize
// the auto-cycle timer. The `progress` motion value (0→1) is mapped to the
// stroke-dashoffset so the ring shrinks as time runs out. Pure SVG + motion
// value subscription means it animates without triggering React re-renders.
// ---------------------------------------------------------------------------

function CountdownRing({
  progress,
  size,
  strokeWidth = 1.4,
}: {
  progress: MotionValue<number>;
  size: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  // Drain: progress 0 → offset 0 (full ring visible). Progress 1 → offset
  // = circumference (ring fully consumed).
  const dashOffset = useTransform(progress, [0, 1], [0, circumference]);

  return (
    <svg
      aria-hidden
      className="absolute pointer-events-none"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      {/* Track — faint full ring under the progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="rgba(var(--color-primary), 0.18)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress arc — drains clockwise from 12 o'clock */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="rgba(var(--color-primary), 0.95)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={circumference}
        style={{ strokeDashoffset: dashOffset }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Tape entry — a tick on the horizontal axis.
//
// Layout: a vertical column. The card (caption) sits above or below the
// central line based on `placement`. A small connector line links the card
// to the dot on the line.
// ---------------------------------------------------------------------------

function TapeEntry({
  entry,
  isSelected,
  placement,
  onSelect,
  cycleProgress,
  showCountdown,
}: {
  entry: TimelineEntry;
  isSelected: boolean;
  placement: 'above' | 'below';
  onSelect: () => void;
  /** Shared cycle-timer progress motion value. */
  cycleProgress: MotionValue<number>;
  /** Whether the auto-cycle is currently active (not paused / not disabled). */
  showCountdown: boolean;
}) {
  const meta = TYPE_META[entry.type];
  const Icon = Icons[meta.icon] as React.ComponentType<{ className?: string }>;
  const above = placement === 'above';
  const isFeatured = Boolean(entry.featured);

  return (
    <div
      className={cn(
        // Each tape entry occupies a column. Featured items get more
        // horizontal real estate; standard items stay narrow so a busy
        // month still fits in the viewport.
        'relative flex flex-col items-stretch shrink-0 snap-start',
        isFeatured ? 'w-[220px]' : 'w-[140px]',
      )}
    >
      {/* Top zone — always 110px above the axis. Card lives here when
          placement is "above"; otherwise it stays empty as breathing room
          so the axis row keeps its constant Y=110 anchor. Earlier versions
          used `order` to flip zones for below-placed entries, which moved
          the axis to the top of the column and broke the dot/wave
          alignment on every other card — don't reintroduce that. */}
      <div className="flex pb-3 items-end h-[110px]">
        {above && (
          <CaptionCard entry={entry} isSelected={isSelected} isFeatured={isFeatured} onSelect={onSelect} Icon={Icon} />
        )}
      </div>

      {/* Axis row — connector + dot */}
      <div className="relative h-8 flex items-center justify-center">
        {/* Connector line */}
        <motion.div
          animate={{ opacity: isSelected ? 1 : 0.4, height: isSelected ? 14 : 12 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className={cn(
            'absolute left-1/2 -translate-x-1/2 w-px',
            above ? 'bottom-1/2' : 'top-1/2',
            isSelected ? 'bg-fg-brand/80' : 'bg-white/15',
          )}
        />
        {/* Dot on the line — selected dot pulses a halo to echo the
            window-header sheen. Halo radius and opacity loop slowly so it
            reads as ambient, not nagging. */}
        <motion.button
          type="button"
          onClick={onSelect}
          aria-label={`Select ${entry.title}`}
          animate={
            isSelected
              ? {
                  boxShadow: [
                    '0 0 0 3px rgba(var(--color-primary), 0.18)',
                    '0 0 0 10px rgba(var(--color-primary), 0.00)',
                    '0 0 0 3px rgba(var(--color-primary), 0.18)',
                  ],
                  scale: 1.1,
                }
              : { boxShadow: '0 0 0 0 rgba(var(--color-primary), 0)', scale: 1 }
          }
          transition={
            isSelected
              ? { boxShadow: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }, scale: { type: 'spring', stiffness: 320, damping: 22 } }
              : { type: 'spring', stiffness: 320, damping: 22 }
          }
          whileHover={!isSelected ? { scale: 1.15 } : undefined}
          className={cn(
            'relative z-10 rounded-full transition-colors',
            isFeatured ? 'w-4 h-4' : 'w-3 h-3',
            isSelected ? 'bg-fg-brand' : 'bg-white/60 hover:bg-white',
          )}
        />
        {/* Auto-cycle countdown ring — wraps the selected dot to visualize
            how long until the hero advances. Hidden when the cycle is
            paused (hover) or disabled (single entry / reduced motion). */}
        {isSelected && showCountdown && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
            <CountdownRing
              progress={cycleProgress}
              size={isFeatured ? 24 : 20}
              strokeWidth={1.4}
            />
          </div>
        )}
      </div>

      {/* Bottom zone — always 110px below the axis. Card lives here when
          placement is "below"; otherwise empty breathing room. Same rule as
          the top zone: never reorder, never collapse, geometry stays
          constant so the wave threads through every dot at the same Y. */}
      <div className="flex pt-3 items-start h-[110px]">
        {!above && (
          <CaptionCard entry={entry} isSelected={isSelected} isFeatured={isFeatured} onSelect={onSelect} Icon={Icon} />
        )}
      </div>
    </div>
  );
}

function CaptionCard({
  entry,
  isSelected,
  isFeatured,
  onSelect,
  Icon,
}: {
  entry: TimelineEntry;
  isSelected: boolean;
  isFeatured: boolean;
  onSelect: () => void;
  Icon?: React.ComponentType<{ className?: string }>;
}) {
  const meta = TYPE_META[entry.type];
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      // Selection morphs the corners (12 → 16 radius) and lifts the card.
      // Echoes the "floating island" radius vocabulary used by the taskbar
      // and the window notch — chrome elements get rounder when promoted.
      animate={{
        borderRadius: isSelected ? 16 : 12,
        y: isSelected ? -2 : 0,
        scale: isSelected ? 1.02 : 1,
      }}
      whileHover={!isSelected ? { y: -1, scale: 1.015 } : undefined}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={cn(
        'group/cap text-left w-full px-3 py-2',
        'border bg-white/[0.06]',
        isSelected
          ? 'border-stroke-brand shadow-[0_10px_28px_-12px_rgba(var(--color-primary),_0.4),_0_8px_22px_-12px_rgba(0,0,0,0.5)]'
          : 'border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.08]',
        isFeatured && 'min-h-[88px]',
      )}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && (
          <span
            className={cn(
              'inline-flex items-center justify-center w-4 h-4 rounded',
              meta.tone === 'brand'
                ? 'text-fg-brand'
                : meta.tone === 'success'
                  ? 'text-fg-success'
                  : meta.tone === 'warning'
                    ? 'text-fg-warning'
                    : meta.tone === 'error'
                      ? 'text-fg-error'
                      : meta.tone === 'info'
                        ? 'text-fg-info'
                        : 'text-white/55',
            )}
          >
            <Icon className="w-3.5 h-3.5" />
          </span>
        )}
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40 truncate">
          {meta.label}
        </span>
        {isFeatured && (
          <motion.span
            className="inline-flex ml-auto shrink-0"
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.12, 1],
              rotate: [0, 8, 0],
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icons.Sparkles className="w-3 h-3 text-fg-brand" />
          </motion.span>
        )}
      </div>
      <div
        className={cn(
          'text-[12px] font-medium text-white/85 leading-snug',
          isFeatured ? 'line-clamp-3' : 'line-clamp-2',
        )}
      >
        {entry.title}
      </div>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Timeline app
// ---------------------------------------------------------------------------

// How long each entry holds the hero before the auto-cycle advances.
const CYCLE_DURATION_MS = 6000;

export function Timeline() {
  const { entries, isLoading } = useTimelineStore();
  const { topics } = useObservatoryStore();
  const { isAdmin } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-cycle: when the user is idle (not hovering the hero or the tape),
  // the hero advances through visible entries on a CYCLE_DURATION_MS loop,
  // wrapping back to the first entry after the last. The countdown is
  // visualized as a draining ring around the selected dot.
  //
  // Pause rules:
  //   - hovering any part of the content zone pauses the timer
  //   - manual click on a tape entry resets progress to 0 (new lease)
  //   - prefers-reduced-motion disables the cycle entirely
  const cycleProgress = useMotionValue(0);
  const [isPaused, setIsPaused] = useState(false);

  const tapeRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false);
  const hasAutoSelected = useRef(false);

  // Topic lookup — entry references topic IDs, hero/cards need titles.
  const topicTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const topic of topics) map.set(topic.id, topic.title);
    return map;
  }, [topics]);

  // Filter counts for the toolbar pills
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: entries.length };
    for (const e of entries) counts[e.type] = (counts[e.type] ?? 0) + 1;
    return counts;
  }, [entries]);

  // Sort ascending (oldest → newest) for tape rendering — newest is on the
  // right, which is where we auto-scroll to.
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => a.createdAt - b.createdAt);
  }, [entries]);

  // Apply user filters on top of the sorted list
  const visibleEntries = useMemo(() => {
    let list = sortedEntries;
    if (typeFilter !== 'all') list = list.filter((e) => e.type === typeFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [sortedEntries, typeFilter, search]);

  // Walk the visible entries and group them into runs that share a month —
  // the run width drives the month label's horizontal span on the axis.
  const monthRuns = useMemo(() => {
    const runs: Array<{ key: string; label: string; count: number }> = [];
    for (const entry of visibleEntries) {
      const key = monthKey(entry.createdAt);
      const last = runs[runs.length - 1];
      if (last && last.key === key) {
        last.count += 1;
      } else {
        runs.push({ key, label: monthLabel(key), count: 1 });
      }
    }
    return runs;
  }, [visibleEntries]);

  // Pick the default hero: first featured we can find, otherwise newest.
  useEffect(() => {
    if (hasAutoSelected.current) return;
    if (visibleEntries.length === 0) return;
    const featured = [...visibleEntries].reverse().find((e) => e.featured);
    const fallback = visibleEntries[visibleEntries.length - 1];
    setSelectedId((featured ?? fallback)?.id ?? null);
    hasAutoSelected.current = true;
  }, [visibleEntries]);

  // Reset auto-select latch when filters change so the next render picks
  // a fresh hero from the new visible set.
  useEffect(() => {
    hasAutoSelected.current = false;
  }, [typeFilter, search]);

  // Auto-scroll the tape to the right end (newest) on first mount.
  useEffect(() => {
    if (hasAutoScrolled.current) return;
    if (!tapeRef.current) return;
    if (visibleEntries.length === 0) return;
    requestAnimationFrame(() => {
      if (!tapeRef.current) return;
      tapeRef.current.scrollLeft = tapeRef.current.scrollWidth;
      hasAutoScrolled.current = true;
    });
  }, [visibleEntries]);

  // Translate vertical wheel deltas to horizontal scroll for trackpad/mouse
  // users — touch swipe already works natively on the overflow-x-auto track.
  useEffect(() => {
    const el = tapeRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Reset cycle progress whenever the selection changes — manual click or
  // auto-advance both get a fresh CYCLE_DURATION_MS lease on the hero.
  useEffect(() => {
    cycleProgress.set(0);
  }, [selectedId, cycleProgress]);

  // Auto-cycle rAF loop. Increments the cycle progress motion value (no
  // React re-renders) and bumps `selectedId` when the loop completes one
  // turn. Pauses on hover, disabled under prefers-reduced-motion or when
  // there's only one entry to look at.
  useEffect(() => {
    if (isPaused) return;
    if (shouldReduceMotion) return;
    if (visibleEntries.length <= 1) return;

    let raf = 0;
    let lastTs = performance.now();
    const tick = (ts: number) => {
      const dt = ts - lastTs;
      lastTs = ts;
      const next = cycleProgress.get() + dt / CYCLE_DURATION_MS;
      if (next >= 1) {
        // Advance to next entry. Loop back to first after the last.
        const currentIdx = visibleEntries.findIndex(
          (e) => e.id === selectedId,
        );
        const nextIdx =
          currentIdx === -1 || currentIdx === visibleEntries.length - 1
            ? 0
            : currentIdx + 1;
        setSelectedId(visibleEntries[nextIdx].id);
        // The selection-reset effect above will zero the progress when
        // selectedId changes; setting it here too avoids a one-frame
        // overshoot before the effect runs.
        cycleProgress.set(0);
      } else {
        cycleProgress.set(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPaused, shouldReduceMotion, visibleEntries, selectedId, cycleProgress]);

  const selectedEntry =
    visibleEntries.find((e) => e.id === selectedId) ?? visibleEntries[visibleEntries.length - 1];

  const selectedTopicTitles = useMemo(() => {
    if (!selectedEntry?.topicIds) return [];
    return selectedEntry.topicIds
      .map((id) => topicTitleById.get(id))
      .filter((t): t is string => Boolean(t));
  }, [selectedEntry, topicTitleById]);

  const hasEntries = entries.length > 0;

  return (
    <AppShell>
      <AppToolbar>
        <Icons.History className="w-4 h-4 text-white/50 shrink-0" />
        <span className="text-sm font-semibold text-white/85">Timeline</span>
        <span className="text-[11px] text-white/35 ml-1">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>

        {/* Filter pills — horizontal scroll on narrow viewports */}
        <div className="flex items-center gap-1 ml-3 overflow-x-auto no-scrollbar">
          <FilterPill
            label="All"
            count={typeCounts.all ?? 0}
            selected={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
          />
          {TYPE_ORDER.map((t) => {
            const count = typeCounts[t] ?? 0;
            if (count === 0) return null;
            return (
              <FilterPill
                key={t}
                label={TYPE_META[t].label}
                count={count}
                selected={typeFilter === t}
                onClick={() => setTypeFilter(t)}
              />
            );
          })}
        </div>

        <div className="flex-1" />

        <div className="relative w-48 max-w-full shrink-0">
          <Icons.Search className="w-3.5 h-3.5 text-white/30 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full bg-white/[0.06] border border-os-line-dark focus:border-stroke-brand text-white/85 text-xs rounded pl-7 pr-2 py-1.5 focus:outline-none placeholder:text-white/30"
          />
        </div>
        {isAdmin && (
          <Badge tone="brand" leading={<Icons.Shield className="w-full h-full" />} className="ml-1">
            Admin view
          </Badge>
        )}
      </AppToolbar>

      <AppContent
        className="flex flex-col overflow-hidden"
        // Pause-on-hover: any pointer activity inside the hero or tape
        // freezes the auto-cycle timer. Leave the content zone and the
        // timer resumes from where it stopped.
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Icons.Loader2 className="w-5 h-5 text-white/40 animate-spin" />
          </div>
        ) : !hasEntries ? (
          <EmptyState isAdmin={isAdmin} />
        ) : visibleEntries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-white/40 gap-2 p-8">
            <Icons.SearchX className="w-12 h-12 opacity-30" />
            <p className="text-sm">No entries match this filter.</p>
          </div>
        ) : (
          <>
            {/* Hero zone — the journal panel for the selected entry */}
            <section className="px-6 pt-6 pb-4 border-b border-os-line-dark">
              <AnimatePresence mode="wait">
                {selectedEntry && (
                  <HeroPanel
                    key={selectedEntry.id}
                    entry={selectedEntry}
                    relatedTopicTitles={selectedTopicTitles}
                  />
                )}
              </AnimatePresence>
            </section>

            {/* Tape zone — horizontal time tape */}
            <section className="flex-1 relative overflow-hidden">
              <div
                ref={tapeRef}
                className="absolute inset-0 overflow-x-auto overflow-y-hidden snap-x snap-mandatory"
                style={{ scrollbarWidth: 'thin' }}
              >
                <div className="relative min-w-full px-8 py-6 flex flex-col">
                  {/* Entries row — each entry is a column that puts its card
                      above or below the central axis line. The row is the
                      anchor for the wave: top zone 110px + axis 32px + bottom
                      zone 110px = 252px. The dot line sits at y=126 (center
                      of the axis row). The wave overlay below positions
                      itself to span that line so it threads through every
                      dot, not through the cards. */}
                  <div className="relative flex items-stretch gap-2">
                    {/* Wave overlay — anchored to the dot-line band inside
                        this entries row. Top zone is 110px tall, axis row
                        is 32px tall (h-8 in TapeEntry), so the dot midline
                        sits at y=126. The wave element spans that 32px band
                        (top:110, height:32). Its SVG viewBox centers the
                        wave at y=5/10, putting the wave midline at exactly
                        y=126 — threading through every dot. */}
                    <TimelineAxisWave
                      className="left-0 right-0 z-0"
                      style={{ top: '110px', height: '32px' }}
                    />

                    {visibleEntries.map((entry, i) => (
                      <TapeEntry
                        key={entry.id}
                        entry={entry}
                        isSelected={selectedEntry?.id === entry.id}
                        placement={i % 2 === 0 ? 'above' : 'below'}
                        onSelect={() => setSelectedId(entry.id)}
                        cycleProgress={cycleProgress}
                        showCountdown={
                          !isPaused && !shouldReduceMotion && visibleEntries.length > 1
                        }
                      />
                    ))}
                    {/* "Now" marker — anchors the right end of the tape so
                        visitors who scroll to the newest entry land on a
                        clear "you've arrived at now" cue. Pulses subtly. */}
                    <NowMarker />
                  </div>

                  {/* Month markers — one label per contiguous run, sized to
                      span its run's entry count. Sits below the entries row. */}
                  <div className="flex items-stretch gap-2 mt-2 px-0">
                    {monthRuns.map((run, i) => {
                      // Each run spans `count` entry slots. Compute its width
                      // by summing slot widths (featured ones are wider, so
                      // approximate using count * average — the visual gist
                      // is "longer label = busier month").
                      return (
                        <div
                          key={`${run.key}-${i}`}
                          className="flex flex-col items-start shrink-0"
                          style={{ width: `${run.count * 150}px` }}
                        >
                          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                            {run.label}
                          </span>
                          <span className="text-[9px] text-white/25">
                            {run.count} {run.count === 1 ? 'entry' : 'entries'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </AppContent>
    </AppShell>
  );
}

// ---------------------------------------------------------------------------
// Toolbar filter pill
// ---------------------------------------------------------------------------

function FilterPill({
  label,
  count,
  selected,
  onClick,
}: {
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors',
        'border',
        selected
          ? 'bg-brand-subtle border-stroke-brand text-fg-brand'
          : 'bg-white/[0.04] border-os-line-dark text-white/65 hover:bg-white/[0.08] hover:text-white',
      )}
    >
      {label}
      <span
        className={cn(
          'text-[10px] tabular-nums',
          selected ? 'text-fg-brand/70' : 'text-white/35',
        )}
      >
        {count}
      </span>
    </button>
  );
}

// "Now" marker — small pill sitting on the right end of the tape with a
// subtle living dot. Mirrors the OS's "you are here" pattern from the
// taskbar's focused-app pill.
function NowMarker() {
  return (
    <div className="relative flex flex-col items-center shrink-0 w-[88px]">
      <div className="flex h-[110px] items-end pb-3" />
      <div className="relative h-8 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-3 h-3 rounded-full bg-fg-brand"
          style={{
            boxShadow:
              '0 0 0 4px rgba(var(--color-primary), 0.18), 0 0 12px rgba(var(--color-primary), 0.55)',
          }}
        />
      </div>
      <div className="flex h-[110px] items-start pt-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-subtle border border-stroke-brand text-fg-brand text-[10px] font-semibold uppercase tracking-[0.1em]">
          <motion.span
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block w-1.5 h-1.5 rounded-full bg-fg-brand"
          />
          Now
        </div>
      </div>
    </div>
  );
}

function EmptyState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center text-white/40 gap-2 p-8">
      <Icons.History className="w-12 h-12 opacity-30" />
      <p className="text-sm">Nothing on the timeline yet.</p>
      <p className="text-xs text-white/30">
        {isAdmin
          ? 'Use the admin panel or capture form to add an entry.'
          : 'Check back soon.'}
      </p>
    </div>
  );
}
