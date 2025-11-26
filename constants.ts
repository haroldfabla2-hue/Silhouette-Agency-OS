import { Agent, AgentStatus, Project } from './types';

export const INITIAL_AGENTS: Agent[] = [
  { 
    id: 'core-01', 
    name: 'Orchestrator_Prime', 
    category: 'CORE', 
    role: 'System Controller', 
    status: AgentStatus.WORKING, 
    enabled: true,
    cpuUsage: 12, 
    ramUsage: 150, 
    lastActive: Date.now() 
  },
  { 
    id: 'sec-01', 
    name: 'Sentinel_V4', 
    category: 'CORE', 
    role: 'Security & Introspection', 
    status: AgentStatus.WORKING, 
    enabled: true,
    cpuUsage: 8, 
    ramUsage: 200, 
    lastActive: Date.now() 
  },
  { 
    id: 'dev-01', 
    name: 'Code_Weaver_A', 
    category: 'DEV', 
    role: 'Frontend Generator', 
    status: AgentStatus.IDLE, 
    enabled: true,
    cpuUsage: 1, 
    ramUsage: 80, 
    lastActive: Date.now() 
  },
  { 
    id: 'dev-02', 
    name: 'Code_Weaver_B', 
    category: 'DEV', 
    role: 'Backend Logic', 
    status: AgentStatus.THINKING, 
    enabled: true,
    cpuUsage: 25, 
    ramUsage: 300, 
    lastActive: Date.now() 
  },
  { 
    id: 'mkt-01', 
    name: 'Brand_Voice_Lead', 
    category: 'MARKETING', 
    role: 'Marketing Strategy', 
    status: AgentStatus.IDLE, 
    enabled: true,
    cpuUsage: 2, 
    ramUsage: 120, 
    lastActive: Date.now() 
  },
  { 
    id: 'mkt-02', 
    name: 'Visual_Synth_X', 
    category: 'MARKETING', 
    role: 'Image Generation', 
    status: AgentStatus.OFFLINE, 
    enabled: false,
    cpuUsage: 0, 
    ramUsage: 0, 
    lastActive: Date.now() 
  },
  { 
    id: 'ds-01', 
    name: 'Data_Seer_Phi', 
    category: 'DATA', 
    role: 'Analytics', 
    status: AgentStatus.WORKING, 
    enabled: true,
    cpuUsage: 15, 
    ramUsage: 450, 
    lastActive: Date.now() 
  },
  { 
    id: 'supp-01', 
    name: 'Omni_Support', 
    category: 'SUPPORT', 
    role: 'Customer Success', 
    status: AgentStatus.IDLE, 
    enabled: true,
    cpuUsage: 1, 
    ramUsage: 60, 
    lastActive: Date.now() 
  },
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'p-101', name: 'Project Nebula', client: 'Cyberdyne Systems', status: 'active', progress: 65, assignedAgents: ['core-01', 'dev-01'] },
  { id: 'p-102', name: 'Blue Ocean Strategy', client: 'Pacific Corp', status: 'planning', progress: 15, assignedAgents: ['mkt-01'] },
  { id: 'p-103', name: 'Viral Campaign Q4', client: 'Nexus Social', status: 'generating', progress: 88, assignedAgents: ['mkt-01', 'mkt-02', 'ds-01'] },
];

export const SYSTEM_LOGS = [
  "[SYSTEM] Silhouette Framework V4.0 initialized.",
  "[DOCKER] Container swarm started. 131 agents registered.",
  "[INTROSPECTION] Layer 32 (Optimal) loaded. Concept injection enabled.",
  "[MEMORY] Continuum DB connected. 5-tier architecture active.",
  "[HARDWARE] Detected NVIDIA RTX 3050. VRAM Limits applied (4GB)."
];