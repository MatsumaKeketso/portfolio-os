import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { UserProfile } from '../store/userStore';

interface MilestoneCardProps {
  milestone: UserProfile['milestones'][0];
}

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Category icons and colors
  const categoryConfig = {
    achievement: { icon: Icons.Trophy, color: 'from-yellow-400 to-amber-400', glow: 'yellow-400' },
    project: { icon: Icons.Rocket, color: 'from-cyan-400 to-blue-400', glow: 'cyan-400' },
    education: { icon: Icons.GraduationCap, color: 'from-purple-400 to-pink-400', glow: 'purple-400' },
    career: { icon: Icons.Briefcase, color: 'from-green-400 to-emerald-400', glow: 'green-400' },
    personal: { icon: Icons.Heart, color: 'from-red-400 to-rose-400', glow: 'red-400' },
    other: { icon: Icons.Star, color: 'from-slate-400 to-gray-400', glow: 'slate-400' },
  };

  const config = categoryConfig[milestone.category];
  const CategoryIcon = config.icon;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <motion.div
        className="milestone-card group relative cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Card background with Star Citizen styling */}
        <div
          className="relative bg-gradient-to-br from-slate-900/90 to-slate-950/95 backdrop-blur-xl border border-cyan-400/20 overflow-hidden"
          style={{
            clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
          }}
        >
          {/* Holographic grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, cyan 1px, transparent 1px),
                linear-gradient(to bottom, cyan 1px, transparent 1px)
              `,
              backgroundSize: '10px 10px'
            }}
          />

          {/* Top accent line with category color */}
          <div className={`h-0.5 bg-gradient-to-r ${config.color}`} />

          {/* Card content */}
          <div className="relative p-4">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              {/* Category icon with glow */}
              <div className="relative flex-shrink-0 mt-1">
                <div className={`absolute inset-0 bg-${config.glow}/30 blur-lg`} />
                <div className={`relative w-8 h-8 rounded bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                  <CategoryIcon className="w-4 h-4 text-slate-950" />
                </div>
              </div>

              {/* Title and date */}
              <div className="flex-1 min-w-0">
                <h4 className="text-cyan-400 font-semibold text-sm leading-tight mb-1 group-hover:text-cyan-300 transition-colors">
                  {milestone.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-cyan-400/50 uppercase tracking-wide">
                  <Icons.Calendar className="w-3 h-3" />
                  <span>{formatDate(milestone.date)}</span>
                  {milestone.featured && (
                    <>
                      <span className="text-cyan-400/30">•</span>
                      <span className="text-yellow-400/70 flex items-center gap-1">
                        <Icons.Star className="w-3 h-3 fill-current" />
                        Featured
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Expand indicator */}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <Icons.ChevronDown className="w-4 h-4 text-cyan-400/50" />
              </motion.div>
            </div>

            {/* Description preview */}
            <p className={`text-cyan-400/70 text-xs leading-relaxed ${
              isExpanded ? '' : 'line-clamp-2'
            }`}>
              {milestone.description}
            </p>

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-cyan-400/10 space-y-3">
                    {/* Images */}
                    {milestone.images && milestone.images.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Icons.Image className="w-3 h-3 text-cyan-400/50" />
                          <span className="text-[10px] text-cyan-400/50 uppercase tracking-wide">
                            Media
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {milestone.images.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative aspect-video rounded overflow-hidden border border-cyan-400/20 hover:border-cyan-400/40 transition-colors cursor-pointer group/img"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(img);
                                setShowImageModal(true);
                              }}
                            >
                              <img
                                src={img}
                                alt={`${milestone.title} ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-cyan-400/0 group-hover/img:bg-cyan-400/10 transition-colors flex items-center justify-center">
                                <Icons.Maximize2 className="w-4 h-4 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    {milestone.links && milestone.links.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Icons.Link className="w-3 h-3 text-cyan-400/50" />
                          <span className="text-[10px] text-cyan-400/50 uppercase tracking-wide">
                            Links
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {milestone.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors group/link"
                            >
                              <Icons.ExternalLink className="w-3 h-3" />
                              <span className="group-hover/link:underline">{link.label}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {milestone.tags && milestone.tags.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Icons.Tag className="w-3 h-3 text-cyan-400/50" />
                          <span className="text-[10px] text-cyan-400/50 uppercase tracking-wide">
                            Tags
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {milestone.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-[10px] text-cyan-400/70 bg-cyan-400/5 border border-cyan-400/20 rounded uppercase tracking-wide"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Corner accents */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-cyan-400/30" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-cyan-400/30" />
          </div>

          {/* Hover glow effect */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-cyan-400/5 to-transparent`} />
        </div>

        {/* External glow on hover */}
        <div className={`absolute -inset-0.5 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300 -z-10`} />
      </motion.div>

      {/* Image modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[20000] flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-lg overflow-hidden border-2 border-cyan-400/30">
                <img
                  src={selectedImage}
                  alt="Expanded view"
                  className="max-w-full max-h-[85vh] object-contain"
                />
                <button
                  onClick={() => setShowImageModal(false)}
                  className="absolute top-4 right-4 p-2 bg-cyan-400/20 hover:bg-cyan-400/30 backdrop-blur-xl border border-cyan-400/30 rounded-lg transition-colors"
                >
                  <Icons.X className="w-5 h-5 text-cyan-400" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
