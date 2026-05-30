import { FileItem, App } from '../types';
import { getViewerType } from './fileUtils';
import { audioEngine } from './audioEngine';
import { Track } from '../store/mediaStore';
import { useDesktopStore } from '../store/desktopStore';

type OpenWindowFn = (app: App, fileData?: {
  fileId?: string;
  content?: string;
  title?: string;
  file?: FileItem;
}) => void;

// Inline fallbacks — used only if the registered app was removed from the store.
const FALLBACK_APPS: Record<string, App> = {
  music: {
    id: 'music', name: 'Music', icon: 'music', type: 'component', component: 'Music',
    surfaceMode: 'glass', defaultSize: { width: 420, height: 580 }, minSize: { width: 340, height: 480 },
    description: 'Audio player',
  },
  'pdf-reader': {
    id: 'pdf-reader', name: 'PDF Reader', icon: 'file-type', type: 'component', component: 'PDFReader',
    surfaceMode: 'glass', defaultSize: { width: 820, height: 700 }, minSize: { width: 480, height: 400 },
    description: 'PDF viewer',
  },
  'video-player': {
    id: 'video-player', name: 'Video Player', icon: 'play-circle', type: 'component', component: 'VideoPlayer',
    surfaceMode: 'glass', defaultSize: { width: 860, height: 560 }, minSize: { width: 480, height: 320 },
    description: 'Video player',
  },
  'image-viewer': {
    id: 'image-viewer', name: 'Image Viewer', icon: 'image', type: 'component', component: 'ImageViewer',
    surfaceMode: 'glass', defaultSize: { width: 900, height: 680 }, minSize: { width: 480, height: 360 },
    description: 'Image viewer',
  },
  notepad: {
    id: 'notepad', name: 'Notepad', icon: 'file-text', type: 'component', component: 'Notepad',
    defaultSize: { width: 600, height: 400 }, description: 'Plain text editor',
  },
  'file-viewer': {
    id: 'file-viewer', name: 'File Viewer', icon: 'file', type: 'component', component: 'FileViewer',
    surfaceMode: 'glass', defaultSize: { width: 800, height: 600 }, description: 'Universal file viewer',
  },
};

function getApp(id: string): App {
  const registered = useDesktopStore.getState().apps.find(a => a.id === id);
  return registered ?? FALLBACK_APPS[id];
}

export function openFileWithApp(file: FileItem, openWindow: OpenWindowFn): void {
  if (file.type === 'folder') return;

  const viewerType = getViewerType(file.name, file.mimeType);

  switch (viewerType) {
    case 'notepad':
      openWindow(getApp('notepad'), { fileId: file.id, content: file.content ?? '', title: file.name });
      return;
    case 'audio': {
      const url = file.dataUrl ?? '';
      const track: Track = { id: file.id, title: file.name.replace(/\.[^.]+$/, ''), url, file };
      audioEngine.playTrack(track); // synchronous — inside user gesture activation scope
      openWindow(getApp('music'), { file, title: file.name, fileId: file.id });
      return;
    }
    case 'pdf':
      openWindow(getApp('pdf-reader'), { file, title: file.name, fileId: file.id });
      return;
    case 'video':
      openWindow(getApp('video-player'), { file, title: file.name, fileId: file.id });
      return;
    case 'image':
      openWindow(getApp('image-viewer'), { file, title: file.name, fileId: file.id });
      return;
    default:
      if (file.name.endsWith('.txt')) {
        openWindow(getApp('notepad'), { fileId: file.id, content: file.content ?? '', title: file.name });
        return;
      }
      openWindow(getApp('file-viewer'), { file, title: file.name, fileId: file.id });
  }
}
