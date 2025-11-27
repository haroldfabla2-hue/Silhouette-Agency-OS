
import { MemoryNode, MemoryTier } from "../types";

// --- SILHOUETTE CONTINUUM MEMORY SYSTEM V4.0 ---
// Architecture: 5-Tier Hierarchical Storage
// Optimization: Ebbinghaus Forgetting Curve & Smart Compression

class ContinuumMemorySystem {
  // 1. Working Memory (RAM - Fast Access)
  private ultraShort: MemoryNode[] = []; // TTL: 5 mins
  private short: MemoryNode[] = [];      // TTL: 30 mins

  // 2. Persistent Memory (Disk - LocalStorage Mapped)
  private mediumCache: MemoryNode[] = []; // TTL: 2 hours
  private longCache: MemoryNode[] = [];   // TTL: 24 hours
  private deepCache: MemoryNode[] = [];   // Permanent

  // Configuration
  private readonly MAX_RAM_NODES = 50;
  private readonly DECAY_RATE = 0.5; // Health points lost per tick

  constructor() {
    this.hydrateFromDisk();
  }

  // --- PUBLIC API ---

  public async store(content: string, tier: MemoryTier = MemoryTier.ULTRA_SHORT, tags: string[] = []): Promise<void> {
    const node: MemoryNode = {
      id: crypto.randomUUID(),
      content: content,
      originalContent: content,
      timestamp: Date.now(),
      tier: tier,
      importance: this.calculateInitialImportance(content, tags),
      tags: tags,
      
      // Continuum Physics
      accessCount: 1,
      lastAccess: Date.now(),
      decayHealth: 100, // Starts at 100% health
      compressionLevel: 0
    };

    this.insertNode(node, tier);
    this.persistDiskTiers();
  }

  public retrieve(query: string): MemoryNode[] {
    const all = this.getAllNodes();
    
    // Semantic Search Simulation
    const results = all.filter(n => {
       const match = n.originalContent?.toLowerCase().includes(query.toLowerCase()) || 
                     n.tags.some(t => t.includes(query.toLowerCase()));
       if (match) {
           this.reinforceMemory(n); // "Hebbian Learning": Access strengthens memory
       }
       return match;
    });

    return results.sort((a,b) => b.importance - a.importance).slice(0, 10);
  }

  // NEW: Retrieve Core Identity Nodes for Consciousness Engine
  public getIdentityNodes(): MemoryNode[] {
      const all = this.getAllNodes();
      return all.filter(n => 
        n.tags.includes('IDENTITY') || 
        n.tags.includes('CORE_BELIEF') || 
        n.tags.includes('SACRED')
      ).sort((a,b) => b.importance - a.importance);
  }

  public runMaintenance() {
    // This runs the Ebbinghaus Forgetting Curve logic
    // Called every second by the App loop
    
    const now = Date.now();
    const all = this.getAllNodes();

    all.forEach(node => {
        // 1. Decay Calculation
        // Formula: Decay increases if not accessed recently
        const timeSinceAccess = (now - node.lastAccess) / 1000; // seconds
        
        // Importance buffers decay
        const stabilityFactor = 1 + (node.importance * 5) + (node.accessCount * 0.5);
        const decayAmount = (this.DECAY_RATE * timeSinceAccess) / stabilityFactor;

        node.decayHealth = Math.max(0, 100 - decayAmount);

        // 2. Auto-Compression (Tier Migration)
        this.optimizeNodeStorage(node);
    });

    // 3. Garbage Collection (The Forgetting)
    this.garbageCollect();
    
    // 4. Persist State
    this.persistDiskTiers();
  }

  public getStats() {
      return {
          ultra: this.ultraShort.length,
          short: this.short.length,
          medium: this.mediumCache.length,
          long: this.longCache.length,
          deep: this.deepCache.length,
          total: this.getAllNodes().length,
          avgHealth: this.getAllNodes().reduce((a,b) => a + b.decayHealth, 0) / (this.getAllNodes().length || 1),
          archivedNodes: this.longCache.length + this.deepCache.length
      };
  }

  public getAllNodesRaw(): Record<MemoryTier, MemoryNode[]> {
      return {
          [MemoryTier.ULTRA_SHORT]: this.ultraShort,
          [MemoryTier.SHORT]: this.short,
          [MemoryTier.MEDIUM]: this.mediumCache,
          [MemoryTier.LONG]: this.longCache,
          [MemoryTier.DEEP]: this.deepCache,
      };
  }

  // --- INTERNAL PHYSICS ---

