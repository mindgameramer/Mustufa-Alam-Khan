import React, { useState } from 'react';
import { generateChartData, ChartData } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { Bar, Line, Pie, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale
);

const chartComponents = {
  bar: Bar,
  line: Line,
  pie: Pie,
  doughnut: Doughnut,
  radar: Radar,
  polarArea: PolarArea,
};

const DataVisualizationTool: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a description for the data visualization.');
      return;
    }
    setError('');
    setIsLoading(true);
    setChartData(null);

    try {
      const result = await generateChartData(prompt);
      // Add default styling if not provided by the API
      result.data.datasets = result.data.datasets.map(dataset => ({
        ...dataset,
        borderWidth: dataset.borderWidth || 1,
      }));
      setChartData(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const ChartComponent = chartData ? chartComponents[chartData.type] : null;

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-8">
      <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex-shrink-0">
        <h2 className="text-3xl font-bold mb-2 text-center">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                AI Data Visualization
            </span>
        </h2>
        <p className="text-gray-400 mb-6 text-center">Describe the data you want to visualize, and AI will generate the chart for you.</p>

        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A bar chart showing the market share of smartphone vendors: Brand A 30%, Brand B 25%, Brand C 20%, and Others 25%."
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200 resize-none h-28"
          />
        </div>

        {error && <p className="text-red-400 mt-4">{error}</p>}
        
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {isLoading ? <LoadingSpinner /> : 'Generate Chart'}
        </button>
      </div>

      {(isLoading || chartData) && (
        <div className="bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700 flex flex-col flex-grow min-h-0 p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                 <LoadingSpinner/>
                 <p className="mt-2 text-gray-400">Visualizing your data...</p>
              </div>
            </div>
          ) : (
            chartData && ChartComponent && (
                <div className="bg-white p-4 rounded-lg">
                    <ChartComponent
                      data={chartData.data}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                          title: {
                            display: true,
                            text: prompt.length > 70 ? prompt.slice(0, 70) + '...' : prompt,
                          },
                        },
                        ...chartData.options,
                      }}
                    />
                </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default DataVisualizationTool;