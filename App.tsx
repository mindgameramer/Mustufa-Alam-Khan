import React, { useState } from 'react';
import { Tool } from './types';
import Sidebar from './components/Sidebar';
import ImageGenerator from './components/ImageGenerator';
import VoiceGenerator from './components/VoiceGenerator';
import Chatbot from './components/Chatbot';
import WebsiteBuilder from './components/WebsiteBuilder';
import DataVisualizationTool from './components/DataVisualizationTool';
import ContentChecker from './components/ContentChecker';
import RecipeGenerator from './components/RecipeGenerator';
import CodeExplainer from './components/CodeExplainer';
import LanguageDetector from './components/LanguageDetector';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>('image');

  const renderTool = () => {
    switch (activeTool) {
      case 'image':
        return <ImageGenerator />;
      case 'recipe':
        return <RecipeGenerator />;
      case 'voice':
        return <VoiceGenerator />;
      case 'chat':
        return <Chatbot />;
      case 'website':
        return <WebsiteBuilder />;
      case 'data_viz':
        return <DataVisualizationTool />;
      case 'content_checker':
        return <ContentChecker />;
      case 'code_explainer':
        return <CodeExplainer />;
      case 'language_detector':
        return <LanguageDetector />;
      default:
        return <ImageGenerator />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderTool()}
      </main>
    </div>
  );
};

export default App;