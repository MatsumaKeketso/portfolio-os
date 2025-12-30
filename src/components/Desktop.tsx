import { useEffect, useState } from 'react';
import { useDesktopStore } from '../store/desktopStore';
import { useFileStore } from '../store/fileStore';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { DesktopIcons } from './DesktopIcons';
import { WindowManager } from './WindowManager';
import { AdminPanel } from './AdminPanel';

export function Desktop() {
  const { setStartMenuOpen, toggleAdminMode, setAdminMode, getSelectedBackground } = useDesktopStore();
  const fileStore = useFileStore();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const selectedBackground = getSelectedBackground();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1') {
      setAdminMode(true);
    }
  }, [setAdminMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        toggleAdminMode();
      }

      if (e.key === 'Escape') {
        setStartMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleAdminMode, setStartMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.start-menu') && !target.closest('.taskbar')) {
        setStartMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setStartMenuOpen]);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('desktop-drop-zone')) {
        setIsDraggingOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);

      const files = e.dataTransfer?.files;
      if (!files) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const fileType = file.type.startsWith('image/')
            ? 'image'
            : file.type.startsWith('video/')
              ? 'video'
              : 'file';

          fileStore.addFile({
            id: `file-${Date.now()}-${i}`,
            name: file.name,
            type: fileType,
            parentId: null,
            path: `/${file.name}`,
            size: file.size,
            mimeType: file.type,
            dataUrl: dataUrl,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
          });
        };

        reader.readAsDataURL(file);
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [fileStore]);

  const isGradient = selectedBackground?.url.startsWith('linear-gradient');

  return (
    <div
      className="fixed inset-0 overflow-hidden desktop-drop-zone"
      style={{
        background: isGradient ? selectedBackground?.url : '#1e3a8a',
        backgroundImage: !isGradient && selectedBackground?.url ? `url(${selectedBackground.url})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >

      {isDraggingOver && (
        <div className="absolute inset-0 bg-blue-500/20 border-4 border-blue-400 border-dashed flex items-center justify-center z-[9997] pointer-events-none">
          <div className="text-white text-2xl font-bold drop-shadow-lg">Drop files to upload</div>
        </div>
      )}

      <div className="relative h-full flex flex-col">
        <div className="flex-1 relative">
          <DesktopIcons />
          <WindowManager />
        </div>

        <div className="taskbar">
          <Taskbar />
        </div>

        <div className="start-menu">
          <StartMenu />
        </div>

        <AdminPanel />
      </div>
    </div>
  );
}
