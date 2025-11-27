
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AgentOrchestrator from './components/AgentOrchestrator';
import IntrospectionHub from './components/IntrospectionHub';
import TerminalLog from './components/TerminalLog';
import SystemControl from './components/SystemControl'; 
import ContinuumMemoryExplorer from './components/ContinuumMemoryExplorer';
import { Agent, SystemMetrics, SystemMode, AutonomousConfig, WorkflowStage, IntrospectionLayer } from './types';
import { MOCK_PROJECTS, SYSTEM_LOGS, DEFAULT_AUTONOMY_CONFIG } from './constants';
import { orchestrator } from './services/orchestrator';
import { continuum } from './services/continuumMemory';
import { workflowEngine } from './services/workflowEngine';
import { introspection } from './services/introspectionEngine';
import { consciousness } from './services/consciousnessEngine'; // Import

// Extend Window interface for non-standard Chrome memory API
declare global {
  interface Window {
    performance: any;
  }
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [autonomyConfig, setAutonomyConfig] = useState<AutonomousConfig>(DEFAULT_AUTONOMY_CONFIG);
  const [liveThoughts, setLiveThoughts] = useState<string[]>([]);
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeAgents: 0,
    introspectionDepth: 32,
    awarenessScore: 85.0,
    fps: 60,
    currentMode: SystemMode.ECO,
    tokenUsageToday: 0,
    currentStage: WorkflowStage.IDLE,
    // Real Telemetry Defaults
    jsHeapSize: 0,
    vramUsage: 0,
    cpuTickDuration: 0,
    netLatency: 0,
    systemAlert: null
  });
  
  const [logs, setLogs] = useState<string[]>(SYSTEM_LOGS);

  const handleModeChange = (mode: SystemMode) => {
    // Immediate application of mode
    orchestrator.setMode(mode);
    setMetrics(prev => ({ ...prev, currentMode: mode }));
  };
  
  const handleIntrospectionChange = (layer: IntrospectionLayer) => {
      introspection.setLayer(layer);
      setMetrics(prev => ({ ...prev, introspectionDepth: layer }));
  };

  // Real Performance Loop
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;

    const interval = setInterval(() => {
      const now = performance.now();
      const cpuStart = performance.now();

      // --- CRITICAL PATH START (CPU LOAD) ---
      
      // 1. Tick Workflow Engine
      workflowEngine.tick();

      // 2. Tick Swarm Logic
      orchestrator.tick();
      const currentAgents = orchestrator.getAgents();
      const activeCount = orchestrator.getActiveCount();

      // 3. Tick Memory Maintenance (Ebbinghaus Decay)
      // Run less frequently to save CPU, but for demo we run it every tick or so
      if (Math.random() > 0.8) continuum.runMaintenance();

      // 4. COMPUTATIONAL WEIGHT INJECTION (The "Real Feel" Physics)
      if (activeCount > 0) {
          const loadFactor = activeCount * 5000; 
          let checksum = 0;
          for (let i = 0; i < loadFactor; i++) {
              checksum += Math.sqrt(i) * Math.random();
          }
          if (checksum === -1) console.log(checksum);
      }
      
      // 5. Tick Consciousness Engine (New)
      // Uses current thoughts and awareness to calculate Phi/Identity
      const currentThoughts = workflowEngine.getLastThoughts();
      // Calculate awareness for consciousness engine
      const memoryBonus = Math.min(10, continuum.getStats().archivedNodes * 0.5);
      let modeBonus = 0;
      if (metrics.currentMode === SystemMode.BALANCED) modeBonus = 5;
      if (metrics.currentMode === SystemMode.HIGH) modeBonus = 10;
      if (metrics.currentMode === SystemMode.ULTRA) modeBonus = 15;
      const depthBonus = (metrics.introspectionDepth - 12) * 0.5;
      const thoughtDensity = currentThoughts.join(' ').length;
      const densityBonus = Math.min(20, thoughtDensity / 50);
      const focusFluctuation = (Math.random() * 2) - 1;
      const calculatedAwareness = Math.min(100, 60 + memoryBonus + modeBonus + depthBonus + densityBonus + focusFluctuation);

      consciousness.tick(currentThoughts, calculatedAwareness);

      // --- CRITICAL PATH END ---

      const cpuEnd = performance.now();
      const tickDuration = cpuEnd - cpuStart; // Real CPU time spent in logic + weight

      // 6. Metrics Calculation
      let heapSize = 0;
      if (window.performance && window.performance.memory) {
        heapSize = window.performance.memory.usedJSHeapSize / (1024 * 1024);
      }

      // VRAM PHYSICS CALCULATION
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      // Base browser overhead (double buffering + compositing)
      const baseOverhead = (width * height * pixelRatio * 4 * 3) / (1024 * 1024);
      
      // Agent Context Overhead (Simulating CUDA contexts for each active container)
      // Increase this to 35MB per agent to simulate heavy LLM context loading
      const contextSizePerAgent = 35; 
      const swarmAllocation = activeCount * contextSizePerAgent;
      
      // React DOM Overhead (Nodes per card)
      const domOverhead = 200; 
      
      const estimatedVram = baseOverhead + domOverhead + swarmAllocation;

      // FPS Calculation
      frameCount++;
      if (now - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = now;
      }

      // ALERT LOGIC
      let alertMsg = null;
      if (estimatedVram > 3800) { // Near 4GB limit of RTX 3050
          alertMsg = "VRAM CRITICAL: SWARM EXCEEDS RTX 3050 CAPACITY (4GB)";
      } else if (tickDuration > 100) {
          alertMsg = "CPU SATURATION: LOGIC LOOP LAG DETECTED";
      }

      setAgents([...currentAgents]); 
      setLiveThoughts(currentThoughts);

      setMetrics(prev => ({
        ...prev,
        activeAgents: activeCount,
        jsHeapSize: heapSize + (activeCount * 0.5), 
        vramUsage: estimatedVram, 
        cpuTickDuration: tickDuration, 
        netLatency: 0, 
        awarenessScore: calculatedAwareness,
        fps: fps,
        tokenUsageToday: workflowEngine.getTokenUsage(),
        currentStage: workflowEngine.getStage(),
        systemAlert: alertMsg
      }));

    }, 800); 

    return () => clearInterval(interval);
  }, [metrics.currentMode, metrics.introspectionDepth]); 

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
        return <IntrospectionHub 
            realThoughts={liveThoughts} 
            currentDepth={metrics.introspectionDepth}
            onSetDepth={handleIntrospectionChange}
        />;
      case 'memory':
        return <ContinuumMemoryExplorer />;
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