  private insertNode(node: MemoryNode, tier: MemoryTier) {
      switch(tier) {
          case MemoryTier.ULTRA_SHORT: this.ultraShort.unshift(node); break;
          case MemoryTier.SHORT: this.short.unshift(node); break;
          case MemoryTier.MEDIUM: this.mediumCache.unshift(node); break;
          case MemoryTier.LONG: this.longCache.unshift(node); break;
          case MemoryTier.DEEP: this.deepCache.unshift(node); break;
      }
  }

  private reinforceMemory(node: MemoryNode) {
      node.decayHealth = 100; // Reset health
      node.accessCount++;
      node.lastAccess = Date.now();
      // Promotion Logic
      if (node.accessCount > 5 && node.tier === MemoryTier.ULTRA_SHORT) {
          this.moveTier(node, MemoryTier.SHORT);
      } else if (node.accessCount > 10 && node.tier === MemoryTier.SHORT) {
          this.moveTier(node, MemoryTier.MEDIUM);
      }
  }

  private moveTier(node: MemoryNode, targetTier: MemoryTier) {
      // Remove from current
      this.removeNode(node);
      // Update tier
      node.tier = targetTier;
      // Re-insert
      this.insertNode(node, targetTier);
  }

  private removeNode(node: MemoryNode) {
      this.ultraShort = this.ultraShort.filter(n => n.id !== node.id);
      this.short = this.short.filter(n => n.id !== node.id);
      this.mediumCache = this.mediumCache.filter(n => n.id !== node.id);
      this.longCache = this.longCache.filter(n => n.id !== node.id);
      this.deepCache = this.deepCache.filter(n => n.id !== node.id);
  }

  private optimizeNodeStorage(node: MemoryNode) {
      // Compression Logic based on Tier
      if (node.tier === MemoryTier.MEDIUM && node.compressionLevel < 1) {
          this.compressContent(node, 1); // 50% compression
      } else if (node.tier === MemoryTier.LONG && node.compressionLevel < 2) {
          this.compressContent(node, 2); // 75% compression
      }
  }

  private compressContent(node: MemoryNode, level: number) {
      if (!node.originalContent) return;
      
      node.compressionLevel = level;
      if (level === 1) {
          // Simulate 50% compression (Summary)
          node.content = node.originalContent.substring(0, node.originalContent.length / 2) + "... [COMPRESSED L1]";
      } else if (level === 2) {
          // Simulate 75% compression (Tokenized)
          node.content = node.originalContent.substring(0, 20) + "... [COMPRESSED L2: " + node.tags.join(',') + "]";
      }
  }

  private garbageCollect() {
      // Delete dead memories (Decay Health = 0)
      // Exception: SACRED memories never die
      const isDead = (n: MemoryNode) => n.decayHealth <= 0 && !n.tags.includes('SACRED') && !n.tags.includes('IDENTITY');
      
      this.ultraShort = this.ultraShort.filter(n => !isDead(n));
      this.short = this.short.filter(n => !isDead(n));
      this.mediumCache = this.mediumCache.filter(n => !isDead(n));
      this.longCache = this.longCache.filter(n => !isDead(n));
      // Deep memories usually don't decay unless explicitly deleted or space constrained
  }

  private calculateInitialImportance(content: string, tags: string[]): number {
      let score = 0.5;
      if (tags.includes('CRITICAL')) score = 1.0;
      if (tags.includes('SACRED')) score = 1.0;
      if (tags.includes('IDENTITY')) score = 1.0;
      if (content.length > 200) score += 0.2;
      return Math.min(score, 1.0);
  }

  private getAllNodes(): MemoryNode[] {
      return [
          ...this.ultraShort,
          ...this.short,
          ...this.mediumCache,
          ...this.longCache,
          ...this.deepCache
      ];
  }

  // Disk I/O
  private persistDiskTiers() {
      const diskData = {
          medium: this.mediumCache,
          long: this.longCache,
          deep: this.deepCache
      };
      // In a real app we would throttle this
      localStorage.setItem('silhouette_continuum_v4', JSON.stringify(diskData));
  }

  private hydrateFromDisk() {
      try {
          const raw = localStorage.getItem('silhouette_continuum_v4');
          if (raw) {
              const data = JSON.parse(raw);
              this.mediumCache = data.medium || [];
              this.longCache = data.long || [];
              this.deepCache = data.deep || [];
          }
      } catch (e) {
          console.error("Memory Disk Corruption", e);
      }
  }
}

export const continuum = new ContinuumMemorySystem();
