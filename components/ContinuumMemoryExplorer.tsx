
import React, { useState, useEffect } from 'react';
import { Zap, Clock, HardDrive, Archive, Database, Activity, RefreshCw, Lock, Trash2, Search } from 'lucide-react';
import { continuum } from '../services/continuumMemory';
import { MemoryNode, MemoryTier } from '../types';

const ContinuumMemoryExplorer: React.FC = () => {
  const [data, setData] = useState<Record<MemoryTier, MemoryNode[]>>({
    [MemoryTier.ULTRA_SHORT]: [],
    [MemoryTier.SHORT]: [],
    [MemoryTier.MEDIUM]: [],
    [MemoryTier.LONG]: [],
    [MemoryTier.DEEP]: []
  });

  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const refresh = () => {
        setData(continuum.getAllNodesRaw());
        setStats(continuum.getStats());
    };
    refresh();
    const interval = setInterval(refresh, 500); // Fast poll for decay animation
    return () => clearInterval(interval);
  }, []);

  const TierColumn: React.FC<{ tier: MemoryTier, title: string, icon: any, color: string, nodes: MemoryNode[] }> = ({ tier, title, icon: Icon, color, nodes }) => (
      <div className={`flex-1 min-w-[200px] flex flex-col bg-slate-900/30 border-r border-slate-800 last:border-r-0`}>
          <div className={`p-4 border-b border-${color}-500/30 bg-${color}-900/10`}>
              <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className={`text-${color}-400`} />
                  <h3 className={`text-xs font-bold text-${color}-100 uppercase`}>{title}</h3>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Count: {nodes.length}</span>
                  <span>Size: ~{(JSON.stringify(nodes).length / 1024).toFixed(1)}KB</span>
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar bg-black/20">
              {nodes.length === 0 && (
                  <div className="text-center mt-10 opacity-20">
                      <Icon size={32} className="mx-auto mb-2" />
                      <span className="text-[10px]">EMPTY</span>
                  </div>
              )}
              {nodes.map(node => (
                  <div key={node.id} className="bg-slate-900 border border-slate-800 p-2 rounded relative group hover:border-cyan-500/50 transition-colors">
                      {/* Health Bar (Ebbinghaus Decay) */}
                      <div className="absolute bottom-0 left-0 h-1 bg-slate-800 w-full rounded-b overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${node.decayHealth < 30 ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{ width: `${node.decayHealth}%` }}
                          />
                      </div>

                      {/* Header */}
                      <div className="flex justify-between items-start mb-1">
                          <div className="flex gap-1">
                              {node.tags.includes('SACRED') && <Lock size={10} className="text-yellow-500" />}
                              <span className="text-[9px] font-mono text-slate-500">ID:{node.id.substring(0,4)}</span>
                          </div>
                          <span className="text-[9px] text-slate-600">{node.accessCount} Hits</span>
                      </div>

                      {/* Content */}
                      <p className={`text-[10px] leading-tight font-mono mb-2 ${node.compressionLevel > 0 ? 'text-slate-500 italic' : 'text-slate-300'}`}>
                          {node.content}
                      </p>

                      {/* Compression Indicator */}
                      {node.compressionLevel > 0 && (
                          <div className="absolute top-2 right-2 px-1 py-0.5 bg-slate-800 rounded text-[8px] text-cyan-400 border border-cyan-900">
                              ZIP L{node.compressionLevel}
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>
  );

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-4">
        {/* Header Stats */}
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
                    <Database size={24} />
                </div>
                <div>
                    <h2 className="text-white font-bold text-lg">Continuum Memory 5-Tier Architecture</h2>
                    <p className="text-xs text-slate-400">Real-time Ebbinghaus Decay & Smart Compression Engine</p>
                </div>
            </div>
            <div className="flex gap-6 text-center">
                <div>
                    <p className="text-[10px] text-slate-500 uppercase">Total Nodes</p>
                    <p className="text-xl font-mono text-white">{stats.total || 0}</p>
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 uppercase">Avg Health</p>
                    <p className={`text-xl font-mono ${(stats.avgHealth || 0) < 50 ? 'text-red-400' : 'text-green-400'}`}>
                        {(stats.avgHealth || 0).toFixed(1)}%
                    </p>
                </div>
            </div>
        </div>

        {/* 5-Tier Columns */}
        <div className="flex-1 glass-panel rounded-xl overflow-hidden flex border-x border-slate-800">
            <TierColumn 
                tier={MemoryTier.ULTRA_SHORT} 
                title="Ultra-Short (RAM)" 
                icon={Zap} 
                color="yellow" 
                nodes={data[MemoryTier.ULTRA_SHORT]} 
            />
            <TierColumn 
                tier={MemoryTier.SHORT} 
                title="Short (Session)" 
                icon={Clock} 
                color="blue" 
                nodes={data[MemoryTier.SHORT]} 
            />
            <TierColumn 
                tier={MemoryTier.MEDIUM} 
                title="Medium (Local)" 
                icon={HardDrive} 
                color="purple" 
                nodes={data[MemoryTier.MEDIUM]} 
            />
            <TierColumn 
                tier={MemoryTier.LONG} 
                title="Long (Compressed)" 
                icon={Archive} 
                color="orange" 
                nodes={data[MemoryTier.LONG]} 
            />
            <TierColumn 
                tier={MemoryTier.DEEP} 
                title="Deep (Vector)" 
                icon={Database} 
                color="green" 
                nodes={data[MemoryTier.DEEP]} 
            />
        </div>
    </div>
  );
};

export default ContinuumMemoryExplorer;
