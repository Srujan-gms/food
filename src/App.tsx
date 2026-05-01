/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Activity, 
  Heart,
  LayoutDashboard, 
  LogOut, 
  Navigation, 
  Plus, 
  ShieldCheck, 
  Users, 
  Utensils 
} from 'lucide-react';
import { useAuth } from './lib/AuthContext';

// Pages
import Landing from './components/Landing';
import RoleSelection from './components/RoleSelection';
import AdminDashboard from './components/AdminDashboard';
import DonorDashboard from './components/DonorDashboard';
import NGODashboard from './components/NGODashboard';
import VolunteerDashboard from './components/VolunteerDashboard';
import ImpactDashboard from './components/ImpactDashboard';

export type Role = 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN' | null;

export default function App() {
  const [view, setView] = useState<'landing' | 'role-selection' | 'dashboard'>('landing');
  const [role, setRole] = useState<Role>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-[#FEFAF6] flex items-center justify-center">Loading...</div>;
  }

  // Determine current view based on auth state
  let currentView = view;
  if (!user && view !== 'landing') {
    currentView = 'role-selection';
  } else if (user && !profile) {
    currentView = 'role-selection'; // Needs to select role
  } else if (user && profile && view === 'role-selection') {
    currentView = 'dashboard';
  }

  const currentRole = role || profile?.role;

  if (currentView === 'landing') {
    return <Landing onEnter={() => setView('role-selection')} />;
  }

  if (currentView === 'role-selection') {
    return (
      <RoleSelection 
        onSelectRole={(r) => {
          setRole(r);
          setView('dashboard');
        }} 
      />
    );
  }

  const renderContent = () => {
    // If not matching a dashboard tab, show activeTab content
    if (activeTab === 'reports') return <ImpactDashboard />;
    
    switch (currentRole) {
      case 'ADMIN': return <AdminDashboard onSignOut={() => signOut()} />;
      case 'DONOR': return <DonorDashboard onSignOut={() => signOut()} />;
      case 'NGO': return <NGODashboard onSignOut={() => signOut()} />;
      case 'VOLUNTEER': return <VolunteerDashboard onSignOut={() => signOut()} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFC] flex">
      {/* Sidebar - Desktop Only */}
      <aside className="w-72 bg-[#F9F9F9] border-r border-gray-100 hidden lg:flex flex-col h-screen sticky top-0">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl font-display font-black tracking-tight">Zero<span className="text-gray-900">Link</span></span>
          </div>
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm mb-6">
            <div className="w-12 h-12 bg-[#FFB800] rounded-xl flex items-center justify-center">
              <span className="text-xl">🌐</span>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 leading-tight">Mission Control</div>
              <div className="text-[10px] text-gray-500 font-medium">Role: {currentRole || 'Logistics Admin'}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Activity} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
        </nav>

        <div className="p-8 space-y-4">
          <button 
            onClick={async () => {
              await signOut();
              setView('landing');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-white hover:text-black transition-all"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-[#FEFAF6] flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E67E22] rounded-full flex items-center justify-center">
              <Heart className="text-white w-4 h-4 fill-current" />
            </div>
            <span className="text-lg font-display font-bold tracking-tight uppercase">ZeroLink</span>
          </div>
          <button 
            onClick={async () => {
              await signOut();
              setView('landing');
            }}
            className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-[#E67E22] bg-[#FEFAF6] rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
        
        <div className="flex-1">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
        active ? 'bg-primary/10 text-black font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-black'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'group-hover:text-primary'}`} />
      <span className="text-sm">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />}
    </button>
  );
}

