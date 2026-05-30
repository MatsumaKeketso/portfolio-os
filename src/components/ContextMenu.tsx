import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Typography } from './ui/Typography';

export interface ContextMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  shortcut?: string;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = () => onClose();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 0);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const adjustedX = x + rect.width > window.innerWidth ? window.innerWidth - rect.width - 10 : x;
    const adjustedY = y + rect.height > window.innerHeight ? window.innerHeight - rect.height - 10 : y;
    menuRef.current.style.left = `${adjustedX}px`;
    menuRef.current.style.top = `${adjustedY}px`;
  }, [x, y]);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.97, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: -4 }}
      transition={{ duration: 0.08, ease: 'easeOut' }}
      className="fixed z-[15002] min-w-[200px] py-1 rounded-lg overflow-hidden bg-background-floating border border-os-line-dark shadow-os-floating"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, index) => {
        if (item.divider) {
          return (
            <div
              key={`divider-${index}`}
              className="my-1 mx-2 h-px"
              style={{ background: 'var(--os-line-dark)' }}
            />
          );
        }

        const Icon = item.icon;

        return (
          <button
            key={`item-${index}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={cn(
              'flex items-center justify-between gap-3 w-full px-3 py-[7px] text-left select-none',
              'os-type-menu-title',
              'transition-colors duration-75',
              item.disabled
                ? 'opacity-40 pointer-events-none text-white/50'
                : item.danger
                  ? 'text-fg-error hover:bg-error-subtle hover:text-fg-error'
                  : 'text-white/80 hover:bg-os-ink-800 hover:text-white',
            )}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              {Icon && (
                <Icon
                  className={cn(
                    'w-[15px] h-[15px] flex-shrink-0',
                    item.danger ? 'text-fg-error/70' : 'text-white/35',
                  )}
                />
              )}
              <Typography as="span" variant="menuTitle" truncate>{item.label}</Typography>
            </span>
            {item.shortcut && (
              <Typography as="span" variant="caption" tone="inverseFaint" className="flex-shrink-0 ml-4">
                {item.shortcut}
              </Typography>
            )}
          </button>
        );
      })}
    </motion.div>
  );
}
