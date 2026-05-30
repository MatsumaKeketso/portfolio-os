import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { FileItem } from '../../types';
import { getFileTypeInfo, formatFileSize } from '../../lib/fileUtils';
import { AppShell, appSoftButtonClass } from '../ui/AppShell';
import { cn } from '../../lib/utils';

interface FileViewerProps {
  file: FileItem;
}

// Converts any URL (remote https:// or base64 data:) into a local blob: URL.
// blob: URLs are same-origin so iframes render them without CORS / content-disposition issues.
function useBlobUrl(url: string): { blobUrl: string | null; loading: boolean; error: boolean } {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let revoke: string | null = null;
    setLoading(true);
    setError(false);
    setBlobUrl(null);

    const run = async () => {
      try {
        let blob: Blob;
        if (url.startsWith('data:')) {
          const [meta, b64] = url.split(',');
          const mime = meta.split(':')[1]?.split(';')[0] ?? 'application/pdf';
          const binary = atob(b64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          blob = new Blob([bytes], { type: mime });
        } else {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          blob = await res.blob();
        }
        revoke = URL.createObjectURL(blob);
        setBlobUrl(revoke);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [url]);

  return { blobUrl, loading, error };
}

function PdfViewer({ url, fileName }: { url: string; fileName: string }) {
  const { blobUrl, loading, error } = useBlobUrl(url);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-3">
        <Icons.Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        <span className="text-sm text-white/40">Loading PDF…</span>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 p-8 text-center">
        <Icons.FileType className="w-16 h-16 text-fg-error/60" />
        <p className="text-sm text-white/50 max-w-xs leading-relaxed">
          Could not load this PDF for inline viewing.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
        >
          <Icons.ExternalLink className="w-4 h-4" /> Open PDF
        </a>
      </div>
    );
  }

  return (
    <iframe
      src={blobUrl}
      className="w-full h-full border-0"
      title={fileName}
    />
  );
}

export function FileViewer({ file }: FileViewerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileTypeInfo = getFileTypeInfo(file.name, file.mimeType);

  useEffect(() => {
    loadFileContent();
  }, [file.id]);

  const loadFileContent = async () => {
    setLoading(true);
    setError(null);

    try {
      if (file.dataUrl) {
        setContent(file.dataUrl);
      } else if (file.content) {
        const mimeType = file.mimeType || 'text/plain';
        const blob = new Blob([file.content], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        setContent(blobUrl);
        return () => URL.revokeObjectURL(blobUrl);
      } else {
        setError('No content available for this file.');
      }
    } catch (err) {
      setError('Failed to load file');
      console.error('Error loading file:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Icons.Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
            <p className="text-white/40">Loading file…</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Icons.AlertCircle className="w-12 h-12 text-fg-error mx-auto mb-4" />
            <p className="text-fg-error mb-2">{error}</p>
            <button
              onClick={loadFileContent}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    const url = file.dataUrl || content;

    if (!url) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            {fileTypeInfo.icon && (
              <fileTypeInfo.icon className={`w-20 h-20 mx-auto mb-6 ${fileTypeInfo.color}`} />
            )}
            <h3 className="text-xl font-semibold text-white mb-2">{file.name}</h3>
            <p className="text-sm text-white/40 mb-6">{fileTypeInfo.description}</p>
            <p className="text-xs text-white/30">No URL available for this file.</p>
          </div>
        </div>
      );
    }

    const category = fileTypeInfo.category;

    return (
      // flex-1 min-h-0 so the debug panel below gets its natural height and this fills the rest
      <div className="flex flex-col flex-1 min-h-0">
        {/* Toolbar */}
        <div className="flex shrink-0 items-center gap-2 px-4 py-2 bg-os-ink-900 border-b border-os-line-dark">
          {fileTypeInfo.icon && (
            <fileTypeInfo.icon className={`w-4 h-4 ${fileTypeInfo.color}`} />
          )}
          <span className="text-sm text-white/60">{file.name}</span>
          <div className="flex-1" />
          {file.size && (
            <span className="text-xs text-white/40">{formatFileSize(file.size)}</span>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(appSoftButtonClass, 'flex items-center gap-1 px-3 py-1.5 text-xs')}
          >
            <Icons.ExternalLink className="w-3 h-3" />
            Open in New Tab
          </a>
        </div>

        {/* Content — overflow-hidden gives iframes a real pixel height */}
        <div className="flex-1 overflow-hidden min-h-0">
          {category === 'image' ? (
            <div className="flex items-center justify-center h-full p-4 bg-os-ink-950">
              <img
                src={url}
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded shadow-2xl"
              />
            </div>
          ) : category === 'video' ? (
            <div className="flex items-center justify-center h-full p-4 bg-black">
              <video src={url} controls className="max-w-full max-h-full rounded shadow-2xl">
                Your browser does not support the video tag.
              </video>
            </div>
          ) : category === 'audio' ? (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-os-ink-950">
              <Icons.Music className="w-24 h-24 text-primary-500 mb-8" />
              <h3 className="text-xl font-semibold text-white mb-2">{file.name}</h3>
              <audio src={url} controls className="w-full max-w-md mt-4">
                Your browser does not support the audio tag.
              </audio>
            </div>
          ) : category === 'pdf' ? (
            <PdfViewer url={url} fileName={file.name} />
          ) : (
            <iframe
              src={url}
              className="w-full h-full bg-white"
              title={file.name}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full flex flex-col"
      >
        {renderContent()}

        {/* Debug Panel */}
        <details className="shrink-0 border-t border-os-line-dark bg-os-ink-900">
          <summary className="px-4 py-2 text-xs text-white/40 cursor-pointer hover:bg-os-ink-800/60">
            Debug Info (Click to expand)
          </summary>
          <div className="px-4 py-2 text-xs text-white/60 space-y-1 max-h-32 overflow-auto">
            <div><span className="text-white/30">File ID:</span> {file.id}</div>
            <div><span className="text-white/30">Name:</span> {file.name}</div>
            <div><span className="text-white/30">Type:</span> {file.type}</div>
            <div><span className="text-white/30">MIME Type:</span> {file.mimeType || 'N/A'}</div>
            <div><span className="text-white/30">Viewer Type:</span> {fileTypeInfo.viewerType}</div>
            <div><span className="text-white/30">Has dataUrl:</span> {file.dataUrl ? 'Yes' : 'No'}</div>
            <div><span className="text-white/30">Has content:</span> {file.content ? 'Yes' : 'No'}</div>
            <div><span className="text-white/30">Size:</span> {file.size ? formatFileSize(file.size) : 'N/A'}</div>
            {file.dataUrl && (
              <div className="break-all">
                <span className="text-white/30">Data URL (first 100 chars):</span> {file.dataUrl.substring(0, 100)}…
              </div>
            )}
          </div>
        </details>
      </motion.div>
    </AppShell>
  );
}
