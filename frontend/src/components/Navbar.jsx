import React from 'react'
import { 
  Sparkles, 
  ShoppingBag, 
  Wrench, 
  LogOut,
  GraduationCap
} from 'lucide-react'
import EcoLoopLogo from './EcoLoopLogo'

export default function Navbar({ 
  activeView, 
  setActiveView, 
  user, 
  onLogout 
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#121212]/90 backdrop-blur-md border-b border-[#2e2e2e]">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group" 
          onClick={() => setActiveView('student_hub')}
        >
          <EcoLoopLogo className="w-9 h-9 transition-transform group-hover:scale-110" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-[#EDEDED] group-hover:text-white transition">EcoLoop</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25">
                NSSCE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Hardware &amp; Component Exchange</p>
          </div>
        </div>

        {/* Global User Info & Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-[#2e2e2e]">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-[#EDEDED] leading-tight">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student'}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="text-[10px] text-[#3ECF8E] font-mono font-medium">
                    {user.user_metadata?.department ? user.user_metadata.department.split(' ')[0] : 'NSSCE'}
                  </span>
                  <span className="text-[10px] text-zinc-500">•</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Student</span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition cursor-pointer"
                title="Sign out"
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
          <button
            onClick={() => setActiveView('student_hub')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeView === 'student_hub' 
                ? 'bg-[#3ECF8E] text-[#121212] font-semibold shadow-[0_0_15px_rgba(62,207,142,0.3)] scale-[1.02]' 
                : 'text-zinc-400 hover:text-[#EDEDED] hover:bg-[#282828]'
            }`}
          >
            <GraduationCap className={`w-3.5 h-3.5 ${activeView === 'student_hub' ? 'text-[#121212]' : 'text-[#3ECF8E]'}`} />
            <span>Dashboard</span>
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
            <span>Marketplace</span>
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
            <span>Scanner</span>
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
            <span>Repairs</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
