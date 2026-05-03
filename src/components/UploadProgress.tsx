import React from 'react';
import { Upload, CheckCircle, XCircle, Loader } from 'lucide-react';
import { UploadProgress as UploadProgressType } from '../lib/uploadUtils';

interface UploadProgressProps {
  uploads: UploadProgressType[];
  onClose?: () => void;
  className?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  uploads,
  onClose,
  className = '',
}) => {
  if (uploads.length === 0) return null;

  const allCompleted = uploads.every(
    (upload) => upload.status === 'success' || upload.status === 'error'
  );

  return (
    <div className={`bg-os-ink-950 rounded-lg shadow-os-floating border border-white/[0.08] p-4 min-w-[320px] max-w-md ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold text-white">
            {allCompleted ? 'Upload Complete' : 'Uploading Files'}
          </h3>
        </div>
        {allCompleted && onClose && (
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/60 transition-colors"
            aria-label="Close"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {uploads.map((upload, index) => (
          <div key={`${upload.fileName}-${index}`} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {upload.status === 'uploading' && (
                  <Loader className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
                )}
                {upload.status === 'success' && (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
                {upload.status === 'error' && (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                <span className="text-sm text-white/60 truncate" title={upload.fileName}>
                  {upload.fileName}
                </span>
              </div>
              <span className="text-xs text-white/40 ml-2 flex-shrink-0">
                {upload.progress}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/[0.12] rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  upload.status === 'error'
                    ? 'bg-red-500'
                    : upload.status === 'success'
                    ? 'bg-green-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${upload.progress}%` }}
              />
            </div>

            {/* Error message */}
            {upload.error && (
              <p className="text-xs text-red-300 mt-1">{upload.error}</p>
            )}
          </div>
        ))}
      </div>

      {allCompleted && (
        <div className="mt-3 pt-3 border-t border-white/[0.08]">
          <p className="text-xs text-white/40">
            {uploads.filter((u) => u.status === 'success').length} of {uploads.length} files uploaded successfully
          </p>
        </div>
      )}
    </div>
  );
};

interface UploadProgressToastProps {
  uploads: UploadProgressType[];
  onClose?: () => void;
}

export const UploadProgressToast: React.FC<UploadProgressToastProps> = ({
  uploads,
  onClose,
}) => {
  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <UploadProgress uploads={uploads} onClose={onClose} />
    </div>
  );
};
