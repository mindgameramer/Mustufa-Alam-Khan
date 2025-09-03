import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const aspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    setError('');
    setIsLoading(true);
    setImageUrls([]);
    try {
      const results = await generateImage(prompt, numberOfImages, aspectRatio);
      setImageUrls(results);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl: string, index: number) => {
    if (!imageUrl) return;

    const sanitizedPrompt = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 50) || 'generated-image';
      
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${sanitizedPrompt}_${index + 1}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-1 text-white">Image Generator</h2>
        <p className="text-gray-400 mb-6">Describe the image you want to create, and let AI bring it to life.</p>
        
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A cat wearing a wizard hat, digital art"
                    className="flex-grow p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200"
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                    {isLoading ? <LoadingSpinner /> : 'Generate'}
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="numberOfImages" className="block text-sm font-medium text-gray-400 mb-1">Number of Images</label>
                    <select
                        id="numberOfImages"
                        value={numberOfImages}
                        onChange={(e) => setNumberOfImages(parseInt(e.target.value))}
                        className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200"
                        >
                        {[1, 2, 3, 4].map(num => <option key={num} value={num}>{num}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-400 mb-1">Aspect Ratio</label>
                    <select
                        id="aspectRatio"
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200"
                        >
                        {aspectRatios.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                    </select>
                </div>
            </div>
        </div>

        {error && <p className="text-red-400 mt-4">{error}</p>}

      </div>

      {(isLoading || imageUrls.length > 0) && (
        <div className="mt-8">
            {isLoading && (
                <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex items-center justify-center h-64">
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-400">Generating your masterpiece... this may take a moment.</p>
                    </div>
                </div>
            )}
            {!isLoading && imageUrls.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {imageUrls.map((url, index) => (
                         <div key={index} className="bg-gray-800/50 p-4 rounded-2xl shadow-lg border border-gray-700 flex flex-col gap-4">
                            <div className="aspect-square flex items-center justify-center bg-gray-900/50 rounded-lg">
                               <img src={url} alt={`${prompt} - ${index + 1}`} className="rounded-lg max-w-full max-h-full object-contain" />
                            </div>
                            <button
                                onClick={() => handleDownload(url, index)}
                                className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                                aria-label={`Download Image ${index + 1}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Image
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;