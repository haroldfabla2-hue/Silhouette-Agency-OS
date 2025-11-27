
import React, { useState, useEffect } from 'react';
import { SystemMode, SystemMetrics, AutonomousConfig, BusinessType, AgentCategory } from '../types';
import { orchestrator } from '../services/orchestrator';
import { workflowEngine } from '../services/workflowEngine';
import { ShieldCheck, Cpu, Zap, RotateCcw, Building2, Briefcase, Scale, FlaskConical, Terminal, Coins, Lock, HardDrive, ShoppingBag, Factory, Stethoscope, Lightbulb, Server, Activity } from 'lucide-react';

interface SystemControlProps {
  metrics: SystemMetrics;
  setMode: (mode: SystemMode) => void;
  autonomyConfig: AutonomousConfig;
  setAutonomyConfig: (config: AutonomousConfig) => void;
}

const SystemControl: React.FC<SystemControlProps> = ({ metrics, setMode, autonomyConfig, setAutonomyConfig }) => {
  const currentMode = metrics.currentMode;
  const activeCats = orchestrator.getActiveCategories();
  const [coreServices, setCoreServices] = useState(orchestrator.getCoreServices());

  useEffect(() => {
      const interval = setInterval(() => {
          setCoreServices([...orchestrator.getCoreServices()]);
      }, 1000);
      return () => clearInterval(interval);
  }, []);

  // Local state for inputs before applying
  const [tempConfig, setTempConfig] = useState(autonomyConfig);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessType>('GENERAL');

  const applyConfig = () => {
    setAutonomyConfig(tempConfig);
    workflowEngine.updateConfig(tempConfig);
  };

  const handleBusinessChange = (type: BusinessType) => {
      setSelectedBusiness(type);
      orchestrator.setBusinessPreset(type);
      setMode(SystemMode.PRESET);
  };

  const toggleDivision = (cat: AgentCategory) => {
      if (cat === 'CORE') return; // Protected
      const isEnabled = activeCats.includes(cat);
      orchestrator.toggleCategory(cat, !isEnabled);
      setMode(SystemMode.CUSTOM);
  };

  // Expanded Enterprise Business Presets
  const businessTypes: { id: BusinessType; icon: any; label: string; desc: string }[] = [
      { id: 'MARKETING_AGENCY', icon: Briefcase, label: 'Creative Agency', desc: 'Activates Marketing, Content, and Growth squads.' },
      { id: 'LAW_FIRM', icon: Scale, label: 'Legal Firm', desc: 'Prioritizes Compliance, Contracts, and Audit squads.' },
      { id: 'DEV_SHOP', icon: Terminal, label: 'Software House', desc: 'Maximum Developer and DevOps resource allocation.' },
      { id: 'FINTECH', icon: Coins, label: 'FinTech Corp', desc: 'Focus on Financial Analysis and Data Security.' },
      { id: 'HEALTHCARE_ORG', icon: Stethoscope, label: 'Healthcare', desc: 'Medical Data, Compliance and BioTech squads.' },
      { id: 'RETAIL_GIANT', icon: ShoppingBag, label: 'Retail Corp', desc: 'Ecommerce, Supply Chain and Inventory.' },
      { id: 'MANUFACTURING', icon: Factory, label: 'Industry 4.0', desc: 'IoT, Robotics, Quality Control and Safety.' },
      { id: 'ENERGY_CORP', icon: Lightbulb, label: 'Energy Grid', desc: 'Renewable, Smart Grid and Sustainability.' },
      { id: 'RESEARCH_LAB', icon: FlaskConical, label: 'R&D Lab', desc: 'Enables Science and Data Mining divisions.' },
      { id: 'CYBER_DEFENSE', icon: Lock, label: 'Cyber Security', desc: 'Activates Red Team, Blue Team and Encryption.' },
  ];

  // Expanded Categories
  const categories: AgentCategory[] = ['DEV', 'MARKETING', 'DATA', 'CYBERSEC', 'LEGAL', 'FINANCE', 'SCIENCE', 'OPS', 'HEALTH', 'RETAIL', 'MFG', 'ENERGY', 'EDU'];

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-6 overflow-hidden">
      
      {/* Left Column: Configuration & Adaptation */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* 1. Power Levels & Real Telemetry */}
        <div className="glass-panel rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <Zap className="text-yellow-400" /> System Power & Hardware (Real Telemetry)
          </h2>
          <div className="grid grid-cols-4 gap-3 mb-4">
             {[SystemMode.ECO, SystemMode.BALANCED, SystemMode.HIGH, SystemMode.ULTRA].map(mode => (
               <button
                  key={mode}
                  onClick={() => { orchestrator.setMode(mode); setMode(mode); }}
                  className={`p-3 rounded border text-center transition-all ${
                    currentMode === mode 
                      ? 'bg-cyan-900/30 border-cyan-500 text-white' 
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
               >
                 <div className="font-bold text-xs">{mode}</div>
               </button>
             ))}
          </div>
          
          {/* Real Hardware Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                   <HardDrive size={14} className="text-yellow-400" />
                   <span className="text-xs text-slate-400 font-bold">APP MEMORY (HEAP)</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                   <span className="text-slate-500">Allocated RAM</span>
                   <span className="text-white font-mono">{metrics.jsHeapSize.toFixed(1)} MB</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                      className="h-full bg-yellow-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (metrics.jsHeapSize / 1000) * 100)}%` }}
                   />
                </div>
             </div>

             <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                   <Cpu size={14} className="text-purple-400" />
                   <span className="text-xs text-slate-400 font-bold">LOGIC LOAD (CPU)</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                   <span className="text-slate-500">Loop Latency</span>
                   <span className="text-white font-mono">{metrics.cpuTickDuration.toFixed(2)} ms</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                      className={`h-full transition-all duration-500 ${metrics.cpuTickDuration > 50 ? 'bg-red-500' : 'bg-purple-500'}`}
                      style={{ width: `${Math.min(100, metrics.cpuTickDuration * 2)}%` }}
                   />
                </div>
             </div>
          </div>
        </div>

        {/* 2. Core Services Health (Enterprise Architecture) */}
        <div className="glass-panel rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Server className="text-cyan-400" /> Core Services Architecture
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {coreServices.map(svc => (
                    <div key={svc.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white truncate">{svc.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono">:{svc.port}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${svc.status === 'ONLINE' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`} />
                                <span className="text-[10px] text-green-400">{svc.status}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">{svc.latency}ms</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-green-500" style={{width: `${svc.uptime}%`}} />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* 3. Business Adaptation */}
        <div className="glass-panel rounded-xl p-6">
           <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Building2 className="text-purple-400" /> Business Identity Adaptation
           </h2>
           <p className="text-xs text-slate-400 mb-4">
              Auto-configure the swarm for specific industry verticals.
           </p>
           <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {businessTypes.map(biz => {
                  const Icon = biz.icon;
                  const isActive = currentMode === SystemMode.PRESET && selectedBusiness === biz.id;
                  return (
                      <button
                        key={biz.id}
                        onClick={() => handleBusinessChange(biz.id)}
                        className={`p-4 rounded-lg border text-left transition-all hover:bg-slate-800/50 ${
                            isActive 
                            ? 'bg-purple-900/20 border-purple-500 ring-1 ring-purple-500/50' 
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                          <div className={`mb-2 ${isActive ? 'text-purple-400' : 'text-slate-500'}`}>
                              <Icon size={20} />
                          </div>
                          <h4 className={`text-sm font-bold mb-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>{biz.label}</h4>
                          <p className="text-[10px] text-slate-500 leading-tight">{biz.desc}</p>
                      </button>
                  );
              })}
           </div>
        </div>

        {/* 4. Granular Division Control */}
        <div className="glass-panel rounded-xl p-6">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <ShieldCheck className="text-green-400" /> Division Control (Custom)
              </h2>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Core is locked */}
              <div className="p-3 bg-slate-900/80 border border-cyan-900/30 rounded flex flex-col justify-between opacity-70 cursor-not-allowed">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-cyan-400">CORE</span>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  </div>
                  <span className="text-[10px] text-slate-400">6 Squads</span>
              </div>
              
              {categories.map(cat => {
                  const isEnabled = activeCats.includes(cat);
                  const count = orchestrator.getSquadCountByCategory(cat);
                  return (
                      <button 
                        key={cat}
                        onClick={() => toggleDivision(cat)}
                        className={`p-3 rounded border flex flex-col justify-between transition-all ${
                            isEnabled 
                             ? 'bg-slate-900 border-green-500/50' 
                             : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                          <div className="flex items-center justify-between w-full mb-2">
                             <span className={`text-xs font-bold ${isEnabled ? 'text-white' : 'text-slate-500'}`}>{cat}</span>
                             <div className={`w-2 h-2 rounded-full transition-all ${isEnabled ? 'bg-green-400' : 'bg-slate-600'}`} />
                          </div>
                          <span className="text-[10px] text-slate-500 w-full text-left">{count} Squads</span>
                      </button>
                  );
              })}
           </div>
        </div>
      </div>

      {/* Right Column: Autonomy Config */}
      <div className="w-80 glass-panel rounded-xl flex flex-col border-l border-cyan-900/30 flex-shrink-0">
        <div className="p-6 border-b border-cyan-900/30 bg-slate-900/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <RotateCcw className="text-purple-400" size={18} />
            Autonomous Ops
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Configure self-healing loops and safety constraints.
          </p>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          
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
                 Continuous Context Loop
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
          </div>

          <button 
            onClick={applyConfig}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold transition-colors flex items-center justify-center gap-2"
          >
            APPLY CONFIGURATION
          </button>
          
          <div className="mt-8 p-4 bg-slate-900 rounded border border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 flex items-center gap-2 mb-2">
                  <Activity size={12} /> Active Policy
              </h4>
              <ul className="text-[10px] text-slate-500 font-mono space-y-1">
                  <li>Strategy: The Crucible (QA Loop)</li>
                  <li>Introspection: {metrics.introspectionDepth} Layers</li>
                  <li>Max Retries: 3</li>
                  <li>Safety: Active Monitoring</li>
              </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemControl;
