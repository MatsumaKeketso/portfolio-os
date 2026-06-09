import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useDesktopStore } from '../store/desktopStore';
import { MilestoneCard } from './MilestoneCard';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { fetchReads } from '../lib/reads';
import { ReadArticle } from '../types';

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

function openReadInBrowser(read: ReadArticle) {
  const store = useDesktopStore.getState();
  const browserApp = store.apps.find(a => a.component === 'Browser');
  if (!browserApp) return;

  const readUrl = `browser://reads/${read.slug}`;

  const existingWindow = store.windows.find(w => w.appId === browserApp.id);
  if (existingWindow) {
    store.updateWindow(existingWindow.id, {
      url: readUrl,
      title: read.title,
      isMinimized: false,
    });
    store.bringToFront(existingWindow.id);
  } else {
    store.openWindow({ ...browserApp, url: readUrl });
  }
}

export function Timeline({ isExpanded = false, onToggleExpand }: TimelineProps) {
  const { profile } = useUserStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [activeSection, setActiveSection] = useState<'milestones' | 'reads'>('milestones');
  const [reads, setReads] = useState<ReadArticle[]>([]);

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

  const activeMonths = useMemo(() => {
    return monthNames
      .map((name, index) => ({
        name,
        fullName: fullMonthNames[index],
        index,
        milestones: yearMilestones.filter(
          (milestone) => new Date(milestone.date).getMonth() === index,
        ),
      }))
      .filter((m) => m.milestones.length > 0);
  }, [yearMilestones]);

  const featuredCount = yearMilestones.filter((milestone) => milestone.featured).length;
  const visibleReads = isExpanded ? reads : reads.slice(0, 8);

  useEffect(() => {
    let isMounted = true;
    fetchReads().then((items) => {
      if (isMounted) setReads(items);
    });
    return () => {
      isMounted = false;
    };
  }, []);

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

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-background-chrome text-os-text-inverse shadow-os-window">
      {/* Header: title + expand */}
      <header className="shrink-0 border-b border-white/[0.08] bg-black/40">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
              {activeSection === 'milestones'
                ? <Icons.CalendarDays className="h-3.5 w-3.5 text-primary-300" />
                : <Icons.BookOpenText className="h-3.5 w-3.5 text-primary-300" />}
            </div>
            <h3 className="text-sm font-semibold tracking-normal text-os-text-inverse">
              {activeSection === 'milestones' ? 'Milestones' : 'Reads'}
            </h3>
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
      </header>

      {/* Toolbar: section tabs, stats, year picker */}
      <div className="shrink-0 border-b border-white/[0.08] bg-black/30 px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.04] p-0.5">
              {[
                { id: 'milestones', label: 'Milestones', icon: Icons.CalendarDays },
                { id: 'reads', label: 'Reads', icon: Icons.BookOpenText },
              ].map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id as 'milestones' | 'reads')}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors',
                      active ? 'bg-white/[0.08] text-os-text-inverse' : 'text-os-text-inverse/42 hover:text-os-text-inverse/75',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-os-text-inverse/45">
              {activeSection === 'milestones' ? (
                <>
                  <span>{yearMilestones.length} entries</span>
                  <span className="h-1 w-1 rounded-full bg-os-text-inverse/20" />
                  <span>{featuredCount} featured</span>
                </>
              ) : (
                <>
                  <span>{reads.length} articles</span>
                  <span className="h-1 w-1 rounded-full bg-os-text-inverse/20" />
                  <span>{isExpanded ? 'All' : `${visibleReads.length} visible`}</span>
                </>
              )}
            </div>
          </div>

          {activeSection === 'milestones' && (
            <div className="flex min-w-0 shrink-0 flex-wrap justify-end gap-1">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={cn(
                    'rounded-lg border px-2 py-0.5 text-[11px] font-medium transition-colors',
                    selectedYear === year
                      ? 'border-stroke-brand bg-primary-500/20 text-os-text-inverse'
                      : 'border-white/[0.08] bg-white/[0.04] text-os-text-inverse/50 hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-os-text-inverse/80',
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeSection === 'milestones' ? (
        <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden bg-black/30">
          <div className="flex h-full min-w-max gap-4 p-4">
            {activeMonths.map(({ name, fullName, index, milestones }) => {
              const isCurrentMonth = selectedYear === currentYear && index === currentMonth;
              return (
                <article
                  key={name}
                  data-month={index}
                  className={cn(
                    'flex h-full w-[292px] shrink-0 flex-col overflow-hidden rounded-xl border bg-background-chrome',
                    isCurrentMonth ? 'border-primary-500/35' : 'border-white/[0.08]',
                  )}
                >
                  <div className="border-b border-white/[0.08] bg-white/[0.04] px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-os-text-inverse/30">
                          {fullName}
                        </p>
                        <h4 className="mt-1 text-lg font-semibold text-os-text-inverse">{name}</h4>
                      </div>
                      <div className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold',
                        isCurrentMonth
                          ? 'border-primary-500/40 bg-primary-500/20 text-os-text-inverse'
                          : 'border-white/[0.08] bg-black/30 text-os-text-inverse/55',
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
                  </div>
                </article>
              );
            })}

            {activeMonths.length === 0 && (
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                  <Icons.CalendarDays className="mx-auto mb-3 h-8 w-8 text-os-text-inverse/20" />
                  <p className="text-sm font-medium text-os-text-inverse/60">No milestones this year</p>
                  <p className="mt-1 text-xs text-os-text-inverse/30">Select a different year or add entries from the Admin Panel.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-black/30 p-4">
          {visibleReads.length > 0 ? (
            isExpanded ? (
              /* Bento grid: varied card sizes for visual interest */
              <div className="grid auto-rows-[minmax(180px,auto)] gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {visibleReads.map((read, index) => {
                  const isLarge = index === 0 || (index % 5 === 0 && read.imageUrl);
                  return (
                    <article
                      key={read.slug}
                      onClick={() => openReadInBrowser(read)}
                      className={cn(
                        'group cursor-pointer overflow-hidden rounded-xl border bg-background-chrome transition-all hover:border-stroke-brand hover:shadow-lg hover:shadow-primary-500/5',
                        isLarge ? 'border-white/[0.10] col-span-1 row-span-2' : 'border-white/[0.08]',
                      )}
                    >
                      {read.imageUrl && (
                        <img
                          src={read.imageUrl}
                          alt={read.imageAlt || read.title}
                          loading="lazy"
                          decoding="async"
                          className={cn(
                            'w-full object-cover opacity-80 transition-opacity group-hover:opacity-95',
                            isLarge ? 'h-48' : 'h-28',
                          )}
                        />
                      )}
                      <div className="p-3">
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {read.categories.slice(0, 3).map((category) => (
                            <span key={category} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[9px] uppercase tracking-[0.08em] text-primary-300">
                              {category}
                            </span>
                          ))}
                        </div>
                        <h4 className={cn('font-semibold leading-5 text-os-text-inverse', isLarge ? 'text-base line-clamp-3' : 'text-sm line-clamp-2')}>{read.title}</h4>
                        <p className={cn('mt-2 text-xs leading-5 text-os-text-inverse/42', isLarge ? 'line-clamp-4' : 'line-clamp-3')}>{read.description}</p>
                        <div className="mt-3 flex items-center justify-between text-[10px] text-os-text-inverse/28">
                          <span>{read.readingTimeMinutes} min read</span>
                          <span>{read.date || 'Undated'}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* Compact auto-fill grid: uses full width in collapsed state */
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                {visibleReads.map((read) => (
                  <article
                    key={read.slug}
                    onClick={() => openReadInBrowser(read)}
                    className="group cursor-pointer overflow-hidden rounded-xl border border-white/[0.08] bg-background-chrome transition-all hover:border-stroke-brand hover:shadow-lg hover:shadow-primary-500/5"
                  >
                    {read.imageUrl && (
                      <img
                        src={read.imageUrl}
                        alt={read.imageAlt || read.title}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[16/10] w-full object-cover opacity-80 transition-opacity group-hover:opacity-95"
                      />
                    )}
                    <div className="p-2.5">
                      <h4 className="line-clamp-2 text-xs font-semibold leading-4 text-os-text-inverse">{read.title}</h4>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-os-text-inverse/28">
                        <span>{read.readingTimeMinutes} min</span>
                        <span className="h-1 w-1 rounded-full bg-os-text-inverse/15" />
                        <span>{read.date || 'Undated'}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-black/30 text-center">
              <div>
                <Icons.BookOpenText className="mx-auto mb-3 h-8 w-8 text-os-text-inverse/20" />
                <p className="text-sm font-medium text-os-text-inverse/60">No reads yet</p>
                <p className="mt-1 text-xs text-os-text-inverse/30">Import reads from the Admin Panel.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
