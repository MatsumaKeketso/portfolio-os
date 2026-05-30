import { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { useFileStore } from '../../store/fileStore';
import { useDesktopStore } from '../../store/desktopStore';
import { useNotificationStore } from '../../store/notificationStore';
import { AppShell, AppToolbar, AppContent, appSoftButtonClass } from '../ui/AppShell';
import { cn } from '../../lib/utils';

interface NotepadProps {
  window?: {
    content?: string;
    fileId?: string;
    title?: string;
  };
}

export function Notepad({ window }: NotepadProps = {}) {
  const fileStore = useFileStore();

  const { windows, updateWindow } = useDesktopStore();
  const { addNotification } = useNotificationStore();
  const [text, setText] = useState('Welcome to GenOS Notepad!\n\nStart typing your notes here...');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Find the current window to get fileId
  const currentWindow = windows.find(w => w.fileId === window?.fileId);
  const fileId = currentWindow?.fileId || window?.fileId;

  useEffect(() => {
    if (window?.content) {
      setText(window.content);
      setHasUnsavedChanges(false);
    }
  }, [window?.content]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && fileId) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer for 2 seconds
      autoSaveTimerRef.current = setTimeout(() => {
        fileStore.updateFileContent(fileId, text);
        setHasUnsavedChanges(false);
        addNotification({
          type: 'success',
          title: 'Auto-saved',
          message: 'Your changes have been saved',
          duration: 2000,
        });
      }, 2000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [text, hasUnsavedChanges, autoSaveEnabled, fileId, fileStore, addNotification]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    setHasUnsavedChanges(true);
  };

  // Simple markdown parser
  const parseMarkdown = (markdown: string): string => {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-4 mb-2">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-white">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic text-white/60">$1</em>');

    // Code inline
    html = html.replace(/`(.*?)`/gim, '<code class="bg-os-ink-800 text-primary-400 px-1 rounded font-mono text-sm">$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary-400 hover:text-primary-300 underline" target="_blank">$1</a>');

    // Line breaks
    html = html.replace(/\n/gim, '<br />');

    return html;
  };

  const handleSave = () => {
    if (fileId) {
      fileStore.updateFileContent(fileId, text);
      setHasUnsavedChanges(false);
    } else {
      handleSaveAs();
    }
  };

  const handleSaveAs = () => {
    const fileName = prompt('Enter file name:', 'untitled.txt');
    if (fileName) {
      const newFileId = `file-${Date.now()}`;
      fileStore.addFile({
        id: newFileId,
        name: fileName,
        type: 'file',
        parentId: null,
        path: `/${fileName}`,
        content: text,
        size: text.length,
        mimeType: 'text/plain',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      });
      setHasUnsavedChanges(false);

      // Update the current window to point to the new file
      if (currentWindow) {
        updateWindow(currentWindow.id, {
          fileId: newFileId,
          title: fileName
        });
      }
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <AppShell>
      <AppToolbar>
        {/* Save buttons */}
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges && !!fileId}
          className={cn(
            'os-interactive os-focus-ring px-3 py-1 text-sm rounded flex items-center gap-1',
            hasUnsavedChanges || !fileId
              ? 'bg-os-ink-800 text-white hover:bg-os-ink-700'
              : 'bg-os-ink-900 text-white/30 cursor-not-allowed'
          )}
        >
          <Icons.Save className="w-3 h-3" />
          Save {hasUnsavedChanges && '*'}
        </button>
        <button
          onClick={handleSaveAs}
          className={cn(appSoftButtonClass, 'px-3 py-1 text-sm flex items-center gap-1')}
        >
          <Icons.FilePlus className="w-3 h-3" />
          Save As
        </button>

        <div className="h-6 w-px bg-os-line-dark mx-1" />

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-os-ink-950 rounded p-1">
          {(['edit', 'split', 'preview'] as const).map((mode) => {
            const Icon = mode === 'edit' ? Icons.Edit3 : mode === 'split' ? Icons.Columns : Icons.Eye;
            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'os-interactive os-focus-ring px-2 py-1 text-xs rounded flex items-center gap-1',
                  viewMode === mode
                    ? 'bg-os-ink-700 text-white'
                    : 'text-white/40 hover:text-white'
                )}
              >
                <Icon className="w-3 h-3" />
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Auto-save toggle */}
        <button
          onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
          className={cn(
            'os-interactive os-focus-ring px-2 py-1 text-xs rounded flex items-center gap-1',
            autoSaveEnabled
              ? 'bg-success-subtle text-fg-success'
              : 'bg-os-ink-900 text-white/40'
          )}
          title={autoSaveEnabled ? 'Auto-save enabled' : 'Auto-save disabled'}
        >
          <Icons.RefreshCw className={cn('w-3 h-3', autoSaveEnabled && 'animate-spin')} />
          Auto-save
        </button>

        <div className="flex-1" />

        {fileId && (
          <span className="text-xs text-white/40">
            Editing: {window?.title || 'Untitled'}
          </span>
        )}
      </AppToolbar>

      <AppContent className="flex overflow-hidden">
        {/* Editor pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? 'w-1/2 border-r border-os-line-dark' : 'flex-1'}>
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full h-full p-4 resize-none focus:outline-none font-mono text-sm bg-transparent text-white placeholder-gray-500"
              spellCheck={false}
              placeholder="Start typing your notes here... Try markdown formatting!"
            />
          </div>
        )}

        {/* Preview pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? 'w-1/2' : 'flex-1'}>
            <div className="w-full h-full p-4 overflow-y-auto">
              <div
                className="prose prose-invert max-w-none text-white/60 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }}
              />
            </div>
          </div>
        )}
      </AppContent>

      {/* Status bar */}
      <div className="border-t border-os-line-dark px-3 py-1 text-xs text-white/40 flex items-center justify-between bg-os-ink-900 shrink-0">
        <div className="flex items-center gap-4">
          <span>Characters: {text.length}</span>
          <span>Words: {wordCount}</span>
          <span>Lines: {text.split('\n').length}</span>
        </div>
        {autoSaveEnabled && hasUnsavedChanges && (
          <span className="text-fg-warning flex items-center gap-1">
            <Icons.Clock className="w-3 h-3" />
            Saving in 2s...
          </span>
        )}
      </div>
    </AppShell>
  );
}
