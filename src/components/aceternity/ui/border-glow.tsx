import { useState, useRef } from 'react';
import { cn } from '../../../lib/utils';

/**
 * Border Glow Effect Component
 * Creates a cursor-following glow effect on element borders
 *
 * @example
 * <BorderGlow>
 *   <div>Your content here</div>
 * </BorderGlow>
 */

interface BorderGlowProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
  borderRadius?: string;
  borderWidth?: number;
  enabled?: boolean;
}

export function BorderGlow({
  children,
  className,
  glowColor = 'rgba(102, 126, 234, 0.6)', // Primary blue with transparency
  glowSize = 200,
  borderRadius = '0.5rem',
  borderWidth = 2,
  enabled = true,
}: BorderGlowProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  if (!enabled) {
    return children ? <>{children}</> : null;
  }

  // If used as overlay (no children), return just the effect
  if (!children) {
    return (
      <div
        ref={containerRef}
        className={cn(className)}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ borderRadius }}
      >
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius,
              padding: `${borderWidth}px`,
              background: `radial-gradient(${glowSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 40%)`,
              WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              transition: 'opacity 0.3s ease',
              opacity: 1,
              zIndex: 1,
            }}
          />
        )}
      </div>
    );
  }

  // If used as wrapper (with children)
  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ borderRadius }}
    >
      {/* Glow effect overlay */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius,
            padding: `${borderWidth}px`,
            background: `radial-gradient(${glowSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 40%)`,
            WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            transition: 'opacity 0.3s ease',
            opacity: 1,
            zIndex: 1,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Alternative Border Beam Component
 * Creates an animated beam that travels around the border
 */

interface BorderBeamProps {
  children: React.ReactNode;
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  borderRadius?: string;
  enabled?: boolean;
}

export function BorderBeam({
  children,
  className,
  size: _size = 200,
  duration = 8,
  borderWidth = 2,
  colorFrom = '#667eea',
  colorTo = '#764ba2',
  borderRadius = '0.5rem',
  enabled = true,
}: BorderBeamProps) {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative', className)} style={{ borderRadius }}>
      {/* Animated border beam */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius,
          padding: `${borderWidth}px`,
          background: `linear-gradient(90deg, ${colorFrom}, ${colorTo}, ${colorFrom})`,
          backgroundSize: '200% 200%',
          animation: `borderBeam ${duration}s linear infinite`,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      <style>{`
        @keyframes borderBeam {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
