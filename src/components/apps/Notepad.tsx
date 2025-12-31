import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useFileStore } from '../../store/fileStore';
import { useDesktopStore } from '../../store/desktopStore';

interface NotepadProps {
  window?: {
    content?: string;
    fileId?: string;
    title?: string;
  };
}

export function Notepad({ window }: NotepadProps = {}) {
  const fileStore = useFileStore();
  const { windows } = useDesktopStore();
  const [text, setText] = useState('Welcome to PortfolioOS Notepad!\n\nStart typing your notes here...');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Find the current window to get fileId
  const currentWindow = windows.find(w => w.fileId === window?.fileId);
  const fileId = currentWindow?.fileId || window?.fileId;

  useEffect(() => {
    if (window?.content) {
      setText(window.content);
      setHasUnsavedChanges(false);
    }
  }, [window?.content]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (fileId) {
      fileStore.updateFileContent(fileId, text);
      setHasUnsavedChanges(false);
    }
  };

  const handleSaveAs = () => {
    const fileName = prompt('Enter file name:', 'untitled.txt');
    if (fileName) {
      fileStore.addFile({
        id: `file-${Date.now()}`,
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
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 p-2 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges || !fileId}
          className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
            hasUnsavedChanges && fileId
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Icons.Save className="w-3 h-3" />
          Save {hasUnsavedChanges && '*'}
        </button>
        <button
          onClick={handleSaveAs}
          className="px-3 py-1 text-sm hover:bg-gray-100 rounded flex items-center gap-1"
        >
          <Icons.FilePlus className="w-3 h-3" />
          Save As
        </button>
        <div className="flex-1" />
        {fileId && (
          <span className="text-xs text-gray-500">
            Editing: {window?.title || 'Untitled'}
          </span>
        )}
      </div>
      <textarea
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        className="flex-1 w-full p-4 resize-none focus:outline-none font-mono text-sm"
        spellCheck={false}
        placeholder="Start typing your notes here..."
      />
      <div className="border-t border-gray-200 px-3 py-1 text-xs text-gray-500 flex items-center justify-between">
        <span>Characters: {text.length}</span>
        <span>Lines: {text.split('\n').length}</span>
      </div>
    </div>
  );
}
