import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AgentOrchestrator from './components/AgentOrchestrator';
import IntrospectionHub from './components/IntrospectionHub';
import TerminalLog from './components/TerminalLog';
import SystemControl from './components/SystemControl'; // New Import
import { Agent, SystemMetrics, Project, SystemMode } from './types';
import { MOCK_PROJECTS, SYSTEM_LOGS } from './constants';
import { orchestrator } from './services/orchestrator';
import { continuum } from './services/continuumMemory';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalRamUsage: 0,
    vramUsage: 1.2, // Base OS usage
    activeAgents: 0,
    introspectionDepth: 32,
    awarenessScore: 85.0,
    fps: 60,
    currentMode: SystemMode.ECO
  });
  const [logs, setLogs] = useState<string[]>(SYSTEM_LOGS);

  const handleModeChange = (mode: SystemMode) => {
    // This allows the SystemControl component to update the parent state
    setMetrics(prev => ({ ...prev, currentMode: mode }));
  };

  // Real Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Tick the Swarm Logic
      orchestrator.tick();
      const currentAgents = orchestrator.getAgents();
      
      // 2. Calculate Real Metrics based on Agent Activity
      const activeCount = orchestrator.getActiveCount();
      const ramTotal = orchestrator.getTotalRam() / 1024; // Convert MB to GB
      
      // 3. VRAM simulation (RTX 3050 4GB Cap)
      // Visual agents consume more VRAM
      // Calculate active visual agents (MKT category usually has image gen)
      const visualAgents = currentAgents.filter(a => a.category === 'MARKETING' && a.enabled).length;
      const standardAgents = activeCount - visualAgents;
      
      // Formula: Base OS (1.2) + Standard (15MB each) + Visual (150MB each)
      const visualLoad = (visualAgents * 0.15) + (standardAgents * 0.015); 
      const baseVram = 1.2; // Windows Idle
      const totalVram = Math.min(4.0, baseVram + visualLoad);

      setAgents([...currentAgents]); // Force re-render with new state
      
      setMetrics(prev => ({
        ...prev,
        activeAgents: activeCount,
        totalRamUsage: 4.5 + ramTotal, // 4.5GB Base OS + Agents
        vramUsage: totalVram,
        // Awareness score fluctuates based on memory density
        awarenessScore: Math.min(99.9, 85 + (continuum.getStats().archivedNodes * 0.1)),
        fps: Math.max(30, 144 - (activeCount * 0.5)) // Performance impact
      }));

    }, 1000); // 1 Second tick rate

    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard metrics={metrics} projects={MOCK_PROJECTS} />;
      case 'system_control':
        return <SystemControl metrics={metrics} setMode={handleModeChange} />;
      case 'orchestrator':
        return <AgentOrchestrator agents={agents} />;
      case 'introspection':
        return <IntrospectionHub />;
      case 'terminal':
        return <TerminalLog logs={logs} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-500">
            Module {activeTab} is currently in restricted mode or offline.
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-8 overflow-y-auto relative">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-50"></div>
         {renderContent()}
      </main>
    </div>
  );
};

export default App;