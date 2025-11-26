import React, { useState } from 'react';
import { Agent, AgentStatus, Squad, AgentRoleType, WorkflowStage } from '../types';
import { Server, Terminal, Play, Square, RefreshCw, Cpu, ChevronRight, Crown, Users } from 'lucide-react';
import { orchestrator } from '../services/orchestrator';

interface OrchestratorProps {
  agents: Agent[];
  currentStage: WorkflowStage;
}

const AgentOrchestrator: React.FC<OrchestratorProps> = ({ agents, currentStage }) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const squads = orchestrator.getSquads();

  const pipelineSteps = [
    { id: WorkflowStage.INTENT, label: 'INTENT' },
    { id: WorkflowStage.PLANNING, label: 'PLAN' },
    { id: WorkflowStage.EXECUTION, label: 'EXECUTE' },
    { id: WorkflowStage.OPTIMIZATION, label: 'OPTIMIZE' },
    { id: WorkflowStage.ARCHIVAL, label: 'ARCHIVE' },
  ];

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-4">
      
      {/* 1. Workflow Pipeline Header */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-4 w-full">
           <div className="flex items-center gap-2 mr-8">
              <Server className="text-cyan-400" />
              <div>
                <h2 className="text-white font-bold text-sm">WORKFLOW ENGINE</h2>
                <p className="text-[10px] text-slate-400 font-mono">AUTONOMOUS</p>
              </div>
           </div>

           <div className="flex-1 flex items-center justify-between relative">
              {/* Connection Line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10"></div>
              
              {pipelineSteps.map((step, idx) => {
                const isActive = currentStage === step.id;
                const isPast = pipelineSteps.findIndex(p => p.id === currentStage) > idx;
                
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-950 px-2 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isActive ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' :
                      isPast ? 'bg-green-500/20 border-green-500 text-green-500' :
                      'bg-slate-900 border-slate-700 text-slate-600'
                    }`}>
                      {isActive ? <div className="w-3 h-3 bg-white rounded-full animate-pulse" /> : 
                       isPast ? <div className="w-3 h-3 bg-green-500 rounded-full" /> :
                       <div className="w-2 h-2 bg-slate-600 rounded-full" />
                      }
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
           </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* 2. Squad Grid */}
        <div className="flex-1 glass-panel rounded-xl p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {squads.map(squad => {
              const squadAgents = agents.filter(a => a.teamId === squad.id);
              const leader = squadAgents.find(a => a.roleType === AgentRoleType.LEADER);
              const workers = squadAgents.filter(a => a.roleType === AgentRoleType.WORKER);
              const activeWorkers = workers.filter(a => a.enabled).length;
              
              return (
                <div key={squad.id} className={`rounded-xl border flex flex-col transition-all ${
                  squad.active 
                    ? 'bg-slate-900/60 border-cyan-900/50 shadow-[0_0_10px_rgba(0,0,0,0.2)]' 
                    : 'bg-slate-900/20 border-slate-800 opacity-60 grayscale'
                }`}>
                  {/* Squad Header */}
                  <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-xl">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                         {squad.active ? <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> : <span className="w-2 h-2 bg-red-900 rounded-full"/>}
                         {squad.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {squad.id}</p>
                    </div>
                    <div className="px-2 py-1 bg-slate-800 rounded text-[10px] font-mono text-cyan-400">
                      {activeWorkers}/{workers.length} UNITS
                    </div>
                  </div>

                  {/* Leader Section */}
                  <div className="p-3 bg-cyan-950/10 border-b border-slate-800">
                    <p className="text-[10px] text-cyan-600 font-bold uppercase mb-2 flex items-center gap-1">
                      <Crown size={10} /> Squad Leader
                    </p>
                    {leader ? (
                       <div 
                         onClick={() => setSelectedAgent(leader)}
                         className={`p-2 rounded border bg-slate-900 cursor-pointer hover:border-cyan-500 transition-colors flex items-center gap-3 ${
                           selectedAgent?.id === leader.id ? 'border-cyan-500' : 'border-slate-800'
                         }`}
                       >
                          <div className={`w-2 h-2 rounded-full ${leader.status === AgentStatus.WORKING ? 'bg-green-400' : 'bg-yellow-500'}`} />
                          <div className="overflow-hidden">
                             <p className="text-xs text-white font-medium truncate">{leader.name}</p>
                             <p className="text-[10px] text-slate-500 truncate">{leader.role}</p>
                          </div>
                       </div>
                    ) : <span className="text-xs text-red-500">NO LEADER ASSIGNED</span>}
                  </div>

                  {/* Workers Preview */}
                  <div className="p-3 flex-1">
                    <p className="text-[10px] text-slate-600 font-bold uppercase mb-2 flex items-center gap-1">
                      <Users size={10} /> Active Drones
                    </p>
                    <div className="space-y-1">
                       {workers.slice(0, 3).map(worker => (
                         <div key={worker.id} className="flex items-center gap-2 text-[10px] text-slate-400">
                            <div className={`w-1.5 h-1.5 rounded-full ${worker.enabled ? 'bg-green-500/50' : 'bg-slate-700'}`} />
                            <span className="font-mono">{worker.name}</span>
                         </div>
                       ))}
                       {workers.length > 3 && (
                         <div className="text-[10px] text-slate-600 font-mono pl-4">
                           + {workers.length - 3} more units...
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Inspector Panel (Same as before but refined) */}
        <div className="w-80 glass-panel rounded-xl flex flex-col border-l border-cyan-900/30 overflow-hidden">
          {selectedAgent ? (
            <>
              <div className="p-5 border-b border-cyan-900/30 bg-slate-900/50">
                <h3 className="text-lg font-bold text-white">{selectedAgent.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    selectedAgent.roleType === AgentRoleType.LEADER 
                      ? 'bg-yellow-900/20 text-yellow-400 border-yellow-700'
                      : 'bg-cyan-900/30 text-cyan-400 border-cyan-900/50'
                  }`}>
                    {selectedAgent.roleType}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedAgent.status}</span>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                <div>
                  <label className="text-xs text-slate-500 uppercase font-mono">Current Objective</label>
                  <p className="font-mono text-sm text-cyan-200 mt-1">
                    {selectedAgent.enabled 
                      ? `Executing ${currentStage} protocols for Team ${selectedAgent.teamId}.` 
                      : "Offline. Waiting for workflow activation."}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <span className="text-xs text-slate-500 block">RAM Usage</span>
                    <span className="text-xl font-mono text-white">{selectedAgent.ramUsage.toFixed(0)} MB</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <span className="text-xs text-slate-500 block">CPU Core</span>
                    <span className="text-xl font-mono text-white">{selectedAgent.cpuUsage.toFixed(1)}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase font-mono flex items-center gap-2 mb-2">
                    <Terminal size={12} /> Live Stdout
                  </label>
                  <div className="bg-black p-3 rounded text-[10px] font-mono text-green-400 h-40 overflow-hidden relative">
                    <div className="opacity-70">
                      {`> role: ${selectedAgent.role}\n> team: ${selectedAgent.teamId}\n> status: ${selectedAgent.status}\n> connected to WorkflowEngine.\n> waiting for instructions...`}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-8 text-center">
              <Server size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Select a Squad Leader or Worker to inspect.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentOrchestrator;