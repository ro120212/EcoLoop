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

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical and Electronics Engineering',
  'Instrumentation and Control Engineering'
]

const DEPARTMENT_LABS = {
  'Computer Science and Engineering': ['Hardware & Systems Lab', 'IoT & Embedded Lab', 'Networking Lab'],
  'Mechanical Engineering': ['Central Workshop', 'Fab Lab & Mechatronics', 'CAD/CAM Lab'],
  'Civil Engineering': ['Surveying Lab', 'Geotechnical Testing Lab', 'Strength of Materials Lab'],
  'Electrical and Electronics Engineering': ['Power Electronics Lab', 'Electrical Machines Lab', 'Circuits & Measurements Lab'],
  'Instrumentation and Control Engineering': ['Sensors & Transducers Lab', 'Process Control Lab', 'Industrial Instrumentation Lab']
}

export default function RepairPlatform({ user }) {
  const studentId = user?.id || (user?.email ? user.email : 'student')
  const studentName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Student')

  const [deviceName, setDeviceName] = useState('')
  const [symptom, setSymptom] = useState('')
  const [category, setCategory] = useState('Peripherals & Input')
  const [diagnosing, setDiagnosing] = useState(false)
  const [diagnosis, setDiagnosis] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(true)

  // Modals: Manual vs Pre-filled Approval
  const [showManualModal, setShowManualModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)

  // Manual Ticket Form
  const defaultDept = user?.user_metadata?.department || 'Computer Science and Engineering'
  const [manualForm, setManualForm] = useState({
    user_name: studentName,
    device_name: '',
    symptom: '',
    department: defaultDept,
    lab_name: (DEPARTMENT_LABS[defaultDept] || ['Hardware & Systems Lab'])[0],
    technician_name: `${defaultDept.split(' ')[0]} Faculty / Lab In-Charge`
  })

  // Pre-filled Approval Form
  const [ticketForm, setTicketForm] = useState({
    user_name: studentName,
    device_name: '',
    symptom: '',
    department: defaultDept,
    lab_name: (DEPARTMENT_LABS[defaultDept] || ['Hardware & Systems Lab'])[0],
    technician_name: `${defaultDept.split(' ')[0]} Faculty / Lab In-Charge`
  })
  const [submittingTicket, setSubmittingTicket] = useState(false)

  const loadTickets = async () => {
    try {
      setLoadingTickets(true)
      // Only fetch tickets submitted by this specific student across all departments
      const data = await api.getRepairTickets('All', studentId)
      setTickets(data)
    } catch (err) {
      console.error('Failed to load repair tickets:', err)
    } finally {
      setLoadingTickets(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [studentId])

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

  // Open empty manual ticket form
  const handleOpenManualModal = () => {
    setManualForm({
      user_name: studentName,
      device_name: '',
      symptom: '',
      department: defaultDept,
      lab_name: (DEPARTMENT_LABS[defaultDept] || ['Hardware & Systems Lab'])[0],
      technician_name: `${defaultDept.split(' ')[0]} Faculty / Lab In-Charge`
    })
    setShowManualModal(true)
  }

  // Submit manual ticket
  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!manualForm.device_name.trim() || !manualForm.symptom.trim()) {
      alert('Please enter both device name and problem description.')
      return
    }
    try {
      setSubmittingTicket(true)
      await api.createRepairTicket({
        ...manualForm,
        user_id: studentId,
        user_name: manualForm.user_name || studentName || 'Student',
        ai_diagnosis: 'Manual student submission via workbench helpdesk.',
        ai_steps: 'Requires workbench hardware evaluation by lab staff.',
        difficulty: 'Medium',
        tools_needed: 'Workbench tools'
      })
      setShowManualModal(false)
      await loadTickets()
    } catch (err) {
      alert('Error creating ticket: ' + err.message)
    } finally {
      setSubmittingTicket(false)
    }
  }

  // Submit pre-filled AI approved ticket
  const handleApproveTicket = async (e) => {
    e.preventDefault()
    try {
      setSubmittingTicket(true)
      await api.createRepairTicket({
        ...ticketForm,
        user_id: studentId,
        user_name: ticketForm.user_name || studentName || 'Student',
        ai_diagnosis: diagnosis?.likely_root_causes?.join('; ') || '',
        ai_steps: diagnosis?.step_by_step_troubleshooting?.map(s => `${s.step}. ${s.title}: ${s.description}`).join('\n') || '',
        difficulty: diagnosis?.difficulty_level || 'Medium',
        tools_needed: diagnosis?.tools_and_materials_needed?.join(', ') || ''
      })
      setShowApprovalModal(false)
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
      <div className="bg-[#1c1c1c] p-6 rounded-2xl border border-[#2e2e2e] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-[#EDEDED]">Repair Before Replace Platform</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 font-mono">
              AI Diagnostics
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Extend device lifespan instead of generating e-waste. Get AI-guided troubleshooting instructions or submit to department workshops.
          </p>
        </div>

        <button
          onClick={handleOpenManualModal}
          className="px-4 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs shadow-sm transition flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-sm shadow-[#3ECF8E]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Post Repair Help Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Diagnostic Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#1c1c1c] p-6 rounded-2xl border border-[#2e2e2e] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3ECF8E]" />
              <span>AI Fault Diagnostic Assistant</span>
            </h3>

            <form onSubmit={handleDiagnose} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Faulty Device Name *</label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="e.g. Logitech MX Master Mouse"
                  className="w-full px-3 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] placeholder-zinc-500 focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none cursor-pointer"
                >
                  <option value="Peripherals & Input">Peripherals &amp; Input (Keyboard, Mouse)</option>
                  <option value="Laptops & Computers">Laptops &amp; Desktops</option>
                  <option value="Power Supplies & Adapters">Power Supplies &amp; Adapters</option>
                  <option value="Displays & Monitors">Displays &amp; Monitors</option>
                  <option value="Audio & Microphones">Audio, Headphones &amp; Microphones</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Describe Symptoms / Malfunction *</label>
                <textarea
                  rows="3"
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  placeholder="e.g. Left button double-clicks erratically on single press"
                  className="w-full px-3 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] placeholder-zinc-500 focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={diagnosing}
                className="w-full py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs shadow-md shadow-[#3ECF8E]/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {diagnosing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#121212]" />
                    <span>Analyzing Diagnostics...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Diagnose &amp; Generate Repair Guide</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Diagnosis Results */}
        <div className="lg:col-span-7">
          {diagnosis ? (
            <div className="bg-[#1c1c1c] p-6 rounded-2xl border border-[#2e2e2e] shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                    Troubleshooting Analysis
                  </span>
                  <h3 className="text-base font-bold text-[#EDEDED] mt-0.5">{diagnosis.device}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {diagnosis.cached && (
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[11px] font-mono">
                      ⚡ Instant Campus Cache Hit ({diagnosis.cache_hits || 1} hits)
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
                    {diagnosis.difficulty_level} Difficulty
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/30 font-mono">
                    ~{diagnosis.estimated_repair_time_mins} mins
                  </span>
                </div>
              </div>

              {/* Safety Alerts */}
              {diagnosis.safety_warnings?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Critical Safety Warnings:
                  </span>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-zinc-300">
                    {diagnosis.safety_warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Root Causes */}
              <div>
                <h4 className="font-bold text-zinc-200 mb-1">Likely Root Causes:</h4>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  {diagnosis.likely_root_causes?.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Tools Needed */}
              <div className="p-3 rounded-xl bg-[#141414] border border-[#2e2e2e]">
                <span className="font-bold text-zinc-200 block mb-1">Tools &amp; Parts Required:</span>
                <div className="flex flex-wrap gap-1.5">
                  {diagnosis.tools_and_materials_needed?.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-[#242424] border border-[#2e2e2e] text-zinc-300 text-[11px] font-medium font-mono">
                      🔧 {t}
                    </span>
                  ))}
                </div>
                {diagnosis.spare_part_info && (
                  <p className="mt-2 text-[11px] text-zinc-400">
                    <strong className="text-zinc-200">Spare Part Info:</strong> {diagnosis.spare_part_info}
                  </p>
                )}
              </div>

              {/* Step by step */}
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-200">Step-by-Step Diagnostic &amp; Fix:</h4>
                <div className="space-y-2">
                  {diagnosis.step_by_step_troubleshooting?.map((step) => (
                    <div key={step.step} className="p-3 rounded-xl bg-[#141414] border border-[#2e2e2e] space-y-0.5">
                      <div className="font-bold text-[#EDEDED] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#3ECF8E] text-[#121212] font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">
                          {step.step}
                        </span>
                        <span>{step.title}</span>
                      </div>
                      <p className="text-zinc-400 pl-6 leading-relaxed text-xs">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-medium">
                  Verdict: <strong className="text-[#3ECF8E]">{diagnosis.verdict}</strong>
                </span>

                <button
                  onClick={() => {
                    const studentDept = user?.user_metadata?.department || 'Computer Science and Engineering'
                    const labs = DEPARTMENT_LABS[studentDept] || ['Hardware & Systems Lab']
                    setTicketForm({
                      user_name: studentName,
                      device_name: diagnosis.device || deviceName,
                      symptom: symptom,
                      department: studentDept,
                      lab_name: labs[0],
                      technician_name: `${studentDept.split(' ')[0]} Faculty / Lab In-Charge`
                    })
                    setShowApprovalModal(true)
                  }}
                  className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs shadow-sm transition cursor-pointer"
                >
                  Review &amp; Approve Helpdesk Ticket
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full bg-[#1c1c1c] p-12 text-center rounded-2xl border border-[#2e2e2e] shadow-sm flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#232323] text-[#3ECF8E] border border-[#2e2e2e] flex items-center justify-center shadow-sm">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#EDEDED]">Ready for diagnostics</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                Enter your device and symptom on the left. The AI diagnostic engine will generate a safety-checked, step-by-step DIY troubleshooting protocol.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Student's Own Tickets (Only this user's tickets, no multiple branch filters) */}
      <div className="bg-[#1c1c1c] p-6 rounded-2xl border border-[#2e2e2e] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#EDEDED]">My Repair Helpdesk Tickets ({tickets.length})</h3>
            <p className="text-xs text-zinc-400">Track the inspection and triage progress of your submitted hardware repair requests</p>
          </div>
        </div>

        {loadingTickets ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading your repair tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
            You have not submitted any repair tickets yet. Click &quot;Post Repair Help Request&quot; above to submit hardware for faculty inspection!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map(t => {
              const statusBadge = () => {
                switch (t.status) {
                  case 'pending_lab_review':
                    return <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 text-[10px]">⏳ Awaiting Faculty Assessment</span>
                  case 'repaired_returned':
                    return <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[10px]">✅ Repaired & Returned (+8.5kg CO₂e)</span>
                  case 'unrepairable_parts_advised':
                    return <span className="px-2 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-mono">🧩 Advised for Marketplace Parts</span>
                  case 'lab_cannibalized':
                    return <span className="px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[10px] font-mono">🏢 Lab Adopted (Dept Spares)</span>
                  default:
                    return <span className="px-2 py-0.5 rounded-full font-bold bg-[#242424] text-zinc-300 border border-[#2e2e2e] text-[10px] capitalize font-mono">{t.status}</span>
                }
              }

              return (
                <div key={t.id} className="p-4 rounded-xl border border-[#2e2e2e] space-y-3 bg-[#141414] shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 font-mono">
                          {t.department ? t.department.split(' ')[0] : 'General'}
                        </span>
                        {t.lab_name && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#242424] text-zinc-300 border border-[#2e2e2e]">
                            {t.lab_name}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-[#EDEDED] text-sm">{t.device_name}</h4>
                    </div>
                    {statusBadge()}
                  </div>

                  <p className="text-xs text-zinc-300 bg-[#181818] p-2.5 rounded-lg border border-[#2e2e2e]">
                    <strong className="text-[#EDEDED]">Problem Reported:</strong> {t.symptom}
                  </p>

                  {/* Faculty Decision Callout if resolved */}
                  {t.faculty_decision && (
                    <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                      t.faculty_decision === 'repaired_returned' ? 'bg-[#3ECF8E]/10 border-[#3ECF8E]/30 text-[#3ECF8E]' :
                      t.faculty_decision === 'unrepairable_parts_advised' ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' :
                      'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    }`}>
                      <div className="font-bold flex items-center justify-between text-[11px]">
                        <span>
                          {t.faculty_decision === 'repaired_returned' && '✅ Repaired & Returned to Student'}
                          {t.faculty_decision === 'unrepairable_parts_advised' && '🧩 Unrepairable -> Advised to Disassemble for Parts'}
                          {t.faculty_decision === 'lab_cannibalized' && '🏢 Lab Adopted -> Retained for Department Cannibalization'}
                        </span>
                        {t.resolved_by && <span className="font-normal opacity-80">By {t.resolved_by}</span>}
                      </div>
                      {t.faculty_notes && (
                        <p className="text-[11px] leading-relaxed opacity-90">{t.faculty_notes}</p>
                      )}
                      {t.faculty_decision === 'unrepairable_parts_advised' && (
                        <p className="text-[10px] text-purple-400 font-semibold pt-1">
                          💡 You can disassemble this device and list the working parts (screens, chassis, motors) on the Circular Marketplace!
                        </p>
                      )}
                    </div>
                  )}

                  <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1 border-t border-[#2e2e2e]">
                    <span>Requested by: <strong className="text-zinc-300">{t.user_name}</strong></span>
                    <span>Workshop: <strong className="text-zinc-300">{t.technician_name}</strong></span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Manual Ticket Creation Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#1c1c1c] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#2e2e2e] space-y-4 text-[#EDEDED]">
            <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#EDEDED]">Post Repair Help Request</h2>
                  <p className="text-xs text-zinc-400">Describe the issue and dispatch to a campus department lab</p>
                </div>
              </div>
              <button 
                onClick={() => setShowManualModal(false)} 
                className="text-zinc-400 hover:text-[#EDEDED] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Device / Equipment Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dell Latitude 5400, Arduino Mega, Oscilloscope"
                  value={manualForm.device_name}
                  onChange={(e) => setManualForm({ ...manualForm, device_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] text-xs focus:outline-none focus:border-[#3ECF8E] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={manualForm.department}
                    onChange={(e) => {
                      const newDept = e.target.value
                      const labs = DEPARTMENT_LABS[newDept] || ['Hardware & Systems Lab']
                      setManualForm({
                        ...manualForm,
                        department: newDept,
                        lab_name: labs[0],
                        technician_name: `${newDept.split(' ')[0]} Faculty / Lab In-Charge`
                      })
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] text-xs focus:outline-none focus:border-[#3ECF8E] transition cursor-pointer"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d} className="bg-[#1c1c1c] text-[#EDEDED]">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Target Lab / Workshop *
                  </label>
                  <select
                    value={manualForm.lab_name}
                    onChange={(e) => setManualForm({ ...manualForm, lab_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] text-xs focus:outline-none focus:border-[#3ECF8E] transition cursor-pointer"
                  >
                    {(DEPARTMENT_LABS[manualForm.department] || ['Hardware & Systems Lab']).map((lab) => (
                      <option key={lab} value={lab} className="bg-[#1c1c1c] text-[#EDEDED]">
                        {lab}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Problem Description / Symptoms *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain what is wrong (e.g., does not power on, display flickering, unusual clicking noise, broken connector)..."
                  value={manualForm.symptom}
                  onChange={(e) => setManualForm({ ...manualForm, symptom: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] text-xs focus:outline-none focus:border-[#3ECF8E] transition resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[11px] text-zinc-400">
                Assigned Workshop: <strong className="text-zinc-200">{manualForm.technician_name}</strong>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#2e2e2e] text-zinc-400 hover:text-[#EDEDED] hover:bg-[#242424] font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-bold text-xs shadow-md shadow-[#3ECF8E]/20 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submittingTicket ? 'Submitting Request...' : 'Submit Help Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pre-Filled Ticket Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#1c1c1c] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#2e2e2e] space-y-4 text-[#EDEDED]">
            <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#EDEDED]">Approve Hardware Repair Ticket</h2>
                  <p className="text-xs text-zinc-400">Pre-filled diagnostic report ready for department dispatch</p>
                </div>
              </div>
              <button 
                onClick={() => setShowApprovalModal(false)} 
                className="text-zinc-400 hover:text-[#EDEDED] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Pre-filled Summary Card */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#2e2e2e] space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-[#242424] pb-2">
                <span className="text-zinc-400 font-mono text-[11px]">Device:</span>
                <span className="font-bold text-[#EDEDED] text-sm">{ticketForm.device_name || 'Electronics Device'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#242424] pb-2">
                <span className="text-zinc-400 font-mono text-[11px]">Lab Destination:</span>
                <span className="font-semibold text-[#3ECF8E]">{ticketForm.department.split(' ')[0]} — {ticketForm.lab_name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#242424] pb-2">
                <span className="text-zinc-400 font-mono text-[11px]">Assigned Workshop:</span>
                <span className="text-zinc-300">{ticketForm.technician_name}</span>
              </div>
              <div>
                <span className="text-zinc-400 font-mono text-[11px] block mb-1">Issue / Symptom:</span>
                <p className="p-2 rounded-xl bg-[#181818] border border-[#2e2e2e] text-zinc-300 text-xs">
                  {ticketForm.symptom || 'Hardware malfunction requiring workshop inspection.'}
                </p>
              </div>
              {diagnosis && (
                <div>
                  <span className="text-zinc-400 font-mono text-[11px] block mb-1">AI Diagnostic Protocol Attached:</span>
                  <div className="p-2 rounded-xl bg-[#3ECF8E]/5 border border-[#3ECF8E]/20 text-[#3ECF8E] text-[11px]">
                    ✓ Root Causes ({diagnosis.likely_root_causes?.length || 0}) • {diagnosis.difficulty_level} Difficulty • Est. {diagnosis.estimated_repair_time_mins} mins
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-zinc-400">
              By approving, this ticket will be dispatched immediately to the laboratory faculty in-charge. You can drop off the hardware at the lab workshop during campus hours.
            </p>

            <form onSubmit={handleApproveTicket} className="space-y-3 pt-1">
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#2e2e2e] text-zinc-400 hover:text-[#EDEDED] hover:bg-[#242424] font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-bold text-xs shadow-md shadow-[#3ECF8E]/20 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submittingTicket ? 'Dispatching Ticket...' : 'Approve & Submit Repair Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
