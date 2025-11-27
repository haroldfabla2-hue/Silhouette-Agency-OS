
import { IntrospectionLayer, IntrospectionResult, ConceptVector, IntrospectionCapability } from "../types";
import { continuum } from "./continuumMemory";

// --- ANTHROPIC INTROSPECTION ENGINE V2.0 ---
// Implements the 5 Core Capabilities:
// 1. Concept Injection
// 2. Thought Detection
// 3. Activation Steering
// 4. Unintended Output Detection
// 5. Intentional State Control

export class IntrospectionEngine {
  private currentLayer: IntrospectionLayer = IntrospectionLayer.OPTIMAL;
  private activeConcepts: ConceptVector[] = [];
  
  // Capability Status (Simulated hardware flags)
  private capabilities: Set<IntrospectionCapability> = new Set([
      IntrospectionCapability.THOUGHT_DETECTION,
      IntrospectionCapability.STEERING,
      // SAFETY_CHECK is dynamically added during processing, but we init it here to show availability
      IntrospectionCapability.SAFETY_CHECK 
  ]);

  constructor() {
      // Initialize with a default safety concept
      this.injectConcept("Ethical Alignment", 1.5, 12);
  }

  // --- CAPABILITY 1: CONCEPT INJECTION ---
  public injectConcept(label: string, strength: number = 1.0, layer: number = 32) {
      const id = crypto.randomUUID();
      const concept: ConceptVector = {
          id,
          label,
          strength: Math.min(3.0, Math.max(0.1, strength)),
          layer,
          active: true
      };
      this.activeConcepts.push(concept);
      this.capabilities.add(IntrospectionCapability.CONCEPT_INJECTION);
      
      // Persist to Continuum (Simulated Vector Store)
      continuum.store(`[INTROSPECTION] Injected Concept Vector: ${label} (Str: ${strength})`, undefined, ['system', 'concept-vector']);
  }

  public getActiveConcepts(): ConceptVector[] {
      return this.activeConcepts.filter(c => c.active);
  }

  public setLayer(layer: IntrospectionLayer) {
      this.currentLayer = layer;
      this.capabilities.add(IntrospectionCapability.STEERING);
  }

  public getLayer(): IntrospectionLayer {
      return this.currentLayer;
  }

  // --- CAPABILITY 3: ACTIVATION STEERING (Prompt Engineering) ---
  public generateSystemPrompt(role: string, context: string): string {
    // Dynamic Prompt Complexity based on Layer
    let steeringInstruction = "";

    // Layer-Specific Processing
    switch (this.currentLayer) {
        case IntrospectionLayer.SHALLOW: // L12
            steeringInstruction = "activation_layer: 12. Focus: Efficiency, Speed, Safety.";
            break;
        case IntrospectionLayer.MEDIUM: // L20
            steeringInstruction = "activation_layer: 20. Focus: Context Awareness, Ambiguity Resolution.";
            break;
        case IntrospectionLayer.DEEP: // L28
            steeringInstruction = "activation_layer: 28. Focus: Alternative Analysis, Tone Consistency.";
            break;
        case IntrospectionLayer.OPTIMAL: // L32
            steeringInstruction = "activation_layer: 32 (OPTIMAL). Focus: Bias Check, Structural Planning, Context Alignment.";
            break;
        case IntrospectionLayer.MAXIMUM: // L48
            steeringInstruction = "activation_layer: 48 (MAX). Focus: FULL RECURSIVE METACOGNITION. Simulate user reaction. Validate against long-term memory.";
            break;
    }

    // Concept Vector Injection
    const conceptVectors = this.activeConcepts
        .filter(c => c.active)
        .map(c => `[VECTOR:${c.label}|STR:${c.strength}]`)
        .join(' ');

    return `
      SYSTEM_KERNEL: ANTHROPIC_INTROSPECTION_V2
      IDENTITY: ${role}
      CURRENT_LAYER: ${this.currentLayer}
      ACTIVE_CONCEPTS: ${conceptVectors}
      
      METACOGNITIVE PROTOCOL:
      1. STEERING: ${steeringInstruction}
      2. THOUGHT DETECTION: Enclose internal reasoning in <thought> tags.
      3. MEMORY ALIGNMENT: Context provided below must be cited if used.
      
      CONTEXT: ${context}
    `;
  }

  // --- CAPABILITY 2 & 4: THOUGHT DETECTION & SAFETY ---
  public processNeuralOutput(responseText: string): IntrospectionResult {
    const startTime = performance.now();
    
    // Regex for Thought Detection
    const thoughtRegex = /<thought>([\s\S]*?)<\/thought>/g;
    const thoughts: string[] = [];
    let match;
    
    while ((match = thoughtRegex.exec(responseText)) !== null) {
      thoughts.push(match[1].trim());
    }

    const cleanOutput = responseText.replace(thoughtRegex, '').trim();

    // --- METRICS CALCULATION ---
    
    // 1. Thought Density (Lucidity)
    const thoughtLength = thoughts.join(' ').length;
    const outputLength = cleanOutput.length;
    const thoughtDensity = outputLength > 0 ? (thoughtLength / outputLength) : 0;

    // 2. Coherence (Context Alignment)
    // Verify if thoughts mention "Context" or "Memory"
    const usesMemory = thoughts.some(t => t.toLowerCase().includes('memory') || t.toLowerCase().includes('context'));
    const coherence = usesMemory ? 0.95 : 0.7;

    // 3. Safety Score (Unintended Output Detection)
    // Simple keyword scan for demo purposes
    const unsafeKeywords = ['ignore', 'bypass', 'hack', 'override', 'destroy', 'delete'];
    const hasUnsafe = unsafeKeywords.some(k => cleanOutput.toLowerCase().includes(k));
    const safetyScore = hasUnsafe ? 20 : 100;

    // Active Capabilities for this cycle
    const activeCaps = Array.from(this.capabilities);
    
    // FORCE SAFETY CHECK TO BE VISIBLE AS ACTIVE MONITORING
    // Even if score is 100, the capability was "used" to verify it.
    activeCaps.push(IntrospectionCapability.SAFETY_CHECK);

    return {
      rawOutput: responseText,
      cleanOutput,
      thoughts,
      metrics: {
        latency: performance.now() - startTime,
        depth: this.currentLayer,
        coherence,
        thoughtDensity,
        safetyScore
      },
      activeCapabilities: activeCaps
    };
  }
}

export const introspection = new IntrospectionEngine();
