
import React, { useState } from 'react';
import { detectLanguage, LanguageDetectionResult } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const LanguageDetector: React.FC = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<LanguageDetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDetect = async () => {
    if (!code) {
      setError('Please enter some code to detect its language.');
      return;
    }
    setError('');
    setIsLoading(true);
    setResult(null);
    try {
      const detectionResult = await detectLanguage(code);
      setResult(detectionResult);
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
        <h2 className="text-2xl font-bold mb-1 text-white">Programming Language Detector</h2>
        <p className="text-gray-400 mb-6">Paste a code snippet and let the AI identify its programming language.</p>
        
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`// Paste your code here`}
          className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200 resize-none h-48 font-mono"
        />

        {error && <p className="text-red-400 mt-4">{error}</p>}

        <button
          onClick={handleDetect}
          disabled={isLoading}
          className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {isLoading ? <LoadingSpinner /> : 'Detect Language'}
        </button>
      </div>

       {(isLoading || result) && (
        <div className="mt-8 bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-white">Detection Result</h3>
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <div className="text-center">
                 <LoadingSpinner/>
                 <p className="mt-2 text-gray-400">Analyzing code...</p>
              </div>
            </div>
          )}
          {result && (
            <div className="text-center">
              <p className="text-gray-400 text-lg">Detected Language:</p>
              <p className="text-5xl font-bold text-cyan-400 my-2">{result.language}</p>
              <div className="flex justify-center items-center gap-2">
                 <p className="text-gray-400">Confidence:</p>
                 <div className="w-40 bg-gray-700 rounded-full h-2.5">
                    <div className="bg-cyan-400 h-2.5 rounded-full" style={{ width: `${result.confidence * 100}%` }}></div>
                 </div>
                 <p className="text-cyan-400 font-semibold">{Math.round(result.confidence * 100)}%</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LanguageDetector;
