
import { WorkflowStage, AutonomousConfig, IntrospectionLayer, WorkflowMutation, SystemMode, SystemProtocol, MorphPayload } from "../types";
import { orchestrator } from "./orchestrator";
import { continuum } from "./continuumMemory";
import { generateAgentResponse } from "./geminiService";
import { introspection } from "./introspectionEngine";
import { systemBus } from "./systemBus"; 
import { MOCK_PROJECTS, DEFAULT_API_CONFIG } from "../constants";

class WorkflowEngine {
  private currentStage: WorkflowStage = WorkflowStage.IDLE;
  private config: AutonomousConfig;
  private tokenUsage: number = 0;
  private isProcessing: boolean = false; 
  private lastThoughts: string[] = []; 
  
  private lastQualityScore: number = 100;
  private remediationAttempts: number = 0;
  private MAX_REMEDIATION_ATTEMPTS: number = 3;

  private failures: number = 0;
  private circuitOpen: boolean = false;
  private circuitResetTime: number = 0;
  private readonly FAILURE_THRESHOLD = 3;
  private readonly RESET_TIMEOUT = 30000; 

  private pipelineData: any = {};

  constructor() {
    this.config = {
      enabled: false,
      mode24_7: false,
      allowEvolution: false,
      smartPaging: false,
      maxRunTimeHours: 4,
      maxDailyTokens: 500000,
      safeCleanup: true
    };
  }

  public updateConfig(newConfig: AutonomousConfig) {
    this.config = newConfig;
  }

  public getStage(): WorkflowStage {
    return this.currentStage;
  }

  public getTokenUsage(): number {
    return this.tokenUsage;
  }

  public getLastThoughts(): string[] {
    return this.lastThoughts;
  }

  public getLastQualityScore(): number {
      return this.lastQualityScore;
  }

  public async tick() {
    if (!this.config.enabled) {
      this.currentStage = WorkflowStage.IDLE;
      return;
    }

    if (this.circuitOpen) {
        if (Date.now() > this.circuitResetTime) {
            this.circuitOpen = false;
            this.failures = 0;
        } else {
            return; 
        }
    }

    if (this.config.mode24_7) {
        await this.monitorLongRunningContext();
    }

    if (this.checkLimits() || this.isProcessing) return;

    switch (this.currentStage) {
      case WorkflowStage.IDLE:
        if (this.config.mode24_7) this.startNewCycle();
        break;

      case WorkflowStage.INTENT:
        await this.executeStageTask("Analyze intent.", "CORE", "Intent_Analyzer_Alpha", WorkflowStage.PLANNING); 
        break;

      case WorkflowStage.PLANNING:
        // Logic to detect if this is a GENESIS request
        // For simulation, we randomly assume a new app request every few cycles in ULTRA mode
        if (this.config.allowEvolution && Math.random() > 0.9) {
             this.transitionTo(WorkflowStage.GENESIS);
        } else {
             await this.executeStageTask("Create plan.", "OPS", "Strategos_X", WorkflowStage.EXECUTION);
        }
        break;

      case WorkflowStage.GENESIS:
        await this.executeGenesisSpawn();
        break;

      case WorkflowStage.EXECUTION:
        await this.executeStageTask("Execute plan.", "DEV", "Code_Architect", WorkflowStage.QA_AUDIT);
        break;

      case WorkflowStage.QA_AUDIT:
        await this.executeQARound();
        break;

      case WorkflowStage.REMEDIATION:
        await this.executeRemediationRound();
        break;

      case WorkflowStage.OPTIMIZATION:
        await this.executeStageTask("Optimize.", "OPS", "Improver_V9", WorkflowStage.ARCHIVAL);
        break;

      case WorkflowStage.ARCHIVAL:
        this.performArchival();
        this.config.allowEvolution ? this.transitionTo(WorkflowStage.META_ANALYSIS) : this.transitionTo(WorkflowStage.IDLE);
        break;
      
      case WorkflowStage.META_ANALYSIS:
        await this.executeMetaAnalysis();
        break;

      case WorkflowStage.ADAPTATION_QA:
        this.isProcessing = false; 
        this.transitionTo(WorkflowStage.IDLE);
        break;
    }
  }

