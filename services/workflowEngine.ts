import { WorkflowStage, AutonomousConfig } from "../types";
import { orchestrator } from "./orchestrator";
import { continuum } from "./continuumMemory";

// The Workflow Engine coordinates the high-level intent of the agency.
// It moves the system through specific stages of operation.

class WorkflowEngine {
  private currentStage: WorkflowStage = WorkflowStage.IDLE;
  private config: AutonomousConfig;
  private tokenUsage: number = 0;
  private startTime: number = Date.now();

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

  public tick() {
    if (!this.config.enabled) {
      this.currentStage = WorkflowStage.IDLE;
      return;
    }

    // 1. Safety Checks
    if (this.checkLimits()) {
      return; // Stop if limits reached
    }

    // 2. State Machine Logic
    switch (this.currentStage) {
      case WorkflowStage.IDLE:
        // In 24/7 mode, automatically restart pipeline
        if (this.config.mode24_7 || Math.random() > 0.9) {
          this.transitionTo(WorkflowStage.INTENT);
        }
        break;

      case WorkflowStage.INTENT:
        // Intent Analyzer Agent works here
        this.simulateWork(2000, WorkflowStage.PLANNING); // Simulate Prompt Engineering
        break;

      case WorkflowStage.PLANNING:
        // Strategy Squad works here
        this.simulateWork(3000, WorkflowStage.EXECUTION);
        break;

      case WorkflowStage.EXECUTION:
        // Dev/Mkt/Spec Squads work here (Longest phase)
        this.simulateWork(8000, WorkflowStage.OPTIMIZATION);
        break;

      case WorkflowStage.OPTIMIZATION:
        // Optimization Squad improves the result
        this.simulateWork(3000, WorkflowStage.ARCHIVAL);
        break;

      case WorkflowStage.ARCHIVAL:
        // Context Keeper cleans up and saves
        this.performArchival();
        this.transitionTo(WorkflowStage.IDLE);
        break;
    }
  }

  private transitionTo(stage: WorkflowStage) {
    this.currentStage = stage;
    // Notify Orchestrator to wake up relevant squads
    orchestrator.activateSquadsForStage(stage);
    
    // Log transition
    if (stage !== WorkflowStage.IDLE) {
       continuum.store(`Workflow Transition: Entering ${stage} phase.`, undefined, ['system', 'workflow']);
    }
  }

  private simulateWork(durationMs: number, nextStage: WorkflowStage) {
    // Simulate token consumption based on work intensity
    this.tokenUsage += Math.floor(Math.random() * 500); 
    
    // In a real app, this would wait for Promises from Gemini.
    // Here we use a probability check to advance stages to simulate async completion.
    if (Math.random() > 0.95) {
      this.transitionTo(nextStage);
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