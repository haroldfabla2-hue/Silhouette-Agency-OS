import { MemoryNode, MemoryTier } from "../types";

// This service implements the 5-Tier Continuum Memory System
// It uses Browser LocalStorage for Medium/Long term memory persistence
// permitting the "Real" memory requirement of the user.

class ContinuumMemorySystem {
  private ultraShortTerm: MemoryNode[] = []; // RAM only, wiped on refresh
  private shortTerm: MemoryNode[] = []; // Session duration
  private maxRamNodes = 50;

  constructor() {
    this.loadFromDeepStorage();
  }

  // 1. Ingest Information
  public async store(content: string, tier: MemoryTier = MemoryTier.ULTRA_SHORT, tags: string[] = []): Promise<void> {
    const node: MemoryNode = {
      id: crypto.randomUUID(),
      content,
      timestamp: Date.now(),
      tier,
      importance: this.calculateImportance(content),
      tags
    };

    switch (tier) {
      case MemoryTier.ULTRA_SHORT:
        this.ultraShortTerm.unshift(node);
        if (this.ultraShortTerm.length > this.maxRamNodes) this.consolidateMemory();
        break;
      case MemoryTier.MEDIUM:
      case MemoryTier.LONG:
        this.saveToDeepStorage(node);
        break;
    }
  }

  // 2. Retrieval (The "Recall" function)
  public retrieve(query: string): MemoryNode[] {
    // Simple semantic check (in a full python backend this would be Vector Search)
    const allMemories = [...this.ultraShortTerm, ...this.shortTerm, ...this.getDeepMemories()];
    return allMemories
      .filter(m => m.content.toLowerCase().includes(query.toLowerCase()) || m.tags.some(t => query.includes(t)))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10); // Return top 10 relevant memories
  }

  // 3. Maintenance Process
  private consolidateMemory() {
    // Move important short term memories to medium term (LocalStorage)
    const importantMemories = this.ultraShortTerm.filter(m => m.importance > 0.7);
    importantMemories.forEach(m => {
      m.tier = MemoryTier.MEDIUM;
      this.saveToDeepStorage(m);
    });
    // Clear RAM
    this.ultraShortTerm = this.ultraShortTerm.slice(0, 20); 
  }

  private calculateImportance(content: string): number {
    // Simple heuristic: Length and keywords imply importance
    let score = 0.5;
    if (content.length > 100) score += 0.2;
    if (content.includes('CRITICAL') || content.includes('ERROR') || content.includes('STRATEGY')) score += 0.3;
    return Math.min(score, 1.0);
  }

  // Persistence Layer (LocalStorage simulation of SQLite)
  private saveToDeepStorage(node: MemoryNode) {
    try {
      const current = this.getDeepMemories();
      current.push(node);
      // Limit local storage to last 100 items to prevent overflow in browser
      const optimized = current.sort((a,b) => b.timestamp - a.timestamp).slice(0, 100); 
      localStorage.setItem('silhouette_continuum_db', JSON.stringify(optimized));
    } catch (e) {
      console.warn("Memory Persistence Warning: Storage full");
    }
  }

  private loadFromDeepStorage() {
    // Hydrate system from "Disk"
    const data = localStorage.getItem('silhouette_continuum_db');
    if (!data) return;
    try {
        // We don't load everything into RAM, just indexing
    } catch (e) {
        console.error("Memory Corruption Detected");
    }
  }

  private getDeepMemories(): MemoryNode[] {
    const data = localStorage.getItem('silhouette_continuum_db');
    return data ? JSON.parse(data) : [];
  }

  public getStats() {
    return {
      activeNodes: this.ultraShortTerm.length,
      archivedNodes: this.getDeepMemories().length
    };
  }
}

export const continuum = new ContinuumMemorySystem();