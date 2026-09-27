import React, { useState, useEffect } from 'react'
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Building2, 
  ArrowRight,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Key,
  Sparkles,
  Wrench,
  Package
} from 'lucide-react'
import { authService } from '../services/authService'
import LiveWallpaper from './LiveWallpaper'
import EcoLoopLogo from './EcoLoopLogo'

function TypewriterText() {
  const phrases = [
    "Transforming campus e-waste into student innovation.",
    "Zero landfill electronics across all 5 engineering branches.",
    "Peer-to-peer component exchange & intelligent AI triage.",
    "Repair before replace — empowering campus engineers."
  ]

  const [phraseIdx, setPhraseIdx] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentPhrase = phrases[phraseIdx]
    let timer

    if (!isDeleting) {
      if (displayText.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setDisplayText(currentPhrase.substring(0, displayText.length + 1))
        }, 40)
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true)
        }, 2200)
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentPhrase.substring(0, displayText.length - 1))
        }, 20)
      } else {
        setIsDeleting(false)
        setPhraseIdx((prev) => (prev + 1) % phrases.length)
      }
    }

    return () => clearTimeout(timer)
  }, [displayText, isDeleting, phraseIdx])

  return (
    <span className="text-[#3ECF8E] font-mono tracking-tight inline-block min-h-[3.6rem] sm:min-h-[4.2rem]">
      {displayText}
      <span className="inline-block w-2.5 h-6 sm:h-7 bg-[#3ECF8E] ml-1.5 translate-y-1 animate-pulse" />
    </span>
  )
}

