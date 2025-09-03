import React, { useState } from 'react';
import { analyzeContent, humanizeContent, ContentAnalysis } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const ContentChecker: React.FC = () => {
    const [text, setText] = useState('');
    const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
    const [humanizedText, setHumanizedText] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isHumanizing, setIsHumanizing] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!text) {
            setError('Please enter some text to analyze.');
            return;
        }
        setError('');
        setAnalysis(null);
        setHumanizedText('');
        setIsAnalyzing(true);
        try {
            const result = await analyzeContent(text);
            setAnalysis(result);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            setError(errorMessage);
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleHumanize = async () => {
        if (!text) return;
        setError('');
        setIsHumanizing(true);
        setHumanizedText('');
        try {
            const result = await humanizeContent(text);
            setHumanizedText(result);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            setError(errorMessage);
        } finally {
            setIsHumanizing(false);
        }
    };

    const getStyling = () => {
        if (!analysis) {
            return {
                color: '#6b7280', // gray-500
                badgeBg: 'bg-gray-500',
                badgeText: 'text-gray-100',
            };
        }
        switch (analysis.classification) {
            case 'Likely Human-written':
                return {
                    color: '#22c55e', // green-500
                    badgeBg: 'bg-green-500',
                    badgeText: 'text-green-100',
                };
            case 'Likely AI-generated':
                return {
                    color: '#ef4444', // red-500
                    badgeBg: 'bg-red-500',
                    badgeText: 'text-red-100',
                };
            case 'Uncertain':
            default:
                return {
                    color: '#eab308', // yellow-500
                    badgeBg: 'bg-yellow-500',
                    badgeText: 'text-yellow-100',
                };
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col gap-8">
            <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex-shrink-0">
                <h2 className="text-2xl font-bold mb-1 text-white">Content Checker: AI vs. Human</h2>
                <p className="text-gray-400 mb-6">Analyze text to detect AI-generated content and humanize it.</p>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste the content you want to check here..."
                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200 resize-none h-40"
                    disabled={isAnalyzing || isHumanizing}
                    aria-label="Text to analyze"
                />

                {error && <p className="text-red-400 mt-4">{error}</p>}
                
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !text}
                    className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                    {isAnalyzing ? <LoadingSpinner /> : 'Analyze Content'}
                </button>
            </div>

            {isAnalyzing && (
                 <div className="bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700 flex flex-col flex-grow min-h-0 p-6 justify-center items-center">
                    <LoadingSpinner/>
                    <p className="mt-2 text-gray-400">Analyzing content...</p>
                 </div>
            )}

            {analysis && !isAnalyzing && (
                <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-white text-center">Analysis Result</h3>
                    <div className="flex flex-col md:flex-row items-center justify-around gap-6 md:gap-10">
                        <div className="w-full md:w-1/3 text-center">
                             <span className="text-5xl font-bold" style={{ color: getStyling().color }}>
                                {Math.round(analysis.confidence * 100)}%
                            </span>
                            <p className="text-sm text-gray-400 mt-1">Confidence</p>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                                <div className="h-2.5 rounded-full" style={{ width: `${analysis.confidence * 100}%`, backgroundColor: getStyling().color }}></div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <span className="font-medium text-gray-300">Classification:</span>
                                <span className={`font-bold px-3 py-1 rounded-full text-sm ${getStyling().badgeBg} ${getStyling().badgeText}`}>
                                    {analysis.classification}
                                </span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-300 mb-1">Reasoning:</h4>
                                <p className="text-gray-400 text-sm">{analysis.reasoning}</p>
                            </div>
                        </div>
                    </div>
                     <button
                        onClick={handleHumanize}
                        disabled={isHumanizing}
                        className="mt-6 w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                        {isHumanizing ? <LoadingSpinner /> : 'Humanize Text'}
                    </button>
                </div>
            )}
            
            {(isHumanizing || humanizedText) && (
                <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
                    {isHumanizing ? (
                        <div className="flex justify-center items-center py-10">
                            <LoadingSpinner/>
                            <p className="ml-2 text-gray-400">Rewriting text...</p>
                        </div>
                    ) : (
                        <div>
                             <h3 className="text-xl font-bold mb-4 text-white">Humanized Content</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-gray-400 mb-2">Original</h4>
                                    <div className="bg-gray-900 p-3 rounded-lg text-gray-300 text-sm h-64 overflow-y-auto">{text}</div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-400 mb-2">Humanized Version</h4>
                                    <div className="bg-gray-900 p-3 rounded-lg text-green-300 text-sm h-64 overflow-y-auto">{humanizedText}</div>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default ContentChecker;
