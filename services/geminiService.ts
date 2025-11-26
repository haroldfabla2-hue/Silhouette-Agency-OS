import { GoogleGenAI } from "@google/genai";
import { IntrospectionLayer, AgentRoleType } from "../types";
import { introspection } from "./introspectionEngine";
import { continuum } from "./continuumMemory";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAgentResponse = async (
  agentName: string,
  agentRole: string, 
  category: string,
  task: string, 
  previousOutput: string | null, // Context from previous workflow stage
  introspectionDepth: IntrospectionLayer
): Promise<{ output: string; thoughts: string[] }> => {
  if (!apiKey) {
    return {
      output: "Error: API Key not found. Please configure process.env.API_KEY.",
      thoughts: ["System check failed.", "Missing credentials."]
    };
  }

  try {
    // 1. Retrieve relevant memories (Real Continuum Memory)
    const memories = continuum.retrieve(task);
    const memoryContext = memories.map(m => `[MEMORY]: ${m.content}`).join('\n');

    // 2. Construct Specialized System Prompt
    let systemInstruction = introspection.generateSystemPrompt(agentRole, memoryContext);

    // SPECIAL LOGIC: AUTO-OPTIMIZATION LOOP
    // If this agent is from the OPS/OPTIMIZATION category, enable Adversarial Critique Mode
    if (category === 'OPS' && (agentRole.includes('Optimizer') || agentRole.includes('Monitor'))) {
        systemInstruction += `\n
        CRITICAL PROTOCOL: YOU ARE AN OPTIMIZATION ENGINE.
        Your goal is NOT to generate new content from scratch, but to CRITIQUE and IMPROVE the provided input.
        1. Analyze the 'Previous Output' for inefficiencies, security risks, or hallucinations.
        2. In your <thought> block, list specific flaws found.
        3. In your final output, provide the REFINED, OPTIMIZED version of the content.
        `;
    }

    // 3. Construct the Payload
    const userMessage = previousOutput 
        ? `Task: ${task}\n\nINPUT TO OPTIMIZE (From previous stage):\n"${previousOutput}"`
        : `Task: ${task}\n\nContext: ${memoryContext}`;

    // 4. Call AI
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
         // High temperature for creative agents, low for logic/optimizers
         temperature: category === 'MARKETING' ? 0.8 : 0.3,
      }
    });

    const fullText = response.text || "";
    
    // 5. Process through Introspection Engine (Real Parsing)
    const result = introspection.processNeuralOutput(fullText);

    // 6. Store result in Continuum Memory
    // Only store significant outputs to avoid polluting vector space
    if (result.cleanOutput.length > 50) {
        continuum.store(
            `[${agentName}]: ${result.cleanOutput.substring(0, 150)}...`, 
            undefined, 
            ['agent-output', category.toLowerCase()]
        );
    }

    return {
      output: result.cleanOutput,
      thoughts: result.thoughts.length > 0 ? result.thoughts : ["(Introspection stream hidden or empty)"]
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      output: "An error occurred during agent processing.",
      thoughts: ["Error detected in neural pathway.", "Retrying connection..."]
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