import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { FileItem } from '../../types';
import { getFileTypeInfo, getLanguageFromExtension, formatFileSize } from '../../lib/fileUtils';

interface FileViewerProps {
  file: FileItem;
}

export function FileViewer({ file }: FileViewerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  const fileTypeInfo = getFileTypeInfo(file.name, file.mimeType);
  const language = getLanguageFromExtension(file.name);

  useEffect(() => {
    loadFileContent();
  }, [file.id]);

  const loadFileContent = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Loading file:', file);

      // If file has dataUrl, use it directly
      if (file.dataUrl) {
        setContent(file.dataUrl);
      }
      // If file only has content, create a Blob URL for iframe viewing
      else if (file.content) {
        const mimeType = file.mimeType || 'text/plain';
        const blob = new Blob([file.content], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        setContent(blobUrl);

        // Cleanup blob URL when component unmounts or file changes
        return () => URL.revokeObjectURL(blobUrl);
      }
      else {
        console.error('File missing content and dataUrl:', file);
        setError(`No content available for this file.`);
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
            <p className="text-gray-400">Loading file...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Icons.AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 mb-2">{error}</p>
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
            <p className="text-sm text-gray-400 mb-6">{fileTypeInfo.description}</p>
            <p className="text-xs text-gray-500">No URL available for this file.</p>
          </div>
        </div>
      );
    }

    // Detect media type based on file category
    const category = fileTypeInfo.category;

    return (
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border-b border-white/10">
          {fileTypeInfo.icon && (
            <fileTypeInfo.icon className={`w-4 h-4 ${fileTypeInfo.color}`} />
          )}
          <span className="text-sm text-gray-300">{file.name}</span>
          <div className="flex-1" />
          {file.size && (
            <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
          >
            <Icons.ExternalLink className="w-3 h-3" />
            Open in New Tab
          </a>
        </div>

        {/* Content - native elements for media, iframe for documents */}
        <div className="flex-1 overflow-auto">
          {category === 'image' ? (
            <div className="flex items-center justify-center h-full p-4 bg-gray-900/50">
              <img
                src={url}
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded shadow-2xl"
              />
            </div>
          ) : category === 'video' ? (
            <div className="flex items-center justify-center h-full p-4 bg-black">
              <video
                src={url}
                controls
                className="max-w-full max-h-full rounded shadow-2xl"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : category === 'audio' ? (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-gray-900 to-gray-800">
              <Icons.Music className="w-24 h-24 text-primary-500 mb-8" />
              <h3 className="text-xl font-semibold text-white mb-2">{file.name}</h3>
              <audio src={url} controls className="w-full max-w-md mt-4">
                Your browser does not support the audio tag.
              </audio>
            </div>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col"
    >
      {renderContent()}

      {/* Debug Panel (can be toggled) */}
      <details className="border-t border-white/10 bg-gray-900/50">
        <summary className="px-4 py-2 text-xs text-gray-400 cursor-pointer hover:bg-white/5">
          Debug Info (Click to expand)
        </summary>
        <div className="px-4 py-2 text-xs text-gray-300 space-y-1 max-h-32 overflow-auto">
          <div><span className="text-gray-500">File ID:</span> {file.id}</div>
          <div><span className="text-gray-500">Name:</span> {file.name}</div>
          <div><span className="text-gray-500">Type:</span> {file.type}</div>
          <div><span className="text-gray-500">MIME Type:</span> {file.mimeType || 'N/A'}</div>
          <div><span className="text-gray-500">Viewer Type:</span> {fileTypeInfo.viewerType}</div>
          <div><span className="text-gray-500">Has dataUrl:</span> {file.dataUrl ? 'Yes' : 'No'}</div>
          <div><span className="text-gray-500">Has content:</span> {file.content ? 'Yes' : 'No'}</div>
          <div><span className="text-gray-500">Size:</span> {file.size ? formatFileSize(file.size) : 'N/A'}</div>
          {file.dataUrl && (
            <div className="break-all">
              <span className="text-gray-500">Data URL (first 100 chars):</span> {file.dataUrl.substring(0, 100)}...
            </div>
          )}
        </div>
      </details>
    </motion.div>
  );
}
