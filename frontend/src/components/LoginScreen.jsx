import React, { useState, useEffect } from 'react'
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Key
} from 'lucide-react'
import { authService } from '../services/authService'
import LiveWallpaper from './LiveWallpaper'
import EcoLoopLogo from './EcoLoopLogo'

function MultilineTypewriter() {
  const sequences = [
    {
      kicker: "// NSSCE CIRCULAR ELECTRONICS INITIATIVE",
      headline: "Turn Campus E-Waste Into Raw Potential.",
      editorial: "Reclaiming circuits, sensors, and lab kits.",
      narrative: "A circular exchange ecosystem empowering engineering students and faculty to trade microcontrollers, diagnose hardware with AI, and restore before replacing."
    },
    {
      kicker: "// ZERO LANDFILL ENGINEERING IN ACTION",
      headline: "Repair First. Replace Never.",
      editorial: "Where discarded components find second lives.",
      narrative: "Equipping the next generation of engineers with AI-powered diagnostics and peer repair mentorship across all 5 engineering branches."
    },
    {
      kicker: "// INTELLIGENT HARDWARE SALVAGE",
      headline: "Smart Vision. Circular Campus.",
      editorial: "Instantly inspect, triage, and list electronics.",
      narrative: "Transform unused Arduino, Raspberry Pi, and test kits into shared academic resources for peer projects and practical learning."
    }
  ]

  const [seqIdx, setSeqIdx] = useState(0)
  const [lineIdx, setLineIdx] = useState(0)
  const [charCounts, setCharCounts] = useState([0, 0, 0, 0])
  const [phase, setPhase] = useState('typing') // 'typing' | 'pause' | 'deleting'

  const currentSeq = sequences[seqIdx]
  const currentLines = [
    currentSeq.kicker,
    currentSeq.headline,
    currentSeq.editorial,
    currentSeq.narrative
  ]

  useEffect(() => {
    let timer

    if (phase === 'typing') {
      const targetLen = currentLines[lineIdx].length
      const currentLen = charCounts[lineIdx]

      if (currentLen < targetLen) {
        timer = setTimeout(() => {
          setCharCounts(prev => {
            const next = [...prev]
            next[lineIdx] = currentLen + 1
            return next
          })
        }, lineIdx === 0 ? 25 : (lineIdx === 1 ? 35 : 28))
      } else {
        if (lineIdx < currentLines.length - 1) {
          timer = setTimeout(() => {
            setLineIdx(prev => prev + 1)
          }, 160)
        } else {
          setPhase('pause')
        }
      }
    } else if (phase === 'pause') {
      timer = setTimeout(() => {
        setPhase('deleting')
      }, 7500)
    } else if (phase === 'deleting') {
      const currentLen = charCounts[lineIdx]

      if (currentLen > 0) {
        timer = setTimeout(() => {
          setCharCounts(prev => {
            const next = [...prev]
            next[lineIdx] = Math.max(0, currentLen - 2)
            return next
          })
        }, 12)
      } else {
        if (lineIdx > 0) {
          setLineIdx(prev => prev - 1)
        } else {
          setSeqIdx(prev => (prev + 1) % sequences.length)
          setLineIdx(0)
          setCharCounts([0, 0, 0, 0])
          setPhase('typing')
        }
      }
    }

    return () => clearTimeout(timer)
  }, [phase, lineIdx, charCounts, seqIdx])

  return (
    <div className="space-y-3 sm:space-y-4 text-left select-none">
      {/* Line 0: Tech Kicker (JetBrains Mono, emerald, uppercase) */}
      <div className="min-h-[1.5rem] flex items-center">
        <span className="font-mono text-xs sm:text-sm font-semibold tracking-[0.25em] text-[#3ECF8E] uppercase">
          {currentLines[0].slice(0, charCounts[0])}
        </span>
        {((phase === 'typing' && lineIdx === 0) || (phase === 'deleting' && lineIdx === 0)) && (
          <span className="inline-block w-2 h-3.5 bg-[#3ECF8E] ml-1.5 animate-pulse" />
        )}
      </div>

      {/* Line 1: Hero Display Headline (Geist Sans, extra bold/black, large scale) */}
      <div className="min-h-[4.2rem] sm:min-h-[6.2rem] flex items-center">
        <h1 className="font-sans font-black text-3xl sm:text-5xl lg:text-[3.4rem] text-[#EDEDED] tracking-tight leading-[1.08]">
          {currentLines[1].slice(0, charCounts[1])}
          {((phase === 'typing' && lineIdx === 1) || (phase === 'deleting' && lineIdx === 1)) && (
            <span className="inline-block w-2 sm:w-2.5 h-7 sm:h-10 bg-[#3ECF8E] ml-2 translate-y-1 animate-pulse" />
          )}
        </h1>
      </div>

      {/* Line 2: Editorial Vision Accent (Instrument Serif, italic, mint/soft emerald) */}
      <div className="min-h-[2.2rem] sm:min-h-[2.8rem] flex items-center">
        <p className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-emerald-200/90 font-normal leading-tight">
          {currentLines[2].slice(0, charCounts[2])}
          {((phase === 'typing' && lineIdx === 2) || (phase === 'deleting' && lineIdx === 2)) && (
            <span className="inline-block w-2 sm:w-2.5 h-6 sm:h-7 bg-[#3ECF8E] ml-1.5 translate-y-0.5 animate-pulse" />
          )}
        </p>
      </div>

      {/* Line 3: Mission Narrative Body (Geist Regular, clean readable zinc) */}
      <div className="min-h-[3.2rem] sm:min-h-[4.2rem] flex items-center">
        <p className="font-sans text-xs sm:text-sm lg:text-base text-zinc-300/90 font-light leading-relaxed max-w-xl">
          {currentLines[3].slice(0, charCounts[3])}
          {((phase === 'typing' && lineIdx === 3) || (phase === 'deleting' && lineIdx === 3) || phase === 'pause') && (
            <span className="inline-block w-1.5 sm:w-2 h-4 sm:h-5 bg-[#3ECF8E] ml-1.5 translate-y-0.5 animate-pulse" />
          )}
        </p>
      </div>
    </div>
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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 py-10 pb-16 sm:pb-20 relative overflow-hidden">
      {/* Continuous Emerald Aurora Live Wallpaper */}
      <LiveWallpaper />

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Column: Multiline Typographic Presentation directly on canvas */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 text-left py-4">
          {/* Top Identity: App Name + Logo */}
          <div className="flex items-center gap-3.5">
            <EcoLoopLogo className="w-12 h-12 shrink-0 drop-shadow-[0_0_25px_rgba(62,207,142,0.45)]" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#EDEDED] tracking-tight">
                EcoLoop
              </h1>
              <p className="text-xs text-zinc-400 font-medium">
                University Circular Electronics &amp; E-Waste Reuse Platform
              </p>
            </div>
          </div>

          {/* Multiline Sequential Typewriter (Directly on screen canvas, NO box) */}
          <div className="py-2">
            <MultilineTypewriter />
          </div>
        </div>

        {/* Right Column: Login / Register Card */}
        <div className="lg:col-span-5 w-full">
          <div className="w-full bg-[#1c1c1c]/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#2e2e2e] overflow-hidden">
            {/* Card Header (Clean header without duplicate logo) */}
            <div className="bg-[#181818]/90 px-6 sm:px-8 pt-7 pb-5 text-center border-b border-[#2e2e2e]">
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

      {/* Bottom Center: Simple Institution Text (No Badging, Positioned Lower) */}
      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center text-xs text-zinc-400/80 font-medium tracking-wider z-10 font-mono pointer-events-none">
        NSS College of Engineering, Palakkad
      </div>
    </div>
  )
}
