import * as LucideIcons from 'lucide-react';
import { muiIconCatalog } from './muiIconCatalog';
import { cn } from './utils';
import { iconSizeClass, iconVisualScale, type IconSizeToken } from './iconScale';

interface AppIconProps {
  icon: string;
  customIcon?: string;
  size?: IconSizeToken;
  className?: string;
  style?: React.CSSProperties;
}

export function AppIcon({ icon, customIcon, size, className, style }: AppIconProps) {
  const sizeClassName = size ? iconSizeClass[size] : 'h-4 w-4';
  const shellClassName = cn(
    'inline-flex shrink-0 items-center justify-center leading-none',
    '[&>svg]:block [&>svg]:h-full [&>svg]:w-full',
    sizeClassName,
    className,
  );

  if (customIcon) {
    return (
      <span className={shellClassName} style={style}>
        <img
          src={customIcon}
          alt=""
          className="h-full w-full object-contain"
          style={{ transform: `scale(${iconVisualScale.image})` }}
        />
      </span>
    );
  }

  if (icon.startsWith('mui:')) {
    const name = icon.slice(4);
    const Icon = muiIconCatalog[name];
    if (Icon) {
      return (
        <span className={shellClassName} style={style}>
          <Icon
            className="block h-full w-full"
            style={{
              fontSize: 'inherit',
              height: '100%',
              transform: `scale(${iconVisualScale.mui})`,
              width: '100%',
            }}
          />
        </span>
      );
    }
  }

  const lucideName = icon.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const LucideIcon = (LucideIcons as Record<string, any>)[lucideName] as React.ComponentType<{ className?: string; style?: React.CSSProperties }> | undefined;
  const Fallback = LucideIcon || LucideIcons.Square;
  return (
    <span className={shellClassName} style={style}>
      <Fallback className="h-full w-full" style={{ transform: `scale(${iconVisualScale.lucide})` }} />
    </span>
  );
}
