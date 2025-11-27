
import React, { useState, useEffect } from 'react';
import { SystemMode, SystemMetrics, AutonomousConfig, BusinessType, AgentCategory, GenesisProject, GenesisTemplate, NeuroLinkStatus } from '../types';
import { orchestrator } from '../services/orchestrator';
import { workflowEngine } from '../services/workflowEngine';
import { neuroLink } from '../services/neuroLinkService';
import { ShieldCheck, Cpu, Zap, RotateCcw, Briefcase, Scale, FlaskConical, Terminal, Coins, Lock, HardDrive, ShoppingBag, Factory, Stethoscope, Lightbulb, Server, Globe, Network, Rocket, Box, Play, GitBranch, CloudLightning } from 'lucide-react';
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
  const [activeNodes, setActiveNodes] = useState(neuroLink.getNodes());
  
  // GENESIS STATE
  const [genesisProjects, setGenesisProjects] = useState<GenesisProject[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectTemplate, setNewProjectTemplate] = useState<GenesisTemplate>('REACT_VITE');
  const [isSpawning, setIsSpawning] = useState(false);

  useEffect(() => {
      const interval = setInterval(() => {
          setCoreServices([...orchestrator.getCoreServices()]);
          setActiveNodes([...neuroLink.getNodes()]);
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
          // Register the node for Neuro-Link immediately upon creation
          neuroLink.registerNode(newProjectName.toLowerCase(), `https://${newProjectName.toLowerCase()}.internal`);
          
          await fetch(`http://localhost:${DEFAULT_API_CONFIG.port}/v1/factory/spawn`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEFAULT_API_CONFIG.apiKey}` },
              body: JSON.stringify({ name: newProjectName, template: newProjectTemplate })
          });
          setNewProjectName('');
      } catch(e) { console.error(e); } finally { setIsSpawning(false); }
  };

  const [tempConfig, setTempConfig] = useState(autonomyConfig);
  const [apiKey, setApiKey] = useState<string>('');

  const generateApiKey = () => {
      const key = 'sk-silhouette-' + Math.random().toString(36).substring(2, 15);
      setApiKey(key);
  };

  const applyConfig = () => {
    setAutonomyConfig(tempConfig);
    workflowEngine.updateConfig(tempConfig);
  };

  const toggleDivision = (cat: AgentCategory) => {
      if (cat === 'CORE') return;
      const isEnabled = activeCats.includes(cat);
      orchestrator.toggleCategory(cat, !isEnabled);
      setMode(SystemMode.CUSTOM);
  };

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
            <Zap className="text-yellow-400" /> System Power & Hardware
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
        </div>

        {/* GENESIS FACTORY V2 (GIT-OPS) */}
        <div className="glass-panel rounded-xl p-6 border border-orange-500/30 bg-orange-900/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
                <Rocket className="text-orange-400" /> Genesis Factory V2 (Git-Ops)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-300 mb-2">Automated Deployment Pipeline</h3>
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
                            <option value="REACT_VITE">React + Vite + Tailwind</option>
                            <option value="NEXT_JS">Next.js 14 (App Router)</option>
                            <option value="FULL_STACK_CRM">Full Stack CRM (Node/PG)</option>
                        </select>
                        
                        <div className="flex gap-2">
                             <div className="flex-1 bg-slate-900 p-2 rounded border border-slate-800 flex items-center gap-2 opacity-70">
                                 <GitBranch size={12} className="text-white"/> <span className="text-[9px] text-slate-400">git push origin master</span>
                             </div>
                             <div className="flex-1 bg-slate-900 p-2 rounded border border-slate-800 flex items-center gap-2 opacity-70">
                                 <CloudLightning size={12} className="text-purple-400"/> <span className="text-[9px] text-slate-400">Coolify Webhook</span>
                             </div>
                        </div>

                        <button 
                            onClick={spawnProject}
                            disabled={isSpawning}
                            className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-bold flex items-center justify-center gap-2"
                        >
                            {isSpawning ? 'PROVISIONING INFRA...' : <><Rocket size={12}/> INITIALIZE & DEPLOY</>}
                        </button>
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-300 mb-2">Hive Mind Status (Neuro-Link)</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {activeNodes.length === 0 && <p className="text-xs text-slate-500 italic">No nodes connected.</p>}
                        {activeNodes.map(node => (
                            <div key={node.id} className="p-2 bg-slate-900 border border-slate-800 rounded flex justify-between items-center group hover:border-cyan-500/50 transition-colors">
                                <div>
                                    <div className="text-xs font-bold text-white flex items-center gap-2">
                                        <Network size={10} className="text-cyan-400" /> {node.projectId}
                                    </div>
                                    <div className="text-[9px] text-slate-500 font-mono flex gap-2">
                                        <span>CPU: {node.resources.cpu.toFixed(0)}%</span>
                                        <span>MEM: {node.resources.memory.toFixed(0)}MB</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${node.status === NeuroLinkStatus.CONNECTED ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                                    <span className="text-[9px] font-mono text-slate-400">{node.latency.toFixed(0)}ms</span>
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
                    <p className="text-xs text-slate-400 mt-1">Connect existing apps via Neuro-Link.</p>
                </div>
                <button 
                    onClick={() => setShowIntegrationModal(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                    <Network size={14} /> DEPLOY NEURO-LINK SQUAD
                </button>
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
