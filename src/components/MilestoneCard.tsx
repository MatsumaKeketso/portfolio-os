import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { UserProfile } from '../store/userStore';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface MilestoneCardProps {
  milestone: UserProfile['milestones'][0];
}

const categoryConfig = {
  achievement: { icon: Icons.Trophy, label: 'Achievement', className: 'text-fg-warning bg-warning-subtle border-stroke-warning/40' },
  project: { icon: Icons.Rocket, label: 'Project', className: 'text-primary-200 bg-primary-500/10 border-primary-500/20' },
  education: { icon: Icons.GraduationCap, label: 'Education', className: 'text-fg-info bg-info-subtle border-stroke-info/40' },
  career: { icon: Icons.Briefcase, label: 'Career', className: 'text-fg-success bg-success-subtle border-stroke-success/40' },
  personal: { icon: Icons.Heart, label: 'Personal', className: 'text-fg-error bg-error-subtle border-stroke-error/40' },
  other: { icon: Icons.Star, label: 'Other', className: 'text-os-text-inverse/60 bg-os-ink-800 border-os-line-dark' },
};

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const config = categoryConfig[milestone.category] ?? categoryConfig.other;
  const CategoryIcon = config.icon;

  const date = new Date(milestone.date);
  const formattedDate = date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <>
      <article className="group overflow-hidden rounded-lg border border-os-line-dark bg-os-ink-900 transition-colors hover:border-os-line-dark-hover">
        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          className="w-full p-3 text-left"
        >
          <div className="mb-3 flex items-start gap-3">
            <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border', config.className)}>
              <CategoryIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-os-text-inverse/35">
                  {formattedDate}
                </span>
                {milestone.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-stroke-warning/40 bg-warning-subtle px-1.5 py-0.5 text-[10px] font-medium text-fg-warning">
                    <Icons.Star className="h-2.5 w-2.5 fill-current" />
                    Featured
                  </span>
                )}
              </div>
              <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-os-text-inverse">
                {milestone.title}
              </h4>
            </div>

            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.16 }}
              className="mt-1 shrink-0 text-os-text-inverse/35"
            >
              <Icons.ChevronDown className="h-4 w-4" />
            </motion.span>
          </div>

          <p className={cn('text-xs leading-5 text-os-text-inverse/55', !isExpanded && 'line-clamp-3')}>
            {milestone.description || 'No description added.'}
          </p>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-3 border-t border-os-line-dark px-3 pb-3 pt-3">
                {milestone.images && milestone.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {milestone.images.slice(0, 4).map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className="group/image relative overflow-hidden rounded-md border border-os-line-dark bg-os-ink-950"
                      >
                        <img src={image} alt={`${milestone.title} ${index + 1}`} className="aspect-video w-full object-cover transition-transform duration-300 group-hover/image:scale-105" />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/image:bg-black/35">
                          <Icons.Maximize2 className="h-4 w-4 text-white opacity-0 transition-opacity group-hover/image:opacity-80" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {milestone.tags && milestone.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {milestone.tags.map((tag) => (
                      <span key={tag} className="rounded border border-os-line-dark bg-os-ink-950 px-2 py-0.5 text-[10px] text-os-text-inverse/45">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {milestone.links && milestone.links.length > 0 && (
                  <div className="space-y-1.5">
                    {milestone.links.map((link) => (
                      <a
                        key={`${link.label}-${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md border border-os-line-dark bg-os-ink-950 px-2.5 py-2 text-xs text-os-text-inverse/55 transition hover:text-os-text-inverse"
                      >
                        <Icons.ExternalLink className="h-3.5 w-3.5 text-primary-300" />
                        <span className="truncate">{link.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </article>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] flex items-center justify-center bg-background-overlay p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.16 }}
              className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-xl border border-os-line-dark bg-background-chrome shadow-os-window"
              onClick={(event) => event.stopPropagation()}
            >
              <img src={selectedImage} alt="Expanded milestone media" className="max-h-[86vh] max-w-full object-contain" />
              <Button
                onClick={() => setSelectedImage(null)}
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 bg-background-chrome/80"
              >
                <Icons.X className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
