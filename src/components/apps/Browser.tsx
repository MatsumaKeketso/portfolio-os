import { ComponentType, FormEvent, useEffect, useMemo, useState } from 'react';
import * as Icons from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell } from '../ui/AppShell';
import { fetchReads, sanitizeReadHtml } from '../../lib/reads';
import { ReadArticle } from '../../types';

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

interface BrowserProps {
  initialUrl?: string;
}

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
  if (url === 'browser://newtab' || url === 'browser://reads') return 'Reads';
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

function DiscussThread({ read }: { read: ReadArticle }) {
  useEffect(() => {
    const container = document.getElementById('disqus_thread');
    if (!container) return;

    const setDisqusConfig = function (this: any) {
      this.page.url = `https://genstudio.framer.website/blog/${read.slug}`;
      this.page.identifier = read.slug;
      this.page.title = read.title;
    };

    container.innerHTML = '';
    (window as any).disqus_config = setDisqusConfig;

    if ((window as any).DISQUS) {
      (window as any).DISQUS.reset({
        reload: true,
        config: setDisqusConfig,
      });
      return;
    }

    const script = document.createElement('script');
    script.id = 'disqus-embed-script';
    script.src = 'https://https-genstudio-framer-website.disqus.com/embed.js';
    script.async = true;
    script.setAttribute('data-timestamp', String(Date.now()));
    document.body.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [read.slug, read.title]);

  return <div id="disqus_thread" className="min-h-[320px]" />;
}

export function Browser({ initialUrl = 'browser://reads' }: BrowserProps) {
  const [reads, setReads] = useState<ReadArticle[]>([]);
  const [isFetchingReads, setIsFetchingReads] = useState(true);
  const [readError, setReadError] = useState('');
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'tab-1', title: initialUrl === 'browser://newtab' ? 'Reads' : initialUrl, url: initialUrl === 'browser://newtab' ? 'browser://reads' : initialUrl },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const bookmarks: Bookmark[] = [
    { name: 'Reads', url: 'browser://reads', icon: Icons.BookOpen },
    { name: 'Featured', url: reads[0] ? getReadUrl(reads[0]) : 'browser://reads', icon: Icons.Sparkles },
    { name: 'Generative Studio', url: 'https://www.generativestudio.co.za', icon: Icons.ExternalLink },
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
    const nextTab = { id: `tab-${Date.now()}`, title: 'Reads', url: 'browser://reads' };
    setTabs((currentTabs) => [...currentTabs, nextTab]);
    setActiveTabId(nextTab.id);
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

  const renderReadCard = (read: ReadArticle, index: number) => {
    const isLarge = index === 0 || index === 5;
    return (
      <motion.button
        key={read.id}
        onClick={() => navigateActiveTab(getReadUrl(read))}
        className={[
          'group relative min-h-[220px] overflow-hidden rounded-2xl border border-os-line-dark bg-os-ink-900 text-left shadow-os-card',
          'transition-all hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl',
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
          <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-os-ink-900 to-os-ink-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
        <div className="relative z-10 flex h-full flex-col justify-end p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white/70">
              {read.categories[0] || 'Read'}
            </span>
            <span className="text-xs text-white/45">{read.readingTimeMinutes} min</span>
          </div>
          <h3 className={isLarge ? 'text-2xl font-semibold text-white' : 'text-base font-semibold text-white'}>
            {read.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/60">{read.description}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-white/45">
            <span>{read.author}</span>
            <span>{formatDate(read.date)}</span>
          </div>
        </div>
      </motion.button>
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
          <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55">
            <Icons.Database className="h-3.5 w-3.5" />
            Firestore-backed reading shelf
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-white md:text-5xl">
            Reads inside the OS, not outside the experience.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
            Essays, system notes, and startup thinking are loaded from the database and rendered as native OS pages.
          </p>
          <form onSubmit={handleAddressSubmit} className="mt-7 flex max-w-2xl items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] p-2">
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
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
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
          className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/55 transition hover:bg-white/[0.08] hover:text-white"
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
                <span key={category} className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] uppercase tracking-wide text-white/70">
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
                  className="group rounded-2xl border border-os-line-dark bg-os-ink-900 p-4 text-left transition hover:border-white/20 hover:bg-os-ink-800"
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
                  className="group rounded-2xl border border-os-line-dark bg-os-ink-900 p-4 text-left transition hover:border-white/20 hover:bg-os-ink-800 md:col-start-2"
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
                <h2 className="text-sm font-semibold text-white">Discuss</h2>
              </div>
              <DiscussThread read={activeRead} />
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
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-white/75 transition hover:bg-white/10"
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

  const renderExternal = () => (
    <div className="grid h-full place-items-center bg-os-ink-950 p-8 text-white">
      <div className="max-w-lg rounded-2xl border border-os-line-dark bg-os-ink-900 p-6 text-center shadow-os-card">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Icons.ShieldCheck className="h-7 w-7 text-white/65" />
        </div>
        <h2 className="text-xl font-semibold">Controlled browser route</h2>
        <p className="mt-3 text-sm leading-6 text-white/50">
          This OS browser keeps people inside native portfolio content. External URLs are held as references instead of being embedded in fragile iframes.
        </p>
        <div className="mt-5 truncate rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/45">
          {activeTab?.url}
        </div>
      </div>
    </div>
  );

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
                  : 'bg-white/[0.035] text-white/45 hover:bg-white/[0.07] hover:text-white/75'
              }`}
            >
              <Icons.BookOpen className="h-3.5 w-3.5 shrink-0" />
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
                  className="rounded p-0.5 opacity-0 transition hover:bg-white/10 group-hover:opacity-100"
                >
                  <Icons.X className="h-3 w-3" />
                </span>
              )}
            </motion.button>
          ))}
        </div>
        <button onClick={addNewTab} className="rounded-lg p-1.5 text-white/65 transition hover:bg-white/10 hover:text-white" title="New tab">
          <Icons.Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-b border-os-line-dark bg-os-ink-900 px-3 py-2">
        <button onClick={handleBack} disabled={historyIndex <= 0} className="rounded-lg p-1.5 text-white/65 transition hover:bg-white/10 disabled:opacity-25">
          <Icons.ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={handleForward} disabled={historyIndex >= history.length - 1} className="rounded-lg p-1.5 text-white/65 transition hover:bg-white/10 disabled:opacity-25">
          <Icons.ChevronRight className="h-4 w-4" />
        </button>
        <button onClick={() => navigateActiveTab('browser://reads')} className="rounded-lg p-1.5 text-white/65 transition hover:bg-white/10">
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
          {(isLoading || isFetchingReads) && <Icons.Loader2 className="h-3.5 w-3.5 animate-spin text-primary-400" />}
        </form>

        <button onClick={() => setShowBookmarks((value) => !value)} className="rounded-lg p-1.5 text-white/65 transition hover:bg-white/10 hover:text-white">
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
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.035] px-3 py-2 text-left transition hover:bg-white/[0.075]"
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
        {activeTab?.url === 'browser://reads' || activeTab?.url === 'browser://newtab'
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