  private async executeGenesisSpawn() {
      this.isProcessing = true;
      try {
          console.log("[WORKFLOW] Entering GENESIS phase. Spawning child application...");
          
          // 1. Call AI to design the app architecture
          const response = await generateAgentResponse(
              "System_Architect",
              "Genesis Architect",
              "INTEGRATION",
              "Design a new 'Analytics Dashboard' application. Define folder structure.",
              null,
              IntrospectionLayer.MAXIMUM,
              WorkflowStage.GENESIS
          );
          
          this.tokenUsage += response.usage;
          
          // 2. Trigger Factory Spawn (Simulated API call)
          try {
              const res = await fetch(`http://localhost:${DEFAULT_API_CONFIG.port}/v1/factory/spawn`, {
                  method: 'POST',
                  headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${DEFAULT_API_CONFIG.apiKey}`
                  },
                  body: JSON.stringify({ name: `App_${Date.now()}`, template: 'REACT_VITE' })
              });
              if (res.ok) {
                  const data = await res.json();
                  systemBus.emit(SystemProtocol.SQUAD_EXPANSION, { name: 'Genesis_Ops', category: 'INTEGRATION', role: 'Deployment' });
              }
          } catch(e) {
              console.error("Genesis Factory API failed", e);
          }

          this.transitionTo(WorkflowStage.QA_AUDIT);
      } catch(e) {
          this.recordFailure();
      } finally {
          this.isProcessing = false;
      }
  }

  private async monitorLongRunningContext() {
      const stats = continuum.getStats();
      if (stats.total > 200 && !this.isProcessing) {
          this.isProcessing = true;
          try {
              const response = await generateAgentResponse("Context_Overseer", "Supervisor", "DATA", "Compress logs.", null, IntrospectionLayer.MEDIUM, WorkflowStage.OPTIMIZATION);
              continuum.store(response.output, 'LONG' as any, ['SAGA']);
              systemBus.emit(SystemProtocol.MEMORY_FLUSH, { message: `Archived Context` });
          } catch (e) { console.error(e); } finally { this.isProcessing = false; }
      }
  }

  private startNewCycle() {
      this.pipelineData = {}; 
      this.lastQualityScore = 0;
      this.remediationAttempts = 0;
      this.transitionTo(WorkflowStage.INTENT);
  }

  private transitionTo(stage: WorkflowStage) {
    this.currentStage = stage;
    orchestrator.activateSquadsForStage(stage);
  }

  private recordFailure() {
      this.failures++;
      const morph: MorphPayload = { mode: 'DEFENSE', accentColor: 'red', density: 'compact' };
      systemBus.emit(SystemProtocol.INTERFACE_MORPH, morph, 'SECURITY');
      if (this.failures >= this.FAILURE_THRESHOLD) {
          this.circuitOpen = true;
          this.circuitResetTime = Date.now() + this.RESET_TIMEOUT;
          this.isProcessing = false;
          systemBus.emit(SystemProtocol.SECURITY_LOCKDOWN, { message: 'Circuit Breaker Active' });
      }
  }

  private recordSuccess() { this.failures = 0; }

  private async executeQARound() {
      this.isProcessing = true;
      try {
        const input = this.pipelineData.draftResult || "No draft.";
        const response = await generateAgentResponse("QA_Inquisitor", "Auditor", "OPS", "Audit.", input, IntrospectionLayer.MAXIMUM, WorkflowStage.QA_AUDIT);
        this.recordSuccess();
        this.tokenUsage += response.usage;
        this.lastThoughts = response.thoughts;
        this.lastQualityScore = response.qualityScore || 85;
        this.pipelineData.qaReport = response.output;

        if (this.lastQualityScore < 90) systemBus.emit(SystemProtocol.INTERFACE_MORPH, { mode: 'DEFENSE' }, 'QA');

        if (this.lastQualityScore >= 98 || this.remediationAttempts >= this.MAX_REMEDIATION_ATTEMPTS) {
            systemBus.emit(SystemProtocol.INTERFACE_MORPH, { mode: 'FLOW' }, 'QA');
            this.transitionTo(WorkflowStage.OPTIMIZATION);
        } else {
            this.transitionTo(WorkflowStage.REMEDIATION);
        }
      } catch (e) { this.recordFailure(); } finally { this.isProcessing = false; }
  }

  private async executeRemediationRound() {
      this.isProcessing = true;
      try {
          const combined = `DRAFT:\n${this.pipelineData.draftResult}\n\nREPORT:\n${this.pipelineData.qaReport}`;
          const response = await generateAgentResponse("Fixer_Unit", "Mechanic", "DEV", "Fix.", combined, IntrospectionLayer.DEEP, WorkflowStage.REMEDIATION);
          this.recordSuccess();
          this.tokenUsage += response.usage;
          this.pipelineData.draftResult = response.output;
          this.remediationAttempts++;
          await this.checkAndApplyProtocols(response.output);
          this.transitionTo(WorkflowStage.QA_AUDIT);
      } catch (e) { this.recordFailure(); } finally { this.isProcessing = false; }
  }

  private async executeStageTask(task: string, category: string, role: string, next: WorkflowStage) {
      this.isProcessing = true;
      try {
          const prev = this.currentStage === WorkflowStage.OPTIMIZATION ? this.pipelineData.draftResult : this.pipelineData.intent;
          const response = await generateAgentResponse(role, role, category, task, prev, IntrospectionLayer.OPTIMAL, this.currentStage);
          this.recordSuccess();
          this.tokenUsage += response.usage;
          this.lastThoughts = response.thoughts;
          await this.checkAndApplyProtocols(response.output);
          if (this.currentStage === WorkflowStage.INTENT) this.pipelineData.intent = response.output;
          if (this.currentStage === WorkflowStage.EXECUTION) this.pipelineData.draftResult = response.output;
          this.transitionTo(next);
      } catch (e) { this.recordFailure(); } finally { this.isProcessing = false; }
  }

  private async checkAndApplyProtocols(output: string) {
      // Basic simulation of protocol detection
      if (output.includes('<<<PROTOCOL')) {
          // Parsing logic...
      }
  }

  private async executeMetaAnalysis() {
      this.isProcessing = true;
      try {
          const response = await generateAgentResponse("Workflow_Architect", "Evolutionist", "CORE", "Analyze.", null, IntrospectionLayer.DEEP, WorkflowStage.META_ANALYSIS);
          this.tokenUsage += response.usage;
          this.transitionTo(WorkflowStage.ADAPTATION_QA);
      } catch(e) { this.transitionTo(WorkflowStage.IDLE); } finally { this.isProcessing = false; }
  }

  private performArchival() {
    continuum.store("Cycle Done.", undefined, ['archival']);
  }

  private checkLimits(): boolean {
    if (this.tokenUsage >= this.config.maxDailyTokens) {
      this.config.enabled = false; 
      return true;
    }
    return false;
  }
}

export const workflowEngine = new WorkflowEngine();
