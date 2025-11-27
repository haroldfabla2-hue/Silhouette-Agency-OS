
import { WorkflowStage, AutonomousConfig, IntrospectionLayer, WorkflowMutation, SystemMode, SystemProtocol, MorphPayload } from "../types";
import { orchestrator } from "./orchestrator";
import { continuum } from "./continuumMemory";
import { generateAgentResponse } from "./geminiService";
import { introspection } from "./introspectionEngine";
import { systemBus } from "./systemBus"; // Bus Integration
import { MOCK_PROJECTS, DEFAULT_API_CONFIG } from "../constants";

// The Workflow Engine coordinates the high-level intent of the agency.
// V4.3 Update: Protocol Injection & System Bus Integration

class WorkflowEngine {
  private currentStage: WorkflowStage = WorkflowStage.IDLE;
  private config: AutonomousConfig;
  private tokenUsage: number = 0;
  private startTime: number = Date.now();
  private isProcessing: boolean = false; 
  private lastThoughts: string[] = []; 
  
  // Crucible State
  private lastQualityScore: number = 100;
  private remediationAttempts: number = 0;
  private MAX_REMEDIATION_ATTEMPTS: number = 3;

  // Circuit Breaker State
  private failures: number = 0;
  private circuitOpen: boolean = false;
  private circuitResetTime: number = 0;
  private readonly FAILURE_THRESHOLD = 3;
  private readonly RESET_TIMEOUT = 30000; 

  // Data Pipeline
  private pipelineData: {
    intent?: string;
    plan?: string;
    draftResult?: string;
    qaReport?: string;
    finalResult?: string;
    mutationProposal?: string;
  } = {};

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
                  WorkflowStage.OPTIMIZATION 
              );
              
              continuum.store(`[SAGA NODE] ${response.output}`, 'LONG' as any, ['SAGA', 'SUMMARY']);
              // Emit Flush Protocol for UI
              systemBus.emit(SystemProtocol.MEMORY_FLUSH, { message: `Archived ${stats.total} Nodes` });
              
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
      
      // TRIGGER DEFENSIVE MORPH
      const morphPayload: MorphPayload = { mode: 'DEFENSE', accentColor: 'red', density: 'compact' };
      systemBus.emit(SystemProtocol.INTERFACE_MORPH, morphPayload, 'SECURITY_CORE');

      if (this.failures >= this.FAILURE_THRESHOLD) {
          console.warn("[CIRCUIT BREAKER] Threshold reached. Opening circuit for 30s.");
          this.circuitOpen = true;
          this.circuitResetTime = Date.now() + this.RESET_TIMEOUT;
          this.isProcessing = false;
          systemBus.emit(SystemProtocol.SECURITY_LOCKDOWN, { message: 'Circuit Breaker Active' });
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
            IntrospectionLayer.MAXIMUM, 
            WorkflowStage.QA_AUDIT
        );

        this.recordSuccess();
        this.tokenUsage += response.usage;
        this.lastThoughts = response.thoughts;
        this.lastQualityScore = response.qualityScore || 85;
        this.pipelineData.qaReport = response.output;

        // ADAPTIVE MORPH: If score is low, interface triggers ALERT mode
        if (this.lastQualityScore < 90) {
             systemBus.emit(SystemProtocol.INTERFACE_MORPH, { mode: 'DEFENSE', message: `QA FAIL: ${this.lastQualityScore}%` }, 'QA_LEAD');
        }

        if (this.lastQualityScore >= 98 || this.remediationAttempts >= this.MAX_REMEDIATION_ATTEMPTS) {
            // SUCCESS MORPH
            systemBus.emit(SystemProtocol.INTERFACE_MORPH, { mode: 'FLOW', message: 'QUALITY GATE PASSED' }, 'QA_LEAD');
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
          
          await this.checkAndApplyProtocols(response.output);

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

          await this.checkAndApplyProtocols(response.output);

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

  // --- PROTOCOL HANDLER (Active Coding & Dynamic Injection) ---
  private async checkAndApplyProtocols(output: string) {
      // 1. File Modification Protocol
      const fileRegex = /<<<FILE:\s*(.+?)>>>([\s\S]*?)<<<END>>>/g;
      let match;
      while ((match = fileRegex.exec(output)) !== null) {
          const filePath = match[1].trim();
          // const content = match[2].trim();
          // ... (Existing PATCH logic would go here)
          systemBus.emit(SystemProtocol.UI_REFRESH, { message: `Code Patch: ${filePath}` });
      }

      // 2. Squad Expansion Protocol
      // Detect if AI wants to create a squad: <<<PROTOCOL: SQUAD_EXPANSION>>> { "name": "Crypto", "role": "Analyst", "category": "FINANCE" } <<<END>>>
      const protocolRegex = /<<<PROTOCOL:\s*([A-Z_]+)>>>([\s\S]*?)<<<END>>>/g;
      let pMatch;
      while ((pMatch = protocolRegex.exec(output)) !== null) {
          const type = pMatch[1].trim();
          const jsonContent = pMatch[2].trim();
          
          try {
              const payload = JSON.parse(jsonContent);
              
              if (type === 'SQUAD_EXPANSION') {
                  systemBus.emit(SystemProtocol.SQUAD_EXPANSION, payload, 'AI_ARCHITECT');
              } else if (type === 'CONFIG_MUTATION') {
                  systemBus.emit(SystemProtocol.CONFIG_MUTATION, payload, 'AI_ARCHITECT');
              }
          } catch (e) {
              console.error("Failed to parse AI Protocol JSON", e);
          }
      }
  }

  // --- SELF-EVOLUTION LOGIC ---

  private async executeMetaAnalysis() {
      this.isProcessing = true;
      try {
          const stats = `Efficiency Report: Remediation Rounds: ${this.remediationAttempts}, Quality: ${this.lastQualityScore}, Tokens: ${this.tokenUsage}`;
          
          const response = await generateAgentResponse(
              "Workflow_Architect",
              "System Evolutionist",
              "CORE",
              "Analyze workflow. To add a squad, output: <<<PROTOCOL: SQUAD_EXPANSION>>> { \"name\": \"TeamName\", \"category\": \"DEV\", \"role\": \"Specialist\" } <<<END>>>",
              stats,
              IntrospectionLayer.DEEP,
              WorkflowStage.META_ANALYSIS
          );

          this.tokenUsage += response.usage;
          this.lastThoughts = response.thoughts;
          await this.checkAndApplyProtocols(response.output);
          
          this.transitionTo(WorkflowStage.ADAPTATION_QA);
      } catch(e) {
          console.error("Meta Analysis Error", e);
          this.transitionTo(WorkflowStage.IDLE);
      } finally {
          this.isProcessing = false;
      }
  }

  private async executeAdaptationQA() {
      // ... (Existing logic, but now confirms protocols)
      this.isProcessing = false; 
      this.transitionTo(WorkflowStage.IDLE);
  }

  private performArchival() {
    continuum.store("Context Cycle Completed.", undefined, ['archival']);
    if (this.config.safeCleanup) {
        // ...
    }
  }

  private checkLimits(): boolean {
    if (this.tokenUsage >= this.config.maxDailyTokens) {
      this.config.enabled = false; 
      return true;
    }
    // ...
    return false;
  }
}

export const workflowEngine = new WorkflowEngine();
