import React, { useState } from 'react'
import { 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  GraduationCap, 
  Wrench, 
  ArrowRight,
  AlertCircle,
  RefreshCw,
  CheckCircle2
} from 'lucide-react'
import { authService, PRESET_ACCOUNTS } from '../services/authService'
import logoImg from '../assets/logo.png'

export default function LoginScreen({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false)
  
  // Login Form
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Registration Form
  const [regFullName, setRegFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState('student')
  const [regDepartment, setRegDepartment] = useState('Computer Science and Engineering')
  const [regSuccessMsg, setRegSuccessMsg] = useState('')

  // Auto-fill preset credentials
  const handleAutoFill = (roleKey) => {
    const acc = PRESET_ACCOUNTS[roleKey]
    if (acc) {
      setIdentifier(acc.username)
      setPassword(acc.password)
      setErrorMsg('')
    }
  }

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

    setLoading(true)
    setErrorMsg('')
    setRegSuccessMsg('')
    try {
      await authService.signUp({
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        fullName: regFullName.trim(),
        department: regDepartment
      })
      setRegSuccessMsg('Registration successful! You can now log in using your campus credentials.')
      setIsRegistering(false)
      setIdentifier(regEmail.trim())
      setPassword(regPassword)
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex flex-col justify-center items-center px-4 py-8 sm:px-6">
      {/* Top Campus Branding */}
      <div className="w-full max-w-lg text-center mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-md">
          <Building2 className="w-3.5 h-3.5" />
          <span>NSS College of Engineering, Palakkad</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Card Header with New EcoLoop Logo */}
        <div className="bg-gradient-to-b from-slate-50 to-white px-6 sm:px-8 pt-8 pb-4 text-center border-b border-slate-100">
          <div className="w-24 h-24 mx-auto mb-3 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center p-2 overflow-hidden">
            <img 
              src={logoImg} 
              alt="EcoLoop Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">EcoLoop</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            University Circular Electronics &amp; E-Waste Reuse Platform
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {regSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{regSuccessMsg}</span>
            </div>
          )}

          {!isRegistering ? (
            /* --- SIGN IN FORM --- */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username or Campus Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campus Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="student">Student</option>
                    <option value="lab_staff">Faculty / Lab Staff</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="Computer Science and Engineering">CSE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Civil Engineering">Civil</option>
                    <option value="Electrical and Electronics Engineering">EEE</option>
                    <option value="Instrumentation and Control Engineering">IC</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition disabled:opacity-50"
              >
                {loading ? 'Creating Supabase Account...' : 'Complete Registration'}
              </button>
            </form>
          )}

          {/* Toggle Login / Register */}
          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering)
                setErrorMsg('')
                setRegSuccessMsg('')
              }}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              {isRegistering 
                ? '← Already have an account? Sign in' 
                : "New user? Register campus account"}
            </button>
          </div>

          {/* 3 PRESET CAMPUS ACCOUNTS REFERENCE & 1-CLICK AUTOFILL */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Configured Campus Accounts
              </span>
              <span className="text-[10px] text-slate-400">Click to fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Student Account */}
              <button
                type="button"
                onClick={() => handleAutoFill('student')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition group"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">Student</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  <div>user: <strong className="text-slate-700">student</strong></div>
                  <div>pass: <strong className="text-slate-700">student@123</strong></div>
                </div>
              </button>

              {/* Faculty Account */}
              <button
                type="button"
                onClick={() => handleAutoFill('faculty')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition group"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Wrench className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-800">Faculty</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  <div>user: <strong className="text-slate-700">faculty</strong></div>
                  <div>pass: <strong className="text-slate-700">faculty@123</strong></div>
                </div>
              </button>

              {/* Admin Account */}
              <button
                type="button"
                onClick={() => handleAutoFill('admin')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition group"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-purple-800">Admin</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  <div>user: <strong className="text-slate-700">admin</strong></div>
                  <div>pass: <strong className="text-slate-700">admin@123</strong></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-emerald-200/60 max-w-sm">
        <span>NSSCE Palakkad • 5 Engineering Branches • Built with Supabase Auth</span>
      </div>
    </div>
  )
}
