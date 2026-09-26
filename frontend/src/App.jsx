import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import StudentDashboard from './components/StudentDashboard'
import LabStaffDashboard from './components/LabStaffDashboard'
import AdminDashboard from './components/AdminDashboard'
import MarketplaceCircular from './components/MarketplaceCircular'
import AIWasteClassifier from './components/AIWasteClassifier'
import RepairPlatform from './components/RepairPlatform'
import EcoImpactCalculator from './components/EcoImpactCalculator'
import SettingsModal from './components/SettingsModal'
import AuthModal from './components/AuthModal'
import { api } from './services/api'
import { supabase } from './services/supabaseClient'
import { Recycle } from 'lucide-react'

export default function App() {
  const [currentRole, setCurrentRole] = useState('student') // 'student' | 'lab_staff' | 'admin'
  const [activeView, setActiveView] = useState('student_hub')
  const [stats, setStats] = useState(null)
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
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

  // Load user session from Supabase
  useEffect(() => {
    fetchStats()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // When switching roles from anywhere, ensure appropriate hub is active
  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole)
    if (newRole === 'student') setActiveView('student_hub')
    else if (newRole === 'lab_staff') setActiveView('lab_staff_hub')
    else if (newRole === 'admin') setActiveView('admin_hub')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Dynamic Role-Based Top Navigation */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={handleRoleChange}
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
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
              setCurrentRole('student')
              setActiveView('student_hub')
            }} 
          />
        )}

        {/* AI WASTE / COMPONENT VISION SCANNER */}
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
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Recycle className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900">EcoLoop Circular Campus Platform</span>
            <span>• NSS College of Engineering, Palakkad</span>
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

      {/* Modals */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onAuthSuccess={(u) => setUser(u)} 
        />
      )}
    </div>
  )
}
