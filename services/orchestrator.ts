import { Agent, AgentStatus, AgentRoleType, Squad, SystemMode, WorkflowStage } from "../types";
import { INITIAL_AGENTS } from "../constants";

// The "Swarm" Manager V3.0
// Manages Squads (Leaders + Workers) and responds to Workflow Events.

class AgentSwarmOrchestrator {
  private swarm: Agent[] = [];
  private squads: Squad[] = [];
  private currentMode: SystemMode = SystemMode.ECO;

  constructor() {
    this.initializeSwarm();
    this.applyMode(SystemMode.ECO); 
  }

  private initializeSwarm() {
    this.swarm = [...INITIAL_AGENTS]; // Load Heroes
    
    // Define Squad Structure
    const squadDefs = [
      { id: 'TEAM_CORE', name: 'Orchestration Command', leader: 'core-01', cat: 'CORE' },
      { id: 'TEAM_STRATEGY', name: 'Strategic Planning', leader: 'strat-01', cat: 'SPEC' },
      { id: 'TEAM_CONTEXT', name: 'Context & Memory', leader: 'ctx-01', cat: 'DATA' },
      { id: 'TEAM_OPTIMIZE', name: 'QA & Optimization', leader: 'opt-01', cat: 'DEV' },
      { id: 'TEAM_DEV', name: 'Engineering Swarm', leader: 'dev-lead', cat: 'DEV', workers: 25 },
      { id: 'TEAM_MKT', name: 'Creative Studio', leader: 'mkt-lead', cat: 'MARKETING', workers: 20 },
      { id: 'TEAM_SPEC', name: 'Specialist Hive', leader: 'strat-01', cat: 'SPEC', workers: 40 }, // Assigned to strategy leader
    ];

    // Generate Drones/Workers to reach 131 agents
    let idCounter = 100;
    
    squadDefs.forEach(def => {
      // Create Squad Object
      const members = this.swarm.filter(a => a.teamId === def.id).map(a => a.id);
      
      // Generate Workers if needed
      if (def.workers) {
        for (let i = 0; i < def.workers; i++) {
          const droneId = `${def.cat.toLowerCase()}-drone-${idCounter++}`;
          const drone: Agent = {
            id: droneId,
            name: `${def.cat}_Worker_${i+1}`,
            teamId: def.id,
            category: def.cat as any,
            roleType: AgentRoleType.WORKER,
            role: `${def.cat} Specialist`,
            status: AgentStatus.OFFLINE,
            enabled: false,
            cpuUsage: 0,
            ramUsage: 50 + Math.random() * 30,
            lastActive: Date.now()
          };
          this.swarm.push(drone);
          members.push(droneId);
        }
      }

      this.squads.push({
        id: def.id,
        name: def.name,
        leaderId: def.leader,
        members: members,
        category: def.cat,
        active: false
      });
    });
  }

  public activateSquadsForStage(stage: WorkflowStage) {
    // Map Stages to Teams
    const mapping: Record<WorkflowStage, string[]> = {
      [WorkflowStage.IDLE]: ['TEAM_CORE'],
      [WorkflowStage.INTENT]: ['TEAM_CORE'], // Prompt Eng is in Core squad
      [WorkflowStage.PLANNING]: ['TEAM_STRATEGY'],
      [WorkflowStage.EXECUTION]: ['TEAM_DEV', 'TEAM_MKT', 'TEAM_SPEC'],
      [WorkflowStage.OPTIMIZATION]: ['TEAM_OPTIMIZE'],
      [WorkflowStage.ARCHIVAL]: ['TEAM_CONTEXT']
    };

    const activeTeams = mapping[stage] || [];
    
    // In High/Ultra mode, we keep execution teams warm
    if (this.currentMode === SystemMode.ULTRA) return; 

    // Enable specific squads
    this.squads.forEach(squad => {
      // Core is always active
      if (squad.id === 'TEAM_CORE' || activeTeams.includes(squad.id)) {
        this.setSquadState(squad.id, true);
      } else {
        // If not in this stage, put to sleep to save VRAM (unless in Custom/High mode)
        if (this.currentMode === SystemMode.ECO) {
           this.setSquadState(squad.id, false);
        }
      }
    });
  }

  private setSquadState(squadId: string, enabled: boolean) {
    const squad = this.squads.find(s => s.id === squadId);
    if (squad) {
      squad.active = enabled;
      this.swarm.filter(a => a.teamId === squadId).forEach(agent => {
        agent.enabled = enabled;
        if (!enabled) {
            agent.status = AgentStatus.OFFLINE;
            agent.ramUsage = 0;
            agent.cpuUsage = 0;
        } else {
            agent.status = AgentStatus.IDLE;
            agent.ramUsage = 100; // Boot
        }
      });
    }
  }

  public setMode(mode: SystemMode) {
    this.currentMode = mode;
    this.applyMode(mode);
  }

  public setCustomToggle(squadId: string, enabled: boolean) {
    this.currentMode = SystemMode.CUSTOM;
    this.setSquadState(squadId, enabled);
  }

  public getActiveCategories(): string[] {
    return this.squads.filter(s => s.active).map(s => s.id);
  }

  public getSquads(): Squad[] {
    return this.squads;
  }

  private applyMode(mode: SystemMode) {
    // Reset all first
    this.squads.forEach(s => this.setSquadState(s.id, false));
    this.setSquadState('TEAM_CORE', true); // Always on

    switch (mode) {
      case SystemMode.ECO:
        // Controlled by Workflow Engine mostly
        break;
      case SystemMode.BALANCED:
        this.setSquadState('TEAM_DEV', true);
        this.setSquadState('TEAM_CONTEXT', true);
        break;
      case SystemMode.HIGH:
        this.setSquadState('TEAM_DEV', true);
        this.setSquadState('TEAM_MKT', true);
        this.setSquadState('TEAM_CONTEXT', true);
        this.setSquadState('TEAM_OPTIMIZE', true);
        break;
      case SystemMode.ULTRA:
        this.squads.forEach(s => this.setSquadState(s.id, true));
        break;
    }
  }

  public getAgents(): Agent[] {
    return this.swarm;
  }

  public tick() {
    // Simulation Tick
    this.swarm.filter(a => a.enabled).forEach(agent => {
       // Activity logic...
       if (agent.status === AgentStatus.WORKING && Math.random() > 0.95) agent.status = AgentStatus.IDLE;
       if (agent.status === AgentStatus.IDLE && Math.random() > 0.95) agent.status = AgentStatus.THINKING;
       if (agent.status === AgentStatus.THINKING && Math.random() > 0.9) agent.status = AgentStatus.WORKING;
       
       if (agent.status !== AgentStatus.OFFLINE) {
         agent.cpuUsage = agent.status === AgentStatus.WORKING ? 40 + Math.random() * 60 : 5 + Math.random() * 10;
       }
    });
  }

  public getActiveCount(): number {
    return this.swarm.filter(a => a.enabled).length;
  }

  public getTotalRam(): number {
    return this.swarm.reduce((acc, curr) => acc + curr.ramUsage, 0);
  }
}

export const orchestrator = new AgentSwarmOrchestrator();