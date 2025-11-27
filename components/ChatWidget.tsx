
import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types';
import { MessageCircle, X, Send, Shield, User } from 'lucide-react';
import { generateAgentResponse } from '../services/geminiService';
import { IntrospectionLayer, WorkflowStage } from '../types';

interface ChatWidgetProps {
  currentUserRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ currentUserRole, onChangeRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'agent', text: string}[]>([
      { role: 'agent', text: 'Hello. I am the Orchestrator. How can I assist you with the system today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // RBAC VISIBILITY LOGIC
  // If user is VISITOR, don't show the widget at all
  if (currentUserRole === UserRole.VISITOR) return null;

  // If user is CLIENT, show a limited support version
  const isLimited = currentUserRole === UserRole.CLIENT || currentUserRole === UserRole.WORKER_L1;

  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages]);

  const handleSend = async () => {
      if (!input.trim()) return;
      
      const userMsg = input;
      setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setInput('');
      setIsTyping(true);

      try {
          // Construct context based on role
          const roleContext = isLimited 
            ? "You are speaking to a CLIENT with limited permissions. Do not reveal system internals." 
            : "You are speaking to an ADMIN. Full system access granted.";

          const response = await generateAgentResponse(
              "Orchestrator_Chat",
              "System Admin Assistant",
              "CORE",
              `${roleContext} User says: ${userMsg}`,
              null,
              IntrospectionLayer.OPTIMAL,
              WorkflowStage.EXECUTION
          );

          setMessages(prev => [...prev, { role: 'agent', text: response.output }]);
      } catch (e) {
          setMessages(prev => [...prev, { role: 'agent', text: "Error connecting to neural core." }]);
      } finally {
          setIsTyping(false);
      }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        
        {/* Role Switcher (For Demo Purposes) */}
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

        {/* Chat Window */}
        {isOpen && (
            <div className="w-80 h-96 bg-slate-900 border border-cyan-900/50 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10">
                <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm font-bold text-white">Orchestrator</span>
                        {isLimited && <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-400">LIMITED</span>}
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/20" ref={scrollRef}>
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-2 rounded-lg text-xs ${
                                m.role === 'user' 
                                ? 'bg-cyan-600 text-white rounded-br-none' 
                                : 'bg-slate-800 text-slate-300 rounded-bl-none border border-slate-700'
                            }`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                             <div className="bg-slate-800 p-2 rounded-lg rounded-bl-none flex gap-1">
                                 <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce"></div>
                                 <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                                 <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce delay-150"></div>
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
                            placeholder={isLimited ? "Ask support..." : "Command system..."}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                        />
                        <button 
                            onClick={handleSend}
                            className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Toggle Button */}
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
