import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Clock, 
  MapPin, 
  Heart,
  TrendingUp,
  Users,
  Grid,
  Search,
  Send,
  Droplets,
  Thermometer,
  Utensils,
  Home,
  MessageSquare,
  Award,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MapComponent from './MapComponent';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, getDocs, updateDoc, orderBy, limit, doc, serverTimestamp, onSnapshot, where } from 'firebase/firestore';

import LocationSearch from './LocationSearch';
import { useAuth } from '../lib/AuthContext';

const fssaiFoodItems = [
  { name: 'Bread', hours: 60, notes: '2-3 days - Freshly baked; mold-prone in humidity.' },
  { name: 'Upma', hours: 24, notes: 'Same day or 1 day - Semolina-based; reheat thoroughly.' },
  { name: 'Idli', hours: 36, notes: '1-2 days - Steamed rice cakes; batter lasts 2 days.' },
  { name: 'Chutney (coconut)', hours: 36, notes: '1-2 days - Fresh versions spoil fast.' },
  { name: 'Biryani', hours: 36, notes: '1-2 days - Cooked rice dish; cool quickly.' },
  { name: 'Dosa batter', hours: 72, notes: '3 days - Keep refrigerated to prevent over-fermentation.' },
  { name: 'Sambar', hours: 36, notes: '1-2 days - Lentil-based; boil before reuse.' },
  { name: 'Dal', hours: 48, notes: '1-2 days - Can slowly ferment if left out.' },
  { name: 'Paneer (cooked)', hours: 48, notes: '1-2 days - Dairy-based; strictly refrigerate.' },
  { name: 'Chicken curry', hours: 48, notes: '1-2 days - Meat product; high risk if not cooled fast.' },
  { name: 'Fish fry', hours: 24, notes: 'Same day or 1 day - Seafood spoils very quickly.' },
  { name: 'Rice (cooked)', hours: 24, notes: '1 day - Bacillus cereus risk if kept at room temp.' },
  { name: 'Roti/Chapati', hours: 48, notes: '1-2 days - Dries out but generally safe.' },
  { name: 'Milk (boiled)', hours: 36, notes: '1-2 days - Keep refrigerated.' },
  { name: 'Yogurt/Curd', hours: 120, notes: '4-5 days - Fermented, naturally preserves longer.' },
  { name: 'Vegetable dry subzi', hours: 48, notes: '1-2 days - Oil content helps preserve slightly.' },
  { name: 'Gravy base (tomato/onion)', hours: 72, notes: '3 days - Acidic so lasts a bit longer.' },
  { name: 'Sweets (milk-based)', hours: 48, notes: '1-2 days - e.g., Peda, Burfi; higher sugar extends slightly.' },
  { name: 'Sweets (syrup-based)', hours: 120, notes: '4-5 days - e.g., Gulab Jamun; sugar acts as preservative.' },
  { name: 'Curd rice', hours: 60, notes: '2-3 days - Cooling yogurt-rice mix.' }
];

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  var p = 0.017453292519943295;
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); 
}

