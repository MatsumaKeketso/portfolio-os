import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

/**
 * Background Beams Component
 * Animated beam/line effects for dynamic backgrounds
 *
 * @example
 * <BackgroundBeams className="absolute inset-0" color="#667eea" />
 */

interface BackgroundBeamsProps {
  className?: string;
  color?: string;
  opacity?: number;
  beamCount?: number;
}

export function BackgroundBeams({
  className,
  color = '#667eea',
  opacity = 0.3,
  beamCount = 8,
}: BackgroundBeamsProps) {
  const beams = Array.from({ length: beamCount });

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity={opacity} />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {beams.map((_, index) => {
          const delay = index * 0.5;
          const duration = 15 + Math.random() * 10;
          const pathId = `beam-${index}`;

          return (
            <motion.line
              key={pathId}
              x1={`${10 + index * (80 / beamCount)}%`}
              y1="-10%"
              x2={`${20 + index * (80 / beamCount)}%`}
              y2="110%"
              stroke="url(#beamGradient)"
              strokeWidth={1 + Math.random() * 2}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0, opacity, 0],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: 'linear',
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
