import React from 'react'
import { 
  Recycle, 
  Sparkles, 
  ShoppingBag, 
  Wrench, 
  BarChart3, 
  ShieldCheck, 
  LogOut,
  Building2,
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
      return { label: '🛡️ System Administrator', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30' }
    }
    if (role === 'lab_staff') {
      return { label: '🔬 Faculty / Lab In-Charge', bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30' }
    }
    return { label: '🎓 Student Account', bg: 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/30' }
  }

  const roleInfo = getRoleBadge(currentRole)

  return (
    <header className="sticky top-0 z-40 bg-[#121212]/90 backdrop-blur-md border-b border-[#2e2e2e]">
      {/* Top Banner with Institution & Authenticated User Status */}
      <div className="bg-[#171717] border-b border-[#262626] text-zinc-400 text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#3ECF8E]" />
            <span className="font-medium text-[#EDEDED]">NSS College of Engineering, Palakkad</span>
            <span className="hidden lg:inline text-zinc-500">• 5 Branches: CSE • Mechanical • Civil • EEE • IC</span>
          </div>

          {/* Authenticated Identity Pill */}
          {user && (
            <div className="flex items-center gap-2 text-[11px]">
              <span className={`px-2 py-0.5 rounded-md font-semibold border ${roleInfo.bg}`}>
                {roleInfo.label}
              </span>
              <span className="text-zinc-400 hidden sm:inline font-mono">
                {user.user_metadata?.department || 'Engineering Faculty / Student'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group" 
          onClick={() => setActiveView(currentRole === 'student' ? 'student_hub' : currentRole === 'lab_staff' ? 'lab_staff_hub' : 'admin_hub')}
        >
          <div className="w-10 h-10 rounded-xl bg-[#1c1c1c] border border-[#2e2e2e] shadow-sm flex items-center justify-center p-1 overflow-hidden transition-all group-hover:border-[#3ECF8E]/50 group-hover:shadow-[0_0_12px_rgba(62,207,142,0.2)]">
            <img 
              src={logoImg} 
              alt="EcoLoop Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-[#EDEDED] group-hover:text-white transition">EcoLoop</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25">
                Circular Campus
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Peer-to-Peer E-Waste Reuse &amp; Component Exchange</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-[#2e2e2e]">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-[#EDEDED] leading-tight">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </p>
                <span className="text-[10px] capitalize px-1.5 py-0.5 rounded bg-[#232323] text-zinc-400 font-mono border border-[#2e2e2e]">
                  {currentRole.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition"
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
      <div className="w-full flex justify-center py-2 px-4 bg-[#141414]/50 border-t border-[#262626]">
        <nav 
          role="navigation" 
          aria-label="Module Navigation"
          className="inline-flex items-center gap-1 p-1 rounded-full bg-[#1c1c1c]/90 backdrop-blur-md border border-[#2e2e2e] shadow-lg shadow-black/40 max-w-full overflow-x-auto no-scrollbar"
        >
          {/* STUDENT TABS */}
          {currentRole === 'student' && (
            <>
              <button
                onClick={() => setActiveView('student_hub')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeView === 'student_hub' 
                    ? 'bg-[#3ECF8E] text-[#121212] font-semibold shadow-[0_0_15px_rgba(62,207,142,0.3)] scale-[1.02]' 
                    : 'text-zinc-400 hover:text-[#EDEDED] hover:bg-[#282828]'
                }`}
              >
                <span>🎓 Student Dashboard &amp; PINs</span>
              </button>
              <button
                onClick={() => setActiveView('marketplace')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeView === 'marketplace' 
                    ? 'bg-[#3ECF8E] text-[#121212] font-semibold shadow-[0_0_15px_rgba(62,207,142,0.3)] scale-[1.02]' 
                    : 'text-zinc-400 hover:text-[#EDEDED] hover:bg-[#282828]'
                }`}
              >
                <ShoppingBag className={`w-3.5 h-3.5 ${activeView === 'marketplace' ? 'text-[#121212]' : 'text-[#3ECF8E]'}`} />
                <span>Browse Marketplace &amp; Split Parts</span>
              </button>
              <button
                onClick={() => setActiveView('ai_scanner')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeView === 'ai_scanner' 
                    ? 'bg-[#3ECF8E] text-[#121212] font-semibold shadow-[0_0_15px_rgba(62,207,142,0.3)] scale-[1.02]' 
                    : 'text-zinc-400 hover:text-[#EDEDED] hover:bg-[#282828]'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${activeView === 'ai_scanner' ? 'text-[#121212]' : 'text-[#3ECF8E]'}`} />
                <span>AI Component Scanner</span>
              </button>
              <button
                onClick={() => setActiveView('repair')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeView === 'repair' 
                    ? 'bg-[#3ECF8E] text-[#121212] font-semibold shadow-[0_0_15px_rgba(62,207,142,0.3)] scale-[1.02]' 
                    : 'text-zinc-400 hover:text-[#EDEDED] hover:bg-[#282828]'
                }`}
              >
                <Wrench className={`w-3.5 h-3.5 ${activeView === 'repair' ? 'text-[#121212]' : 'text-[#3ECF8E]'}`} />
                <span>Repair Before Replace</span>
              </button>
            </>
          )}

          {/* LAB STAFF TABS */}
          {currentRole === 'lab_staff' && (
            <>
              <button
                onClick={() => setActiveView('lab_staff_hub')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeView === 'lab_staff_hub' 
                    ? 'bg-[#3ECF8E] text-[#121212] font-semibold shadow-[0_0_15px_rgba(62,207,142,0.3)] scale-[1.02]' 
                    : 'text-zinc-400 hover:text-[#EDEDED] hover:bg-[#282828]'
                }`}
              >
                <BarChart3 className={`w-3.5 h-3.5 ${activeView === 'lab_staff_hub' ? 'text-[#121212]' : 'text-[#3ECF8E]'}`} />
                <span>🔬 Department Operations &amp; Audits</span>
              </button>
              <button
                onClick={() => setActiveView('repair')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeView === 'repair' 
                    ? 'bg-[#3ECF8E] text-[#121212] font-semibold shadow-[0_0_15px_rgba(62,207,142,0.3)] scale-[1.02]' 
                    : 'text-zinc-400 hover:text-[#EDEDED] hover:bg-[#282828]'
                }`}
              >
                <Wrench className={`w-3.5 h-3.5 ${activeView === 'repair' ? 'text-[#121212]' : 'text-[#3ECF8E]'}`} />
                <span>Repair Triage &amp; Helpdesk</span>
              </button>
              <button
                onClick={() => setActiveView('marketplace')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeView === 'marketplace' 
                    ? 'bg-[#3ECF8E] text-[#121212] font-semibold shadow-[0_0_15px_rgba(62,207,142,0.3)] scale-[1.02]' 
                    : 'text-zinc-400 hover:text-[#EDEDED] hover:bg-[#282828]'
                }`}
              >
                <Package className={`w-3.5 h-3.5 ${activeView === 'marketplace' ? 'text-[#121212]' : 'text-[#3ECF8E]'}`} />
                <span>Release Hardware to Students</span>
              </button>
              <button
                onClick={() => setActiveView('ai_scanner')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeView === 'ai_scanner' 
                    ? 'bg-[#3ECF8E] text-[#121212] font-semibold shadow-[0_0_15px_rgba(62,207,142,0.3)] scale-[1.02]' 
                    : 'text-zinc-400 hover:text-[#EDEDED] hover:bg-[#282828]'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${activeView === 'ai_scanner' ? 'text-[#121212]' : 'text-[#3ECF8E]'}`} />
                <span>AI Component Scanner</span>
              </button>
            </>
          )}

          {/* ADMIN TABS */}
          {currentRole === 'admin' && (
            <>
              <button
                onClick={() => setActiveView('admin_hub')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeView === 'admin_hub' 
                    ? 'bg-[#3ECF8E] text-[#121212] font-semibold shadow-[0_0_15px_rgba(62,207,142,0.3)] scale-[1.02]' 
                    : 'text-zinc-400 hover:text-[#EDEDED] hover:bg-[#282828]'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${activeView === 'admin_hub' ? 'text-[#121212]' : 'text-[#3ECF8E]'}`} />
                <span>🛡️ Sustainability &amp; NAAC Report</span>
              </button>
              <button
                onClick={() => setActiveView('marketplace')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeView === 'marketplace' 
                    ? 'bg-[#3ECF8E] text-[#121212] font-semibold shadow-[0_0_15px_rgba(62,207,142,0.3)] scale-[1.02]' 
                    : 'text-zinc-400 hover:text-[#EDEDED] hover:bg-[#282828]'
                }`}
              >
                <ShoppingBag className={`w-3.5 h-3.5 ${activeView === 'marketplace' ? 'text-[#121212]' : 'text-[#3ECF8E]'}`} />
                <span>Monitor Circular Pipeline</span>
              </button>
              <button
                onClick={() => setActiveView('ai_scanner')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeView === 'ai_scanner' 
                    ? 'bg-[#3ECF8E] text-[#121212] font-semibold shadow-[0_0_15px_rgba(62,207,142,0.3)] scale-[1.02]' 
                    : 'text-zinc-400 hover:text-[#EDEDED] hover:bg-[#282828]'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${activeView === 'ai_scanner' ? 'text-[#121212]' : 'text-[#3ECF8E]'}`} />
                <span>AI Component Scanner</span>
              </button>
              <button
                onClick={() => setActiveView('repair')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeView === 'repair' 
                    ? 'bg-[#3ECF8E] text-[#121212] font-semibold shadow-[0_0_15px_rgba(62,207,142,0.3)] scale-[1.02]' 
                    : 'text-zinc-400 hover:text-[#EDEDED] hover:bg-[#282828]'
                }`}
              >
                <Wrench className={`w-3.5 h-3.5 ${activeView === 'repair' ? 'text-[#121212]' : 'text-[#3ECF8E]'}`} />
                <span>Repair Before Replace</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
