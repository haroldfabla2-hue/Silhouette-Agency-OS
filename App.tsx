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
import ProtocolOverlay from './components/ProtocolOverlay';
import DynamicWorkspace from './components/DynamicWorkspace'; // New
import { Agent, SystemMetrics, SystemMode, AutonomousConfig, WorkflowStage, IntrospectionLayer, UserRole, SystemProtocol, MorphPayload, Project } from './types';
import { SYSTEM_LOGS, DEFAULT_AUTONOMY_CONFIG } from './constants';
import { orchestrator } from './services/orchestrator';
import { continuum } from './services/continuumMemory';
import { workflowEngine } from './services/workflowEngine';
import { introspection } from './services/introspectionEngine';
import { consciousness } from './services/consciousnessEngine';
import { settingsManager } from './services/settingsManager';
import { systemBus } from './services/systemBus';
import { vfs } from './services/virtualFileSystem';

// Extend Window interface for non-standard Chrome memory API
declare global {
  interface Window {
    performance: any;
  }
}

const App: React.FC = () => {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.ADMIN);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [autonomyConfig, setAutonomyConfig] = useState<AutonomousConfig>(DEFAULT_AUTONOMY_CONFIG);
  const [liveThoughts, setLiveThoughts] = useState<string[]>([]);
  
  const [appSettings, setAppSettings] = useState(settingsManager.getSettings());
  const [uiOverride, setUiOverride] = useState<MorphPayload | null>(null);

  // REAL VFS PROJECTS STATE
  const [dashboardProjects, setDashboardProjects] = useState<Project[]>([]);
  
  // STATE FOR AUTO-OPENING PROJECTS IN WORKSPACE
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);

  // Restore active tab from local storage (Phoenix Protocol)
  useEffect(() => {
      const savedTab = localStorage.getItem('silhouette_active_tab');
      if (savedTab) setActiveTab(savedTab);
      
      // Initial Sync of VFS Projects
      syncProjects();
  }, []);

  useEffect(() => {
      localStorage.setItem('silhouette_active_tab', activeTab);
  }, [activeTab]);

  const syncProjects = () => {
      const vfsProjs = vfs.getProjects();
      const now = Date.now();
      
      const mapped: Project[] = vfsProjs.map(p => {
          const age = now - p.createdAt;
          // Simulate "Generating" status if created very recently (< 10 seconds)
          let status: Project['status'] = 'active';
          let progress = 100;

          if (age < 10000) {
             status = 'generating';
             progress = Math.min(100, Math.floor((age / 10000) * 100));
          } else if (age < 60000) {
             // Simulate finishing touches
             progress = 100;
          }

          return {
              id: p.id,
              name: p.name,
              client: p.type === 'REACT' ? 'Frontend Stack' : p.type === 'NODE' ? 'Backend Service' : 'Internal',
              status: status,
              progress: progress,
              assignedAgents: p.type === 'REACT' ? ['dev-lead', 'core-01'] : ['core-01']
          };
      });
      setDashboardProjects(mapped);
  };

  useEffect(() => {
      const u1 = systemBus.subscribe(SystemProtocol.UI_REFRESH, () => {
          setAgents([...orchestrator.getAgents()]);
      });
      const u2 = systemBus.subscribe(SystemProtocol.INTERFACE_MORPH, (event) => {
          const payload = event.payload as MorphPayload;
          setUiOverride(payload);
          setTimeout(() => setUiOverride(null), 5000);
      });
      const u3 = systemBus.subscribe(SystemProtocol.FILESYSTEM_UPDATE, () => {
          syncProjects();
      });

      return () => { u1(); u2(); u3(); };
  }, []);

  useEffect(() => {
      const interval = setInterval(() => {
          const currentSettings = settingsManager.getSettings();
          if (currentSettings.theme.density !== appSettings.theme.density || currentSettings.theme.mode !== appSettings.theme.mode) {
              setAppSettings(currentSettings);
          }
          // Refresh projects periodically to update "progress" of new projects
          syncProjects();
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
    jsHeapSize: 0,
    vramUsage: 0,
    cpuTickDuration: 0,
    netLatency: 0,
    systemAlert: null
  });
  
  const [logs, setLogs] = useState<string[]>(SYSTEM_LOGS);

  const handleModeChange = (mode: SystemMode) => {
    orchestrator.setMode(mode);
    setMetrics(prev => ({ ...prev, currentMode: mode }));
  };
  
  const handleIntrospectionChange = (layer: IntrospectionLayer) => {
      introspection.setLayer(layer);
      setMetrics(prev => ({ ...prev, introspectionDepth: layer }));
  };

  // --- ACTIONS ---
  const handleCreateCampaign = () => {
      const defaultName = `Campaign ${new Date().toLocaleDateString().replace(/\//g, '-')}`;
      const name = prompt("SYSTEM PROTOCOL: INITIALIZE NEW CAMPAIGN\nEnter Project Identifier:", defaultName);
      if (name) {
          const p = vfs.createProject(name, 'REACT');
          // Feedback log
          systemBus.emit(SystemProtocol.SQUAD_EXPANSION, { name: 'Campaign_Ops', category: 'MARKETING', role: 'Campaign Lead' });
          
          // AUTO-NAVIGATION LOGIC
          setPendingProjectId(p.id);
          setActiveTab('dynamic_workspace');
      }
  };

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;

    const interval = setInterval(() => {
      const now = performance.now();
      const cpuStart = performance.now();

      workflowEngine.tick();
      orchestrator.tick();
      orchestrator.balanceMemoryLoad(metrics.vramUsage);

      const currentAgents = orchestrator.getAgents();
      const activeCount = orchestrator.getActiveCount();
      const agentsInVram = currentAgents.filter(a => a.enabled && a.memoryLocation === 'VRAM').length;
      const agentsInRam = currentAgents.filter(a => a.enabled && a.memoryLocation === 'RAM').length;

      if (Math.random() > 0.8) continuum.runMaintenance();

      if (activeCount > 0) {
          const loadFactor = activeCount * 5000; 
          const ramLatencyPenalty = agentsInRam * 50000; 
          let checksum = 0;
          for (let i = 0; i < loadFactor + ramLatencyPenalty; i++) {
              checksum += Math.sqrt(i) * Math.random();
          }
          if (checksum === -1) console.log(checksum);
      }
      
      // CRITICAL UPDATE: Fetch thoughts from CENTRAL HUB instead of just Workflow
      const currentThoughts = introspection.getRecentThoughts();
      
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

      const cpuEnd = performance.now();
      const tickDuration = cpuEnd - cpuStart;

      let heapSize = 0;
      if (window.performance && window.performance.memory) {
        heapSize = window.performance.memory.usedJSHeapSize / (1024 * 1024);
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      const baseOverhead = (width * height * pixelRatio * 4 * 3) / (1024 * 1024);
      const domOverhead = 200; 
      const vramSwarmAllocation = (agentsInVram * 35) + (agentsInRam * 2);
      const ramSwarmAllocation = agentsInRam * 35;

      const estimatedVram = baseOverhead + domOverhead + vramSwarmAllocation;
      const estimatedRam = heapSize + ramSwarmAllocation;

      frameCount++;
      if (now - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = now;
      }

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
  }, [metrics.currentMode, metrics.introspectionDepth, metrics.vramUsage]); 

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard metrics={metrics} projects={dashboardProjects} onCreateProject={handleCreateCampaign} />;
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
      case 'dynamic_workspace': // NEW
        return <DynamicWorkspace initialProjectId={pendingProjectId} />;
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

  const mode = uiOverride?.mode === 'DEFENSE' ? 'dark' : (uiOverride?.mode === 'FLOW' ? 'cyberpunk' : appSettings.theme.mode);
  const density = uiOverride?.density || appSettings.theme.density;
  
  const borderClass = uiOverride?.mode === 'DEFENSE' ? 'border-4 border-red-900' : '';
  const paddingClass = density === 'compact' ? 'p-4' : 'p-8';

  return (
    <div className={`flex h-screen bg-slate-950 overflow-hidden relative ${mode} ${borderClass}`}>
      <ProtocolOverlay />
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