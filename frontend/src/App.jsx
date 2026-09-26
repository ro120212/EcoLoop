import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import LoginScreen from './components/LoginScreen'
import StudentDashboard from './components/StudentDashboard'
import LabStaffDashboard from './components/LabStaffDashboard'
import AdminDashboard from './components/AdminDashboard'
import MarketplaceCircular from './components/MarketplaceCircular'
import AIWasteClassifier from './components/AIWasteClassifier'
import RepairPlatform from './components/RepairPlatform'
import EcoImpactCalculator from './components/EcoImpactCalculator'
import SettingsModal from './components/SettingsModal'
import { api } from './services/api'
import { supabase } from './services/supabaseClient'
import { getUserRole, authService } from './services/authService'
import logoImg from './assets/logo.png'
import { RefreshCw } from 'lucide-react'

export default function App() {
  const [user, setUser] = useState(null)
  const [currentRole, setCurrentRole] = useState('student') // 'student' | 'lab_staff' | 'admin'
  const [activeView, setActiveView] = useState('student_hub')
  const [stats, setStats] = useState(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Fetch global metrics
  const fetchStats = async () => {
    try {
      const data = await api.getStats()
      setStats(data)
    } catch (err) {
      console.warn('Could not load global stats:', err)
    }
  }

  // Set role and default view based on authenticated user
  const syncUserRole = (authenticatedUser) => {
    if (!authenticatedUser) {
      setUser(null)
      setCurrentRole('student')
      return
    }

    setUser(authenticatedUser)
    const detectedRole = getUserRole(authenticatedUser)
    setCurrentRole(detectedRole)

    if (detectedRole === 'admin') {
      setActiveView('admin_hub')
    } else if (detectedRole === 'lab_staff') {
      setActiveView('lab_staff_hub')
    } else {
      setActiveView('student_hub')
    }
  }

  // Load user session from Supabase on mount
  useEffect(() => {
    fetchStats()
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUserRole(session?.user ?? null)
      setLoadingSession(false)
    }).catch(() => {
      setLoadingSession(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUserRole(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await authService.signOut()
    setUser(null)
    setCurrentRole('student')
    setActiveView('student_hub')
  }

  const handleLoginSuccess = (authenticatedUser, role) => {
    setUser(authenticatedUser)
    setCurrentRole(role || getUserRole(authenticatedUser))
    if (role === 'admin') setActiveView('admin_hub')
    else if (role === 'lab_staff') setActiveView('lab_staff_hub')
    else setActiveView('student_hub')
  }

  // Initial session check spinner
  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-xs text-slate-400 font-mono tracking-wider">Connecting to Supabase Campus Auth...</p>
      </div>
    )
  }

  // If not logged in, display the dedicated Login Screen
  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentRole}
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        onOpenSettings={() => setShowSettingsModal(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* STUDENT ROLE HUB */}
        {activeView === 'student_hub' && (
          <StudentDashboard 
            user={user} 
            onNavigate={setActiveView} 
          />
        )}

        {/* LAB STAFF ROLE HUB */}
        {activeView === 'lab_staff_hub' && (
          <LabStaffDashboard 
            onNavigateToMarketplace={() => setActiveView('marketplace')} 
          />
        )}

        {/* ADMIN ROLE HUB */}
        {activeView === 'admin_hub' && (
          <AdminDashboard 
            onNavigateToMarketplace={() => setActiveView('marketplace')} 
          />
        )}

        {/* CIRCULAR MARKETPLACE & COMPONENT SPLITTING */}
        {activeView === 'marketplace' && (
          <MarketplaceCircular 
            user={user} 
            onGoToPortfolio={() => {
              if (currentRole === 'student') setActiveView('student_hub')
              else if (currentRole === 'lab_staff') setActiveView('lab_staff_hub')
              else setActiveView('admin_hub')
            }} 
          />
        )}

        {/* AI COMPONENT SCANNER */}
        {activeView === 'ai_scanner' && (
          <AIWasteClassifier 
            onNavigateModule={setActiveView} 
          />
        )}

        {/* REPAIR BEFORE REPLACE PLATFORM */}
        {activeView === 'repair' && (
          <RepairPlatform user={user} />
        )}

        {/* CARBON IMPACT & CERTIFICATE CALCULATOR */}
        {activeView === 'calculator' && (
          <EcoImpactCalculator />
        )}
      </main>

      {/* Campus Circular Economy Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-center p-0.5 overflow-hidden">
              <img src={logoImg} alt="EcoLoop" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">EcoLoop Circular Campus Platform</span>
              <span className="text-[11px] text-slate-400">NSS College of Engineering, Palakkad</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="font-semibold text-emerald-800">5 Branches: CSE • Mech • Civil • EEE • IC</span>
            <span>•</span>
            <span>Zero Landfill Mission</span>
            <span>•</span>
            <span>AI Intelligent Diagnostics</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  )
}
