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
      console.log('File type info:', fileTypeInfo);

      // If file has content property, use it
      if (file.content) {
        setContent(file.content);
      } else if (file.dataUrl) {
        // For files with dataUrl, we'll display them directly
        setContent(file.dataUrl);
      } else {
        console.error('File missing content and dataUrl:', file);
        setError(`File content not available. File type: ${file.type}, Has dataUrl: ${!!file.dataUrl}, Has content: ${!!file.content}`);
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

    switch (fileTypeInfo.viewerType) {
      case 'image':
        return (
          <div className="flex flex-col h-full">
            {/* Image Controls */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border-b border-white/10">
              <button
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="p-1.5 hover:bg-white/10 rounded text-white transition-colors"
                title="Zoom Out"
              >
                <Icons.ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-300 min-w-[60px] text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="p-1.5 hover:bg-white/10 rounded text-white transition-colors"
                title="Zoom In"
              >
                <Icons.ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="px-3 py-1.5 text-xs hover:bg-white/10 rounded text-white transition-colors"
              >
                Reset
              </button>
              <div className="flex-1" />
              <a
                href={file.dataUrl}
                download={file.name}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
              >
                <Icons.Download className="w-3 h-3" />
                Download
              </a>
            </div>

            {/* Image Display */}
            <div className="flex-1 overflow-auto bg-gray-900/50 flex items-center justify-center p-4">
              <img
                src={file.dataUrl}
                alt={file.name}
                style={{ transform: `scale(${zoom / 100})` }}
                className="max-w-full h-auto rounded shadow-2xl transition-transform"
              />
            </div>
          </div>
        );

      case 'video':
        if (!file.dataUrl) {
          return (
            <div className="flex items-center justify-center h-full bg-black">
              <div className="text-center text-white p-8">
                <Icons.AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Video Not Available</h3>
                <p className="text-gray-400 mb-4">This video file doesn't have a valid URL.</p>
                <p className="text-xs text-gray-500">File: {file.name}</p>
                <p className="text-xs text-gray-500">Type: {file.type}</p>
                <p className="text-xs text-gray-500 mt-2">Try re-uploading the video file.</p>
              </div>
            </div>
          );
        }
        return (
          <div className="flex flex-col h-full bg-black">
            {/* Video Controls Bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/90 border-b border-white/10">
              <Icons.Video className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">{file.name}</span>
              <div className="flex-1" />
              {file.size && (
                <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
              )}
            </div>

            {/* Video Player */}
            <div className="flex-1 flex items-center justify-center p-4">
              <video
                src={file.dataUrl}
                controls
                className="max-w-full max-h-full rounded shadow-2xl"
                autoPlay={false}
                onError={(e) => {
                  console.error('Video load error:', e);
                  setError('Failed to load video. The file may be corrupted or in an unsupported format.');
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="flex flex-col h-full items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-8">
            <Icons.Music className="w-24 h-24 text-primary-500 mb-8" />
            <h3 className="text-xl font-semibold text-white mb-2">{file.name}</h3>
            <p className="text-sm text-gray-400 mb-8">{fileTypeInfo.description}</p>
            <audio src={file.dataUrl} controls className="w-full max-w-md">
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      case 'pdf':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border-b border-white/10">
              <Icons.FileType className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-300">PDF Document</span>
              <div className="flex-1" />
              <a
                href={file.dataUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
              >
                <Icons.ExternalLink className="w-3 h-3" />
                Open in New Tab
              </a>
            </div>
            <iframe
              src={file.dataUrl}
              className="flex-1 w-full bg-white"
              title={file.name}
            />
          </div>
        );

      case 'code':
        return (
          <div className="flex flex-col h-full">
            {/* Code Toolbar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border-b border-white/10">
              <Icons.FileCode className={`w-4 h-4 ${fileTypeInfo.color}`} />
              <span className="text-sm text-gray-300">{language.toUpperCase()}</span>
              <div className="flex-1" />
              <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
            </div>

            {/* Code Display with Line Numbers */}
            <div className="flex-1 overflow-auto bg-gray-900/50">
              <div className="flex">
                {/* Line Numbers */}
                <div className="flex-shrink-0 bg-gray-800/30 px-4 py-4 select-none">
                  {content.split('\n').map((_, i) => (
                    <div key={i} className="text-xs text-gray-500 text-right leading-6">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Code Content */}
                <pre className="flex-1 p-4 overflow-x-auto">
                  <code className="text-sm text-gray-300 font-mono leading-6 whitespace-pre">
                    {content}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        );

      case 'text':
      case 'notepad':
        return (
          <div className="flex flex-col h-full">
            {/* Text Toolbar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border-b border-white/10">
              <Icons.FileText className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">{fileTypeInfo.description}</span>
              <div className="flex-1" />
              <span className="text-xs text-gray-400">
                {content.split('\n').length} lines · {content.length} characters
              </span>
            </div>

            {/* Text Display */}
            <div className="flex-1 overflow-auto bg-gray-900/50 p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed">
                {content}
              </pre>
            </div>
          </div>
        );

      case 'none':
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              {fileTypeInfo.icon && (
                <fileTypeInfo.icon className={`w-20 h-20 mx-auto mb-6 ${fileTypeInfo.color}`} />
              )}
              <h3 className="text-xl font-semibold text-white mb-2">{file.name}</h3>
              <p className="text-sm text-gray-400 mb-6">{fileTypeInfo.description}</p>

              {file.dataUrl && (
                <a
                  href={file.dataUrl}
                  download={file.name}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
                >
                  <Icons.Download className="w-4 h-4" />
                  Download File
                </a>
              )}

              {!file.dataUrl && (
                <p className="text-xs text-gray-500 mt-4">
                  This file type cannot be previewed in the browser.
                </p>
              )}
            </div>
          </div>
        );
    }
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
