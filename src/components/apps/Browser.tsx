import { ComponentType, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import { AppShell } from '../ui/AppShell';
import { anchoredPanelClass, ControlInput, ControlSelect } from '../ui/control';
import { fetchReads, sanitizeReadHtml } from '../../lib/reads';
import { ReadArticle } from '../../types';
import { ArticleComments } from '../ArticleComments';

interface Bookmark {
  name: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
}

interface Tab {
  id: string;
  title: string;
  url: string;
}

interface HistoryEntry {
  url: string;
  title: string;
}

interface BrowserShortcut {
  id: string;
  name: string;
  url: string;
  description: string;
  category?: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  layoutPreset?: ResourceLayoutPreset;
  createdAt?: string;
}

type ResourceViewMode = 'card' | 'list' | 'bento' | 'custom' | 'grouped';
type ResourceLayoutPreset = 'standard' | 'wide' | 'tall' | 'feature' | 'hero';

interface BrowserResourceSettings {
  viewMode: ResourceViewMode;
  groupViews: Record<string, Exclude<ResourceViewMode, 'grouped'>>;
}

interface BrowserProps {
  initialUrl?: string;
}

// Sites known to refuse iframe embedding. All others are attempted.
const KNOWN_BLOCKED_HOSTS = [
  'github.com',
  'linkedin.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'youtube.com',
  'google.com',
  'notion.so',
];

function EmbedFrame({ url }: { url: string }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'timeout'>('loading');

  useEffect(() => {
    setStatus('loading');
    const timer = setTimeout(() => setStatus((s) => s === 'loading' ? 'timeout' : s), 7000);
    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div className="relative h-full w-full bg-os-ink-950">
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-os-ink-950">
          <div className="text-center">
            <Icons.Loader2 className="mx-auto h-7 w-7 animate-spin text-white/40" />
            <p className="mt-3 text-xs text-white/35">Loading pageâ€¦</p>
          </div>
        </div>
      )}
      {status === 'timeout' && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-os-line-dark bg-os-ink-900/90 px-4 py-2.5 shadow-lg backdrop-blur-sm">
          <Icons.AlertTriangle className="h-4 w-4 shrink-0 text-white/45" />
          <span className="text-xs text-white/55">Page may not support embedding</span>
          <button
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-1.5 rounded-lg border border-os-line-dark-hover bg-os-ink-800/60 px-2.5 py-1 text-xs text-white/70 transition hover:bg-os-ink-700/60 hover:text-white"
          >
            Open externally <Icons.ExternalLink className="h-3 w-3" />
          </button>
          <button onClick={() => setStatus('loaded')} className="rounded p-0.5 text-white/35 transition hover:text-white/70">
            <Icons.X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-os-ink-950 p-8">
          <div className="max-w-sm rounded-2xl border border-os-line-dark bg-os-ink-900 p-6 text-center text-white">
            <Icons.WifiOff className="mx-auto mb-3 h-8 w-8 text-white/35" />
            <h2 className="text-base font-semibold">Failed to load</h2>
            <p className="mt-2 truncate text-xs text-white/40">{url}</p>
            <button
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-os-ink-700/60 px-4 py-2 text-sm text-white/75 transition hover:bg-white/15"
            >
              Open externally <Icons.ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
      <iframe
        key={url}
        src={url}
        className="h-full w-full border-0"
        title={url}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        referrerPolicy="no-referrer"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  );
}

function AddShortcutForm({ onAdd, onCancel }: { onAdd: (s: Omit<BrowserShortcut, 'id'>) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tool');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailPath, setThumbnailPath] = useState('');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    const resolved = normalizeShortcutUrl(value);
    const host = getShortcutHost(resolved);
    if (!name.trim() && host && !host.includes('@')) {
      const label = host
        .split('.')
        .filter((part) => !['com', 'co', 'za', 'net', 'org', 'io', 'dev', 'app'].includes(part))
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      if (label) setName(label);
    }

    if (category === 'Tool') {
      const lower = host.toLowerCase();
      if (lower.includes('github') || lower.includes('stackoverflow') || lower.includes('codepen')) setCategory('Code');
      else if (lower.includes('figma') || lower.includes('behance') || lower.includes('dribbble')) setCategory('Design');
      else if (lower.includes('youtube') || lower.includes('coursera') || lower.includes('udemy')) setCategory('Learning');
      else if (lower.includes('docs') || lower.includes('developer') || lower.includes('mdn')) setCategory('Reference');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || isUploadingThumbnail) return;
    const resolved = normalizeShortcutUrl(url);
    onAdd({
      name: name.trim(),
      url: resolved,
      description: description.trim(),
      category,
      thumbnailUrl: thumbnailUrl.trim(),
      thumbnailPath,
      layoutPreset: 'standard',
      createdAt: new Date().toISOString(),
    });
  };

  const handleThumbnailUpload = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    setIsUploadingThumbnail(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `resource-thumbnails/${Date.now()}-${safeName}`;
      const uploadRef = ref(storage, path);
      await uploadBytes(uploadRef, file, { contentType: file.type });
      const downloadUrl = await getDownloadURL(uploadRef);
      setThumbnailUrl(downloadUrl);
      setThumbnailPath(path);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-stroke-brand/60 bg-os-ink-900 p-4 shadow-os-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="os-type-label text-white/35">New resource</p>
          <p className="os-type-secondary mt-1 text-white/65">Save a useful page into the Browser shelf.</p>
        </div>
        <Icons.BookmarkPlus className="h-5 w-5 shrink-0 text-fg-brand" />
      </div>
      <ControlInput icon={Icons.Link} value={url} onChange={(e) => handleUrlChange(e.target.value)} placeholder="Paste a URL" />
      <div className="grid gap-2 sm:grid-cols-2">
        <ControlInput icon={Icons.Type} value={name} onChange={(e) => setName(e.target.value)} placeholder="Label" />
        <ControlSelect icon={Icons.Filter} value={category} onChange={(e) => setCategory(e.target.value)}>
          {SAVED_PAGE_CATEGORIES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </ControlSelect>
      </div>
      <ControlInput icon={Icons.AlignLeft} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description (optional)" />
      <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-os-line-dark bg-os-ink-800 px-3 py-2 text-sm text-white/55 transition hover:border-stroke-brand hover:text-white">
        <span className="flex min-w-0 items-center gap-2">
          {isUploadingThumbnail ? <Icons.Loader2 className="h-4 w-4 animate-spin" /> : <Icons.ImagePlus className="h-4 w-4" />}
          <span className="truncate">{thumbnailUrl ? 'Thumbnail uploaded' : 'Upload thumbnail'}</span>
        </span>
        <span className="text-xs text-white/30">Image</span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => handleThumbnailUpload(event.target.files?.[0])}
        />
      </label>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-800">
          <Icons.Plus className="h-3.5 w-3.5" />
          Save
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-os-line-dark px-4 py-2 text-xs text-white/45 transition hover:text-white">
          Cancel
        </button>
      </div>
    </form>
  );
}

const HOME_URL = 'browser://home';
const SAVED_PAGE_CATEGORIES = ['Tool', 'Reference', 'Learning', 'Design', 'Code', 'Inspiration', 'Platform'];
const RESOURCE_VIEW_OPTIONS: Array<{ value: ResourceViewMode; label: string }> = [
  { value: 'card', label: 'Cards' },
  { value: 'list', label: 'List' },
  { value: 'bento', label: 'Bento' },
  { value: 'custom', label: 'Custom' },
  { value: 'grouped', label: 'Grouped' },
];
const GROUP_VIEW_OPTIONS: Array<{ value: Exclude<ResourceViewMode, 'grouped'>; label: string }> = [
  { value: 'card', label: 'Cards' },
  { value: 'list', label: 'List' },
  { value: 'bento', label: 'Bento' },
  { value: 'custom', label: 'Custom' },
];
const RESOURCE_LAYOUT_OPTIONS: Array<{ value: ResourceLayoutPreset; label: string }> = [
  { value: 'standard', label: 'Standard' },
  { value: 'wide', label: 'Wide' },
  { value: 'tall', label: 'Tall' },
  { value: 'feature', label: 'Feature' },
  { value: 'hero', label: 'Hero' },
];
const DEFAULT_RESOURCE_SETTINGS: BrowserResourceSettings = {
  viewMode: 'card',
  groupViews: {},
};

const normalizeShortcutUrl = (value: string) => {
  const trimmed = value.trim();
  if (/^(https?:\/\/|mailto:|browser:\/\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const getShortcutHost = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^mailto:/, '');
  }
};

const getShortcutPreviewUrl = (shortcut: BrowserShortcut) => {
  if (shortcut.thumbnailUrl) return shortcut.thumbnailUrl;

  try {
    const parsed = new URL(shortcut.url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const videoId = parsed.pathname.replace('/', '');
      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
    }

    if (host.endsWith('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
    }

    if (host === 'github.com') {
      const [, owner, repo] = parsed.pathname.split('/');
      return owner && repo ? `https://opengraph.githubassets.com/genos/${owner}/${repo}` : '';
    }
  } catch {
    return '';
  }

  return '';
};

// Custom quick-link tiles shown on the home page â€” each one opens in a new tab.
// Add or remove entries here to customise the home page shortcuts.
const QUICK_LINKS: Array<{ name: string; url: string; description: string; icon: ComponentType<{ className?: string }> }> = [
  { name: 'Reads', url: 'browser://reads', description: 'Essays and articles', icon: Icons.BookOpen },
  { name: 'Generative Studio', url: 'https://genstudio.framer.website/', description: 'genstudio.framer.website', icon: Icons.Globe },
  { name: 'GitHub', url: 'https://github.com/MatsumaKeketso', description: 'MatsumaKeketso', icon: Icons.Github },
];

const formatDate = (value: string) => {
  if (!value) return 'Undated';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Undated';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const getReadUrl = (read: ReadArticle) => `browser://reads/${read.slug}`;
const getTagUrl = (tag: string) => `browser://reads/tag/${encodeURIComponent(tag)}`;

const getTitleFromUrl = (url: string, reads: ReadArticle[]): string => {
  if (url === HOME_URL || url === 'browser://newtab') return 'New Tab';
  if (url === 'browser://reads') return 'Reads';
  if (url.startsWith('browser://reads/tag/')) {
    const tag = decodeURIComponent(url.replace('browser://reads/tag/', ''));
    return `${tag.replace(/-/g, ' ')} reads`;
  }
  const slug = url.replace('browser://reads/', '');
  const read = reads.find((item) => item.slug === slug);
  if (read) return read.title;

  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
};

const isTagUrl = (url: string) => url.startsWith('browser://reads/tag/');
const isReadUrl = (url: string) => url.startsWith('browser://reads/') && !isTagUrl(url);


export function Browser({ initialUrl = HOME_URL }: BrowserProps) {
  const [reads, setReads] = useState<ReadArticle[]>([]);
  const [isFetchingReads, setIsFetchingReads] = useState(true);
  const [readError, setReadError] = useState('');
  const [clockTime, setClockTime] = useState(() => new Date());
  const [customShortcuts, setCustomShortcuts] = useState<BrowserShortcut[]>([]);
  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const { isAdmin } = useAuthStore();
  // Normalize the entry URL: a missing/empty/newtab url opens the Browser home,
  // not an unmatched route (which previously fell through to renderExternal).
  const startUrl = !initialUrl || initialUrl === 'browser://newtab' ? HOME_URL : initialUrl;
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: getTitleFromUrl(startUrl, []),
      url: startUrl,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedPageQuery, setSavedPageQuery] = useState('');
  const [savedPageCategory, setSavedPageCategory] = useState('All');
  const [savedPageSort, setSavedPageSort] = useState<'recent' | 'name' | 'category'>('recent');
  const [resourceSettings, setResourceSettings] = useState<BrowserResourceSettings>(DEFAULT_RESOURCE_SETTINGS);
  const pendingNavUrl = useRef<string | null>(null);

  const bookmarks: Bookmark[] = [
    { name: 'Reads', url: 'browser://reads', icon: Icons.BookOpen },
    { name: 'Featured', url: reads[0] ? getReadUrl(reads[0]) : 'browser://reads', icon: Icons.Sparkles },
    { name: 'Generative Studio', url: 'https://genstudio.framer.website/', icon: Icons.ExternalLink },
    { name: 'GitHub', url: 'https://github.com/MatsumaKeketso', icon: Icons.Github },
  ];

  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const activeReadSlug = activeTab && isReadUrl(activeTab.url) ? activeTab.url.replace('browser://reads/', '') : '';
  const activeTag = activeTab && isTagUrl(activeTab.url) ? decodeURIComponent(activeTab.url.replace('browser://reads/tag/', '')) : '';
  const activeRead = reads.find((read) => read.slug === activeReadSlug);
  const sanitizedContent = useMemo(() => sanitizeReadHtml(activeRead?.content || ''), [activeRead]);
  const activeReadIndex = activeRead ? reads.findIndex((read) => read.slug === activeRead.slug) : -1;
  const previousRead = activeReadIndex > 0 ? reads[activeReadIndex - 1] : null;
  const nextRead = activeReadIndex >= 0 && activeReadIndex < reads.length - 1 ? reads[activeReadIndex + 1] : null;

  const curatedTags = useMemo(() => {
    const counts = new Map<string, number>();
    reads.forEach((read) => {
      read.categories.forEach((category) => {
        counts.set(category, (counts.get(category) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag, count]) => ({ tag, count }));
  }, [reads]);

  const taggedReads = useMemo(() => {
    if (!activeTag) return [];
    return reads.filter((read) => read.categories.includes(activeTag)).slice(0, 8);
  }, [activeTag, reads]);

  const filteredReads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return reads;

    return reads.filter((read) => {
      const haystack = [
        read.title,
        read.description,
        read.author,
        read.categories.join(' '),
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [reads, searchQuery]);

  const savedPageCategories = useMemo(() => {
    const counts = new Map<string, number>();
    customShortcuts.forEach((shortcut) => {
      const category = shortcut.category || 'Tool';
      counts.set(category, (counts.get(category) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [customShortcuts]);

  const filteredSavedPages = useMemo(() => {
    const query = savedPageQuery.trim().toLowerCase();
    const filtered = customShortcuts.filter((shortcut) => {
      const category = shortcut.category || 'Tool';
      if (savedPageCategory !== 'All' && category !== savedPageCategory) return false;
      if (!query) return true;
      return [
        shortcut.name,
        shortcut.description,
        shortcut.url,
        category,
      ].join(' ').toLowerCase().includes(query);
    });

    return filtered.sort((a, b) => {
      if (savedPageSort === 'name') return a.name.localeCompare(b.name);
      if (savedPageSort === 'category') {
        return (a.category || 'Tool').localeCompare(b.category || 'Tool') || a.name.localeCompare(b.name);
      }
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    });
  }, [customShortcuts, savedPageCategory, savedPageQuery, savedPageSort]);

  const groupedSavedPages = useMemo(() => {
    const groups = new Map<string, BrowserShortcut[]>();
    filteredSavedPages.forEach((shortcut) => {
      const category = shortcut.category || 'Tool';
      groups.set(category, [...(groups.get(category) || []), shortcut]);
    });
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredSavedPages]);

  useEffect(() => {
    const timer = setInterval(() => setClockTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getDoc(doc(db, 'os-site_content', 'browser-shortcuts'))
      .then((snap) => {
        const payload = snap.data();
        if (snap.exists() && Array.isArray(payload?.data)) {
          setCustomShortcuts((payload.data as BrowserShortcut[]).map((shortcut) => ({
            ...shortcut,
            category: shortcut.category || 'Tool',
            layoutPreset: shortcut.layoutPreset || 'standard',
          })));
          setResourceSettings({
            ...DEFAULT_RESOURCE_SETTINGS,
            ...(payload.settings as Partial<BrowserResourceSettings> | undefined),
            groupViews: {
              ...DEFAULT_RESOURCE_SETTINGS.groupViews,
              ...((payload.settings as Partial<BrowserResourceSettings> | undefined)?.groupViews || {}),
            },
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsFetchingReads(true);
    fetchReads()
      .then((nextReads) => {
        if (!isMounted) return;
        setReads(nextReads);
        setReadError('');
        setTabs((currentTabs) =>
          currentTabs.map((tab) => ({
            ...tab,
            title: getTitleFromUrl(tab.url, nextReads),
          }))
        );
      })
      .catch(() => {
        if (isMounted) setReadError('Reads could not be loaded.');
      })
      .finally(() => {
        if (isMounted) setIsFetchingReads(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateTabUrl = (tabId: string, newUrl: string) => {
    const title = getTitleFromUrl(newUrl, reads);
    setTabs((currentTabs) =>
      currentTabs.map((tab) => tab.id === tabId ? { ...tab, url: newUrl, title } : tab)
    );
    setHistory((currentHistory) => [...currentHistory.slice(0, historyIndex + 1), { url: newUrl, title }]);
    setHistoryIndex((currentIndex) => currentIndex + 1);
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 420);
  };

  const navigateActiveTab = (url: string) => {
    if (activeTab) updateTabUrl(activeTab.id, url);
  };

  // Navigate when the parent passes a new initialUrl (e.g. opening a read from Timeline)
  useEffect(() => {
    if (initialUrl && initialUrl !== HOME_URL && initialUrl !== 'browser://newtab') {
      pendingNavUrl.current = initialUrl;
    }
  }, [initialUrl]);

  // Process pending navigation after activeTab is available
  useEffect(() => {
    if (pendingNavUrl.current && activeTab) {
      const url = pendingNavUrl.current;
      pendingNavUrl.current = null;
      updateTabUrl(activeTab.id, url);
    }
  }, [activeTab, initialUrl]);

  const handleAddressSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeTab) return;

    const rawValue = new FormData(event.currentTarget).get('address');
    const value = typeof rawValue === 'string' ? rawValue.trim() : '';
    if (!value) return;

    const matchedRead = reads.find((read) => {
      const query = value.toLowerCase();
      return read.slug === query || read.title.toLowerCase().includes(query);
    });

    if (matchedRead) {
      updateTabUrl(activeTab.id, getReadUrl(matchedRead));
      return;
    }

    if (value.startsWith('browser://')) {
      updateTabUrl(activeTab.id, value);
      return;
    }

    const externalUrl = value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;
    updateTabUrl(activeTab.id, externalUrl);
  };

  const handleBack = () => {
    if (historyIndex <= 0 || !activeTab) return;
    const nextIndex = historyIndex - 1;
    const entry = history[nextIndex];
    setHistoryIndex(nextIndex);
    setTabs((currentTabs) =>
      currentTabs.map((tab) => tab.id === activeTab.id ? { ...tab, url: entry.url, title: entry.title } : tab)
    );
  };

  const handleForward = () => {
    if (historyIndex >= history.length - 1 || !activeTab) return;
    const nextIndex = historyIndex + 1;
    const entry = history[nextIndex];
    setHistoryIndex(nextIndex);
    setTabs((currentTabs) =>
      currentTabs.map((tab) => tab.id === activeTab.id ? { ...tab, url: entry.url, title: entry.title } : tab)
    );
  };

  const addNewTab = () => {
    const nextTab: Tab = { id: `tab-${Date.now()}`, title: 'New Tab', url: HOME_URL };
    setTabs((currentTabs) => [...currentTabs, nextTab]);
    setActiveTabId(nextTab.id);
  };

  const openLinkInNewTab = (url: string) => {
    if (url.startsWith('mailto:')) {
      window.open(url);
      return;
    }
    const title = getTitleFromUrl(url, reads);
    const nextTab: Tab = { id: `tab-${Date.now()}`, title, url };
    setTabs((currentTabs) => [...currentTabs, nextTab]);
    setActiveTabId(nextTab.id);
  };

  const saveShortcuts = async (next: BrowserShortcut[], nextSettings = resourceSettings) => {
    setCustomShortcuts(next);
    setResourceSettings(nextSettings);
    try {
      await setDoc(doc(db, 'os-site_content', 'browser-shortcuts'), {
        data: next,
        settings: nextSettings,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to save browser shortcuts:', err);
    }
  };

  const addShortcut = (shortcut: Omit<BrowserShortcut, 'id'>) => {
    const next = [...customShortcuts, { ...shortcut, id: `shortcut-${Date.now()}` }];
    saveShortcuts(next);
    setShowAddShortcut(false);
  };

  const removeShortcut = (id: string) => {
    saveShortcuts(customShortcuts.filter((s) => s.id !== id));
  };

  const updateResourceSettings = (nextSettings: BrowserResourceSettings) => {
    saveShortcuts(customShortcuts, nextSettings);
  };

  const updateShortcutLayout = (id: string, layoutPreset: ResourceLayoutPreset) => {
    saveShortcuts(customShortcuts.map((shortcut) =>
      shortcut.id === id ? { ...shortcut, layoutPreset } : shortcut
    ));
  };

  const updateGroupView = (category: string, viewMode: Exclude<ResourceViewMode, 'grouped'>) => {
    updateResourceSettings({
      ...resourceSettings,
      groupViews: {
        ...resourceSettings.groupViews,
        [category]: viewMode,
      },
    });
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
    const nextTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(nextTabs);
    if (activeTabId === tabId) {
      setActiveTabId(nextTabs[Math.max(0, tabIndex - 1)].id);
    }
  };

  const getLayoutClass = (shortcut: BrowserShortcut, viewMode: Exclude<ResourceViewMode, 'grouped'>) => {
    if (viewMode !== 'custom') return '';
    switch (shortcut.layoutPreset || 'standard') {
      case 'wide':
        return 'md:col-span-2';
      case 'tall':
        return 'md:row-span-2 min-h-[480px]';
      case 'feature':
        return 'md:col-span-2 md:row-span-2 min-h-[480px]';
      case 'hero':
        return 'md:col-span-3 min-h-[360px]';
      default:
        return '';
    }
  };

  const renderSavedPageTile = (shortcut: BrowserShortcut, viewMode: Exclude<ResourceViewMode, 'grouped'> = 'card') => {
    const previewUrl = getShortcutPreviewUrl(shortcut);
    const host = getShortcutHost(shortcut.url);
    const isList = viewMode === 'list';
    return (
    <button
      key={shortcut.id}
      onClick={() => openLinkInNewTab(shortcut.url)}
      className={[
        'group relative overflow-hidden rounded-2xl border border-os-line-dark bg-os-ink-900 text-left shadow-os-card transition hover:-translate-y-0.5 hover:border-os-line-dark-hover hover:bg-os-ink-800',
        isList ? 'grid min-h-[132px] grid-cols-[132px_minmax(0,1fr)]' : 'flex min-h-[230px] flex-col',
        viewMode === 'bento' ? 'odd:md:col-span-2' : '',
        getLayoutClass(shortcut, viewMode),
      ].join(' ')}
    >
      {isAdmin && (
        <div className="absolute right-2 top-2 z-20 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          {resourceSettings.viewMode === 'custom' && (
            <select
              value={shortcut.layoutPreset || 'standard'}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => {
                event.stopPropagation();
                updateShortcutLayout(shortcut.id, event.target.value as ResourceLayoutPreset);
              }}
            className="os-type-caption rounded-lg border border-os-line-dark-hover bg-os-ink-950 px-2 py-1 text-white/70 outline-none"
            >
              {RESOURCE_LAYOUT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          )}
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              removeShortcut(shortcut.id);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.stopPropagation();
                removeShortcut(shortcut.id);
              }
            }}
            className="rounded-md bg-os-ink-950/80 p-1 text-white/40 transition hover:bg-os-ink-700/60 hover:text-white"
          >
            <Icons.X className="h-3 w-3" />
          </span>
        </div>
      )}

      <div className={isList ? 'relative h-full min-h-[132px] overflow-hidden border-r border-os-line-dark bg-os-ink-950' : 'relative h-28 overflow-hidden border-b border-os-line-dark bg-os-ink-950'}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(var(--color-primary),0.32),transparent_35%),linear-gradient(135deg,rgb(var(--os-ink-900)),rgb(var(--os-ink-950)))]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-os-line-dark-hover bg-os-ink-800/60">
              <Icons.Globe className="h-6 w-6 text-white/55" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-os-ink-950/80 via-transparent to-transparent" />
        <span className="os-type-caption absolute bottom-3 left-3 rounded-full border border-os-line-dark-hover bg-black/35 px-2.5 py-1 text-white/70">
          {shortcut.category || 'Tool'}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <span className="os-type-title-4 block text-white/85 transition group-hover:text-white">
            {shortcut.name}
          </span>
          <span className="os-type-secondary mt-2 line-clamp-2 block text-white/45">
            {shortcut.description || shortcut.url}
          </span>
        </div>

        <div className="os-type-caption mt-4 flex items-center justify-between gap-3 text-white/35">
          <span className="min-w-0 truncate">{host}</span>
          <Icons.ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
        </div>
      </div>
    </button>
    );
  };

  const renderReadCard = (read: ReadArticle, index: number) => {
    const isLarge = index === 0 || index === 5;
    return (
      <motion.button
        key={read.id}
        onClick={() => navigateActiveTab(getReadUrl(read))}
        className={[
          'group relative min-h-[220px] overflow-hidden rounded-2xl border border-os-line-dark bg-os-ink-900 text-left shadow-os-card',
          'transition-all hover:-translate-y-1 hover:border-os-line-dark-hover hover:shadow-2xl',
          isLarge ? 'md:col-span-2 md:row-span-2 min-h-[360px]' : '',
        ].join(' ')}
      >
        {read.imageUrl ? (
          <img
            src={read.imageUrl}
            alt={read.imageAlt || read.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-2100 via-os-ink-900 to-os-ink-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
        <div className="relative z-10 flex h-full flex-col justify-end p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="os-type-label rounded-full border border-os-line-dark-hover bg-os-ink-700/60 px-2.5 py-1 text-white/70">
              {read.categories[0] || 'Read'}
            </span>
            <span className="os-type-caption text-white/45">{read.readingTimeMinutes} min</span>
          </div>
          <h3 className={isLarge ? 'os-type-title-2 text-white' : 'os-type-title-4 text-white'}>
            {read.title}
          </h3>
          <p className="os-type-secondary mt-2 line-clamp-3 text-white/60">{read.description}</p>
          <div className="os-type-caption mt-4 flex items-center justify-between text-white/45">
            <span>{read.author}</span>
            <span>{formatDate(read.date)}</span>
          </div>
        </div>
      </motion.button>
    );
  };

  const renderResourceGrid = (
    shortcuts: BrowserShortcut[],
    viewMode: Exclude<ResourceViewMode, 'grouped'> = 'card'
  ) => {
    const gridClass = viewMode === 'list'
      ? 'grid gap-3'
      : viewMode === 'custom'
        ? 'grid auto-rows-[230px] gap-4 md:grid-cols-3'
        : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3';

    return (
      <div className={gridClass}>
        {shortcuts.map((shortcut) => renderSavedPageTile(shortcut, viewMode))}
      </div>
    );
  };

  const renderGroupedResources = () => (
    <div className="space-y-7">
      {groupedSavedPages.map(([category, shortcuts]) => {
        const groupView = resourceSettings.groupViews[category] || 'card';
        return (
          <section key={category} className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="os-type-label text-white/30">{category}</p>
                <p className="os-type-secondary mt-1 text-white/45">{shortcuts.length} resources</p>
              </div>
              {isAdmin && (
                <ControlSelect
                  icon={Icons.LayoutGrid}
                  value={groupView}
                  onChange={(event) => updateGroupView(category, event.target.value as Exclude<ResourceViewMode, 'grouped'>)}
                  containerClassName="w-fit"
                >
                  {GROUP_VIEW_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </ControlSelect>
              )}
            </div>
            {renderResourceGrid(shortcuts, groupView)}
          </section>
        );
      })}
    </div>
  );

  const renderHomePage = () => {
    const hours = clockTime.getHours();
    const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';
    return (
      <div className="h-full overflow-y-auto bg-os-ink-950 text-white pb-[var(--window-cutout-bottom,0px)]">
        <div className="flex flex-col items-center justify-center px-6 pt-16 pb-12 select-none">
          <p className="text-7xl font-light tabular-nums text-white tracking-tight leading-none">
            {clockTime.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="mt-3 text-sm text-white/40">
            {greeting} â€” {clockTime.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-16">
          {/* Built-in quick links */}
          <div className="mx-auto max-w-xl">
            <p className="os-type-label mb-3 text-white/30">Quick links</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.name}
                    onClick={() => openLinkInNewTab(link.url)}
                    className="group flex flex-col items-center gap-2.5 rounded-2xl border border-os-line-dark bg-os-ink-900 px-3 py-5 text-center transition hover:-translate-y-0.5 hover:border-os-line-dark-hover hover:bg-os-ink-800"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-os-line-dark bg-os-ink-800/60">
                      <Icon className="h-[18px] w-[18px] text-white/60 transition group-hover:text-white/90" />
                    </span>
                    <span className="os-type-body-strong text-white/75 transition group-hover:text-white">{link.name}</span>
                    <span className="os-type-caption w-full truncate text-white/30">{link.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom saved pages (admin-managed, Firestore-backed) */}
          {(customShortcuts.length > 0 || isAdmin) && (
            <section className="mt-8">
              <div className="sticky top-0 z-20 -mx-2 border-b border-os-line-dark bg-os-ink-950/95 px-2 py-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="os-type-label text-white/30">Saved pages</p>
                    <h2 className="os-type-title-3 mt-1 text-white">Useful resources</h2>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <ControlInput
                      icon={Icons.Search}
                      value={savedPageQuery}
                      onChange={(event) => setSavedPageQuery(event.target.value)}
                      placeholder="Search"
                      className="sm:w-52"
                    />

                    <ControlSelect
                      icon={Icons.Filter}
                      value={savedPageCategory}
                      onChange={(event) => setSavedPageCategory(event.target.value)}
                    >
                        {['All', ...savedPageCategories.map(([category]) => category)].map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                    </ControlSelect>

                    <ControlSelect
                      icon={Icons.ArrowDownUp}
                      value={savedPageSort}
                      onChange={(event) => setSavedPageSort(event.target.value as 'recent' | 'name' | 'category')}
                    >
                        <option value="recent">Recent</option>
                        <option value="name">Name</option>
                        <option value="category">Category</option>
                    </ControlSelect>

                    <ControlSelect
                      icon={Icons.LayoutGrid}
                      value={resourceSettings.viewMode}
                      onChange={(event) => updateResourceSettings({
                        ...resourceSettings,
                        viewMode: event.target.value as ResourceViewMode,
                      })}
                    >
                      {RESOURCE_VIEW_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </ControlSelect>

                    {isAdmin && (
                      <div className="relative">
                        <button
                          onClick={() => setShowAddShortcut((value) => !value)}
                          aria-expanded={showAddShortcut}
                          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-stroke-brand bg-brand-600 px-4 text-xs font-semibold text-white shadow-os-card transition hover:bg-brand-800"
                        >
                          <Icons.BookmarkPlus className="h-3.5 w-3.5" />
                          Add resource
                        </button>

                        <AnimatePresence>
                          {showAddShortcut && (
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.98 }}
                              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                              className={`${anchoredPanelClass} right-0`}
                            >
                              <AddShortcutForm onAdd={addShortcut} onCancel={() => setShowAddShortcut(false)} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {customShortcuts.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-os-line-dark bg-os-ink-900 p-6 text-sm text-white/50">
                  No saved pages yet.
                </div>
              ) : filteredSavedPages.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-os-line-dark bg-os-ink-900 p-6 text-sm text-white/50">
                  No saved pages match this filter.
                </div>
              ) : (
                <div className="mt-4">
                  {resourceSettings.viewMode === 'grouped'
                    ? renderGroupedResources()
                    : renderResourceGrid(filteredSavedPages, resourceSettings.viewMode)}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    );
  };

  const renderHome = () => (
    <div className="h-full overflow-y-auto bg-os-ink-950 pb-[var(--window-cutout-bottom,0px)] text-white">
      <section className="relative min-h-[420px] overflow-hidden border-b border-os-line-dark">
        {reads[0]?.imageUrl && (
          <img src={reads[0].imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-os-ink-950 via-os-ink-950/90 to-os-ink-950/45" />
        <div className="relative z-10 mx-auto flex min-h-[420px] w-full max-w-6xl flex-col justify-end px-6 py-8">
          <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-os-line-dark-hover bg-white/5 px-3 py-1.5 text-xs text-white/55">
            <Icons.Database className="h-3.5 w-3.5" />
            Firestore-backed reading shelf
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-white md:text-5xl">
            Reads inside the OS, not outside the experience.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
            Essays, system notes, and startup thinking are loaded from the database and rendered as native OS pages.
          </p>
          <form onSubmit={handleAddressSubmit} className="mt-7 flex max-w-2xl items-center gap-2 rounded-2xl border border-os-line-dark-hover bg-os-ink-800/70 p-2">
            <Icons.Search className="ml-2 h-4 w-4 text-white/35" />
            <input
              name="address"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              placeholder="Search reads by topic or paste an internal browser URL"
            />
            <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-os-ink-950 transition hover:bg-white/85">
              Open
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-6">
        {curatedTags.length > 0 && (
          <div className="rounded-2xl border border-os-line-dark bg-os-ink-900 p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/35">Curated reads</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Browse by tag</h2>
              </div>
              <Icons.Tags className="h-5 w-5 text-white/30" />
            </div>
            <div className="flex flex-wrap gap-2">
              {curatedTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => navigateActiveTab(getTagUrl(tag))}
                  className="rounded-full border border-os-line-dark-hover bg-os-ink-800/40 px-3 py-1.5 text-xs text-white/60 transition hover:border-os-line-dark-hover hover:bg-os-ink-800/80 hover:text-white"
                >
                  {tag.replace(/-/g, ' ')}
                  <span className="ml-2 text-white/30">{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/35">Library</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">All reads</h2>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-os-line-dark bg-os-ink-900 px-3 py-2">
            <Icons.Filter className="h-4 w-4 text-white/35" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-56 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              placeholder="Filter the shelf"
            />
          </div>
        </div>

        {isFetchingReads ? (
          <div className="grid min-h-[360px] place-items-center rounded-2xl border border-os-line-dark bg-os-ink-900">
            <Icons.Loader2 className="h-7 w-7 animate-spin text-white/40" />
          </div>
        ) : readError ? (
          <div className="rounded-2xl border border-os-line-dark bg-os-ink-900 p-6 text-sm text-white/50">{readError}</div>
        ) : filteredReads.length === 0 ? (
          <div className="rounded-2xl border border-os-line-dark bg-os-ink-900 p-6 text-sm text-white/50">
            No reads are available yet. Import the CSV into Firestore to populate this space.
          </div>
        ) : (
          <div className="grid auto-rows-[220px] grid-cols-1 gap-4 md:grid-cols-3">
            {filteredReads.map(renderReadCard)}
          </div>
        )}
      </section>
    </div>
  );

  const renderTagPage = () => (
    <div className="h-full overflow-y-auto bg-os-ink-950 pb-[var(--window-cutout-bottom,0px)] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-8">
        <button
          onClick={() => navigateActiveTab('browser://reads')}
          className="flex w-fit items-center gap-2 rounded-full border border-os-line-dark-hover bg-os-ink-800/40 px-3 py-1.5 text-xs text-white/55 transition hover:bg-os-ink-800/80 hover:text-white"
        >
          <Icons.ChevronLeft className="h-3.5 w-3.5" />
          Back to all reads
        </button>

        <div className="rounded-3xl border border-os-line-dark bg-os-ink-900 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/35">Curated tag</p>
          <h1 className="mt-2 text-4xl font-semibold capitalize text-white">{activeTag.replace(/-/g, ' ')}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
            Showing up to eight reads grouped under this tag from the database.
          </p>
        </div>

        {taggedReads.length === 0 ? (
          <div className="rounded-2xl border border-os-line-dark bg-os-ink-900 p-6 text-sm text-white/50">
            No reads are currently grouped under this tag.
          </div>
        ) : (
          <div className="grid auto-rows-[220px] grid-cols-1 gap-4 md:grid-cols-3">
            {taggedReads.map(renderReadCard)}
          </div>
        )}
      </section>
    </div>
  );

  const renderArticle = () => {
    if (!activeRead) {
      return (
        <div className="grid h-full place-items-center bg-os-ink-950 p-8 text-white">
          <div className="max-w-sm rounded-2xl border border-os-line-dark bg-os-ink-900 p-6 text-center">
            <Icons.FileQuestion className="mx-auto mb-3 h-8 w-8 text-white/35" />
            <h2 className="text-lg font-semibold">Read unavailable</h2>
            <p className="mt-2 text-sm text-white/45">This internal page is not in the current database payload.</p>
            <button onClick={() => navigateActiveTab('browser://reads')} className="mt-5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-os-ink-950">
              Back to reads
            </button>
          </div>
        </div>
      );
    }

    return (
      <article className="h-full overflow-y-auto bg-os-ink-950 pb-[var(--window-cutout-bottom,0px)] text-white">
        <header className="relative min-h-[520px] overflow-hidden border-b border-os-line-dark">
          {activeRead.imageUrl && (
            <img src={activeRead.imageUrl} alt={activeRead.imageAlt || activeRead.title} className="absolute inset-0 h-full w-full object-cover opacity-45" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-os-ink-950 via-os-ink-950/75 to-os-ink-950/25" />
          <div className="relative z-10 mx-auto flex min-h-[520px] max-w-4xl flex-col justify-end px-6 py-10">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {activeRead.categories.slice(0, 3).map((category) => (
                <span key={category} className="rounded-full border border-os-line-dark-hover bg-os-ink-700/60 px-2.5 py-1 text-[11px] uppercase tracking-wide text-white/70">
                  {category.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-6xl">{activeRead.title}</h1>
            <p className="mt-5 text-lg leading-8 text-white/60">{activeRead.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/45">
              <span>{activeRead.author}</span>
              <span className="h-1 w-1 rounded-full bg-white/25" />
              <span>{formatDate(activeRead.date)}</span>
              <span className="h-1 w-1 rounded-full bg-white/25" />
              <span>{activeRead.readingTimeMinutes} min read</span>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0 space-y-6">
            <div
              className="read-content rounded-2xl border border-os-line-dark bg-os-ink-900 p-6 text-white/72 shadow-os-card md:p-9"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />

            <div className="grid gap-3 md:grid-cols-2">
              {previousRead && (
                <button
                  onClick={() => navigateActiveTab(getReadUrl(previousRead))}
                  className="group rounded-2xl border border-os-line-dark bg-os-ink-900 p-4 text-left transition hover:border-os-line-dark-hover hover:bg-os-ink-800"
                >
                  <div className="mb-2 flex items-center gap-2 text-xs text-white/35">
                    <Icons.ChevronLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
                    Back
                  </div>
                  <p className="line-clamp-2 text-sm font-semibold text-white/80">{previousRead.title}</p>
                </button>
              )}

              {nextRead && (
                <button
                  onClick={() => navigateActiveTab(getReadUrl(nextRead))}
                  className="group rounded-2xl border border-os-line-dark bg-os-ink-900 p-4 text-left transition hover:border-os-line-dark-hover hover:bg-os-ink-800 md:col-start-2"
                >
                  <div className="mb-2 flex items-center justify-end gap-2 text-xs text-white/35">
                    Next
                    <Icons.ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </div>
                  <p className="line-clamp-2 text-right text-sm font-semibold text-white/80">{nextRead.title}</p>
                </button>
              )}
            </div>

            <section className="rounded-2xl border border-os-line-dark bg-os-ink-900 p-6 shadow-os-card md:p-8">
              <div className="mb-5 flex items-center gap-2">
                <Icons.MessageCircle className="h-4 w-4 text-white/45" />
                <h2 className="text-sm font-semibold text-white">Discussion</h2>
              </div>
              <ArticleComments slug={activeRead.slug} />
            </section>
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-2xl border border-os-line-dark bg-os-ink-900 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/35">Read context</p>
              <div className="mt-4 space-y-3 text-sm text-white/55">
                <div className="flex items-center justify-between gap-4">
                  <span>Author</span>
                  <span className="text-white/80">{activeRead.author}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Reading time</span>
                  <span className="text-white/80">{activeRead.readingTimeMinutes} min</span>
                </div>
                {activeRead.source && (
                  <button
                    onClick={() => navigateActiveTab(activeRead.source || 'browser://reads')}
                    className="flex w-full items-center justify-between rounded-xl border border-os-line-dark-hover bg-white/5 px-3 py-2 text-left text-white/75 transition hover:bg-os-ink-700/60"
                  >
                    <span>Source</span>
                    <Icons.ArrowUpRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </article>
    );
  };

  const renderExternal = () => {
    const url = activeTab?.url;
    if (!url) return null;

    if (url.startsWith('mailto:')) {
      return (
        <div className="grid h-full place-items-center bg-os-ink-950 p-8 text-white">
          <div className="max-w-sm rounded-2xl border border-os-line-dark bg-os-ink-900 p-6 text-center">
            <Icons.Mail className="mx-auto mb-3 h-8 w-8 text-white/35" />
            <p className="text-sm text-white/50">Email link â€” opened in your mail client.</p>
          </div>
        </div>
      );
    }

    const isBlocked = (() => {
      try {
        const host = new URL(url).hostname.replace(/^www\./, '');
        return KNOWN_BLOCKED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
      } catch {
        return false;
      }
    })();

    if (isBlocked) {
      let hostname = url;
      try { hostname = new URL(url).hostname.replace(/^www\./, ''); } catch { /* keep raw url */ }
      return (
        <div className="grid h-full place-items-center bg-os-ink-950 p-8 text-white">
          <div className="max-w-sm rounded-2xl border border-os-line-dark bg-os-ink-900 p-8 text-center shadow-os-card">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-os-line-dark-hover bg-white/5">
              <Icons.ExternalLink className="h-7 w-7 text-white/65" />
            </div>
            <h2 className="text-base font-semibold">{hostname}</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              This site doesn't support in-app viewing. Click below to open it in a new browser window.
            </p>
            <button
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
            >
              Open {hostname} <Icons.ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

    return <EmbedFrame url={url} />;
  };

  return (
    <AppShell>
      <div className="flex shrink-0 items-center gap-1 border-b border-os-line-dark bg-os-ink-950 px-2 pt-2">
        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setActiveTabId(tab.id)}
              className={`group flex min-w-[130px] max-w-[220px] items-center gap-2 rounded-t-lg px-3 py-2 text-xs transition ${
                activeTabId === tab.id
                  ? 'bg-os-ink-900 text-white'
                  : 'bg-os-ink-800/35 text-white/45 hover:bg-os-ink-800/70 hover:text-white/75'
              }`}
            >
              {tab.url.startsWith('http') ? (
                <Icons.Globe className="h-3.5 w-3.5 shrink-0 text-fg-brand" />
              ) : tab.url === HOME_URL || tab.url === 'browser://newtab' ? (
                <Icons.Home className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Icons.BookOpen className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="min-w-0 flex-1 truncate text-left">{tab.title}</span>
              {tabs.length > 1 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    closeTab(tab.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') closeTab(tab.id);
                  }}
                  className="rounded p-0.5 opacity-0 transition hover:bg-os-ink-700/60 group-hover:opacity-100"
                >
                  <Icons.X className="h-3 w-3" />
                </span>
              )}
            </motion.button>
          ))}
        </div>
        <button onClick={addNewTab} className="rounded-lg p-1.5 text-white/65 transition hover:bg-os-ink-700/60 hover:text-white" title="New tab">
          <Icons.Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-b border-os-line-dark bg-os-ink-900 px-3 py-2">
        <button onClick={handleBack} disabled={historyIndex <= 0} className="rounded-lg p-1.5 text-white/65 transition hover:bg-os-ink-700/60 disabled:opacity-25">
          <Icons.ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={handleForward} disabled={historyIndex >= history.length - 1} className="rounded-lg p-1.5 text-white/65 transition hover:bg-os-ink-700/60 disabled:opacity-25">
          <Icons.ChevronRight className="h-4 w-4" />
        </button>
        <button onClick={() => navigateActiveTab(HOME_URL)} className="rounded-lg p-1.5 text-white/65 transition hover:bg-os-ink-700/60">
          <Icons.Home className="h-4 w-4" />
        </button>

        <form onSubmit={handleAddressSubmit} className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-os-line-dark bg-os-ink-800 px-3 py-1.5">
          <Icons.Lock className="h-3.5 w-3.5 shrink-0 text-white/30" />
          <input
            name="address"
            defaultValue={activeTab?.url || 'browser://reads'}
            key={activeTab?.url}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            placeholder="Search reads or enter an internal URL"
          />
          {(isLoading || isFetchingReads) && <Icons.Loader2 className="h-3.5 w-3.5 animate-spin text-fg-brand" />}
        </form>

        <button onClick={() => setShowBookmarks((value) => !value)} className="rounded-lg p-1.5 text-white/65 transition hover:bg-os-ink-700/60 hover:text-white">
          <Icons.Bookmark className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {showBookmarks && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden border-b border-os-line-dark bg-os-ink-900"
          >
            <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-4">
              {bookmarks.map((bookmark) => {
                const Icon = bookmark.icon;
                return (
                  <button
                    key={bookmark.name}
                    onClick={() => navigateActiveTab(bookmark.url)}
                    className="flex items-center gap-3 rounded-xl border border-os-line-dark bg-os-ink-800/35 px-3 py-2 text-left transition hover:bg-os-ink-800/75"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-white/55" />
                    <span className="truncate text-sm text-white/70">{bookmark.name}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {activeTab?.url === HOME_URL || activeTab?.url === 'browser://newtab'
          ? renderHomePage()
          : activeTab?.url === 'browser://reads'
          ? renderHome()
          : activeTab && isTagUrl(activeTab.url)
            ? renderTagPage()
            : activeTab && isReadUrl(activeTab.url)
            ? renderArticle()
            : renderExternal()}
      </div>
    </AppShell>
  );
}
