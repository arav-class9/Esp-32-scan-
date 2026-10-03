import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'eva';
  text: string;
  timestamp: string;
}

interface Props {
  deviceId: string;
}

export const AiAssistantTab: React.FC<Props> = ({ deviceId }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'eva',
      text: `Hello! I am EVA, your embedded AI assistant on device ${deviceId}. Ask me anything or command your ESP32 hardware!`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    const promptText = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptText, device_id: deviceId })
      });
      const data = await res.json();

      const evaMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'eva',
        text: data.reply || 'EVA AI response received.',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, evaMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'eva',
        text: 'Sorry, I encountered an error communicating with the Gemini AI backend.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col h-[380px]">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-bold text-white">EVA AI Assistant (Gemini)</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl space-y-1 ${
              m.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
            }`}>
              <div className="flex items-center space-x-1.5 opacity-70 text-[10px]">
                {m.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-indigo-400" />}
                <span>{m.sender === 'user' ? 'You' : 'EVA AI'}</span>
                <span>•</span>
                <span>{m.timestamp}</span>
              </div>
              <p className="leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl rounded-bl-none flex items-center space-x-2 text-slate-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>EVA is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex space-x-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask EVA or command ESP32..."
          className="flex-1 bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
