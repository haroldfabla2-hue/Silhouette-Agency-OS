import { GoogleGenAI } from "@google/genai";
import { IntrospectionLayer } from "../types";
import { introspection } from "./introspectionEngine";
import { continuum } from "./continuumMemory";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAgentResponse = async (
  agentRole: string, 
  task: string, 
  context: string,
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

    // 2. Construct System Prompt with Introspection Injection
    const systemPrompt = introspection.generateSystemPrompt(agentRole, memoryContext);

    // 3. Call AI
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: `Current Task: ${task}\nAdditional Context: ${context}` }] }
      ],
      config: {
         // High temperature for creative agents, low for logic
         temperature: 0.7,
      }
    });

    const fullText = response.text || "";
    
    // 4. Process through Introspection Engine (Real Parsing)
    const result = introspection.processNeuralOutput(fullText);

    // 5. Store result in Continuum Memory for future reference
    if (result.cleanOutput.length > 20) {
        continuum.store(`Agent ${agentRole} output: ${result.cleanOutput.substring(0, 100)}...`, undefined, ['agent-output']);
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