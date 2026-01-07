import React from 'react';
import { storageService } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, FileText, Database, Activity, ArrowRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, trend }: any) => (
  <div className="glass-panel p-6 rounded-xl flex flex-col justify-between hover:bg-zinc-900/80 transition-all group border-zinc-800/50">
    <div className="flex items-start justify-between mb-4">
       <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 ring-1 ring-inset ring-white/5`}>
         <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
       </div>
       {trend && <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded-full">+12%</span>}
    </div>
    <div>
      <h3 className="text-3xl font-bold text-white mb-1 tracking-tight group-hover:translate-x-1 transition-transform duration-300">{value}</h3>
      <p className="text-zinc-500 text-sm font-medium">{title}</p>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const projects = storageService.getProjects();
  const totalKeywords = projects.reduce((acc, p) => acc + p.keywords.length, 0);
  
  const data = [
    { name: 'Mon', kws: 12 },
    { name: 'Tue', kws: 19 },
    { name: 'Wed', kws: 3 },
    { name: 'Thu', kws: 25 },
    { name: 'Fri', kws: 15 },
    { name: 'Sat', kws: 8 },
    { name: 'Sun', kws: 22 },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Dashboard</h2>
          <p className="text-zinc-400">Welcome back. Here's your SEO performance snapshot.</p>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Last updated</p>
           <p className="text-white font-medium text-sm">Just now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Projects" 
          value={projects.length} 
          icon={Database} 
          colorClass="text-blue-500"
          trend
        />
        <StatCard 
          title="Tracked Keywords" 
          value={totalKeywords} 
          icon={TrendingUp} 
          colorClass="text-banana-500" 
          trend
        />
        <StatCard 
          title="Optimized Articles" 
          value="12" 
          icon={FileText} 
          colorClass="text-purple-500" 
        />
        <StatCard 
          title="Health Score" 
          value="84%" 
          icon={Activity} 
          colorClass="text-green-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section - Fixed Height to prevent rechart warnings */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 md:p-8 border-zinc-800/50 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white">Keyword Velocity</h3>
            <select className="bg-zinc-900 border border-zinc-700 text-xs rounded-lg px-3 py-1.5 text-zinc-300 outline-none hover:border-zinc-600 transition-colors cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          {/* Explicit Container Height for Recharts */}
          <div className="w-full h-[300px] mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#52525b" 
                  tick={{fill: '#71717a', fontSize: 12}} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10} 
                />
                <YAxis 
                  stroke="#52525b" 
                  tick={{fill: '#71717a', fontSize: 12}} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} 
                  cursor={{ fill: '#27272a', opacity: 0.4 }}
                  itemStyle={{ color: '#eab308' }}
                />
                <Bar 
                  dataKey="kws" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={40} 
                  activeBar={{ fill: '#fbbf24' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 md:p-8 flex flex-col border-zinc-800/50">
          <h3 className="text-lg font-bold text-white mb-6">Recent Projects</h3>
          {projects.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 py-10">
                <Database className="mb-3 opacity-30" size={32} />
                <p className="text-sm">No projects yet.</p>
             </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
              {projects.slice(0, 4).map(p => (
                <div key={p.id} className="group flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40 hover:bg-zinc-800/80 hover:border-zinc-700/60 transition-all cursor-pointer">
                  <div className="overflow-hidden mr-3">
                    <p className="font-bold text-white text-sm group-hover:text-banana-500 transition-colors truncate">{p.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">{p.domain}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-bold text-zinc-400 bg-black/40 px-2 py-1 rounded border border-zinc-800">{p.keywords.length} KW</span>
                    <ArrowRight size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="w-full mt-6 py-3 text-sm font-medium text-zinc-400 border border-zinc-800 rounded-lg hover:text-white hover:border-zinc-600 hover:bg-zinc-900 transition-all">
            View All Projects
          </button>
        </div>
      </div>
    </div>
  );
};