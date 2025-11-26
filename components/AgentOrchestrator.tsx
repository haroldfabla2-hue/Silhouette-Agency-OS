import React, { useState } from 'react';
import { Agent, AgentStatus } from '../types';
import { Server, Terminal, Play, Square, RefreshCw, Cpu } from 'lucide-react';

interface OrchestratorProps {
  agents: Agent[];
}

const AgentOrchestrator: React.FC<OrchestratorProps> = ({ agents }) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-6">
      {/* Grid View */}
      <div className="flex-1 glass-panel rounded-xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Server className="text-cyan-400" />
              Agent Swarm Orchestrator
            </h2>
            <p className="text-slate-400 text-sm font-mono mt-1">
              Active Containers: <span className="text-green-400">131</span> | Clusters: 7 | Load: 42%
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-slate-800 rounded hover:bg-slate-700 text-cyan-400"><RefreshCw size={18} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {/* Render known agents first */}
            {agents.map(agent => (
              <div 
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedAgent?.id === agent.id 
                    ? 'bg-cyan-950/40 border-cyan-500' 
                    : 'bg-slate-900/50 border-slate-800 hover:border-cyan-800'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === AgentStatus.WORKING ? 'bg-green-500 animate-pulse' :
                    agent.status === AgentStatus.THINKING ? 'bg-purple-500 animate-pulse' :
                    agent.status === AgentStatus.IDLE ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-[10px] font-mono text-slate-500">{agent.id}</span>
                </div>
                <h4 className="text-sm font-medium text-white truncate">{agent.name}</h4>
                <p className="text-[10px] text-slate-400 truncate">{agent.role}</p>
                
                <div className="mt-2 flex items-center gap-1">
                  <Cpu size={10} className="text-slate-500" />
                  <div className="flex-1 h-1 bg-slate-800 rounded-full">
                    <div 
                      className="h-full bg-cyan-500 rounded-full" 
                      style={{ width: `${agent.cpuUsage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {/* Generate placeholders to simulate 131 agents visually */}
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={`ghost-${i}`} className="p-3 rounded-lg border bg-slate-900/20 border-slate-800 opacity-50">
                 <div className="flex justify-between items-start mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-900" />
                  <span className="text-[10px] font-mono text-slate-700">gen-{i+100}</span>
                </div>
                <div className="h-4 w-20 bg-slate-800 rounded mb-1"></div>
                <div className="h-3 w-12 bg-slate-800/50 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspector Panel */}
      <div className="w-80 glass-panel rounded-xl p-0 flex flex-col border-l border-cyan-900/30 overflow-hidden">
        {selectedAgent ? (
          <>
            <div className="p-5 border-b border-cyan-900/30 bg-slate-900/50">
              <h3 className="text-lg font-bold text-white">{selectedAgent.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-900/30 text-cyan-400 border border-cyan-900/50">
                  {selectedAgent.role}
                </span>
                <span className="text-xs text-slate-400 font-mono">{selectedAgent.status}</span>
              </div>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="text-xs text-slate-500 uppercase font-mono">Docker Container ID</label>
                <p className="font-mono text-sm text-cyan-200">a1b2-c3d4-{selectedAgent.id}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-xs text-slate-500 block">RAM Usage</span>
                  <span className="text-xl font-mono text-white">{selectedAgent.ramUsage} MB</span>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-xs text-slate-500 block">CPU Core</span>
                  <span className="text-xl font-mono text-white">{selectedAgent.cpuUsage}%</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase font-mono flex items-center gap-2 mb-2">
                  <Terminal size={12} /> Live Stdout
                </label>
                <div className="bg-black p-3 rounded text-[10px] font-mono text-green-400 h-40 overflow-hidden relative">
                  <div className="opacity-70">
                    {`> starting process...\n> connected to database\n> waiting for task...\n> [INTROSPECTION] monitoring layer 32\n> ready.`}
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black to-transparent"></div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-cyan-900/30 grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 py-2 bg-red-900/20 text-red-400 border border-red-900/50 rounded hover:bg-red-900/40">
                <Square size={14} /> STOP
              </button>
              <button className="flex items-center justify-center gap-2 py-2 bg-green-900/20 text-green-400 border border-green-900/50 rounded hover:bg-green-900/40">
                <Play size={14} /> RESTART
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-8 text-center">
            <Server size={48} className="mb-4 opacity-20" />
            <p className="text-sm">Select an agent container to inspect details, logs, and resource usage.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentOrchestrator;