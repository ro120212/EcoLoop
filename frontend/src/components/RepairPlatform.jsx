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
  Search,
  Filter,
  Users,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Award,
  Lightbulb
} from 'lucide-react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Instrumentation and Control Engineering'
]

const DEPARTMENT_LABS = {
  'Computer Science and Engineering': ['Hardware & Systems Lab', 'IoT & Embedded Lab', 'Networking Lab'],
  'Electronics and Communication Engineering': ['Communication Systems Lab', 'VLSI & Embedded Systems Lab', 'Digital Signal Processing Lab'],
  'Electrical and Electronics Engineering': ['Power Electronics Lab', 'Electrical Machines Lab', 'Circuits & Measurements Lab'],
  'Mechanical Engineering': ['Central Workshop', 'Fab Lab & Mechatronics', 'CAD/CAM Lab'],
  'Civil Engineering': ['Surveying Lab', 'Geotechnical Testing Lab', 'Strength of Materials Lab'],
  'Instrumentation and Control Engineering': ['Sensors & Transducers Lab', 'Process Control Lab', 'Industrial Instrumentation Lab']
}

export default function RepairPlatform({ user }) {
  const toast = useToast()
  const studentId = user?.id || (user?.email ? user.email : 'student')
  const studentName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Student')
  const defaultDept = user?.user_metadata?.department || 'Computer Science and Engineering'

  // Diagnostic Assistant States
  const [deviceName, setDeviceName] = useState('')
  const [symptom, setSymptom] = useState('')
  const [category, setCategory] = useState('Peripherals & Input')
  const [diagnosing, setDiagnosing] = useState(false)
  const [diagnosis, setDiagnosis] = useState(null)

  // Public Community Tickets States
  const [tickets, setTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [activeTab, setActiveTab] = useState('community') // 'community' | 'my_requests'
  const [selectedDept, setSelectedDept] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'open', 'resolved'
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [showManualModal, setShowManualModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [resolvingTicket, setResolvingTicket] = useState(null) // Ticket currently being resolved
  const [resolveForm, setResolveForm] = useState({
    helper_name: studentName,
    notes: '',
    outcome: 'peer_repaired'
  })
  const [submittingResolve, setSubmittingResolve] = useState(false)

  // Manual Ticket Form
  const [manualForm, setManualForm] = useState({
    user_name: studentName,
    device_name: '',
    symptom: '',
    department: defaultDept,
    lab_name: (DEPARTMENT_LABS[defaultDept] || ['Hardware & Systems Lab'])[0],
    technician_name: 'Campus Peer Community'
  })

  // Pre-filled AI Approval Form
  const [ticketForm, setTicketForm] = useState({
    user_name: studentName,
    device_name: '',
    symptom: '',
    department: defaultDept,
    lab_name: (DEPARTMENT_LABS[defaultDept] || ['Hardware & Systems Lab'])[0],
    technician_name: 'Campus Peer Community'
  })
  const [submittingTicket, setSubmittingTicket] = useState(false)

  // Load public tickets
  const loadTickets = async () => {
    try {
      setLoadingTickets(true)
      // Fetch all public tickets across campus
      const data = await api.getRepairTickets('All')
      setTickets(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load repair tickets:', err)
    } finally {
      setLoadingTickets(false)
    }
  };

  useEffect(() => {
    loadTickets()
  }, [])

  // AI Diagnostic Query
  const handleDiagnose = async (e) => {
    e.preventDefault()
    if (!deviceName || !symptom) return
    try {
      setDiagnosing(true)
      const data = await api.diagnoseRepair(deviceName, symptom, category)
      setDiagnosis(data)
      toast.success('AI Diagnostic Protocol Generated!', `Troubleshooting guide ready for "${deviceName}".`)
    } catch (err) {
      toast.error('Diagnosis Error', err.message)
    } finally {
      setDiagnosing(false)
    }
  }

  // Open manual ticket modal
  const handleOpenManualModal = () => {
    setManualForm({
      user_name: studentName,
      device_name: '',
      symptom: '',
      department: defaultDept,
      lab_name: (DEPARTMENT_LABS[defaultDept] || ['Hardware & Systems Lab'])[0],
      technician_name: 'Campus Peer Community'
    })
    setShowManualModal(true)
  }

  // Submit manual ticket
  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!manualForm.device_name.trim() || !manualForm.symptom.trim()) {
      toast.error('Missing Information', 'Please enter both device name and problem description.')
      return
    }
    try {
      setSubmittingTicket(true)
      const devName = manualForm.device_name.trim()
      await api.createRepairTicket({
        ...manualForm,
        user_id: studentId,
        user_name: manualForm.user_name || studentName || 'Student',
        ai_diagnosis: 'Community peer repair request posted by student.',
        ai_steps: 'Open for peer diagnostic troubleshooting and soldering assistance.',
        difficulty: 'Medium',
        tools_needed: 'Workbench tools / multimeter / soldering iron'
      })
      setShowManualModal(false)
      toast.success('Repair Request Published!', `"${devName}" is now open for campus peer assistance.`)
      await loadTickets()
    } catch (err) {
      toast.error('Failed to Create Ticket', err.message)
    } finally {
      setSubmittingTicket(false)
    }
  }

  // Submit pre-filled AI approved ticket
  const handleApproveTicket = async (e) => {
    e.preventDefault()
    try {
      setSubmittingTicket(true)
      const devName = ticketForm.device_name || deviceName
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
      toast.success('Community Repair Ticket Created!', `AI troubleshooting steps for "${devName}" are now live.`)
      await loadTickets()
    } catch (err) {
      toast.error('Failed to Save Ticket', err.message)
    } finally {
      setSubmittingTicket(false)
    }
  }

  // Submit Peer Ticket Resolution
  const handleResolveSubmit = async (e) => {
    e.preventDefault()
    if (!resolvingTicket) return
    try {
      setSubmittingResolve(true)
      const devName = resolvingTicket.device_name
      await api.resolveRepairTicket(resolvingTicket.id, {
        faculty_decision: resolveForm.outcome,
        faculty_notes: resolveForm.notes || 'Repaired through peer collaboration on campus.',
        resolved_by: resolveForm.helper_name || studentName || 'NSSCE Peer Helper'
      })
      setResolvingTicket(null)
      toast.celebrate('Repair Solved & Logged! 🛠️', `"${devName}" saved from e-waste (+8.5kg CO₂e offset logged).`)
      await loadTickets()
    } catch (err) {
      toast.error('Resolution Error', err.message)
    } finally {
      setSubmittingResolve(false)
    }
  }

  // Filter tickets for community view vs student's own
  const filteredTickets = tickets.filter(t => {
    if (activeTab === 'my_requests') {
      const isOwner = t.user_id === studentId || 
        t.user_name === studentName ||
        (studentName && (t.user_name || '').toLowerCase().includes(studentName.toLowerCase())) ||
        (studentId && (t.user_id || '').toLowerCase().includes(studentId.toLowerCase()))
      if (!isOwner) return false
    }

    if (selectedDept !== 'All' && t.department !== selectedDept) {
      return false
    }

    const isOpen = t.status === 'pending_lab_review' || t.status === 'open' || t.status === 'diagnosed' || t.status === 'in_progress'

    if (statusFilter === 'open') {
      if (!isOpen) return false
    } else if (statusFilter === 'resolved') {
      if (isOpen) return false
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const titleMatch = (t.device_name || '').toLowerCase().includes(query)
      const symptomMatch = (t.symptom || '').toLowerCase().includes(query)
      const userMatch = (t.user_name || '').toLowerCase().includes(query)
      if (!titleMatch && !symptomMatch && !userMatch) return false
    }

    return true
  })

  return (
    <div className="space-y-6">
      {/* Platform Banner */}
      <div className="bg-[#1c1c1c] p-6 rounded-3xl border border-[#2e2e2e] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-[#EDEDED]">Community Peer Repair Platform</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 font-mono">
              Public NSSCE Clinic
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            A collaborative repair café for all 6 NSSCE engineering departments. Inspect faulty equipment with AI, request peer help, or lend your diagnostic expertise to fix hardware before replacing it.
          </p>
        </div>

        <button
          onClick={handleOpenManualModal}
          className="px-4 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs shadow-md shadow-[#3ECF8E]/20 transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post Repair Request</span>
        </button>
      </div>

      {/* Diagnostic Engine & Troubleshooting Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Diagnostic Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#1c1c1c] p-6 rounded-3xl border border-[#2e2e2e] shadow-sm space-y-4">
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
                  placeholder="e.g. Logitech MX Master Mouse, Arduino Mega, Soldering Iron"
                  className="w-full px-3 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] placeholder-zinc-500 focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Device Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none cursor-pointer"
                >
                  <option value="Peripherals & Input">Peripherals &amp; Input (Keyboards, Mice)</option>
                  <option value="Microcontrollers & Embedded">Microcontrollers &amp; Embedded (Arduino, ESP32, Pi)</option>
                  <option value="Laptops & Computers">Laptops, PCs &amp; Motherboards</option>
                  <option value="Power Supplies & Adapters">Power Supplies &amp; Adapters</option>
                  <option value="Sensors & Transducers">Sensors &amp; Transducers</option>
                  <option value="Displays & Monitors">Displays &amp; Monitors</option>
                  <option value="Audio & Microphones">Audio, Headphones &amp; Microphones</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Describe Malfunction / Symptoms *</label>
                <textarea
                  rows="3"
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  placeholder="e.g. Left button double-clicks erratically; status LED blinks red twice then turns off"
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
                    <span>Analyzing Circuitry &amp; Faults...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#121212]" />
                    <span>Generate AI Diagnostic Protocol</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Diagnostic Results View */}
        <div className="lg:col-span-7">
          {diagnosis ? (
            <div className="bg-[#1c1c1c] p-6 rounded-3xl border border-[#2e2e2e] shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25">
                    DIAGNOSTIC PROTOCOL GENERATED
                  </span>
                  <h3 className="text-base font-bold text-[#EDEDED] mt-1">{deviceName}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#232323] text-zinc-300 border border-[#2e2e2e]">
                    Difficulty: {diagnosis.difficulty_level}
                  </span>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Est. {diagnosis.estimated_repair_time_mins} mins</p>
                </div>
              </div>

              {/* Likely Root Causes */}
              <div className="p-3 rounded-2xl bg-[#141414] border border-[#2e2e2e] space-y-1">
                <span className="text-[11px] font-bold text-zinc-300 block">Identified Root Causes:</span>
                <ul className="list-disc pl-4 text-xs text-zinc-400 space-y-0.5">
                  {diagnosis.likely_root_causes?.map((cause, idx) => (
                    <li key={idx}>{cause}</li>
                  ))}
                </ul>
              </div>

              {/* Step-by-Step Troubleshooting */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                <span className="text-[11px] font-bold text-zinc-300 block">Step-by-Step Protocol:</span>
                {diagnosis.step_by_step_troubleshooting?.map((step, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#181818] border border-[#2e2e2e] text-xs">
                    <span className="font-semibold text-[#3ECF8E]">Step {step.step}: {step.title}</span>
                    <p className="text-zinc-400 text-[11px] mt-0.5">{step.description}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#2e2e2e] flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Need workshop assistance or peer help?</span>
                <button
                  type="button"
                  onClick={() => {
                    setTicketForm({
                      user_name: studentName,
                      device_name: deviceName,
                      symptom: symptom,
                      department: defaultDept,
                      lab_name: (DEPARTMENT_LABS[defaultDept] || ['Hardware & Systems Lab'])[0],
                      technician_name: 'Campus Peer Community'
                    })
                    setShowApprovalModal(true)
                  }}
                  className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs shadow-md shadow-[#3ECF8E]/20 transition cursor-pointer"
                >
                  Publish to Community Board
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full bg-[#1c1c1c] p-12 text-center rounded-3xl border border-[#2e2e2e] shadow-sm flex flex-col items-center justify-center space-y-3 min-h-[300px]">
              <div className="w-12 h-12 rounded-2xl bg-[#232323] text-[#3ECF8E] border border-[#2e2e2e] flex items-center justify-center shadow-sm">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#EDEDED]">Ready for Diagnostics &amp; Peer Collaboration</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                Enter your device and symptom on the left. The AI diagnostic engine will generate a step-by-step DIY guide and allow you to publish it to fellow NSSCE student fixers.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Public Community Feed Section */}
      <div className="bg-[#1c1c1c] p-6 sm:p-8 rounded-3xl border border-[#2e2e2e] shadow-sm space-y-6">
        {/* Feed Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2e2e2e] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#EDEDED]">Campus Hardware Repair Tickets</h3>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25">
                {filteredTickets.length} Requests
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Browse hardware repair requests from fellow engineering students across all NSSCE departments
            </p>
          </div>

          {/* Toggle Community vs My Requests */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-[#141414] border border-[#2e2e2e]">
            <button
              onClick={() => setActiveTab('community')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'community' 
                  ? 'bg-[#3ECF8E] text-[#121212] font-bold shadow-sm' 
                  : 'text-zinc-400 hover:text-[#EDEDED]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Public Community Feed</span>
            </button>
            <button
              onClick={() => setActiveTab('my_requests')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'my_requests' 
                  ? 'bg-[#3ECF8E] text-[#121212] font-bold shadow-sm' 
                  : 'text-zinc-400 hover:text-[#EDEDED]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Submitted Requests</span>
            </button>
          </div>
        </div>

        {/* Filters Bar: Search, Department, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search devices, symptoms, or students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] text-xs placeholder-zinc-500 focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>

          {/* Department Filter (All 6 Departments) */}
          <div className="sm:col-span-4">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] text-xs focus:outline-none focus:border-[#3ECF8E] cursor-pointer"
            >
              <option value="All">All 6 Departments</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] text-xs focus:outline-none focus:border-[#3ECF8E] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open for Help</option>
              <option value="resolved">Resolved / Fixed</option>
            </select>
          </div>
        </div>

        {/* Tickets Grid */}
        {loadingTickets ? (
          <div className="py-12 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#3ECF8E]" />
            <span>Loading community tickets...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500 border border-dashed border-[#2e2e2e] rounded-2xl space-y-2">
            <p>No repair tickets found matching your active filters.</p>
            <p className="text-[11px] text-zinc-600">
              {activeTab === 'my_requests' 
                ? 'Click "Post Repair Request" above to request peer assistance with a malfunctioning device.' 
                : 'All campus devices are running smoothly or no tickets posted yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map(t => {
              const isOpen = t.status === 'pending_lab_review' || t.status === 'open' || t.status === 'diagnosed' || t.status === 'in_progress'
              const isResolved = !isOpen

              return (
                <div key={t.id} className="p-5 rounded-2xl border border-[#2e2e2e] space-y-3.5 bg-[#141414] shadow-sm hover:border-[#3e3e3e] transition">
                  {/* Card Top: Department & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-[#3ECF8E] border border-emerald-500/30 font-mono">
                          {t.department ? t.department.split(' ')[0] : 'General'}
                        </span>
                        {t.lab_name && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#242424] text-zinc-400 border border-[#2e2e2e]">
                            {t.lab_name}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-[#EDEDED] text-sm leading-snug">{t.device_name}</h4>
                    </div>

                    {isOpen ? (
                      <span className="px-2.5 py-1 rounded-full font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] shrink-0 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Open for Help</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full font-bold bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/30 text-[10px] shrink-0 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Resolved (+8.5kg CO₂e)</span>
                      </span>
                    )}
                  </div>

                  {/* Problem Description */}
                  <div className="text-xs text-zinc-300 bg-[#181818] p-3 rounded-xl border border-[#2e2e2e]">
                    <strong className="text-zinc-200 block mb-0.5">Symptom / Malfunction:</strong>
                    <span className="text-zinc-400">{t.symptom}</span>
                  </div>

                  {/* AI Root Cause Hint if available */}
                  {t.ai_diagnosis && (
                    <div className="text-[11px] text-zinc-400 bg-[#151515] p-2.5 rounded-xl border border-[#262626] flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-[#3ECF8E] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-zinc-300">Diagnostic Clue: </strong>
                        <span>{t.ai_diagnosis.split(';')[0]}</span>
                      </div>
                    </div>
                  )}

                  {/* Resolved Notes Callout */}
                  {isResolved && (
                    <div className="p-3 rounded-xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/25 text-xs space-y-1">
                      <div className="font-bold flex items-center justify-between text-[11px] text-[#3ECF8E]">
                        <span>✅ Fixed &amp; Saved from E-Waste</span>
                        {t.resolved_by && <span className="font-normal opacity-90">Fixed by {t.resolved_by}</span>}
                      </div>
                      {t.faculty_notes && (
                        <p className="text-[11px] text-zinc-300 leading-relaxed">{t.faculty_notes}</p>
                      )}
                    </div>
                  )}

                  {/* Card Bottom: Author Info and Action Buttons */}
                  <div className="pt-2 border-t border-[#242424] flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">
                      Posted by: <strong className="text-zinc-300">{t.user_name}</strong>
                    </span>

                    {/* Actions for Open Tickets */}
                    {isOpen && (
                      <button
                        type="button"
                        onClick={() => {
                          setResolvingTicket(t)
                          setResolveForm({
                            helper_name: studentName,
                            notes: '',
                            outcome: 'peer_repaired'
                          })
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>I Helped Fix This</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Peer Resolution Modal */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#1c1c1c] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#2e2e2e] space-y-4 text-[#EDEDED]">
            <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#EDEDED]">Record Peer Repair Resolution</h2>
                  <p className="text-xs text-zinc-400">Award +8.5 kg CO₂e saved and mark ticket fixed</p>
                </div>
              </div>
              <button 
                onClick={() => setResolvingTicket(null)} 
                className="text-zinc-400 hover:text-[#EDEDED] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 pt-1">
              <div className="p-3.5 rounded-2xl bg-[#141414] border border-[#2e2e2e] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Device:</span>
                  <span className="font-bold text-[#EDEDED]">{resolvingTicket.device_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Owner:</span>
                  <span className="text-zinc-300">{resolvingTicket.user_name} ({(resolvingTicket.department || 'Campus').split(' ')[0]})</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Peer Helper / Repairer Name *
                </label>
                <input
                  type="text"
                  required
                  value={resolveForm.helper_name}
                  onChange={(e) => setResolveForm({ ...resolveForm, helper_name: e.target.value })}
                  placeholder="e.g. Rahul M (S6 CSE) &amp; Ananya R (S6 ICE)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] text-xs focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  How was it repaired? (Resolution Notes) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolveForm.notes}
                  onChange={(e) => setResolveForm({ ...resolveForm, notes: e.target.value })}
                  placeholder="e.g., Resoldered broken microswitch lead in ECE lab; replaced worn potentiometer with spare from workshop."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] text-xs focus:outline-none focus:border-[#3ECF8E] resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/25 text-[11px] text-[#3ECF8E] flex items-center gap-2">
                <Award className="w-4 h-4 shrink-0" />
                <span>By confirming, both students earn +8.5 kg CO₂e carbon savings on their circular portfolio!</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingTicket(null)}
                  className="px-4 py-2 rounded-xl border border-[#2e2e2e] text-zinc-400 hover:text-[#EDEDED] hover:bg-[#242424] font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResolve}
                  className="px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-bold text-xs shadow-md shadow-[#3ECF8E]/20 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submittingResolve ? 'Saving Resolution...' : 'Confirm Ticket Resolved'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <h2 className="text-base font-bold text-[#EDEDED]">Post Community Repair Request</h2>
                  <p className="text-xs text-zinc-400">Describe the issue and broadcast to campus student fixers</p>
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
                  placeholder="e.g., Dell Latitude 5400, Arduino Mega, Oscilloscope Probe"
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
                        lab_name: labs[0]
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
                    Preferred Lab / Workshop Location
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
                  <span>{submittingTicket ? 'Broadcasting...' : 'Publish to Campus Fixers'}</span>
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
                  <h2 className="text-base font-bold text-[#EDEDED]">Publish Hardware Repair Ticket</h2>
                  <p className="text-xs text-zinc-400">Pre-filled with AI diagnostic protocol for campus fixers</p>
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
                <span className="text-zinc-400 font-mono text-[11px]">Department:</span>
                <span className="font-semibold text-[#3ECF8E]">{ticketForm.department.split(' ')[0]}</span>
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
              This request will be visible to all engineering students on the public campus board. Any peer with the right tools or parts can offer repair help.
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
                  <span>{submittingTicket ? 'Publishing Ticket...' : 'Confirm & Publish Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
