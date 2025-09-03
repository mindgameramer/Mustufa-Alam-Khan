import React, { useState, useEffect, useRef } from 'react';
import { Tool } from '../types';

interface SidebarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

interface ToolConfig {
  id: Tool;
  name: string;
  icon: React.ReactNode;
}

const tools: ToolConfig[] = [
  {
    id: 'image',
    name: 'Image Generator',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
 
  {
    id: 'voice',
    name: 'Voice Generator',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
           <path strokeLinecap="round" strokeLinejoin="round" d="M4 8v8m4-10v12m4-14v16m4-12v8m4-6v4" />
        </svg>
    ),
  },
  {
    id: 'chat',
    name: 'AI Chatbot',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
  },
  {
    id: 'website',
    name: 'Website Builder AI',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.75 4a3 3 0 013-3h2.5a3 3 0 013 3v4.25a.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V4z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15h18v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z" />
        </svg>
    ),
  },
   {
    id: 'language_detector',
    name: 'Language Detector',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
    ),
  },
  {
    id: 'content_checker',
    name: 'Content Checker',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.611-1.572a4 4 0 013.111 0L17.4 20.417c.524.146 1.052.22 1.592.221a12.02 12.02 0 008.618-14.457z" />
      </svg>
    ),
  },
 
];

const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool }) => {
  const listRef = useRef<HTMLUListElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // This ensures transitions are only enabled after the initial render.
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const listNode = listRef.current;
    if (!listNode) return;

    const activeToolIndex = tools.findIndex(t => t.id === activeTool);
    if (activeToolIndex === -1) return;
    
    const activeItemNode = listNode.children[activeToolIndex] as HTMLLIElement;
    if (!activeItemNode) return;

    setIndicatorStyle({
      top: activeItemNode.offsetTop,
      height: activeItemNode.offsetHeight,
      opacity: 1,
    });
  }, [activeTool]);

  return (
    <nav className="w-64 bg-gray-950 p-4 flex flex-col border-r border-gray-700">
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.553L16.5 21.75l-.398-1.197a3.375 3.375 0 00-2.456-2.456L12.75 18l1.197-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.197a3.375 3.375 0 002.456 2.456L20.25 18l-1.197.398a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white">Learn With Kaif Tool</h1>
      </div>
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute left-0 w-full bg-blue-600 rounded-lg"
          style={{
            ...indicatorStyle,
            transition: hasMounted ? 'top 0.3s ease-in-out, height 0.3s ease-in-out' : 'none',
          }}
        />
        <ul ref={listRef} className="relative">
          {tools.map((tool, index) => (
            <li
              key={tool.id}
              className="animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
            >
              <button
                onClick={() => setActiveTool(tool.id)}
                className={`w-full flex items-center gap-3 p-3 my-1 rounded-lg text-left text-sm font-medium transition-colors relative ${
                  activeTool === tool.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tool.icon}
                {tool.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;