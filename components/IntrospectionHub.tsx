import React, { useState } from 'react';
import { BrainCircuit, Eye, Fingerprint, Activity, Zap, ShieldAlert } from 'lucide-react';
import { IntrospectionLayer } from '../types';

const IntrospectionHub: React.FC = () => {
  const [injectionPrompt, setInjectionPrompt] = useState('');
  const [activeLayer, setActiveLayer] = useState<IntrospectionLayer>(IntrospectionLayer.OPTIMAL);
  
  const thoughts = [
    { id: 1, type: 'THOUGHT', content: "Analyzing user intent pattern 'Creative Expansion'...", confidence: 0.98 },
    { id: 2, type: 'CHECK', content: "Bias detection scan complete. Results: Negative.", confidence: 0.99 },
    { id: 3, type: 'INJECTION', content: "Applying strategic concept: 'Enterprise Minimalist' to visual cortex.", confidence: 1.0 },
    { id: 4, type: 'THOUGHT', content: "Allocating 240MB continuum memory for context retention.", confidence: 0.92 },
  ];

  const handleInject = () => {
    // In a real backend, this would hit the concept injection API
    console.log(`Injecting concept: ${injectionPrompt} at layer ${activeLayer}`);
    setInjectionPrompt('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-2rem)]">
      
      {/* Central Visualizer */}
      <div className="lg:col-span-2 glass-panel rounded-xl p-8 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950"></div>
        
        {/* Animated Brain Simulation */}
        <div className="relative z-10 w-96 h-96">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-spin-slow"></div>
          <div className="absolute inset-8 rounded-full border border-purple-500/30 animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
          <div className="absolute inset-20 rounded-full border border-green-500/20 animate-pulse"></div>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <h2 className="text-4xl font-bold text-white tracking-tighter">94.05%</h2>
            <p className="text-cyan-400 font-mono text-sm tracking-widest mt-2">AWARENESS SCORE</p>
          </div>

          {/* Orbiting Concepts */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 bg-slate-900/80 px-3 py-1 rounded-full border border-cyan-500/30 text-xs text-cyan-200">
            Thought Detection
          </div>
          <div className="absolute bottom-10 right-0 bg-slate-900/80 px-3 py-1 rounded-full border border-purple-500/30 text-xs text-purple-200">
            Concept Injection
          </div>
          <div className="absolute bottom-10 left-0 bg-slate-900/80 px-3 py-1 rounded-full border border-green-500/30 text-xs text-green-200">
            State Control
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 px-8 flex justify-between items-end z-10">
          <div>
            <p className="text-xs text-slate-500 mb-1">CURRENT DEPTH</p>
            <div className="flex gap-2">
              {[12, 20, 28, 32, 48].map(layer => (
                <button 
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
                  className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                    activeLayer === layer 
                      ? 'bg-cyan-500 text-black font-bold' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  L{layer}
                </button>
              ))}
            </div>
          </div>
          <div className="text-right">
             <p className="text-xs text-slate-500 mb-1">LATENCY</p>
             <p className="text-xl font-mono text-green-400">7.37ms</p>
          </div>
        </div>
      </div>

      {/* Controls & Logs */}
      <div className="glass-panel rounded-xl p-6 flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Fingerprint className="text-purple-400" /> 
            Concept Injection
          </h3>
          <div className="space-y-3">
             <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
               <label className="text-[10px] text-slate-500 uppercase font-bold">Inject Vector</label>
               <input 
                  type="text" 
                  value={injectionPrompt}
                  onChange={(e) => setInjectionPrompt(e.target.value)}
                  placeholder="e.g. 'Prioritize ethical constraints'..."
                  className="w-full bg-transparent border-none outline-none text-white text-sm font-mono mt-1 placeholder-slate-600"
               />
             </div>
             <button 
                onClick={handleInject}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2"
             >
               <Zap size={14} /> INJECT CONCEPT
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
            <Activity size={16} className="text-cyan-400" />
            Live Thought Stream
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {thoughts.map(t => (
              <div key={t.id} className="p-3 bg-slate-900/50 rounded border-l-2 border-l-cyan-500 border border-t-0 border-r-0 border-b-0 border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    t.type === 'INJECTION' ? 'bg-purple-900/30 text-purple-400' : 
                    t.type === 'CHECK' ? 'bg-green-900/30 text-green-400' :
                    'bg-cyan-900/30 text-cyan-400'
                  }`}>{t.type}</span>
                  <span className="text-[10px] text-slate-500">Conf: {(t.confidence * 100).toFixed(0)}%</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">{t.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default IntrospectionHub;