export default function NGODashboard({ onSignOut }: { onSignOut: () => void }) {
  const [dropoffLocation, setDropoffLocation] = React.useState({ lat: 12.9716, lng: 77.5946 });
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [activeMatches, setActiveMatches] = useState<any[]>([]);
  const [ngoMatches, setNgoMatches] = useState<any[]>([]);
  const [impactMeals, setImpactMeals] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [foodType, setFoodType] = useState('');
  const [isFoodDropdownOpen, setIsFoodDropdownOpen] = useState(false);
  const { user, profile } = useAuth();

  const [ngoStats, setNgoStats] = useState<any>(null);
  const [inputCapacity, setInputCapacity] = useState('500');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'rescues'),
      where('status', '==', 'pending_ngo')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveMatches(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'rescues');
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'ngo_stats', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setNgoStats(docSnap.data());
      }
    }, (error) => {});
    return () => unsubscribe();
  }, [user]);

  const [activeNgoRescuesCount, setActiveNgoRescuesCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'rescues'),
      where('ngoId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let meals = 0;
      let activeCount = 0;
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.status === 'completed') {
          meals += Math.floor((parseFloat(data.quantity) || 0) * 4);
        } else if (data.status !== 'rejected_by_ngo') {
          activeCount++;
        }
        return { id: doc.id, ...data };
      });
      setImpactMeals(meals);
      setActiveNgoRescuesCount(activeCount);
      setNgoMatches(docs);
    }, (error) => {});
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBroadcastNeed = async () => {
    setIsBroadcasting(true);
    try {
      if (user) {
         await updateDoc(doc(db, 'ngo_stats', user.uid), {
            maxCapacity: parseFloat(inputCapacity) || 500,
            updatedAt: serverTimestamp()
         }).catch(async (e) => {
            // Document might not exist, create it
            const { setDoc } = await import('firebase/firestore');
            await setDoc(doc(db, 'ngo_stats', user.uid), {
               maxCapacity: parseFloat(inputCapacity) || 500,
               lastResetTime: serverTimestamp(),
               updatedAt: serverTimestamp()
            });
         });
      }

      // Find the latest active rescue and attach this NGO's dropoff location to it
      const q = query(collection(db, 'rescues'), orderBy('createdAt', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const rescueDoc = querySnapshot.docs[0];
        
        await updateDoc(doc(db, 'rescues', rescueDoc.id), {
           dropoffLocation,
           status: 'pending_volunteer',
           updatedAt: serverTimestamp()
        });
        alert('Need broadcasted! A volunteer will be routed to pick up the rescue and deliver it here.');
      } else {
        alert('No pending rescues available to broadcast to right now.');
      }
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, 'rescues');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleResetIntake = async () => {
     if (!user) return;
     try {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'ngo_stats', user.uid), {
           lastResetTime: serverTimestamp()
        }, { merge: true });
     } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, 'ngo_stats');
     }
  };

  const capacityUsed = ngoMatches.reduce((total, match) => {
    if (match.status === 'completed') {
      if (ngoStats?.lastResetTime && match.updatedAt) {
        if (match.updatedAt.toDate() > ngoStats.lastResetTime.toDate()) {
          return total + (parseFloat(match.quantity) || 0);
        }
        return total;
      }
      return total + (parseFloat(match.quantity) || 0);
    }
    return total;
  }, 0);

  const maxCapacity = ngoStats?.maxCapacity || 500;
  const rawPercentage = (capacityUsed / maxCapacity) * 100;
  const capacityPercentage = isNaN(rawPercentage) ? 0 : Math.min(100, Math.max(0, rawPercentage));

  const combinedMatches = [
    ...activeMatches.filter(r => r.status === 'pending_ngo' && r.ngoId !== user?.uid), 
    ...ngoMatches
  ];
  
  const filteredMatches = combinedMatches;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-2 uppercase">
            Welcome, {profile?.name || user?.displayName || 'NGO'}
          </h1>
          <p className="text-gray-500 text-lg font-medium">Manage surplus requests and dropoff logistics.</p>
        </div>
        
        <div className="flex gap-4">
          <StatMini label="LOCAL RESCUES ACTIVE" value={activeNgoRescuesCount.toString()} />
          <StatMini label="MEALS IMPACT TODAY" value={impactMeals.toLocaleString()} isHighlight />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Request Support */}
        <div className="col-span-12 lg:col-span-5">
           <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm relative overflow-hidden">
             
             <div className="flex items-center gap-4 mb-10 relative z-10">
               <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-[#E67E22]">
                 <Send className="w-5 h-5 -ml-0.5" />
               </div>
               <div>
                  <h2 className="text-2xl font-display font-bold text-gray-900">Demand Input</h2>
               </div>
             </div>

             <div className="space-y-6 relative z-10">
               <div className="space-y-3">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Meals Needed</label>
                 <div className="relative group">
                   <input type="text" placeholder="0" className="w-full bg-[#FDF3E7] border-0 rounded-2xl px-6 py-5 text-3xl font-display font-bold text-gray-900 outline-none focus:ring-2 focus:ring-orange-200 transition-all text-left" />
                   <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-600">Servings</span>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-3 relative">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Food Type</label>
                    <div 
                      className="w-full bg-[#FDF3E7] border-0 rounded-xl px-4 py-4 text-sm font-bold text-gray-800 outline-none cursor-pointer flex justify-between items-center"
                      onClick={() => setIsFoodDropdownOpen(!isFoodDropdownOpen)}
                    >
                      <span className={foodType ? "text-gray-900" : "text-gray-400 font-medium"}>
                        {foodType || "Select food item"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isFoodDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                    
                    <AnimatePresence>
                      {isFoodDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsFoodDropdownOpen(false)}></div>
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden"
                          >
                            <ul className="max-h-[240px] overflow-y-auto w-full py-1 custom-scrollbar">
                              {fssaiFoodItems.map(item => (
                                <li 
                                  key={item.name} 
                                  className={`px-4 py-3.5 hover:bg-gray-50 text-sm cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${foodType === item.name ? 'bg-orange-50/50 text-[#E67E22] font-semibold' : 'text-gray-700'}`}
                                  onClick={() => {
                                    setFoodType(item.name);
                                    setIsFoodDropdownOpen(false);
                                  }}
                                >
                                  <div className="font-medium text-gray-900">{item.name}</div>
                                  <div className="text-[10px] text-gray-500 mt-1 font-normal leading-relaxed">{item.notes}</div>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Capacity</label>
                    <div className="relative">
                      <input 
                         type="text" 
                         value={inputCapacity}
                         onChange={e => setInputCapacity(e.target.value)}
                         placeholder="500" 
                         className="w-full bg-[#FDF3E7] border-0 rounded-xl px-4 py-4 text-sm font-bold text-gray-800 outline-none" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-500">kg</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-3">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Time Window</label>
                 <div className="flex items-center gap-3">
                   <div className="relative flex-1">
                     <input type="time" className="w-full bg-[#FDF3E7] border-0 rounded-xl px-4 py-4 text-sm font-bold text-gray-800 outline-none custom-time-input" defaultValue="--:--" />
                     <Clock className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                   </div>
                   <span className="text-gray-900 font-bold text-xs">to</span>
                   <div className="relative flex-1">
                     <input type="time" className="w-full bg-[#FDF3E7] border-0 rounded-xl px-4 py-4 text-sm font-bold text-gray-800 outline-none custom-time-input" defaultValue="--:--" />
                     <Clock className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                   </div>
                 </div>
               </div>

               <div className="space-y-3" style={{ zIndex: 10 }}>
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Drop Off Location</label>
                 <div className="relative mb-4">
                   <LocationSearch 
                     initialLocation={dropoffLocation}
                     onLocationSelect={setDropoffLocation} 
                     placeholder="Search drop off location..."
                   />
                 </div>
                 <div className="w-full h-40 rounded-xl overflow-hidden border border-gray-100 cursor-crosshair">
                    <MapComponent dropoffLocation={dropoffLocation} onLocationSelect={setDropoffLocation} />
                 </div>
               </div>

               <button onClick={handleBroadcastNeed} disabled={isBroadcasting} className="w-full bg-[#FFB800] hover:bg-[#E6A600] text-gray-900 font-extrabold py-5 rounded-xl flex items-center justify-center gap-2 transition-all mt-6 shadow-[0_4px_14px_0_rgba(255,184,0,0.39)] group disabled:opacity-50">
                 <span className="text-lg">{isBroadcasting ? 'BROADCASTING...' : 'Broadcast Need'}</span> 
                 <Send className="w-5 h-5 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </button>
             </div>
           </section>
        </div>

        {/* Right Column: Capacity & Matches */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
           
          {/* Capacity Visualization */}
          <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative">
             <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-gray-900">Live Intake Capacity</h3>
                  <p className="text-xs text-gray-500 tracking-wide mt-1">Based on current storage and volunteer staff</p>
                </div>
                <div className="text-3xl font-display font-bold text-[#8B5E34]">{Math.floor(capacityPercentage)}%</div>
             </div>
             
             <div className="h-4 bg-[#F2F0EB] mb-4 flex border border-gray-100 rounded-lg overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${capacityPercentage}%` }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className="h-full bg-[#FFB800] relative"
               >
               </motion.div>
             </div>
             
             <div className="flex justify-between text-[10px] font-bold text-gray-900 tracking-widest uppercase mb-4">
                <span>0 KG</span>
                <span className="text-gray-500">AVAILABLE: {Math.max(0, maxCapacity - capacityUsed)} KG</span>
                <span className="text-gray-500">FULL: {maxCapacity} KG</span>
             </div>

             <div className="flex justify-end">
               <button 
                 onClick={handleResetIntake}
                 className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
               >
                 <span>RESET WHEN CONSUMED</span>
               </button>
             </div>
          </section>

          <div>
             <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">ACTIVE RESCUE MATCHES ({filteredMatches.length})</h3>

             <div className="space-y-4">
                {filteredMatches.length === 0 && (
                  <div className="text-gray-500 font-medium text-sm p-4 px-2">No active rescue matches available.</div>
                )}
                {filteredMatches
                  .sort((a, b) => {
                    const distA = a.pickupLocation ? getDistance(dropoffLocation.lat, dropoffLocation.lng, a.pickupLocation.lat, a.pickupLocation.lng) : 9999;
                    const distB = b.pickupLocation ? getDistance(dropoffLocation.lat, dropoffLocation.lng, b.pickupLocation.lat, b.pickupLocation.lng) : 9999;
                    return distA - distB;
                  })
                  .map(rescue => {
                    let timeText = 'Expired';
                    let isExpired = true;
                    if (rescue.expectedExpiryTime) {
                      const expiry = new Date(rescue.expectedExpiryTime).getTime();
                      let diff = expiry - currentTime;
                      if (diff > 0) {
                        isExpired = false;
                        const diffHours = Math.floor(diff / (1000 * 60 * 60));
                        const diffMins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        if (diffHours > 0) {
                          timeText = `${diffHours}h ${diffMins}m left`;
                        } else {
                          timeText = `${diffMins} mins left`;
                        }
                      }
                    }

                    const dist = rescue.pickupLocation ? getDistance(dropoffLocation.lat, dropoffLocation.lng, rescue.pickupLocation.lat, rescue.pickupLocation.lng) : 0;
                    
                    return (
                      <RescueCard 
                         key={rescue.id}
                         title={rescue.foodType}
                         origin="Local Donor"
                         dist={`${dist.toFixed(1)} km`}
                         volume={`${rescue.quantity} KG`}
                         timeLeft={timeText}
                         temp="Safe"
                         borderLeft="bg-green-500"
                         tag={isExpired ? "EXPIRED" : "CONSUMABLE WITHIN SAFE TIME"}
                         tagBg={isExpired ? "bg-red-50" : "bg-green-50"}
                         tagText={isExpired ? "text-red-700" : "text-green-700"}
                         status={rescue.status}
                         onAccept={async () => {
                           try {
                             await updateDoc(doc(db, 'rescues', rescue.id), {
                               status: 'pending_volunteer',
                               ngoId: user?.uid,
                               ngoAccepted: true,
                               dropoffLocation,
                               updatedAt: serverTimestamp()
                             });
                             alert('Rescue accepted!');
                           } catch(e) {
                             handleFirestoreError(e, OperationType.UPDATE, 'rescues');
                           }
                         }}
                         onReject={async () => {
                           try {
                             await updateDoc(doc(db, 'rescues', rescue.id), {
                               status: 'rejected_by_ngo',
                               ngoId: user?.uid,
                               ngoAccepted: false,
                               updatedAt: serverTimestamp()
                             });
                             alert('Rescue rejected!');
                           } catch(e) {
                             handleFirestoreError(e, OperationType.UPDATE, 'rescues');
                           }
                         }}
                      />
                    );
                })}
             </div>
          </div>



        </div>
      </div>
    </div>
  );
}

function StatMini({ label, value, isHighlight }: any) {
  return (
    <div className={`bg-white px-8 py-5 rounded-xl shadow-sm min-w-[200px] border border-gray-100`}>
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{label}</span>
      <span className={`text-3xl font-display font-bold tracking-tight ${isHighlight ? 'text-[#8B5E34]' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}

function RescueCard({ title, origin, dist, volume, timeLeft, temp, tag, tagBg, tagText, borderLeft, category, onAccept, onReject, status }: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col relative overflow-hidden group shadow-sm">
      <div className={`absolute top-0 left-0 w-[5px] h-full ${borderLeft}`}></div>
      
      <div className="pl-4">
        <div className="flex justify-between items-start mb-6 w-full">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 bg-[#F9F5EE] rounded-xl flex items-center justify-center text-[#8B5E34] shrink-0">
               <div className="font-bold text-[#8B5E34] text-lg leading-none pt-1">🍴</div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">{title}</h4>
              <div className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> {origin} • {dist} away
              </div>
            </div>
          </div>
          <span className={`text-[9px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap ${tagBg} ${tagText}`}>
            {tag}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-[#FDF9F1] px-4 py-3 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold text-gray-900 uppercase tracking-widest mb-1 pointer-events-none">Volume</span>
            <span className="text-base font-bold text-gray-900">{volume}</span>
          </div>
          <div className="bg-[#FDF9F1] px-4 py-3 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold text-[#D35400] uppercase tracking-widest mb-1 pointer-events-none">Time Left</span>
            <span className="text-base font-bold text-[#D35400]">{timeLeft}</span>
          </div>
          <div className="bg-[#FDF9F1] px-4 py-3 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold text-gray-900 uppercase tracking-widest mb-1 pointer-events-none">{category ? 'Category' : 'Temp'}</span>
            <span className="text-base font-bold text-gray-900">{category || temp}</span>
          </div>
        </div>

        {status === 'pending_ngo' && (
          <div className="flex gap-4">
            <button onClick={onAccept} className="flex-[2] bg-[#1A1A1A] text-white py-4 rounded-xl text-sm font-bold transition-all hover:bg-black shadow-md shadow-gray-200">
              Accept Rescue
            </button>
            <button onClick={onReject} className="flex-1 bg-white border border-gray-200 text-gray-600 py-4 rounded-xl text-sm font-bold transition-all hover:bg-gray-50">
              Reject
            </button>
          </div>
        )}
        {status === 'pending_volunteer' && (
          <div className="bg-blue-50 text-blue-700 font-bold text-center py-4 rounded-xl text-sm uppercase tracking-widest border border-blue-100">
            ACCEPTED (Pending Courier)
          </div>
        )}
        {status === 'completed' && (
          <div className="bg-green-50 text-green-700 font-bold text-center py-4 rounded-xl text-sm uppercase tracking-widest border border-green-100">
            ACCEPTED AND DELIVERED
          </div>
        )}
        {status === 'rejected_by_ngo' && (
          <div className="bg-red-50 text-red-700 font-bold text-center py-4 rounded-xl text-sm uppercase tracking-widest border border-red-100">
            REJECTED
          </div>
        )}
      </div>
    </div>
  );
}


