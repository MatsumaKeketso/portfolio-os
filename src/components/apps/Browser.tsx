import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../ui/AppShell';

interface Bookmark {
  name: string;
  url: string;
  icon: string;
}

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

interface HistoryEntry {
  url: string;
  title: string;
  timestamp: number;
}

export function Browser() {
  const defaultBookmarks: Bookmark[] = [
    { name: 'Udemy', url: 'https://www.udemy.com', icon: '🎓' },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: '📚' },
    { name: 'Bing', url: 'https://www.bing.com', icon: '🔍' },
    { name: 'NailHub', url: 'https://www.nailhub.co.za', icon: '💅' },
    { name: 'Base44', url: 'https://base44.co.za', icon: '🚀' },
  ];

  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'tab-1', title: 'New Tab', url: 'browser://newtab' },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(defaultBookmarks);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const [inputUrl, setInputUrl] = useState(activeTab?.url || '');

  useEffect(() => {
    if (activeTab) {
      setInputUrl(activeTab.url);
    }
  }, [activeTabId, activeTab]);

  const updateTabUrl = (tabId: string, newUrl: string) => {
    setTabs(tabs.map(tab =>
      tab.id === tabId
        ? { ...tab, url: newUrl, title: getTitleFromUrl(newUrl) }
        : tab
    ));

    // Add to history
    setHistory([...history.slice(0, historyIndex + 1), {
      url: newUrl,
      title: getTitleFromUrl(newUrl),
      timestamp: Date.now()
    }]);
    setHistoryIndex(historyIndex + 1);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const getTitleFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const handleNavigate = () => {
    if (!inputUrl.trim()) return;

    let finalUrl = inputUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    if (activeTab) {
      updateTabUrl(activeTab.id, finalUrl);
    }
  };

  const handleBack = () => {
    if (historyIndex > 0 && activeTab) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const historyEntry = history[newIndex];
      setTabs(tabs.map(tab =>
        tab.id === activeTab.id
          ? { ...tab, url: historyEntry.url, title: historyEntry.title }
          : tab
      ));
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1 && activeTab) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const historyEntry = history[newIndex];
      setTabs(tabs.map(tab =>
        tab.id === activeTab.id
          ? { ...tab, url: historyEntry.url, title: historyEntry.title }
          : tab
      ));
    }
  };

  const handleRefresh = () => {
    if (activeTab) {
      setIsLoading(true);
      // Force iframe reload
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.src = iframe.src;
      }
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const handleHome = () => {
    if (activeTab) {
      updateTabUrl(activeTab.id, 'browser://newtab');
    }
  };

  const addNewTab = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: 'New Tab',
      url: 'browser://newtab',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; // Don't close last tab

    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      // Switch to previous tab or next tab
      const newActiveTab = newTabs[Math.max(0, tabIndex - 1)];
      setActiveTabId(newActiveTab.id);
    }
  };

  const addBookmark = () => {
    if (!activeTab) return;

    const existingBookmark = bookmarks.find(b => b.url === activeTab.url);
    if (existingBookmark) return;

    const newBookmark: Bookmark = {
      name: activeTab.title,
      url: activeTab.url,
      icon: '⭐',
    };
    setBookmarks([...bookmarks, newBookmark]);
  };

  const removeBookmark = (url: string) => {
    setBookmarks(bookmarks.filter(b => b.url !== url));
  };

  const isBookmarked = activeTab && bookmarks.some(b => b.url === activeTab.url);

  return (
    <AppShell>
      {/* Tabs Bar */}
      <div className="border-b border-white/[0.08] bg-white/[0.02] flex items-center gap-1 px-2 pt-2">
        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setActiveTabId(tab.id)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-t transition-all min-w-[120px] max-w-[200px] ${activeTabId === tab.id
                ? 'bg-black/30 text-white'
                : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/80'
                }`}
            >
              <Icons.Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs truncate flex-1">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 hover:bg-white/[0.16] rounded p-0.5 transition-all"
                >
                  <Icons.X className="w-3 h-3" />
                </button>
              )}
            </motion.button>
          ))}
        </div>
        <button
          onClick={addNewTab}
          className="p-1.5 hover:bg-white/[0.08] rounded text-white transition-colors"
          title="New Tab"
        >
          <Icons.Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="border-b border-white/[0.08] p-3 flex items-center gap-2 bg-white/[0.02]">
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={historyIndex <= 0}
            className="p-1.5 hover:bg-white/[0.08] rounded text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Back"
          >
            <Icons.ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 hover:bg-white/[0.08] rounded text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Forward"
          >
            <Icons.ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-white/[0.08] rounded text-white transition-colors"
            title="Refresh"
          >
            <Icons.RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleHome}
            className="p-1.5 hover:bg-white/[0.08] rounded text-white transition-colors"
            title="Home"
          >
            <Icons.Home className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2 bg-white/[0.06] px-3 py-2 rounded border border-white/[0.08]">
          <Icons.Lock className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
            onFocus={(e) => e.target.select()}
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
            placeholder="Enter URL or search..."
          />
          {isLoading && (
            <Icons.Loader2 className="w-3.5 h-3.5 text-primary-400 animate-spin shrink-0" />
          )}
        </div>

        <button
          onClick={isBookmarked ? () => removeBookmark(activeTab!.url) : addBookmark}
          className="p-1.5 hover:bg-white/[0.08] rounded text-white transition-colors"
          title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <Icons.Star className={`w-4 h-4 ${isBookmarked ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </button>

        <button
          onClick={() => setShowBookmarkDialog(!showBookmarkDialog)}
          className="p-1.5 hover:bg-white/[0.08] rounded text-white transition-colors"
          title="Bookmarks"
        >
          <Icons.Bookmark className="w-4 h-4" />
        </button>
      </div>

      {/* Bookmarks Bar */}
      <AnimatePresence>
        {showBookmarkDialog && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/[0.08] bg-white/[0.02] overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Icons.Bookmark className="w-4 h-4" />
                  Bookmarks
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {bookmarks.map((bookmark, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between gap-2 px-3 py-2 hover:bg-white/[0.08] rounded-lg transition-all"
                  >
                    <button
                      onClick={() => {
                        if (activeTab) {
                          updateTabUrl(activeTab.id, bookmark.url);
                        }
                      }}
                      className="flex items-center gap-2 flex-1 min-w-0"
                    >
                      <span className="text-lg shrink-0">{bookmark.icon}</span>
                      <span className="text-sm text-white truncate">{bookmark.name}</span>
                    </button>
                    {index >= 4 && (
                      <button
                        onClick={() => removeBookmark(bookmark.url)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                      >
                        <Icons.X className="w-3 h-3 text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <Icons.Loader2 className="w-6 h-6 text-white/50 animate-spin" />
              <p className="text-white/60 text-sm">Loading...</p>
            </div>
          </div>
        )}
        {activeTab && (
          <>
            {activeTab.url === 'browser://newtab' ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 text-white p-8 overflow-y-auto">
                <div className="max-w-4xl w-full flex flex-col items-center gap-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                      <Icons.Globe className="w-8 h-8 text-white/60" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Portfolio Browser</h1>
                  </div>

                  {/* Search Bar */}
                  <div className="w-full max-w-2xl">
                    <div className="bg-white/[0.06] border border-white/[0.08] rounded-lg p-3 flex items-center gap-3 focus-within:border-white/[0.20] transition-colors">
                      <Icons.Search className="w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        placeholder="Search the web or enter URL..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              let url = val;
                              if (!url.startsWith('http')) {
                                if (url.includes('.') && !url.includes(' ')) {
                                  url = 'https://' + url;
                                } else {
                                  url = `https://www.bing.com/search?q=${encodeURIComponent(val)}`;
                                }
                              }
                              updateTabUrl(activeTab.id, url);
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Speed Dial Grid */}
                  <div className="w-full">
                    <h2 className="text-xs font-semibold text-white/30 mb-3 uppercase tracking-wider">Quick Links</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {bookmarks.map((bookmark, index) => (
                        <button
                          key={index}
                          onClick={() => updateTabUrl(activeTab.id, bookmark.url)}
                          className="group flex flex-col items-center gap-2 p-4 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all hover:-translate-y-0.5"
                        >
                          <div className="w-12 h-12 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-2xl">
                            {bookmark.icon}
                          </div>
                          <span className="text-xs font-medium text-white/50 group-hover:text-white/80 transition-colors truncate w-full text-center">
                            {bookmark.name}
                          </span>
                        </button>
                      ))}

                      <button
                        onClick={() => setShowBookmarkDialog(true)}
                        className="group flex flex-col items-center gap-2 p-4 rounded-lg border border-dashed border-white/[0.10] hover:border-white/[0.20] hover:bg-white/[0.04] transition-all"
                      >
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white/20 group-hover:text-white/50 transition-colors">
                          <Icons.Plus className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-white/20 group-hover:text-white/50 transition-colors">
                          Add Shortcut
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                key={activeTab.id}
                src={activeTab.url}
                className="w-full h-full border-0"
                title={activeTab.title}
                onLoad={() => setIsLoading(false)}
              />
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
