import { WorkflowStage, AutonomousConfig, IntrospectionLayer } from "../types";
import { orchestrator } from "./orchestrator";
import { continuum } from "./continuumMemory";
import { generateAgentResponse } from "./geminiService";
import { MOCK_PROJECTS } from "../constants";

// The Workflow Engine coordinates the high-level intent of the agency.
// It moves the system through specific stages of operation.

class WorkflowEngine {
  private currentStage: WorkflowStage = WorkflowStage.IDLE;
  private config: AutonomousConfig;
  private tokenUsage: number = 0;
  private startTime: number = Date.now();
  private isProcessing: boolean = false; // Prevents overlapping calls
  
  // Data Pipeline to pass results between stages
  private pipelineData: {
    intent?: string;
    plan?: string;
    draftResult?: string; // Result from EXECUTION
    finalResult?: string; // Result from OPTIMIZATION
  } = {};

  constructor() {
    // Default config, will be overwritten by App.tsx
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

  public async tick() {
    if (!this.config.enabled) {
      this.currentStage = WorkflowStage.IDLE;
      return;
    }

    // 1. Safety Checks
    if (this.checkLimits()) {
      return; // Stop if limits reached
    }

    // Do not tick if we are waiting for a real API response
    if (this.isProcessing) return;

    // 2. State Machine Logic (REAL EXECUTION)
    switch (this.currentStage) {
      case WorkflowStage.IDLE:
        // In 24/7 mode, automatically restart pipeline
        if (this.config.mode24_7) {
          this.startNewCycle();
        }
        break;

      case WorkflowStage.INTENT:
        // Intent Analyzer Agent works here
        await this.executeStageTask(
            "Analyze current system context and define immediate strategic goals.", 
            "CORE", 
            "Intent_Analyzer_Alpha",
            WorkflowStage.PLANNING
        ); 
        break;

      case WorkflowStage.PLANNING:
        // Strategy Squad works here
        await this.executeStageTask(
            "Develop a step-by-step execution plan based on the defined goals.", 
            "OPS", 
            "Strategos_X",
            WorkflowStage.EXECUTION
        );
        break;

      case WorkflowStage.EXECUTION:
        // Dev/Mkt/Spec Squads work here (Longest phase)
        await this.executeStageTask(
            `Execute the strategic plan. Context: ${MOCK_PROJECTS[0].name}. Generate high-quality deliverable.`,
            "DEV",
            "Code_Architect",
            WorkflowStage.OPTIMIZATION
        );
        break;

      case WorkflowStage.OPTIMIZATION:
        // Optimization Squad improves the result using the Adversarial Loop
        await this.executeStageTask(
            "Critique and optimize the provided draft deliverable for maximum efficiency and quality.",
            "OPS",
            "Improver_V9",
            WorkflowStage.ARCHIVAL
        );
        break;

      case WorkflowStage.ARCHIVAL:
        // Context Keeper cleans up and saves
        this.performArchival();
        this.transitionTo(WorkflowStage.IDLE);
        break;
    }
  }

  private startNewCycle() {
      this.pipelineData = {}; // Clear pipeline
      this.transitionTo(WorkflowStage.INTENT);
  }

  private transitionTo(stage: WorkflowStage) {
    this.currentStage = stage;
    // Notify Orchestrator to wake up relevant squads
    orchestrator.activateSquadsForStage(stage);
    
    // Log transition
    if (stage !== WorkflowStage.IDLE) {
       continuum.store(`[WORKFLOW] Entering ${stage} phase. Squads activated.`, undefined, ['system', 'workflow']);
    }
  }

  private async executeStageTask(task: string, category: string, agentRole: string, nextStage: WorkflowStage) {
      this.isProcessing = true;
      
      try {
          // Store intent context if we are in later stages
          const previousOutput = this.currentStage === WorkflowStage.OPTIMIZATION 
             ? this.pipelineData.draftResult || "No draft available." 
             : this.pipelineData.intent || null;

          // REAL API CALL
          const response = await generateAgentResponse(
              agentRole, 
              agentRole, // Role name same as ID for prompt
              category, 
              task, 
              previousOutput, 
              IntrospectionLayer.OPTIMAL
          );

          // Track REAL Tokens
          this.tokenUsage += response.usage;

          // Save Data to Pipeline
          if (this.currentStage === WorkflowStage.INTENT) this.pipelineData.intent = response.output;
          if (this.currentStage === WorkflowStage.PLANNING) this.pipelineData.plan = response.output;
          if (this.currentStage === WorkflowStage.EXECUTION) this.pipelineData.draftResult = response.output;
          if (this.currentStage === WorkflowStage.OPTIMIZATION) this.pipelineData.finalResult = response.output;

          // Move to next stage
          this.transitionTo(nextStage);
      } catch (e) {
          console.error("Workflow Execution Error", e);
          // Wait and retry or abort? For now, we abort to idle to prevent loop crashes
          this.config.enabled = false;
          this.transitionTo(WorkflowStage.IDLE);
      } finally {
          this.isProcessing = false;
      }
  }

  private performArchival() {
    // Simulate "The Librarian" compressing context
    continuum.store("Context Cycle Completed. Compressing logs to Deep Storage.", undefined, ['archival']);
    
    if (this.config.safeCleanup) {
        // "Sacred" file protection simulation
        // In a real FS, this would check file metadata flags
        console.log("[CONTEXT KEEPER] Protected 4 'SACRED' context files. Deleted 12 'EPHEMERAL' temp files.");
    }
  }

  private checkLimits(): boolean {
    // Check Token Limit
    if (this.tokenUsage >= this.config.maxDailyTokens) {
      this.config.enabled = false; // Emergency Stop
      console.warn("DAILY TOKEN LIMIT REACHED. STOPPING AUTONOMY.");
      return true;
    }

    // Check Time Limit (if not 0)
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