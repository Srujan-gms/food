import React, { useState } from 'react';
import { 
  ArrowRight, 
  MapPin, 
  Clock,
  Package,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Building2,
  Navigation
} from 'lucide-react';
import { motion } from 'motion/react';
import MapComponent from './MapComponent';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';

import LocationSearch from './LocationSearch';

const RescueItem: React.FC<{ rescue: any; currentTime: number }> = ({ rescue, currentTime }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  let timeText = 'Expired';
  let formattedTimeLeft = '';
  let timeDays = 0, timeHours = 0, timeMins = 0;
  let percentRemaining = 0;

  if (rescue.expectedExpiryTime) {
    const expiry = new Date(rescue.expectedExpiryTime).getTime();
    let diff = expiry - currentTime;
    if (diff > 0) {
      timeDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      timeHours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      timeMins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (timeDays > 0) {
        timeText = `${timeDays}d ${timeHours}h ${timeMins}m remaining`;
        formattedTimeLeft = `${timeDays} Days, ${timeHours} Hours, ${timeMins} Minutes`;
      } else {
        timeText = `${timeHours}h ${timeMins}m remaining`;
        formattedTimeLeft = `${timeHours} Hours, ${timeMins} Minutes`;
      }
      
      const totalDuration = (rescue.fssaiStandardHours || 4) * 60 * 60 * 1000;
      percentRemaining = Math.max(0, (diff / totalDuration) * 100);
    }
  }

  let statusText = 'Awaiting NGO';
  let statusColor = 'bg-[#FFF4E5] text-[#D35400]';
  let dotColor = 'bg-[#D35400]';
  
  if (rescue.status === 'accepted') {
      statusText = 'Assigned to NGO';
      statusColor = 'bg-blue-100 text-blue-700';
      dotColor = 'bg-blue-500';
  } else if (rescue.status === 'in_transit') {
      statusText = 'In Transit';
      statusColor = 'bg-green-100 text-green-700';
      dotColor = 'bg-green-500';
  } else if (rescue.status === 'completed') {
      statusText = 'Completed';
      statusColor = 'bg-gray-100 text-gray-700';
      dotColor = 'bg-gray-500';
  }

  return (
    <div className={`flex flex-col rounded-2xl border border-gray-100 hover:shadow-md transition-all bg-[#FDFDFC] ${expanded ? 'shadow-lg' : ''}`}>
      <div 
        className="flex items-center justify-between cursor-pointer group p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${rescue.status === 'in_transit' ? 'bg-green-50 text-green-600' : 'bg-[#FDF9F1] text-[#FFB800]'}`}>
                <Package className="w-5 h-5" />
            </div>
            <div className="pt-0.5">
                <h4 className="text-[15px] font-bold text-gray-900 mb-1">{rescue.foodType} ({rescue.quantity} KG)</h4>
                <p className="text-xs text-gray-500 font-medium tracking-wide">{timeText}</p>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <span className={`${statusColor} text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5`}>
                <div className={`w-1.5 h-1.5 ${dotColor} rounded-full`}></div>
                {statusText}
            </span>
            <ChevronRight className={`w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </div>
      
      {expanded && (
        <div className="p-5 pt-0 border-t border-gray-100 bg-white rounded-b-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            <div className="flex flex-col items-center">
              {/* Safe Window widget moved inside */}
              <div className="bg-[#2D2A26] rounded-3xl w-full p-8 text-white relative shadow-xl shadow-black/5 flex flex-col items-center">
                 <div className="w-full text-center mb-8">
                   <h3 className="text-[11px] font-black text-[#FFB800] uppercase tracking-widest">Real-Time Safe Window</h3>
                 </div>
                 
                 {/* Gauge */}
                 <div className="relative w-56 h-56 flex items-center justify-center mb-10">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="112" cy="112" r="95" stroke="rgba(255,255,255,0.05)" strokeWidth="16" fill="none" />
                      <motion.circle 
                        cx="112" cy="112" r="95" 
                        stroke={percentRemaining > 20 ? "#FFB800" : "#EF4444"} 
                        strokeWidth="16" 
                        fill="none" 
                        strokeDasharray="596.6"
                        initial={{ strokeDashoffset: 596.6 }}
                        animate={{ strokeDashoffset: 596.6 * (1 - percentRemaining / 100) }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                       <span className="text-3xl font-display font-bold tracking-tight">{timeDays > 0 ? `${timeDays}d ` : ''}{timeHours.toString().padStart(2, '0')}:{timeMins.toString().padStart(2, '0')}</span>
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">{percentRemaining > 0 ? 'Remaining' : 'Expired'}</span>
                    </div>
                 </div>

                 <div className="w-full flex justify-between items-end mb-3">
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</div>
                   <div className="text-[10px] font-black text-[#FFB800] uppercase tracking-widest">Optimal Range</div>
                 </div>
                 
                 <div className="w-full flex gap-1 h-2 rounded-full overflow-hidden bg-white/5 mb-6">
                   <div className="flex-[2] bg-[#4ADE80]"></div>
                   <div className="flex-[3] bg-[#FFB800]"></div>
                   <div className="flex-1 bg-[#EF4444]"></div>
                 </div>
                 
                 <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Food safety protocols require redistribution within the green/yellow zone to maintain nutrition integrity.
                 </p>
              </div>
            </div>

            <div className="flex flex-col space-y-6">
               <div className="bg-[#FDF9F1] rounded-2xl p-6 border border-[#FFB800]/10">
                 <h4 className="text-[11px] font-black text-[#8B5E34] uppercase tracking-widest mb-4">Details</h4>
                 <div className="space-y-4">
                   <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Time Prepared</p>
                     <p className="text-sm font-medium text-gray-900">{rescue.timePrepared}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">FSSAI Standard</p>
                     <p className="text-sm font-medium text-gray-900">{rescue.fssaiStandardHours} hours ({Math.floor(rescue.fssaiStandardHours/24)}d {rescue.fssaiStandardHours%24}h)</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Created At</p>
                     <p className="text-sm font-medium text-gray-900">{rescue.createdAt ? new Date(rescue.createdAt.seconds * 1000).toLocaleString() : 'Just now'}</p>
                   </div>
                 </div>
               </div>
               
               <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex-1 flex flex-col justify-center items-center text-center">
                  <Navigation className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Optimal Dropoff</p>
                  <p className="text-sm font-medium text-gray-900">Harbor Food Bank</p>
                  <p className="text-xs text-gray-500 mt-1">1.2 miles away</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const fssaiFoodItems = [
  { name: 'Bread', hours: 60, notes: '2-3 days - Freshly baked; mold-prone in humidity.' },
  { name: 'Upma', hours: 24, notes: 'Same day or 1 day - Semolina-based; reheat thoroughly.' },
  { name: 'Idli', hours: 36, notes: '1-2 days - Steamed rice cakes; batter lasts 2 days.' },
  { name: 'Chutney (coconut)', hours: 36, notes: '1-2 days - Fresh versions spoil fast.' },
  { name: 'Biryani', hours: 36, notes: '1-2 days - Cooked rice dish; cool quickly.' },
  { name: 'Dahi (Curd)', hours: 120, notes: '3-7 days - At <5°C; whey separation normal.' },
  { name: 'Dal (lentils)', hours: 60, notes: '2-3 days - Boiled; tadka freshens it up.' },
  { name: 'Roti/Chapati', hours: 24, notes: 'Same day - Best hot; refrigerate up to 1 day.' },
  { name: 'Paratha', hours: 36, notes: '1-2 days - Stuffed varieties drier, last longer.' },
  { name: 'Rice (plain)', hours: 36, notes: '1-2 days - Bacillus cereus risk if >12 hrs room temp.' },
  { name: 'Sambar', hours: 60, notes: '2-3 days - Lentil-veg stew; refrigerate airtight.' },
  { name: 'Paneer dishes', hours: 60, notes: '2-3 days - Like palak paneer; avoid overcooking.' },
  { name: 'Rajma (kidney beans)', hours: 60, notes: '2-3 days - Hearty curry; pairs with rice.' },
  { name: 'Aloo sabzi', hours: 36, notes: '1-2 days - Potato veg; everyday staple.' },
  { name: 'Chana masala', hours: 60, notes: '2-3 days - Chickpea curry; freezes well.' },
  { name: 'Poha', hours: 24, notes: 'Same day or 1 day - Flattened rice; light breakfast.' },
  { name: 'Khichdi', hours: 36, notes: '1-2 days - Rice-lentil porridge; comforting.' },
  { name: 'Pav bhaji', hours: 36, notes: '1-2 days - Mashed veg with bread rolls.' },
  { name: 'Masala dosa', hours: 24, notes: 'Same day - Fermented crepe; serve with chutney.' },
  { name: 'Curd rice', hours: 60, notes: '2-3 days - Cooling yogurt-rice mix.' }
];

export default function DonorDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [hoursRemaining, setHoursRemaining] = useState(2.75);
  const [pickupLocation, setPickupLocation] = useState({lat: 12.9716, lng: 77.5946});
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [timePrepared, setTimePrepared] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFoodDropdownOpen, setIsFoodDropdownOpen] = useState(false);
  const { user, profile } = useAuth();
  
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [activeRescues, setActiveRescues] = useState<any[]>([]);

  React.useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'rescues'),
      where('donorId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveRescues(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'rescues');
    });
    return () => unsubscribe();
  }, [user]);

  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getFSSAIExpiryHours = (type: string) => {
    const item = fssaiFoodItems.find(i => i.name === type);
    if (item) return item.hours;
    const t = type.toLowerCase();
    if (t.includes('raw') || t.includes('produce') || t.includes('vegetable') || t.includes('fruit')) return 24;
    if (t.includes('bakery') || t.includes('bread')) return 12;
    return 4; // default cooked food FSSAI standard roughly 4 hours if not temp controlled
  };

  const handleConfirmLogistics = async () => {
    if (!user) return;
    if (!timePrepared) {
      alert("Please enter time prepared.");
      return;
    }
    setIsSubmitting(true);
    try {
      const expiryHours = getFSSAIExpiryHours(foodType);
      const [hours, minutes] = timePrepared.split(':').map(Number);
      const prepDate = new Date();
      prepDate.setHours(hours, minutes, 0, 0);
      // Handles rollover
      if (prepDate.getTime() > new Date().getTime()) {
        prepDate.setDate(prepDate.getDate() - 1);
      }
      const expiryDate = new Date(prepDate.getTime() + expiryHours * 60 * 60 * 1000);

      await addDoc(collection(db, 'rescues'), {
        donorId: user.uid,
        foodType,
        quantity,
        timePrepared,
        expectedExpiryTime: expiryDate.toISOString(),
        fssaiStandardHours: expiryHours,
        pickupLocation,
        status: 'pending_ngo',
        createdAt: serverTimestamp()
      });
      alert('Rescue logged successfully!');
      setFoodType('');
      setQuantity('');
      setTimePrepared('');
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, 'rescues');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-2 uppercase">
            Welcome, {profile?.name || user?.displayName || 'Donor'}
          </h1>
          <p className="text-gray-500 font-medium">Manage your surplus donations and logistics.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Main Column */}
        <div className="space-y-8">
          
          {/* Post Food Rescue Form */}
          <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-display font-bold text-gray-900 flex items-center gap-3">
                 <Package className="w-5 h-5 text-[#8B5E34]" />
                 Post Food Rescue
              </h2>
              <div className="bg-[#FDF9F1] text-[#8B5E34] px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border border-[#FFB800]/20">
                ID: RES-8821
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3 relative" style={{ zIndex: 11 }}>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Food Type</label>
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setIsFoodDropdownOpen(!isFoodDropdownOpen)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-[#FFB800] outline-none transition-all text-gray-800 text-left flex justify-between items-center"
                  >
                    <span className={foodType ? 'text-gray-900 font-medium' : 'text-gray-400'}>{foodType || "Select food item"}</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isFoodDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {isFoodDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsFoodDropdownOpen(false)}></div>
                      <div className="absolute w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                        <ul className="max-h-[240px] overflow-y-auto w-full py-1">
                          {fssaiFoodItems.map(item => (
                            <li 
                              key={item.name} 
                              className={`px-4 py-3.5 hover:bg-gray-50 text-sm cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${foodType === item.name ? 'bg-orange-50/50 text-[#E67E22] font-semibold' : 'text-gray-700'}`}
                              onClick={() => {
                                setFoodType(item.name);
                                setIsFoodDropdownOpen(false);
                              }}
                            >
                              {item.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Quantity (KG/Units)</label>
                <div className="relative">
                  <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-[#FFB800] outline-none transition-all font-medium" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">KG</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Time Prepared</label>
                <div className="relative">
                  <input type="time" value={timePrepared} onChange={(e) => setTimePrepared(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-[#FFB800] outline-none transition-all text-gray-800" />
                  <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-3 " style={{ zIndex: 10 }}>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Pickup Location</label>
                <LocationSearch 
                  initialLocation={pickupLocation}
                  onLocationSelect={setPickupLocation} 
                  placeholder="Search pickup location..."
                />
              </div>
            </div>

            <div className="w-full h-48 rounded-xl border border-gray-200 mb-8 overflow-hidden relative cursor-crosshair">
               <MapComponent pickupLocation={pickupLocation} onLocationSelect={setPickupLocation} />
            </div>

            <button onClick={handleConfirmLogistics} disabled={isSubmitting} className="w-full bg-[#FFB800] hover:bg-[#E6A600] text-gray-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all group disabled:opacity-50">
               <span>{isSubmitting ? 'SAVING...' : 'CONFIRM LOGISTICS DATA'}</span>
               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </section>

          {/* Active Rescue Operations List */}
          <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
             <h3 className="text-xl font-display font-bold text-gray-900 mb-6 flex items-center gap-3">
                 <ShieldCheck className="w-5 h-5 text-[#8B5E34]" />
                 Active Rescue Operations
             </h3>
             
             <div className="space-y-4">
                {activeRescues.filter(r => r.status !== 'completed' && (!r.expectedExpiryTime || new Date(r.expectedExpiryTime).getTime() > currentTime)).length === 0 && (
                  <div className="text-gray-500 font-medium text-sm p-4 text-center">No active rescue operations.</div>
                )}
                {activeRescues.filter(r => r.status !== 'completed' && (!r.expectedExpiryTime || new Date(r.expectedExpiryTime).getTime() > currentTime)).map(rescue => (
                  <RescueItem key={rescue.id} rescue={rescue} currentTime={currentTime} />
                ))}
             </div>
          </section>
          
        </div>

      </div>
    </div>
  );
}

