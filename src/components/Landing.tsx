import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Heart, 
  ShieldCheck, 
  Users, 
  Utensils,
  Clock,
  MapPin,
  Soup,
  TrendingDown,
  Info
} from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

export default function Landing({ onEnter }: LandingProps) {
  return (
    <div className="min-h-screen bg-[#FEFAF6] text-[#1A1A1A] font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#E67E22] rounded-full flex items-center justify-center">
            <Heart className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight uppercase">ZEROLINK<span className="text-[#E67E22]">.</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <button className="hover:text-black">Our Mission</button>
          <button className="hover:text-black">How it Works</button>
          <button className="hover:text-black">Partner NGOs</button>
          <button onClick={onEnter} className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full hover:bg-black transition-all">Join the Network</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-40 pb-24 px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-6xl md:text-7xl font-display font-bold tracking-tight leading-[1.05] mb-8 text-[#2C3E50]">
            Turning Surplus into <span className="text-[#E67E22]">Smiles.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-lg mb-10 leading-relaxed font-medium">
            Every day, households and restaurants produce surplus food that could serve millions. ZeroLink connects your extra portions directly to local NGOs and orphanages with speed and care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={onEnter} className="bg-[#E67E22] text-white px-8 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 group shadow-xl shadow-orange-200 hover:bg-[#D35400] transition-all">
              SHARE SURPLUS FOOD <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white border border-gray-200 px-8 py-5 rounded-2xl font-bold hover:bg-gray-50 transition-all text-gray-700">Find Nearby Shelters</button>
          </div>
        </div>
        
        <div className="relative">
          <div className="aspect-[4/5] bg-[#FDFDFC] rounded-[40px] overflow-hidden shadow-2xl relative border-8 border-white">
            <img 
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200" 
              alt="Volunteers sharing food" 
              className="w-full h-full object-cover" 
            />
            
          </div>
          
        </div>
      </header>

      {/* Statistics Section (Real Data) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-display font-bold text-[#2C3E50]">The Food Security Gap</h2>
              <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Real data highlighting the urgent need for local redistribution systems.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard 
                value="78.2" 
                unit="Mil Tonnes" 
                desc="Food wasted annually in Indian households alone." 
                source="UNEP Food Waste Index Report 2024"
              />
              <StatCard 
                value="1/3" 
                unit="Produced" 
                desc="Of all food produced is wasted globally while millions go hungry." 
                source="FSSAI / FAO Perspectives"
              />
              <StatCard 
                value="₹92,000" 
                unit="Crores" 
                desc="Annual value of food wasted in India across various sectors." 
                source="FSSAI Estimates"
              />
           </div>
        </div>
      </section>

      {/* How we serve with care */}
      <section className="py-32 px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
        <div className="flex-1">
          <div className="text-[10px] font-bold text-[#E67E22] uppercase tracking-[0.2em] mb-4">Our Protocol</div>
          <h2 className="text-5xl font-display font-bold leading-[1.1] text-[#2C3E50] mb-8">
            Dignity & Care in Every Delivery.
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed font-medium mb-10">
            We don't just move boxes; we deliver nutrition. Every surplus meal from a household or restaurant is handled with the same care it was prepared with.
          </p>
          
          <div className="space-y-8">
            <ValueItem 
              icon={ShieldCheck} 
              title="FSSAI Aligned Safety" 
              desc="Adhering to strict hygiene standards for prepared and surplus food distribution."
            />
            <ValueItem 
              icon={Clock} 
              title="Hyper-Local Connection" 
              desc="Matching donors to recipients within a 5km radius to ensure freshness."
            />
            <ValueItem 
              icon={Soup} 
              title="Household & Restaurant Friendly" 
              desc="Whether it's one meal from a home or fifty from a cafe, every bit counts."
            />
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-2 gap-4">
           <div className="space-y-4 pt-12">
              <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=400" className="rounded-3xl shadow-lg w-full h-64 object-cover" />
              <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400" className="rounded-3xl shadow-lg w-full h-48 object-cover" />
           </div>
           <div className="space-y-4">
              <div className="bg-[#E67E22] p-8 rounded-3xl text-white shadow-xl">
                 <h4 className="font-display font-bold text-2xl mb-4">"It was heartwarming to see my extra wedding meals reach the shelter in 30 minutes."</h4>
                 <p className="text-xs opacity-80 uppercase tracking-widest font-bold">— Local Resident</p>
              </div>
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400" className="rounded-3xl shadow-lg w-full h-80 object-cover" />
           </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 bg-[#2C3E50] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E67E22] rounded-full blur-[160px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-8 text-center relative z-10">
           <h2 className="text-5xl font-display font-bold mb-8">Become a ZeroLink Hero</h2>
           <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
             Whether you're a restaurant owner, a busy host, or a volunteer driver, your presence strengthens our mission of zero hunger.
           </p>
           <div className="flex flex-wrap justify-center gap-4">
              <button onClick={onEnter} className="bg-white text-[#2C3E50] px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all">Sign Up My Kitchen</button>
              <button className="bg-[#E67E22] text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all">Volunteer as a Courier</button>
           </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-20 px-8 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-[#E67E22] rounded-full flex items-center justify-center">
               <Heart className="text-white w-3 h-3 fill-current" />
             </div>
             <span className="text-lg font-display font-bold uppercase">ZEROLINK</span>
           </div>
           
           <div className="flex gap-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <button className="hover:text-black">Privacy Protocol</button>
              <button className="hover:text-black">Terms of Service</button>
              <button className="hover:text-black">Donation Laws</button>
              <button className="hover:text-black">Contact Outreach</button>
           </div>
           
           <div className="text-[10px] text-gray-400 uppercase tracking-widest">© 2024 ZeroLink Mission. Serving Humanity.</div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ value, unit, desc, source }: any) {
  return (
    <div className="p-10 rounded-[32px] bg-[#FEFAF6] border border-[#F3E5AB] hover:bg-white hover:shadow-2xl hover:shadow-orange-100 transition-all group">
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-5xl font-display font-bold text-[#E67E22]">{value}</span>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{unit}</span>
      </div>
      <p className="text-sm font-medium text-gray-600 leading-relaxed mb-6">{desc}</p>
      <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
         <Info size={10} /> {source}
      </div>
    </div>
  );
}

function ValueItem({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex gap-6">
      <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0 border border-gray-50">
        <Icon className="text-[#E67E22] w-6 h-6" />
      </div>
      <div>
        <h4 className="text-lg font-bold text-[#2C3E50] mb-1">{title}</h4>
        <p className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
