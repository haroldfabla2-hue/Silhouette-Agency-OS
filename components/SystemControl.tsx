import React, { useState } from 'react';
import { SystemMode, SystemMetrics, AutonomousConfig } from '../types';
import { orchestrator } from '../services/orchestrator';
import { workflowEngine } from '../services/workflowEngine';
import { ShieldCheck, ShieldAlert, Cpu, Zap, Power, Server, Clock, Coins, RotateCcw } from 'lucide-react';
import { DEFAULT_AUTONOMY_CONFIG } from '../constants';

interface SystemControlProps {
  metrics: SystemMetrics;
  setMode: (mode: SystemMode) => void;
  autonomyConfig: AutonomousConfig;
  setAutonomyConfig: (config: AutonomousConfig) => void;
}

const SystemControl: React.FC<SystemControlProps> = ({ metrics, setMode, autonomyConfig, setAutonomyConfig }) => {
  const currentMode = metrics.currentMode;
  const activeCats = orchestrator.getActiveCategories();

  // Local state for inputs before applying
  const [tempConfig, setTempConfig] = useState(autonomyConfig);

  const applyConfig = () => {
    setAutonomyConfig(tempConfig);
    workflowEngine.updateConfig(tempConfig);
  };

  const handleToggle = (id: string) => {
    if (id === 'CORE') return; 
    const isEnabled = activeCats.includes(id);
    orchestrator.setCustomToggle(id, !isEnabled);
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-6">
      
      {/* Left Column: Power & Hardware */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Power Level Selector */}
        <div className="glass-panel rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <Zap className="text-yellow-400" /> System Power Configuration
          </h2>
          <div className="grid grid-cols-2 gap-3">
             {[SystemMode.ECO, SystemMode.BALANCED, SystemMode.HIGH, SystemMode.ULTRA].map(mode => (
               <button
                  key={mode}
                  onClick={() => { orchestrator.setMode(mode); setMode(mode); }}
                  className={`p-4 rounded border text-left transition-all ${
                    currentMode === mode 
                      ? 'bg-cyan-900/30 border-cyan-500 text-white' 
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
               >
                 <div className="font-bold text-sm mb-1">{mode}</div>
                 <div className="text-[10px] font-mono opacity-70">
                   {mode === 'ECO' ? 'Core Only (Safe)' : mode === 'ULTRA' ? 'Full Swarm (Max Load)' : 'Standard Operation'}
                 </div>
               </button>
             ))}
          </div>
        </div>

        {/* Hardware Monitor */}
        <div className="glass-panel rounded-xl p-6 flex-1 bg-slate-900/80 border-slate-800">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h4 className="text-white font-bold flex items-center gap-2">
                <Cpu size={18} className="text-cyan-400" /> 
                RTX 3050 Load
              </h4>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-mono font-bold ${metrics.vramUsage > 3.5 ? 'text-red-500' : 'text-green-400'}`}>
                {metrics.vramUsage.toFixed(2)} GB
              </span>
            </div>
          </div>
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden relative mb-6">
            <div 
              className={`h-full transition-all duration-700 ${metrics.vramUsage > 3.5 ? 'bg-red-500' : 'bg-cyan-500'}`}
              style={{ width: `${(metrics.vramUsage / 4.0) * 100}%` }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-black/40 p-3 rounded">
                <p className="text-xs text-slate-500">Active Squads</p>
                <p className="text-lg text-white font-mono">{orchestrator.getSquads().filter(s => s.active).length}</p>
             </div>
             <div className="bg-black/40 p-3 rounded">
                <p className="text-xs text-slate-500">Token Usage</p>
                <p className="text-lg text-white font-mono">{metrics.tokenUsageToday.toLocaleString()}</p>
             </div>
          </div>
        </div>

      </div>

      {/* Right Column: Autonomy & Limits */}
      <div className="w-96 glass-panel rounded-xl flex flex-col border-l border-cyan-900/30">
        <div className="p-6 border-b border-cyan-900/30 bg-slate-900/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <RotateCcw className="text-purple-400" size={18} />
            Autonomous Operations
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Configure self-healing loops and safety constraints.
          </p>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 bg-purple-900/10 border border-purple-500/30 rounded-xl">
            <div>
              <span className="block text-white font-bold text-sm">Autonomy Enabled</span>
              <span className="text-[10px] text-purple-300">Allow Workflow Engine to cycle</span>
            </div>
            <button 
              onClick={() => {
                const newState = { ...tempConfig, enabled: !tempConfig.enabled };
                setTempConfig(newState);
                setAutonomyConfig(newState);
                workflowEngine.updateConfig(newState);
              }}
              className={`w-12 h-6 rounded-full relative transition-colors ${tempConfig.enabled ? 'bg-purple-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${tempConfig.enabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* 24/7 Mode */}
          <div className="space-y-3">
             <label className="flex items-center gap-2 text-sm text-slate-300">
               <input 
                  type="checkbox" 
                  checked={tempConfig.mode24_7}
                  onChange={(e) => setTempConfig({...tempConfig, mode24_7: e.target.checked})}
                  className="rounded bg-slate-800 border-slate-600 text-cyan-500"
               />
               <span className="flex items-center gap-2">
                 Continuous Context Loop (24/7)
                 {tempConfig.mode24_7 && <span className="text-[10px] bg-red-900/50 text-red-400 px-1 rounded">HEAVY</span>}
               </span>
             </label>
             <p className="text-[10px] text-slate-500 pl-6">
               If enabled, the system will automatically restart the workflow upon archival, maintaining context indefinitely.
             </p>
          </div>

          <hr className="border-slate-800" />

          {/* Limits */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase flex items-center gap-2 mb-2">
                <Coins size={12} /> Max Daily Tokens
              </label>
              <input 
                type="number" 
                value={tempConfig.maxDailyTokens}
                onChange={(e) => setTempConfig({...tempConfig, maxDailyTokens: parseInt(e.target.value)})}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-bold uppercase flex items-center gap-2 mb-2">
                <Clock size={12} /> Max Runtime (Hours)
              </label>
              <input 
                type="number" 
                value={tempConfig.maxRunTimeHours}
                onChange={(e) => setTempConfig({...tempConfig, maxRunTimeHours: parseInt(e.target.value)})}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-sm"
              />
              <p className="text-[10px] text-slate-600 mt-1">Set to 0 for infinite.</p>
            </div>
          </div>

          <button 
            onClick={applyConfig}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold transition-colors flex items-center justify-center gap-2"
          >
            APPLY CONFIGURATION
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default SystemControl;