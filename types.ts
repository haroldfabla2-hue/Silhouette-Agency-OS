
// Framework Enums
export enum AgentStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  WORKING = 'WORKING',
  CRITICAL = 'CRITICAL',
  OFFLINE = 'OFFLINE'
}

export enum AgentRoleType {
  LEADER = 'LEADER',
  WORKER = 'WORKER'
}

export enum WorkflowStage {
  INTENT = 'INTENT_ANALYSIS',
  PLANNING = 'STRATEGIC_PLANNING',
  EXECUTION = 'EXECUTION_SWARM',
  QA_AUDIT = 'QUALITY_ASSURANCE_AUDIT',
  REMEDIATION = 'ERROR_REMEDIATION',
  OPTIMIZATION = 'AUTO_OPTIMIZATION',
  ARCHIVAL = 'CONTEXT_ARCHIVAL',
  IDLE = 'SYSTEM_IDLE'
}

export enum MemoryTier {
  ULTRA_SHORT = 'ULTRA_SHORT', // RAM (Volatile)
  SHORT = 'SHORT', // Session
  MEDIUM = 'MEDIUM', // Persistent (Local Storage)
  LONG = 'LONG', // Archived
  DEEP = 'DEEP' // Vector/Semantic
}

export enum IntrospectionLayer {
  SHALLOW = 12,
  MEDIUM = 20,
  DEEP = 28,
  OPTIMAL = 32,
  MAXIMUM = 48
}

export enum SystemMode {
  ECO = 'ECO',            // Level 1: Core only
  BALANCED = 'BALANCED',  // Level 2: Core + Dev
  HIGH = 'HIGH',          // Level 3: Most teams
  ULTRA = 'ULTRA',        // Level 4: All 131 Agents
  CUSTOM = 'CUSTOM',      // Level 5: Manual
  PRESET = 'PRESET'       // Business Template
}

export type BusinessType = 
  | 'GENERAL' 
  | 'MARKETING_AGENCY' 
  | 'LAW_FIRM' 
  | 'FINTECH' 
  | 'DEV_SHOP' 
  | 'RESEARCH_LAB'
  | 'CYBER_DEFENSE';

// Specialized Domains for the 131 Teams
export type AgentCategory = 
  | 'CORE' 
  | 'DEV' 
  | 'MARKETING' 
  | 'DATA' 
  | 'SUPPORT' 
  | 'CYBERSEC' 
  | 'LEGAL' 
  | 'FINANCE' 
  | 'SCIENCE' 
  | 'OPS';

// Data Structures
export interface AutonomousConfig {
  enabled: boolean;
  mode24_7: boolean; // Continuous loop
  maxRunTimeHours: number; // 0 = infinite
  maxDailyTokens: number; // Cost safety
  safeCleanup: boolean; // Protect "SACRED" files
}

export interface Agent {
  id: string;
  name: string;
  teamId: string; // Grouping ID
  category: AgentCategory;
  roleType: AgentRoleType; // Leader or Worker
  role: string; // Specific job title
  status: AgentStatus;
  enabled: boolean; 
  cpuUsage: number; 
  ramUsage: number; 
  lastActive: number;
  currentTask?: string;
  thoughtProcess?: string[];
}

export interface Squad {
  id: string;
  name: string;
  leaderId: string;
  members: string[];
  category: AgentCategory;
  active: boolean;
}

export interface SystemMetrics {
  totalRamUsage: number; 
  vramUsage: number; 
  activeAgents: number;
  introspectionDepth: number;
  awarenessScore: number; 
  fps: number;
  currentMode: SystemMode;
  tokenUsageToday: number; // New metric
  currentStage: WorkflowStage; // New metric
}

export interface MemoryNode {
  id: string;
  content: string;
  timestamp: number;
  tier: MemoryTier;
  importance: number; 
  tags: string[];
}

export interface IntrospectionResult {
  rawOutput: string;
  cleanOutput: string;
  thoughts: string[];
  metrics: {
    latency: number;
    depth: number;
    coherence: number;
  };
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'planning' | 'active' | 'generating' | 'completed';
  progress: number;
  assignedAgents: string[];
}

export interface QualityReport {
  score: number; // 0-100
  passed: boolean;
  criticalFailures: string[];
  suggestions: string[];
}
