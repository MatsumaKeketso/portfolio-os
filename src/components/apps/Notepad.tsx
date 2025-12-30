import { useState } from 'react';

export function Notepad() {
  const [text, setText] = useState('Welcome to PortfolioOS Notepad!\n\nStart typing your notes here...');

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 p-2 flex items-center gap-2">
        <button className="px-3 py-1 text-sm hover:bg-gray-100 rounded">File</button>
        <button className="px-3 py-1 text-sm hover:bg-gray-100 rounded">Edit</button>
        <button className="px-3 py-1 text-sm hover:bg-gray-100 rounded">Format</button>
        <button className="px-3 py-1 text-sm hover:bg-gray-100 rounded">View</button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 w-full p-4 resize-none focus:outline-none font-mono text-sm"
        spellCheck={false}
      />
    </div>
  );
}
