// Framework Enums
export enum AgentStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  WORKING = 'WORKING',
  CRITICAL = 'CRITICAL',
  OFFLINE = 'OFFLINE'
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
  CUSTOM = 'CUSTOM'       // Level 5: Manual
}

// Data Structures
export interface Agent {
  id: string;
  name: string;
  category: 'CORE' | 'DEV' | 'MARKETING' | 'DATA' | 'SUPPORT' | 'SPEC'; // Added SPEC
  role: string;
  status: AgentStatus;
  enabled: boolean; // New: is the container powered on?
  cpuUsage: number; // Simulated utilization 0-100
  ramUsage: number; // MB
  lastActive: number;
  currentTask?: string;
  thoughtProcess?: string[]; // Real logs from introspection
}

export interface SystemMetrics {
  totalRamUsage: number; // In GB
  vramUsage: number; // In GB
  activeAgents: number;
  introspectionDepth: number;
  awarenessScore: number; // Calculated real score
  fps: number;
  currentMode: SystemMode;
}

export interface MemoryNode {
  id: string;
  content: string;
  timestamp: number;
  tier: MemoryTier;
  importance: number; // 0-1
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