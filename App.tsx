import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AgentOrchestrator from './components/AgentOrchestrator';
import IntrospectionHub from './components/IntrospectionHub';
import TerminalLog from './components/TerminalLog';
import SystemControl from './components/SystemControl'; 
import { Agent, SystemMetrics, Project, SystemMode, AutonomousConfig, WorkflowStage } from './types';
import { MOCK_PROJECTS, SYSTEM_LOGS, DEFAULT_AUTONOMY_CONFIG } from './constants';
import { orchestrator } from './services/orchestrator';
import { continuum } from './services/continuumMemory';
import { workflowEngine } from './services/workflowEngine';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [autonomyConfig, setAutonomyConfig] = useState<AutonomousConfig>(DEFAULT_AUTONOMY_CONFIG);
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalRamUsage: 0,
    vramUsage: 1.2, 
    activeAgents: 0,
    introspectionDepth: 32,
    awarenessScore: 85.0,
    fps: 60,
    currentMode: SystemMode.ECO,
    tokenUsageToday: 0,
    currentStage: WorkflowStage.IDLE
  });
  
  const [logs, setLogs] = useState<string[]>(SYSTEM_LOGS);

  const handleModeChange = (mode: SystemMode) => {
    setMetrics(prev => ({ ...prev, currentMode: mode }));
  };

  // Real Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Tick Workflow Engine (Intent -> Plan -> Execute)
      workflowEngine.tick();

      // 2. Tick Swarm Logic (Wake up/Sleep agents based on Workflow)
      orchestrator.tick();
      const currentAgents = orchestrator.getAgents();
      
      // 3. Metrics Calculation
      const activeCount = orchestrator.getActiveCount();
      const ramTotal = orchestrator.getTotalRam() / 1024; 
      
      const visualAgents = currentAgents.filter(a => a.category === 'MARKETING' && a.enabled).length;
      const standardAgents = activeCount - visualAgents;
      const visualLoad = (visualAgents * 0.15) + (standardAgents * 0.015); 
      const baseVram = 1.2; 
      const totalVram = Math.min(4.0, baseVram + visualLoad);

      setAgents([...currentAgents]); 
      
      setMetrics(prev => ({
        ...prev,
        activeAgents: activeCount,
        totalRamUsage: 4.5 + ramTotal,
        vramUsage: totalVram,
        awarenessScore: Math.min(99.9, 85 + (continuum.getStats().archivedNodes * 0.1)),
        fps: Math.max(30, 144 - (activeCount * 0.5)),
        tokenUsageToday: workflowEngine.getTokenUsage(),
        currentStage: workflowEngine.getStage()
      }));

    }, 1000); 

    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard metrics={metrics} projects={MOCK_PROJECTS} />;
      case 'system_control':
        return (
          <SystemControl 
            metrics={metrics} 
            setMode={handleModeChange} 
            autonomyConfig={autonomyConfig}
            setAutonomyConfig={setAutonomyConfig}
          />
        );
      case 'orchestrator':
        return <AgentOrchestrator agents={agents} currentStage={metrics.currentStage} />;
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