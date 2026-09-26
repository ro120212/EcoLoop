import React, { useState, useEffect } from 'react'
import { 
  Wrench, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  HelpCircle, 
  Plus, 
  Hammer,
  ShieldAlert,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import { api } from '../services/api'

export default function RepairPlatform() {
  const [deviceName, setDeviceName] = useState('')
  const [symptom, setSymptom] = useState('')
  const [category, setCategory] = useState('Peripherals & Input')
  const [diagnosing, setDiagnosing] = useState(false)
  const [diagnosis, setDiagnosis] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [showTicketModal, setShowTicketModal] = useState(false)

  // Ticket form
  const [ticketForm, setTicketForm] = useState({
    user_name: '',
    device_name: '',
    symptom: '',
    technician_name: 'Campus Makerspace Club'
  })
  const [submittingTicket, setSubmittingTicket] = useState(false)

  const loadTickets = async () => {
    try {
      setLoadingTickets(true)
      const data = await api.getRepairTickets()
      setTickets(data)
    } catch (err) {
      console.error('Failed to load repair tickets:', err)
    } finally {
      setLoadingTickets(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const handleDiagnose = async (e) => {
    e.preventDefault()
    if (!deviceName || !symptom) return
    try {
      setDiagnosing(true)
      const data = await api.diagnoseRepair(deviceName, symptom, category)
      setDiagnosis(data)
    } catch (err) {
      alert('Diagnosis error: ' + err.message)
    } finally {
      setDiagnosing(false)
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    try {
      setSubmittingTicket(true)
      await api.createRepairTicket({
        ...ticketForm,
        ai_diagnosis: diagnosis?.likely_root_causes?.join('; ') || '',
        ai_steps: diagnosis?.step_by_step_troubleshooting?.map(s => `${s.step}. ${s.title}: ${s.description}`).join('\n') || '',
        difficulty: diagnosis?.difficulty_level || 'Medium',
        tools_needed: diagnosis?.tools_and_materials_needed?.join(', ') || ''
      })
      setShowTicketModal(false)
      setTicketForm({
        user_name: '',
        device_name: '',
        symptom: '',
        technician_name: 'Campus Makerspace Club'
      })
      await loadTickets()
    } catch (err) {
      alert('Error saving ticket: ' + err.message)
    } finally {
      setSubmittingTicket(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Repair Before Replace Platform</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
              Gemini AI Diagnostic
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Extend device lifespan instead of generating e-waste. Get AI-guided troubleshooting instructions or find campus student technicians.
          </p>
        </div>

        <button
          onClick={() => setShowTicketModal(true)}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Repair Help Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Diagnostic Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>AI Fault Diagnostic Assistant</span>
            </h3>

            <form onSubmit={handleDiagnose} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Faulty Device Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dell Inspiron 15 / Logitech G102 Mouse / Samsung LCD"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="Peripherals & Input">Peripherals & Input (Keyboard, Mouse)</option>
                  <option value="Laptops & Computers">Laptops & Desktops</option>
                  <option value="Power Supplies & Adapters">Power Supplies & Adapters</option>
                  <option value="Displays & Monitors">Displays & Monitors</option>
                  <option value="Audio & Microphones">Audio, Headphones & Microphones</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Describe Symptoms / Malfunction *</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Left click registers twice or skips, scroll wheel jumps backwards when scrolling down."
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                ></textarea>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeviceName('Logitech Optical Mouse')
                    setSymptom('Left click button registers double-click intermittently')
                  }}
                  className="text-[11px] text-orange-600 hover:underline"
                >
                  Example: Mouse Double-Click
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setDeviceName('HP Laptop Charger')
                    setSymptom('Only charges when cable is bent at a specific angle near the barrel plug')
                  }}
                  className="text-[11px] text-orange-600 hover:underline"
                >
                  Example: Frayed Charger
                </button>
              </div>

              <button
                type="submit"
                disabled={diagnosing}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-md shadow-orange-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {diagnosing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Diagnose & Generate Repair Guide</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Diagnosis Results */}
        <div className="lg:col-span-7">
          {diagnosis ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Troubleshooting Analysis
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{diagnosis.device}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-orange-100 text-orange-800">
                    {diagnosis.difficulty_level} Difficulty
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                    ~{diagnosis.estimated_repair_time_mins} mins
                  </span>
                </div>
              </div>

              {/* Safety Alerts */}
              {diagnosis.safety_warnings?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    Critical Safety Warnings:
                  </span>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {diagnosis.safety_warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Root Causes */}
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Likely Root Causes:</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {diagnosis.likely_root_causes?.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Tools Needed */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">Tools & Parts Required:</span>
                <div className="flex flex-wrap gap-1.5">
                  {diagnosis.tools_and_materials_needed?.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                      🔧 {t}
                    </span>
                  ))}
                </div>
                {diagnosis.spare_part_info && (
                  <p className="mt-2 text-[11px] text-slate-600">
                    <strong>Spare Part Info:</strong> {diagnosis.spare_part_info}
                  </p>
                )}
              </div>

              {/* Step by step */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">Step-by-Step Diagnostic & Fix:</h4>
                <div className="space-y-2">
                  {diagnosis.step_by_step_troubleshooting?.map((step) => (
                    <div key={step.step} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">
                          {step.step}
                        </span>
                        <span>{step.title}</span>
                      </div>
                      <p className="text-slate-600 pl-6 leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Verdict: <strong className="text-emerald-700">{diagnosis.verdict}</strong>
                </span>

                <button
                  onClick={() => {
                    setTicketForm({
                      user_name: 'Student Fixer',
                      device_name: diagnosis.device,
                      symptom: symptom,
                      technician_name: 'Campus Makerspace Club'
                    })
                    setShowTicketModal(true)
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm transition"
                >
                  Create Community Fix Ticket
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Ready for diagnostics</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Enter your device and symptom on the left. The Google Gemini API will generate a safety-checked, step-by-step DIY troubleshooting protocol.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Community Tickets */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Campus Repair Tickets & Hobbyist Directory</h3>
            <p className="text-xs text-slate-500">Student electronics repairs handled through department makerspaces</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map(t => (
            <div key={t.id} className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{t.device_name}</span>
                <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[10px] capitalize">
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-slate-600"><strong>Problem:</strong> {t.symptom}</p>
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200">
                <span>Requested by: <strong>{t.user_name}</strong></span>
                <span>Assigned: <strong>{t.technician_name}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Post Campus Repair Ticket</h2>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Name & Department *</label>
                <input
                  type="text"
                  placeholder="e.g. Arun S (S5 ECE)"
                  value={ticketForm.user_name}
                  onChange={(e) => setTicketForm({...ticketForm, user_name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Device Name *</label>
                <input
                  type="text"
                  placeholder="e.g. HP Pavilion Laptop"
                  value={ticketForm.device_name}
                  onChange={(e) => setTicketForm({...ticketForm, device_name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Problem Description *</label>
                <textarea
                  rows="2"
                  placeholder="Describe what happens when you turn it on..."
                  value={ticketForm.symptom}
                  onChange={(e) => setTicketForm({...ticketForm, symptom: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campus Workshop / Fixer Group</label>
                <select
                  value={ticketForm.technician_name}
                  onChange={(e) => setTicketForm({...ticketForm, technician_name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="Campus Makerspace Club">Campus Makerspace Club (Central Workshop)</option>
                  <option value="ECE Hardware & IoT Club">ECE Hardware & IoT Club</option>
                  <option value="CSE Open Source Lab">CSE Open Source Lab</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md shadow-orange-600/30 transition disabled:opacity-50"
                >
                  {submittingTicket ? 'Posting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
