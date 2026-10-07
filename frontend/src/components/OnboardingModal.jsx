import React, { useState } from 'react'
import { 
  Building2, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle,
  LogOut,
  UserCheck
} from 'lucide-react'
import { authService } from '../services/authService'
import EcoLoopLogo from './EcoLoopLogo'

export default function OnboardingModal({ user, onComplete, onLogout }) {
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || 
    user?.user_metadata?.name || 
    user?.email?.split('@')[0] || 
    ''
  )
  const [department, setDepartment] = useState(
    user?.user_metadata?.department || 'Computer Science and Engineering'
  )
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      const updatedUser = await authService.completeOnboarding({
        department,
        fullName: fullName.trim()
      })
      onComplete(updatedUser)
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
            <EcoLoopLogo className="w-9 h-9 shrink-0" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#3ECF8E] font-mono">NSSCE Campus Hub</span>
              <h2 className="text-xl font-bold text-[#EDEDED]">Complete Your Student Profile</h2>
            </div>
          </div>

          <p className="text-xs text-zinc-400">
            Authenticated via Google as <strong className="text-[#3ECF8E] font-mono">{user?.email}</strong>. 
            Confirm your engineering department to personalize hardware exchange and peer repairs.
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
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="e.g., Rahul M (S6 CSE)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] placeholder-zinc-500 text-xs font-medium focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none transition"
            />
          </div>

          {/* Engineering Department */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span>Engineering Department</span>
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
                  <span>Enter EcoLoop Circular Campus</span>
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
              <span>Use a different Google account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
