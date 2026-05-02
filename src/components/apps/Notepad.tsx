import { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { useFileStore } from '../../store/fileStore';
import { useDesktopStore } from '../../store/desktopStore';
import { useNotificationStore } from '../../store/notificationStore';

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
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic text-gray-300">$1</em>');

    // Code inline
    html = html.replace(/`(.*?)`/gim, '<code class="bg-gray-800 text-primary-400 px-1 rounded font-mono text-sm">$1</code>');

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
    <div className="w-full h-full flex flex-col bg-os-ink-950 border-b border-white/[0.08]">
      {/* Toolbar */}
      <div className="border-b border-white/[0.08] p-2 flex items-center gap-2 bg-white/[0.02]">
        {/* Save buttons */}
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges && !!fileId}
          className={`px-3 py-1 text-sm rounded flex items-center gap-1 transition-all ${hasUnsavedChanges || !fileId
            ? 'bg-os-ink-700 text-white hover:bg-os-ink-600'
            : 'bg-white/[0.04] text-white/30 cursor-not-allowed'
            }`}
        >
          <Icons.Save className="w-3 h-3" />
          Save {hasUnsavedChanges && '*'}
        </button>
        <button
          onClick={handleSaveAs}
          className="px-3 py-1 text-sm hover:bg-white/10 rounded flex items-center gap-1 text-white transition-colors"
        >
          <Icons.FilePlus className="w-3 h-3" />
          Save As
        </button>

        <div className="h-6 w-px bg-white/[0.08] mx-1" />

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-os-ink-900 rounded p-1">
          <button
            onClick={() => setViewMode('edit')}
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-all ${viewMode === 'edit' ? 'bg-white/[0.12] text-white' : 'text-white/40 hover:text-white'
              }`}
          >
            <Icons.Edit3 className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-all ${viewMode === 'split' ? 'bg-white/[0.12] text-white' : 'text-white/40 hover:text-white'
              }`}
          >
            <Icons.Columns className="w-3 h-3" />
            Split
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-all ${viewMode === 'preview' ? 'bg-white/[0.12] text-white' : 'text-white/40 hover:text-white'
              }`}
          >
            <Icons.Eye className="w-3 h-3" />
            Preview
          </button>
        </div>

        {/* Auto-save toggle */}
        <button
          onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
          className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-all ${autoSaveEnabled ? 'bg-green-500/[0.15] text-green-400' : 'bg-white/[0.04] text-white/40'
            }`}
          title={autoSaveEnabled ? 'Auto-save enabled' : 'Auto-save disabled'}
        >
          <Icons.RefreshCw className={`w-3 h-3 ${autoSaveEnabled ? 'animate-spin' : ''}`} />
          Auto-save
        </button>

        <div className="flex-1" />

        {fileId && (
          <span className="text-xs text-white/40">
            Editing: {window?.title || 'Untitled'}
          </span>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? 'w-1/2 border-r border-white/10' : 'flex-1'}>
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
                className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="border-t border-white/[0.08] px-3 py-1 text-xs text-white/40 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <span>Characters: {text.length}</span>
          <span>Words: {wordCount}</span>
          <span>Lines: {text.split('\n').length}</span>
        </div>
        {autoSaveEnabled && hasUnsavedChanges && (
          <span className="text-amber-400 flex items-center gap-1">
            <Icons.Clock className="w-3 h-3" />
            Saving in 2s...
          </span>
        )}
      </div>
    </div>
  );
}
