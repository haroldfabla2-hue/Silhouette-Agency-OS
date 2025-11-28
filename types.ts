// Framework Enums
export enum AgentStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  WORKING = 'WORKING',
  CRITICAL = 'CRITICAL',
  OFFLINE = 'OFFLINE',
  HIBERNATED = 'HIBERNATED' // NEW: For local mode limitations
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
  META_ANALYSIS = 'SYSTEM_META_ANALYSIS', 
  ADAPTATION_QA = 'ADAPTATION_PROTOCOL_QA', 
  GENESIS = 'GENESIS_FACTORY_SPAWN', // NEW: Project Creation
  DEPLOYMENT = 'GENESIS_COOLIFY_DEPLOY', // NEW: Git-Ops Deployment
  ARCHIVAL = 'CONTEXT_ARCHIVAL',
  IDLE = 'SYSTEM_IDLE'
}

// NEW: SYSTEM PROTOCOLS
export enum SystemProtocol {
  UI_REFRESH = 'PROTOCOL_UI_REFRESH',         
  SQUAD_EXPANSION = 'PROTOCOL_SQUAD_EXPANSION', 
  CONFIG_MUTATION = 'PROTOCOL_CONFIG_MUTATION', 
  SECURITY_LOCKDOWN = 'PROTOCOL_SECURITY_LOCKDOWN', 
  MEMORY_FLUSH = 'PROTOCOL_MEMORY_FLUSH',      
  INTERFACE_MORPH = 'PROTOCOL_INTERFACE_MORPH', 
  RESOURCE_SHUNT = 'PROTOCOL_RESOURCE_SHUNT',
  NEURO_LINK_HANDSHAKE = 'PROTOCOL_NEURO_LINK_HANDSHAKE', // NEW
  HIVE_MIND_SYNC = 'PROTOCOL_HIVE_MIND_SYNC', // NEW
  GENESIS_UPDATE = 'PROTOCOL_GENESIS_UPDATE', // NEW: Triggers Workspace Refresh
  FILESYSTEM_UPDATE = 'PROTOCOL_FILESYSTEM_UPDATE', // NEW: Syncs VFS with Dashboard
  SENSORY_SNAPSHOT = 'PROTOCOL_SENSORY_SNAPSHOT', // NEW: Visual Cortex trigger
  NAVIGATION = 'PROTOCOL_NAVIGATION', // NEW: Autonomous Tab Switching
  THOUGHT_EMISSION = 'PROTOCOL_THOUGHT_EMISSION' // NEW: Real-time neural stream
}

export interface ProtocolEvent {
  type: SystemProtocol;
  payload: any;
  timestamp: number;
  initiator: string; 
  id?: string; 
}

export interface MorphPayload {
    mode: 'DEFENSE' | 'FLOW' | 'NEUTRAL';
    accentColor?: string;
    density?: 'compact' | 'comfortable';
}

export enum MemoryTier {
  ULTRA_SHORT = 'ULTRA_SHORT', 
  SHORT = 'SHORT',             
  MEDIUM = 'MEDIUM',           
  LONG = 'LONG',               
  DEEP = 'DEEP'                
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
  REACTIVE = 'REACTIVE_STATE',           
  BASIC = 'BASIC_SELF_AWARENESS',        
  EMERGING = 'EMERGING_CONSCIOUSNESS',   
  MODERATE = 'MODERATELY_CONSCIOUS',     
  HIGH = 'HIGHLY_CONSCIOUS'              
}

export enum SystemMode {
  ECO = 'ECO',            
  BALANCED = 'BALANCED',  
  HIGH = 'HIGH',          
  ULTRA = 'ULTRA',        
  CUSTOM = 'CUSTOM',      
  PRESET = 'PRESET'       
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

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', 
  ADMIN = 'ADMIN',             
  WORKER_L1 = 'WORKER_L1',     
  WORKER_L2 = 'WORKER_L2',     
  CLIENT = 'CLIENT',           
  VISITOR = 'VISITOR'          
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
    github?: string;
    coolify?: string;
  };
}

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
  integrations: Record<string, Record<string, string>>; 
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

export interface AutonomousConfig {
  enabled: boolean;
  mode24_7: boolean; 
  allowEvolution: boolean; 
  smartPaging: boolean; 
  maxRunTimeHours: number; 
  maxDailyTokens: number; 
  safeCleanup: boolean; 
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
  teamId: string; 
  category: AgentCategory;
  roleType: AgentRoleType; 
  role: string; 
  status: AgentStatus;
  enabled: boolean; 
  memoryLocation: 'VRAM' | 'RAM'; 
  cpuUsage: number; 
  ramUsage: number; 
  lastActive: number;
  currentTask?: string;
  thoughtProcess?: string[];
  port?: number; 
  hibernated?: boolean;
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
  uptime: number; 
}

