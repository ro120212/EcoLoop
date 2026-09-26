import React from 'react'
import { 
  Recycle, 
  Sparkles, 
  ShoppingBag, 
  Wrench, 
  BarChart3, 
  Calculator,
  ShieldCheck, 
  Key, 
  User, 
  LogOut,
  Building2,
  Cpu,
  Package
} from 'lucide-react'

export default function Navbar({ 
  currentRole, 
  setCurrentRole, 
  activeView, 
  setActiveView, 
  user, 
  onOpenAuth, 
  onOpenSettings, 
  onLogout 
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Banner with 5 Departments & Status */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-semibold text-white">NSS College of Engineering, Palakkad</span>
            <span className="hidden lg:inline text-emerald-300">• CSE • Mechanical • Civil • EEE • IC Circular Campus Platform</span>
          </div>

          {/* 1-Click Instant Persona / Role Switcher for Evaluation */}
          <div className="flex items-center gap-1.5 bg-emerald-900/80 p-0.5 rounded-lg border border-emerald-700/60 text-[11px]">
            <span className="px-1.5 text-emerald-300 font-bold hidden sm:inline">Role View:</span>
            <button
              onClick={() => {
                setCurrentRole('student')
                setActiveView('student_hub')
              }}
              className={`px-2 py-0.5 rounded-md font-bold transition ${
                currentRole === 'student' ? 'bg-white text-emerald-950 shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              🎓 Student
            </button>
            <button
              onClick={() => {
                setCurrentRole('lab_staff')
                setActiveView('lab_staff_hub')
              }}
              className={`px-2 py-0.5 rounded-md font-bold transition ${
                currentRole === 'lab_staff' ? 'bg-white text-emerald-950 shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              🔬 Lab Staff
            </button>
            <button
              onClick={() => {
                setCurrentRole('admin')
                setActiveView('admin_hub')
              }}
              className={`px-2 py-0.5 rounded-md font-bold transition ${
                currentRole === 'admin' ? 'bg-white text-emerald-950 shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              🛡️ Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView(currentRole === 'student' ? 'student_hub' : currentRole === 'lab_staff' ? 'lab_staff_hub' : 'admin_hub')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">EcoLoop</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Circular Campus
              </span>
            </div>
            <p className="text-xs text-slate-500">Peer-to-Peer E-Waste Reuse & Component Exchange</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setActiveView('calculator')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 ${
              activeView === 'calculator' 
                ? 'bg-teal-50 border-teal-300 text-teal-800' 
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden md:inline">Carbon Certificate</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition shadow-sm"
            title="Configure Gemini API Key & Supabase"
          >
            <Key className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden md:inline">API Settings</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-slate-900 leading-tight">{user.email?.split('@')[0] || 'User'}</p>
                <span className="text-[10px] capitalize px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                  {currentRole}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Campus Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Role-Tailored Tabs */}
      <nav className="border-t border-slate-100 bg-slate-50/70 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 py-1.5 min-w-max">
          {/* STUDENT TABS */}
          {currentRole === 'student' && (
            <>
              <button
                onClick={() => setActiveView('student_hub')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeView === 'student_hub' ? 'bg-white text-emerald-900 shadow-sm border border-slate-200/80 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🎓 My Circular Dashboard & PINs</span>
              </button>
              <button
                onClick={() => setActiveView('marketplace')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeView === 'marketplace' ? 'bg-white text-blue-900 shadow-sm border border-slate-200/80 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <span>Browse Marketplace & Split Parts</span>
              </button>
              <button
                onClick={() => setActiveView('ai_scanner')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeView === 'ai_scanner' ? 'bg-white text-purple-900 shadow-sm border border-slate-200/80 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>AI Component Scanner (Gemini)</span>
              </button>
              <button
                onClick={() => setActiveView('repair')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeView === 'repair' ? 'bg-white text-orange-900 shadow-sm border border-slate-200/80 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-4 h-4 text-orange-600" />
                <span>Repair Before Replace</span>
              </button>
            </>
          )}

          {/* LAB STAFF TABS */}
          {currentRole === 'lab_staff' && (
            <>
              <button
                onClick={() => setActiveView('lab_staff_hub')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeView === 'lab_staff_hub' ? 'bg-white text-indigo-900 shadow-sm border border-slate-200/80 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>🔬 Lab Hardware Operations Hub</span>
              </button>
              <button
                onClick={() => setActiveView('marketplace')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeView === 'marketplace' ? 'bg-white text-blue-900 shadow-sm border border-slate-200/80 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-4 h-4 text-blue-600" />
                <span>Release Surplus Hardware to Students</span>
              </button>
            </>
          )}

          {/* ADMIN TABS */}
          {currentRole === 'admin' && (
            <>
              <button
                onClick={() => setActiveView('admin_hub')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeView === 'admin_hub' ? 'bg-white text-slate-950 shadow-sm border border-slate-200/80 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <span>🛡️ Campus Sustainability & NAAC Report</span>
              </button>
              <button
                onClick={() => setActiveView('marketplace')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeView === 'marketplace' ? 'bg-white text-blue-900 shadow-sm border border-slate-200/80 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <span>Monitor Circular Pipeline</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
