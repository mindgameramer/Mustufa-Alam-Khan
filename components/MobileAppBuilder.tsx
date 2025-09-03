import React, { useState } from 'react';
import { generateMobileAppUI, UIComponent } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const RenderComponent: React.FC<{ component: UIComponent }> = ({ component }) => {
  const { type, properties, children } = component;

  switch (type) {
    case 'container':
      return (
        <div className="flex flex-col gap-3 w-full">
          {children?.map((child, index) => <RenderComponent key={index} component={child} />)}
        </div>
      );
    case 'header':
      return (
        <div className="w-full bg-gray-200 p-4 rounded-t-lg">
          <h1 className="text-xl font-bold text-gray-800 text-center">{properties.title || 'Header'}</h1>
        </div>
      );
    case 'text':
      return <p className="text-gray-700">{properties.content || 'Some text content'}</p>;
    case 'image':
      return <img src={properties.src || 'https://picsum.photos/400/200'} alt={properties.alt || 'Placeholder image'} className="w-full rounded-lg object-cover h-40" />;
    case 'button':
      return <button className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors">{properties.label || 'Button'}</button>;
    case 'input':
      return <input type="text" placeholder={properties.placeholder || 'Text input'} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />;
    default:
      return <div className="p-2 border border-dashed border-red-400 text-red-500 text-xs">Unknown component type: {type}</div>;
  }
};

const MobileAppBuilder: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [uiComponents, setUiComponents] = useState<UIComponent[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please describe the mobile app screen you want to build.');
      return;
    }
    setError('');
    setIsLoading(true);
    setUiComponents(null);

    try {
      const result = await generateMobileAppUI(prompt);
      setUiComponents(result.components);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-8">
      <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex-shrink-0">
        <h2 className="text-2xl font-bold mb-1 text-white">Mobile App Builder AI</h2>
        <p className="text-gray-400 mb-6">Describe an app screen, and let AI generate a visual UI blueprint for you.</p>

        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A login screen for a social media app with a logo, email and password fields, and a login button."
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200 resize-none h-28"
          />
        </div>

        {error && <p className="text-red-400 mt-4">{error}</p>}
        
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {isLoading ? <LoadingSpinner /> : 'Generate App UI'}
        </button>
      </div>

      {(isLoading || uiComponents) && (
        <div className="flex justify-center items-center flex-grow min-h-0 py-4">
            {isLoading ? (
                 <div className="text-center">
                    <LoadingSpinner/>
                    <p className="mt-2 text-gray-400">Designing your app interface...</p>
                 </div>
            ) : (
                <div className="w-[375px] h-[780px] bg-white rounded-[40px] shadow-2xl p-4 border-8 border-black overflow-y-auto">
                    <div className="flex flex-col items-center gap-4">
                        {uiComponents?.map((component, index) => (
                            <RenderComponent key={index} component={component} />
                        ))}
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default MobileAppBuilder;