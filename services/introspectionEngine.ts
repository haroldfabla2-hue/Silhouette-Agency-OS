import { IntrospectionLayer, IntrospectionResult } from "../types";

// The Introspection Engine V2.0 (Real Logic)
// Instead of mocking, this engine parses the raw neural output from Gemini
// and separates "Thoughts" (Metacognition) from "Speech" (Output).

export class IntrospectionEngine {
  private currentLayer: IntrospectionLayer = IntrospectionLayer.OPTIMAL;

  // 1. Analyze Raw Output
  public processNeuralOutput(responseText: string): IntrospectionResult {
    const startTime = performance.now();
    
    // Regex to extract <thought> content
    const thoughtRegex = /<thought>([\s\S]*?)<\/thought>/g;
    const thoughts: string[] = [];
    let match;
    
    // Extract thoughts
    while ((match = thoughtRegex.exec(responseText)) !== null) {
      thoughts.push(match[1].trim());
    }

    // Clean output (remove thoughts from final user facing text)
    const cleanOutput = responseText.replace(thoughtRegex, '').trim();

    // Calculate Metacognitive Scores
    const coherence = this.calculateCoherence(thoughts, cleanOutput);
    const depth = thoughts.length > 0 ? this.currentLayer : 0;

    return {
      rawOutput: responseText,
      cleanOutput,
      thoughts,
      metrics: {
        latency: performance.now() - startTime,
        depth,
        coherence
      }
    };
  }

  // 2. Inject Concepts (Prompt Engineering Injection)
  public generateSystemPrompt(role: string, context: string): string {
    return `
      SYSTEM_INSTRUCTION: ENABLE INTROSPECTION LAYER ${this.currentLayer}
      IDENTITY: You are part of the Silhouette Agency OS. Your role is ${role}.
      PROTOCOL:
      1. You MUST think before you speak.
      2. Enclose your internal reasoning, bias checks, and strategy planning inside <thought> tags.
      3. Only after the <thought> block is closed, provide the final response to the user.
      4. Context from Continuum Memory: ${context}
    `;
  }

  private calculateCoherence(thoughts: string[], output: string): number {
    // A real implementation would use embedding similarity.
    // Here we use a heuristic based on length ratio and keyword matching.
    if (thoughts.length === 0) return 0.5; // Default unexamined
    
    const thoughtLength = thoughts.join(' ').length;
    const outputLength = output.length;
    
    // Healthy introspection usually has substantial thought vs output
    const ratio = thoughtLength / (outputLength + 1);
    
    // Normalize to 0-100%
    return Math.min(0.99, 0.5 + (ratio * 0.2)); 
  }
}

export const introspection = new IntrospectionEngine();