import React from 'react'
import { 
  Recycle, 
  Sparkles, 
  ShoppingBag, 
  Wrench, 
  BarChart3, 
  ShieldCheck, 
  User, 
  LogOut,
  Building2,
  Cpu,
  Package
} from 'lucide-react'

import logoImg from '../assets/logo.png'

export default function Navbar({ 
  currentRole, 
  activeView, 
  setActiveView, 
  user, 
  onLogout 
}) {
  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return { label: '🛡️ System Administrator', bg: 'bg-purple-900/60 text-purple-200 border-purple-700/50' }
    }
    if (role === 'lab_staff') {
      return { label: '🔬 Faculty / Lab In-Charge', bg: 'bg-blue-900/60 text-blue-200 border-blue-700/50' }
    }
    return { label: '🎓 Student Account', bg: 'bg-emerald-900/60 text-emerald-200 border-emerald-700/50' }
  }

  const roleInfo = getRoleBadge(currentRole)

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Banner with Institution & Authenticated User Status */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-semibold text-white">NSS College of Engineering, Palakkad</span>
            <span className="hidden lg:inline text-emerald-300">• 5 Branches: CSE • Mechanical • Civil • EEE • IC</span>
          </div>

          {/* Authenticated Identity Pill */}
          {user && (
            <div className="flex items-center gap-2 text-[11px]">
              <span className={`px-2 py-0.5 rounded-md font-bold border ${roleInfo.bg}`}>
                {roleInfo.label}
              </span>
              <span className="text-emerald-300 hidden sm:inline">
                {user.user_metadata?.department || 'Engineering Faculty / Student'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none" 
          onClick={() => setActiveView(currentRole === 'student' ? 'student_hub' : currentRole === 'lab_staff' ? 'lab_staff_hub' : 'admin_hub')}
        >
          <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1 overflow-hidden">
            <img 
              src={logoImg} 
              alt="EcoLoop Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900">EcoLoop</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Circular Campus
              </span>
            </div>
            <p className="text-xs text-slate-500">Peer-to-Peer E-Waste Reuse &amp; Component Exchange</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </p>
                <span className="text-[10px] capitalize px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                  {currentRole.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition shadow-xs"
                title="Sign out of Supabase"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pill-Shaped Floating Navigation Platform */}
      <div className="w-full flex justify-center py-2.5 px-4 bg-slate-100/60 border-t border-slate-200/60">
        <nav 
          role="navigation" 
          aria-label="Module Navigation"
          className="inline-flex items-center gap-1 p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-md shadow-slate-200/50 max-w-full overflow-x-auto no-scrollbar"
        >
          {/* STUDENT TABS */}
          {currentRole === 'student' && (
            <>
              <button
                onClick={() => setActiveView('student_hub')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'student_hub' 
                    ? 'bg-emerald-600 text-white shadow-sm font-bold scale-[1.02]' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>🎓 Student Dashboard &amp; PINs</span>
              </button>
              <button
                onClick={() => setActiveView('marketplace')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'marketplace' 
                    ? 'bg-emerald-600 text-white shadow-sm font-bold scale-[1.02]' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShoppingBag className={`w-3.5 h-3.5 ${activeView === 'marketplace' ? 'text-white' : 'text-blue-600'}`} />
                <span>Browse Marketplace &amp; Split Parts</span>
              </button>
              <button
                onClick={() => setActiveView('ai_scanner')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'ai_scanner' 
                    ? 'bg-emerald-600 text-white shadow-sm font-bold scale-[1.02]' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${activeView === 'ai_scanner' ? 'text-white' : 'text-purple-600'}`} />
                <span>AI Component Scanner</span>
              </button>
              <button
                onClick={() => setActiveView('repair')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'repair' 
                    ? 'bg-emerald-600 text-white shadow-sm font-bold scale-[1.02]' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wrench className={`w-3.5 h-3.5 ${activeView === 'repair' ? 'text-white' : 'text-orange-600'}`} />
                <span>Repair Before Replace</span>
              </button>
            </>
          )}

          {/* LAB STAFF TABS */}
          {currentRole === 'lab_staff' && (
            <>
              <button
                onClick={() => setActiveView('lab_staff_hub')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'lab_staff_hub' 
                    ? 'bg-blue-600 text-white shadow-sm font-bold scale-[1.02]' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className={`w-3.5 h-3.5 ${activeView === 'lab_staff_hub' ? 'text-white' : 'text-indigo-600'}`} />
                <span>🔬 Department Operations &amp; Audits</span>
              </button>
              <button
                onClick={() => setActiveView('repair')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'repair' 
                    ? 'bg-blue-600 text-white shadow-sm font-bold scale-[1.02]' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wrench className={`w-3.5 h-3.5 ${activeView === 'repair' ? 'text-white' : 'text-orange-600'}`} />
                <span>Repair Triage &amp; Helpdesk</span>
              </button>
              <button
                onClick={() => setActiveView('marketplace')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'marketplace' 
                    ? 'bg-blue-600 text-white shadow-sm font-bold scale-[1.02]' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Package className={`w-3.5 h-3.5 ${activeView === 'marketplace' ? 'text-white' : 'text-blue-600'}`} />
                <span>Release Hardware to Students</span>
              </button>
              <button
                onClick={() => setActiveView('ai_scanner')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'ai_scanner' 
                    ? 'bg-blue-600 text-white shadow-sm font-bold scale-[1.02]' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${activeView === 'ai_scanner' ? 'text-white' : 'text-purple-600'}`} />
                <span>AI Component Scanner</span>
              </button>
            </>
          )}

          {/* ADMIN TABS */}
          {currentRole === 'admin' && (
            <>
              <button
                onClick={() => setActiveView('admin_hub')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'admin_hub' 
                    ? 'bg-slate-900 text-white shadow-sm font-bold scale-[1.02]' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${activeView === 'admin_hub' ? 'text-white' : 'text-slate-700'}`} />
                <span>🛡️ Sustainability &amp; NAAC Report</span>
              </button>
              <button
                onClick={() => setActiveView('marketplace')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'marketplace' 
                    ? 'bg-slate-900 text-white shadow-sm font-bold scale-[1.02]' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShoppingBag className={`w-3.5 h-3.5 ${activeView === 'marketplace' ? 'text-white' : 'text-blue-600'}`} />
                <span>Monitor Circular Pipeline</span>
              </button>
              <button
                onClick={() => setActiveView('ai_scanner')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'ai_scanner' 
                    ? 'bg-slate-900 text-white shadow-sm font-bold scale-[1.02]' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${activeView === 'ai_scanner' ? 'text-white' : 'text-purple-600'}`} />
                <span>AI Component Scanner</span>
              </button>
              <button
                onClick={() => setActiveView('repair')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'repair' 
                    ? 'bg-slate-900 text-white shadow-sm font-bold scale-[1.02]' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wrench className={`w-3.5 h-3.5 ${activeView === 'repair' ? 'text-white' : 'text-orange-600'}`} />
                <span>Repair Before Replace</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
