
import { WorkflowStage, AutonomousConfig, IntrospectionLayer } from "../types";
import { orchestrator } from "./orchestrator";
import { continuum } from "./continuumMemory";
import { generateAgentResponse } from "./geminiService";
import { MOCK_PROJECTS } from "../constants";

// The Workflow Engine coordinates the high-level intent of the agency.
// V4.1 Update: Implements "The Crucible" (Recursive Quality Loop) + Circuit Breaker

class WorkflowEngine {
  private currentStage: WorkflowStage = WorkflowStage.IDLE;
  private config: AutonomousConfig;
  private tokenUsage: number = 0;
  private startTime: number = Date.now();
  private isProcessing: boolean = false; // Prevents overlapping calls
  private lastThoughts: string[] = []; // Store real thoughts for UI
  
  // Crucible State
  private lastQualityScore: number = 100;
  private remediationAttempts: number = 0;
  private MAX_REMEDIATION_ATTEMPTS: number = 3;

  // Circuit Breaker State
  private failures: number = 0;
  private circuitOpen: boolean = false;
  private circuitResetTime: number = 0;
  private readonly FAILURE_THRESHOLD = 3;
  private readonly RESET_TIMEOUT = 30000; // 30 seconds

  // Data Pipeline to pass results between stages
  private pipelineData: {
    intent?: string;
    plan?: string;
    draftResult?: string; // Result from EXECUTION
    qaReport?: string; // Result from QA
    finalResult?: string; // Result from OPTIMIZATION
  } = {};

