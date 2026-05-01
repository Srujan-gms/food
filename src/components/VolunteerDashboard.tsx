import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  Clock, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  MoreVertical,
  Navigation2,
  TrendingUp,
  Map as MapIcon,
  Search,
  Heart,
  Soup,
  Utensils,
  History,
  MessageCircle,
  Gift,
  Smile,
  ChevronRight,
  ShoppingCart,
  Truck,
  Package,
  Gauge,
  ClipboardList
} from 'lucide-react';
import { motion } from 'motion/react';
import MapComponent from './MapComponent';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  var p = 0.017453292519943295;
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a));
}

export default function VolunteerDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [currentRescue, setCurrentRescue] = useState<any>(null);
  const [pendingPickups, setPendingPickups] = useState<any[]>([]);
  const [completedRescues, setCompletedRescues] = useState<any[]>([]);
  const [volunteerLoc, setVolunteerLoc] = useState({ lat: 12.9616, lng: 77.6046 });
  const { user, profile } = useAuth();

  // Simulate movement towards the active destination
  useEffect(() => {
    if (!currentRescue) return;
    const target = currentRescue.collected ? currentRescue.dropoffLocation : currentRescue.pickupLocation;
    if (!target) return;

    const interval = setInterval(() => {
      setVolunteerLoc(prev => {
        const dLat = target.lat - prev.lat;
        const dLng = target.lng - prev.lng;
        const dist = Math.sqrt(dLat*dLat + dLng*dLng);
        if (dist < 0.0005) return target; // Reached!
        
        // Move towards target by small step
        return {
          lat: prev.lat + dLat * 0.1,
          lng: prev.lng + dLng * 0.1
        };
      });
    }, 2000); // update every 2 seconds

    return () => clearInterval(interval);
  }, [currentRescue]);

  useEffect(() => {
    if (!user) return;
    
    // Listen for my active rescue
    const qActive = query(collection(db, 'rescues'), where('status', '==', 'in_transit'), where('volunteerId', '==', user.uid), limit(1));
    const unsubActive = onSnapshot(qActive, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        setCurrentRescue({ id: docSnap.id, ...data });
      } else {
        setCurrentRescue(null);
      }
    }, (error) => {});

    // Listen for pending pickups
    const qPending = query(collection(db, 'rescues'), where('status', '==', 'pending_volunteer'));
    const unsubPending = onSnapshot(qPending, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingPickups(docs);
    }, (error) => {});

    // Listen for completed rescues by this volunteer
    const qCompleted = query(collection(db, 'rescues'), where('status', '==', 'completed'), where('volunteerId', '==', user.uid));
    const unsubCompleted = onSnapshot(qCompleted, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompletedRescues(docs);
    }, (error) => {});

    return () => {
      unsubActive();
      unsubPending();
      unsubCompleted();
    };
  }, [user]);

  const handleMarkCollected = async () => {
    if (!currentRescue) return;
    try {
      await updateDoc(doc(db, 'rescues', currentRescue.id), {
        collected: true
      });
    } catch(e) {
      handleFirestoreError(e, OperationType.UPDATE, 'rescues');
    }
  };

  const handleMarkDelivered = async () => {
    if (!currentRescue) return;
    try {
      await updateDoc(doc(db, 'rescues', currentRescue.id), {
        status: 'completed'
      });
      alert('Rescue marked as Delivered!');
    } catch(e) {
      handleFirestoreError(e, OperationType.UPDATE, 'rescues');
    }
  };

  const handleAcceptRescue = async (rescueId: string) => {
    try {
      await updateDoc(doc(db, 'rescues', rescueId), {
        status: 'in_transit',
        volunteerId: user?.uid
      });
    } catch(e) {
      handleFirestoreError(e, OperationType.UPDATE, 'rescues');
    }
  };

  const todayStr = new Date().toDateString();
  const todaysCompleted = completedRescues.filter(r => r.updatedAt && r.updatedAt.toDate().toDateString() === todayStr);

  const totalWeightToday = todaysCompleted.reduce((total, r) => total + (parseFloat(r.quantity) || 0), 0);
  const timeSaved = (todaysCompleted.length * 0.5).toFixed(1);
  const mealsProvided = todaysCompleted.reduce((total, r) => total + Math.floor((parseFloat(r.quantity) || 0) * 2), 0);

  let isAtPickup = false;
  let isAtDropoff = false;
  if (currentRescue) {
    if (!currentRescue.collected && currentRescue.pickupLocation) {
        isAtPickup = getDistance(volunteerLoc.lat, volunteerLoc.lng, currentRescue.pickupLocation.lat, currentRescue.pickupLocation.lng) < 0.2; // 200m
    } else if (currentRescue.collected && currentRescue.dropoffLocation) {
        isAtDropoff = getDistance(volunteerLoc.lat, volunteerLoc.lng, currentRescue.dropoffLocation.lat, currentRescue.dropoffLocation.lng) < 0.2; // 200m
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-2 uppercase">
            Welcome, {profile?.name || user?.displayName || 'Volunteer'}
          </h1>
          <p className="text-gray-500 font-medium">Manage your active pickups and delivery timelines in real-time.</p>
        </div>
        <div className="bg-white border border-gray-200 px-6 py-3 rounded-full flex items-center gap-3 shadow-sm cursor-default">
           <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
           <span className="text-sm font-bold text-gray-900">Live Updates Active</span>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        
        {/* Left Column */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
           
           <section className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
               <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                       <MapIcon className="w-6 h-6 text-[#8B5E34]" />
                       <h2 className="text-xl font-display font-bold text-gray-900">Optimal Rescue Route</h2>
                       <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Delivery before expiry limit
                       </span>
                   </div>
                   <div className="text-right hidden">
                      
                   </div>
               </div>
               
               {/* Map Visualization */}
               <div className="h-[400px] w-full relative bg-gray-100">
                  <MapComponent 
                    pickupLocation={currentRescue ? (currentRescue.collected ? undefined : currentRescue.pickupLocation) : undefined} 
                    dropoffLocation={currentRescue?.collected ? currentRescue.dropoffLocation : undefined} 
                    volunteerLocation={volunteerLoc} 
                    activeRoute={currentRescue ? (
                      currentRescue.collected 
                        ? (currentRescue.dropoffLocation ? [volunteerLoc, currentRescue.dropoffLocation] : [])
                        : (currentRescue.pickupLocation ? [volunteerLoc, currentRescue.pickupLocation] : [])
                    ) : undefined}
                    availablePickups={!currentRescue ? pendingPickups.filter(p => p.pickupLocation).map(p => ({ id: p.id, lat: p.pickupLocation.lat, lng: p.pickupLocation.lng })) : undefined}
                  />
                  
                  {/* Floating Overlays */}
                  <div className="absolute top-6 left-6 p-4 bg-white rounded-2xl shadow-xl flex items-center gap-4 border border-gray-100">
                      <div className="w-8 h-8 rounded-full border-2 border-[#FFB800] flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-[#FFB800]" />
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Current Location</p>
                          <p className="text-sm font-bold text-gray-900">{currentRescue ? 'Volunteer En Route' : 'Waiting for Mission'}</p>
                      </div>
                  </div>

                  <div className="absolute bottom-6 right-6 p-4 bg-white rounded-2xl shadow-xl flex items-center gap-4 border border-gray-100 text-right">
                      <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Final Destination</p>
                          <p className="text-sm font-bold text-gray-900">{currentRescue ? (currentRescue.collected ? 'NGO Dropoff Hub' : 'Donor Pickup Location') : 'Standby'}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full border-2 border-[#EF4444] bg-[#EF4444] flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                  </div>
               </div>
           </section>

           <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
               <h3 className="text-xl font-display font-bold text-gray-900 mb-10 flex items-center gap-3">
                  <Navigation2 className="w-5 h-5 text-[#8B5E34]" />
                  Mission Progress
               </h3>
               <div className="relative pt-6 px-10">
                   <div className="absolute top-[38px] left-[15%] right-[15%] h-[3px] bg-gray-100"></div>
                   <div className={`absolute top-[38px] left-[15%] ${currentRescue ? (currentRescue.collected ? 'w-[85%]' : 'w-[45%]') : 'w-0'} h-[3px] bg-[#FFB800] transition-all duration-500`}></div>
                   
                   <div className="flex justify-between relative z-10">
                       {/* Pickup */}
                       <div className="flex flex-col items-center flex-1">
                           <div className={`w-14 h-14 ${currentRescue ? 'bg-[#FFB800]' : 'bg-white border-4 border-[#FFB800]'} rounded-full flex items-center justify-center shadow-lg mb-4 ring-8 ring-white z-10 relative`}>
                               <ShoppingCart className={`w-6 h-6 ${currentRescue ? 'text-gray-900' : 'text-[#FFB800]'}`} />
                           </div>
                           <div className="text-sm font-bold text-gray-900">Pickup</div>
                           <div className={`text-[10px] font-black ${currentRescue ? 'text-green-600' : 'text-[#8B5E34]'} uppercase tracking-widest mt-1 mb-4`}>{currentRescue ? 'Completed' : 'Pending'}</div>
                           {currentRescue && !currentRescue.collected && (
                              <button 
                                onClick={isAtPickup ? handleMarkCollected : undefined}
                                disabled={!isAtPickup}
                                className={`px-4 py-2 ${isAtPickup ? 'bg-[#FFB800] text-gray-900 shadow-md hover:bg-[#F5B000]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} rounded-xl text-xs font-bold transition-colors w-32`}
                              >
                                {isAtPickup ? 'Collect Package' : 'Navigating...'}
                              </button>
                           )}
                       </div>

                       {/* In Transit */}
                       <div className="flex flex-col items-center flex-1">
                           <div className={`w-14 h-14 ${currentRescue ? (currentRescue.collected ? 'bg-[#FFB800]' : 'bg-white border-4 border-[#FFB800]') : 'bg-[#F9F9F9] border-2 border-gray-200'} rounded-full flex items-center justify-center shadow-lg mb-4 ring-8 ring-white z-10 relative transition-colors`}>
                               <Truck className={`w-6 h-6 ${currentRescue ? (currentRescue.collected ? 'text-gray-900' : 'text-[#FFB800]') : 'text-gray-400'}`} />
                           </div>
                           <div className={`text-sm font-bold ${currentRescue ? 'text-gray-900' : 'text-gray-400'}`}>In Transit</div>
                           <div className={`text-[10px] font-black ${currentRescue ? (currentRescue.collected ? 'text-green-600' : 'text-[#8B5E34]') : 'text-gray-400'} uppercase tracking-widest mt-1`}>{currentRescue ? (currentRescue.collected ? 'Completed' : 'Active') : 'Pending'}</div>
                       </div>

                       {/* Delivered */}
                       <div className="flex flex-col items-center flex-1">
                           <div className={`w-14 h-14 ${currentRescue && currentRescue.collected ? 'bg-white border-4 border-[#FFB800]' : 'bg-[#F9F9F9] border-2 border-gray-200'} rounded-full flex items-center justify-center shadow-sm mb-4 ring-8 ring-white transition-colors`}>
                               <CheckCircle2 className={`w-6 h-6 ${currentRescue && currentRescue.collected ? 'text-[#FFB800]' : 'text-gray-400'}`} />
                           </div>
                           <div className={`text-sm font-bold ${currentRescue && currentRescue.collected ? 'text-gray-900' : 'text-gray-400'}`}>Delivered</div>
                           <div className={`text-[10px] font-black ${currentRescue && currentRescue.collected ? 'text-[#8B5E34]' : 'text-gray-400'} uppercase tracking-widest mt-1 mb-4`}>{currentRescue && currentRescue.collected ? 'Pending' : 'Pending'}</div>
                           {currentRescue && currentRescue.collected && (
                              <button 
                                onClick={isAtDropoff ? handleMarkDelivered : undefined}
                                disabled={!isAtDropoff}
                                className={`px-4 py-2 ${isAtDropoff ? 'bg-[#FFB800] text-gray-900 shadow-md hover:bg-[#F5B000]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} rounded-xl text-xs font-bold transition-colors w-32`}
                              >
                                {isAtDropoff ? 'Drop Package' : 'Navigating...'}
                              </button>
                           )}
                       </div>
                   </div>
               </div>
           </section>

           {/* Current Cargo Table */}
           <div className="bg-white rounded-3xl border border-gray-100 p-8 mt-8 shadow-sm">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-display font-bold text-gray-900">Current Cargo Items</h3>
                  <button className="text-[#AF7C40] hover:text-[#8B5E34] text-xs font-bold transition-colors">Download Manifest</button>
               </div>
               
               <div className="overflow-x-auto">
                   <table className="w-full text-left">
                       <thead>
                           <tr className="border-b border-gray-100">
                               <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Name</th>
                               <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</th>
                               <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                           {currentRescue ? (
                             <tr className="hover:bg-gray-50 transition-colors">
                                 <td className="py-5 font-bold text-gray-900 text-sm">{currentRescue.foodType}</td>
                                 <td className="py-5 text-gray-600 text-sm">{currentRescue.quantity} KG</td>
                                 <td className="py-5"><span className="bg-green-50 text-green-700 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md">In Transit</span></td>
                             </tr>
                           ) : (
                             <tr>
                               <td colSpan={3} className="py-5 text-gray-500 text-sm text-center">No active cargo items.</td>
                             </tr>
                           )}
                       </tbody>
                   </table>
               </div>
           </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
           
           <div className="bg-[#2D2A26] text-white rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-black/10">
               <div className="absolute top-6 right-6 opacity-5">
                   <Package className="w-32 h-32" />
               </div>
               <div className="relative z-10 w-12 h-12 bg-[#FFB800]/20 text-[#FFB800] rounded-xl flex items-center justify-center mb-10 border border-[#FFB800]/30 shadow-inner">
                  <Gauge className="w-6 h-6" />
               </div>
               <div className="relative z-10 text-4xl font-display font-bold mb-2">{totalWeightToday.toFixed(1)} kg</div>
               <div className="relative z-10 text-sm text-gray-400 mb-8 pb-8 border-b border-white/10 font-medium">Total Rescue Weight Today</div>
               
               <div className="relative z-10 flex gap-4">
                   <div className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/10">
                       <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Time Saved</div>
                       <div className="text-xl font-bold">{timeSaved} hrs</div>
                   </div>
                   <div className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/10">
                       <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Meals Provided</div>
                       <div className="text-xl font-bold">{mealsProvided} Meals</div>
                   </div>
               </div>
           </div>

           <div className="mt-8">
              <h3 className="text-lg font-display font-bold text-gray-900 mb-6 flex justify-between items-center px-1">
                  <span className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-[#8B5E34]" /> {!currentRescue ? 'Available Rescues' : 'Current Mission'}</span>
              </h3>

              <div className="space-y-4">
                  {currentRescue ? (
                      <div className="bg-white border-2 border-[#FFB800] p-6 rounded-[2rem] relative shadow-[0_8px_30px_rgba(255,184,0,0.15)] group">
                          <span className="absolute -top-3 right-6 bg-[#D9381E] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md z-10">Active</span>
                          
                          <div className="flex items-start gap-4 mb-6 relative z-10">
                              <div className="w-14 h-14 bg-[#FDF9F1] text-[#8B5E34] rounded-2xl flex items-center justify-center shrink-0">
                                  <span className="text-2xl">📦</span>
                              </div>
                              <div className="pt-1">
                                  <h4 className="text-base font-bold text-gray-900 leading-tight mb-1">{currentRescue.foodType}</h4>
                                  <p className="text-xs text-gray-500 font-medium tracking-wide">Ref #{currentRescue.id.slice(0, 6)} • {currentRescue.quantity}kg</p>
                              </div>
                          </div>

                          <div className="space-y-5 mb-8 relative z-10 ml-2">
                              <div className="flex items-start gap-4 relative">
                                  <div className="absolute left-[7px] top-[28px] bottom-[-16px] w-0.5 bg-gray-100"></div>
                                  <div className="w-4 h-4 rounded-full border-4 border-[#FFB800] bg-white z-10 shrink-0 mt-0.5 shadow-sm"></div>
                                  <div>
                                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Pickup</div>
                                      <div className="text-sm font-bold text-gray-900">Donor Location</div>
                                  </div>
                              </div>
                              <div className="flex items-start gap-4">
                                  <div className="w-4 h-4 rounded-full bg-gray-900 border-2 border-white z-10 shrink-0 mt-0.5 shadow-md flex items-center justify-center">
                                      <MapPin className="w-2.5 h-2.5 text-white stroke-[3px]" />
                                  </div>
                                  <div>
                                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Destination</div>
                                      <div className="text-sm font-bold text-gray-900">NGO Dropoff</div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ) : pendingPickups.length > 0 ? (
                      pendingPickups.map(rescue => {
                          const dist = rescue.pickupLocation ? getDistance(volunteerLoc.lat, volunteerLoc.lng, rescue.pickupLocation.lat, rescue.pickupLocation.lng) : 0;
                          return (
                            <div key={rescue.id} className="bg-[#FDFDFC] border border-gray-100 p-6 rounded-[2rem] hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center shrink-0">
                                        <span className="text-2xl opacity-60">📍</span>
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="text-base font-bold text-gray-900 leading-tight mb-1">{rescue.foodType}</h4>
                                        <p className="text-xs text-gray-400 font-medium tracking-wide">Ref #{rescue.id.slice(0, 6)} • {rescue.quantity}kg</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4 mb-8 ml-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white z-10 shrink-0 mt-0.5"></div>
                                    <div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Pickup Point</div>
                                        <div className="text-sm font-bold text-gray-900 opacity-80">Donor Location</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                        <MapPin className="w-4 h-4" /> {dist.toFixed(1)} km away
                                    </div>
                                    <button 
                                      onClick={() => handleAcceptRescue(rescue.id)}
                                      className="text-[#AF7C40] hover:text-[#8B5E34] text-xs font-bold transition-colors uppercase tracking-widest px-3 py-1.5 bg-orange-50 rounded-lg"
                                    >
                                        Collect
                                    </button>
                                </div>
                            </div>
                          );
                      })
                  ) : (
                      <div className="text-gray-500 font-medium text-sm p-4 px-2">No active missions available.</div>
                  )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}

