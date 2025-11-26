import React from 'react';
import {  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Activity, Cpu, HardDrive, Zap, Globe, Lock, BrainCircuit, Users } from 'lucide-react';
import { SystemMetrics, Project } from '../types';

interface DashboardProps {
  metrics: SystemMetrics;
  projects: Project[];
}

const MetricCard: React.FC<{ title: string; value: string | number; sub: string; icon: any; color: string }> = ({ title, value, sub, icon: Icon, color }) => (
  <div className="glass-panel p-5 rounded-xl border border-cyan-900/20 relative overflow-hidden group">
    <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/20 transition-all`}></div>
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400`}>
        <Icon size={20} />
      </div>
    </div>
    <p className={`text-xs text-${color}-400/80 font-mono`}>{sub}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ metrics, projects }) => {
  // Mock data for the chart
  const data = [
    { name: '00:00', introspection: 40, load: 24 },
    { name: '04:00', introspection: 30, load: 13 },
    { name: '08:00', introspection: 65, load: 45 },
    { name: '12:00', introspection: 85, load: 78 },
    { name: '16:00', introspection: 70, load: 60 },
    { name: '20:00', introspection: 55, load: 40 },
    { name: '24:00', introspection: 45, load: 30 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Awareness Score" 
          value={`${metrics.awarenessScore.toFixed(2)}%`} 
          sub="Metacognition Stable" 
          icon={BrainCircuitIcon} 
          color="cyan" 
        />
        <MetricCard 
          title="Active Agents" 
          value={metrics.activeAgents} 
          sub="131 Total Available" 
          icon={UsersIcon} 
          color="green" 
        />
        <MetricCard 
          title="VRAM Usage" 
          value={`${metrics.vramUsage.toFixed(1)} GB`} 
          sub="Limit: 4.0 GB (RTX 3050)" 
          icon={HardDrive} 
          color="yellow" 
        />
        <MetricCard 
          title="Global Throughput" 
          value={`${metrics.fps} OPS`} 
          sub="Operations Per Second" 
          icon={Zap} 
          color="purple" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="text-cyan-400" size={20} />
            System Introspection vs Load
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIntro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="introspection" stroke="#22d3ee" fillOpacity={1} fill="url(#colorIntro)" />
                <Area type="monotone" dataKey="load" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorLoad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="text-green-400" size={20} />
            Active Projects
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2">
            {projects.map(p => (
              <div key={p.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 hover:border-cyan-900/50 transition-colors">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-white">{p.name}</span>
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
                  <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 bg-cyan-900/20 border border-cyan-800 text-cyan-400 rounded-lg hover:bg-cyan-900/40 text-sm font-mono transition-colors">
            + NEW CAMPAIGN
          </button>
        </div>
      </div>
    </div>
  );
};

// Icons needed for metric cards
const BrainCircuitIcon = (props: any) => <BrainCircuit {...props} />;
const UsersIcon = (props: any) => <Users {...props} />;

export default Dashboard;