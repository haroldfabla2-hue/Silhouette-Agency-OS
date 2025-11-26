import { Agent, AgentStatus, SystemMode } from "../types";

// The "Swarm" Manager V2.0
// Manages 131 Virtual Agents with Dynamic Power Scaling.

const ROLES = [
  { prefix: 'CORE', role: 'System Orchestration', count: 5 },
  { prefix: 'DEV', role: 'Full Stack Generator', count: 25 },
  { prefix: 'MKT', role: 'Content Strategist', count: 20 },
  { prefix: 'DATA', role: 'Pattern Analyst', count: 15 },
  { prefix: 'SUP', role: 'User Success', count: 12 },
  { prefix: 'SPEC', role: 'Industry Specialist', count: 54 } 
];

class AgentSwarmOrchestrator {
  private swarm: Agent[] = [];
  private currentMode: SystemMode = SystemMode.ECO;
  private activeCategories: Set<string> = new Set(['CORE']);

  constructor() {
    this.initializeSwarm();
    this.applyMode(SystemMode.ECO); // Start safe
  }

  private initializeSwarm() {
    let idCounter = 1;
    this.swarm = [];
    ROLES.forEach(group => {
      for (let i = 0; i < group.count; i++) {
        this.swarm.push({
          id: `${group.prefix}-${String(idCounter).padStart(3, '0')}`,
          name: `${group.prefix}_Unit_${i+1}`,
          category: group.prefix as any,
          role: group.role,
          status: AgentStatus.OFFLINE, // Start offline
          enabled: false,
          cpuUsage: 0,
          ramUsage: 50 + Math.random() * 50, // Base RAM footprint per container
          lastActive: Date.now()
        });
        idCounter++;
      }
    });
  }

  public setMode(mode: SystemMode) {
    this.currentMode = mode;
    this.applyMode(mode);
  }

  public setCustomToggle(category: string, enabled: boolean) {
    this.currentMode = SystemMode.CUSTOM;
    if (enabled) {
      this.activeCategories.add(category);
    } else {
      this.activeCategories.delete(category);
    }
    this.refreshAgentStates();
  }

  public getActiveCategories(): string[] {
    return Array.from(this.activeCategories);
  }

  private applyMode(mode: SystemMode) {
    this.activeCategories.clear();
    
    // Always enable CORE
    this.activeCategories.add('CORE');

    switch (mode) {
      case SystemMode.ECO:
        // Core only
        break;
      case SystemMode.BALANCED:
        this.activeCategories.add('DEV');
        this.activeCategories.add('SUP');
        break;
      case SystemMode.HIGH:
        this.activeCategories.add('DEV');
        this.activeCategories.add('SUP');
        this.activeCategories.add('MKT');
        this.activeCategories.add('DATA');
        break;
      case SystemMode.ULTRA:
        ROLES.forEach(r => this.activeCategories.add(r.prefix));
        break;
      case SystemMode.CUSTOM:
        // Do not reset categories, keep what user selected
        break;
    }
    this.refreshAgentStates();
  }

  private refreshAgentStates() {
    this.swarm.forEach(agent => {
      const shouldBeEnabled = this.activeCategories.has(agent.category);
      
      if (shouldBeEnabled && !agent.enabled) {
        // Boot up
        agent.enabled = true;
        agent.status = AgentStatus.IDLE;
        agent.ramUsage = 100 + Math.random() * 50; // Boot overhead
      } else if (!shouldBeEnabled && agent.enabled) {
        // Shut down
        agent.enabled = false;
        agent.status = AgentStatus.OFFLINE;
        agent.ramUsage = 0; // Memory freed
        agent.cpuUsage = 0;
      }
    });
  }

  public getAgents(): Agent[] {
    return this.swarm;
  }

  // The "Tick" function - called by the main loop
  public tick() {
    // Only update enabled agents
    this.swarm.filter(a => a.enabled).forEach(agent => {
      // Decay activity
      if (agent.status === AgentStatus.WORKING && Math.random() > 0.95) {
        agent.status = AgentStatus.IDLE;
        agent.cpuUsage = 2 + Math.random() * 5;
      }

      // Random activation
      if (agent.status === AgentStatus.IDLE && Math.random() > 0.98) {
        agent.status = AgentStatus.THINKING;
        agent.cpuUsage = 30 + Math.random() * 20;
      }
      
      if (agent.status === AgentStatus.THINKING && Math.random() > 0.9) {
        agent.status = AgentStatus.WORKING;
        agent.cpuUsage = 60 + Math.random() * 30;
      }
    });
  }

  public getActiveCount(): number {
    return this.swarm.filter(a => a.enabled).length;
  }

  public getTotalRam(): number {
    // Returns total MB
    return this.swarm.reduce((acc, curr) => acc + curr.ramUsage, 0);
  }
}

export const orchestrator = new AgentSwarmOrchestrator();