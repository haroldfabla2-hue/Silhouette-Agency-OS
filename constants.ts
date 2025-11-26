import { Agent, AgentStatus, AgentRoleType, Project, AutonomousConfig } from './types';

// The "Hero" Agents are explicitly defined.
// The Orchestrator will generate the remaining "Worker" drones to reach 131 total.

export const INITIAL_AGENTS: Agent[] = [
  // --- 1. INTENT & ORCHESTRATION SQUAD ---
  { 
    id: 'core-01', 
    name: 'Orchestrator_Prime', 
    teamId: 'TEAM_CORE',
    category: 'CORE', 
    roleType: AgentRoleType.LEADER,
    role: 'System Controller', 
    status: AgentStatus.WORKING, 
    enabled: true,
    cpuUsage: 12, ramUsage: 150, lastActive: Date.now() 
  },
  { 
    id: 'core-02', 
    name: 'Intent_Analyzer_Alpha', 
    teamId: 'TEAM_CORE',
    category: 'CORE', 
    roleType: AgentRoleType.WORKER,
    role: 'Prompt Engineer Lead', 
    status: AgentStatus.WORKING, 
    enabled: true,
    cpuUsage: 15, ramUsage: 120, lastActive: Date.now() 
  },

  // --- 2. STRATEGY & PLANNING SQUAD ---
  { 
    id: 'strat-01', 
    name: 'Strategos_X', 
    teamId: 'TEAM_STRATEGY',
    category: 'OPS', 
    roleType: AgentRoleType.LEADER,
    role: 'Strategic Planner', 
    status: AgentStatus.IDLE, 
    enabled: true,
    cpuUsage: 5, ramUsage: 200, lastActive: Date.now() 
  },

  // --- 3. CONTEXT & MEMORY SQUAD ---
  { 
    id: 'ctx-01', 
    name: 'The_Librarian', 
    teamId: 'TEAM_CONTEXT',
    category: 'DATA', 
    roleType: AgentRoleType.LEADER,
    role: 'Context Keeper', 
    status: AgentStatus.WORKING, 
    enabled: true,
    cpuUsage: 8, ramUsage: 350, lastActive: Date.now() 
  },
  { 
    id: 'ctx-02', 
    name: 'Archivist_Bot', 
    teamId: 'TEAM_CONTEXT',
    category: 'DATA', 
    roleType: AgentRoleType.WORKER,
    role: 'Garbage Collector (Safe)', 
    status: AgentStatus.IDLE, 
    enabled: true,
    cpuUsage: 2, ramUsage: 100, lastActive: Date.now() 
  },

  // --- 4. OPTIMIZATION SQUAD ---
  { 
    id: 'opt-01', 
    name: 'Improver_V9', 
    teamId: 'TEAM_OPTIMIZE',
    category: 'DEV', 
    roleType: AgentRoleType.LEADER,
    role: 'Workflow Optimizer', 
    status: AgentStatus.IDLE, 
    enabled: true,
    cpuUsage: 0, ramUsage: 150, lastActive: Date.now() 
  },
  { 
    id: 'mon-01', 
    name: 'Watchtower_Eyes', 
    teamId: 'TEAM_OPTIMIZE',
    category: 'SUPPORT', 
    roleType: AgentRoleType.WORKER,
    role: 'Performance Monitor', 
    status: AgentStatus.WORKING, 
    enabled: true,
    cpuUsage: 5, ramUsage: 80, lastActive: Date.now() 
  },

  // --- 5. EXECUTION SQUADS (Leaders only, workers generated) ---
  { 
    id: 'dev-lead', name: 'Code_Architect', teamId: 'TEAM_DEV', category: 'DEV', roleType: AgentRoleType.LEADER, role: 'Lead Developer', status: AgentStatus.IDLE, enabled: true, cpuUsage: 0, ramUsage: 0, lastActive: Date.now() 
  },
  { 
    id: 'mkt-lead', name: 'Creative_Director', teamId: 'TEAM_MKT', category: 'MARKETING', roleType: AgentRoleType.LEADER, role: 'Brand Director', status: AgentStatus.IDLE, enabled: true, cpuUsage: 0, ramUsage: 0, lastActive: Date.now() 
  }
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'p-101', name: 'Project Nebula', client: 'Cyberdyne Systems', status: 'active', progress: 65, assignedAgents: ['core-01', 'dev-lead'] },
  { id: 'p-102', name: 'Blue Ocean Strategy', client: 'Pacific Corp', status: 'planning', progress: 15, assignedAgents: ['strat-01'] },
  { id: 'p-103', name: 'Viral Campaign Q4', client: 'Nexus Social', status: 'generating', progress: 88, assignedAgents: ['mkt-lead', 'ctx-01'] },
];

export const DEFAULT_AUTONOMY_CONFIG: AutonomousConfig = {
  enabled: false,
  mode24_7: false,
  maxRunTimeHours: 8,
  maxDailyTokens: 1000000, // 1 Million Token Limit Default
  safeCleanup: true
};

export const SYSTEM_LOGS = [
  "[SYSTEM] Silhouette Framework V4.0 initialized.",
  "[DOCKER] Container swarm started. 131 agents registered.",
  "[WORKFLOW] Pipeline: INTENT -> PLAN -> EXECUTE -> OPTIMIZE -> ARCHIVE",
  "[CONTEXT] Context Keeper active. 'Sacred' file protection enabled.",
  "[HARDWARE] Detected NVIDIA RTX 3050. VRAM Limits applied (4GB)."
];