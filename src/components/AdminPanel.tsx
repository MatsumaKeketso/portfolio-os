import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { muiIconCatalog, muiIconCategories } from '../lib/muiIconCatalog';
import { AppIcon } from '../lib/AppIcon';
import {
  collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc, getDoc, setDoc,
} from 'firebase/firestore';
import { ref, listAll, getMetadata, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useDesktopStore } from '../store/desktopStore';
import { useUserStore } from '../store/userStore';
import { App } from '../types';
import {
  AppShell,
  AppBody,
  AppSidebar,
  AppContent,
  AppCard,
  appInputClass,
  appSelectClass,
  appTableBodyClass,
  appTableClass,
  appTableHeaderClass,
  appTableRowClass,
} from './ui/AppShell';
import { SystemRow, SystemRowGroup, SystemRowDivider } from './ui/SystemRow';
import { uploadFile, uploadFiles, UploadProgress as UploadProgressType } from '../lib/uploadUtils';
import { UploadProgress } from './UploadProgress';
import { ContextMenu } from './ContextMenu';
import { ContextMenuItemDef, sortAndSeparate } from '../lib/contextMenuRegistry';
import { cn } from '../lib/utils';
import { mergeNewReadsBySlug, parseReadsCsv } from '../lib/reads';
import { useAuthStore } from '../store/authStore';

type AdminTab = 'overview' | 'apps' | 'backgrounds' | 'milestones' | 'reads' | 'feedback' | 'gallery';

interface FeedbackItem {
  id: string;
  name: string;
  message: string;
  timestamp: any;
  status: 'pending' | 'approved' | 'hidden';
}

const TAB_LABELS: Record<AdminTab, string> = {
  overview: 'Overview',
  apps: 'Apps',
  backgrounds: 'Backgrounds',
  milestones: 'Milestones',
  reads: 'Reads',
  feedback: 'Feedback',
  gallery: 'Visitor Gallery',
};

const TAB_ICONS: Record<AdminTab, keyof typeof Icons> = {
  overview: 'LayoutDashboard',
  apps: 'Grid3x3',
  backgrounds: 'Image',
  milestones: 'Calendar',
  reads: 'BookOpen',
  feedback: 'MessageSquare',
  gallery: 'GalleryHorizontal',
};

const MILESTONE_TAGS = [
  'TypeScript', 'JavaScript', 'Python', 'React', 'Next.js', 'Node.js',
  'Firebase', 'GraphQL', 'REST API', 'SQL', 'Figma', 'UI/UX',
  'Frontend', 'Backend', 'Full Stack', 'Mobile', 'AI/ML', 'DevOps',
  'Open Source', 'Design Systems', 'Animation', 'Performance', 'Architecture',
];

