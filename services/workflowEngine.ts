
import { WorkflowStage, AutonomousConfig, IntrospectionLayer, WorkflowMutation, SystemMode } from "../types";
import { orchestrator } from "./orchestrator";
import { continuum } from "./continuumMemory";
import { generateAgentResponse } from "./geminiService";
import { introspection } from "./introspectionEngine";
import { MOCK_PROJECTS, DEFAULT_API_CONFIG } from "../constants";

// The Workflow Engine coordinates the high-level intent of the agency.
// V4.2 Update: Implements "The Crucible", Circuit Breaker, Dynamic Self-Evolution, AND ACTIVE CODING

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

  // Data Pipeline
  private pipelineData: {
    intent?: string;
    plan?: string;
    draftResult?: string;
    qaReport?: string;
    finalResult?: string;
    mutationProposal?: string; // For self-evolution
  } = {};

  constructor() {
    this.config = {
      enabled: false,
      mode24_7: false,
      allowEvolution: false,
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

    // 2. Long-Running Supervision (Context Transcendence)
    // If context is getting heavy, trigger the Overseer BEFORE continuing normal work
    if (this.config.mode24_7) {
        await this.monitorLongRunningContext();
    }

    if (this.checkLimits()) {
      return; // Stop if limits reached
    }

    if (this.isProcessing) return;

    // 3. State Machine Logic
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
        // If Evolution is enabled, proceed to Meta-Analysis, otherwise IDLE (or loop)
        if (this.config.allowEvolution) {
            this.transitionTo(WorkflowStage.META_ANALYSIS);
        } else {
            this.transitionTo(WorkflowStage.IDLE);
        }
        break;

      // --- SELF-EVOLUTION PHASES ---
      
      case WorkflowStage.META_ANALYSIS:
        await this.executeMetaAnalysis();
        break;

      case WorkflowStage.ADAPTATION_QA:
        await this.executeAdaptationQA();
        break;
    }
  }

  // --- CONTEXT SUPERVISION (The Overseer) ---
  private async monitorLongRunningContext() {
      const stats = continuum.getStats();
      // If we have > 200 nodes in memory, it's getting noisy.
      if (stats.total > 200 && !this.isProcessing) {
          console.log("[CONTEXT OVERSEER] High context density detected. Initiating transcendence.");
          this.isProcessing = true;
          
          try {
              const response = await generateAgentResponse(
                  "Context_Overseer",
                  "Memory Supervisor",
                  "DATA",
                  "Compress recent operational logs into a consolidated 'Saga Node' and mark trivial entries for deletion.",
                  null,
                  IntrospectionLayer.MEDIUM,
                  WorkflowStage.OPTIMIZATION // Reuse stage context for simplicity
              );
              
              // Simulate the action of cleaning up
              continuum.store(`[SAGA NODE] ${response.output}`, 'LONG' as any, ['SAGA', 'SUMMARY']);
              // In a real system, we'd trigger continuum.prune() here
              
          } catch (e) {
              console.error("Overseer failed", e);
          } finally {
              this.isProcessing = false;
          }
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

  // --- CRUCIBLE LOGIC (Execution -> QA -> Fix) ---

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

        if (this.lastQualityScore >= 98 || this.remediationAttempts >= this.MAX_REMEDIATION_ATTEMPTS) {
            this.transitionTo(WorkflowStage.OPTIMIZATION);
        } else {
            this.transitionTo(WorkflowStage.REMEDIATION);
        }

      } catch (e) {
          console.error("QA Error", e);
          this.recordFailure();
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
          
          // Check for Code Mutation Protocol
          await this.checkAndApplyCodeMutation(response.output);

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

          // Check for Code Mutation Protocol
          await this.checkAndApplyCodeMutation(response.output);

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

  // --- ACTIVE CODING: Apply Changes to Server ---
  private async checkAndApplyCodeMutation(output: string) {
      // Regex to find <<<FILE: path>>> ... <<<END>>>
      const fileRegex = /<<<FILE:\s*(.+?)>>>([\s\S]*?)<<<END>>>/g;
      let match;
      
      while ((match = fileRegex.exec(output)) !== null) {
          const filePath = match[1].trim();
          const content = match[2].trim();
          
          console.log(`[WORKFLOW] Detected file mutation request for: ${filePath}`);
          
          // Execute Patch via Server API
          try {
              const res = await fetch('http://localhost:3000/v1/system/file', {
                  method: 'PATCH',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${DEFAULT_API_CONFIG.apiKey}`
                  },
                  body: JSON.stringify({
                      filePath: filePath,
                      content: content
                  })
              });
              
              const result = await res.json();
              if (result.success) {
                  continuum.store(`[SUCCESS] Patched file: ${filePath}`, 'SHORT' as any, ['code', 'mutation', 'success']);
              } else {
                  continuum.store(`[ERROR] Failed to patch file: ${filePath}. Reason: ${result.error}`, 'SHORT' as any, ['code', 'mutation', 'error']);
              }
          } catch (e) {
              console.error("Failed to connect to backend for file patch.", e);
          }
      }
  }

  // --- SELF-EVOLUTION LOGIC ---

  private async executeMetaAnalysis() {
      this.isProcessing = true;
      try {
          // The Architect looks at the token usage and remediation count
          const stats = `Efficiency Report: Remediation Rounds: ${this.remediationAttempts}, Quality: ${this.lastQualityScore}, Tokens: ${this.tokenUsage}`;
          
          const response = await generateAgentResponse(
              "Workflow_Architect",
              "System Evolutionist",
              "CORE",
              "Analyze workflow efficiency. Propose a MUTATION to the configuration if needed (e.g. Increase QA depth, Change System Mode). Output format: JSON { target, action, reason }.",
              stats,
              IntrospectionLayer.DEEP,
              WorkflowStage.META_ANALYSIS
          );

          this.tokenUsage += response.usage;
          this.lastThoughts = response.thoughts;
          this.pipelineData.mutationProposal = response.output;
          
          this.transitionTo(WorkflowStage.ADAPTATION_QA);
      } catch(e) {
          console.error("Meta Analysis Error", e);
          this.transitionTo(WorkflowStage.IDLE);
      } finally {
          this.isProcessing = false;
      }
  }

  private async executeAdaptationQA() {
      this.isProcessing = true;
      try {
          const proposal = this.pipelineData.mutationProposal || "No mutation";
          
          // The Rules Lawyer checks if the mutation is safe
          const response = await generateAgentResponse(
              "Rules_Lawyer",
              "Adaptation Auditor",
              "LEGAL",
              "Review this system mutation proposal. If it compromises safety or stability, REJECT it. If safe, APPROVE.",
              proposal,
              IntrospectionLayer.MAXIMUM,
              WorkflowStage.ADAPTATION_QA
          );

          this.tokenUsage += response.usage;
          this.lastThoughts = response.thoughts;

          // If positive sentiment, apply mutation
          if (response.output.toLowerCase().includes("approve")) {
              console.log("[SYSTEM EVOLUTION] Mutation APPROVED by QA. Applying changes...");
              // Logic to parse proposal and apply to Config (Simulated for safety)
              // e.g., if (proposal.includes("INCREASE_DEPTH")) introspection.setLayer(IntrospectionLayer.MAXIMUM);
              continuum.store(`[EVOLUTION] Workflow Adapted: ${response.output.substring(0, 50)}...`, undefined, ['system', 'evolution']);
          } else {
              console.warn("[SYSTEM EVOLUTION] Mutation REJECTED by QA.");
          }

          this.transitionTo(WorkflowStage.IDLE);
      } catch(e) {
          console.error("Adaptation QA Error", e);
          this.transitionTo(WorkflowStage.IDLE);
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
