import React from 'react';
import { SystemMode, SystemMetrics } from '../types';
import { orchestrator } from '../services/orchestrator';
import { ShieldCheck, ShieldAlert, Cpu, Zap, Power, Server } from 'lucide-react';

interface SystemControlProps {
  metrics: SystemMetrics;
  setMode: (mode: SystemMode) => void;
}

const SystemControl: React.FC<SystemControlProps> = ({ metrics, setMode }) => {
  const currentMode = metrics.currentMode;
  const activeCats = orchestrator.getActiveCategories();

  const powerLevels = [
    { mode: SystemMode.ECO, label: 'ECO MODE', color: 'green', desc: 'Core systems only. Minimal VRAM usage.', limit: 5 },
    { mode: SystemMode.BALANCED, label: 'BALANCED', color: 'blue', desc: 'Dev & Support teams active. Standard load.', limit: 42 },
    { mode: SystemMode.HIGH, label: 'HIGH PERF', color: 'purple', desc: 'Marketing & Data teams online. Heavy load.', limit: 77 },
    { mode: SystemMode.ULTRA, label: 'OVERDRIVE', color: 'red', desc: 'All 131 Agents active. WARNING: High Heat.', limit: 131 },
  ];

  const categories = [
    { id: 'CORE', label: 'Core Orchestration', required: true },
    { id: 'DEV', label: 'Development Swarm (25)' },
    { id: 'MKT', label: 'Marketing Division (20)' },
    { id: 'DATA', label: 'Data Analysis Unit (15)' },
    { id: 'SUP', label: 'Support Systems (12)' },
    { id: 'SPEC', label: 'Industry Specialists (54)' },
  ];

  const handleToggle = (id: string) => {
    if (id === 'CORE') return; // Cannot disable core
    const isEnabled = activeCats.includes(id);
    orchestrator.setCustomToggle(id, !isEnabled);
    // Force UI update handled by parent tick
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-6">
      
      {/* Power Level Selector */}
      <div className="flex-1 glass-panel rounded-xl p-8 flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Zap className="text-yellow-400" /> System Power Configuration
        </h2>
        <p className="text-slate-400 mb-8 max-w-2xl">
          Adjust the swarms's active container count to manage hardware load. 
          The system will automatically prevent VRAM overflow on your RTX 3050.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {powerLevels.map((level) => {
            const isActive = currentMode === level.mode;
            const isCritical = level.mode === SystemMode.ULTRA;
            
            return (
              <button
                key={level.mode}
                onClick={() => {
                  orchestrator.setMode(level.mode);
                  setMode(level.mode);
                }}
                className={`relative p-6 rounded-xl border-2 text-left transition-all duration-300 group ${
                  isActive 
                    ? `bg-${level.color}-900/20 border-${level.color}-500 shadow-[0_0_20px_rgba(0,0,0,0.3)]` 
                    : `bg-slate-900/50 border-slate-800 hover:border-${level.color}-500/50`
                }`}
              >
                {isActive && (
                   <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-${level.color}-500 animate-pulse`} />
                )}
                
                <h3 className={`font-bold text-lg mb-2 text-${isActive ? 'white' : 'slate-400'} group-hover:text-white`}>
                  {level.label}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono bg-slate-950 px-2 py-1 rounded text-slate-300">
                    {level.limit} Agents
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {level.desc}
                </p>

                {isCritical && (
                  <div className="mt-4 flex items-center gap-1 text-[10px] text-red-400 font-bold uppercase tracking-wider">
                    <ShieldAlert size={12} /> VRAM Warning
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Real-time Hardware Feedback */}
        <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 mt-auto">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h4 className="text-white font-bold flex items-center gap-2">
                <Cpu size={18} className="text-cyan-400" /> 
                Projected Hardware Impact
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Based on NVIDIA RTX 3050 (4GB VRAM) constraints
              </p>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-mono font-bold ${
                metrics.vramUsage > 3.5 ? 'text-red-500 animate-pulse' : 'text-green-400'
              }`}>
                {metrics.vramUsage.toFixed(2)} GB
              </span>
              <span className="text-sm text-slate-600 font-mono"> / 4.00 GB</span>
            </div>
          </div>
          
          {/* VRAM Bar */}
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-700 ${
                metrics.vramUsage > 3.5 ? 'bg-red-500' : 
                metrics.vramUsage > 2.5 ? 'bg-yellow-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${(metrics.vramUsage / 4.0) * 100}%` }}
            />
            {/* Warning Line at 3.5GB */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-red-500/50 left-[87.5%]" />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-500">
            <span>OS IDLE (1.2GB)</span>
            <span className="text-red-500">DANGER ZONE (&gt;3.5GB)</span>
          </div>
        </div>
      </div>

      {/* Manual Toggle Panel */}
      <div className="w-80 glass-panel rounded-xl p-0 flex flex-col border-l border-cyan-900/30">
        <div className="p-6 border-b border-cyan-900/30 bg-slate-900/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="text-slate-400" size={18} />
            Cluster Control
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Manual Override: {currentMode === SystemMode.CUSTOM ? 'ACTIVE' : 'INACTIVE'}
          </p>
        </div>

        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          {categories.map((cat) => {
            const isEnabled = activeCats.includes(cat.id);
            return (
              <div 
                key={cat.id} 
                className={`p-4 rounded-lg border transition-all ${
                  isEnabled 
                    ? 'bg-cyan-950/20 border-cyan-900/50' 
                    : 'bg-slate-900/30 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-bold ${isEnabled ? 'text-white' : 'text-slate-500'}`}>
                    {cat.id} Cluster
                  </span>
                  <button
                    onClick={() => handleToggle(cat.id)}
                    disabled={cat.required}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      isEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                    } ${cat.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-2">{cat.label}</p>
                {isEnabled && (
                   <div className="flex items-center gap-2 text-[10px] text-green-400 font-mono">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                     ONLINE
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default SystemControl;