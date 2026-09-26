import React, { useState } from 'react'
import { 
  GraduationCap, 
  Wrench, 
  Building2, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle,
  LogOut,
  Key
} from 'lucide-react'
import { authService } from '../services/authService'
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1c1c1c] rounded-3xl max-w-lg w-full border border-[#2e2e2e] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#181818] border-b border-[#2e2e2e] text-[#EDEDED] p-6 sm:p-7 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#141414] p-1 border border-[#2e2e2e] shadow-md flex items-center justify-center">
              <img src={logoImg} alt="EcoLoop" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#3ECF8E] font-mono">Welcome to EcoLoop</span>
              <h2 className="text-xl font-bold text-[#EDEDED]">Complete Your Campus Profile</h2>
            </div>
          </div>

          <p className="text-xs text-zinc-400">
            Signed in with Google as <strong className="text-[#3ECF8E] font-mono">{user?.email}</strong>. 
            Select your college affiliation to personalize your circular dashboard.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Enter your full name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] placeholder-zinc-500 text-xs font-medium focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none transition"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">College Affiliation</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => { setRole('student'); setErrorMsg('') }}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  role === 'student'
                    ? 'border-[#3ECF8E] bg-[#3ECF8E]/10 ring-1 ring-[#3ECF8E] shadow-[0_0_12px_rgba(62,207,142,0.15)]'
                    : 'border-[#2e2e2e] bg-[#232323] hover:bg-[#282828] text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className={`w-4 h-4 ${role === 'student' ? 'text-[#3ECF8E]' : 'text-zinc-500'}`} />
                  <span className={`text-xs font-bold ${role === 'student' ? 'text-[#EDEDED]' : 'text-zinc-300'}`}>
                    Student
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 leading-tight">Peer reuse, split parts, claim hardware</span>
              </button>

              <button
                type="button"
                onClick={() => { setRole('lab_staff'); setErrorMsg('') }}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  role === 'lab_staff'
                    ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                    : 'border-[#2e2e2e] bg-[#232323] hover:bg-[#282828] text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className={`w-4 h-4 ${role === 'lab_staff' ? 'text-blue-400' : 'text-zinc-500'}`} />
                  <span className={`text-xs font-bold ${role === 'lab_staff' ? 'text-[#EDEDED]' : 'text-zinc-300'}`}>
                    Faculty / Lab
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 leading-tight">Lab triage, scrap salvage, release assets</span>
              </button>
            </div>
          </div>

          {/* Department Passcode (If faculty selected) */}
          {role !== 'student' && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Faculty / Staff Passcode</span>
                </label>
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  Required
                </span>
              </div>
              <input
                type="password"
                value={staffPasscode}
                onChange={(e) => setStaffPasscode(e.target.value)}
                placeholder="Enter staff verification passcode"
                className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-amber-500/40 text-[#EDEDED] text-xs font-mono tracking-wider focus:ring-1 focus:ring-amber-400 focus:outline-none"
              />
              <p className="text-[10px] text-amber-300/80">
                Contact your Department Lab In-Charge or HOD for the verification key.
              </p>
            </div>
          )}

          {/* Engineering Department */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              <Building2 className="w-3.5 h-3.5 inline mr-1 text-zinc-500" />
              Department / Branch
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] text-xs font-medium focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none transition cursor-pointer"
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
              className="w-full py-3 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs shadow-lg shadow-[#3ECF8E]/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#121212]" />
                  <span>Saving Profile...</span>
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
              className="w-full py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
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
