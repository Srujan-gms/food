import React, { useState, useEffect } from 'react';
import { 
  Heart,
  ChevronRight, 
  Clock, 
  MapPin, 
  Activity,
  Home,
  Users,
  Utensils,
  ShieldCheck,
  Plus,
  Settings,
  MessageSquare,
  Calendar,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  calculateExpiry, 
  findBestMatch, 
  Priority, 
  FoodCategory, 
  StorageType 
} from '../lib/engine';
import { SIM_DONORS, SIM_NODES } from '../lib/mockData';
import { useAuth } from '../lib/AuthContext';

export default function AdminDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [loading, setLoading] = useState(false);
  const [activeRescues, setActiveRescues] = useState<any[]>([]);
  const { user, profile } = useAuth();

  const refreshImpactData = () => {
    setLoading(true);
    const newRescues = SIM_DONORS.map((donor, idx) => {
      const batch = {
        id: `impact-${idx}`,
        donorId: donor.id,
        foodType: idx % 2 === 0 ? FoodCategory.COOKED_MEALS : FoodCategory.PRODUCE,
        quantityKg: Math.floor(Math.random() * 50) + 10,
        servings: Math.floor(Math.random() * 100) + 20,
        cookingTime: new Date(Date.now() - Math.random() * 3 * 3600000),
        storage: idx % 3 === 0 ? StorageType.REFRIGERATED : StorageType.ROOM_TEMP,
      } as any;

      const expiry = calculateExpiry(batch);
      const node = findBestMatch(batch, donor, SIM_NODES, expiry);

      return { batch, expiry, node, donor };
    });

    setActiveRescues(newRescues.filter(m => m.node));
    setTimeout(() => setLoading(false), 800);
  };

  useEffect(() => {
    refreshImpactData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-2 uppercase">
            Welcome, {profile?.name || user?.displayName || 'Admin'}
          </h1>
          <p className="text-gray-500 font-medium max-w-lg">
            Nurturing our neighborhoods by connecting surplus food with those who need it most.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={refreshImpactData}
            className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all font-bold text-[10px] uppercase tracking-widest text-[#E67E22]"
          >
            <Activity className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Updating Impacts...' : 'Check New Offerings'}
          </button>
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#E67E22]">
              <Settings className="w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <ImpactHeroCard icon={Users} label="Local Volunteers" value="1,280" trend="+40 this week" color="text-orange-500" bg="bg-orange-50" />
        <ImpactHeroCard icon={Home} label="Community Kitchens" value="156" trend="+3 new joined" color="text-blue-500" bg="bg-blue-50" />
        <ImpactHeroCard icon={Utensils} label="Meals Shared" value="45.2k" trend="+8.4k since Monday" color="text-green-500" bg="bg-green-50" />
        <ImpactHeroCard icon={Heart} label="Lives Impacted" value="12,400" trend="Real-time estimate" color="text-red-500" bg="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Active Support Feed */}
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm shadow-orange-50/50">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-display font-bold text-gray-900">Current Surplus Requests</h3>
                <p className="text-sm text-gray-500">Fresh donations waiting to be shared with the community.</p>
              </div>
              <Plus className="w-6 h-6 text-gray-300 hover:text-[#E67E22] cursor-pointer transition-colors" />
            </div>

            <div className="space-y-4">
              {activeRescues.slice(0, 5).map((rescue, idx) => (
                <RescueActionCard 
                  key={rescue.batch.id}
                  rescue={rescue}
                />
              ))}
              {activeRescues.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Heart className="text-gray-200 w-8 h-8" />
                  </div>
                  <p className="text-gray-400 font-medium">Looking for new community offerings...</p>
                </div>
              )}
            </div>
          </section>

          {/* Volunteer Network & Safety */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-[#FEFAF6] rounded-3xl p-8 border border-orange-100/50">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="text-green-600 w-6 h-6" />
                <h3 className="text-lg font-display font-bold text-gray-900">Health & Safety</h3>
              </div>
              <div className="space-y-4">
                <SafetyMetric label="Food Quality Checks" value="100%" />
                <SafetyMetric label="Volunteer Certification" value="98%" />
                <SafetyMetric label="Storage Compliance" value="99.2%" />
              </div>
            </section>

            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Award className="text-yellow-500 w-6 h-6" />
                <h3 className="text-lg font-display font-bold text-gray-900">Top Community Heroes</h3>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Sarah J.", deliveries: 42, icon: "👩‍🍳" },
                  { name: "Bistro Haven", deliveries: 38, icon: "🏢" },
                  { name: "Michael R.", deliveries: 31, icon: "🚲" }
                ].map((hero, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{hero.icon}</span>
                      <span className="text-sm font-bold text-gray-700">{hero.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-400">{hero.deliveries} Shares</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Community Activity Sidebar */}
        <div className="space-y-8">
          <section className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E67E22] blur-3xl opacity-20 -mr-16 -mt-16 group-hover:opacity-40 transition-all duration-700"></div>
            <h3 className="text-xl font-display font-bold mb-6 relative z-10 flex items-center justify-between">
              Mission Update
              <Calendar className="w-4 h-4 text-orange-400" />
            </h3>
            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-xs font-medium">Monthly Goal Progress</span>
                  <span className="text-xs font-bold">75%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600" 
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                  <div>
                    <p className="text-sm font-bold">New Kitchen Partner</p>
                    <p className="text-xs text-gray-400">Green Valley Shelter joined the network.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                  <div>
                    <p className="text-sm font-bold">Impact Milestone</p>
                    <p className="text-xs text-gray-400">10,000 meals reached this month!</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button className="w-full bg-[#E67E22] hover:bg-orange-500 text-white font-bold py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-900/40">
                  Plan Community Event
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm shadow-orange-50/50">
            <h3 className="text-lg font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-400" />
              Community Chat
            </h3>
            <div className="space-y-6">
              {[
                { sender: "Sarah (Volunteer)", msg: "Just picked up 20 meals from The Daily Bread!", time: "2m ago" },
                { sender: "Hope Kitchen", msg: "We're ready for the afternoon donation, thank you!", time: "15m ago" }
              ].map((chat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{chat.sender}</span>
                    <span className="text-[10px] text-gray-300">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-2xl rounded-tl-none">
                    {chat.msg}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ImpactHeroCard({ icon: Icon, label, value, trend, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
        <Icon className={`${color} w-6 h-6`} />
      </div>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-3xl font-display font-bold text-gray-900 mb-2">{value}</div>
      <div className="text-[10px] font-bold text-green-500 uppercase tracking-wider">{trend}</div>
    </div>
  );
}

function RescueActionCard({ rescue }: any) {
  const { donor, batch, expiry, node } = rescue;
  
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 p-5 rounded-2xl hover:bg-[#FEFAF6] transition-all border border-transparent hover:border-orange-100 group">
      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
        <Utensils className="text-[#E67E22] w-6 h-6" />
      </div>
      
      <div className="flex-1 text-center md:text-left">
        <div className="font-bold text-gray-900 flex items-center gap-2 justify-center md:justify-start">
          {batch.foodType}
          <span className={`text-[8px] px-2 py-0.5 rounded-full uppercase tracking-tighter ${
            expiry.priorityLevel === Priority.CRITICAL ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-500 border border-green-100'
          }`}>
            {expiry.priorityLevel}
          </span>
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1 justify-center md:justify-start mt-1">
          <MapPin className="w-3 h-3" /> {donor.name} → {node.name}
        </div>
      </div>

      <div className="flex gap-8 text-center px-4">
        <div>
          <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Quantity</div>
          <div className="text-sm font-display font-bold text-gray-700">{batch.quantityKg}kg</div>
        </div>
        <div>
          <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Time Remaining</div>
          <div className={`text-sm font-display font-bold ${expiry.remainingSafeMinutes < 60 ? 'text-red-500' : 'text-gray-700'}`}>
            {expiry.remainingSafeMinutes}m
          </div>
        </div>
      </div>

      <button className="w-full md:w-auto bg-white border border-orange-100 text-[#E67E22] px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#E67E22] hover:text-white transition-all shadow-sm">
        Connect Volunteer
      </button>

      <ChevronRight className="hidden md:block w-5 h-5 text-gray-200 group-hover:text-[#E67E22] transition-colors" />
    </div>
  );
}

function SafetyMetric({ label, value }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-900">{value}</span>
      </div>
      <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: value }}
          className="h-full bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"
        />
      </div>
    </div>
  );
}
