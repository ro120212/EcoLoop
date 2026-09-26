import React, { useState } from 'react'
import { 
  GraduationCap, 
  Wrench, 
  ShieldCheck, 
  Building2, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle,
  LogOut,
  Key
} from 'lucide-react'
import { authService, STAFF_PASSCODES } from '../services/authService'
import logoImg from '../assets/logo.png'

export default function OnboardingModal({ user, onComplete, onLogout }) {
  const [role, setRole] = useState('student')
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || 
    user?.user_metadata?.name || 
    user?.email?.split('@')[0] || 
    ''
  )
  const [department, setDepartment] = useState('Computer Science and Engineering')
  const [staffPasscode, setStaffPasscode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.')
      return
    }

    if (role !== 'student' && !staffPasscode.trim()) {
      setErrorMsg(`Department staff verification passcode is required for ${role === 'lab_staff' ? 'Faculty' : 'Administrator'} role.`)
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      const updatedUser = await authService.completeOnboarding({
        role,
        department,
        fullName: fullName.trim(),
        staffPasscode: staffPasscode.trim()
      })
      onComplete(updatedUser, role)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to complete profile. Please verify your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-1 border border-white/20 shadow-md">
              <img src={logoImg} alt="EcoLoop" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Welcome to EcoLoop</span>
              <h2 className="text-xl font-black text-white">Complete Your Campus Profile</h2>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            Signed in with Google as <strong className="text-emerald-300 font-mono">{user?.email}</strong>. 
            Select your college affiliation to personalize your circular dashboard.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="e.g. Rahul M or Prof. Haridasan"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">College Affiliation</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => { setRole('student'); setErrorMsg('') }}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  role === 'student'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className={`w-4 h-4 ${role === 'student' ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span className={`text-xs font-bold ${role === 'student' ? 'text-emerald-950' : 'text-slate-800'}`}>
                    Student
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">Peer reuse, split parts, claim hardware</span>
              </button>

              <button
                type="button"
                onClick={() => { setRole('lab_staff'); setErrorMsg('') }}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  role === 'lab_staff'
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className={`w-4 h-4 ${role === 'lab_staff' ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className={`text-xs font-bold ${role === 'lab_staff' ? 'text-blue-950' : 'text-slate-800'}`}>
                    Faculty / Lab
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">Lab triage, scrap salvage, release assets</span>
              </button>
            </div>
          </div>

          {/* Department Passcode (If faculty selected) */}
          {role !== 'student' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-700" />
                  <span>Faculty / Staff Passcode</span>
                </label>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                  Required
                </span>
              </div>
              <input
                type="password"
                value={staffPasscode}
                onChange={(e) => setStaffPasscode(e.target.value)}
                placeholder="Enter staff verification passcode"
                className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-mono tracking-wider focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-[10px] text-amber-800">
                Contact your Department Lab In-Charge or HOD for the verification key.
              </p>
            </div>
          )}

          {/* Engineering Department */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              <Building2 className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              Department / Branch
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-white"
            >
              <option value="Computer Science and Engineering">Computer Science &amp; Engineering (CSE)</option>
              <option value="Electronics and Communication Engineering">Electronics &amp; Communication (ECE)</option>
              <option value="Electrical and Electronics Engineering">Electrical &amp; Electronics (EEE)</option>
              <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
              <option value="Civil Engineering">Civil Engineering (CE)</option>
              <option value="Instrumentation and Control Engineering">Instrumentation &amp; Control (ICE)</option>
            </select>
          </div>

          {/* Submit & Sign out */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Profile to Supabase...</span>
                </>
              ) : (
                <>
                  <span>Complete Setup &amp; Enter EcoLoop</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Use a different account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
