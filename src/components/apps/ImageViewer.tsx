import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { FileItem } from '../../types';
import { useDesktopStore } from '../../store/desktopStore';
import { useFileStore } from '../../store/fileStore';
import { AppShell, AppToolbar, appSoftButtonClass } from '../ui/AppShell';
import { formatFileSize } from '../../lib/fileUtils';
import { cn } from '../../lib/utils';

interface ImageViewerProps {
  file?: FileItem;
  windowId?: string;
}

type FitMode = 'contain' | 'cover' | 'width' | 'actual';

const FIT_ICONS: Record<FitMode, React.FC<{ className?: string }>> = {
  contain: Icons.Maximize2,
  cover: Icons.Crop,
  width: Icons.ArrowLeftRight,
  actual: Icons.ScanLine,
};
const FIT_LABELS: Record<FitMode, string> = {
  contain: 'Fit',
  cover: 'Fill',
  width: 'Width',
  actual: 'Actual',
};

const GALLERY_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);
const GALLERY_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

const isGalleryImage = (file: FileItem) => {
  if (!file.dataUrl || file.type !== 'image') return false;
  const mimeType = file.mimeType?.toLowerCase();
  if (mimeType && GALLERY_IMAGE_MIME_TYPES.has(mimeType)) return true;
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension ? GALLERY_IMAGE_EXTENSIONS.has(extension) : false;
};

