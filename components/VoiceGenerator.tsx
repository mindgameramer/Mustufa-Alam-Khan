import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

const VoiceGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | undefined>();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [error, setError] = useState('');
  
  const synth = window.speechSynthesis;

  const populateVoiceList = () => {
    const availableVoices = synth.getVoices();
    if (availableVoices.length > 0) {
      setVoices(availableVoices);
      setSelectedVoiceURI(availableVoices.find(v => v.default)?.voiceURI || availableVoices[0].voiceURI);
      setIsLoadingVoices(false);
    }
  };

  useEffect(() => {
    populateVoiceList();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = populateVoiceList;
    }
  }, []);

  const handlePlayStop = () => {
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!text) {
      setError('Please enter some text to generate audio.');
      return;
    }
    
    setError('');

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find(voice => voice.voiceURI === selectedVoiceURI);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
        setError('An error occurred during speech synthesis.');
        setIsSpeaking(false);
    };

    synth.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-1 text-white">Voice Generator</h2>
        <p className="text-gray-400 mb-6">Turn your text into natural-sounding speech using your browser's built-in engine.</p>

        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., Hello world! I am a friendly AI assistant."
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200 resize-none h-36"
          />
          <div>
            <label htmlFor="voice" className="block text-sm font-medium text-gray-400 mb-1">Select Voice</label>
            <select
              id="voice"
              value={selectedVoiceURI}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              disabled={isLoadingVoices || isSpeaking}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200 disabled:opacity-50"
            >
              {isLoadingVoices ? (
                <option>Loading voices...</option>
              ) : (
                voices.map(voice => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {`${voice.name} (${voice.lang})`}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {error && <p className="text-red-400 mt-4">{error}</p>}
        
        <button
          onClick={handlePlayStop}
          disabled={isLoadingVoices}
          className={`mt-6 w-full text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isSpeaking 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSpeaking ? 'Stop' : 'Generate & Play'}
        </button>
      </div>
    </div>
  );
};

export default VoiceGenerator;
