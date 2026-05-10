import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { MilestoneCard } from './MilestoneCard';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface TimelineProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const fullMonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const PLATFORM_START_YEAR = 2026;

export function Timeline({ isExpanded = false, onToggleExpand }: TimelineProps) {
  const { profile } = useUserStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const availableYears = useMemo(() => {
    const milestoneYears = profile.milestones
      .map((milestone) => new Date(milestone.date).getFullYear())
      .filter((year) => Number.isFinite(year));
    const firstYear = Math.min(PLATFORM_START_YEAR, currentYear, ...milestoneYears);
    const lastYear = Math.max(currentYear, ...milestoneYears);

    return Array.from({ length: lastYear - firstYear + 1 }, (_, index) => lastYear - index);
  }, [profile.milestones, currentYear]);

  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const yearMilestones = useMemo(
    () =>
      profile.milestones
        .filter((milestone) => new Date(milestone.date).getFullYear() === selectedYear)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [profile.milestones, selectedYear],
  );

  const monthlyMilestones = useMemo(() => {
    return monthNames.map((_, monthIndex) =>
      yearMilestones.filter((milestone) => new Date(milestone.date).getMonth() === monthIndex),
    );
  }, [yearMilestones]);

  const featuredCount = yearMilestones.filter((milestone) => milestone.featured).length;

  useEffect(() => {
    if (!scrollRef.current || selectedYear !== currentYear) return;
    const monthElement = scrollRef.current.querySelector(`[data-month="${currentMonth}"]`);
    monthElement?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedYear, currentYear, currentMonth]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) === 0 && Math.abs(event.deltaX) === 0) return;

      event.preventDefault();
      element.scrollLeft += event.deltaY || event.deltaX;
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, []);

  if (profile.milestones.length === 0) {
    return (
      <div className="h-full rounded-2xl border border-os-line-dark bg-background-chrome p-5 text-os-text-inverse">
        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-os-line-dark bg-os-ink-950/70">
          <div className="text-center">
            <Icons.CalendarDays className="mx-auto mb-3 h-8 w-8 text-os-text-inverse/25" />
            <p className="text-sm font-medium text-os-text-inverse/65">No milestones yet</p>
            <p className="mt-1 text-xs text-os-text-inverse/30">Add milestones from Admin Panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-os-line-dark bg-background-chrome text-os-text-inverse shadow-os-window">
      <header className="shrink-0 border-b border-os-line-dark bg-os-ink-950">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-os-line-dark bg-os-ink-900">
                <Icons.CalendarDays className="h-4 w-4 text-primary-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-normal text-os-text-inverse">Milestones</h3>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-os-text-inverse/45">
                  <span>{yearMilestones.length} entries</span>
                  <span className="h-1 w-1 rounded-full bg-os-text-inverse/20" />
                  <span>{featuredCount} featured</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <div className="flex min-w-0 flex-wrap justify-end gap-1.5">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                    selectedYear === year
                      ? 'border-stroke-brand bg-primary-500/20 text-os-text-inverse shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]'
                      : 'border-os-line-dark bg-os-ink-900 text-os-text-inverse/50 hover:border-os-line-dark-hover hover:bg-os-ink-800 hover:text-os-text-inverse/80',
                  )}
                >
                  {year}
                </button>
              ))}
            </div>

            {onToggleExpand && (
              <Button
                onClick={onToggleExpand}
                variant="ghost"
                size="icon"
                title={isExpanded ? 'Collapse timeline' : 'Expand timeline'}
              >
                {isExpanded ? <Icons.Minimize2 className="h-4 w-4" /> : <Icons.Maximize2 className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden bg-os-ink-950/80">
        <div className="flex h-full min-w-max gap-4 p-4">
          {monthlyMilestones.map((milestones, index) => {
            const isCurrentMonth = selectedYear === currentYear && index === currentMonth;
            return (
              <article
                key={monthNames[index]}
                data-month={index}
                className={cn(
                  'flex h-full w-[292px] shrink-0 flex-col overflow-hidden rounded-xl border bg-background-chrome',
                  isCurrentMonth ? 'border-primary-500/35' : 'border-os-line-dark',
                )}
              >
                <div className="border-b border-os-line-dark bg-os-ink-900 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-os-text-inverse/30">
                        {fullMonthNames[index]}
                      </p>
                      <h4 className="mt-1 text-lg font-semibold text-os-text-inverse">{monthNames[index]}</h4>
                    </div>
                    <div className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold',
                      isCurrentMonth
                        ? 'border-primary-500/40 bg-primary-500/20 text-os-text-inverse'
                        : 'border-os-line-dark bg-os-ink-950 text-os-text-inverse/55',
                    )}>
                      {milestones.length}
                    </div>
                  </div>
                </div>

                <div data-timeline-list="true" className="flex-1 space-y-3 overflow-y-auto p-3">
                  <AnimatePresence initial={false}>
                    {milestones.map((milestone) => (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <MilestoneCard milestone={milestone} />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {milestones.length === 0 && (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-os-line-dark bg-os-ink-950/55 text-center">
                      <div>
                        <Icons.CircleDashed className="mx-auto mb-2 h-5 w-5 text-os-text-inverse/20" />
                        <p className="text-xs text-os-text-inverse/30">No entries</p>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
