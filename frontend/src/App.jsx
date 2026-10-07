import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import LoginScreen from './components/LoginScreen'
import OnboardingModal from './components/OnboardingModal'
import StudentDashboard from './components/StudentDashboard'
import MarketplaceCircular from './components/MarketplaceCircular'
import AIWasteClassifier from './components/AIWasteClassifier'
import RepairPlatform from './components/RepairPlatform'
import { api } from './services/api'
import { supabase } from './services/supabaseClient'
import { isNssceEmail, authService } from './services/authService'
import LiveWallpaper from './components/LiveWallpaper'
import EcoLoopLogo from './components/EcoLoopLogo'
import { RefreshCw } from 'lucide-react'
import CustomCursor from './components/CustomCursor'
import { useToast } from './context/ToastContext'

export default function App() {
  const toast = useToast()
  const [user, setUser] = useState(null)
  const [activeView, setActiveView] = useState('student_hub')
  const [dashboardTab, setDashboardTab] = useState('seller')
  const [stats, setStats] = useState(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [domainError, setDomainError] = useState('')

  // Fetch global metrics
  const fetchStats = async () => {
    try {
      const data = await api.getStats()
      setStats(data)
    } catch (err) {
      console.warn('Could not load global stats:', err)
    }
  }

  // Verify domain and sync authenticated user
  const syncUser = async (authenticatedUser) => {
    if (!authenticatedUser) {
      setUser(null)
      return
    }

    const email = authenticatedUser.email || ''
    if (!isNssceEmail(email)) {
      await authService.signOut()
      setUser(null)
      setDomainError('Access Denied: EcoLoop is strictly restricted to NSS College of Engineering accounts. Please sign in with your official @nssce.ac.in Google email.')
      return
    }

    setDomainError('')
    setUser(authenticatedUser)
  }

  // Load user session from Supabase on mount
  useEffect(() => {
    fetchStats()
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session?.user ?? null)
      setLoadingSession(false)
    }).catch(() => {
      setLoadingSession(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await authService.signOut()
    setUser(null)
    setActiveView('student_hub')
    setDomainError('')
    toast.info('Signed Out', 'You have been signed out of EcoLoop.')
  }

  const handleLoginSuccess = (authenticatedUser) => {
    setUser(authenticatedUser)
    setActiveView('student_hub')
    setDomainError('')
    const name = authenticatedUser?.user_metadata?.full_name || authenticatedUser?.email?.split('@')[0] || 'Student'
    toast.success('Welcome to EcoLoop!', `Logged in as ${name}.`)
  }

  const handleOnboardingComplete = (updatedUser) => {
    setUser(updatedUser)
    setActiveView('student_hub')
    toast.success('Profile Setup Complete!', 'Welcome to the NSSCE Circular Campus.')
  }

  // Initial session check spinner
  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-[#EDEDED] space-y-4">
        <CustomCursor />
        <div className="w-12 h-12 rounded-2xl bg-[#1c1c1c] border border-[#2e2e2e] flex items-center justify-center shadow-[0_0_25px_rgba(62,207,142,0.15)]">
          <RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" />
        </div>
        <p className="text-xs text-zinc-400 font-mono tracking-wider">Connecting to Supabase Campus Auth...</p>
      </div>
    )
  }

  // If not logged in, display the dedicated Login Screen
  if (!user) {
    return (
      <>
        <CustomCursor />
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess} 
          externalError={domainError}
        />
      </>
    )
  }

  // If logged in via Google OAuth but department metadata not yet completed
  if (!user.user_metadata?.department) {
    return (
      <>
        <CustomCursor />
        <OnboardingModal 
          user={user} 
          onComplete={handleOnboardingComplete} 
          onLogout={handleLogout} 
        />
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-[#EDEDED] relative overflow-x-hidden">
      {/* Precision Supabase Cursor */}
      <CustomCursor />

      {/* Continuous Emerald Aurora Live Wallpaper */}
      <LiveWallpaper />

      {/* Top Navigation */}
      <div className="relative z-40">
        <Navbar
          activeView={activeView}
          setActiveView={setActiveView}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* STUDENT HUB (DASHBOARD, LISTINGS, PIN HANDOFFS) */}
        {activeView === 'student_hub' && (
          <StudentDashboard 
            user={user} 
            onNavigate={setActiveView} 
            initialTab={dashboardTab}
            onTabChange={setDashboardTab}
          />
        )}

        {/* CIRCULAR MARKETPLACE & COMPONENT SPLITTING */}
        {activeView === 'marketplace' && (
          <MarketplaceCircular 
            user={user} 
            onGoToPortfolio={(tab = 'buyer') => {
              setDashboardTab(tab)
              setActiveView('student_hub')
            }} 
          />
        )}

        {/* AI COMPONENT SCANNER */}
        {activeView === 'ai_scanner' && (
          <AIWasteClassifier 
            user={user}
            onNavigateModule={setActiveView} 
          />
        )}

        {/* PUBLIC PEER REPAIR PLATFORM */}
        {activeView === 'repair' && (
          <RepairPlatform user={user} />
        )}
      </main>

      {/* Campus Circular Economy Footer */}
      <footer className="border-t border-[#2e2e2e] bg-[#171717] py-6 mt-16 text-xs text-zinc-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <EcoLoopLogo className="w-7 h-7" />
            <div>
              <span className="font-semibold text-[#EDEDED] block tracking-tight">EcoLoop Circular Campus Platform</span>
              <span className="text-[11px] text-zinc-500">NSS College of Engineering, Palakkad</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#3ECF8E] font-mono font-semibold">Peer-to-Peer Zero Landfill Campus</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
