import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../state/store';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Flame,
  Wind,
  LifeBuoy,
  ChevronRight,
  Compass,
  CornerDownLeft
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  actions?: any;
}

export const AiCopilotModal: React.FC = () => {
  const {
    showAiCopilot,
    setShowAiCopilot,
    setActiveVariable,
    setSelectedDepth,
    setViewMode,
    setCameraTarget,
    setShowCurrents,
    setIsSarMode,
    setSarPoint
  } = useStore();

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: '👋 **Hello! I am Varuna-AI, your Oceanographic Intelligence Copilot.**\n\nAsk me anything in natural language about 3D ocean state variables, Marine Heatwaves, Somali Jet upwelling, or Search & Rescue operations. I will automatically analyze the data and drive the 3D workstation for you.'
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedChips = [
    '🔥 Detect Marine Heatwaves in Indian Ocean',
    '🌊 Focus on Somali Jet Upwelling (Arabian Sea)',
    '🧂 Show Low-Salinity Barrier Layer in Bay of Bengal',
    '🚨 Simulate 72h SAR drift at 17.5°N, 85.2°E'
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setLoading(true);

    axios.post('http://127.0.0.1:8000/api/v1/ai/chat', { prompt })
      .then((res) => {
        const aiReply = res.data.reply;
        const actions = res.data.actions || {};

        // 1. Dispatch 3D actions automatically
        if (actions.variable) setActiveVariable(actions.variable);
        if (actions.depth !== undefined) setSelectedDepth(actions.depth);
        if (actions.view_mode) setViewMode(actions.view_mode);
        if (actions.camera) setCameraTarget(actions.camera);
        if (actions.show_currents) setShowCurrents(true);
        if (actions.is_sar_mode) {
          setIsSarMode(true);
          if (actions.sar_point) setSarPoint(actions.sar_point);
        }

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReply,
          actions
        };
        setMessages((prev) => [...prev, aiMsg]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: '⚠️ Unable to connect to Varuna-AI server. Please ensure the backend is running.'
          }
        ]);
        setLoading(false);
      });
  };

  if (!showAiCopilot) return null;

  return (
    <div className="fixed bottom-20 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] h-[540px] bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/50 rounded-3xl shadow-2xl shadow-cyan-950/60 flex flex-col overflow-hidden text-slate-100 select-none pointer-events-auto animate-fade-in">
      
      {/* Copilot Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <Bot size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs tracking-wider text-white">VARUNA-AI COPILOT</h3>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                PRO-v2
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Natural Language Ocean Decision Support</p>
          </div>
        </div>

        <button
          onClick={() => setShowAiCopilot(false)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-900/30 flex gap-1.5 overflow-x-auto scrollbar-none">
        {suggestedChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="flex-shrink-0 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-[10px] font-medium text-cyan-300 transition truncate max-w-[200px]"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] p-3 rounded-2xl leading-relaxed whitespace-pre-line text-xs ${
                m.sender === 'user'
                  ? 'bg-cyan-500 text-slate-950 font-semibold rounded-tr-none'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}
            >
              {m.text}
            </div>

            {/* Action Confirmation Pill */}
            {m.actions && Object.keys(m.actions).length > 0 && (
              <div className="flex items-center gap-1 text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-800/50 mt-1">
                <Sparkles size={10} />
                <span>3D Viewport Synchronized</span>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-slate-900/80 rounded-2xl max-w-[70%] border border-slate-800">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[11px] text-slate-400 italic">Varuna-AI analyzing ocean grids...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask anything (e.g. 'Show SST in Bay of Bengal')..."
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || loading}
            className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition shadow-md shadow-cyan-500/20"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

