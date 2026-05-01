import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Wind, 
  ArrowUpRight, 
  ArrowDownRight,
  Maximize2,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
  { name: '08:00', demand: 400, supply: 240 },
  { name: '10:00', demand: 300, supply: 139 },
  { name: '12:00', demand: 200, supply: 980 },
  { name: '14:00', demand: 278, supply: 390 },
  { name: '16:00', demand: 189, supply: 480 },
  { name: '18:00', demand: 239, supply: 380 },
  { name: '20:00', demand: 349, supply: 430 },
];

export default function ImpactDashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2">Performance Metrics</h1>
          <p className="text-gray-500 font-medium">Global impact assessment and systems optimization audit.</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-white border border-border-subtle px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
             <Calendar size={14} /> 24 Hours
           </button>
           <button className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all">
             Export Analysis
           </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="TOTAL RESCUED" value="12,482" unit="KG" trend="+14%" isPositive />
        <MetricCard label="ACTIVE COURIERS" value="84" unit="UNITS" trend="+4" isPositive />
        <MetricCard label="ON-TIME RATE" value="98.2" unit="%" trend="-0.4%" />
        <MetricCard label="CARBON SAVED" value="2.4" unit="TONS" trend="+22%" isPositive />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl border border-border-subtle p-8 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-display font-bold text-black">Demand vs. Supply Trends</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Metropolitan Sector Analysis</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Supply</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-black"></div>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Demand</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB800" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FFB800" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#999'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#999'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="supply" stroke="#FFB800" strokeWidth={3} fillOpacity={1} fill="url(#colorSupply)" />
                <Area type="monotone" dataKey="demand" stroke="#000" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar: Real-time Activity */}
        <div className="col-span-12 lg:col-span-4 bg-[#1A1814] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
             <Activity size={100} />
           </div>
           <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-10">System Performance</h3>
           
           <div className="space-y-8 relative z-10">
              <PerformanceBar label="Engine Latency" value="124ms" percent={12} />
              <PerformanceBar label="Matching Accuracy" value="99.8%" percent={99} />
              <PerformanceBar label="Courier Efficiency" value="88.4%" percent={88} color="bg-primary" />
           </div>

           <div className="mt-16 pt-8 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-[#999]">Node Distribution</span>
                <span className="text-[10px] font-bold text-green-500">HEALTHY</span>
              </div>
              <div className="flex gap-1 h-8 items-end">
                {[4, 7, 2, 8, 5, 9, 3, 6, 8, 4].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/10 rounded-t-sm hover:bg-primary transition-colors cursor-pointer" style={{ height: `${h * 10}%` }}></div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, trend, isPositive }: any) {
  return (
    <div className="bg-white rounded-2xl border border-border-subtle p-6 shadow-sm hover:shadow-lg transition-all group">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        <div className={`flex items-center gap-1 text-[10px] font-bold rounded px-1.5 py-0.5 ${
          isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {trend}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-display font-bold text-black">{value}</span>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{unit}</span>
      </div>
    </div>
  );
}

function PerformanceBar({ label, value, percent, color = 'bg-white' }: any) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-bold text-gray-400">{label}</span>
        <span className="text-xs font-display font-bold">{value}</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}
