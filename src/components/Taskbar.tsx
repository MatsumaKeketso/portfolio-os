import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';

export function Taskbar() {
  const { apps, windows, isStartMenuOpen, toggleStartMenu, openWindow, minimizeWindow } = useDesktopStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pinnedApps = apps.filter(app => app.pinnedToTaskbar);
  const openApps = windows.filter(w => !w.isMinimized);

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')] || Icons.Square;
    return Icon;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-gray-900/70 backdrop-blur-md border-t border-white/10 flex items-center justify-center px-2 z-[10000]">
      <div className="flex items-center gap-1">
        <button
          onClick={toggleStartMenu}
          className={`w-10 h-10 rounded flex items-center justify-center transition-all ${isStartMenuOpen ? 'bg-primary-600' : 'hover:bg-white/10'
            }`}
        >
          <Icons.Grid3x3 className="w-5 h-5 text-white" />
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {pinnedApps.map((app) => {
          const Icon = getIcon(app.icon);
          const isOpen = windows.some(w => w.appId === app.id);

          return (
            <button
              key={app.id}
              onClick={() => {
                const window = windows.find(w => w.appId === app.id);
                if (window) {
                  minimizeWindow(window.id);
                } else {
                  openWindow(app);
                }
              }}
              className={`w-10 h-10 rounded flex items-center justify-center transition-all relative ${isOpen ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              title={app.name}
            >
              <Icon className="w-5 h-5 text-white" />
              {isOpen && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
              )}
            </button>
          );
        })}

        {openApps.filter(w => !pinnedApps.some(app => app.id === w.appId)).map((window) => {
          const Icon = getIcon(window.icon);

          return (
            <button
              key={window.id}
              onClick={() => minimizeWindow(window.id)}
              className="w-10 h-10 rounded flex items-center justify-center bg-white/20 hover:bg-white/30 transition-all relative"
              title={window.title}
            >
              <Icon className="w-5 h-5 text-white" />
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
            </button>
          );
        })}
      </div>

      <div className="absolute right-2 flex items-center gap-3">
        <div className="flex items-center gap-2 text-white text-xs">
          <Icons.Wifi className="w-4 h-4" />
          <Icons.Volume2 className="w-4 h-4" />
        </div>
        <div className="text-white text-xs text-right">
          <div className="font-medium">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="text-[10px] opacity-70">{time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        </div>
      </div>
    </div>
  );
}
