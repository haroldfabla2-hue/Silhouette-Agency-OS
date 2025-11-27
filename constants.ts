
import { Agent, AgentStatus, AgentRoleType, Project, AutonomousConfig } from './types';

// The "Hero" Agents are explicitly defined.
// The Orchestrator will generate the remaining "Worker" drones to reach 131 total.

export const INITIAL_AGENTS: Agent[] = [
  // --- 0. INSTALLATION SQUAD (Ephemeral) ---
  {
      id: 'install-01',
      name: 'Code_Scanner',
      teamId: 'TEAM_INSTALL',
      category: 'INSTALL',
      roleType: AgentRoleType.LEADER,
      role: 'System Architect',
      status: AgentStatus.OFFLINE,
      enabled: false,
      cpuUsage: 0, ramUsage: 0, lastActive: Date.now()
  },
  {
      id: 'install-02',
      name: 'DB_Cartographer',
      teamId: 'TEAM_INSTALL',
      category: 'INSTALL',
      roleType: AgentRoleType.WORKER,
      role: 'Schema Mapper',
      status: AgentStatus.OFFLINE,
      enabled: false,
      cpuUsage: 0, ramUsage: 0, lastActive: Date.now()
  },
  {
      id: 'install-03',
      name: 'Endpoint_Mapper',
      teamId: 'TEAM_INSTALL',
      category: 'INSTALL',
      roleType: AgentRoleType.WORKER,
      role: 'API Analyst',
      status: AgentStatus.OFFLINE,
      enabled: false,
      cpuUsage: 0, ramUsage: 0, lastActive: Date.now()
  },

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
  { 
    id: 'core-03', 
    name: 'Workflow_Architect', 
    teamId: 'TEAM_CORE',
    category: 'CORE', 
    roleType: AgentRoleType.WORKER,
    role: 'System Evolutionist', 
    status: AgentStatus.IDLE, 
    enabled: true,
    cpuUsage: 25, ramUsage: 200, lastActive: Date.now() 
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
    name: 'Context_Overseer', 
    teamId: 'TEAM_CONTEXT',
    category: 'DATA', 
    roleType: AgentRoleType.WORKER,
    role: 'Long-Term Supervisor', 
    status: AgentStatus.IDLE, 
    enabled: true,
    cpuUsage: 4, ramUsage: 180, lastActive: Date.now() 
  },

  // --- 4. OPTIMIZATION & QA SQUAD ---
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
    id: 'qa-03', 
    name: 'Rules_Lawyer', 
    teamId: 'TEAM_QA',
    category: 'LEGAL', 
    roleType: AgentRoleType.WORKER,
    role: 'Adaptation Auditor', 
    status: AgentStatus.IDLE, 
    enabled: true,
    cpuUsage: 5, ramUsage: 90, lastActive: Date.now() 
  },

  // --- 5. INTEGRATION SQUAD (The Architects) ---
  {
      id: 'int-01',
      name: 'System_Architect',
      teamId: 'TEAM_INTEGRATION',
      category: 'DEV',
      roleType: AgentRoleType.LEADER,
      role: 'Integration Lead',
      status: AgentStatus.IDLE,
      enabled: true,
      cpuUsage: 0, ramUsage: 0, lastActive: Date.now()
  },
  {
      id: 'int-02',
      name: 'Interface_Adapter',
      teamId: 'TEAM_INTEGRATION',
      category: 'DEV',
      roleType: AgentRoleType.WORKER,
      role: 'DOM Analyzer',
      status: AgentStatus.IDLE,
      enabled: true,
      cpuUsage: 0, ramUsage: 0, lastActive: Date.now()
  },

  // --- 6. EXECUTION SQUADS (Leaders only, workers generated) ---
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
  allowEvolution: false, // New capability
  maxRunTimeHours: 8,
  maxDailyTokens: 1000000, 
  safeCleanup: true
};

export const DEFAULT_API_CONFIG = {
    port: 3000,
    enabled: true,
    apiKey: 'sk-silhouette-default'
};

export const SYSTEM_LOGS = [
  "[SYSTEM] Silhouette Framework V4.0 initialized.",
  "[DOCKER] Container swarm started. 131 agents registered.",
  "[WORKFLOW] Pipeline: INTENT -> PLAN -> EXECUTE -> OPTIMIZE -> ARCHIVE -> ADAPT",
  "[CONTEXT] Context Overseer online. Infinite runtime supported.",
  "[HARDWARE] Detected NVIDIA RTX 3050. VRAM Limits applied (4GB)."
];
