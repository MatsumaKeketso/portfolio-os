import * as Icons from 'lucide-react';
import { FileItem } from '../../types';
import { AppShell, AppToolbar, AppContent, appSoftButtonClass } from '../ui/AppShell';
import { formatFileSize } from '../../lib/fileUtils';
import { cn } from '../../lib/utils';

interface PDFReaderProps {
  file?: FileItem;
}

export function PDFReader({ file }: PDFReaderProps) {
  if (!file) {
    return (
      <AppShell>
        <AppContent className="flex items-center justify-center">
          <div className="text-center">
            <Icons.FileType className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-sm text-white/30">No PDF loaded</p>
          </div>
        </AppContent>
      </AppShell>
    );
  }

  const url = file.dataUrl ?? '';

  return (
    <AppShell>
      <AppToolbar>
        {file.size && (
          <span className="text-xs text-white/30 shrink-0">{formatFileSize(file.size)}</span>
        )}
        <div className="flex-1" />
        {url && (
          <a
            href={url}
            download={file.name}
            className={cn(appSoftButtonClass, 'flex items-center gap-1.5 px-3 py-1.5 text-xs shrink-0')}
          >
            <Icons.Download className="w-3 h-3" />
            Download
          </a>
        )}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(appSoftButtonClass, 'flex items-center gap-1.5 px-3 py-1.5 text-xs shrink-0')}
          >
            <Icons.ExternalLink className="w-3 h-3" />
            Open
          </a>
        )}
      </AppToolbar>

      <div className="flex-1 overflow-hidden min-h-0 relative">
        {url ? (
          <iframe
            src={url}
            className="w-full h-full border-0 bg-white"
            title={file.name}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-os-ink-900 border border-os-line-dark flex items-center justify-center">
              <Icons.FileType className="w-7 h-7 text-white/30" />
            </div>
            <p className="text-sm text-white/70 font-medium">{file.name}</p>
            <p className="text-xs text-white/50 max-w-sm leading-relaxed">
              This file was saved without an attachment. Re-upload the PDF from Archive to enable preview and download.
            </p>
            <p className="text-[11px] text-white/30">
              (Older uploads predate the PDF upload fix — they store metadata only.)
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
