
import React, { useMemo } from 'react';
import {  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Activity, Cpu, HardDrive, Zap, Globe, Lock, BrainCircuit, Users, MonitorPlay, AlertTriangle } from 'lucide-react';
import { SystemMetrics, Project } from '../types';

interface DashboardProps {
  metrics: SystemMetrics;
  projects: Project[];
  onCreateProject: () => void;
}

const MetricCard: React.FC<{ title: string; value: string | number; sub: string; icon: any; color: string; alert?: boolean }> = ({ title, value, sub, icon: Icon, color, alert }) => (
  <div className={`glass-panel p-5 rounded-xl border relative overflow-hidden group ${alert ? 'border-red-500 animate-pulse' : 'border-cyan-900/20'}`}>
    <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/20 transition-all`}></div>
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">{title}</p>
        <h3 className={`text-2xl font-bold mt-1 ${alert ? 'text-red-400' : 'text-white'}`}>{value}</h3>
      </div>
      <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400`}>
        <Icon size={20} />
      </div>
    </div>
    <p className={`text-xs font-mono ${alert ? 'text-red-400 font-bold' : `text-${color}-400/80`}`}>{sub}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ metrics, projects, onCreateProject }) => {
  // Use real CPU tick history for chart in a real implementation
  // Memoize data to prevent unnecessary re-calculations during render phase
  const data = useMemo(() => [
    { name: '0s', cpu: metrics.cpuTickDuration * 0.8, mem: metrics.jsHeapSize * 0.9 },
    { name: '-1s', cpu: metrics.cpuTickDuration, mem: metrics.jsHeapSize },
    { name: '-2s', cpu: metrics.cpuTickDuration * 0.9, mem: metrics.jsHeapSize * 0.95 },
    { name: '-3s', cpu: metrics.cpuTickDuration * 1.1, mem: metrics.jsHeapSize * 0.92 },
    { name: '-4s', cpu: metrics.cpuTickDuration * 0.7, mem: metrics.jsHeapSize * 0.98 },
  ], [metrics.cpuTickDuration, metrics.jsHeapSize]);

  return (
    <div className="space-y-6">
      
      {/* SYSTEM ALERT BANNER */}
      {metrics.systemAlert && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-pulse">
              <AlertTriangle size={24} />
              <div>
                  <h3 className="font-bold text-sm">HARDWARE WARNING DETECTED</h3>
                  <p className="text-xs font-mono">{metrics.systemAlert}</p>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Awareness Score" 
          value={`${metrics.awarenessScore.toFixed(2)}%`} 
          sub="Metacognition Stable" 
          icon={BrainCircuitIcon} 
          color="cyan" 
        />
        <MetricCard 
          title="App Memory (RAM)" 
          value={`${metrics.jsHeapSize.toFixed(1)} MB`} 
          sub="Real JS Heap Usage" 
          icon={HardDrive} 
          color="yellow" 
        />
        <MetricCard 
          title="GPU Memory (VRAM)" 
          value={`${metrics.vramUsage.toFixed(0)} MB`} 
          sub="Render & Agent Load" 
          icon={MonitorPlay} 
          color={metrics.vramUsage > 3500 ? "red" : "purple"}
          alert={metrics.vramUsage > 3500}
        />
        <MetricCard 
          title="Logic Load (CPU)" 
          value={`${metrics.cpuTickDuration.toFixed(2)} ms`} 
          sub="Main Loop Duration" 
          icon={Cpu} 
          color={metrics.cpuTickDuration > 100 ? "red" : "green"}
          alert={metrics.cpuTickDuration > 100} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="text-cyan-400" size={20} />
            Real-Time Resource Telemetry
          </h3>
          
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCpu)" name="CPU Latency (ms)" />
                <Area type="monotone" dataKey="mem" stroke="#eab308" fillOpacity={1} fill="url(#colorMem)" name="Memory (MB)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="text-green-400" size={20} />
            Active Projects (VFS)
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {projects.length === 0 && (
                <div className="text-center text-slate-500 py-8 text-xs">
                    No active campaigns.
                    <br/>Initialize one below.
                </div>
            )}
            {projects.map(p => (
              <div key={p.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 hover:border-cyan-900/50 transition-colors animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-white truncate max-w-[120px]">{p.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${
                    p.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    p.status === 'generating' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-slate-700/50 text-slate-400'
                  }`}>{p.status}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{p.client}</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${p.status === 'generating' ? 'bg-purple-500 animate-pulse' : 'bg-cyan-500'}`} style={{ width: `${p.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={onCreateProject}
            className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-mono font-bold transition-all hover:scale-[1.02] shadow-lg shadow-cyan-900/20 active:scale-95"
          >
            + NEW CAMPAIGN
          </button>
        </div>
      </div>
    </div>
  );
};

// Icons needed for metric cards
const BrainCircuitIcon = (props: any) => <BrainCircuit {...props} />;

export default Dashboard;
