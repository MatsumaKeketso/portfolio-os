import { AnimatePresence } from 'framer-motion';
import { useState, lazy, Suspense } from 'react';
import { ExternalLink, Github, Loader2 } from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { Window } from './Window';
import { ErrorBoundary } from './ErrorBoundary';

// Lazy load all apps for code splitting
const Calculator = lazy(() => import('./apps/Calculator').then(m => ({ default: m.Calculator })));
const Notepad = lazy(() => import('./apps/Notepad').then(m => ({ default: m.Notepad })));
const FileExplorer = lazy(() => import('./apps/FileExplorer').then(m => ({ default: m.FileExplorer })));
const FileViewer = lazy(() => import('./apps/FileViewer').then(m => ({ default: m.FileViewer })));
const Browser = lazy(() => import('./apps/Browser').then(m => ({ default: m.Browser })));
const Weather = lazy(() => import('./apps/Weather').then(m => ({ default: m.Weather })));
const TaskManager = lazy(() => import('./apps/TaskManager').then(m => ({ default: m.TaskManager })));
const CV = lazy(() => import('./apps/CV').then(m => ({ default: m.CV })));
const AboutOS = lazy(() => import('./apps/AboutOS').then(m => ({ default: m.AboutOS })));
const Feedback = lazy(() => import('./apps/Feedback').then(m => ({ default: m.Feedback })));
const AdminPanel = lazy(() => import('./AdminPanel').then(m => ({ default: m.AdminPanel })));
// Legacy apps — still launchable if pinned/bookmarked, not in default app list
const About = lazy(() => import('./apps/About').then(m => ({ default: m.About })));
const Settings = lazy(() => import('./apps/Settings').then(m => ({ default: m.Settings })));
const Resume = lazy(() => import('./apps/Resume').then(m => ({ default: m.Resume })));
const Portfolio = lazy(() => import('./apps/Portfolio').then(m => ({ default: m.Portfolio })));
const Skills = lazy(() => import('./apps/Skills').then(m => ({ default: m.Skills })));
const Contact = lazy(() => import('./apps/Contact').then(m => ({ default: m.Contact })));

function IFrameContent({ url, title }: { url: string; title: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  })();
  const isBlockedEmbedHost = host === 'github.com' || host.endsWith('.github.com');

  if (isBlockedEmbedHost) {
    return (
      <div className="w-full h-full bg-os-ink-950 text-white flex items-center justify-center p-8">
        <div className="max-w-md rounded-2xl border border-white/[0.10] bg-white/[0.04] p-6 text-center shadow-os-card">
          <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.10] flex items-center justify-center">
            <Github className="w-7 h-7 text-white/75" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
          <p className="text-sm text-white/45 leading-relaxed mb-5">
            GitHub blocks being rendered inside embedded website frames. Open it externally to keep the OS stable.
          </p>
          <button
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-os-ink-950 transition-all hover:bg-primary-400 hover:-translate-y-0.5"
          >
            Open GitHub
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-os-ink-950 z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
            <p className="text-sm text-white/50">Loading {title}...</p>
          </div>
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-os-ink-950 z-10">
          <div className="text-center p-6">
            <p className="text-sm text-red-300 mb-2">Failed to load content</p>
            <p className="text-xs text-white/40">{url}</p>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
              }}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
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
      // Wrap lazy components in Suspense
      const componentContent = (() => {
        switch (window.component) {
          case 'Calculator':
            return <Calculator />;
          case 'Notepad':
            return <Notepad window={window} />;
          case 'FileExplorer':
            return <FileExplorer />;
          case 'FileViewer':
            return <FileViewer file={window.file} />;
          case 'Browser':
            return <Browser initialUrl={window.url} />;
          case 'Weather':
            return <Weather />;
          case 'TaskManager':
            return <TaskManager />;
          case 'CV':
            return <CV />;
          case 'AboutOS':
            return <AboutOS />;
          case 'Feedback':
            return <Feedback />;
          case 'AdminPanel':
            return <AdminPanel />;
          case 'About':
            return <About />;
          case 'Settings':
            return <Settings />;
          case 'Resume':
            return <Resume />;
          case 'Portfolio':
            return <Portfolio />;
          case 'Skills':
            return <Skills />;
          case 'Contact':
            return <Contact />;
          default:
            return (
              <div className="w-full h-full flex items-center justify-center bg-os-ink-950">
                <div className="text-center">
                  <p className="text-lg font-semibold mb-2 text-white">Component not found</p>
                  <p className="text-sm text-white/40">{window.component}</p>
                </div>
              </div>
            );
        }
      })();

      return (
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-os-ink-950">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
                  <p className="text-sm text-white">Loading {window.title}...</p>
                </div>
              </div>
            }
          >
            {componentContent}
          </Suspense>
        </ErrorBoundary>
      );
    }

    if (window.type === 'static' && window.content) {
      return (
        <div className="w-full h-full bg-os-ink-950 p-6 overflow-y-auto">
          <div className="prose prose-sm max-w-none text-white">{window.content}</div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-os-ink-950">
        <p className="text-white/40">No content available</p>
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
