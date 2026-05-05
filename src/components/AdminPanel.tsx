import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import {
  collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc,
} from 'firebase/firestore';
import { ref, listAll, getMetadata, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useDesktopStore } from '../store/desktopStore';
import { useUserStore } from '../store/userStore';
import { App } from '../types';
import { AppShell, AppBody, AppSidebar, AppContent, AppCard, appInputClass } from './ui/AppShell';
import { SystemRow, SystemRowGroup, SystemRowDivider } from './ui/SystemRow';
import { uploadFile, uploadFiles, UploadProgress as UploadProgressType } from '../lib/uploadUtils';
import { UploadProgress } from './UploadProgress';
import { ContextMenu } from './ContextMenu';
import { ContextMenuItemDef, sortAndSeparate } from '../lib/contextMenuRegistry';
import { cn } from '../lib/utils';

type AdminTab = 'overview' | 'apps' | 'backgrounds' | 'milestones' | 'feedback' | 'gallery';

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
  feedback: 'Feedback',
  gallery: 'Visitor Gallery',
};

const TAB_ICONS: Record<AdminTab, keyof typeof Icons> = {
  overview: 'LayoutDashboard',
  apps: 'Grid3x3',
  backgrounds: 'Image',
  milestones: 'Calendar',
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

  const [formData, setFormData] = useState<Partial<App>>({
    name: '', icon: 'square', type: 'component', component: '', url: '',
    pinnedToTaskbar: false, pinnedToDesktop: true,
    desktopPosition: { x: 50, y: 50 },
    defaultSize: { width: 800, height: 600 },
    description: '',
    media: [],
  });

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

  const iconOptions = [
    'folder', 'globe', 'calculator', 'file-text', 'cloud', 'activity', 'heart',
    'github', 'user', 'briefcase', 'code', 'terminal', 'image', 'video',
    'music', 'book', 'mail', 'phone', 'settings', 'star', 'search', 'chrome',
    'link', 'radio', 'zap', 'trello', 'figma', 'shopping-cart',
  ];

  const iconLibrary = [
    { name: 'GitHub', icon: 'github', customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTgiIGhlaWdodD0iOTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00OC44NTQgMEMyMS44MzkgMCAwIDIyIDAgNDkuMjE3YzAgMjEuNzU2IDEzLjk5MyA0MC4xNzIgMzMuNDA1IDQ2LjY5IDIuNDI3LjQ5IDMuMzE2LTEuMDU5IDMuMzE2LTIuMzYyIDAtMS4xNDEtLjA4LTUuMDUyLS4wOC05LjEyNy0xMy41OSAyLjkzNC0xNi40Mi01Ljg2Ny0xNi40Mi01Ljg2Ny0yLjE4NC01LjcwNC01LjQyLTcuMTctNS40Mi03LjE3LTQuNDQ4LTMuMDE1LjMyNC0zLjAxNS4zMjQtMy4wMTUgNC45MzQuMzI2IDcuNTIzIDUuMDUyIDcuNTIzIDUuMDUyIDQuMzY3IDcuNDk2IDExLjQwNCA1LjM3OCAxNC4yMzUgNC4wNzQuNDA0LTMuMTc4IDEuNjk5LTUuMzc4IDMuMDc0LTYuNi0xMC44MzktMS4xNDEtMjIuMjQzLTUuMzc4LTIyLjI0My0yNC4yODMgMC01LjM3OCAxLjk0LTkuNzc4IDUuMDE0LTEzLjItLjQ4NS0xLjIyMi0yLjE4NC02LjI3NS40ODYtMTMuMDM4IDAgMCA0LjEyNS0xLjMwNCAxMy40MjYgNS4wNTJhNDYuOTcgNDYuOTcgMCAwIDEgMTIuMjE0LTEuNjNjNC4xMjUgMCA4LjMzLjU3MSAxMi4yMTMgMS42MyA5LjMwMi02LjM1NiAxMy40MjctNS4wNTIgMTMuNDI3LTUuMDUyIDIuNjcgNi43NjMuOTcgMTEuODE2LjQ4NSAxMy4wMzggMy4xNTUgMy40MjIgNS4wMTUgNy44MjIgNS4wMTUgMTMuMiAwIDE4LjkwNS0xMS40MDQgMjMuMDYtMjIuMzI0IDI0LjI4MyAxLjc4IDEuNTQ4IDMuMzE2IDQuNDgxIDMuMzE2IDkuMTI2IDAgNi42LS4wOCAxMS44OTctLjA4IDEzLjUyNiAwIDEuMzA0Ljg5IDIuODUzIDMuMzE2IDIuMzY0IDE5LjQxMi02LjUyIDMzLjQwNS0yNC45MzUgMzMuNDA1LTQ2LjY5MUM5Ny43MDcgMjIgNzUuNzg4IDAgNDguODU0IDB6IiBmaWxsPSIjZmZmIi8+PC9zdmc+' },
    { name: 'LinkedIn', icon: 'linkedin', customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIwLjQ0NyAyMC40NTJoLTMuNTU0di01LjU2OWMwLTEuMzI4LS4wMjctMy4wMzctMS44NTItMy4wMzctMS44NTMgMC0yLjEzNiAxLjQ0NS0yLjEzNiAyLjkzOXY1LjY2N0g5LjM1MVY5aDMuNDE0djEuNTYxaC4wNDZjLjQ3Ny0uOSAxLjYzNy0xLjg1IDMuMzctMS44NSAzLjYwMSAwIDQuMjY3IDIuMzcgNC4yNjcgNS40NTV2Ni4yODZ6TTUuMzM3IDcuNDMzYTIuMDYyIDIuMDYyIDAgMCAxLTIuMDYzLTIuMDY1IDIuMDY0IDIuMDY0IDAgMSAxIDIuMDYzIDIuMDY1em0xLjc4MiAxMy4wMTlIMy41NTVWOWgzLjU2NHYxMS40NTJ6TTIyLjIyNSAwSDEuNzcxQy43OTIgMCAwIC43NzQgMCAxLjcyOXYyMC41NDJDMCAyMy4yMjcuNzkyIDI0IDEuNzcxIDI0aDIwLjQ1MUMyMy4yIDI0IDI0IDIzLjIyNyAyNCAyMi4yNzFWMS43MjlDMjQgLjc3NCAyMy4yIDAgMjIuMjIyIDBoLjAwM3oiIGZpbGw9IiMwMDc3QjUiLz48L3N2Zz4=' },
    { name: 'Twitter/X', icon: 'twitter', customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE4LjkwMSAxLjE1M2gzLjY4bC04LjA0IDkuMTlMMjQgMjIuODQ2aC03LjQwNmwtNS44LTcuNTg0LTYuNjM4IDcuNTg0SC40NzRsOC42LTkuODNMMCAxLjE1NGg3LjU5NGw1LjI0MyA2LjkzMlpNMTcuNjEgMjAuNjQ0aDIuMDM5TDYuNDg2IDMuMjRINC4yOThaIiBmaWxsPSIjZmZmIi8+PC9zdmc+' },
    { name: 'YouTube', icon: 'youtube', customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIzLjQ5OCA2LjE4NmExMy4wNjUgMTMuMDY1IDAgMCAwLTIuNTE5LTQuNzI1QzE5LjUwMi4zMjUgMTguMDg1LjA0OCAxNC44NTcgMGMtMy4yMDYuMDQ4LTQuNjIxLjMyNS02LjA5OSAxLjQ2MWExMy4wNjUgMTMuMDY1IDAgMCAwLTIuNTE5IDQuNzI1QzUuNzY4IDcuNjk0IDUuNjk1IDkuNDk5IDUuNjk1IDEyYzAgMi41MDEuMDczIDQuMzA2LjU0NCA1LjgxNGExMy4wNjUgMTMuMDY1IDAgMCAwIDIuNTE5IDQuNzI1YzEuNDc4IDEuMTM2IDIuODkzIDEuNDEzIDYuMDk5IDEuNDYxIDMuMjI4LS4wNDggNC42NDUtLjMyNSA2LjEyMS0xLjQ2MWExMy4wNjUgMTMuMDY1IDAgMCAwIDIuNTE5LTQuNzI1Yy40NzEtMS41MDguNTQ0LTMuMzEzLjU0NC01LjgxNCAwLTIuNTAxLS4wNzMtNC4zMDYtLjU0NC01LjgxNHpNOS41NDUgMTUuNTY4VjguNDMybDYuNTQ1IDMuNTY4LTYuNTQ1IDMuNTY4eiIgZmlsbD0iI0ZGMDAwMCIvPjwvc3ZnPg==' },
    { name: 'Discord', icon: 'message-circle', customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIwLjMxNyA0LjQ5MmExOS44OTEgMTkuNzkgMCAwIDAtNC45MDUtMS41MzguMTI0LjEyNCAwIDAgMC0uMTMxLjA2MmMtLjIxMS4zNzUtLjQ0NS43NjQtLjYwOCAxLjEwN2E4LjMzNiAxOC40MTcgMCAwIDAtNS41MTYgMCA2LjQ2NiAxMy4zODUgMCAwIDAtLjYxNy0xLjEwNy4xMjkuMTI5IDAgMCAwLS4xMzEtLjA2MiAxOS44MzggMTkuNzg3IDAgMCAwLTQuOTA0IDEuNTM4LjExNy4xMTcgMCAwIDAtLjA1NC4wNDZDLjM1IDguNzk4LS4yMSAxMi45NDEuMDY2IDE3LjAzOGEuMTM3LjEzNyAwIDAgMCAuMDUyLjA5NCAyMC4wNiAxOS45OSAwIDAgMCA2LjAzOCAzLjA1MS4xMy4xMyAwIDAgMCAuMTQtLjA0NmMuMzg2LS41MjcuNzMtMS4wODEgMS4wMjktMS42NThhLjEyNi4xMjYgMCAwIDAtLjA2OS0uMTc2IDEzLjE3IDEzLjA4NiAwIDAgMS0xLjg3OS0uODk1LjEyNy4xMjcgMCAwIDEtLjAxMi0uMjExYy4xMjYtLjA5NS4yNTItLjE5My4zNzMtLjI5MmEuMTI0LjEyNCAwIDAgMSAuMTMtLjAxOGM5LjkzNiA0LjUzNiAxMi40NjcgNC41MzYgMTUuNzY3IDBhLjEyNC4xMjQgMCAwIDEgLjEzMS4wMTdjLjEyLjEuMjQ3LjE5OC4zNzQuMjkzYS4xMjcuMTI3IDAgMCAxLS4wMTEuMjExIDEyLjM3IDEyLjI4OCAwIDAgMS0xLjg4Ljg5NC4xMjcuMTI3IDAgMCAwLS4wNjguMTc3Yy4zMDMuNTc2LjY0OCAxLjEzIDEuMDI5IDEuNjU3YS4xMjYuMTI2IDAgMCAwIC4xNC4wNDcgMTkuOTYzIDE5Ljk1IDAgMCAwIDYuMDUzLTMuMDUxLjEyOS4xMjkgMCAwIDAgLjA1Mi0uMDkzYy4zMzEtNC43MzMtLjU1NS04LjgzNi0yLjM1Mi0xMi40OGEuMS4xIDAgMCAwLS4wNTMtLjA0N3pNOC4wMiAxNC4zMzRjLS43ODMgMC0xLjQyOS0uNzE5LTEuNDI5LTEuNjAyIDAtLjg4My42My0xLjYwMiAxLjQyOS0xLjYwMi44MDYgMCAxLjQ0NC43MjYgMS40MjkgMS42MDIgMCAuODgzLS42MyAxLjYwMi0xLjQyOSAxLjYwMnptNy45NzUgMGMtLjc4MyAwLTEuNDI5LS43MTktMS40MjktMS42MDIgMC0uODgzLjYzLTEuNjAyIDEuNDI5LTEuNjAyLjgwNiAwIDEuNDQ0LjcyNiAxLjQyOSAxLjYwMiAwIC44ODMtLjYyMyAxLjYwMi0xLjQyOSAxLjYwMnoiIGZpbGw9IiM1ODY1RjIiLz48L3N2Zz4=' },
    { name: 'Spotify', icon: 'music', customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDI0QzUuMzczIDI0IDAgMTguNjI3IDAgMTJTNS4zNzMgMCAxMiAwczEyIDUuMzczIDEyIDEyLTUuMzczIDEyLTEyIDEyem01LjAxLTEzLjY4MWE1NS40NyA1NS40NyAwIDAgMC0xMC4wMi0uNThjLS4xODkgMC0uMzY3LjAwNC0uNTQ1LjAxYS4yNy4yNyAwIDAgMC0uMjU3LjI3Mi4yNjguMjY4IDAgMCAwIC4yNTguMjdoLjAwMWMuMTcyLS4wMDYuMzQzLS4wMDkuNTE0LS4wMDlhNTYuMDY1IDU2LjA2NSAwIDAgMSA5LjkyNy41NzJjLjE1Mi4wMjIuMjkzLS4wNzkuMzE1LS4yMjguMDIyLS4xNS0uMDc5LS4yOS0uMjI4LS4zMTJ6bS40NyAyLjY1YTU4LjI4MyA1OC4yODMgMCAwIDAtMTEuNTMtLjg1NGMtLjE1NCAwLS4yNzkuMTI1LS4yNzkuMjc5YS4yNzguMjc4IDAgMCAwIC4yNzkuMjc5IDU3LjcyMyA1Ny43MjMgMCAwIDEgMTEuNDE0Ljg0NS4yNzkuMjc5IDAgMCAwIC4zMTQtLjIzOS4yNzkuMjc5IDAgMCAwLS4yMzgtLjMxNHptLjY5MyAyLjgxNWMtMy41My0uODE3LTguMzM5LTEuMDk1LTExLjQ4NC0uNzAzYS4yOTQuMjk0IDAgMSAxLS4xMTctLjU3N2MzLjI1OC0uNDA1IDguMjU3LS4xMTcgMTEuOTg1Ljc4YS4yOTUuMjk1IDAgMSAxLS4xNDcuNTc0bC0uMjM3LS4wNzR6IiBmaWxsPSIjMUVENzYwIi8+PC9zdmc+' },
    { name: 'VS Code', icon: 'code', customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIzLjE1IDIuNTg3TDE4LjIxLjIxYTEuNDk0IDEuNDk0IDAgMCAwLTEuNzA1LjI5bC05LjQ2IDguNjMtNC4xMi0zLjEyOGEuOTk5Ljk5OSAwIDAgMC0xLjI3Ni4wNTdMLjMyNyA3LjI2MUExIDEgMCAwIDAgLjMyNiA4Ljc0TDMuODk5IDEyIC4zMjYgMTUuMjZhMSAxIDAgMCAwIC4wMDEgMS40NzlMMS42NSAxOC4xYS45OTkuOTk5IDAgMCAwIDEuMjc2LjA1N2w0LjEyLTMuMTI4IDkuNDYgOC42M2ExLjQ5MiAxLjQ5MiAwIDAgMCAxLjcwNC4yOWw0Ljk0Mi0yLjM3N0ExLjUgMS41IDAgMCAwIDI0IDIwLjA2VjMuOTM5YTEuNSAxLjUgMCAwIDAtLjg1LTEuMzUyem0tNS4xNDYgMTQuODYxTDEwLjgyNiAxMmw3LjE3OC01LjQ0OHYxMC44OTZ6IiBmaWxsPSIjMDBBQ0VFIi8+PC9zdmc+' },
  ];

  const resetForm = () => {
    setFormData({ name: '', icon: 'square', type: 'component', component: '', url: '', pinnedToTaskbar: false, pinnedToDesktop: true, desktopPosition: { x: 50, y: 50 }, defaultSize: { width: 800, height: 600 }, description: '', media: [] });
    setEditingApp(null);
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    if (editingApp) {
      updateApp(editingApp, formData);
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
      addApp(newApp);
    }
    resetForm();
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
    if (file) { const reader = new FileReader(); reader.onload = (ev) => importConfig(ev.target?.result as string); reader.readAsText(file); }
  };

  const extractAppNameFromURL = (url: string): string => {
    try { const h = new URL(url).hostname.replace('www.', '').split('.')[0]; return h.charAt(0).toUpperCase() + h.slice(1); } catch { return 'New App'; }
  };

  const handleQuickAdd = () => {
    if (!quickURL.trim()) return;
    let url = quickURL.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    const appName = extractAppNameFromURL(url);
    addApp({ id: `${appName.toLowerCase()}-${Date.now()}`, name: appName, icon: 'globe', type: 'iframe', url, pinnedToTaskbar: true, pinnedToDesktop: true, desktopPosition: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 }, defaultSize: { width: 1000, height: 700 }, description: `Iframe: ${url}` });
    setQuickURL(''); setShowQuickAdd(false);
  };

  const handleBulkImport = () => {
    if (!bulkURLs.trim()) return;
    bulkURLs.split('\n').filter(l => l.trim()).forEach((line, i) => {
      const parts = line.split('|').map(p => p.trim());
      let url = parts[0]; const name = parts[1] || extractAppNameFromURL(url); const icon = parts[2] || 'globe';
      if (!url.startsWith('http')) url = 'https://' + url;
      addApp({ id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${i}`, name, icon, type: 'iframe', url, pinnedToTaskbar: true, pinnedToDesktop: true, desktopPosition: { x: 50 + i * 30, y: 50 + i * 30 }, defaultSize: { width: 1000, height: 700 }, description: `Iframe: ${url}` });
    });
    setBulkURLs(''); setShowBulkImport(false);
  };

  const handleURLPreview = (url: string) => {
    if (!url.trim()) return;
    let u = url.trim();
    if (!u.startsWith('http')) u = 'https://' + u;
    setPreviewURL(u);
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('')] || Icons.Square;
    return Icon;
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

  if (!isAdminMode) return null;

  const pendingCount = feedbackItems.filter(f => f.status === 'pending').length;
  const filteredFeedback = feedbackFilter === 'all' ? feedbackItems : feedbackItems.filter(f => f.status === feedbackFilter);

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
            {(['overview', 'apps', 'backgrounds', 'milestones', 'feedback', 'gallery'] as AdminTab[]).map((tab) => {
              const IconComp = Icons[TAB_ICONS[tab]] as React.ComponentType<{ className?: string }>;
              return (
                <SystemRow
                  key={tab}
                  label={TAB_LABELS[tab]}
                  icon={<IconComp className="w-4 h-4" />}
                  context="chrome"
                  selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  badge={tab === 'feedback' && pendingCount > 0 ? String(pendingCount) : undefined}
                />
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
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-os-text-inverse flex-1">Apps <span className="text-os-text-inverse/35 font-normal">({apps.length})</span></h2>
                  <button onClick={() => { setShowQuickAdd(!showQuickAdd); setShowAddForm(false); setShowBulkImport(false); }} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-colors', showQuickAdd ? 'bg-os-ink-800 border-primary-500/40 text-os-text-inverse' : 'bg-os-ink-900 border-os-line-dark text-os-text-inverse/60 hover:text-os-text-inverse hover:bg-os-ink-800')}>
                    <Icons.Zap className="w-3.5 h-3.5" /> Quick Add
                  </button>
                  <button onClick={() => { setShowBulkImport(!showBulkImport); setShowAddForm(false); setShowQuickAdd(false); }} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-colors', showBulkImport ? 'bg-os-ink-800 border-primary-500/40 text-os-text-inverse' : 'bg-os-ink-900 border-os-line-dark text-os-text-inverse/60 hover:text-os-text-inverse hover:bg-os-ink-800')}>
                    <Icons.Package className="w-3.5 h-3.5" /> Bulk
                  </button>
                  <button onClick={() => { setShowAddForm(!showAddForm); setShowQuickAdd(false); setShowBulkImport(false); }} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-colors', showAddForm ? 'bg-os-ink-800 border-primary-500/40 text-os-text-inverse' : 'bg-os-ink-900 border-os-line-dark text-os-text-inverse/60 hover:text-os-text-inverse hover:bg-os-ink-800')}>
                    <Icons.Plus className="w-3.5 h-3.5" /> Add App
                  </button>
                </div>

                <AnimatePresence>
                  {showQuickAdd && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <AppCard className="p-4 space-y-3">
                        <h3 className="text-xs font-semibold text-os-text-inverse/60 flex items-center gap-2"><Icons.Zap className="w-3.5 h-3.5" /> Quick Add from URL</h3>
                        <input type="text" value={quickURL} onChange={(e) => setQuickURL(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()} placeholder="https://example.com" autoFocus className={cn(appInputClass, 'px-3 py-2 text-sm w-full')} />
                        <div className="flex gap-2">
                          <button onClick={handleQuickAdd} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-os-ink-900 hover:bg-os-ink-800 border border-os-line-dark text-xs text-os-text-inverse transition-colors"><Icons.Plus className="w-3.5 h-3.5" /> Add App</button>
                          {quickURL && <button onClick={() => handleURLPreview(quickURL)} className="px-3 py-2 rounded bg-os-ink-900 hover:bg-os-ink-800 border border-os-line-dark text-xs text-os-text-inverse/60 transition-colors"><Icons.Eye className="w-3.5 h-3.5" /></button>}
                        </div>
                      </AppCard>
                    </motion.div>
                  )}

                  {showBulkImport && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <AppCard className="p-4 space-y-3">
                        <h3 className="text-xs font-semibold text-os-text-inverse/60 flex items-center gap-2"><Icons.Package className="w-3.5 h-3.5" /> Bulk Import</h3>
                        <p className="text-xs text-os-text-inverse/35">One URL per line. Format: <code className="bg-os-ink-800 px-1 rounded">URL | Name | Icon</code></p>
                        <textarea value={bulkURLs} onChange={(e) => setBulkURLs(e.target.value)} rows={5} placeholder={"https://example.com\nhttps://site.com | My App | globe"} className={cn(appInputClass, 'px-3 py-2 text-xs w-full resize-none font-mono')} />
                        <button onClick={handleBulkImport} className="flex items-center gap-2 px-3 py-2 rounded bg-os-ink-900 hover:bg-os-ink-800 border border-os-line-dark text-xs text-os-text-inverse transition-colors"><Icons.Package className="w-3.5 h-3.5" /> Import All</button>
                      </AppCard>
                    </motion.div>
                  )}

                  {showAddForm && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <AppCard className="p-4">
                        <h3 className="text-xs font-semibold text-os-text-inverse/60 mb-4">{editingApp ? 'Edit App' : 'New App'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">Name *</label>
                              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="My App" required className={cn(appInputClass, 'px-3 py-2 text-sm w-full')} />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">Icon</label>
                              <select value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className={cn(appInputClass, 'px-3 py-2 text-sm w-full')}>
                                {iconOptions.map((ico) => <option key={ico} value={ico}>{ico}</option>)}
                              </select>
                            </div>
                          </div>

                          {/* Icon Library */}
                          <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-2">Icon Library</label>
                            <div className="grid grid-cols-7 gap-1.5">
                              {iconLibrary.map((lib) => (
                                <button key={lib.name} type="button" title={lib.name} onClick={() => setFormData({ ...formData, customIcon: lib.customIcon })} className={cn('p-2 rounded border-2 transition-all flex items-center justify-center', formData.customIcon === lib.customIcon ? 'border-primary-500/40 bg-primary-500/15' : 'border-os-line-dark bg-os-ink-900 hover:border-os-line-dark')}>
                                  <img src={lib.customIcon} alt={lib.name} className="w-6 h-6 object-contain" />
                                </button>
                              ))}
                              {formData.customIcon && (
                                <button type="button" onClick={() => setFormData({ ...formData, customIcon: undefined })} className="p-2 rounded border-2 border-red-500/30 bg-red-500/10 hover:bg-os-ink-800 transition-all flex items-center justify-center" title="Clear custom icon">
                                  <Icons.X className="w-4 h-4 text-red-400" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">Type</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className={cn(appInputClass, 'px-3 py-2 text-sm w-full')}>
                              <option value="component">React Component</option>
                              <option value="iframe">IFrame URL</option>
                              <option value="static">Static Content</option>
                            </select>
                          </div>

                          {formData.type === 'component' && (
                            <div>
                              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">Component Name</label>
                              <input type="text" value={formData.component} onChange={(e) => setFormData({ ...formData, component: e.target.value })} placeholder="MyComponent" className={cn(appInputClass, 'px-3 py-2 text-sm w-full')} />
                            </div>
                          )}

                          {formData.type === 'iframe' && (
                            <div>
                              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">URL *</label>
                              <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://example.com" required className={cn(appInputClass, 'px-3 py-2 text-sm w-full')} />
                            </div>
                          )}

                          <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35 mb-1.5">Description</label>
                            <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" className={cn(appInputClass, 'px-3 py-2 text-sm w-full')} />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35">Preview Media</label>
                                <p className="text-[11px] text-os-text-inverse/35">Screenshots and videos for the desktop hover preview.</p>
                              </div>
                              <label className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-colors', isUploading ? 'opacity-50 cursor-not-allowed bg-os-ink-900 border-os-line-dark text-os-text-inverse/35' : 'cursor-pointer bg-os-ink-900 border-os-line-dark text-os-text-inverse/60 hover:text-os-text-inverse hover:bg-os-ink-800')}>
                                {isUploading ? <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icons.Upload className="w-3.5 h-3.5" />}
                                Upload
                                <input type="file" accept="image/*,video/*" multiple onChange={handleAppMediaUpload} className="hidden" disabled={isUploading} />
                              </label>
                            </div>

                            {(formData.media?.length || 0) > 0 && (
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {formData.media?.map((item) => (
                                  <div key={item.id} className="group relative overflow-hidden rounded-lg border border-os-line-dark bg-os-ink-900">
                                    {item.type === 'video' ? (
                                      <video src={item.url} muted playsInline className="aspect-video w-full object-cover" />
                                    ) : (
                                      <img src={item.url} alt={item.name || ''} className="aspect-video w-full object-cover" />
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-background-floating px-2 py-1 text-[10px] text-os-text-inverse">
                                      {item.type === 'video' ? <Icons.Video className="w-3 h-3 shrink-0" /> : <Icons.Image className="w-3 h-3 shrink-0" />}
                                      <span className="truncate">{item.name || item.type}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setFormData((prev) => ({ ...prev, media: (prev.media || []).filter((media) => media.id !== item.id) }))}
                                      className="absolute right-1 top-1 rounded bg-background-floating p-1 text-os-text-inverse opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                                      title="Remove media"
                                    >
                                      <Icons.X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-6">
                            <label className="flex items-center gap-2 text-xs text-os-text-inverse/60 cursor-pointer select-none">
                              <input type="checkbox" checked={formData.pinnedToTaskbar} onChange={(e) => setFormData({ ...formData, pinnedToTaskbar: e.target.checked })} className="w-3.5 h-3.5 accent-[var(--color-bg-accent)]" />
                              Pin to Taskbar
                            </label>
                            <label className="flex items-center gap-2 text-xs text-os-text-inverse/60 cursor-pointer select-none">
                              <input type="checkbox" checked={formData.pinnedToDesktop} onChange={(e) => setFormData({ ...formData, pinnedToDesktop: e.target.checked })} className="w-3.5 h-3.5 accent-[var(--color-bg-accent)]" />
                              Pin to Desktop
                            </label>
                          </div>

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

                          <div className="flex gap-2 pt-1">
                            <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded bg-os-ink-800 hover:bg-os-ink-800 border border-os-line-dark text-sm font-medium text-os-text-inverse transition-colors">
                              {editingApp ? <><Icons.Save className="w-3.5 h-3.5" /> Update</> : <><Icons.Plus className="w-3.5 h-3.5" /> Create</>}
                            </button>
                            <button type="button" onClick={resetForm} className="px-4 py-2 rounded bg-os-ink-900 hover:bg-os-ink-800 border border-os-line-dark text-sm text-os-text-inverse/60 transition-colors">Cancel</button>
                          </div>
                        </form>
                      </AppCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* App list */}
                <AppCard className="overflow-hidden">
                  <div className="px-4 py-2.5 grid grid-cols-12 gap-4 border-b border-os-line-dark text-[10px] font-semibold uppercase tracking-[0.08em] text-os-text-inverse/35">
                    <div className="col-span-4">Name</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Taskbar</div>
                    <div className="col-span-2">Desktop</div>
                    <div className="col-span-2">Actions</div>
                  </div>
                  <div className="divide-y divide-stroke-secondary">
                    {apps.map((app) => {
                      const Icon = getIcon(app.icon);
                      return (
                        <div key={app.id} className={cn('px-4 py-2.5 grid grid-cols-12 gap-4 items-center transition-colors group', highlightedAppId === app.id ? 'bg-primary-500/15 ring-1 ring-inset ring-primary-500/30' : 'hover:bg-os-ink-900')} onContextMenu={(e) => { e.preventDefault(); setAppContextMenu({ x: e.clientX, y: e.clientY, app }); }}>
                          <div className="col-span-4 flex items-center gap-2 min-w-0">
                            {app.customIcon ? <img src={app.customIcon} alt={app.name} className="w-4 h-4 object-contain flex-shrink-0" /> : <Icon className="w-4 h-4 text-os-text-inverse/35 flex-shrink-0" />}
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
                            <button onClick={() => removeApp(app.id)} className="p-1.5 rounded hover:bg-red-500/10 text-os-text-inverse/35 hover:text-red-400 transition-colors" title="Delete"><Icons.Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AppCard>
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
                            <select value={milestoneFormData.category} onChange={(e) => setMilestoneFormData({ ...milestoneFormData, category: e.target.value as any })} className={cn(appInputClass, 'px-3 py-2 text-sm w-full')}>
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
