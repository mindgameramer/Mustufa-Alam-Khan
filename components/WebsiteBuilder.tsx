import React, { useState } from 'react';
import { generateWebsite } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

type WebsiteCode = {
  html: string;
  css: string;
  js: string;
};

type ActiveTab = 'preview' | 'code';

const WebsiteBuilder: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [websiteCode, setWebsiteCode] = useState<WebsiteCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [copySuccess, setCopySuccess] = useState('');

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please describe the website you want to build.');
      return;
    }
    setError('');
    setIsLoading(true);
    setWebsiteCode(null);
    setActiveTab('preview');
    setCopySuccess('');

    try {
      const result = await generateWebsite(prompt);
      setWebsiteCode(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getFullHtml = () => {
    if (!websiteCode) return '';
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Generated Website</title>
        <style>
          ${websiteCode.css}
        </style>
      </head>
      <body>
        ${websiteCode.html}
        <script>
          ${websiteCode.js}
        </script>
      </body>
      </html>
    `;
  };
  
  const handleCopyCode = () => {
    if (!websiteCode) return;
    const fullCode = getFullHtml();
    navigator.clipboard.writeText(fullCode.trim()).then(() => {
        setCopySuccess('Copied to clipboard!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
        setCopySuccess('Failed to copy.');
    });
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col gap-8">
      <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex-shrink-0">
        <h2 className="text-2xl font-bold mb-1 text-white">Website Builder AI</h2>
        <p className="text-gray-400 mb-6">Describe the website you want to create, and let AI build it for you.</p>

        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A modern portfolio for a photographer with a dark theme, a gallery, and a contact form."
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200 resize-none h-28"
          />
        </div>

        {error && <p className="text-red-400 mt-4">{error}</p>}
        
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {isLoading ? <LoadingSpinner /> : 'Generate Website'}
        </button>
      </div>

      {(isLoading || websiteCode) && (
        <div className="bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700 flex flex-col flex-grow min-h-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                 <LoadingSpinner/>
                 <p className="mt-2 text-gray-400">Constructing your website... this may take a moment.</p>
              </div>
            </div>
          ) : (
            websiteCode && (
              <>
                <div className="p-2 border-b border-gray-700 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                       <button onClick={() => setActiveTab('preview')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Preview</button>
                       <button onClick={() => setActiveTab('code')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'code' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Code</button>
                   </div>
                   {activeTab === 'code' && (
                       <div className="relative">
                           <button onClick={handleCopyCode} className="px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 rounded-md text-white flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                             Copy Code
                           </button>
                           {copySuccess && <span className="absolute -top-8 right-0 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md">{copySuccess}</span>}
                       </div>
                   )}
                </div>
                <div className="flex-grow min-h-0">
                  {activeTab === 'preview' ? (
                     <iframe
                        srcDoc={getFullHtml()}
                        title="Website Preview"
                        className="w-full h-full border-0 bg-white"
                        sandbox="allow-scripts allow-same-origin"
                     />
                  ) : (
                    <div className="p-4 h-full overflow-y-auto bg-gray-900">
                        <h3 className="text-lg font-semibold text-cyan-400 mb-2 font-mono">HTML</h3>
                        <pre className="bg-gray-950 p-3 rounded-lg text-sm text-gray-300 overflow-x-auto"><code>{websiteCode.html}</code></pre>
                        <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2 font-mono">CSS</h3>
                        <pre className="bg-gray-950 p-3 rounded-lg text-sm text-gray-300 overflow-x-auto"><code>{websiteCode.css}</code></pre>
                        <h3 className="text-lg font-semibold text-yellow-400 mt-4 mb-2 font-mono">JavaScript</h3>
                        <pre className="bg-gray-950 p-3 rounded-lg text-sm text-gray-300 overflow-x-auto"><code>{websiteCode.js}</code></pre>
                    </div>
                  )}
                </div>
              </>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default WebsiteBuilder;
