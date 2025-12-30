import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';

export function StartMenu() {
  const { apps, isStartMenuOpen, openWindow, setStartMenuOpen, isAdminMode } = useDesktopStore();
  const [searchQuery, setSearchQuery] = useState('');

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')] || Icons.Square;
    return Icon;
  };

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenApp = (app: any) => {
    openWindow(app);
    setStartMenuOpen(false);
    setSearchQuery('');
  };

  return (
    <AnimatePresence>
      {isStartMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998]"
            onClick={() => setStartMenuOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-14 left-1/2 transform -translate-x-1/2 w-[600px] h-[650px] bg-gray-800/95 backdrop-blur-2xl rounded-xl border border-gray-700/50 shadow-2xl z-[9999] overflow-hidden"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="relative mb-6">
                <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search apps, files, settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700/50 text-white placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-lg border border-gray-600/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <h3 className="text-white text-sm font-semibold mb-3">Pinned</h3>
                <div className="grid grid-cols-4 gap-3">
                  {filteredApps.slice(0, 8).map((app) => {
                    const Icon = getIcon(app.icon);
                    return (
                      <button
                        key={app.id}
                        onClick={() => handleOpenApp(app)}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white text-xs text-center line-clamp-2">{app.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <h3 className="text-white text-sm font-semibold mb-3">All Apps</h3>
                <div className="space-y-1">
                  {filteredApps.map((app) => {
                    const Icon = getIcon(app.icon);
                    return (
                      <button
                        key={app.id}
                        onClick={() => handleOpenApp(app)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/10 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white text-sm font-medium">{app.name}</div>
                          {app.description && (
                            <div className="text-gray-400 text-xs line-clamp-1">{app.description}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Icons.User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">Portfolio Admin</div>
                    {isAdminMode && (
                      <div className="text-green-400 text-xs">Admin Mode Active</div>
                    )}
                  </div>
                </div>
                <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all">
                  <Icons.Settings className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
