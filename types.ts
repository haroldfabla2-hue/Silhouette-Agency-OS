
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
  META_ANALYSIS = 'SYSTEM_META_ANALYSIS', // New: Self-Reflection
  ADAPTATION_QA = 'ADAPTATION_PROTOCOL_QA', // New: Safety check for changes
  ARCHIVAL = 'CONTEXT_ARCHIVAL',
  IDLE = 'SYSTEM_IDLE'
}

// NEW: SYSTEM PROTOCOLS
export enum SystemProtocol {
  UI_REFRESH = 'PROTOCOL_UI_REFRESH',         // Force re-render of components
  SQUAD_EXPANSION = 'PROTOCOL_SQUAD_EXPANSION', // Inject new agents at runtime
  CONFIG_MUTATION = 'PROTOCOL_CONFIG_MUTATION', // Change settings dynamically
  SECURITY_LOCKDOWN = 'PROTOCOL_SECURITY_LOCKDOWN', // Emergency State
  MEMORY_FLUSH = 'PROTOCOL_MEMORY_FLUSH',      // Transcendence trigger
  INTERFACE_MORPH = 'PROTOCOL_INTERFACE_MORPH', // AI changes UI theme/density
  RESOURCE_SHUNT = 'PROTOCOL_RESOURCE_SHUNT'    // Visualizing VRAM->RAM moves
}

export interface ProtocolEvent {
  type: SystemProtocol;
  payload: any;
  timestamp: number;
  initiator: string; // Agent ID
  id?: string; // Unique event ID for stacking
}

export interface MorphPayload {
    mode: 'DEFENSE' | 'FLOW' | 'NEUTRAL';
    accentColor?: string;
    density?: 'compact' | 'comfortable';
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
  | 'EDU'
  | 'INSTALL'
  | 'INTEGRATION'; 

// --- INSTALLATION & RBAC TYPES ---

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // Can see everything + System Control
  ADMIN = 'ADMIN',             // Can see Dashboard + Orchestrator
  WORKER_L1 = 'WORKER_L1',     // Limited Task View
  WORKER_L2 = 'WORKER_L2',     // Full Task View
  CLIENT = 'CLIENT',           // Only Project Status + Limited Chat
  VISITOR = 'VISITOR'          // No Access
}

export interface SystemMap {
  frontendComponents: string[];
  backendEndpoints: string[];
  databaseSchema: string[];
  rolePolicy: Record<UserRole, string[]>;
  scanTimestamp: number;
}

export type InstallationStep = 'KEYS' | 'SCANNING' | 'MAPPING' | 'HANDOVER' | 'COMPLETE';

export interface InstallationState {
  isInstalled: boolean;
  currentStep: InstallationStep;
  progress: number;
  logs: string[];
  systemMap: SystemMap | null;
  apiKeys: {
    gemini?: string;
    openai?: string;
    anthropic?: string;
  };
}

// --- SETTINGS & CONFIGURATION TYPES ---

export interface IntegrationSchema {
  id: string;
  name: string;
  description: string;
  category: 'AI' | 'DATABASE' | 'MESSAGING' | 'CLOUD' | 'DEV' | 'OTHER';
  fields: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'url';
    required: boolean;
    placeholder?: string;
  }[];
  isConnected: boolean;
  lastSync?: number;
}

export interface ThemeConfig {
  mode: 'dark' | 'light' | 'cyberpunk' | 'corporate';
  accentColor: string;
  reduceMotion: boolean;
  density: 'compact' | 'comfortable';
}

export interface PermissionMatrix {
  [role: string]: {
    canViewDashboard: boolean;
    canControlSwarm: boolean;
    canAccessMemory: boolean;
    canEditSettings: boolean;
    canExecuteTasks: boolean;
  }
}

export interface SettingsState {
  theme: ThemeConfig;
  integrations: Record<string, Record<string, string>>; // { serviceId: { key: value } }
  registeredIntegrations: IntegrationSchema[];
  permissions: PermissionMatrix;
  notifications: {
    email: boolean;
    slack: boolean;
    browser: boolean;
    securityAlerts: boolean;
  };
  language: 'en' | 'es' | 'fr' | 'jp';
}

// Data Structures
export interface AutonomousConfig {
  enabled: boolean;
  mode24_7: boolean; // Continuous loop
  allowEvolution: boolean; // Allow system to rewrite its own rules
  smartPaging: boolean; // NEW: Enable VRAM to RAM offloading
  maxRunTimeHours: number; // 0 = infinite
  maxDailyTokens: number; // Cost safety
  safeCleanup: boolean; // Protect "SACRED" files
}

export interface WorkflowMutation {
  target: 'INTROSPECTION_DEPTH' | 'SYSTEM_MODE' | 'QA_THRESHOLD';
  action: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
  reason: string;
  approved: boolean;
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
  memoryLocation: 'VRAM' | 'RAM'; // NEW: Physical location of the agent context
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
  agentsInVram: number; // NEW
  agentsInRam: number; // NEW
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

export interface ApiConfig {
    port: number;
    enabled: boolean;
    apiKey: string;
}

export interface IntegrationConfig {
    targetUrl: string;
    targetName: string;
    authType: 'BEARER' | 'OAUTH' | 'COOKIE';
}

export interface HostEnvironment {
    domStructure: string;
    routes: string[];
    cookies: string[];
    localStorageKeys: string[];
}
