import { Agent, AgentStatus, AgentRoleType, Squad, SystemMode, WorkflowStage, AgentCategory } from "../types";
import { INITIAL_AGENTS } from "../constants";

// The "Swarm" Manager V4.0 (Enterprise Edition)
// Generates and Manages exactly 131 Specialized Squads.

class AgentSwarmOrchestrator {
  private swarm: Agent[] = [];
  private squads: Squad[] = [];
  private currentMode: SystemMode = SystemMode.ECO;

  constructor() {
    this.initializeSwarm();
    this.applyMode(SystemMode.ECO); 
  }

  private initializeSwarm() {
    // 1. Load the Core "Hero" Squads first (Core, Strategy, Context, Optimize)
    // These are critical for the OS logic.
    this.swarm = [...INITIAL_AGENTS];
    
    const coreSquads: Squad[] = [
        { id: 'TEAM_CORE', name: 'Orchestration Command', leaderId: 'core-01', members: ['core-01', 'core-02'], category: 'CORE', active: true },
        { id: 'TEAM_STRATEGY', name: 'Strategic Planning HQ', leaderId: 'strat-01', members: ['strat-01'], category: 'OPS', active: false },
        { id: 'TEAM_CONTEXT', name: 'Context Transcendence', leaderId: 'ctx-01', members: ['ctx-01', 'ctx-02'], category: 'DATA', active: false },
        { id: 'TEAM_OPTIMIZE', name: 'Quality Assurance & Opt', leaderId: 'opt-01', members: ['opt-01', 'mon-01'], category: 'OPS', active: false }
    ];
    this.squads.push(...coreSquads);

    // 2. Procedurally Generate the remaining Professional Squads to reach 131 total
    // We need 127 more teams.
    const TOTAL_SQUADS = 131;
    const SQUADS_TO_GENERATE = TOTAL_SQUADS - coreSquads.length;

    // Configuration for Domain Generation
    const domains: { cat: AgentCategory; prefix: string[]; roles: string[] }[] = [
        { 
            cat: 'CYBERSEC', 
            prefix: ['RedTeam', 'BlueTeam', 'Crypto', 'Shield', 'Firewall', 'ZeroTrust', 'Pentest', 'Audit'], 
            roles: ['Security Analyst', 'Ethical Hacker', 'Encryption Specialist'] 
        },
        { 
            cat: 'DEV', 
            prefix: ['Frontend', 'Backend', 'FullStack', 'DevOps', 'Cloud', 'Mobile', 'React', 'Python', 'Rust', 'API'], 
            roles: ['Senior Engineer', 'Architect', 'Code Ninja', 'QA Engineer'] 
        },
        { 
            cat: 'DATA', 
            prefix: ['Vector', 'ETL', 'BigData', 'Analytics', 'Mining', 'Scraper', 'Insight', 'Neural'], 
            roles: ['Data Scientist', 'ML Engineer', 'Data Miner'] 
        },
        { 
            cat: 'MARKETING', 
            prefix: ['Social', 'Viral', 'SEO', 'Brand', 'Copy', 'Growth', 'Ads', 'Content'], 
            roles: ['Copywriter', 'SEO Specialist', 'Growth Hacker'] 
        },
        { 
            cat: 'LEGAL', 
            prefix: ['Compliance', 'IP', 'Contract', 'Ethics', 'Audit', 'Copyright'], 
            roles: ['Legal Counsel', 'Compliance Officer'] 
        },
        { 
            cat: 'FINANCE', 
            prefix: ['Ledger', 'Fiat', 'Crypto', 'Budget', 'Tax', 'Forex'], 
            roles: ['Financial Analyst', 'Budget Controller'] 
        },
        { 
            cat: 'SCIENCE', 
            prefix: ['Bio', 'Physics', 'Chem', 'Research', 'Lab', 'Genome'], 
            roles: ['Researcher', 'Lab Technician'] 
        },
        { 
            cat: 'OPS', 
            prefix: ['Logistics', 'HR', 'Support', 'Admin', 'Infra', 'Network'], 
            roles: ['SysAdmin', 'Ops Manager'] 
        }
    ];

    const suffixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Prime', 'Nexus', 'Vanguard', 'Squad', 'Unit', 'Force', 'Hive', 'Cell'];

    let squadCounter = 5; // Start after the 4 core squads
    let globalAgentId = 200;

    for (let i = 0; i < SQUADS_TO_GENERATE; i++) {
        // Pick a domain using round-robin or random distribution
        const domain = domains[i % domains.length];
        
        // Generate Unique Name
        const prefix = domain.prefix[Math.floor(Math.random() * domain.prefix.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const squadName = `${prefix}_${suffix}_${Math.floor(Math.random() * 100)}`;
        const squadId = `SQ_${domain.cat}_${squadCounter++}`;

        // Create Leader Agent
        const leaderId = `agt_${globalAgentId++}`;
        const leader: Agent = {
            id: leaderId,
            name: `${prefix} Lead`,
            teamId: squadId,
            category: domain.cat,
            roleType: AgentRoleType.LEADER,
            role: `Lead ${domain.roles[0]}`,
            status: AgentStatus.OFFLINE,
            enabled: false,
            cpuUsage: 0,
            ramUsage: 0,
            lastActive: Date.now()
        };

        // Create 2 Workers for this squad
        const worker1Id = `agt_${globalAgentId++}`;
        const worker2Id = `agt_${globalAgentId++}`;
        const worker1: Agent = {
            id: worker1Id,
            name: `${prefix} Unit A`,
            teamId: squadId,
            category: domain.cat,
            roleType: AgentRoleType.WORKER,
            role: domain.roles[1] || domain.roles[0],
            status: AgentStatus.OFFLINE,
            enabled: false,
            cpuUsage: 0,
            ramUsage: 0,
            lastActive: Date.now()
        };
        const worker2: Agent = {
            id: worker2Id,
            name: `${prefix} Unit B`,
            teamId: squadId,
            category: domain.cat,
            roleType: AgentRoleType.WORKER,
            role: domain.roles[1] || domain.roles[0],
            status: AgentStatus.OFFLINE,
            enabled: false,
            cpuUsage: 0,
            ramUsage: 0,
            lastActive: Date.now()
        };

        // Register Agents
        this.swarm.push(leader, worker1, worker2);

        // Register Squad
        this.squads.push({
            id: squadId,
            name: squadName.toUpperCase().replace(/_/g, ' '),
            leaderId: leaderId,
            members: [leaderId, worker1Id, worker2Id],
            category: domain.cat,
            active: false
        });
    }

    console.log(`[ORCHESTRATOR] Generated ${this.squads.length} professional squads with ${this.swarm.length} total agents.`);
  }

  public activateSquadsForStage(stage: WorkflowStage) {
    // Advanced Mapping: Maps Workflow Stages to Professional Domains
    const mapping: Record<WorkflowStage, AgentCategory[]> = {
      [WorkflowStage.IDLE]: ['CORE'],
      [WorkflowStage.INTENT]: ['CORE', 'DATA'], 
      [WorkflowStage.PLANNING]: ['OPS', 'LEGAL', 'FINANCE'], // Planning involves legal/budget checks
      [WorkflowStage.EXECUTION]: ['DEV', 'MARKETING', 'CYBERSEC', 'SCIENCE'], // The heavy lifters
      [WorkflowStage.OPTIMIZATION]: ['OPS', 'DATA', 'CYBERSEC'], // Sec checks and optimization
      [WorkflowStage.ARCHIVAL]: ['DATA', 'CORE']
    };

    const activeCategories = mapping[stage] || [];
    
    if (this.currentMode === SystemMode.ULTRA) return; // Ultra keeps everything on

    this.squads.forEach(squad => {
      // Core is always active
      if (squad.category === 'CORE') {
        this.setSquadState(squad.id, true);
        return;
      }

      // Logic for ECO/BALANCED/HIGH modes
      let shouldBeActive = false;

      if (this.currentMode === SystemMode.CUSTOM) {
          // Keep current state
          shouldBeActive = squad.active;
      } else if (activeCategories.includes(squad.category)) {
          // If the squad belongs to the active category for this stage
          if (this.currentMode === SystemMode.ECO) {
              // In Eco, only activate 20% of the available squads to save VRAM
              shouldBeActive = Math.random() > 0.8; 
          } else {
              shouldBeActive = true;
          }
      }

      this.setSquadState(squad.id, shouldBeActive);
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
            // Randomize start status slightly for realism
            agent.status = Math.random() > 0.5 ? AgentStatus.IDLE : AgentStatus.THINKING;
            agent.ramUsage = 50 + Math.random() * 50; 
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
    // Returns unique categories of active squads
    const cats = new Set(this.squads.filter(s => s.active).map(s => s.category));
    return Array.from(cats);
  }

  public getSquads(): Squad[] {
    return this.squads;
  }

  private applyMode(mode: SystemMode) {
    // Reset all non-core
    this.squads.forEach(s => {
        if (s.category !== 'CORE') this.setSquadState(s.id, false);
    });

    switch (mode) {
      case SystemMode.ECO:
        // Handled by workflow engine tick
        break;
      case SystemMode.BALANCED:
        // Activate essential categories
        this.squads.forEach(s => {
            if (['DEV', 'DATA'].includes(s.category) && Math.random() > 0.7) this.setSquadState(s.id, true);
        });
        break;
      case SystemMode.HIGH:
        // Activate most categories
        this.squads.forEach(s => {
            if (s.category !== 'SCIENCE' && s.category !== 'FINANCE') this.setSquadState(s.id, true);
        });
        break;
      case SystemMode.ULTRA:
        // ALL HANDS ON DECK
        this.squads.forEach(s => this.setSquadState(s.id, true));
        break;
    }
  }

  public getAgents(): Agent[] {
    return this.swarm;
  }

  public tick() {
    // Simulation Tick for metrics
    this.swarm.filter(a => a.enabled).forEach(agent => {
       if (agent.status === AgentStatus.WORKING && Math.random() > 0.98) agent.status = AgentStatus.IDLE;
       if (agent.status === AgentStatus.IDLE && Math.random() > 0.95) agent.status = AgentStatus.THINKING;
       if (agent.status === AgentStatus.THINKING && Math.random() > 0.9) agent.status = AgentStatus.WORKING;
       
       if (agent.status !== AgentStatus.OFFLINE) {
         agent.cpuUsage = agent.status === AgentStatus.WORKING ? 30 + Math.random() * 50 : 2 + Math.random() * 5;
         agent.ramUsage = Math.min(1024, agent.ramUsage + (Math.random() * 2 - 1));
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