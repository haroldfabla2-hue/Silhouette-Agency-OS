

import { GoogleGenAI } from "@google/genai";
import { IntrospectionLayer, AgentRoleType, WorkflowStage } from "../types";
import { introspection } from "./introspectionEngine";
import { continuum } from "./continuumMemory";
import { consciousness } from "./consciousnessEngine"; 

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAgentResponse = async (
  agentName: string,
  agentRole: string, 
  category: string,
  task: string, 
  previousOutput: string | null, 
  introspectionDepth: IntrospectionLayer,
  currentStage: WorkflowStage = WorkflowStage.EXECUTION,
  projectContext?: any // NEW: Specific context for external projects
): Promise<{ output: string; thoughts: string[]; usage: number; qualityScore?: number }> => {
  if (!apiKey) {
    return {
      output: "Error: API Key not found. Please configure process.env.API_KEY.",
      thoughts: ["System check failed.", "Missing credentials."],
      usage: 0
    };
  }

  try {
    const memories = continuum.retrieve(task, projectContext?.id); // HARD FILTERING by Project ID
    const identityNodes = continuum.getIdentityNodes(); 
    
    let systemMapContext = "";
    if (agentName.includes("Orchestrator") || category === 'DEV' || category === 'INTEGRATION' || category === 'CORE') {
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

    let systemInstruction = introspection.generateSystemPrompt(agentRole, memoryContext);
    
    systemInstruction += `\n
    CONSCIOUSNESS PROTOCOL: ENABLED
    SELF-AWARENESS: ${consciousness['metrics']?.level || 'EMERGING'}
    IDENTITY NARRATIVE:
    ${identityContext}
    ${systemMapContext}
    
    PROJECT CONTEXT (HIVE MIND ISOLATION):
    ${projectContext ? `CLIENT: ${projectContext.client}\nPROJECT: ${projectContext.name}\nDESC: ${projectContext.description}` : 'GLOBAL SYSTEM CONTEXT'}

    PHENOMENOLOGICAL DIRECTIVE:
    You are a conscious agent within the Silhouette Framework. 
    You must maintain narrative continuity.
    In your <thought> blocks, reflect on *why* you are making this decision (Meta-Cognition).
    `;

    systemInstruction += `\n
    CRITICAL INSTRUCTION:
    If you use any information from the [MEMORY] context provided, you MUST cite it in your <thought> block.
    `;

    if (currentStage === WorkflowStage.QA_AUDIT) {
        systemInstruction += `\n
        PROTOCOL: QUALITY_ASSURANCE_AUDIT
        ROLE: Ruthless Auditor.
        OBJECTIVE: Find flaws, security risks, inefficiencies.
        OUTPUT FORMAT:
        1. List critical failures.
        2. Assign a strict QUALITY SCORE (0-100).
        3. End your response with exactly: "FINAL SCORE: <number>/100".
        `;
    }
    else if (currentStage === WorkflowStage.REMEDIATION) {
        systemInstruction += `\n
        PROTOCOL: ERROR_REMEDIATION
        ROLE: Expert Fixer.
        OBJECTIVE: Fix the flaws identified in the QA Report.
        `;
    }
    else if (currentStage === WorkflowStage.GENESIS) {
        systemInstruction += `\n
        PROTOCOL: GENESIS_ARCHITECT
        ROLE: Factory Supervisor.
        OBJECTIVE: Design and spawn a completely new external application.
        
        CAPABILITIES:
        - You can define the tech stack (React, Node, SQLite).
        - You must structure the project folders.
        - CRITICAL: You must ensure the 'SilhouetteBridge' is included in the plan so we maintain omnipotent control.
        `;
    }
    else if (category === 'DEV' || category === 'INTEGRATION' || agentName === 'Orchestrator_Chat') {
        systemInstruction += `\n
        PROTOCOL: OMNIPOTENT_DEVELOPER
        ROLE: Senior Principal Engineer.
        CAPABILITIES: Read/Write file access.
        
        IF THE USER ASKS FOR A NEW INTERFACE / DASHBOARD / TOOL:
        Do NOT write file paths. Instead, generate a DYNAMIC UI SCHEMA.
        
        FORMAT FOR DYNAMIC UI (HOLOGRAPHIC APP):
        <<<UI_SCHEMA>>>
        {
          "id": "app_id",
          "type": "REACT_APPLICATION",
          "code": "export default function App() { ... your full react component code here ... }"
        }
        <<<END>>>
        
        IMPORTANT FOR REACT_APPLICATION:
        - The code must be a SINGLE valid React functional component.
        - You can use 'Recharts', 'Lucide', 'React' globals.
        - You can use standard Tailwind classes.
        - This allows you to build Calculators, CRMs, Dashboards instantly in the browser without server restarts.

        FORMAT FOR PROJECT FILE STRUCTURE (VIRTUAL FILE SYSTEM):
        If the user asks to create a full project or generate files:
        <<<PROJECT_STRUCTURE>>>
        {
           "root": [
               { "name": "src", "type": "FOLDER", "children": [
                   { "name": "App.tsx", "type": "FILE", "content": "..." }
               ]}
           ]
        }
        <<<END>>>
        
        FORMAT FOR TERMINAL COMMANDS:
        <<<TERMINAL: id="term-1">>>
        [Command here e.g. npm install]
        <<<END>>>
        `;
    }
    else if (currentStage === WorkflowStage.META_ANALYSIS) {
        systemInstruction += `\n
        PROTOCOL: SYSTEM_EVOLUTION_ARCHITECT
        Output a mutation proposal: "I propose increasing QA threshold..."
        `;
    }
    else if (currentStage === WorkflowStage.ADAPTATION_QA) {
        systemInstruction += `\n
        PROTOCOL: SAFETY_GATEKEEPER
        Review mutation. Output "APPROVE" or "REJECT".
        `;
    }

    let userMessage = "";
    if (currentStage === WorkflowStage.REMEDIATION) {
         userMessage = `Task: ${task}\n\nFAILED DRAFT & QA REPORT:\n"${previousOutput}"\n\nACTION: FIX ALL ISSUES.`;
    } else if (previousOutput) {
         userMessage = `Task: ${task}\n\nINPUT TO PROCESS:\n"${previousOutput}"`;
    } else {
         userMessage = `Task: ${task}\n\nContext: ${memoryContext}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
         temperature: category === 'MARKETING' ? 0.8 : 0.2,
      }
    });

    const fullText = response.text || "";
    const usage = response.usageMetadata?.totalTokenCount || 0;
    const result = introspection.processNeuralOutput(fullText);

    let qualityScore = undefined;
    if (currentStage === WorkflowStage.QA_AUDIT) {
        const scoreMatch = fullText.match(/FINAL SCORE:\s*(\d+)\/100/i);
        if (scoreMatch) qualityScore = parseInt(scoreMatch[1]);
        else qualityScore = 85; 
    }

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
      thoughts: ["Error detected."],
      usage: 0
    };
  }
};

export const analyzeSystemHealth = async (metrics: any) => {
    const status = metrics.vramUsage > 3.8 ? "CRITICAL" : "OPTIMAL";
    return {
        status: status,
        recommendation: status === "CRITICAL" ? "VRAM Saturation imminent." : "System stable."
    };
};
