
import React, { useState, useEffect } from 'react';
import { SystemMode, SystemMetrics, AutonomousConfig, BusinessType, AgentCategory, GenesisProject, GenesisTemplate } from '../types';
import { orchestrator } from '../services/orchestrator';
import { workflowEngine } from '../services/workflowEngine';
import { ShieldCheck, Cpu, Zap, RotateCcw, Building2, Briefcase, Scale, FlaskConical, Terminal, Coins, Lock, HardDrive, ShoppingBag, Factory, Stethoscope, Lightbulb, Server, Activity, Globe, Copy, Check, Network, Dna, ArrowRightLeft, Rocket, Box, Play } from 'lucide-react';
import InstallationWizard from './InstallationWizard';
import { DEFAULT_API_CONFIG } from '../constants';

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
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  
  // GENESIS STATE
  const [genesisProjects, setGenesisProjects] = useState<GenesisProject[]>([]);
  const [genesisConfig, setGenesisConfig] = useState({ workspaceRoot: './workspace', maxConcurrent: 3 });
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectTemplate, setNewProjectTemplate] = useState<GenesisTemplate>('REACT_VITE');
  const [isSpawning, setIsSpawning] = useState(false);

  useEffect(() => {
      const interval = setInterval(() => {
          setCoreServices([...orchestrator.getCoreServices()]);
          fetchGenesisProjects();
      }, 1000);
      return () => clearInterval(interval);
  }, []);

  const fetchGenesisProjects = async () => {
      try {
          const res = await fetch(`http://localhost:${DEFAULT_API_CONFIG.port}/v1/factory/list`, {
              headers: { 'Authorization': `Bearer ${DEFAULT_API_CONFIG.apiKey}` }
          });
          if(res.ok) setGenesisProjects(await res.json());
      } catch(e) {}
  };

  const spawnProject = async () => {
      if(!newProjectName) return;
      setIsSpawning(true);
      try {
          await fetch(`http://localhost:${DEFAULT_API_CONFIG.port}/v1/factory/spawn`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEFAULT_API_CONFIG.apiKey}` },
              body: JSON.stringify({ name: newProjectName, template: newProjectTemplate })
          });
          setNewProjectName('');
      } catch(e) { console.error(e); } finally { setIsSpawning(false); }
  };

  const [tempConfig, setTempConfig] = useState(autonomyConfig);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessType>('GENERAL');
  const [apiKey, setApiKey] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const generateApiKey = () => {
      const key = 'sk-silhouette-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setApiKey(key);
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

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
      if (cat === 'CORE') return;
      const isEnabled = activeCats.includes(cat);
      orchestrator.toggleCategory(cat, !isEnabled);
      setMode(SystemMode.CUSTOM);
  };

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

  const categories: AgentCategory[] = ['DEV', 'MARKETING', 'DATA', 'CYBERSEC', 'LEGAL', 'FINANCE', 'SCIENCE', 'OPS', 'HEALTH', 'RETAIL', 'MFG', 'ENERGY', 'EDU'];

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-6 overflow-hidden relative">
      
      {showIntegrationModal && (
          <InstallationWizard onComplete={() => setShowIntegrationModal(false)} onClose={() => setShowIntegrationModal(false)} />
      )}

      {/* Left Column */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Power Levels */}
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
                      className={`h-full transition-all duration-500 ${metrics.cpuTickDuration > 100 ? 'bg-red-500' : 'bg-purple-500'}`}
                      style={{ width: `${Math.min(100, metrics.cpuTickDuration * 2)}%` }}
                   />
                </div>
             </div>
          </div>
        </div>

        {/* GENESIS FACTORY (NEW) */}
        <div className="glass-panel rounded-xl p-6 border border-orange-500/30 bg-orange-900/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
                <Rocket className="text-orange-400" /> Genesis Factory
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-300 mb-2">Spawn New Application</h3>
                    <div className="space-y-3 bg-black/30 p-3 rounded border border-slate-800">
                        <input 
                            type="text" 
                            placeholder="App Name (e.g. MegaCRM)" 
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                        />
                        <select 
                            value={newProjectTemplate}
                            onChange={(e) => setNewProjectTemplate(e.target.value as GenesisTemplate)}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                        >
                            <option value="REACT_VITE">React + Vite (Standard)</option>
                            <option value="NEXT_JS">Next.js (Enterprise)</option>
                            <option value="FULL_STACK_CRM">Full Stack CRM Preset</option>
                        </select>
                        <button 
                            onClick={spawnProject}
                            disabled={isSpawning}
                            className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-bold flex items-center justify-center gap-2"
                        >
                            {isSpawning ? 'SPAWNING...' : <><Rocket size={12}/> INITIALIZE PROJECT</>}
                        </button>
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-300 mb-2">Active Creations</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {genesisProjects.length === 0 && <p className="text-xs text-slate-500 italic">No external apps created.</p>}
                        {genesisProjects.map(p => (
                            <div key={p.id} className="p-2 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
                                <div>
                                    <div className="text-xs font-bold text-white flex items-center gap-2">
                                        <Box size={10} className="text-orange-400" /> {p.name}
                                    </div>
                                    <div className="text-[9px] text-slate-500 font-mono">{p.template}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] px-1.5 rounded font-bold ${p.status === 'READY' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {p.status}
                                    </span>
                                    {p.bridgeStatus === 'CONNECTED' && <Network size={12} className="text-cyan-400" title="Bridge Connected" />}
                                    <button className="p-1 hover:bg-slate-700 rounded"><Play size={10} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Integration Bridge */}
        <div className="glass-panel rounded-xl p-6 border border-cyan-500/30 bg-cyan-900/10">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Globe className="text-cyan-400" /> Universal API Bridge
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Connect existing apps.</p>
                </div>
                <button 
                    onClick={() => setShowIntegrationModal(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                    <Network size={14} /> DEPLOY INTEGRATION SQUAD
                </button>
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    readOnly 
                    value={apiKey || "Click Generate"} 
                    className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-xs font-mono text-cyan-400"
                />
                <button onClick={generateApiKey} className="px-4 py-2 bg-cyan-700 text-white rounded text-xs font-bold hover:bg-cyan-600">GENERATE KEY</button>
            </div>
        </div>

        {/* Core Services */}
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
                                <div className={`w-2 h-2 rounded-full ${svc.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`} />
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

        {/* Division Control */}
        <div className="glass-panel rounded-xl p-6">
           <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
               <ShieldCheck className="text-green-400" /> Division Control (Custom)
           </h2>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                        className={`p-3 rounded border flex flex-col justify-between transition-all ${isEnabled ? 'bg-slate-900 border-green-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
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

      {/* Right Column: Autonomy */}
      <div className="w-80 glass-panel rounded-xl flex flex-col border-l border-cyan-900/30 flex-shrink-0">
        <div className="p-6 border-b border-cyan-900/30 bg-slate-900/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <RotateCcw className="text-purple-400" size={18} /> Autonomous Ops
          </h3>
        </div>
        <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
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
          <div className="space-y-3">
             <label className="flex items-center gap-2 text-sm text-slate-300">
               <input 
                  type="checkbox" 
                  checked={tempConfig.mode24_7}
                  onChange={(e) => setTempConfig({...tempConfig, mode24_7: e.target.checked})}
                  className="rounded bg-slate-800 border-slate-600 text-cyan-500"
               />
               <span className="flex items-center gap-2">Continuous Context Loop</span>
             </label>
          </div>
          <div className="space-y-3 p-3 rounded bg-blue-900/10 border border-blue-500/30">
             <label className="flex items-center gap-2 text-sm text-slate-300">
               <input 
                  type="checkbox" 
                  checked={tempConfig.allowEvolution}
                  onChange={(e) => setTempConfig({...tempConfig, allowEvolution: e.target.checked})}
                  className="rounded bg-slate-800 border-slate-600 text-blue-500"
               />
               <span className="flex items-center gap-2 text-blue-300 font-bold"><Dna size={14} /> Dynamic Workflow Evolution</span>
             </label>
          </div>
          <div className="space-y-3 p-3 rounded bg-orange-900/10 border border-orange-500/30">
             <label className="flex items-center gap-2 text-sm text-slate-300">
               <input 
                  type="checkbox" 
                  checked={tempConfig.smartPaging}
                  onChange={(e) => setTempConfig({...tempConfig, smartPaging: e.target.checked})}
                  className="rounded bg-slate-800 border-slate-600 text-orange-500"
               />
               <span className="flex items-center gap-2 text-orange-300 font-bold"><ArrowRightLeft size={14} /> Smart Memory Paging</span>
             </label>
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
