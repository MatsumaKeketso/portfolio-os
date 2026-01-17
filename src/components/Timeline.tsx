import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { MilestoneCard } from './MilestoneCard';
import { Button } from './ui/button';

interface TimelineProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function Timeline({ isExpanded = false, onToggleExpand }: TimelineProps) {
  const { profile } = useUserStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Get all years that have milestones
  const getAvailableYears = () => {
    const years = new Set(
      profile.milestones.map(m => new Date(m.date).getFullYear())
    );
    return Array.from(years).sort((a, b) => b - a);
  };

  const availableYears = getAvailableYears();

  // Get milestones grouped by month for the selected year
  const getMilestonesByMonth = () => {
    const monthlyData: { [key: number]: typeof profile.milestones } = {};

    profile.milestones
      .filter(m => new Date(m.date).getFullYear() === selectedYear)
      .forEach(milestone => {
        const month = new Date(milestone.date).getMonth();
        if (!monthlyData[month]) {
          monthlyData[month] = [];
        }
        monthlyData[month].push(milestone);
      });

    // Sort milestones within each month by date (newest first)
    Object.keys(monthlyData).forEach(month => {
      monthlyData[parseInt(month)].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    return monthlyData;
  };

  const monthlyMilestones = getMilestonesByMonth();
  const monthNames = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];

  // Auto-scroll to current month on mount
  useEffect(() => {
    if (scrollRef.current && selectedYear === new Date().getFullYear()) {
      const currentMonth = new Date().getMonth();
      const monthElement = scrollRef.current.querySelector(`[data-month="${currentMonth}"]`);
      if (monthElement) {
        monthElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
  }, [selectedYear]);

  // Handle horizontal scrolling with mouse wheel
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      // If shift is pressed, let native horizontal scroll happen
      if (e.shiftKey) return;

      // If no vertical scroll, ignore
      if (Math.abs(e.deltaY) === 0) return;

      // Check if we are over a vertically scrollable element (milestone list)
      const target = e.target as HTMLElement;
      // We explicitly check for the class we use for vertical lists
      const verticalList = target.closest('.overflow-y-auto');

      if (verticalList) {
        const { scrollHeight, clientHeight } = verticalList;
        // Add a small buffer to avoid false positives due to subpixel rendering
        const isScrollable = scrollHeight > clientHeight + 1;

        if (isScrollable) {
          // If the interaction is within a scrollable vertical list,
          // we want to preserve native vertical scrolling.
          // We do NOT prevent default here.
          return;
        }
      }

      // If we're here, we want to translate vertical wheel to horizontal scroll
      e.preventDefault();
      element.scrollLeft += e.deltaY;
    };

    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, []);

  if (profile.milestones.length === 0) {
    return (
      <div className="timeline-empty h-full flex items-center justify-center">
        <div className="text-center p-6">
          <Icons.Calendar className="w-12 h-12 text-primary-400/50 mx-auto mb-3" />
          <p className="text-primary-400/70 text-sm">No milestones yet</p>
          <p className="text-gray-500 text-xs mt-1">Add milestones from Admin Panel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline h-full flex flex-col relative">
      {/* Star Citizen-style header with hexagonal accent */}
      <div className="timeline-header relative">
        {/* Glowing top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

        {/* Header content */}
        <div className="relative bg-gradient-to-br from-gray-950/95 to-gray-900/95 backdrop-blur-xl border-b border-primary-500/20 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Title with holographic effect */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 blur-md" />
                <Icons.Calendar className="relative w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="text-primary-400 font-bold text-sm tracking-wider uppercase">
                  Life Timeline
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                  <span className="text-primary-400/60 text-[10px] uppercase tracking-wide">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Year selector with sci-fi styling */}
            <div className="flex items-center gap-2">
              <span className="text-primary-400/60 text-xs uppercase tracking-wide mr-2">
                Year
              </span>
              {availableYears.map(year => (
                <Button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  variant={selectedYear === year ? 'solid-brand-primary' : 'soft-brand-primary'}
                  size="sm"
                >
                  {/* Animated background for active year */}
                  {selectedYear === year && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary-300 to-primary-500"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      style={{ opacity: 0.3 }}
                    />
                  )}
                  <span className="relative">{year}</span>
                </Button>
              ))}

              {/* View Toggle Button */}
              {onToggleExpand && (
                <Button
                  onClick={onToggleExpand}
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  title={isExpanded ? "Collapse View" : "Expand View"}
                >
                  {isExpanded ? (
                    <Icons.Minimize2 className="w-4 h-4" />
                  ) : (
                    <Icons.Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(var(--color-primary)) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(var(--color-primary)) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
        </div>

        {/* Bottom glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
      </div>

      {/* Timeline scroll area with month columns */}
      <div
        ref={scrollRef}
        className="timeline-scroll flex-1 overflow-x-auto overflow-y-hidden relative bg-gradient-to-br from-gray-950/95 to-gray-900/95"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(var(--color-primary), 0.3) transparent'
        }}
      >
        <div className="flex h-full gap-6 p-6 min-w-max">
          {monthNames.map((month, index) => {
            const milestones = monthlyMilestones[index] || [];
            const hasCurrentMonth = selectedYear === new Date().getFullYear() && index === new Date().getMonth();

            return (
              <div
                key={month}
                data-month={index}
                className="timeline-month flex-shrink-0"
                style={{ width: '280px' }}
              >
                {/* Month header with Star Citizen styling */}
                <div className="relative mb-4">
                  {/* Hexagonal header background */}
                  <div
                    className={`relative px-4 py-2 ${hasCurrentMonth
                      ? 'bg-primary-500/10 border border-primary-500/40'
                      : 'bg-gray-900/30 border border-primary-500/20'
                      }`}
                    style={{
                      clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold tracking-wider ${hasCurrentMonth ? 'text-primary-400' : 'text-primary-400/60'
                        }`}>
                        {month}
                      </span>
                      {milestones.length > 0 && (
                        <span className="text-xs text-primary-400/50 font-mono">
                          {milestones.length}
                        </span>
                      )}
                    </div>

                    {/* Current month indicator */}
                    {hasCurrentMonth && (
                      <div className="absolute -right-1 -top-1">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary-500 blur-md animate-pulse" />
                          <div className="relative w-2 h-2 rounded-full bg-primary-500" />
                        </div>
                      </div>
                    )}

                    {/* Corner accent */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary-500/40" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary-500/40" />
                  </div>
                </div>

                {/* Milestones column */}
                <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                  <AnimatePresence>
                    {milestones.map((milestone, idx) => (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <MilestoneCard milestone={milestone} />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Empty state for month */}
                  {milestones.length === 0 && (
                    <div className="text-center py-8 opacity-30">
                      <Icons.CircleDashed className="w-6 h-6 text-primary-400/30 mx-auto mb-2" />
                      <p className="text-primary-400/40 text-xs">No entries</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
