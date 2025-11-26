
import { Agent, AgentStatus, AgentRoleType, Squad, SystemMode, WorkflowStage, AgentCategory, BusinessType } from "../types";
import { INITIAL_AGENTS } from "../constants";

// The "Swarm" Manager V4.0 (Enterprise Edition)
// Generates and Manages exactly 131 Specialized Squads.

class AgentSwarmOrchestrator {
  private swarm: Agent[] = [];
  private squads: Squad[] = [];
  private currentMode: SystemMode = SystemMode.ECO;
  private currentBusinessPreset: BusinessType = 'GENERAL';

  constructor() {
    this.initializeSwarm();
    this.applyMode(SystemMode.ECO); 
  }

  private initializeSwarm() {
    // 1. Load the Core "Hero" Squads first (Core, Strategy, Context, Optimize, QA, Remediation)
    this.swarm = [...INITIAL_AGENTS];
    
    // Core Logic Squads (Always needed for OS function)
    const coreSquads: Squad[] = [
        { id: 'TEAM_CORE', name: 'Orchestration Command', leaderId: 'core-01', members: ['core-01', 'core-02'], category: 'CORE', active: true },
        { id: 'TEAM_STRATEGY', name: 'Strategic Planning HQ', leaderId: 'strat-01', members: ['strat-01'], category: 'OPS', active: false },
        { id: 'TEAM_CONTEXT', name: 'Context Transcendence', leaderId: 'ctx-01', members: ['ctx-01', 'ctx-02'], category: 'DATA', active: false },
        { id: 'TEAM_OPTIMIZE', name: 'Workflow Optimizer', leaderId: 'opt-01', members: ['opt-01', 'mon-01'], category: 'OPS', active: false },
        { id: 'TEAM_QA', name: 'The Inquisitors (QA)', leaderId: 'qa-01', members: ['qa-01', 'qa-02'], category: 'OPS', active: false },
        { id: 'TEAM_FIX', name: 'The Mechanics (Fix)', leaderId: 'fix-01', members: ['fix-01', 'fix-02'], category: 'DEV', active: false }
    ];
    this.squads.push(...coreSquads);

    // 2. Procedurally Generate the remaining Professional Squads to reach 131 total
    // We need approx 125 more teams.
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

    let squadCounter = coreSquads.length + 1; 
    let globalAgentId = 200;

    for (let i = 0; i < SQUADS_TO_GENERATE; i++) {
        // Pick a domain using round-robin
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
    if (this.currentMode === SystemMode.ULTRA || this.currentMode === SystemMode.CUSTOM || this.currentMode === SystemMode.PRESET) return;

    // Default stage activation for ECO/BALANCED/HIGH
    const mapping: Record<WorkflowStage, AgentCategory[]> = {
      [WorkflowStage.IDLE]: ['CORE'],
      [WorkflowStage.INTENT]: ['CORE', 'DATA'], 
      [WorkflowStage.PLANNING]: ['OPS', 'LEGAL', 'FINANCE'], 
      [WorkflowStage.EXECUTION]: ['DEV', 'MARKETING', 'CYBERSEC', 'SCIENCE'], 
      [WorkflowStage.QA_AUDIT]: ['OPS', 'CYBERSEC', 'LEGAL'],
      [WorkflowStage.REMEDIATION]: ['DEV', 'DATA'],
      [WorkflowStage.OPTIMIZATION]: ['OPS', 'DATA', 'CYBERSEC'], 
      [WorkflowStage.ARCHIVAL]: ['DATA', 'CORE']
    };

    const activeCategories = mapping[stage] || [];
    
    this.squads.forEach(squad => {
      if (squad.category === 'CORE') {
        this.setSquadState(squad.id, true);
        return;
      }

      let shouldBeActive = false;
      if (activeCategories.includes(squad.category)) {
          if (this.currentMode === SystemMode.ECO) {
              const catSquads = this.squads.filter(s => s.category === squad.category);
              const squadIndex = catSquads.findIndex(s => s.id === squad.id);
              shouldBeActive = squadIndex < 3; 
          } else {
              shouldBeActive = true;
          }
      }
      this.setSquadState(squad.id, shouldBeActive);
    });
  }

  private setSquadState(squadId: string, enabled: boolean) {
    const squad = this.squads.find(s => s.id === squadId);
    if (!squad) return;

    // PROTECTION: CORE Squads can never be disabled manually
    if (squad.category === 'CORE' && !enabled) {
        // Force Enable if trying to disable
        enabled = true;
    }

    squad.active = enabled;
    this.swarm.filter(a => a.teamId === squadId).forEach(agent => {
      agent.enabled = enabled;
      if (!enabled) {
          agent.status = AgentStatus.OFFLINE;
          agent.ramUsage = 0;
          agent.cpuUsage = 0;
      } else {
          agent.status = Math.random() > 0.5 ? AgentStatus.IDLE : AgentStatus.THINKING;
          agent.ramUsage = 50 + Math.random() * 50; 
      }
    });
  }

  public setMode(mode: SystemMode) {
    this.currentMode = mode;
    this.applyMode(mode);
  }

  public setBusinessPreset(preset: BusinessType) {
    this.currentMode = SystemMode.PRESET;
    this.currentBusinessPreset = preset;
    
    // Define Category Mapping for Businesses
    const businessMap: Record<BusinessType, AgentCategory[]> = {
        'GENERAL': ['CORE', 'DEV', 'DATA', 'OPS', 'MARKETING', 'LEGAL', 'FINANCE', 'CYBERSEC'], // All Balanced
        'MARKETING_AGENCY': ['CORE', 'MARKETING', 'DATA', 'OPS', 'DEV'],
        'LAW_FIRM': ['CORE', 'LEGAL', 'OPS', 'DATA', 'CYBERSEC'],
        'FINTECH': ['CORE', 'FINANCE', 'DATA', 'LEGAL', 'DEV'],
        'DEV_SHOP': ['CORE', 'DEV', 'CYBERSEC', 'OPS', 'DATA'],
        'RESEARCH_LAB': ['CORE', 'SCIENCE', 'DATA', 'DEV'],
        'CYBER_DEFENSE': ['CORE', 'CYBERSEC', 'DEV', 'OPS', 'LEGAL']
    };

    const targetCategories = businessMap[preset];

    this.squads.forEach(s => {
        if (s.category === 'CORE') {
            this.setSquadState(s.id, true);
        } else {
            // Activate if category matches, otherwise hibernate to save resources
            this.setSquadState(s.id, targetCategories.includes(s.category));
        }
    });
  }

  public toggleCategory(category: AgentCategory, enabled: boolean) {
      this.currentMode = SystemMode.CUSTOM;
      // Cannot disable CORE
      if (category === 'CORE') return;

      this.squads.forEach(s => {
          if (s.category === category) {
              this.setSquadState(s.id, enabled);
          }
      });
  }

  public setCustomToggle(squadId: string, enabled: boolean) {
    this.currentMode = SystemMode.CUSTOM;
    this.setSquadState(squadId, enabled);
  }

  public getActiveCategories(): string[] {
    const cats = new Set(this.squads.filter(s => s.active).map(s => s.category));
    return Array.from(cats);
  }

  public getSquads(): Squad[] {
    return this.squads;
  }

  private applyMode(mode: SystemMode) {
    // Reset non-core first
    if (mode !== SystemMode.CUSTOM && mode !== SystemMode.PRESET) {
        this.squads.forEach(s => {
            if (s.category !== 'CORE') this.setSquadState(s.id, false);
        });
    }

    switch (mode) {
      case SystemMode.ECO:
        // Activate only 3 squads per active category (handled in logic or implicitly here)
        // For baseline ECO, we just want CORE + Minimal OPS
        this.squads.forEach(s => {
            if (s.category === 'CORE' || (s.category === 'OPS' && Math.random() > 0.8)) { // Deterministic first 3 logic moved to activation
                 // Handled by workflow engine dynamic activation usually
            }
        });
        // Force deterministic ECO baseline: First 3 squads of DEV/OPS
        this.squads.filter(s => s.category === 'DEV').slice(0, 3).forEach(s => this.setSquadState(s.id, true));
        this.squads.filter(s => s.category === 'OPS').slice(0, 3).forEach(s => this.setSquadState(s.id, true));
        break;
        
      case SystemMode.BALANCED:
        this.squads.forEach(s => {
            if (['DEV', 'DATA', 'OPS', 'MARKETING'].includes(s.category)) {
               // Activate top 50%
               const catSquads = this.squads.filter(sq => sq.category === s.category);
               const idx = catSquads.findIndex(sq => sq.id === s.id);
               if (idx < catSquads.length / 2) this.setSquadState(s.id, true);
            }
        });
        break;

      case SystemMode.HIGH:
        this.squads.forEach(s => {
            // Activate almost everything except very niche science if not needed
            if (s.category !== 'SCIENCE') this.setSquadState(s.id, true);
        });
        break;

      case SystemMode.ULTRA:
        // ACTIVATE EVERYTHING
        this.squads.forEach(s => this.setSquadState(s.id, true));
        break;
    }
  }

  public getAgents(): Agent[] {
    return this.swarm;
  }

  public tick() {
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
