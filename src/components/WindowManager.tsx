import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { Window } from './Window';
import { Calculator } from './apps/Calculator';
import { Notepad } from './apps/Notepad';
import { FileExplorer } from './apps/FileExplorer';
import { Browser } from './apps/Browser';
import { Weather } from './apps/Weather';
import { TaskManager } from './apps/TaskManager';
import { About } from './apps/About';

function IFrameContent({ url, title }: { url: string; title: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="w-full h-full bg-white relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading {title}...</p>
          </div>
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center p-6">
            <p className="text-sm text-red-600 mb-2">Failed to load content</p>
            <p className="text-xs text-gray-500">{url}</p>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <iframe
        src={url}
        className="w-full h-full border-0"
        title={title}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}

export function WindowManager() {
  const { windows } = useDesktopStore();

  const renderWindowContent = (window: any) => {
    if (window.type === 'iframe' && window.url) {
      return <IFrameContent url={window.url} title={window.title} />;
    }

    if (window.type === 'component' && window.component) {
      switch (window.component) {
        case 'Calculator':
          return <Calculator />;
        case 'Notepad':
          return <Notepad window={window} />;
        case 'FileExplorer':
          return <FileExplorer />;
        case 'Browser':
          return <Browser />;
        case 'Weather':
          return <Weather />;
        case 'TaskManager':
          return <TaskManager />;
        case 'About':
          return <About />;
        default:
          return (
            <div className="w-full h-full flex items-center justify-center text-gray-500 bg-white">
              <div className="text-center">
                <p className="text-lg font-semibold mb-2">Component not found</p>
                <p className="text-sm">{window.component}</p>
              </div>
            </div>
          );
      }
    }

    if (window.type === 'static' && window.content) {
      return (
        <div className="w-full h-full bg-white p-6 overflow-y-auto">
          <div className="prose prose-sm max-w-none">{window.content}</div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500 bg-white">
        No content available
      </div>
    );
  };

  return (
    <AnimatePresence>
      {windows.map((window) => (
        <Window key={window.id} window={window}>
          {renderWindowContent(window)}
        </Window>
      ))}
    </AnimatePresence>
  );
}