export function AdminPanel() {
  const {
    apps, isAdminMode, addApp, removeApp, updateApp, openWindow, exportConfig, importConfig,
    backgrounds, selectedBackgroundId, addBackground, removeBackground, setSelectedBackground,
    adminEditTargetAppId, setAdminEditTarget,
  } = useDesktopStore();
  const { profile, addMilestone, updateMilestone, removeMilestone } = useUserStore();
  const { isAdmin } = useAuthStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [highlightedAppId, setHighlightedAppId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [appContextMenu, setAppContextMenu] = useState<{ x: number; y: number; app: App } | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [quickURL, setQuickURL] = useState('');
  const [bulkURLs, setBulkURLs] = useState('');
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [appPublishStatus, setAppPublishStatus] = useState<{
    state: 'idle' | 'publishing' | 'success' | 'error';
    message: string;
  }>({ state: 'idle', message: '' });
  const [readImportTarget, setReadImportTarget] = useState('reads');
  const [readImportStatus, setReadImportStatus] = useState<{
    state: 'idle' | 'parsing' | 'success' | 'error';
    message: string;
  }>({ state: 'idle', message: '' });

  const [formData, setFormData] = useState<Partial<App>>({
    name: '', icon: 'square', type: 'component', component: '', url: '',
    pinnedToTaskbar: false, pinnedToDesktop: true,
    desktopPosition: { x: 50, y: 50 },
    defaultSize: { width: 800, height: 600 },
    description: '',
    media: [],
  });
  const [iconTab, setIconTab] = useState<'browse' | 'upload'>('browse');
  const [iconSearch, setIconSearch] = useState('');
  const [iconCategory, setIconCategory] = useState('All');
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  // Milestone state
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [milestoneFormData, setMilestoneFormData] = useState({
    title: '', description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'project' as 'achievement' | 'project' | 'education' | 'career' | 'personal' | 'other',
    images: [] as string[],
    links: [] as Array<{ label: string; url: string }>,
    tags: [] as string[],
    featured: false,
  });

  // Feedback state
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'pending' | 'approved' | 'hidden'>('pending');

  // Gallery state
  interface GalleryImage { path: string; url: string; name: string; size: number; timeCreated: string; }
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  useEffect(() => {
    if (adminEditTargetAppId) {
      setActiveTab('apps');
      setHighlightedAppId(adminEditTargetAppId);
      setAdminEditTarget(null);
      setTimeout(() => setHighlightedAppId(null), 2500);
    }
  }, [adminEditTargetAppId, setAdminEditTarget]);

  const loadGalleryImages = async () => {
    setGalleryLoading(true);
    setGalleryError(null);
    try {
      const galleryRef = ref(storage, 'visitor-gallery');
      const result = await listAll(galleryRef);
      const items = await Promise.all(
        result.items.map(async (item) => {
          const [url, meta] = await Promise.all([
            import('firebase/storage').then(({ getDownloadURL }) => getDownloadURL(item)),
            getMetadata(item),
          ]);
          return {
            path: item.fullPath,
            url,
            name: item.name,
            size: meta.size,
            timeCreated: meta.timeCreated,
          };
        })
      );
      items.sort((a, b) => new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime());
      setGalleryImages(items);
    } catch (err: any) {
      setGalleryError(err.message ?? 'Failed to load gallery');
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'gallery') loadGalleryImages();
  }, [activeTab]);

  useEffect(() => {
    const q = query(collection(db, 'os-feedback'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setFeedbackItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as FeedbackItem[]);
    });
    return () => unsub();
  }, []);

  const handleFeedbackStatus = async (id: string, status: 'approved' | 'hidden') => {
    await updateDoc(doc(db, 'os-feedback', id), { status });
  };

  const handleFeedbackDelete = async (id: string) => {
    if (!confirm('Delete this feedback entry permanently?')) return;
    await deleteDoc(doc(db, 'os-feedback', id));
  };


  const resetForm = () => {
    setFormData({ name: '', icon: 'square', type: 'component', component: '', url: '', pinnedToTaskbar: false, pinnedToDesktop: true, desktopPosition: { x: 50, y: 50 }, defaultSize: { width: 800, height: 600 }, description: '', media: [] });
    setEditingApp(null);
    setShowAddForm(false);
    setIconSearch('');
    setIconCategory('All');
    setIconTab('browse');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setAppPublishStatus({ state: 'publishing', message: editingApp ? 'Publishing app update...' : 'Publishing new app...' });

    let result;
    if (editingApp) {
      result = await updateApp(editingApp, formData);
    } else {
      const newApp: App = {
        id: formData.name.toLowerCase().replace(/\s+/g, '-'),
        name: formData.name!, icon: formData.icon || 'square', customIcon: formData.customIcon,
        type: formData.type || 'component', component: formData.component, url: formData.url,
        pinnedToTaskbar: formData.pinnedToTaskbar || false, pinnedToDesktop: formData.pinnedToDesktop !== false,
        desktopPosition: formData.desktopPosition || { x: 50, y: 50 },
        defaultSize: formData.defaultSize || { width: 800, height: 600 },
        description: formData.description || '',
        media: formData.media || [],
      };
      result = await addApp(newApp);
    }

    if (result.success) {
      setAppPublishStatus({ state: 'success', message: editingApp ? 'App update published globally.' : 'App published globally.' });
      resetForm();
    } else {
      setAppPublishStatus({ state: 'error', message: result.error || 'App publish failed.' });
    }
  };

  const handleEdit = (app: App) => { setFormData({ ...app, media: app.media || [] }); setEditingApp(app.id); setShowAddForm(true); };

  const handleExport = () => {
    const config = exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'GenOS-config.json'; a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        setAppPublishStatus({ state: 'publishing', message: 'Publishing imported app config...' });
        const result = await importConfig(ev.target?.result as string);
        setAppPublishStatus(result.success
          ? { state: 'success', message: 'Imported app config published globally.' }
          : { state: 'error', message: result.error || 'Import failed.' });
      };
      reader.readAsText(file);
    }
  };

  const extractAppNameFromURL = (url: string): string => {
    try { const h = new URL(url).hostname.replace('www.', '').split('.')[0]; return h.charAt(0).toUpperCase() + h.slice(1); } catch { return 'New App'; }
  };

  const handleQuickAdd = async () => {
    if (!quickURL.trim()) return;
    let url = quickURL.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    const appName = extractAppNameFromURL(url);
    setAppPublishStatus({ state: 'publishing', message: 'Publishing quick app...' });
    const result = await addApp({ id: `${appName.toLowerCase()}-${Date.now()}`, name: appName, icon: 'globe', type: 'iframe', url, pinnedToTaskbar: true, pinnedToDesktop: true, desktopPosition: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 }, defaultSize: { width: 1000, height: 700 }, description: `Iframe: ${url}` });
    if (result.success) {
      setAppPublishStatus({ state: 'success', message: 'Quick app published globally.' });
      setQuickURL(''); setShowQuickAdd(false);
    } else {
      setAppPublishStatus({ state: 'error', message: result.error || 'Quick app publish failed.' });
    }
  };

  const handleBulkImport = async () => {
    if (!bulkURLs.trim()) return;
    const newApps: App[] = bulkURLs.split('\n').filter(l => l.trim()).map((line, i) => {
      const parts = line.split('|').map(p => p.trim());
      let url = parts[0]; const name = parts[1] || extractAppNameFromURL(url); const icon = parts[2] || 'globe';
      if (!url.startsWith('http')) url = 'https://' + url;
      return { id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${i}`, name, icon, type: 'iframe', url, pinnedToTaskbar: true, pinnedToDesktop: true, desktopPosition: { x: 50 + i * 30, y: 50 + i * 30 }, defaultSize: { width: 1000, height: 700 }, description: `Iframe: ${url}` };
    });

    setAppPublishStatus({ state: 'publishing', message: `Publishing ${newApps.length} apps...` });
    const result = await importConfig(JSON.stringify([...apps, ...newApps]));
    if (result.success) {
      setAppPublishStatus({ state: 'success', message: `${newApps.length} apps published globally.` });
      setBulkURLs(''); setShowBulkImport(false);
    } else {
      setAppPublishStatus({ state: 'error', message: result.error || 'Bulk app publish failed.' });
    }
  };

  const handleURLPreview = (url: string) => {
    if (!url.trim()) return;
    let u = url.trim();
    if (!u.startsWith('http')) u = 'https://' + u;
    setPreviewURL(u);
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploading(true); setUploadProgress([]);
    try {
      const results = await uploadFiles(Array.from(files), { folder: 'backgrounds', maxSizeMB: 10, allowedTypes: ['image/*'], onProgress: (p) => setUploadProgress((prev) => { const idx = prev.findIndex(x => x.fileName === p.fileName); if (idx >= 0) { const u = [...prev]; u[idx] = p; return u; } return [...prev, p]; }) });
      results.forEach((r) => { if (r.url && !r.error) addBackground({ id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, name: r.fileName.replace(/\.[^/.]+$/, ''), url: r.url, thumbnail: r.url }); });
    } catch (err) { console.error(err); } finally { setIsUploading(false); e.target.value = ''; }
  };

  const handleAppMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploading(true);
    setUploadProgress([]);
    try {
      for (const file of Array.from(files)) {
        const result = await uploadFile(file, {
          folder: 'app-media',
          maxSizeMB: 25,
          allowedTypes: ['image/*', 'video/*'],
          onProgress: (p) => setUploadProgress((prev) => {
            const idx = prev.findIndex((x) => x.fileName === p.fileName);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = p;
              return next;
            }
            return [...prev, p];
          }),
        });

        if (result.url && !result.error) {
          setFormData((prev) => ({
            ...prev,
            media: [
              ...(prev.media || []),
              {
                id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                url: result.url,
                type: file.type.startsWith('video/') ? 'video' : 'image',
                name: file.name,
              },
            ],
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleIconImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingIcon(true);
    try {
      const result = await uploadFile(file, {
        folder: 'app-icons',
        maxSizeMB: 2,
        allowedTypes: ['image/*'],
        onProgress: () => {},
      });
      if (result.url && !result.error) {
        setFormData(prev => ({ ...prev, customIcon: result.url }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingIcon(false);
      e.target.value = '';
    }
  };

  const handleReadsCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAdmin) {
      setReadImportStatus({
        state: 'error',
        message: 'Sign in as the superuser before importing reads.',
      });
      e.target.value = '';
      return;
    }

    const targetDocument = readImportTarget.trim() || 'reads';
    setReadImportStatus({ state: 'parsing', message: `Reading ${file.name}...` });

    try {
      const csvText = await file.text();
      const importedReads = parseReadsCsv(csvText);
      if (importedReads.length === 0) {
        setReadImportStatus({
          state: 'error',
          message: 'No valid reads were found. The CSV must include Slug and Title columns.',
        });
        return;
      }

      const contentRef = doc(db, 'os-site_content', targetDocument);
      const docSnap = await getDoc(contentRef);
      const existingReads = docSnap.exists() && Array.isArray(docSnap.data().data)
        ? docSnap.data().data
        : [];
      const { mergedReads, newReads, duplicateCount } = mergeNewReadsBySlug(existingReads, importedReads);

      if (newReads.length === 0) {
        setReadImportStatus({
          state: 'success',
          message: `No new reads added. ${duplicateCount} ${duplicateCount === 1 ? 'read already exists' : 'reads already exist'} in ${targetDocument}.`,
        });
        return;
      }

      await setDoc(contentRef, {
        data: mergedReads,
        updated_at: new Date().toISOString(),
        last_import: {
          fileName: file.name,
          importedCount: importedReads.length,
          addedCount: newReads.length,
          duplicateCount,
          importedAt: new Date().toISOString(),
        },
      }, { merge: true });

      setReadImportStatus({
        state: 'success',
        message: `Added ${newReads.length} new ${newReads.length === 1 ? 'read' : 'reads'} to ${targetDocument}. ${duplicateCount} already existed.`,
      });
    } catch (err: any) {
      setReadImportStatus({
        state: 'error',
        message: err.message || 'CSV import failed.',
      });
    } finally {
      e.target.value = '';
    }
  };

  if (!isAdminMode) return null;

  const pendingCount = feedbackItems.filter(f => f.status === 'pending').length;
  const filteredFeedback = feedbackFilter === 'all' ? feedbackItems : feedbackItems.filter(f => f.status === feedbackFilter);

  // ── MUI icon filter (for the app form panel) ────────────────────────────────
  const _allMuiNames = Object.keys(muiIconCatalog);
  const filteredMuiIcons = (iconCategory === 'All'
    ? _allMuiNames
    : muiIconCategories.find(c => c.label === iconCategory)?.names ?? _allMuiNames
  ).filter(n => !iconSearch || n.toLowerCase().includes(iconSearch.toLowerCase()));

  // ── Stats for overview ──────────────────────────────────────────────────────
  const stats = [
    { label: 'Apps', value: apps.length, icon: 'Grid3x3' as keyof typeof Icons },
    { label: 'Milestones', value: profile.milestones.length, icon: 'Calendar' as keyof typeof Icons },
    { label: 'Backgrounds', value: backgrounds.length, icon: 'Image' as keyof typeof Icons },
    { label: 'Pending Feedback', value: pendingCount, icon: 'MessageSquare' as keyof typeof Icons },
  ];

  return (
    <>
      <AppShell className="bg-background-chrome text-os-text-inverse">
        <AppBody>
          {/* Sidebar */}
          <AppSidebar>
            <SystemRowGroup context="chrome">Admin</SystemRowGroup>
            {(['overview', 'apps', 'backgrounds', 'milestones', 'reads', 'feedback', 'gallery'] as AdminTab[]).map((tab) => {
              const IconComp = Icons[TAB_ICONS[tab]] as React.ComponentType<{ className?: string }>;
              const isActive = activeTab === tab;
              return (
                <div key={tab} className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="admin-sidebar-active"
                      className="absolute left-0 top-1 bottom-1 z-10 w-[3px] rounded-r-full bg-primary-400"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <SystemRow
                    label={TAB_LABELS[tab]}
                    icon={<IconComp className={cn('w-4 h-4 transition-colors', isActive ? 'text-primary-400' : 'text-white/40')} />}
                    context="chrome"
                    selected={isActive}
                    accentRail={false}
                    className={cn(
                      'transition-all duration-200',
                      isActive ? 'bg-os-ink-800 text-white' : 'text-white/60 hover:bg-os-ink-800/60',
                    )}
                    onClick={() => setActiveTab(tab)}
                    badge={tab === 'feedback' && pendingCount > 0 ? String(pendingCount) : undefined}
                  />
                </div>
              );
            })}

            <SystemRowDivider context="chrome" className="mt-auto" />

            {/* Config actions */}
            <div className="px-3 py-2 space-y-1">
              <button onClick={handleExport} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-white/50 hover:text-white/85 hover:bg-os-ink-900 rounded transition-colors">
                <Icons.Download className="w-3.5 h-3.5" /> Export Config
              </button>
              <label className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-white/50 hover:text-white/85 hover:bg-os-ink-900 rounded transition-colors cursor-pointer">
                <Icons.Upload className="w-3.5 h-3.5" /> Import Config
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </AppSidebar>

          {/* Content */}
          <AppContent className="bg-background-chrome text-os-text-inverse">
            {/* Upload progress banner */}
            {uploadProgress.length > 0 && (
                <div className="p-4 border-b border-os-line-dark">
                <UploadProgress uploads={uploadProgress} onClose={() => setUploadProgress([])} />
              </div>
            )}

            {/* ── Overview ────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-os-text-inverse mb-1">Dashboard</h2>
                  <p className="text-xs text-os-text-inverse/35">GenOS admin console — manage apps, content, and moderation.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {stats.map(({ label, value, icon }) => {
                    const IconComp = Icons[icon] as React.ComponentType<{ className?: string }>;
                    return (
                      <AppCard key={label} className="p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-os-ink-900 border border-os-line-dark flex items-center justify-center flex-shrink-0">
                          <IconComp className="w-4 h-4 text-os-text-inverse/60" />
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-os-text-inverse">{value}</p>
                          <p className="text-xs text-os-text-inverse/35">{label}</p>
                        </div>
                      </AppCard>
                    );
                  })}
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-3">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Manage Apps', tab: 'apps' as AdminTab, icon: 'Grid3x3' as keyof typeof Icons },
                      { label: 'Add Milestone', tab: 'milestones' as AdminTab, icon: 'Plus' as keyof typeof Icons },
                      { label: 'Import Reads', tab: 'reads' as AdminTab, icon: 'BookOpen' as keyof typeof Icons },
                      { label: 'Review Feedback', tab: 'feedback' as AdminTab, icon: 'MessageSquare' as keyof typeof Icons, badge: pendingCount },
                      { label: 'Upload Background', tab: 'backgrounds' as AdminTab, icon: 'Image' as keyof typeof Icons },
                    ].map(({ label, tab, icon, badge }) => {
                      const IconComp = Icons[icon] as React.ComponentType<{ className?: string }>;
                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-os-ink-900 hover:bg-os-ink-800 border border-os-line-dark hover:border-os-line-dark transition-all text-left"
                        >
                          <IconComp className="w-3.5 h-3.5 text-os-text-inverse/60 shrink-0" />
                          <span className="text-xs text-os-text-inverse flex-1">{label}</span>
                          {badge ? <span className="text-[10px] bg-primary-500/15 text-primary-400 px-1.5 py-0.5 rounded-full">{badge}</span> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Apps ────────────────────────────────────────────────── */}
            {activeTab === 'apps' && (
              <div className="flex flex-col h-full">
                {/* Header bar */}
                <div className="flex items-center gap-2 px-5 py-3 shrink-0 border-b border-os-line-dark">
                  <h2 className="text-sm font-semibold text-os-text-inverse flex-1">Apps <span className="text-os-text-inverse/35 font-normal">({apps.length})</span></h2>
                  <button onClick={() => { setShowQuickAdd(!showQuickAdd); setShowAddForm(false); setShowBulkImport(false); }} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-colors', showQuickAdd ? 'bg-os-ink-800 border-primary-500/40 text-os-text-inverse' : 'bg-os-ink-900 border-os-line-dark text-os-text-inverse/60 hover:text-os-text-inverse hover:bg-os-ink-800')}>
                    <Icons.Zap className="w-3.5 h-3.5" /> Quick Add
                  </button>
                  <button onClick={() => { setShowBulkImport(!showBulkImport); setShowAddForm(false); setShowQuickAdd(false); }} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-colors', showBulkImport ? 'bg-os-ink-800 border-primary-500/40 text-os-text-inverse' : 'bg-os-ink-900 border-os-line-dark text-os-text-inverse/60 hover:text-os-text-inverse hover:bg-os-ink-800')}>
                    <Icons.Package className="w-3.5 h-3.5" /> Bulk
                  </button>
                  <button onClick={() => { if (showAddForm) { resetForm(); } else { setShowAddForm(true); setShowQuickAdd(false); setShowBulkImport(false); } }} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-colors', showAddForm ? 'bg-os-ink-800 border-primary-500/40 text-os-text-inverse' : 'bg-os-ink-900 border-os-line-dark text-os-text-inverse/60 hover:text-os-text-inverse hover:bg-os-ink-800')}>
                    <Icons.Plus className="w-3.5 h-3.5" /> {editingApp ? 'Editing' : 'Add App'}
                  </button>
                </div>

                {/* Status strip */}
                {appPublishStatus.message && (
                  <div className={cn(
                    'px-5 py-2 shrink-0 text-xs border-b border-os-line-dark',
                    appPublishStatus.state === 'success'
                      ? 'bg-green-500/10 text-green-200/80'
                      : appPublishStatus.state === 'error'
                        ? 'bg-red-500/10 text-red-200/80'
                        : 'bg-os-ink-900 text-os-text-inverse/50'
                  )}>
                    {appPublishStatus.message}
                  </div>
                )}

                {/* Body: scrollable table left + slide-out form right */}
                <div className="flex-1 flex min-h-0 overflow-hidden">
                  {/* Left column */}
                  <div className="flex-1 overflow-y-auto min-w-0">
                    <AnimatePresence>
                      {showQuickAdd && (
                        <motion.div key="quick-add" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="p-4 pb-0">
                            <AppCard className="p-4 space-y-3">
                              <h3 className="text-xs font-semibold text-os-text-inverse/60 flex items-center gap-2"><Icons.Zap className="w-3.5 h-3.5" /> Quick Add from URL</h3>
                              <input type="text" value={quickURL} onChange={(e) => setQuickURL(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()} placeholder="https://example.com" autoFocus className={cn(appInputClass, 'px-3 py-2 text-sm w-full')} />
                              <div className="flex gap-2">
                                <button onClick={handleQuickAdd} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-os-ink-900 hover:bg-os-ink-800 border border-os-line-dark text-xs text-os-text-inverse transition-colors"><Icons.Plus className="w-3.5 h-3.5" /> Add App</button>
                                {quickURL && <button onClick={() => handleURLPreview(quickURL)} className="px-3 py-2 rounded bg-os-ink-900 hover:bg-os-ink-800 border border-os-line-dark text-xs text-os-text-inverse/60 transition-colors"><Icons.Eye className="w-3.5 h-3.5" /></button>}
                              </div>
                            </AppCard>
                          </div>
                        </motion.div>
                      )}

                      {showBulkImport && (
                        <motion.div key="bulk-import" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="p-4 pb-0">
                            <AppCard className="p-4 space-y-3">
                              <h3 className="text-xs font-semibold text-os-text-inverse/60 flex items-center gap-2"><Icons.Package className="w-3.5 h-3.5" /> Bulk Import</h3>
                              <p className="text-xs text-os-text-inverse/35">One URL per line. Format: <code className="bg-os-ink-800 px-1 rounded">URL | Name | Icon</code></p>
                              <textarea value={bulkURLs} onChange={(e) => setBulkURLs(e.target.value)} rows={5} placeholder={"https://example.com\nhttps://site.com | My App | globe"} className={cn(appInputClass, 'px-3 py-2 text-xs w-full resize-none font-mono')} />
                              <button onClick={handleBulkImport} className="flex items-center gap-2 px-3 py-2 rounded bg-os-ink-900 hover:bg-os-ink-800 border border-os-line-dark text-xs text-os-text-inverse transition-colors"><Icons.Package className="w-3.5 h-3.5" /> Import All</button>
                            </AppCard>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* App table */}
                    <div className="p-4">
                      <div className={appTableClass}>
                        <div className={cn(appTableHeaderClass, 'grid-cols-12')}>
                          <div className="col-span-4">Name</div>
                          <div className="col-span-2">Type</div>
                          <div className="col-span-2">Taskbar</div>
                          <div className="col-span-2">Desktop</div>
                          <div className="col-span-2">Actions</div>
                        </div>
                        <div className={appTableBodyClass}>
                          {apps.map((app) => (
                            <div key={app.id} className={cn(appTableRowClass, 'grid-cols-12 group', highlightedAppId === app.id && 'bg-primary-500/15 ring-1 ring-inset ring-primary-500/30')} onContextMenu={(e) => { e.preventDefault(); setAppContextMenu({ x: e.clientX, y: e.clientY, app }); }}>
                              <div className="col-span-4 flex items-center gap-2 min-w-0">
                                <AppIcon icon={app.icon} customIcon={app.customIcon} className="w-4 h-4 text-os-text-inverse/35 flex-shrink-0" />
                                <span className="text-sm text-os-text-inverse truncate">{app.name}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-[10px] px-1.5 py-0.5 bg-os-ink-900 text-os-text-inverse/60 rounded">{app.type}</span>
                              </div>
                              <div className="col-span-2">
                                {app.pinnedToTaskbar ? <Icons.Check className="w-3.5 h-3.5 text-green-400" /> : <Icons.Minus className="w-3.5 h-3.5 text-os-text-inverse/25" />}
                              </div>
                              <div className="col-span-2">
                                {app.pinnedToDesktop ? <Icons.Check className="w-3.5 h-3.5 text-green-400" /> : <Icons.Minus className="w-3.5 h-3.5 text-os-text-inverse/25" />}
                              </div>
                              <div className="col-span-2 flex gap-1">
                                <button onClick={() => handleEdit(app)} className="p-1.5 rounded hover:bg-os-ink-900 text-os-text-inverse/35 hover:text-os-text-inverse transition-colors" title="Edit"><Icons.Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={async () => {
                                  setAppPublishStatus({ state: 'publishing', message: `Removing ${app.name} globally...` });
                                  const result = await removeApp(app.id);
                                  setAppPublishStatus(result.success
                                    ? { state: 'success', message: `${app.name} removed globally.` }
                                    : { state: 'error', message: result.error || 'Remove failed.' });
                                }} className="p-1.5 rounded hover:bg-red-500/10 text-os-text-inverse/35 hover:text-red-400 transition-colors" title="Delete"><Icons.Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: slide-out form panel */}
                  <AnimatePresence>
                    {showAddForm && (
                      <motion.div
                        key="app-form-panel"
                        initial={{ width: 0 }}
                        animate={{ width: 380 }}
                        exit={{ width: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="shrink-0 overflow-hidden border-l border-os-line-dark"
                      >
                        <div className="w-[380px] h-full overflow-y-auto p-5">
                          <h3 className="text-xs font-semibold text-os-text-inverse/60 mb-4">{editingApp ? 'Edit App' : 'New App'}</h3>
                          <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">Name *</label>
                              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="My App" required className={cn(appInputClass, 'px-3 py-2 text-sm w-full')} />
                            </div>

                            {/* Icon */}
                            <div>
                              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-2">Icon</label>

                              {/* Preview + mode tabs */}
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-9 h-9 rounded-lg bg-os-ink-900 border border-os-line-dark flex items-center justify-center flex-shrink-0">
                                  <AppIcon icon={formData.icon || 'square'} customIcon={formData.customIcon} className="w-5 h-5 text-white/70" />
                                </div>
                                <div className="flex gap-1 rounded bg-os-ink-900 border border-os-line-dark p-0.5">
                                  <button type="button" onClick={() => setIconTab('browse')} className={cn('px-2.5 py-1 text-[11px] rounded transition-colors', iconTab === 'browse' ? 'bg-os-ink-700 text-os-text-inverse' : 'text-os-text-inverse/40 hover:text-os-text-inverse/70')}>Browse</button>
                                  <button type="button" onClick={() => setIconTab('upload')} className={cn('px-2.5 py-1 text-[11px] rounded transition-colors', iconTab === 'upload' ? 'bg-os-ink-700 text-os-text-inverse' : 'text-os-text-inverse/40 hover:text-os-text-inverse/70')}>Upload Image</button>
                                </div>
                                {(formData.customIcon || (formData.icon || '').startsWith('mui:')) && (
                                  <button type="button" onClick={() => setFormData({ ...formData, icon: 'square', customIcon: undefined })} className="ml-auto text-[11px] text-red-400/60 hover:text-red-400 transition-colors">Clear</button>
                                )}
                              </div>

                              {iconTab === 'browse' && (
                                <div className="space-y-2">
                                  <div className="flex gap-2">
                                    <select value={iconCategory} onChange={e => setIconCategory(e.target.value)} className={cn(appSelectClass, 'px-2 py-1.5 text-xs flex-none w-32')}>
                                      <option value="All">All</option>
                                      {muiIconCategories.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                                    </select>
                                    <input value={iconSearch} onChange={e => setIconSearch(e.target.value)} placeholder="Search icons…" className={cn(appInputClass, 'px-2.5 py-1.5 text-xs flex-1')} />
                                  </div>
                                  <div className="grid grid-cols-8 gap-0.5 max-h-44 overflow-y-auto rounded border border-os-line-dark bg-os-ink-900 p-1.5">
                                    {filteredMuiIcons.length === 0 && (
                                      <div className="col-span-8 py-4 text-center text-[11px] text-os-text-inverse/30">No icons match</div>
                                    )}
                                    {filteredMuiIcons.map(name => {
                                      const selected = formData.icon === `mui:${name}`;
                                      return (
                                        <button key={name} type="button" title={name}
                                          onClick={() => setFormData({ ...formData, icon: `mui:${name}`, customIcon: undefined })}
                                          className={cn('p-1.5 rounded flex items-center justify-center transition-colors',
                                            selected ? 'bg-primary-500/20 text-primary-400' : 'text-os-text-inverse/50 hover:bg-os-ink-800 hover:text-os-text-inverse/80'
                                          )}>
                                          <AppIcon icon={`mui:${name}`} className="h-4 w-4" />
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {formData.icon?.startsWith('mui:') && (
                                    <p className="text-[10px] text-os-text-inverse/30">Selected: {formData.icon.slice(4)}</p>
                                  )}
                                </div>
                              )}

                              {iconTab === 'upload' && (
                                <label className={cn('flex flex-col items-center justify-center gap-1.5 py-5 rounded-lg border border-dashed transition-all', isUploadingIcon ? 'opacity-50 cursor-not-allowed border-os-line-dark' : 'cursor-pointer border-os-line-dark hover:border-primary-500/40 hover:bg-os-ink-900/60')}>
                                  {isUploadingIcon ? <Icons.Loader2 className="w-5 h-5 text-os-text-inverse/40 animate-spin" /> : <Icons.Upload className="w-5 h-5 text-os-text-inverse/30" />}
                                  <span className="text-xs text-os-text-inverse/40">{formData.customIcon ? 'Replace icon image' : 'Upload icon image'}</span>
                                  <span className="text-[10px] text-os-text-inverse/25">PNG, JPG, WebP, SVG · max 2 MB</span>
                                  <input type="file" accept="image/*" onChange={handleIconImageUpload} className="hidden" disabled={isUploadingIcon} />
                                </label>
                              )}
                            </div>

                            {/* Type */}
                            <div>
                              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">Type</label>
                              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className={cn(appSelectClass, 'px-3 py-2 text-sm w-full')}>
                                <option value="component">React Component</option>
                                <option value="iframe">Embedded Site (iframe)</option>
                                <option value="link">External Link (new tab)</option>
                                <option value="static">Static Content</option>
                              </select>
                              {formData.type === 'link' && (
                                <p className="mt-1 text-[10px] text-os-text-inverse/30">Opens the URL in a new browser tab — no window is created.</p>
                              )}
                            </div>

                            {formData.type === 'component' && (
                              <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">Component Name</label>
                                <input type="text" value={formData.component} onChange={(e) => setFormData({ ...formData, component: e.target.value })} placeholder="MyComponent" className={cn(appInputClass, 'px-3 py-2 text-sm w-full')} />
                              </div>
                            )}

                            {(formData.type === 'iframe' || formData.type === 'link') && (
                              <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">URL *</label>
                                <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://example.com" required className={cn(appInputClass, 'px-3 py-2 text-sm w-full')} />
                              </div>
                            )}

                            {/* Description */}
                            <div>
                              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">Description</label>
                              <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" className={cn(appInputClass, 'px-3 py-2 text-sm w-full')} />
                            </div>

                            {/* Pin toggles */}
                            <div className="flex gap-5">
                              <label className="flex items-center gap-2 text-xs text-os-text-inverse/60 cursor-pointer select-none">
                                <input type="checkbox" checked={formData.pinnedToTaskbar} onChange={(e) => setFormData({ ...formData, pinnedToTaskbar: e.target.checked })} className="w-3.5 h-3.5 accent-[var(--color-bg-accent)]" />
                                Pin to Taskbar
                              </label>
                              <label className="flex items-center gap-2 text-xs text-os-text-inverse/60 cursor-pointer select-none">
                                <input type="checkbox" checked={formData.pinnedToDesktop} onChange={(e) => setFormData({ ...formData, pinnedToDesktop: e.target.checked })} className="w-3.5 h-3.5 accent-[var(--color-bg-accent)]" />
                                Pin to Desktop
                              </label>
                            </div>

                            {/* Window size */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">Width (px)</label>
                                <input type="number" value={formData.defaultSize?.width} onChange={(e) => setFormData({ ...formData, defaultSize: { width: parseInt(e.target.value) || 800, height: formData.defaultSize?.height ?? 600 } })} min={300} className={cn(appInputClass, 'px-3 py-2 text-sm w-full')} />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">Height (px)</label>
                                <input type="number" value={formData.defaultSize?.height} onChange={(e) => setFormData({ ...formData, defaultSize: { width: formData.defaultSize?.width ?? 800, height: parseInt(e.target.value) || 600 } })} min={200} className={cn(appInputClass, 'px-3 py-2 text-sm w-full')} />
                              </div>
                            </div>

                            {/* Preview Media */}
                            <div>
                              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1">Preview Media</label>
                              <p className="text-[11px] text-os-text-inverse/30 mb-2">Screenshots and videos shown on desktop hover.</p>
                              <label className={cn('flex flex-col items-center justify-center gap-1.5 py-5 rounded-lg border border-dashed transition-all', isUploading ? 'opacity-50 cursor-not-allowed border-os-line-dark' : 'cursor-pointer border-os-line-dark hover:border-primary-500/40 hover:bg-os-ink-900/60')}>
                                {isUploading ? <Icons.Loader2 className="w-5 h-5 text-os-text-inverse/40 animate-spin" /> : <Icons.Upload className="w-5 h-5 text-os-text-inverse/30" />}
                                <span className="text-xs text-os-text-inverse/40">Click to upload screenshots or video</span>
                                <span className="text-[10px] text-os-text-inverse/25">PNG, JPG, WebP, MP4 · max 25 MB each</span>
                                <input type="file" accept="image/*,video/*" multiple onChange={handleAppMediaUpload} className="hidden" disabled={isUploading} />
                              </label>
                              {(formData.media?.length || 0) > 0 && (
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                  {formData.media?.map((item) => (
                                    <div key={item.id} className="group relative overflow-hidden rounded border border-os-line-dark bg-os-ink-900">
                                      {item.type === 'video' ? (
                                        <video src={item.url} muted playsInline className="aspect-video w-full object-cover" />
                                      ) : (
                                        <img src={item.url} alt={item.name || ''} className="aspect-video w-full object-cover" />
                                      )}
                                      <button type="button" onClick={() => setFormData((prev) => ({ ...prev, media: (prev.media || []).filter((m) => m.id !== item.id) }))} className="absolute right-1 top-1 rounded bg-black/60 p-0.5 text-white/60 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100">
                                        <Icons.X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                              <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded bg-os-ink-800 hover:bg-os-ink-700 border border-os-line-dark text-sm font-medium text-os-text-inverse transition-colors">
                                {editingApp ? <><Icons.Save className="w-3.5 h-3.5" /> Update</> : <><Icons.Plus className="w-3.5 h-3.5" /> Create</>}
                              </button>
                              <button type="button" onClick={resetForm} className="px-4 py-2 rounded bg-os-ink-900 hover:bg-os-ink-800 border border-os-line-dark text-sm text-os-text-inverse/60 transition-colors">Cancel</button>
                            </div>
                          </form>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ── Backgrounds ─────────────────────────────────────────── */}
            {activeTab === 'backgrounds' && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-os-text-inverse">Backgrounds <span className="text-os-text-inverse/35 font-normal">({backgrounds.length})</span></h2>
                </div>

                <label className={cn('flex items-center justify-center gap-2 px-4 py-4 rounded-lg border border-dashed border-os-line-dark text-sm text-os-text-inverse/60 transition-all', isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary-500/40 hover:text-os-text-inverse hover:bg-os-ink-900')}>
                  {isUploading ? <><Icons.Loader className="w-4 h-4 animate-spin" /> Uploading…</> : <><Icons.Upload className="w-4 h-4" /> Upload background images (JPG, PNG, WebP)</>}
                  <input type="file" accept="image/*" multiple onChange={handleBackgroundUpload} className="hidden" disabled={isUploading} />
                </label>

                {backgrounds.length === 0 ? (
                  <div className="text-center py-16 text-os-text-inverse/25">
                    <Icons.Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No backgrounds yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {backgrounds.map((bg) => {
                      const isSelected = selectedBackgroundId === bg.id;
                      const isDefault = bg.id.startsWith('default-');
                      const isGradient = bg.url.startsWith('linear-gradient');
                      return (
                        <div key={bg.id} onClick={() => setSelectedBackground(bg.id)} className={cn('relative rounded-lg overflow-hidden border transition-all cursor-pointer group bg-background-chrome-raised', isSelected ? 'border-primary-500/40' : 'border-os-line-dark hover:border-os-line-dark')}>
                          <div className="w-full h-36" style={{ background: isGradient ? bg.url : 'transparent', backgroundImage: !isGradient ? `url(${bg.url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                          <div className="p-2.5 border-t border-os-line-dark bg-background-chrome-raised flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-os-text-inverse truncate">{bg.name}</p>
                              {isDefault && <p className="text-[10px] text-os-text-inverse/35">Built-in</p>}
                            </div>
                            {isSelected && <Icons.Check className="w-4 h-4 text-primary-400 flex-shrink-0" />}
                          </div>
                          {!isDefault && (
                            <button onClick={(e) => { e.stopPropagation(); removeBackground(bg.id); }} className="absolute top-2 right-2 p-1 rounded bg-background-floating hover:bg-red-500/10 text-os-text-inverse/60 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                              <Icons.Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Milestones ───────────────────────────────────────────── */}
            {activeTab === 'milestones' && (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-os-text-inverse flex-1">Milestones <span className="text-os-text-inverse/35 font-normal">({profile.milestones.length})</span></h2>
                  <button onClick={() => { setShowMilestoneForm(!showMilestoneForm); setEditingMilestone(null); setMilestoneFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0], category: 'project', images: [], links: [], tags: [], featured: false }); }} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-colors', showMilestoneForm ? 'bg-os-ink-800 border-os-line-dark text-os-text-inverse' : 'bg-os-ink-900 border-os-line-dark text-os-text-inverse/60 hover:text-os-text-inverse hover:bg-os-ink-800')}>
                    <Icons.Plus className="w-3.5 h-3.5" /> Add Milestone
                  </button>
                </div>

                <AnimatePresence>
                  {showMilestoneForm && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <AppCard className="p-4">
                        <h3 className="text-xs font-semibold text-os-text-inverse/60 mb-4 flex items-center gap-2"><Icons.Star className="w-3.5 h-3.5" />{editingMilestone ? 'Edit Milestone' : 'New Milestone'}</h3>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (!milestoneFormData.title) return;
                          if (editingMilestone) updateMilestone(editingMilestone, milestoneFormData);
                          else addMilestone(milestoneFormData);
                          setShowMilestoneForm(false); setEditingMilestone(null);
                          setMilestoneFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0], category: 'project', images: [], links: [], tags: [], featured: false });
                        }} className="space-y-3">
                          <div className="grid grid-cols-[1fr_auto] gap-3">
                            <div>
                              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">Title *</label>
                              <input type="text" value={milestoneFormData.title} onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })} placeholder="Milestone title" required className={cn(appInputClass, 'px-3 py-2 text-sm w-full')} />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">Date *</label>
                              <input type="date" value={milestoneFormData.date} onChange={(e) => setMilestoneFormData({ ...milestoneFormData, date: e.target.value })} required className={cn(appInputClass, 'px-3 py-2 text-sm')} />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">Category</label>
                            <select value={milestoneFormData.category} onChange={(e) => setMilestoneFormData({ ...milestoneFormData, category: e.target.value as any })} className={cn(appSelectClass, 'px-3 py-2 text-sm w-full')}>
                              <option value="project">Project</option>
                              <option value="achievement">Achievement</option>
                              <option value="education">Education</option>
                              <option value="career">Career</option>
                              <option value="personal">Personal</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">Description</label>
                            <textarea value={milestoneFormData.description} onChange={(e) => setMilestoneFormData({ ...milestoneFormData, description: e.target.value })} placeholder="Describe this milestone…" rows={3} className={cn(appInputClass, 'px-3 py-2 text-sm w-full resize-none')} />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35">Tags</label>
                              {milestoneFormData.tags.length > 0 && (
                                <button type="button" onClick={() => setMilestoneFormData(prev => ({ ...prev, tags: [] }))} className="text-[10px] text-os-text-inverse/35 hover:text-os-text-inverse/60 transition-colors">Clear</button>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {MILESTONE_TAGS.map(tag => {
                                const active = milestoneFormData.tags.includes(tag);
                                return (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setMilestoneFormData(prev => ({
                                      ...prev,
                                      tags: active ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
                                    }))}
                                    className={cn(
                                      'px-2 py-0.5 rounded text-[11px] border transition-colors',
                                      active
                                        ? 'bg-primary-500/15 border-primary-500/40 text-primary-400'
                                        : 'bg-os-ink-900 border-os-line-dark text-os-text-inverse/35 hover:bg-os-ink-800 hover:text-os-text-inverse/60',
                                    )}
                                  >
                                    {tag}
                                  </button>
                                );
                              })}
                            </div>
                            <input
                              type="text"
                              placeholder="Custom tag, press Enter"
                              className={cn(appInputClass, 'px-3 py-1.5 text-xs w-full')}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const val = (e.target as HTMLInputElement).value.trim();
                                  if (val && !milestoneFormData.tags.includes(val)) {
                                    setMilestoneFormData(prev => ({ ...prev, tags: [...prev.tags, val] }));
                                  }
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }}
                            />
                          </div>

                          {/* Images */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35">Images</label>
                              <label className="flex items-center gap-1 text-[10px] text-os-text-inverse/35 hover:text-os-text-inverse/60 cursor-pointer transition-colors">
                                <Icons.Upload className="w-3 h-3" /> Upload
                                <input type="file" accept="image/*" multiple onChange={async (e) => {
                                  const files = e.target.files; if (!files) return;
                                  for (const file of Array.from(files)) {
                                    const r = await uploadFile(file, { folder: 'milestones', maxSizeMB: 2, allowedTypes: ['image/*'], onProgress: (p) => setUploadProgress(prev => { const idx = prev.findIndex(x => x.fileName === p.fileName); if (idx >= 0) { const u = [...prev]; u[idx] = p; return u; } return [...prev, p]; }) });
                                    if (r.url && !r.error) setMilestoneFormData(prev => ({ ...prev, images: [...prev.images, r.url] }));
                                  }
                                  e.target.value = '';
                                }} className="hidden" />
                              </label>
                            </div>
                            {milestoneFormData.images.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {milestoneFormData.images.map((img, idx) => (
                                  <div key={idx} className="relative group">
                                    <img src={img} alt="" className="w-full aspect-video object-cover rounded border border-os-line-dark" />
                                    <button type="button" onClick={() => setMilestoneFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))} className="absolute top-1 right-1 p-0.5 rounded bg-background-floating hover:bg-red-500/10 text-os-text-inverse hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                      <Icons.X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Links */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35">Links</label>
                              <button type="button" onClick={() => setMilestoneFormData(prev => ({ ...prev, links: [...prev.links, { label: '', url: '' }] }))} className="flex items-center gap-1 text-[10px] text-os-text-inverse/35 hover:text-os-text-inverse/60 transition-colors">
                                <Icons.Plus className="w-3 h-3" /> Add
                              </button>
                            </div>
                            {milestoneFormData.links.map((link, idx) => (
                              <div key={idx} className="flex gap-2 mb-2">
                                <input type="text" value={link.label} onChange={(e) => { const l = [...milestoneFormData.links]; l[idx].label = e.target.value; setMilestoneFormData({ ...milestoneFormData, links: l }); }} placeholder="Label" className={cn(appInputClass, 'px-3 py-2 text-sm flex-1')} />
                                <input type="url" value={link.url} onChange={(e) => { const l = [...milestoneFormData.links]; l[idx].url = e.target.value; setMilestoneFormData({ ...milestoneFormData, links: l }); }} placeholder="URL" className={cn(appInputClass, 'px-3 py-2 text-sm flex-1')} />
                                <button type="button" onClick={() => setMilestoneFormData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== idx) }))} className="p-2 rounded hover:bg-red-500/10 text-os-text-inverse/35 hover:text-red-400 transition-colors"><Icons.Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            ))}
                          </div>

                          <label className="flex items-center gap-2 text-xs text-os-text-inverse/60 cursor-pointer select-none">
                            <input type="checkbox" checked={milestoneFormData.featured} onChange={(e) => setMilestoneFormData({ ...milestoneFormData, featured: e.target.checked })} className="w-3.5 h-3.5 accent-[var(--color-bg-accent)]" />
                            <Icons.Star className="w-3.5 h-3.5" /> Featured
                          </label>

                          <div className="flex gap-2 pt-1">
                            <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded bg-os-ink-800 hover:bg-os-ink-800 border border-os-line-dark text-sm font-medium text-os-text-inverse transition-colors">
                              {editingMilestone ? <><Icons.Save className="w-3.5 h-3.5" /> Update</> : <><Icons.Plus className="w-3.5 h-3.5" /> Create</>}
                            </button>
                            <button type="button" onClick={() => { setShowMilestoneForm(false); setEditingMilestone(null); }} className="px-4 py-2 rounded bg-os-ink-900 hover:bg-os-ink-800 border border-os-line-dark text-sm text-os-text-inverse/60 transition-colors">Cancel</button>
                          </div>
                        </form>
                      </AppCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                {profile.milestones.length === 0 ? (
                  <div className="text-center py-16 text-os-text-inverse/25">
                    <Icons.Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No milestones yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...profile.milestones].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((m) => (
                      <AppCard key={m.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-os-text-inverse">{m.title}</h4>
                              {m.featured && <Icons.Star className="w-3.5 h-3.5 text-yellow-300 fill-current" />}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={cn('text-[10px] px-2 py-0.5 rounded font-medium', m.category === 'project' ? 'bg-primary-500/15 text-primary-400' : m.category === 'achievement' ? 'bg-yellow-500/10 text-yellow-300' : m.category === 'education' ? 'bg-blue-500/10 text-blue-300' : m.category === 'career' ? 'bg-green-500/10 text-green-400' : m.category === 'personal' ? 'bg-red-500/10 text-red-400' : 'bg-os-ink-800 text-os-text-inverse/60')}>{m.category}</span>
                              <span className="text-xs text-os-text-inverse/35">{new Date(m.date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                            {m.description && <p className="text-xs text-os-text-inverse/60 mb-2">{m.description}</p>}
                            {m.tags && m.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {m.tags.map((tag, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 bg-os-ink-900 text-os-text-inverse/35 border border-os-line-dark rounded">{tag}</span>)}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => { setEditingMilestone(m.id); setMilestoneFormData({ title: m.title, description: m.description, date: m.date, category: m.category, images: m.images || [], links: m.links || [], tags: m.tags || [], featured: m.featured || false }); setShowMilestoneForm(true); }} className="p-1.5 rounded hover:bg-os-ink-800 text-os-text-inverse/35 hover:text-os-text-inverse transition-colors"><Icons.Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => { if (confirm('Delete this milestone?')) removeMilestone(m.id); }} className="p-1.5 rounded hover:bg-red-500/10 text-os-text-inverse/35 hover:text-red-400 transition-colors"><Icons.Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </AppCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Feedback ─────────────────────────────────────────────── */}
            {activeTab === 'reads' && (
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-os-text-inverse mb-1">Reads Import</h2>
                  <p className="text-xs text-os-text-inverse/35">
                    Upload the source CSV to add new articles to the Browser Reads shelf. Existing articles are matched by slug and skipped.
                  </p>
                </div>

                <AppCard className="p-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35">
                        Target content document
                      </label>
                      <div className="flex items-center rounded border border-os-line-dark bg-os-ink-800">
                        <span className="shrink-0 border-r border-os-line-dark px-3 text-xs text-os-text-inverse/30">
                          os-site_content /
                        </span>
                        <input
                          value={readImportTarget}
                          onChange={(event) => setReadImportTarget(event.target.value)}
                          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-os-text-inverse outline-none placeholder:text-os-text-inverse/25"
                          placeholder="reads"
                        />
                      </div>
                    </div>

                    <label className={cn(
                      'flex cursor-pointer items-center justify-center gap-2 rounded border border-os-line-dark bg-os-ink-800 px-4 py-2 text-sm text-os-text-inverse/70 transition-colors hover:bg-os-ink-700 hover:text-os-text-inverse',
                      (!isAdmin || readImportStatus.state === 'parsing') && 'pointer-events-none opacity-45'
                    )}>
                      {readImportStatus.state === 'parsing' ? (
                        <>
                          <Icons.Loader2 className="h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Icons.Upload className="h-4 w-4" />
                          Upload CSV
                        </>
                      )}
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={handleReadsCsvImport}
                        className="hidden"
                        disabled={!isAdmin || readImportStatus.state === 'parsing'}
                      />
                    </label>
                  </div>

                  {!isAdmin && (
                    <div className="rounded border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200/80">
                      Reads import requires the superuser account.
                    </div>
                  )}

                  {readImportStatus.message && (
                    <div className={cn(
                      'rounded border px-3 py-2 text-xs',
                      readImportStatus.state === 'success'
                        ? 'border-green-500/25 bg-green-500/10 text-green-200/80'
                        : readImportStatus.state === 'error'
                          ? 'border-red-500/25 bg-red-500/10 text-red-200/80'
                          : 'border-os-line-dark bg-os-ink-900 text-os-text-inverse/50'
                    )}>
                      {readImportStatus.message}
                    </div>
                  )}

                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { label: 'Match key', value: 'Slug' },
                      { label: 'Write mode', value: 'Add new only' },
                      { label: 'Default target', value: 'reads' },
                    ].map((item) => (
                      <div key={item.label} className="rounded border border-os-line-dark bg-os-ink-900 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-os-text-inverse/30">{item.label}</p>
                        <p className="mt-1 text-sm font-medium text-os-text-inverse/75">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </AppCard>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-os-text-inverse flex-1">
                    Feedback Moderation
                    {pendingCount > 0 && <span className="ml-2 text-[10px] bg-primary-500/15 text-primary-400 px-1.5 py-0.5 rounded-full">{pendingCount} pending</span>}
                  </h2>
                  <div className="flex items-center gap-1 bg-os-ink-900 border border-os-line-dark rounded p-0.5">
                    {(['all', 'pending', 'approved', 'hidden'] as const).map((f) => (
                      <button key={f} onClick={() => setFeedbackFilter(f)} className={cn('px-2.5 py-1 rounded text-[10px] font-medium transition-colors capitalize', feedbackFilter === f ? 'bg-os-ink-800 text-os-text-inverse' : 'text-os-text-inverse/35 hover:text-os-text-inverse/60')}>
                        {f}{f !== 'all' && ` (${feedbackItems.filter(x => x.status === f).length})`}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredFeedback.length === 0 ? (
                  <div className="text-center py-16 text-os-text-inverse/25">
                    <Icons.MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No {feedbackFilter === 'all' ? '' : feedbackFilter} feedback.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFeedback.map((item) => (
                      <AppCard key={item.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-os-text-inverse">{item.name}</span>
                              <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', item.status === 'approved' ? 'bg-green-500/10 text-green-400' : item.status === 'hidden' ? 'bg-os-ink-900 text-os-text-inverse/35' : 'bg-yellow-500/10 text-yellow-300')}>{item.status}</span>
                              <span className="text-[10px] text-os-text-inverse/25 ml-auto">
                                {item.timestamp?.toDate?.().toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) ?? '—'}
                              </span>
                            </div>
                            <p className="text-sm text-os-text-inverse/60 leading-relaxed">{item.message}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0 mt-0.5">
                            {item.status !== 'approved' && (
                              <button onClick={() => handleFeedbackStatus(item.id, 'approved')} title="Approve" className="p-1.5 rounded hover:bg-green-500/10 text-os-text-inverse/35 hover:text-green-400 transition-colors"><Icons.Check className="w-3.5 h-3.5" /></button>
                            )}
                            {item.status !== 'hidden' && (
                              <button onClick={() => handleFeedbackStatus(item.id, 'hidden')} title="Hide" className="p-1.5 rounded hover:bg-os-ink-800 text-os-text-inverse/35 hover:text-os-text-inverse/60 transition-colors"><Icons.EyeOff className="w-3.5 h-3.5" /></button>
                            )}
                            <button onClick={() => handleFeedbackDelete(item.id)} title="Delete" className="p-1.5 rounded hover:bg-red-500/10 text-os-text-inverse/35 hover:text-red-400 transition-colors"><Icons.Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </AppCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Visitor Gallery ──────────────────────────────────────── */}
            {activeTab === 'gallery' && (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-os-text-inverse flex-1">
                    Visitor Gallery <span className="text-os-text-inverse/35 font-normal">({galleryImages.length})</span>
                  </h2>
                  <button
                    onClick={loadGalleryImages}
                    disabled={galleryLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border border-os-line-dark bg-os-ink-900 hover:bg-os-ink-800 text-os-text-inverse/60 hover:text-os-text-inverse transition-colors disabled:opacity-40"
                  >
                    <Icons.RefreshCw className={cn('w-3.5 h-3.5', galleryLoading && 'animate-spin')} />
                    Refresh
                  </button>
                </div>

                {galleryError && (
                  <div className="px-4 py-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">{galleryError}</div>
                )}

                {galleryLoading && galleryImages.length === 0 ? (
                  <div className="text-center py-12 text-os-text-inverse/25">
                    <Icons.Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
                    <p className="text-xs">Loading visitor uploads…</p>
                  </div>
                ) : galleryImages.length === 0 ? (
                  <div className="text-center py-16 text-os-text-inverse/25">
                    <Icons.GalleryHorizontal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No visitor uploads yet.</p>
                    <p className="text-xs mt-1 text-os-text-inverse/25">Images uploaded to Visitor Gallery appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {galleryImages.map((img) => (
                      <AppCard key={img.path} className="group relative overflow-hidden p-0">
                        <img src={img.url} alt={img.name} className="w-full aspect-video object-cover" />
                        <div className="absolute inset-0 bg-background-floating opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                          <div className="flex justify-end">
                            <button
                              onClick={async () => {
                                if (!confirm(`Delete "${img.name}"?`)) return;
                                try {
                                  await deleteObject(ref(storage, img.path));
                                  setGalleryImages(prev => prev.filter(i => i.path !== img.path));
                                } catch (err: any) {
                                  alert('Delete failed: ' + err.message);
                                }
                              }}
                              className="p-1.5 rounded bg-background-floating hover:bg-red-500/10 text-os-text-inverse hover:text-red-400 transition-colors"
                            >
                              <Icons.Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div>
                            <p className="text-[10px] text-os-text-inverse truncate">{img.name}</p>
                            <p className="text-[10px] text-os-text-inverse/35">{(img.size / 1024).toFixed(0)} KB · {new Date(img.timeCreated).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </AppCard>
                    ))}
                  </div>
                )}
              </div>
            )}
          </AppContent>
        </AppBody>
      </AppShell>

      {/* URL Preview modal */}
      {previewURL && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background-overlay z-[15001] flex items-center justify-center p-4" onClick={() => setPreviewURL(null)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-6xl h-[85vh] flex flex-col bg-background-chrome border border-os-line-dark rounded-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-os-line-dark shrink-0">
              <div>
                <p className="text-sm font-medium text-os-text-inverse">Preview</p>
                <p className="text-xs text-os-text-inverse/35 truncate max-w-md">{previewURL}</p>
              </div>
              <button onClick={() => setPreviewURL(null)} className="p-1.5 rounded hover:bg-os-ink-800 text-os-text-inverse/60 hover:text-white transition-colors"><Icons.X className="w-4 h-4" /></button>
            </div>
            <iframe src={previewURL} className="flex-1 border-0 bg-white" title="Preview" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
          </motion.div>
        </motion.div>
      )}

      {/* App context menu */}
      <AnimatePresence>
        {appContextMenu && (() => {
          const { x, y, app } = appContextMenu;
          const defs: ContextMenuItemDef[] = [
            { id: 'open', label: 'Open', icon: Icons.ExternalLink, group: 'primary', action: () => { openWindow(app); setAppContextMenu(null); } },
            { id: 'edit', label: 'Edit', icon: Icons.Edit2, group: 'organize', action: () => { handleEdit(app); setAppContextMenu(null); } },
            { id: 'pin-desktop', label: app.pinnedToDesktop ? 'Unpin from Desktop' : 'Pin to Desktop', icon: app.pinnedToDesktop ? Icons.PinOff : Icons.Pin, group: 'organize', action: () => { updateApp(app.id, { pinnedToDesktop: !app.pinnedToDesktop }); setAppContextMenu(null); } },
            { id: 'pin-taskbar', label: app.pinnedToTaskbar ? 'Unpin from Taskbar' : 'Pin to Taskbar', icon: app.pinnedToTaskbar ? Icons.PinOff : Icons.Pin, group: 'organize', action: () => { updateApp(app.id, { pinnedToTaskbar: !app.pinnedToTaskbar }); setAppContextMenu(null); } },
            { id: 'delete', label: 'Delete', icon: Icons.Trash2, group: 'danger', danger: true, action: () => { removeApp(app.id); setAppContextMenu(null); } },
          ];
          const items = sortAndSeparate(defs).map((d) => ({ label: d.label, icon: d.icon, onClick: d.action, disabled: d.disabled, danger: d.danger, divider: d.divider, shortcut: d.shortcut }));
          return <ContextMenu x={x} y={y} items={items} onClose={() => setAppContextMenu(null)} />;
        })()}
      </AnimatePresence>
    </>
  );
}
