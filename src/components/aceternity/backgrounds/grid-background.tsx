import { cn } from '../../../lib/utils';

/**
 * Grid Background Component
 * Professional grid/dot pattern background
 *
 * @example
 * <GridBackground dotColor="#667eea" spacing={20} />
 */

interface GridBackgroundProps {
  className?: string;
  dotColor?: string;
  spacing?: number;
  dotSize?: number;
  opacity?: number;
  gradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

export function GridBackground({
  className,
  dotColor = '#667eea',
  spacing = 30,
  dotSize = 1.5,
  opacity = 0.3,
  gradient = true,
  gradientFrom = '#1e3a8a',
  gradientTo = '#1e293b',
}: GridBackgroundProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Base gradient background */}
      {gradient && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
          }}
        />
      )}

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${spacing}px ${spacing}px`,
          opacity,
        }}
      />

      {/* Optional overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.2) 100%)',
          opacity: 0.5,
        }}
      />
    </div>
  );
}
