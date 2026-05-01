import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Heart, 
  Truck, 
  ShieldCheck, 
  Layers,
  Search,
  ChevronDown,
  Utensils
} from 'lucide-react';
import { Role } from '../App';
import { useAuth } from '../lib/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface RoleSelectionProps {
  onSelectRole: (role: Role) => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const { user, signInWithGoogle, createUserProfile } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSignIn = async () => {
    setIsProcessing(true);
    try {
      let userResult = user;
      if (!userResult) {
        userResult = await signInWithGoogle();
      }
      if (!userResult) {
        setIsProcessing(false);
        return;
      }

      const docSnap = await getDoc(doc(db, 'users', userResult.uid));
      if (docSnap.exists()) {
        const role = docSnap.data().role;
        onSelectRole(role);
      } else {
        alert("Account not found. Please switch to Create Account.");
        // We'll leave them authenticated in Firebase, but we won't log them into the app until they create an account.
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRoleSelection = async (role: Role) => {
    if (authMode === 'signin') return;
    
    if (!name.trim()) {
      alert("Please enter a name for your profile if creating an account.");
      return;
    }

    setIsProcessing(true);
    try {
      let userResult = user;
      if (!userResult) {
        userResult = await signInWithGoogle();
      }
      if (!userResult) {
        setIsProcessing(false);
        return;
      }

      // Check if profile exists
      const docSnap = await getDoc(doc(db, 'users', userResult.uid));
      
      if (!docSnap.exists()) {
        const profileName = name || userResult.displayName || 'User';
        await createUserProfile(role, profileName, userResult.uid, userResult.email || '');
      } else {
        // Just update role or use existing role
        await setDoc(doc(db, 'users', userResult.uid), { role, name: name || docSnap.data().name }, { merge: true });
      }
      onSelectRole(role);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFAF6] font-sans flex flex-col md:flex-row">
      {/* Left Decoration / Marketing Side */}
      <div className="hidden md:flex md:w-1/2 bg-[#FFF9ED] p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E67E22] rounded-full blur-[120px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        
        <div>
          <div className="flex items-center gap-2 mb-20 relative z-10">
            <div className="w-8 h-8 bg-[#E67E22] rounded-full flex items-center justify-center">
              <Heart className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight uppercase">ZeroLink</span>
          </div>
          
          <div className="text-[#8B4513] text-[10px] font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-3 relative z-10">
             <div className="w-8 h-[1px] bg-[#E67E22]/30"></div>
             Community Driven Mission
          </div>
          
          <h1 className="text-6xl font-display font-bold tracking-tight leading-[1.05] mb-12 text-[#2C3E50] relative z-10">
            Every Meal<br />
            <span className="text-[#E67E22]">Matters.</span>
          </h1>
          
          <p className="text-gray-500 text-lg leading-relaxed max-w-sm mb-16 relative z-10 font-medium">
            Join a network that turns surplus food into community smiles. Simple, transparent, and built with care for those who need it most.
          </p>

          <div className="grid grid-cols-2 gap-8 relative z-10">
            <FeatureSnippet icon={Heart} title="Direct Impact" desc="Connecting your extra portions to neighbor organizations." />
            <FeatureSnippet icon={Utensils} title="Fresh Deliveries" desc="Timely redistribution ensures nutrition and dignity." />
          </div>
        </div>

        <div className="relative aspect-[16/9] bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white mt-[15px] group cursor-pointer hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-2">
          <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover mt-0 transition-transform duration-700 ease-out group-hover:scale-105" />
          <div className="absolute inset-0 bg-[#E67E22]/10 mix-blend-multiply mt-[15px] ml-0 transition-opacity duration-500 group-hover:opacity-0"></div>
        </div>
      </div>

      {/* Right Login / Selection Side */}
      <div className="flex-1 bg-white p-8 md:p-16 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
           <div className="flex gap-10 mb-14 text-base font-black">
             <button 
              onClick={() => setAuthMode('signin')}
              disabled={isProcessing}
              className={`border-b-2 pb-5 uppercase tracking-[0.15em] transition-all ${authMode === 'signin' ? 'text-[#2C3E50] border-[#E67E22]' : 'text-gray-400 border-transparent hover:text-[#2C3E50]'}`}>Sign In</button>
             <button 
              onClick={() => setAuthMode('signup')}
              disabled={isProcessing}
              className={`border-b-2 pb-5 uppercase tracking-[0.15em] transition-all ${authMode === 'signup' ? 'text-[#2C3E50] border-[#E67E22]' : 'text-gray-400 border-transparent hover:text-[#2C3E50]'}`}>Create Account</button>
           </div>

           <div className="space-y-6">
             {authMode === 'signup' ? (
               <>
                 <div className="space-y-2 mb-8 animate-in fade-in slide-in-from-bottom-2">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Name or Organization Name</label>
                   <input 
                     type="text" 
                     placeholder="Goodwill Shelter / Jane Doe" 
                     value={name}
                     disabled={isProcessing}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full bg-[#FEFAF6] border border-gray-100 rounded-xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#E67E22] transition-colors disabled:opacity-50" 
                   />
                 </div>
                 
                 <div className="relative my-8 flex items-center">
                    <div className="flex-1 h-[1px] bg-gray-100"></div>
                    <span className="px-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">
                      Select your role to join
                    </span>
                    <div className="flex-1 h-[1px] bg-gray-100"></div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <RoleCardEntry 
                     number="01" 
                     label="Donor" 
                     icon={Building2} 
                     desc="Restaurants & Households"
                     disabled={isProcessing}
                     onClick={() => handleRoleSelection('DONOR')} 
                   />
                    <RoleCardEntry 
                     number="02" 
                     label="NGO" 
                     icon={Heart} 
                     desc="Local Charities & Shelters"
                     disabled={isProcessing}
                     onClick={() => handleRoleSelection('NGO')} 
                   />
                    <RoleCardEntry 
                     number="03" 
                     label="Volunteer" 
                     icon={Truck} 
                     desc="Delivery & Coordination"
                     disabled={isProcessing}
                     onClick={() => handleRoleSelection('VOLUNTEER')} 
                   />
                    <RoleCardEntry 
                     number="04" 
                     label="Admin" 
                     icon={ShieldCheck} 
                     desc="Network Management"
                     disabled={isProcessing}
                     onClick={() => handleRoleSelection('ADMIN')} 
                   />
                 </div>
               </>
             ) : (
               <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                 <div className="text-center space-y-2">
                   <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
                   <p className="text-sm font-medium text-gray-500">Sign in to continue your impact.</p>
                 </div>
                 <button 
                   onClick={handleSignIn}
                   disabled={isProcessing}
                   className="w-full bg-[#1A1A1A] hover:bg-black text-white px-8 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {isProcessing ? 'SIGNING IN...' : 'CONTINUE WITH GOOGLE'}
                 </button>
               </div>
             )}
           </div>

           <p className="mt-12 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
             New to the mission? <button className="text-[#E67E22] hover:underline underline-offset-4 pointer-events-auto">Learn about our safety protocols</button>
           </p>
        </div>
      </div>
    </div>
  );
}

function FeatureSnippet({ icon: Icon, title, desc }: any) {
  return (
    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-white border border-gray-50 flex items-center justify-center">
        <Icon className="text-[#E67E22] w-6 h-6" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-[#2C3E50]">{title}</h3>
        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}

function RoleCardEntry({ number, label, icon: Icon, desc, onClick, disabled }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-col items-start p-6 rounded-3xl border-2 border-gray-50 bg-white hover:border-[#E67E22] hover:shadow-xl hover:shadow-[#E67E22]/10 transition-all text-left relative overflow-hidden ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:-translate-y-1'}`}
    >
      <div className="text-xs font-black text-gray-200 mb-5 group-hover:text-[#E67E22] transition-colors">{number}</div>
      <Icon className="w-8 h-8 text-[#2C3E50] mb-4 group-hover:text-[#E67E22] transition-colors" />
      <div className="text-sm font-black uppercase tracking-[0.15em] mb-2 text-[#2C3E50]">{label}</div>
      <div className="text-xs text-gray-400 font-medium leading-relaxed">{desc}</div>
    </button>
  );
}



