import React, { useState, useRef, useEffect } from 'react';
import { Chat } from "@google/genai";
import { ai } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Initialize the chat session
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a helpful and friendly AI assistant named Gemini. Keep your responses concise and informative, and use Markdown for formatting when appropriate.',
      },
    });

    // Initial message from the bot
    setMessages([{ role: 'model', content: "Hello! I'm Gemini. How can I help you today?" }]);
  }, []);

  useEffect(() => {
    // Scroll to the bottom whenever messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      if (!chatRef.current) {
        throw new Error("Chat session not initialized.");
      }

      const stream = await chatRef.current.sendMessageStream({ message: currentInput });
      
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]); 

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = modelResponse;
          return newMessages;
        });
      }
      
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(`Sorry, something went wrong. ${errorMessage}`);
      setMessages(prev => [...prev, { role: 'model', content: `Sorry, I encountered an error. Please try again.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">AI Chatbot</h2>
        <p className="text-gray-400">Have a conversation with Gemini.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg lg:max-w-xl px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              <div className="prose prose-invert prose-p:text-inherit whitespace-pre-wrap">{msg.content || <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse rounded-sm"></span>}</div>
            </div>
          </div>
        ))}
        {error && <p className="text-red-400 text-center">{error}</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-grow p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            aria-label="Send message"
          >
            {isLoading ? <LoadingSpinner /> : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;