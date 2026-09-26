import React, { useState } from 'react'
import { User, Lock, Mail, Building, Check, Sparkles } from 'lucide-react'
import { supabase } from '../services/supabaseClient'

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [department, setDepartment] = useState('Computer Science and Engineering')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role, department }
          }
        })
        if (signUpError) throw signUpError
        if (data?.user) {
          onAuthSuccess(data.user)
          onClose()
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (signInError) throw signInError
        if (data?.user) {
          onAuthSuccess(data.user)
          onClose()
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Quick Demo Persona Switcher
  const handleQuickDemo = (demoRole) => {
    const mockUser = {
      id: `demo-${demoRole}`,
      email: `${demoRole}.demo@nssce.ac.in`,
      user_metadata: {
        role: demoRole,
        department: 'Computer Science and Engineering'
      }
    }
    onAuthSuccess(mockUser)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isSignUp ? 'Campus Registration' : 'Campus Portal Sign In'}
            </h2>
            <p className="text-xs text-slate-500">NSS College of Engineering • EcoLoop</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
        </div>

        {/* Quick Demo Switcher */}
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
          <span className="text-[11px] font-bold text-emerald-900 block flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            1-Click Instant Demo Login:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="py-1.5 px-2 rounded-xl bg-white hover:bg-emerald-100/60 border border-emerald-200 text-[11px] font-bold text-emerald-800 transition shadow-xs text-center"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('lab_staff')}
              className="py-1.5 px-2 rounded-xl bg-white hover:bg-emerald-100/60 border border-emerald-200 text-[11px] font-bold text-emerald-800 transition shadow-xs text-center"
            >
              🔬 Lab Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 rounded-xl bg-white hover:bg-emerald-100/60 border border-emerald-200 text-[11px] font-bold text-emerald-800 transition shadow-xs text-center"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        <div className="relative text-center my-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <span className="relative bg-white px-2 text-[10px] uppercase font-bold text-slate-400">or Supabase Auth</span>
        </div>

        <form onSubmit={handleAuth} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Campus Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                placeholder="name@nssce.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {isSignUp && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campus Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="student">Student / Research Scholar</option>
                  <option value="lab_staff">Lab Assistant / Tech Staff</option>
                  <option value="admin">Department Faculty / Administrator</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Computer Science and Engineering">Computer Science (CSE)</option>
                  <option value="Electronics and Communication">Electronics & Comm (ECE)</option>
                  <option value="Electrical and Electronics">Electrical & Electronics (EEE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>
            </>
          )}

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Campus Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          {isSignUp ? (
            <span>Already have an account? <button onClick={() => setIsSignUp(false)} className="text-emerald-700 font-bold hover:underline">Sign In</button></span>
          ) : (
            <span>New student or staff? <button onClick={() => setIsSignUp(true)} className="text-emerald-700 font-bold hover:underline">Register Account</button></span>
          )}
        </div>
      </div>
    </div>
  )
}