export default function LoginScreen({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false)
  
  // Login Form
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setErrorMsg('')
    try {
      await authService.signInWithGoogle()
    } catch (err) {
      setErrorMsg(err.message || 'Google authentication failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  // Registration Form
  const [regFullName, setRegFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState('student')
  const [regDepartment, setRegDepartment] = useState('Computer Science and Engineering')
  const [regStaffPasscode, setRegStaffPasscode] = useState('')
  const [regSuccessMsg, setRegSuccessMsg] = useState('')

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!identifier.trim() || !password) {
      setErrorMsg('Please enter both username/email and password.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      const { user, role } = await authService.signIn(identifier, password)
      onLoginSuccess(user, role)
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (!regEmail.trim() || !regPassword) {
      setErrorMsg('Email and password are required.')
      return
    }

    if (regRole !== 'student' && !regStaffPasscode.trim()) {
      setErrorMsg('Department staff verification passcode is required for Faculty / Lab Staff accounts.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setRegSuccessMsg('')
    try {
      await authService.signUp({
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        fullName: regFullName.trim(),
        department: regDepartment,
        staffPasscode: regStaffPasscode
      })
      setRegSuccessMsg('Registration successful! You can now log in using your campus credentials.')
      setIsRegistering(false)
      setIdentifier(regEmail.trim())
      setPassword(regPassword)
      setRegStaffPasscode('')
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 py-10 relative overflow-hidden">
      {/* Continuous Emerald Aurora Live Wallpaper */}
      <LiveWallpaper />

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Column: Project Introduction & Animated Typewriter */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 text-left py-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c1c1c]/90 backdrop-blur-md border border-[#2e2e2e] text-[#3ECF8E] text-xs font-semibold shadow-sm w-fit">
            <Building2 className="w-3.5 h-3.5 text-[#3ECF8E]" />
            <span>NSS College of Engineering, Palakkad</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <EcoLoopLogo className="w-12 h-12 shrink-0" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#EDEDED] tracking-tight flex items-center gap-2">
                  EcoLoop
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#3ECF8E]/15 border border-[#3ECF8E]/30 text-[#3ECF8E] font-mono font-medium">v2.0</span>
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                  University Circular Electronics &amp; E-Waste Reuse Platform
                </p>
              </div>
            </div>
          </div>

          {/* Typewriter Mission Statement Box */}
          <div className="p-5 rounded-2xl bg-[#1c1c1c]/80 backdrop-blur-xl border border-[#2e2e2e] shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3ECF8E]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#3ECF8E] uppercase tracking-wider mb-2 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Mission &amp; Purpose</span>
            </div>
            <div className="min-h-[56px] flex items-center">
              <TypewriterText />
            </div>
          </div>

          {/* Core Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-[#1c1c1c]/60 backdrop-blur-md border border-[#282828] space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/20 flex items-center justify-center text-[#3ECF8E]">
                <Package className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-semibold text-zinc-200">Circular Exchange</h3>
              <p className="text-[11px] text-zinc-400 leading-snug">Pass on microcontrollers, modules, and kits to campus peers safely.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1c1c1c]/60 backdrop-blur-md border border-[#282828] space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/20 flex items-center justify-center text-[#3ECF8E]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-semibold text-zinc-200">AI Waste Classifier</h3>
              <p className="text-[11px] text-zinc-400 leading-snug">Gemini vision diagnostics to inspect components and salvage value.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1c1c1c]/60 backdrop-blur-md border border-[#282828] space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/20 flex items-center justify-center text-[#3ECF8E]">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-semibold text-zinc-200">Repair Before Replace</h3>
              <p className="text-[11px] text-zinc-400 leading-snug">Log hardware tickets and collaborate with peer repair mentors.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Login / Register Card */}
        <div className="lg:col-span-5 w-full">
          <div className="w-full bg-[#1c1c1c]/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#2e2e2e] overflow-hidden">
            {/* Card Header with Pure Transparent EcoLoop Logo */}
            <div className="bg-[#181818]/90 px-6 sm:px-8 pt-7 pb-5 text-center border-b border-[#2e2e2e]">
              <EcoLoopLogo className="w-14 h-14 mx-auto mb-2.5" />
              <h2 className="text-xl font-bold text-[#EDEDED] tracking-tight">
                {isRegistering ? 'Create Campus Account' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                {isRegistering ? 'Register your university profile to get started' : 'Sign in to access your circular hub & tools'}
              </p>
            </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {regSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E] text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#3ECF8E] shrink-0 mt-0.5" />
              <span>{regSuccessMsg}</span>
            </div>
          )}

          {/* Google OAuth Provider */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-2.5 px-4 rounded-xl border border-[#2e2e2e] hover:border-[#3e3e3e] bg-[#232323] hover:bg-[#282828] text-[#EDEDED] font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
            >
              {googleLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#2e2e2e] w-full"></div>
              <span className="bg-[#1c1c1c] px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider shrink-0 font-mono">
                or campus credentials
              </span>
            </div>
          </div>

          {!isRegistering ? (
            /* --- SIGN IN FORM --- */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Username or Campus Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    placeholder="Enter email or student ID"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] placeholder-zinc-500 text-xs font-medium focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] placeholder-zinc-500 text-xs font-medium focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs shadow-lg shadow-[#3ECF8E]/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#121212]" />
                    <span>Signing in to Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Campus Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* --- REGISTRATION FORM --- */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] placeholder-zinc-500 text-xs focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Campus Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  placeholder="student@nssce.ac.in"
                  className="w-full px-3 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] placeholder-zinc-500 text-xs focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  placeholder="Create a secure password"
                  className="w-full px-3 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] placeholder-zinc-500 text-xs focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] text-xs focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="lab_staff">Faculty / Lab Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Department</label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] text-xs focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none"
                  >
                    <option value="Computer Science and Engineering">CSE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Civil Engineering">Civil</option>
                    <option value="Electrical and Electronics Engineering">EEE</option>
                    <option value="Instrumentation and Control Engineering">IC</option>
                  </select>
                </div>
              </div>

              {/* Department Verification Passcode for Faculty and Admin accounts */}
              {regRole !== 'student' && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      {regRole === 'lab_staff' ? 'Faculty Staff Verification Passcode *' : 'Administrator Security Passcode *'}
                    </label>
                    <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                      Verification Key Required
                    </span>
                  </div>
                  <input
                    type="password"
                    value={regStaffPasscode}
                    onChange={(e) => setRegStaffPasscode(e.target.value)}
                    required
                    placeholder="Enter staff passcode"
                    className="w-full px-3 py-2 rounded-xl border border-amber-500/40 bg-[#141414] text-[#EDEDED] text-xs font-mono tracking-wider focus:ring-1 focus:ring-amber-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-amber-300/80 leading-tight">
                    🔒 Restricted: Prevents students from self-assigning faculty or lab triage privileges.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs shadow-md shadow-[#3ECF8E]/20 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Creating Supabase Account...' : 'Complete Registration'}
              </button>
            </form>
          )}

          {/* Toggle Login / Register */}
          <div className="text-center pt-2 border-t border-[#2e2e2e]">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering)
                setErrorMsg('')
                setRegSuccessMsg('')
              }}
              className="text-xs font-medium text-[#3ECF8E] hover:text-[#34B27B] transition"
            >
              {isRegistering 
                ? '← Already have an account? Sign in' 
                : "New user? Register campus account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-zinc-500 max-w-sm relative z-10 font-mono">
        <span>NSSCE Palakkad • 5 Engineering Branches • Built with Supabase</span>
      </div>
    </div>
  )
}