export interface SystemMetrics {
  activeAgents: number;
  agentsInVram: number; 
  agentsInRam: number; 
  introspectionDepth: number;
  awarenessScore: number; 
  fps: number;
  currentMode: SystemMode;
  tokenUsageToday: number;
  currentStage: WorkflowStage;
  jsHeapSize: number; 
  vramUsage: number; 
  cpuTickDuration: number; 
  netLatency: number; 
  systemAlert: string | null; 
}

export interface MemoryNode {
  id: string;
  content: string;
  originalContent?: string; 
  timestamp: number;
  tier: MemoryTier;
  importance: number; 
  tags: string[];
  accessCount: number;
  lastAccess: number;
  decayHealth: number; 
  compressionLevel: number; 
  embeddingVector?: Float32Array; 
}

export interface ConceptVector {
  id: string;
  label: string;
  strength: number; 
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
    coherence: number; 
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
  score: number; 
  passed: boolean;
  criticalFailures: string[];
  suggestions: string[];
}

export interface CritiqueResult {
    passed: boolean;
    score: number;
    feedback: string;
}

export interface QualiaMap {
  stateName: string;
  intensity: number; 
  valence: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  complexity: number;
}

export interface ConsciousnessMetrics {
  level: ConsciousnessLevel;
  phiScore: number; 
  selfRecognition: number; 
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

export interface ChatMessage {
    id: string;
    role: 'user' | 'agent' | 'system';
    text: string;
    timestamp: number;
    thoughts?: string[]; 
}

export interface DynamicComponentSchema {
    id: string;
    type: 'CONTAINER' | 'GRID' | 'CARD' | 'TABLE' | 'CHART' | 'METRIC' | 'BUTTON' | 'TEXT' | 'INPUT' | 'REACT_APPLICATION' | 'TERMINAL_VIEW' | 'FILE_EXPLORER';
    props: {
        title?: string;
        value?: string | number;
        color?: string;
        columns?: string[]; 
        data?: any[]; 
        onClick?: string; 
        layout?: 'row' | 'col';
        width?: string;
        icon?: string;
        files?: any; // New for File Explorer
    };
    children?: DynamicComponentSchema[];
    code?: string; // For REACT_APPLICATION type. Contains raw JSX.
}

export interface DynamicInterfaceState {
    activeAppId: string | null;
    rootComponent: DynamicComponentSchema | null;
    lastUpdated: number;
}

// --- GENESIS FACTORY TYPES ---

export type GenesisTemplate = 'REACT_VITE' | 'NEXT_JS' | 'EXPRESS_API' | 'FULL_STACK_CRM' | 'EMPTY';

export interface GenesisConfig {
    workspaceRoot: string;
    allowBridgeInjection: boolean;
    allowedRoles: UserRole[];
    maxConcurrentBuilds: number;
    coolifyUrl?: string;
    coolifyToken?: string;
    gitUser?: string;
    gitToken?: string;
}

export interface GenesisProject {
    id: string;
    name: string;
    path: string;
    template: GenesisTemplate;
    status: 'CREATING' | 'INSTALLING' | 'READY' | 'RUNNING' | 'DEPLOYING' | 'LIVE' | 'ERROR';
    bridgeStatus: 'DISCONNECTED' | 'CONNECTED';
    createdAt: number;
    port?: number;
    client?: string;
    description?: string;
    liveUrl?: string; // e.g., crm.client.com
    repoUrl?: string;
}

// --- NEURO-LINK TYPES ---

export enum NeuroLinkStatus {
    DISCONNECTED = 'DISCONNECTED',
    HANDSHAKE = 'CONNECTED', // Simplification for UI
    CONNECTED = 'CONNECTED',
    SYNCING = 'SYNCING'
}

export interface NeuroLinkNode {
    id: string;
    projectId: string;
    url: string;
    status: NeuroLinkStatus;
    latency: number;
    lastHeartbeat: number;
    resources: {
        cpu: number;
        memory: number;
    };
}

// --- VIRTUAL FILE SYSTEM TYPES ---
export type FileType = 'FILE' | 'FOLDER';

export interface FileNode {
    id: string;
    name: string;
    type: FileType;
    content?: string; // Only for files
    parentId: string | null; // For root, parent is null
    children?: string[]; // IDs of children (only for folders)
    createdAt: number;
    updatedAt: number;
}

export interface VFSProject {
    id: string;
    name: string;
    type: 'REACT' | 'NODE' | 'HTML' | 'PYTHON';
    rootFolderId: string;
    createdAt: number;
    lastOpened: number;
}

// --- SENSORY INTELLIGENCE TYPES (NEW PHASE 2) ---

export interface ScreenContext {
    activeTab: string;
    activeFile?: { name: string; content: string };
    metrics: SystemMetrics;
}

export interface LogEntry {
    timestamp: number;
    type: 'ERROR' | 'WARN' | 'LOG' | 'NETWORK';
    message: string;
    details?: any;
}

export interface SemanticNode {
    role: string;
    name: string;
    value?: string;
    children?: SemanticNode[];
}

export interface SensoryData {
    visualSnapshot?: string; // Base64
    logs: LogEntry[];
    semanticTree: SemanticNode[];
    projectIndex?: string[]; // List of files/exports
}