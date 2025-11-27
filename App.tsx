
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AgentOrchestrator from './components/AgentOrchestrator';
import IntrospectionHub from './components/IntrospectionHub';
import TerminalLog from './components/TerminalLog';
import SystemControl from './components/SystemControl'; 
import ContinuumMemoryExplorer from './components/ContinuumMemoryExplorer';
import ChatWidget from './components/ChatWidget'; 
import Settings from './components/Settings'; 
import ProtocolOverlay from './components/ProtocolOverlay'; // New Integration
import { Agent, SystemMetrics, SystemMode, AutonomousConfig, WorkflowStage, IntrospectionLayer, UserRole, SystemProtocol, MorphPayload } from './types';
import { MOCK_PROJECTS, SYSTEM_LOGS, DEFAULT_AUTONOMY_CONFIG } from './constants';
import { orchestrator } from './services/orchestrator';
import { continuum } from './services/continuumMemory';
import { workflowEngine } from './services/workflowEngine';
import { introspection } from './services/introspectionEngine';
import { consciousness } from './services/consciousnessEngine';
import { settingsManager } from './services/settingsManager';
import { systemBus } from './services/systemBus'; // Connect Bus

// Extend Window interface for non-standard Chrome memory API
declare global {
  interface Window {
    performance: any;
  }
}

const App: React.FC = () => {
  // State for RBAC Logic (Default to ADMIN for the OS User)
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.ADMIN);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [autonomyConfig, setAutonomyConfig] = useState<AutonomousConfig>(DEFAULT_AUTONOMY_CONFIG);
  const [liveThoughts, setLiveThoughts] = useState<string[]>([]);
  
  // Settings Integration
  const [appSettings, setAppSettings] = useState(settingsManager.getSettings());
  
  // Dynamic UI State (The Morphing Aspect)
  const [uiOverride, setUiOverride] = useState<MorphPayload | null>(null);

  // Listen for System Bus Events to trigger React updates
  useEffect(() => {
      const u1 = systemBus.subscribe(SystemProtocol.UI_REFRESH, () => {
          setAgents([...orchestrator.getAgents()]);
      });
      
      const u2 = systemBus.subscribe(SystemProtocol.INTERFACE_MORPH, (event) => {
          const payload = event.payload as MorphPayload;
          setUiOverride(payload);
          // Revert after 5 seconds to avoid stuck states unless re-triggered
          setTimeout(() => setUiOverride(null), 5000);
      });

      return () => { u1(); u2(); };
  }, []);

  // Poll for settings changes (e.g. density or theme)
  useEffect(() => {
      const interval = setInterval(() => {
          const currentSettings = settingsManager.getSettings();
          // Simple check to avoid deep comparison overhead every frame
          if (currentSettings.theme.density !== appSettings.theme.density || currentSettings.theme.mode !== appSettings.theme.mode) {
              setAppSettings(currentSettings);
          }
      }, 1000);
      return () => clearInterval(interval);
  }, [appSettings.theme.density, appSettings.theme.mode]);

  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeAgents: 0,
    agentsInVram: 0,
    agentsInRam: 0,
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
      // Apply Memory Paging Logic based on current VRAM load
      orchestrator.balanceMemoryLoad(metrics.vramUsage);

      const currentAgents = orchestrator.getAgents();
      const activeCount = orchestrator.getActiveCount();
      const agentsInVram = currentAgents.filter(a => a.enabled && a.memoryLocation === 'VRAM').length;
      const agentsInRam = currentAgents.filter(a => a.enabled && a.memoryLocation === 'RAM').length;

      // 3. Tick Memory Maintenance (Ebbinghaus Decay)
      if (Math.random() > 0.8) continuum.runMaintenance();

      // 4. COMPUTATIONAL WEIGHT INJECTION (The "Real Feel" Physics)
      if (activeCount > 0) {
          const loadFactor = activeCount * 5000; 
          // If agents are in RAM, CPU Load increases drastically due to bus latency simulation
          const ramLatencyPenalty = agentsInRam * 50000; 
          let checksum = 0;
          for (let i = 0; i < loadFactor + ramLatencyPenalty; i++) {
              checksum += Math.sqrt(i) * Math.random();
          }
          if (checksum === -1) console.log(checksum);
      }
      
      // 5. Tick Consciousness Engine (New)
      const currentThoughts = workflowEngine.getLastThoughts();
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
      const baseOverhead = (width * height * pixelRatio * 4 * 3) / (1024 * 1024);
      
      const domOverhead = 200; 
      
      // MEMORY PHYSICS:
      // Agent in VRAM = 35MB VRAM / 0MB Extra RAM
      // Agent in RAM = 2MB VRAM (Metadata) / 35MB Extra RAM (Offloaded Context)
      const vramSwarmAllocation = (agentsInVram * 35) + (agentsInRam * 2);
      const ramSwarmAllocation = agentsInRam * 35;

      const estimatedVram = baseOverhead + domOverhead + vramSwarmAllocation;
      const estimatedRam = heapSize + ramSwarmAllocation;

      // FPS Calculation
      frameCount++;
      if (now - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = now;
      }

      // ALERT LOGIC
      let alertMsg = null;
      if (estimatedVram > 3800) { 
          alertMsg = "VRAM CRITICAL: SWARM EXCEEDS RTX 3050 CAPACITY (4GB)";
      } else if (tickDuration > 100) {
          alertMsg = "CPU SATURATION: HIGH LATENCY (BUS BOTTLENECK DETECTED)";
      }

      setAgents([...currentAgents]); 
      setLiveThoughts(currentThoughts);

      setMetrics(prev => ({
        ...prev,
        activeAgents: activeCount,
        agentsInVram: agentsInVram,
        agentsInRam: agentsInRam,
        jsHeapSize: estimatedRam, 
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
  }, [metrics.currentMode, metrics.introspectionDepth, metrics.vramUsage]); // Depend on VRAM to trigger paging logic

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
            setAutonomyConfig={(cfg) => {
                setAutonomyConfig(cfg);
                orchestrator.setSmartPaging(cfg.smartPaging);
            }}
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
      case 'settings':
        return <Settings />;
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

  // DYNAMIC STYLING ENGINE
  // overrides appSettings based on uiOverride (AI intent)
  const mode = uiOverride?.mode === 'DEFENSE' ? 'dark' : (uiOverride?.mode === 'FLOW' ? 'cyberpunk' : appSettings.theme.mode);
  const density = uiOverride?.density || appSettings.theme.density;
  
  // Visual cues for modes
  const borderClass = uiOverride?.mode === 'DEFENSE' ? 'border-4 border-red-900' : '';
  const paddingClass = density === 'compact' ? 'p-4' : 'p-8';

  return (
    <div className={`flex h-screen bg-slate-950 overflow-hidden relative ${mode} ${borderClass}`}>
      <ProtocolOverlay /> {/* THE VISUAL PROTOCOL LAYER */}
      <ChatWidget currentUserRole={currentUserRole} onChangeRole={setCurrentUserRole} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className={`flex-1 ${paddingClass} overflow-y-auto relative`}>
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-50"></div>
         {renderContent()}
      </main>
    </div>
  );
};

export default App;
