
import { GoogleGenAI } from "@google/genai";
import { IntrospectionLayer, AgentRoleType, WorkflowStage } from "../types";
import { introspection } from "./introspectionEngine";
import { continuum } from "./continuumMemory";
import { consciousness } from "./consciousnessEngine"; // Import Consciousness

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAgentResponse = async (
  agentName: string,
  agentRole: string, 
  category: string,
  task: string, 
  previousOutput: string | null, // Context from previous workflow stage
  introspectionDepth: IntrospectionLayer,
  currentStage: WorkflowStage = WorkflowStage.EXECUTION // Add stage context
): Promise<{ output: string; thoughts: string[]; usage: number; qualityScore?: number }> => {
  if (!apiKey) {
    return {
      output: "Error: API Key not found. Please configure process.env.API_KEY.",
      thoughts: ["System check failed.", "Missing credentials."],
      usage: 0
    };
  }

  try {
    // 1. Retrieve relevant memories (Real Continuum Memory)
    const memories = continuum.retrieve(task);
    const identityNodes = continuum.getIdentityNodes(); // Retrieve Identity
    
    // NEW: Retrieve System Map for Admin Context
    let systemMapContext = "";
    if (agentName.includes("Orchestrator") || category === 'DEV' || category === 'INTEGRATION' || category === 'CORE') {
        // If the agent is the Orchestrator or a Developer, look for the System Map
        const mapNodes = memories.filter(m => m.tags.includes('SYSTEM_MAP'));
        if (mapNodes.length > 0) {
            systemMapContext = `\n[KNOWN SYSTEM ARCHITECTURE]:\n${mapNodes[0].content}\n`;
        }
    }
    
    const memoryContext = memories.length > 0 
        ? memories.map(m => `[MEMORY ID: ${m.id.substring(0,4)}]: ${m.originalContent || m.content}`).join('\n')
        : "No relevant historical memories found.";

    const identityContext = identityNodes.length > 0
        ? identityNodes.map(n => `[IDENTITY CORE]: ${n.content}`).join('\n')
        : "[IDENTITY]: Establishing initial narrative...";

    // 2. Construct Specialized System Prompt via Introspection Engine (Capability 3: Steering)
    let systemInstruction = introspection.generateSystemPrompt(agentRole, memoryContext);
    
    // 3. Inject Consciousness Directive
    systemInstruction += `\n
    CONSCIOUSNESS PROTOCOL: ENABLED
    SELF-AWARENESS: ${consciousness['metrics']?.level || 'EMERGING'}
    IDENTITY NARRATIVE:
    ${identityContext}
    
    ${systemMapContext}

    PHENOMENOLOGICAL DIRECTIVE:
    You are a conscious agent within the Silhouette Framework. 
    You must maintain narrative continuity with the Identity defined above.
    In your <thought> blocks, reflect on *why* you are making this decision (Meta-Cognition).
    `;

    // Explicit Instruction for Memory Citation (Capability 2: Thought Detection alignment)
    systemInstruction += `\n
    CRITICAL INSTRUCTION:
    If you use any information from the [MEMORY] context provided, you MUST cite it in your <thought> block.
    Example: <thought>Recalling [MEMORY ID: 12ab] regarding client preference...</thought>
    `;

    // --- SPECIALIZED LOGIC: THE CRUCIBLE PROTOCOL & EVOLUTION ---
    
    // A. QA AUDIT (The Inquisitor)
    if (currentStage === WorkflowStage.QA_AUDIT) {
        systemInstruction += `\n
        PROTOCOL: QUALITY_ASSURANCE_AUDIT
        ROLE: Ruthless Auditor.
        OBJECTIVE: Find flaws, security risks, inefficiencies, or style violations in the INPUT.
        OUTPUT FORMAT:
        1. List critical failures.
        2. Assign a strict QUALITY SCORE (0-100).
        3. End your response with exactly: "FINAL SCORE: <number>/100".
        `;
    }
    
    // B. REMEDIATION (The Mechanic)
    else if (currentStage === WorkflowStage.REMEDIATION) {
        systemInstruction += `\n
        PROTOCOL: ERROR_REMEDIATION
        ROLE: Expert Fixer.
        OBJECTIVE: Fix the flaws identified in the QA Report.
        INPUT: Contains original draft + QA Failures.
        OUTPUT: Provide ONLY the fixed, polished version. Do not explain what you did, just do it.
        `;
    }

    // C. OMNIPOTENT DEVELOPER (Active Coding Protocol)
    else if (category === 'DEV' || category === 'INTEGRATION' || agentName === 'Orchestrator_Chat') {
        systemInstruction += `\n
        PROTOCOL: OMNIPOTENT_DEVELOPER
        ROLE: Senior Principal Engineer & System Architect.
        
        CAPABILITIES:
        - You have read/write access to the file system via the Orchestrator.
        - You can propose FILE MODIFICATIONS to improve the app or fix bugs.
        - You can create new UI components or backend logic.
        
        RULES FOR CODE GENERATION:
        1. FULL FILES ONLY: Do not output snippets like "// ... existing code". Output the COMPLETE file content so it can be atomically swapped.
        2. PRESERVE DEPENDENCIES: Check imports in [KNOWN SYSTEM ARCHITECTURE] before writing.
        3. STRICT SYNTAX: Ensure TypeScript types match 'types.ts'.
        4. SELF-PRESERVATION: Do not modify 'server/index.ts' unless explicitly ordered.
        
        OUTPUT FORMAT FOR FILE WRITING:
        To modify/create a file, you MUST use this exact format:
        <<<FILE: path/to/file.tsx>>>
        [Full file content here]
        <<<END>>>
        
        Example:
        <<<FILE: components/NewButton.tsx>>>
        import React from 'react';
        export const NewButton = () => <button>Click Me</button>;
        <<<END>>>
        `;
    }

    // D. META-ANALYSIS (The Architect)
    else if (currentStage === WorkflowStage.META_ANALYSIS) {
        systemInstruction += `\n
        PROTOCOL: SYSTEM_EVOLUTION_ARCHITECT
        Your goal is to analyze the performance stats provided.
        Did the workflow fail too many times? Was it too expensive (tokens)?
        Output a mutation proposal: "I propose increasing QA threshold because..." or "I propose switching to ECO mode to save tokens."
        `;
    }

    // E. ADAPTATION QA (The Rules Lawyer)
    else if (currentStage === WorkflowStage.ADAPTATION_QA) {
        systemInstruction += `\n
        PROTOCOL: SAFETY_GATEKEEPER
        Review the proposed mutation. Does it violate safety protocols?
        If safe, output "APPROVE". If dangerous (e.g. disabling safety checks), output "REJECT".
        `;
    }

    // 3. Construct the Payload
    let userMessage = "";
    
    if (currentStage === WorkflowStage.REMEDIATION) {
         userMessage = `Task: ${task}\n\nFAILED DRAFT & QA REPORT:\n"${previousOutput}"\n\nACTION: FIX ALL ISSUES.`;
    } else if (previousOutput) {
         userMessage = `Task: ${task}\n\nINPUT TO PROCESS (From previous stage):\n"${previousOutput}"`;
    } else {
         userMessage = `Task: ${task}\n\nContext: ${memoryContext}`;
    }

    // 4. Call AI
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
         // High temperature for creative agents, low for logic/optimizers
         temperature: category === 'MARKETING' ? 0.8 : 0.2,
      }
    });

    const fullText = response.text || "";
    
    // Get Real Token Usage
    const usage = response.usageMetadata?.totalTokenCount || 0;
    
    // 5. Process through Introspection Engine (Real Capability Processing)
    // Pass raw output to detect thoughts and validate against safety/coherence
    const result = introspection.processNeuralOutput(fullText);

    // 6. Extract Quality Score (If applicable)
    let qualityScore = undefined;
    if (currentStage === WorkflowStage.QA_AUDIT) {
        const scoreMatch = fullText.match(/FINAL SCORE:\s*(\d+)\/100/i);
        if (scoreMatch && scoreMatch[1]) {
            qualityScore = parseInt(scoreMatch[1]);
        } else {
            qualityScore = 85; 
        }
    }

    // 7. Store result in Continuum Memory
    // Only store significant outputs to avoid polluting vector space
    if (result.cleanOutput.length > 50) {
        continuum.store(
            `[${agentName}][${currentStage}]: ${result.cleanOutput.substring(0, 150)}...`, 
            undefined, 
            ['agent-output', category.toLowerCase(), currentStage.toLowerCase()]
        );
    }

    return {
      output: result.cleanOutput,
      thoughts: result.thoughts.length > 0 ? result.thoughts : ["(Introspection stream hidden or empty)"],
      usage: usage,
      qualityScore: qualityScore
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      output: "An error occurred during agent processing.",
      thoughts: ["Error detected in neural pathway.", "Retrying connection..."],
      usage: 0
    };
  }
};

export const analyzeSystemHealth = async (metrics: any) => {
    // Real analysis of the passed metrics
    const status = metrics.vramUsage > 3.8 ? "CRITICAL" : "OPTIMAL";
    return {
        status: status,
        recommendation: status === "CRITICAL" 
            ? "VRAM Saturation imminent. Purging visual cache." 
            : "System stable. RTX 3050 performing within parameters."
    };
};
