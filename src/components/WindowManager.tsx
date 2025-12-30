import { AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '../store/desktopStore';
import { Window } from './Window';
import { Calculator } from './apps/Calculator';
import { Notepad } from './apps/Notepad';
import { FileExplorer } from './apps/FileExplorer';
import { Browser } from './apps/Browser';
import { Weather } from './apps/Weather';
import { TaskManager } from './apps/TaskManager';
import { About } from './apps/About';

export function WindowManager() {
  const { windows } = useDesktopStore();

  const renderWindowContent = (window: any) => {
    if (window.type === 'iframe' && window.url) {
      return (
        <div className="w-full h-full bg-white">
          <iframe
            src={window.url}
            className="w-full h-full border-0"
            title={window.title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    if (window.type === 'component' && window.component) {
      switch (window.component) {
        case 'Calculator':
          return <Calculator />;
        case 'Notepad':
          return <Notepad />;
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