export function ImageViewer({ file, windowId }: ImageViewerProps) {
  const [fit, setFit] = useState<FitMode>('contain');
  const [zoom, setZoom] = useState(1);
  const [activeFile, setActiveFile] = useState<FileItem | undefined>(file);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const files = useFileStore((state) => state.files);
  const updateWindow = useDesktopStore((state) => state.updateWindow);
  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<Array<HTMLImageElement | null>>([]);
  const panRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  useEffect(() => {
    return () => {
      imageRefs.current.forEach((img) => {
        if (img) img.src = '';
      });
      imageRefs.current = [];
    };
  }, []);

  useEffect(() => {
    setActiveFile(file);
    setZoom(1);
    setNaturalSize({ width: 0, height: 0 });
    if (viewportRef.current) {
      viewportRef.current.scrollLeft = 0;
      viewportRef.current.scrollTop = 0;
    }
  }, [file]);

  const galleryFiles = useMemo(
    () => files
      .filter((candidate) => candidate.parentId === activeFile?.parentId && isGalleryImage(candidate))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })),
    [files, activeFile?.parentId],
  );
  const currentIndex = activeFile ? galleryFiles.findIndex((candidate) => candidate.id === activeFile.id) : -1;
  const imageCount = galleryFiles.length;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < imageCount - 1;

  const resetViewport = useCallback(() => {
    setZoom(1);
    setNaturalSize({ width: 0, height: 0 });
    requestAnimationFrame(() => {
      if (viewportRef.current) {
        viewportRef.current.scrollLeft = 0;
        viewportRef.current.scrollTop = 0;
      }
    });
  }, []);

  const showImage = useCallback((nextFile: FileItem) => {
    setActiveFile(nextFile);
    resetViewport();
    if (windowId) {
      updateWindow(windowId, {
        fileId: nextFile.id,
        file: nextFile,
        title: nextFile.name,
      });
    }
  }, [resetViewport, updateWindow, windowId]);

  const goToImage = useCallback((direction: -1 | 1) => {
    const nextIndex = currentIndex + direction;
    const nextFile = galleryFiles[nextIndex];
    if (nextFile) showImage(nextFile);
  }, [currentIndex, galleryFiles, showImage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' && canGoPrevious) {
        event.preventDefault();
        goToImage(-1);
      }
      if (event.key === 'ArrowRight' && canGoNext) {
        event.preventDefault();
        goToImage(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoPrevious, canGoNext, currentIndex, galleryFiles, goToImage]);

  if (!activeFile) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center bg-os-ink-950/80">
          <div className="text-center">
            <Icons.Image className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-sm text-white/30">No image loaded</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const url = activeFile.dataUrl ?? null;

  const setFitMode = (mode: FitMode) => {
    setFit(mode);
    resetViewport();
  };

  const setZoomLevel = (nextZoom: number) => {
    setFit('actual');
    setZoom(Math.min(4, Math.max(0.25, nextZoom)));
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!url || (!e.ctrlKey && !e.metaKey)) return;
    e.preventDefault();
    const viewport = viewportRef.current;
    if (!viewport) return;

    const previousZoom = zoom;
    const nextZoom = Math.min(4, Math.max(0.25, zoom + (e.deltaY > 0 ? -0.12 : 0.12)));
    const rect = viewport.getBoundingClientRect();
    const pointerX = e.clientX - rect.left + viewport.scrollLeft;
    const pointerY = e.clientY - rect.top + viewport.scrollTop;

    setFit('actual');
    setZoom(nextZoom);

    requestAnimationFrame(() => {
      const scale = nextZoom / previousZoom;
      viewport.scrollLeft = pointerX * scale - (e.clientX - rect.left);
      viewport.scrollTop = pointerY * scale - (e.clientY - rect.top);
    });
  };

  const canPan = fit === 'actual' || fit === 'width';

  const handlePanStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!url || !canPan || e.button !== 0) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.setPointerCapture(e.pointerId);
    setIsPanning(true);
    panRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
  };

  const handlePanMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollLeft = panRef.current.scrollLeft - (e.clientX - panRef.current.x);
    viewport.scrollTop = panRef.current.scrollTop - (e.clientY - panRef.current.y);
  };

  const handlePanEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (viewportRef.current?.hasPointerCapture(e.pointerId)) {
      viewportRef.current.releasePointerCapture(e.pointerId);
    }
    setIsPanning(false);
  };

  const imagePixelSize = {
    width: naturalSize.width ? naturalSize.width * zoom : undefined,
    height: naturalSize.height ? naturalSize.height * zoom : undefined,
  };

  return (
    <AppShell>
      <AppToolbar>
        <Icons.Image className="w-4 h-4 text-fg-brand shrink-0" />

        <div className="flex items-center rounded-lg bg-os-ink-900 border border-os-line-dark overflow-hidden shrink-0">
          <button
            onClick={() => goToImage(-1)}
            disabled={!canGoPrevious}
            title="Previous image"
            className="os-interactive os-focus-ring px-2.5 py-1.5 text-os-text-inverse/45 hover:text-os-text-inverse/80 hover:bg-os-ink-800/60 disabled:opacity-25 disabled:pointer-events-none"
          >
            <Icons.ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="min-w-[54px] px-2 py-1.5 text-center text-[11px] tabular-nums text-os-text-inverse/55">
            {currentIndex >= 0 ? `${currentIndex + 1}/${imageCount}` : '1/1'}
          </span>
          <button
            onClick={() => goToImage(1)}
            disabled={!canGoNext}
            title="Next image"
            className="os-interactive os-focus-ring px-2.5 py-1.5 text-os-text-inverse/45 hover:text-os-text-inverse/80 hover:bg-os-ink-800/60 disabled:opacity-25 disabled:pointer-events-none"
          >
            <Icons.ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="text-sm text-white/80 truncate flex-1">{activeFile.name}</span>
        {activeFile.size && (
          <span className="text-xs text-white/30 shrink-0">{formatFileSize(activeFile.size)}</span>
        )}

        {/* Fit controls */}
        <div className="flex items-center rounded-lg bg-os-ink-900 border border-os-line-dark overflow-hidden shrink-0">
          {(['contain', 'cover', 'width', 'actual'] as FitMode[]).map(mode => {
            const Icon = FIT_ICONS[mode];
            return (
              <button
                key={mode}
                onClick={() => setFitMode(mode)}
                title={FIT_LABELS[mode]}
                className={cn(
                  'os-interactive os-focus-ring px-2.5 py-1.5 text-xs flex items-center gap-1',
                  fit === mode
                    ? 'bg-brand-600/20 text-fg-brand border-x border-stroke-brand/40'
                    : 'text-os-text-inverse/40 hover:text-os-text-inverse/80 hover:bg-os-ink-800/60'
                )}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{FIT_LABELS[mode]}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center rounded-lg bg-os-ink-900 border border-os-line-dark overflow-hidden shrink-0">
          <button
            onClick={() => setZoomLevel(zoom - 0.25)}
            disabled={!url}
            title="Zoom out"
            className="os-interactive os-focus-ring px-2.5 py-1.5 text-os-text-inverse/45 hover:text-os-text-inverse/80 hover:bg-os-ink-800/60 disabled:opacity-25 disabled:pointer-events-none"
          >
            <Icons.Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            disabled={!url}
            title="Reset zoom"
            className="os-interactive os-focus-ring min-w-[52px] px-2 py-1.5 text-[11px] tabular-nums text-os-text-inverse/55 hover:text-os-text-inverse/80 hover:bg-os-ink-800/60 disabled:opacity-25 disabled:pointer-events-none"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={() => setZoomLevel(zoom + 0.25)}
            disabled={!url}
            title="Zoom in"
            className="os-interactive os-focus-ring px-2.5 py-1.5 text-os-text-inverse/45 hover:text-os-text-inverse/80 hover:bg-os-ink-800/60 disabled:opacity-25 disabled:pointer-events-none"
          >
            <Icons.Plus className="w-3 h-3" />
          </button>
        </div>

        {url && (
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-os-line-dark bg-os-ink-900 px-2.5 py-1.5 text-[11px] text-white/35 shrink-0">
            <Icons.Hand className="w-3 h-3" />
            <span>{canPan ? 'Drag to pan' : 'Use Width or Actual to scroll'}</span>
          </div>
        )}

        {url && (
          <a
            href={url}
            download={activeFile.name}
            className={cn(appSoftButtonClass, 'flex items-center gap-1.5 px-3 py-1.5 text-xs shrink-0')}
          >
            <Icons.Download className="w-3 h-3" />
          </a>
        )}
      </AppToolbar>

      <div
        ref={viewportRef}
        onWheel={handleWheel}
        onPointerDown={handlePanStart}
        onPointerMove={handlePanMove}
        onPointerUp={handlePanEnd}
        onPointerCancel={handlePanEnd}
        className={cn(
          'flex-1 min-h-0 overscroll-contain',
          fit === 'cover' ? 'bg-os-ink-950' : 'bg-os-ink-950/80',
          canPan
            ? cn('overflow-auto', isPanning ? 'cursor-grabbing' : 'cursor-grab')
            : 'overflow-hidden flex items-center justify-center',
        )}
      >
        {url ? (
          fit === 'actual' ? (
            <div
              className="min-w-full min-h-full p-6"
              style={{ paddingBottom: 'calc(24px + var(--window-cutout-bottom, 0px))' }}
            >
              <img
                ref={(node) => { imageRefs.current[0] = node; }}
                src={url}
                alt={activeFile.name}
                draggable={false}
                onLoad={(e) => setNaturalSize({
                  width: e.currentTarget.naturalWidth,
                  height: e.currentTarget.naturalHeight,
                })}
                className="block max-w-none max-h-none select-none"
                style={imagePixelSize}
              />
            </div>
          ) : fit === 'width' ? (
            <div
              className="min-w-full min-h-full p-6"
              style={{ paddingBottom: 'calc(24px + var(--window-cutout-bottom, 0px))' }}
            >
              <img
                ref={(node) => { imageRefs.current[1] = node; }}
                src={url}
                alt={activeFile.name}
                draggable={false}
                onLoad={(e) => setNaturalSize({
                  width: e.currentTarget.naturalWidth,
                  height: e.currentTarget.naturalHeight,
                })}
                className="block w-full h-auto select-none"
              />
            </div>
          ) : (
            <img
              ref={(node) => { imageRefs.current[2] = node; }}
              src={url}
              alt={activeFile.name}
              draggable={false}
              onLoad={(e) => setNaturalSize({
                width: e.currentTarget.naturalWidth,
                height: e.currentTarget.naturalHeight,
              })}
              className={cn(
                'max-w-full max-h-full select-none',
                fit === 'cover' ? 'w-full h-full object-cover' : 'object-contain',
              )}
            />
          )
        ) : (
          <div className="text-center p-8">
            <Icons.AlertCircle className="w-12 h-12 text-fg-error/60 mx-auto mb-4" />
            <p className="text-sm text-white/50">No URL available for this image.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
