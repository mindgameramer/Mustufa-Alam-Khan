
import React, { useState } from 'react';
import { generateRecipe } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const RecipeGenerator: React.FC = () => {
  const [ingredients, setIngredients] = useState('');
  const [diet, setDiet] = useState('');
  const [recipe, setRecipe] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!ingredients) {
      setError('Please enter some ingredients.');
      return;
    }
    setError('');
    setIsLoading(true);
    setRecipe('');
    try {
      const result = await generateRecipe(ingredients, diet);
      setRecipe(result);
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
        <h2 className="text-2xl font-bold mb-1 text-white">Recipe Generator</h2>
        <p className="text-gray-400 mb-6">Enter ingredients you have, and let AI create a recipe for you.</p>

        <div className="space-y-4">
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g., chicken breast, broccoli, rice, soy sauce"
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200 resize-none h-28"
          />
          <textarea
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
            placeholder="Optional: e.g., vegetarian, gluten-free, low-carb"
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200 resize-none h-20"
          />
        </div>

        {error && <p className="text-red-400 mt-4">{error}</p>}
        
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {isLoading ? <LoadingSpinner /> : 'Generate Recipe'}
        </button>
      </div>

      {(isLoading || recipe) && (
        <div className="mt-8 bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-white">Your Recipe</h3>
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <div className="text-center">
                 <LoadingSpinner/>
                 <p className="mt-2 text-gray-400">Brewing up something delicious...</p>
              </div>
            </div>
          )}
          {recipe && <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white whitespace-pre-wrap">{recipe}</div>}
        </div>
      )}
    </div>
  );
};

export default RecipeGenerator;
