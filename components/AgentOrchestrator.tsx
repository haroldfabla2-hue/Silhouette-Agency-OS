

import React, { useState, useMemo, useEffect } from 'react';
import { Agent, AgentStatus, Squad, AgentRoleType, WorkflowStage, AgentCategory } from '../types';
import { Server, Terminal, Search, Filter, Crown, Users, Shield, Code, DollarSign, Database, Microscope, Scale, Briefcase, CheckCircle2, XCircle, Stethoscope, ShoppingBag, Factory, Lightbulb, GraduationCap, HardDrive, Cpu, CloudOff } from 'lucide-react';
import { orchestrator } from '../services/orchestrator';
import { workflowEngine } from '../services/workflowEngine';

interface OrchestratorProps {
  agents: Agent[];
  currentStage: WorkflowStage;
}

const AgentOrchestrator: React.FC<OrchestratorProps> = ({ agents, currentStage }) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<AgentCategory | 'ALL'>('ALL');
  const [qualityScore, setQualityScore] = useState(100);

  // Poll for quality score updates
  useEffect(() => {
     const interval = setInterval(() => {
         setQualityScore(workflowEngine.getLastQualityScore());
     }, 1000);
     return () => clearInterval(interval);
  }, []);
  
  const squads = orchestrator.getSquads();

  const pipelineSteps = [
    { id: WorkflowStage.INTENT, label: 'INTENT' },
    { id: WorkflowStage.PLANNING, label: 'PLAN' },
    { id: WorkflowStage.EXECUTION, label: 'EXECUTE' },
    { id: WorkflowStage.QA_AUDIT, label: 'QA AUDIT' }, 
    { id: WorkflowStage.REMEDIATION, label: 'FIX' },     
    { id: WorkflowStage.OPTIMIZATION, label: 'OPTIMIZE' },
    { id: WorkflowStage.ARCHIVAL, label: 'ARCHIVE' },
    { id: WorkflowStage.META_ANALYSIS, label: 'ADAPT' } // New Adaptation Stage
  ];

  // Icons for Categories (Expanded Enterprise)
  const categoryIcons: Record<string, any> = {
      'CORE': Server,
      'DEV': Code,
      'CYBERSEC': Shield,
      'FINANCE': DollarSign,
      'DATA': Database,
      'SCIENCE': Microscope,
      'LEGAL': Scale,
      'OPS': Briefcase,
      'MARKETING': Users,
      'HEALTH': Stethoscope,
      'RETAIL': ShoppingBag,
      'MFG': Factory,
      'ENERGY': Lightbulb,
      'EDU': GraduationCap
  };

  const filteredSquads = useMemo(() => {
    return squads.filter(squad => {
      const matchesSearch = squad.name.toLowerCase().includes(searchQuery.toLowerCase()) || squad.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'ALL' || squad.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [squads, searchQuery, activeFilter]);

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-4">
      
      {/* 1. Workflow Pipeline Header */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4 w-full">
           <div className="flex items-center gap-2 mr-8 min-w-[150px]">
              <Server className="text-cyan-400" />
              <div>
                <h2 className="text-white font-bold text-sm">WORKFLOW ENGINE</h2>
                <div className="flex items-center gap-2">
                    <p className="text-[10px] text-slate-400 font-mono">AUTONOMOUS</p>
                    {/* Quality Gate Indicator */}
                    {(currentStage === WorkflowStage.QA_AUDIT || currentStage === WorkflowStage.REMEDIATION) && (
                        <span className={`text-[10px] font-bold px-1.5 rounded ${qualityScore >= 99 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            Q-SCORE: {qualityScore}%
                        </span>
                    )}
                </div>
              </div>
           </div>

           <div className="flex-1 flex items-center justify-between relative px-8">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10"></div>
              {pipelineSteps.map((step, idx) => {
                const isActive = currentStage === step.id;
                // Special case for ADAPT (Meta Analysis)
                const isMeta = step.id === WorkflowStage.META_ANALYSIS;
                const isPast = pipelineSteps.findIndex(p => p.id === currentStage) > idx;
                
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-950 px-2 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isActive ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' :
                      isPast ? 'bg-green-500/20 border-green-500 text-green-500' :
                      isMeta ? 'bg-purple-900/20 border-purple-500 text-purple-500' :
                      'bg-slate-900 border-slate-700 text-slate-600'
                    }`}>
                      {isActive ? <div className="w-3 h-3 bg-white rounded-full animate-pulse" /> : 
                       isPast ? <CheckCircle2 size={14} /> :
                       isMeta ? <Database size={14} /> :
                       <div className="w-2 h-2 bg-slate-600 rounded-full" />
                      }
                    </div>
                    <span className={`text-[9px] font-mono font-bold ${isActive ? 'text-cyan-400' : isMeta ? 'text-purple-400' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
           </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* 2. Main Swarm Grid */}
        <div className="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden">
            
            {/* Filters Toolbar */}
            <div className="p-4 border-b border-cyan-900/30 flex items-center gap-4 bg-slate-900/50">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search 131 Squads..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-full py-2 pl-9 pr-4 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                </div>
                
                <div className="flex-1 overflow-x-auto flex gap-2 no-scrollbar">
                    <button 
                        onClick={() => setActiveFilter('ALL')}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors ${activeFilter === 'ALL' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        ALL ({squads.length})
                    </button>
                    {Object.keys(categoryIcons).map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveFilter(cat as AgentCategory)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors ${activeFilter === cat ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Squads Render */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredSquads.map(squad => {
                    const squadAgents = agents.filter(a => a.teamId === squad.id);
                    const leader = squadAgents.find(a => a.roleType === AgentRoleType.LEADER);
                    const workers = squadAgents.filter(a => a.roleType === AgentRoleType.WORKER);
                    const activeWorkers = workers.filter(a => a.enabled).length;
                    const CatIcon = categoryIcons[squad.category] || Users;
                    
                    // Check if squad is "hibernated" (simulated check for now based on status)
                    const isHibernated = leader?.status === AgentStatus.HIBERNATED;

                    return (
                        <div key={squad.id} className={`rounded-xl border flex flex-col transition-all group relative overflow-hidden ${
                        squad.active && !isHibernated
                            ? 'bg-slate-900/80 border-cyan-900/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:border-cyan-500/50' 
                            : 'bg-slate-900/30 border-slate-800 opacity-60 hover:opacity-100'
                        }`}>
                        
                        {/* HIBERNATION OVERLAY FOR LOCAL MODE */}
                        {isHibernated && (
                            <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center flex-col text-slate-500 backdrop-blur-[1px] pointer-events-none group-hover:hidden">
                                <CloudOff size={24} className="mb-1" />
                                <span className="text-[10px] font-bold tracking-widest">SERVER REQ.</span>
                            </div>
                        )}

                        {/* Squad Header */}
                        <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-black/20 rounded-t-xl">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className={`p-1.5 rounded-md ${squad.active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                                    <CatIcon size={14} />
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="text-xs font-bold text-white truncate w-32">{squad.name}</h3>
                                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">{squad.id} : {squad.port}</p>
                                </div>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${squad.active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-slate-700'}`} />
                        </div>

                        {/* Leader Section */}
                        <div className="p-3 border-b border-slate-800/50 bg-gradient-to-b from-transparent to-black/20">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-1">
                                    <Crown size={9} className="text-yellow-500" /> Commander
                                </p>
                                {/* Memory Location Indicator */}
                                {leader && leader.enabled && (
                                    <div className={`text-[8px] px-1 rounded font-bold border ${leader.memoryLocation === 'VRAM' ? 'bg-purple-900/20 text-purple-400 border-purple-500/30' : 'bg-orange-900/20 text-orange-400 border-orange-500/30'}`}>
                                        {leader.memoryLocation}
                                    </div>
                                )}
                            </div>
                            {leader ? (
                            <div 
                                onClick={() => setSelectedAgent(leader)}
                                className={`p-2 rounded border cursor-pointer transition-colors flex items-center gap-3 ${
                                selectedAgent?.id === leader.id 
                                    ? 'bg-cyan-900/30 border-cyan-500' 
                                    : 'bg-slate-950/50 border-slate-800 hover:border-cyan-700'
                                }`}
                            >
                                <div className={`w-2 h-2 rounded-full ${
                                    leader.status === AgentStatus.WORKING ? 'bg-green-400' : 
                                    leader.status === AgentStatus.HIBERNATED ? 'bg-slate-600' : 
                                    'bg-yellow-500'
                                }`} />
                                <div className="overflow-hidden flex-1">
                                    <p className="text-[10px] text-white font-medium truncate">{leader.name}</p>
                                    <p className="text-[9px] text-slate-500 truncate">{leader.role}</p>
                                </div>
                            </div>
                            ) : <span className="text-[10px] text-red-500">MISSING</span>}
                        </div>

                        {/* Workers Status */}
                        <div className="p-3 flex items-center justify-between">
                             <div className="flex -space-x-1.5">
                                {workers.map((w, i) => (
                                    <div 
                                        key={w.id} 
                                        className={`w-4 h-4 rounded-full border border-slate-900 flex items-center justify-center text-[8px] text-black font-bold relative group/worker ${w.enabled ? 'bg-cyan-500' : 'bg-slate-700'}`}
                                        title={`${w.name} (${w.memoryLocation})`}
                                    >
                                        {i + 1}
                                        {/* RAM Indicator Dot */}
                                        {w.enabled && w.memoryLocation === 'RAM' && (
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border border-black" />
                                        )}
                                    </div>
                                ))}
                             </div>
                             <span className="text-[9px] font-mono text-slate-500">{activeWorkers} ACTIVE</span>
                        </div>
                        </div>
                    );
                    })}
                </div>
            </div>
        </div>

        {/* 3. Inspector Panel */}
        <div className="w-80 glass-panel rounded-xl flex flex-col border-l border-cyan-900/30 overflow-hidden">
          {selectedAgent ? (
            <>
              <div className="p-5 border-b border-cyan-900/30 bg-slate-900/50">
                <h3 className="text-lg font-bold text-white truncate">{selectedAgent.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    selectedAgent.roleType === AgentRoleType.LEADER 
                      ? 'bg-yellow-900/20 text-yellow-400 border-yellow-700'
                      : 'bg-cyan-900/30 text-cyan-400 border-cyan-900/50'
                  }`}>
                    {selectedAgent.roleType}
                  </span>
                  <span className={`text-xs font-mono ${selectedAgent.status === AgentStatus.HIBERNATED ? 'text-slate-500' : 'text-slate-400'}`}>
                    {selectedAgent.status}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                <div>
                  <label className="text-xs text-slate-500 uppercase font-mono">Mission Directive</label>
                  <p className="font-mono text-sm text-cyan-200 mt-1 leading-relaxed">
                    {selectedAgent.status === AgentStatus.HIBERNATED
                      ? "AGENT HIBERNATED. Connect Backend Node to awaken capability."
                      : selectedAgent.enabled 
                        ? `Active Protocol: ${currentStage}. Coordinating with ${selectedAgent.category} division.` 
                        : "System Offline. Waiting for deployment authorization."}
                  </p>
                </div>
                
                {/* Physical Location Card */}
                <div className={`p-3 rounded border ${selectedAgent.memoryLocation === 'VRAM' ? 'bg-purple-900/20 border-purple-500/50' : 'bg-orange-900/20 border-orange-500/50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        {selectedAgent.memoryLocation === 'VRAM' ? <Cpu size={14} className="text-purple-400" /> : <HardDrive size={14} className="text-orange-400" />}
                        <span className={`text-xs font-bold ${selectedAgent.memoryLocation === 'VRAM' ? 'text-purple-400' : 'text-orange-400'}`}>
                            PHYSICAL LOCATION: {selectedAgent.memoryLocation}
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                        {selectedAgent.memoryLocation === 'VRAM' 
                            ? "High-speed tensor execution. Low latency." 
                            : "Offloaded to System RAM. High bus latency detected."}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <span className="text-xs text-slate-500 block">RAM Alloc</span>
                    <span className="text-xl font-mono text-white">{selectedAgent.ramUsage.toFixed(0)} MB</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <span className="text-xs text-slate-500 block">Thread Load</span>
                    <span className="text-xl font-mono text-white">{selectedAgent.cpuUsage.toFixed(1)}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase font-mono flex items-center gap-2 mb-2">
                    <Terminal size={12} /> Container Logs
                  </label>
                  <div className="bg-black p-3 rounded text-[10px] font-mono text-green-400 h-48 overflow-hidden relative">
                    <div className="opacity-70 space-y-1">
                      <p>{`> init process --id=${selectedAgent.id}`}</p>
                      <p>{`> mounting volume /mnt/data/${selectedAgent.category.toLowerCase()}`}</p>
                      <p>{`> binding port: ${selectedAgent.port || 'DYNAMIC'}... OK`}</p>
                      {selectedAgent.enabled && selectedAgent.status !== AgentStatus.HIBERNATED && (
                          <>
                            <p className="text-cyan-400">{`> status: ONLINE`}</p>
                            <p className={selectedAgent.memoryLocation === 'VRAM' ? 'text-purple-400' : 'text-orange-400'}>
                                {`> memory_context: ${selectedAgent.memoryLocation}`}
                            </p>
                            <p>{`> receiving task packet...`}</p>
                            <p>{`> processing...`}</p>
                          </>
                      )}
                      {selectedAgent.status === AgentStatus.HIBERNATED && (
                           <p className="text-slate-500">{`> status: HIBERNATED (LOCAL MODE LIMIT)`}</p>
                      )}
                      {!selectedAgent.enabled && <p className="text-red-500">{`> status: SLEEP MODE`}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-8 text-center">
              <Server size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Select a Squad from the grid to inspect container telemetry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentOrchestrator;
