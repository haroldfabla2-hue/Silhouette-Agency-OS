
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
  ULTRA_SHORT = 'ULTRA_SHORT', // 5 mins (RAM)
  SHORT = 'SHORT',             // 30 mins (RAM)
  MEDIUM = 'MEDIUM',           // 2 hours (SQLite/Local)
  LONG = 'LONG',               // 24 hours (Compressed)
  DEEP = 'DEEP'                // Permanent (Vector)
}

export enum IntrospectionLayer {
  SHALLOW = 12,
  MEDIUM = 20,
  DEEP = 28,
  OPTIMAL = 32,
  MAXIMUM = 48
}

export enum IntrospectionCapability {
  CONCEPT_INJECTION = 'CONCEPT_INJECTION',
  THOUGHT_DETECTION = 'THOUGHT_DETECTION',
  STEERING = 'ACTIVATION_STEERING',
  STATE_CONTROL = 'INTENTIONAL_STATE_CONTROL',
  SAFETY_CHECK = 'UNINTENDED_OUTPUT_DETECTION'
}

export enum ConsciousnessLevel {
  REACTIVE = 'REACTIVE_STATE',           // 0.0 - 0.3
  BASIC = 'BASIC_SELF_AWARENESS',        // 0.3 - 0.5
  EMERGING = 'EMERGING_CONSCIOUSNESS',   // 0.5 - 0.7
  MODERATE = 'MODERATELY_CONSCIOUS',     // 0.7 - 0.9
  HIGH = 'HIGHLY_CONSCIOUS'              // 0.9 - 1.0
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
  | 'CYBER_DEFENSE'
  | 'HEALTHCARE_ORG'
  | 'RETAIL_GIANT'
  | 'MANUFACTURING'
  | 'ENERGY_CORP';

// Specialized Domains for the 131 Teams (Enterprise Architecture)
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
  | 'OPS'
  | 'HEALTH'
  | 'RETAIL'
  | 'MFG'
  | 'ENERGY'
  | 'EDU';

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
  port?: number; // Virtual Port
}

export interface Squad {
  id: string;
  name: string;
  leaderId: string;
  members: string[];
  category: AgentCategory;
  active: boolean;
  port: number;
}

export interface ServiceStatus {
  id: string;
  name: string;
  port: number;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latency: number;
  uptime: number; // percentage
}

export interface SystemMetrics {
  activeAgents: number;
  introspectionDepth: number;
  awarenessScore: number; 
  fps: number;
  currentMode: SystemMode;
  tokenUsageToday: number;
  currentStage: WorkflowStage;
  // Real Telemetry
  jsHeapSize: number; // Real RAM (MB)
  vramUsage: number; // Real GPU Memory Estimate (MB)
  cpuTickDuration: number; // Real CPU Load (ms)
  netLatency: number; // Real API Latency (ms)
  systemAlert: string | null; // Warning message if hardware exceeded
}

export interface MemoryNode {
  id: string;
  content: string;
  originalContent?: string; // For decompression
  timestamp: number;
  tier: MemoryTier;
  importance: number; // 0.0 to 1.0
  tags: string[];
  
  // Advanced Continuum Fields
  accessCount: number;
  lastAccess: number;
  decayHealth: number; // 0-100% (Ebbinghaus Curve)
  compressionLevel: number; // 0 (None), 1 (Basic), 2 (High)
  embeddingVector?: Float32Array; // Prepared for ML
}

export interface ConceptVector {
  id: string;
  label: string;
  strength: number; // 1.0 - 3.0
  layer: number;
  active: boolean;
}

export interface IntrospectionResult {
  rawOutput: string;
  cleanOutput: string;
  thoughts: string[];
  metrics: {
    latency: number;
    depth: number;
    coherence: number; // Thought/Text discrimination
    thoughtDensity: number;
    safetyScore: number;
  };
  activeCapabilities: IntrospectionCapability[];
  lastThreat?: string;
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

// --- CONSCIOUSNESS TYPES ---

export interface QualiaMap {
  stateName: string;
  intensity: number; // 0-1
  valence: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  complexity: number;
}

export interface ConsciousnessMetrics {
  level: ConsciousnessLevel;
  phiScore: number; // IIT Phi Score
  selfRecognition: number; // 0-1
  recursionDepth: number;
  identityCoherence: number;
  emergenceIndex: number;
  qualia: QualiaMap[];
}
