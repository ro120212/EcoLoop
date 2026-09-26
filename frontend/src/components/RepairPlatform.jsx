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

export default function RepairPlatform() {
  const [deviceName, setDeviceName] = useState('')
  const [symptom, setSymptom] = useState('')
  const [category, setCategory] = useState('Peripherals & Input')
  const [diagnosing, setDiagnosing] = useState(false)
  const [diagnosis, setDiagnosis] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [selectedFilterDept, setSelectedFilterDept] = useState('All')

  // Ticket form
  const [ticketForm, setTicketForm] = useState({
    user_name: '',
    device_name: '',
    symptom: '',
    department: 'Computer Science and Engineering',
    lab_name: 'Hardware & Systems Lab',
    technician_name: 'CSE Faculty / Lab In-Charge'
  })
  const [submittingTicket, setSubmittingTicket] = useState(false)

  const loadTickets = async (dept = selectedFilterDept) => {
    try {
      setLoadingTickets(true)
      const data = await api.getRepairTickets(dept)
      setTickets(data)
    } catch (err) {
      console.error('Failed to load repair tickets:', err)
    } finally {
      setLoadingTickets(false)
    }
  }

  useEffect(() => {
    loadTickets(selectedFilterDept)
  }, [selectedFilterDept])

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
        department: 'Computer Science and Engineering',
        lab_name: 'Hardware & Systems Lab',
        technician_name: 'CSE Faculty / Lab In-Charge'
      })
      await loadTickets(selectedFilterDept)
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
                      department: 'Computer Science and Engineering',
                      lab_name: 'Hardware & Systems Lab',
                      technician_name: 'CSE Faculty / Lab In-Charge'
                    })
                    setShowTicketModal(true)
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm transition"
                >
                  Create Helpdesk Ticket
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

      {/* Community / Department Tickets */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Department Workshop Helpdesk & Repair Tickets</h3>
            <p className="text-xs text-slate-500">Student electronics and equipment repair tickets triaged by NSSCE department faculty and lab staff</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['All', ...DEPARTMENTS].map(d => (
              <button
                key={d}
                onClick={() => setSelectedFilterDept(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedFilterDept === d
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d === 'All' ? 'All Departments' : d.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {loadingTickets ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading department repair tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
            No repair tickets found for this department filter. Click &quot;Post Repair Help Request&quot; above to submit one!
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
                    return <span className="px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 text-[10px]">🧩 Advised for Marketplace Parts</span>
                  case 'lab_cannibalized':
                    return <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 text-[10px]">🏢 Lab Adopted (Dept Spares)</span>
                  default:
                    return <span className="px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 text-[10px] capitalize">{t.status}</span>
                }
              }

              return (
                <div key={t.id} className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/60 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {t.department ? t.department.split(' ')[0] : 'General'}
                        </span>
                        {t.lab_name && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {t.lab_name}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{t.device_name}</h4>
                    </div>
                    {statusBadge()}
                  </div>

                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                    <strong className="text-slate-800">Problem Reported:</strong> {t.symptom}
                  </p>

                  {/* Faculty Decision Callout if resolved */}
                  {t.faculty_decision && (
                    <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                      t.faculty_decision === 'repaired_returned' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' :
                      t.faculty_decision === 'unrepairable_parts_advised' ? 'bg-purple-50/80 border-purple-200 text-purple-950' :
                      'bg-indigo-50/80 border-indigo-200 text-indigo-950'
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
                        <p className="text-[10px] text-purple-700 font-semibold pt-1">
                          💡 You can disassemble this device and list the working parts (screens, chassis, motors) on the Circular Marketplace!
                        </p>
                      )}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200">
                    <span>Requested by: <strong className="text-slate-700">{t.user_name}</strong></span>
                    <span>Workshop: <strong className="text-slate-700">{t.technician_name}</strong></span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Post Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Post Department Helpdesk Ticket</h2>
                <p className="text-xs text-slate-500">Route your broken equipment to college lab staff & technicians</p>
              </div>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Name & Roll No. *</label>
                <input
                  type="text"
                  placeholder="e.g. Arun S (S5 CSE, Roll 22)"
                  value={ticketForm.user_name}
                  onChange={(e) => setTicketForm({...ticketForm, user_name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Department Workshop *</label>
                <select
                  value={ticketForm.department}
                  onChange={(e) => {
                    const dept = e.target.value
                    const labs = DEPARTMENT_LABS[dept] || ['General Workshop']
                    setTicketForm({
                      ...ticketForm,
                      department: dept,
                      lab_name: labs[0],
                      technician_name: `${dept.split(' ')[0]} Faculty / Lab In-Charge`
                    })
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specific Lab / Workshop Helpdesk *</label>
                <select
                  value={ticketForm.lab_name}
                  onChange={(e) => setTicketForm({...ticketForm, lab_name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  {(DEPARTMENT_LABS[ticketForm.department] || ['General Workshop']).map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Device Name & Model *</label>
                <input
                  type="text"
                  placeholder="e.g. HP Pavilion 15 / Arduino Mega / DSO Oscilloscope"
                  value={ticketForm.device_name}
                  onChange={(e) => setTicketForm({...ticketForm, device_name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Problem Description / Symptoms *</label>
                <textarea
                  rows="2"
                  placeholder="Describe what happens (e.g. power LED blinks twice then dies, burning smell, screen backlight off)..."
                  value={ticketForm.symptom}
                  onChange={(e) => setTicketForm({...ticketForm, symptom: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                ></textarea>
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
                  {submittingTicket ? 'Submitting...' : 'Submit to Helpdesk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