  constructor() {
    this.config = {
      enabled: false,
      mode24_7: false,
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

    // 1. Safety Checks (Circuit Breaker)
    if (this.circuitOpen) {
        if (Date.now() > this.circuitResetTime) {
            console.log("[CIRCUIT BREAKER] Resetting circuit. Resuming operations.");
            this.circuitOpen = false;
            this.failures = 0;
        } else {
            return; // Circuit is open, stop ticking
        }
    }

    if (this.checkLimits()) {
      return; // Stop if limits reached
    }

    if (this.isProcessing) return;

    // 2. State Machine Logic
    switch (this.currentStage) {
      case WorkflowStage.IDLE:
        if (this.config.mode24_7) {
          this.startNewCycle();
        }
        break;

      case WorkflowStage.INTENT:
        await this.executeStageTask(
            "Analyze current system context and define immediate strategic goals.", 
            "CORE", 
            "Intent_Analyzer_Alpha",
            WorkflowStage.PLANNING
        ); 
        break;

      case WorkflowStage.PLANNING:
        await this.executeStageTask(
            "Develop a step-by-step execution plan based on the defined goals.", 
            "OPS", 
            "Strategos_X",
            WorkflowStage.EXECUTION
        );
        break;

      case WorkflowStage.EXECUTION:
        await this.executeStageTask(
            `Execute the strategic plan. Context: ${MOCK_PROJECTS[0].name}. Generate high-quality deliverable.`,
            "DEV",
            "Code_Architect",
            WorkflowStage.QA_AUDIT // Send to Crucible
        );
        break;

      case WorkflowStage.QA_AUDIT:
        await this.executeQARound();
        break;

      case WorkflowStage.REMEDIATION:
        await this.executeRemediationRound();
        break;

      case WorkflowStage.OPTIMIZATION:
        await this.executeStageTask(
            "Perform final polish and efficiency check on the approved deliverable.",
            "OPS",
            "Improver_V9",
            WorkflowStage.ARCHIVAL
        );
        break;

      case WorkflowStage.ARCHIVAL:
        this.performArchival();
        this.transitionTo(WorkflowStage.IDLE);
        break;
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
    if (stage !== WorkflowStage.IDLE) {
       continuum.store(`[WORKFLOW] Entering ${stage} phase. Squads activated.`, undefined, ['system', 'workflow']);
    }
  }

  private recordFailure() {
      this.failures++;
      if (this.failures >= this.FAILURE_THRESHOLD) {
          console.warn("[CIRCUIT BREAKER] Threshold reached. Opening circuit for 30s.");
          this.circuitOpen = true;
          this.circuitResetTime = Date.now() + this.RESET_TIMEOUT;
          this.isProcessing = false;
      }
  }

  private recordSuccess() {
      this.failures = 0;
  }

  // Specialized logic for the QA -> Fix Loop
  private async executeQARound() {
      this.isProcessing = true;
      try {
        const input = this.pipelineData.draftResult || "No draft.";
        
        const response = await generateAgentResponse(
            "QA_Inquisitor",
            "Ruthless Auditor",
            "OPS",
            "Audit this draft for failures.",
            input,
            IntrospectionLayer.MAXIMUM, // Max depth for QA
            WorkflowStage.QA_AUDIT
        );

        this.recordSuccess();
        this.tokenUsage += response.usage;
        this.lastThoughts = response.thoughts;
        this.lastQualityScore = response.qualityScore || 85;
        this.pipelineData.qaReport = response.output;

        // THE CRUCIBLE DECISION LOGIC
        if (this.lastQualityScore >= 98 || this.remediationAttempts >= this.MAX_REMEDIATION_ATTEMPTS) {
            if (this.remediationAttempts >= this.MAX_REMEDIATION_ATTEMPTS) {
                console.warn("Max remediation attempts reached. Forcing progression.");
            }
            this.transitionTo(WorkflowStage.OPTIMIZATION);
        } else {
            this.transitionTo(WorkflowStage.REMEDIATION);
        }

      } catch (e) {
          console.error("QA Error", e);
          this.recordFailure();
          // Do not transition if failure, retry on next tick
      } finally {
          this.isProcessing = false;
      }
  }

  private async executeRemediationRound() {
      this.isProcessing = true;
      try {
          const draft = this.pipelineData.draftResult;
          const report = this.pipelineData.qaReport;
          const combined = `DRAFT:\n${draft}\n\nAUDIT REPORT:\n${report}`;

          const response = await generateAgentResponse(
            "Fixer_Unit",
            "Senior Mechanic",
            "DEV",
            "Fix identified critical failures.",
            combined,
            IntrospectionLayer.DEEP,
            WorkflowStage.REMEDIATION
          );

          this.recordSuccess();
          this.tokenUsage += response.usage;
          this.lastThoughts = response.thoughts;
          
          this.pipelineData.draftResult = response.output;
          this.remediationAttempts++;

          this.transitionTo(WorkflowStage.QA_AUDIT);

      } catch (e) {
          console.error("Remediation Error", e);
          this.recordFailure();
      } finally {
          this.isProcessing = false;
      }
  }

  private async executeStageTask(task: string, category: string, agentRole: string, nextStage: WorkflowStage) {
      this.isProcessing = true;
      
      try {
          const previousOutput = this.currentStage === WorkflowStage.OPTIMIZATION 
             ? this.pipelineData.draftResult || "No draft available." 
             : this.pipelineData.intent || null;

          const response = await generateAgentResponse(
              agentRole, 
              agentRole, 
              category, 
              task, 
              previousOutput, 
              IntrospectionLayer.OPTIMAL,
              this.currentStage
          );

          this.recordSuccess();
          this.tokenUsage += response.usage;
          this.lastThoughts = response.thoughts;

          if (this.currentStage === WorkflowStage.INTENT) this.pipelineData.intent = response.output;
          if (this.currentStage === WorkflowStage.PLANNING) this.pipelineData.plan = response.output;
          if (this.currentStage === WorkflowStage.EXECUTION) this.pipelineData.draftResult = response.output;
          if (this.currentStage === WorkflowStage.OPTIMIZATION) this.pipelineData.finalResult = response.output;

          this.transitionTo(nextStage);
      } catch (e) {
          console.error("Workflow Execution Error", e);
          this.recordFailure();
      } finally {
          this.isProcessing = false;
      }
  }

  private performArchival() {
    continuum.store("Context Cycle Completed. Compressing logs to Deep Storage.", undefined, ['archival']);
    
    if (this.config.safeCleanup) {
        console.log("[CONTEXT KEEPER] Protected 'SACRED' context files. Cleaned temp execution cache.");
    }
  }

  private checkLimits(): boolean {
    if (this.tokenUsage >= this.config.maxDailyTokens) {
      this.config.enabled = false; 
      console.warn("DAILY TOKEN LIMIT REACHED. STOPPING AUTONOMY.");
      return true;
    }

    if (this.config.maxRunTimeHours > 0) {
      const runTimeMs = Date.now() - this.startTime;
      const maxMs = this.config.maxRunTimeHours * 60 * 60 * 1000;
      if (runTimeMs > maxMs) {
        this.config.enabled = false;
        return true;
      }
    }

    return false;
  }
}

export const workflowEngine = new WorkflowEngine();
