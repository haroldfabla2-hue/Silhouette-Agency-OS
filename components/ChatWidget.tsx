
import React, { useState, useRef, useEffect } from 'react';
import { UserRole, ChatMessage } from '../types';
import { MessageCircle, X, Send, User, RotateCcw } from 'lucide-react';
import { DEFAULT_API_CONFIG } from '../constants';

interface ChatWidgetProps {
  currentUserRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ currentUserRole, onChangeRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Poll for messages from backend (Phoenix Architecture)
  useEffect(() => {
      const fetchHistory = async () => {
          try {
              const res = await fetch(`http://localhost:${DEFAULT_API_CONFIG.port}/v1/chat/history`, {
                  headers: { 'Authorization': `Bearer ${DEFAULT_API_CONFIG.apiKey}` }
              });
              if (res.ok) {
                  const history = await res.json();
                  setMessages(history);
                  setIsConnected(true);
              } else {
                  setIsConnected(false);
              }
          } catch (e) {
              setIsConnected(false);
          }
      };

      if (isOpen) {
          fetchHistory();
          const interval = setInterval(fetchHistory, 2000); // Polling sync
          return () => clearInterval(interval);
      }
  }, [isOpen]);

  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages]);

  const handleSend = async () => {
      if (!input.trim()) return;
      
      const userText = input;
      setInput('');
      setIsTyping(true);

      // Optimistic Update
      const tempMsg: ChatMessage = { id: 'temp', role: 'user', text: userText, timestamp: Date.now() };
      setMessages(prev => [...prev, tempMsg]);

      try {
          const res = await fetch(`http://localhost:${DEFAULT_API_CONFIG.port}/v1/chat/completions`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${DEFAULT_API_CONFIG.apiKey}`
              },
              body: JSON.stringify({ messages: [{ role: 'user', content: userText }] })
          });

          if (!res.ok) throw new Error("API Error");
          
          // Re-fetch handled by polling loop, but we can update state immediately for responsiveness
          // const data = await res.json();
          // const aiMsg = data.choices[0].message;
          
      } catch (e) {
          setMessages(prev => [...prev, { id: 'err', role: 'agent', text: "Connection to Immortal Backend failed. Is server/index.ts running?", timestamp: Date.now() }]);
      } finally {
          setIsTyping(false);
      }
  };

  if (currentUserRole === UserRole.VISITOR) return null;
  const isLimited = currentUserRole === UserRole.CLIENT || currentUserRole === UserRole.WORKER_L1;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        
        {/* Role Switcher */}
        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700 backdrop-blur-md flex items-center gap-2 shadow-xl">
             <User size={14} className="text-slate-400" />
             <select 
                value={currentUserRole}
                onChange={(e) => onChangeRole(e.target.value as UserRole)}
                className="bg-transparent text-xs text-white border-none outline-none cursor-pointer"
             >
                 {Object.values(UserRole).map(role => (
                     <option key={role} value={role}>{role}</option>
                 ))}
             </select>
        </div>

        {isOpen && (
            <div className="w-96 h-[500px] bg-slate-900 border border-cyan-900/50 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10">
                <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <div>
                            <span className="text-sm font-bold text-white block">Orchestrator Node</span>
                            <span className="text-[10px] text-slate-500">{isConnected ? 'Phoenix Link Active' : 'Offline Mode'}</span>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/20" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="text-center text-slate-500 text-xs mt-10">
                            No history found in Continuum.
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-lg text-xs ${
                                m.role === 'user' 
                                ? 'bg-cyan-600 text-white rounded-br-none' 
                                : 'bg-slate-800 text-slate-300 rounded-bl-none border border-slate-700'
                            }`}>
                                {m.text}
                            </div>
                            {m.thoughts && m.thoughts.length > 0 && !isLimited && (
                                <div className="max-w-[85%] mt-1 pl-2 border-l-2 border-purple-500/30">
                                    <p className="text-[9px] text-purple-400 font-mono italic truncate">{m.thoughts[0]}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                             <div className="bg-slate-800 p-2 rounded-lg rounded-bl-none flex gap-1">
                                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-75"></div>
                                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-150"></div>
                             </div>
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-slate-800 bg-slate-950">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isConnected ? "Issue command..." : "Connecting to backend..."}
                            disabled={!isConnected}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!isConnected}
                            className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white disabled:opacity-50"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {!isOpen && (
            <button 
                onClick={() => setIsOpen(true)}
                className="w-14 h-14 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center transition-all hover:scale-110"
            >
                <MessageCircle size={28} />
            </button>
        )}
    </div>
  );
};

export default ChatWidget;
