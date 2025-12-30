import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';

export function DesktopIcons() {
  const { apps, openWindow } = useDesktopStore();

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')] || Icons.Square;
    return Icon;
  };

  const desktopApps = apps.filter(app => app.pinnedToDesktop);

  return (
    <div className="absolute inset-0 p-4">
      {desktopApps.map((app) => {
        const Icon = getIcon(app.icon);
        const position = app.desktopPosition || { x: 0, y: 0 };

        return (
          <button
            key={app.id}
            style={{
              position: 'absolute',
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            onDoubleClick={() => openWindow(app)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-all group w-24"
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <Icon className="w-10 h-10 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-white text-xs text-center drop-shadow-lg line-clamp-2 px-1">
              {app.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
