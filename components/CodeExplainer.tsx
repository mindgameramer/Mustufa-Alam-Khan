
import React, { useState } from 'react';
import { explainCode } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const CodeExplainer: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExplain = async () => {
    if (!code) {
      setError('Please enter some code to explain.');
      return;
    }
    setError('');
    setIsLoading(true);
    setExplanation('');
    try {
      const result = await explainCode(code, language);
      setExplanation(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-1 text-white">Code Explainer</h2>
        <p className="text-gray-400 mb-6">Paste a code snippet and get a detailed explanation of what it does.</p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-400 mb-1">Language</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`// Paste your ${language} code here`}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200 resize-none h-48 font-mono"
          />
        </div>

        {error && <p className="text-red-400 mt-4">{error}</p>}

        <button
          onClick={handleExplain}
          disabled={isLoading}
          className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {isLoading ? <LoadingSpinner /> : 'Explain Code'}
        </button>
      </div>

       {(isLoading || explanation) && (
        <div className="mt-8 bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-white">Explanation</h3>
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <div className="text-center">
                 <LoadingSpinner/>
                 <p className="mt-2 text-gray-400">Analyzing code...</p>
              </div>
            </div>
          )}
          {explanation && <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white prose-code:text-cyan-300 whitespace-pre-wrap">{explanation}</div>}
        </div>
      )}
    </div>
  );
};

export default CodeExplainer;
