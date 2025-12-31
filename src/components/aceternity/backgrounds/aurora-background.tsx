import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

/**
 * Aurora Background Component
 * Animated gradient background with aurora borealis effect
 *
 * @example
 * <AuroraBackground colors={['#667eea', '#764ba2', '#f093fb']}>
 *   <div>Your content here</div>
 * </AuroraBackground>
 */

interface AuroraBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  colors?: string[];
  showRadialGradient?: boolean;
}

export function AuroraBackground({
  className,
  children,
  colors = ['#667eea', '#764ba2', '#f093fb'],
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Base gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2] || colors[0]} 100%)`,
        }}
      />

      {/* Aurora effect layers */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse 80% 80% at 50% -20%, ${colors[0]}55, transparent)`,
          }}
          animate={{
            transform: ['translateY(0px) rotate(0deg)', 'translateY(-20px) rotate(5deg)', 'translateY(0px) rotate(0deg)'],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(ellipse 80% 80% at 80% 50%, ${colors[1]}55, transparent)`,
          }}
          animate={{
            transform: ['translateX(0px) rotate(0deg)', 'translateX(20px) rotate(-5deg)', 'translateX(0px) rotate(0deg)'],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 10,
          }}
        />

        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse 80% 80% at 20% 80%, ${colors[2] || colors[0]}55, transparent)`,
          }}
          animate={{
            transform: ['translateY(0px) translateX(0px)', 'translateY(-15px) translateX(-15px)', 'translateY(0px) translateX(0px)'],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 55,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 20,
          }}
        />
      </div>

      {/* Optional radial gradient overlay for vignette effect */}
      {showRadialGradient && (
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
          }}
        />
      )}

      {/* Content layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
