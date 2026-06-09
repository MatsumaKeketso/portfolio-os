import * as Icons from 'lucide-react';
import { FileItem } from '../../types';
import { AppShell, AppToolbar, appSoftButtonClass } from '../ui/AppShell';
import { formatFileSize } from '../../lib/fileUtils';
import { cn } from '../../lib/utils';

interface VideoPlayerProps {
  file?: FileItem;
}

export function VideoPlayer({ file }: VideoPlayerProps) {
  if (!file) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center bg-os-ink-950">
          <div className="text-center">
            <Icons.PlayCircle className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-sm text-white/30">No video loaded</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const url = file.dataUrl ?? (file.content ? URL.createObjectURL(new Blob([file.content])) : null);

  return (
    <AppShell>
      <AppToolbar>
        <Icons.PlayCircle className="w-4 h-4 text-fg-brand shrink-0" />
        <span className="text-sm text-white/80 truncate flex-1">{file.name}</span>
        {file.size && (
          <span className="text-xs text-white/30 shrink-0">{formatFileSize(file.size)}</span>
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

      <div className="flex-1 overflow-hidden min-h-0 bg-os-ink-950 flex items-center justify-center">
        {url ? (
          <video
            src={url}
            controls
            autoPlay={false}
            className="max-w-full max-h-full"
            style={{ outline: 'none' }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="text-center p-8">
            <Icons.AlertCircle className="w-12 h-12 text-fg-error/60 mx-auto mb-4" />
            <p className="text-sm text-white/50">No URL available for this video.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
