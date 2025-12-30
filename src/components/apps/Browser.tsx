import { useState } from 'react';
import * as Icons from 'lucide-react';

interface Bookmark {
  name: string;
  url: string;
  icon: string;
}

export function Browser() {
  const bookmarks: Bookmark[] = [
    { name: 'NailHub', url: 'https://www.nailhub.co.za', icon: '💅' },
    { name: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { name: 'Base44', url: 'https://base44.co.za', icon: '🚀' },
    { name: 'Udemy', url: 'https://www.udemy.com', icon: '🎓' },
  ];

  const [url, setUrl] = useState('https://www.nailhub.co.za');
  const [currentUrl, setCurrentUrl] = useState('https://www.nailhub.co.za');

  const handleNavigate = () => {
    setCurrentUrl(url);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 p-2 flex items-center gap-2">
        <button className="p-1.5 hover:bg-gray-100 rounded">
          <Icons.ChevronLeft className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded">
          <Icons.ChevronRight className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded">
          <Icons.RefreshCw className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded">
          <Icons.Home className="w-4 h-4" />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full border border-gray-300">
          <Icons.Lock className="w-3.5 h-3.5 text-green-600" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
        <button className="p-1.5 hover:bg-gray-100 rounded">
          <Icons.Star className="w-4 h-4" />
        </button>
      </div>

      <div className="border-b border-gray-200 p-2 flex items-center gap-2 overflow-x-auto">
        {bookmarks.map((bookmark, index) => (
          <button
            key={index}
            onClick={() => {
              setUrl(bookmark.url);
              setCurrentUrl(bookmark.url);
            }}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg whitespace-nowrap"
          >
            <span>{bookmark.icon}</span>
            <span className="text-sm">{bookmark.name}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 bg-gray-50">
        <iframe
          src={currentUrl}
          className="w-full h-full border-0"
          title="Browser content"
        />
      </div>
    </div>
  );
}
