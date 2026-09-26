import React, { useState, useEffect } from 'react'
import { 
  Building, 
  BarChart3, 
  Package, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw,
  Cpu,
  Share2,
  Wrench,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { api } from '../services/api'

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical and Electronics Engineering',
  'Instrumentation and Control Engineering'
]

export default function LabStaffDashboard({ onNavigateToMarketplace }) {
  const [selectedDept, setSelectedDept] = useState('Computer Science and Engineering')
  const [inventory, setInventory] = useState([])
  const [audits, setAudits] = useState([])
  const [repairTickets, setRepairTickets] = useState([])
  const [activeTab, setActiveTab] = useState('tickets')
  const [loading, setLoading] = useState(true)
  const [showSurveyModal, setShowSurveyModal] = useState(false)
  const [showReleaseModal, setShowReleaseModal] = useState(false)
  const [showTriageModal, setShowTriageModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)

  // Faculty Triage Form
  const [triageForm, setTriageForm] = useState({
    faculty_decision: 'repaired_returned',
    faculty_notes: '',
    resolved_by: 'Prof. Faculty In-Charge',
    lab_name: 'Main Hardware Lab'
  })
  const [resolvingTicket, setResolvingTicket] = useState(false)

  // Survey Form
  const [surveyForm, setSurveyForm] = useState({
    auditor_name: 'Prof. Faculty In-Charge',
    department: selectedDept,
    lab_name: 'Main Hardware Lab',
    total_systems: 30,
    functional_count: 24,
    repairable_count: 4,
    scrap_count: 2,
    surplus_for_students: 3,
    notes: 'Surplus monitors and cables ready for student release.'
  })

  // Quick Release Form
  const [releaseForm, setReleaseForm] = useState({
    title: 'Surplus USB Keyboards & Mouse Set (Pack of 4)',
    description: 'Cleaned and tested from CSE Lab upgrade. Fully functional for student projects.',
    category: 'Peripherals',
    price_type: 'free',
    price: 0
  })
  const [releasing, setReleasing] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [invData, auditData, ticketData] = await Promise.all([
        api.getInventory(selectedDept),
        api.getAudits(),
        api.getRepairTickets(selectedDept)
      ])
      setInventory(invData)
      setAudits(auditData.filter(a => a.department === selectedDept))
      setRepairTickets(ticketData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedDept])

  const openTriageModal = (ticket) => {
    setSelectedTicket(ticket)
    setTriageForm({
      faculty_decision: ticket.faculty_decision || 'repaired_returned',
      faculty_notes: ticket.faculty_notes || '',
      resolved_by: ticket.resolved_by || `${selectedDept.split(' ')[0]} Faculty In-Charge`,
      lab_name: ticket.lab_name || 'Main Hardware Lab'
    })
    setShowTriageModal(true)
  }

  const handleResolveTicket = async (e) => {
    e.preventDefault()
    if (!selectedTicket) return
    try {
      setResolvingTicket(true)
      await api.resolveRepairTicket(selectedTicket.id, triageForm)
      setShowTriageModal(false)
      await loadData()
    } catch (err) {
      alert('Error resolving ticket: ' + err.message)
    } finally {
      setResolvingTicket(false)
    }
  }

  const handleSurveySubmit = async (e) => {
    e.preventDefault()
    try {
      await api.createAudit({ ...surveyForm, department: selectedDept })
      setShowSurveyModal(false)
      await loadData()
    } catch (err) {
      alert('Error saving audit: ' + err.message)
    }
  }

  const handleReleaseToStudents = async (e) => {
    e.preventDefault()
    try {
      setReleasing(true)
      await api.createMarketItem({
        title: releaseForm.title,
        description: releaseForm.description,
        department: selectedDept,
        category: releaseForm.category,
        condition: 'Functional/Tested',
        price_type: releaseForm.price_type,
        price: releaseForm.price,
        sub_components: JSON.stringify([{ name: 'Standard Unit', status: 'available' }]),
        carbon_saved_kg: 25.0,
        seller_id: 'lab-staff-official',
        seller_name: `${selectedDept.split(' ')[0]} Lab Staff`
      })
      setShowReleaseModal(false)
      alert(`Success! "${releaseForm.title}" released to the Student Marketplace.`)
      if (onNavigateToMarketplace) onNavigateToMarketplace()
    } catch (err) {
      alert('Error releasing hardware: ' + err.message)
    } finally {
      setReleasing(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Lab Staff Operations & Hardware Triage Hub</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Department equipment inventory management, hardware surveys, and direct student surplus allocation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReleaseModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Release Surplus to Students</span>
          </button>
          <button
            onClick={() => setShowSurveyModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Lab Survey</span>
          </button>
        </div>
      </div>

      {/* Department Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-700">Active Department:</span>
        <div className="flex flex-wrap gap-1.5">
          {DEPARTMENTS.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDept(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedDept === d
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {d.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'tickets'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Department Workshop Helpdesk</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'tickets' ? 'bg-orange-700 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {repairTickets.length}
          </span>
          {repairTickets.filter(t => t.status === 'pending_lab_review').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'inventory'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Equipment Batches & Cannibalization</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'inventory' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {inventory.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('surveys')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'surveys'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Lab Hardware Health Surveys</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'surveys' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {audits.length}
          </span>
        </button>
      </div>

      {/* DEPARTMENT WORKSHOP HELPDESK VIEW */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Student Repair Tickets & Faculty Triage Desk</h3>
              <p className="text-xs text-slate-500">
                Incoming student repair requests assigned to {selectedDept} labs. Inspect hardware and choose a circular resolution outcome.
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 flex items-center gap-2 self-start sm:self-auto">
              <span>Pending Review:</span>
              <strong className="text-orange-950 font-bold">
                {repairTickets.filter(t => t.status === 'pending_lab_review').length}
              </strong>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading department repair tickets...</div>
          ) : repairTickets.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
              <Wrench className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-700">No repair tickets currently queued for {selectedDept}.</p>
              <p className="text-slate-400">When students submit broken equipment to your department helpdesk, they will show up here for faculty inspection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repairTickets.map(ticket => {
                const isPending = ticket.status === 'pending_lab_review'
                return (
                  <div 
                    key={ticket.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                              {ticket.lab_name || `${selectedDept.split(' ')[0]} Lab`}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{ticket.device_name}</h4>
                        </div>

                        {ticket.status === 'pending_lab_review' && (
                          <span className="px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-900 text-[10px] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Pending Triage</span>
                          </span>
                        )}
                        {ticket.status === 'repaired_returned' && (
                          <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-900 text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Repaired & Returned</span>
                          </span>
                        )}
                        {ticket.status === 'unrepairable_parts_advised' && (
                          <span className="px-2.5 py-1 rounded-full font-bold bg-purple-100 text-purple-900 text-[10px] flex items-center gap-1">
                            <span>🧩 Advised for Parts</span>
                          </span>
                        )}
                        {ticket.status === 'lab_cannibalized' && (
                          <span className="px-2.5 py-1 rounded-full font-bold bg-indigo-100 text-indigo-900 text-[10px] flex items-center gap-1">
                            <Cpu className="w-3 h-3" />
                            <span>Lab Adopted</span>
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                        <span className="font-semibold text-slate-800 block text-[11px]">Symptom Reported by Student:</span>
                        <p className="leading-relaxed">{ticket.symptom}</p>
                      </div>

                      {ticket.ai_diagnosis && (
                        <div className="p-2.5 rounded-xl bg-cyan-50/80 border border-cyan-100 text-[11px] text-cyan-900 flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-600 mt-0.5 shrink-0" />
                          <div>
                            <strong className="block font-semibold">Gemini AI Diagnostic Summary:</strong>
                            <p className="text-cyan-800 line-clamp-2">{ticket.ai_diagnosis}</p>
                          </div>
                        </div>
                      )}

                      {/* Display Faculty Decision if resolved */}
                      {ticket.faculty_decision && (
                        <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                          ticket.faculty_decision === 'repaired_returned' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' :
                          ticket.faculty_decision === 'unrepairable_parts_advised' ? 'bg-purple-50/80 border-purple-200 text-purple-950' :
                          'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                        }`}>
                          <div className="font-bold flex items-center justify-between text-[11px]">
                            <span>
                              {ticket.faculty_decision === 'repaired_returned' && '✅ Repaired & Returned to Student (Working)'}
                              {ticket.faculty_decision === 'unrepairable_parts_advised' && '🧩 Unrepairable -> Advised to Give for Parts on Marketplace'}
                              {ticket.faculty_decision === 'lab_cannibalized' && '🏢 Lab Adopted -> Retained for Department Cannibalization'}
                            </span>
                            {ticket.resolved_by && <span className="font-normal opacity-75">By {ticket.resolved_by}</span>}
                          </div>
                          {ticket.faculty_notes && (
                            <p className="text-[11px] leading-relaxed italic opacity-95">
                              &ldquo;{ticket.faculty_notes}&rdquo;
                            </p>
                          )}
                          <div className="text-[10px] font-semibold pt-1 opacity-80">
                            {ticket.faculty_decision === 'repaired_returned' && 'Carbon Benefit: +8.5 kg CO₂e lifespan extension offset.'}
                            {ticket.faculty_decision === 'unrepairable_parts_advised' && 'Circular Recommendation: Student advised to post working modules on Marketplace.'}
                            {ticket.faculty_decision === 'lab_cannibalized' && 'Inventory Update: Unit transferred to department hardware stockpile for cannibalization.'}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">
                        Student: <strong className="text-slate-700">{ticket.user_name}</strong>
                      </span>

                      <button
                        onClick={() => openTriageModal(ticket)}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 ${
                          isPending 
                            ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>{isPending ? 'Triage & Resolve Ticket' : 'Re-evaluate Ticket'}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Equipment Batches & Cannibalization Triage */}
      {activeTab === 'inventory' && (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Department Hardware Batches & Cannibalization Triage</h3>
            <p className="text-xs text-slate-500">{selectedDept}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inventory.map(item => {
            const workingPct = item.total_qty > 0 ? Math.round((item.working_qty / item.total_qty) * 100) : 0
            return (
              <div 
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{item.item_name}</h4>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800">
                    Total: {item.total_qty} units
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-xl">
                    <span className="text-slate-500 block text-[10px]">Operational</span>
                    <strong className="text-emerald-700">{item.working_qty}</strong>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-2 rounded-xl">
                    <span className="text-slate-500 block text-[10px]">Repairable</span>
                    <strong className="text-amber-700">{item.repairable_qty}</strong>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 p-2 rounded-xl">
                    <span className="text-slate-500 block text-[10px]">Scrap for Parts</span>
                    <strong className="text-rose-700">{item.scrap_qty}</strong>
                  </div>
                </div>

                {/* Triage Recommendation */}
                <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-100 text-xs text-cyan-950 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-cyan-900">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                    Automated Cannibalization Strategy:
                  </span>
                  <p className="leading-relaxed text-[11px] text-cyan-800">
                    {item.recommended_action}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      )}

      {/* Lab Surveys History */}
      {activeTab === 'surveys' && (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Lab Hardware Health Surveys</h3>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Lab Name</th>
                <th className="p-3">Faculty / Auditor</th>
                <th className="p-3">Total Systems</th>
                <th className="p-3">Functional</th>
                <th className="p-3">Repairable</th>
                <th className="p-3">Scrap</th>
                <th className="p-3">Surplus for Students</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audits.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{a.lab_name}</td>
                  <td className="p-3 text-slate-600">{a.auditor_name}</td>
                  <td className="p-3 font-bold">{a.total_systems}</td>
                  <td className="p-3 text-emerald-600 font-semibold">{a.functional_count}</td>
                  <td className="p-3 text-amber-600 font-semibold">{a.repairable_count}</td>
                  <td className="p-3 text-rose-600 font-semibold">{a.scrap_count}</td>
                  <td className="p-3 text-blue-700 font-bold bg-blue-50/50">+{a.surplus_for_students} units</td>
                  <td className="p-3 text-slate-400">{a.audit_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* RELEASE HARDWARE MODAL */}
      {showReleaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Release Surplus to Students</h2>
              <button onClick={() => setShowReleaseModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleReleaseToStudents} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Title *</label>
                <input
                  type="text"
                  value={releaseForm.title}
                  onChange={(e) => setReleaseForm({ ...releaseForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={selectedDept}
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Hand-off Instructions</label>
                <textarea
                  rows="2"
                  value={releaseForm.description}
                  onChange={(e) => setReleaseForm({ ...releaseForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price Model</label>
                  <select
                    value={releaseForm.price_type}
                    onChange={(e) => setReleaseForm({ ...releaseForm, price_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="free">Free Gift for Students</option>
                    <option value="priced">Nominal Student Price (₹)</option>
                  </select>
                </div>
                {releaseForm.price_type === 'priced' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={releaseForm.price}
                      onChange={(e) => setReleaseForm({ ...releaseForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReleaseModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={releasing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {releasing ? 'Publishing...' : 'Release to Student Marketplace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD SURVEY MODAL */}
      {showSurveyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Record Lab Hardware Survey</h2>
              <button onClick={() => setShowSurveyModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleSurveySubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Faculty Name *</label>
                  <input
                    type="text"
                    value={surveyForm.auditor_name}
                    onChange={(e) => setSurveyForm({ ...surveyForm, auditor_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lab / Room Name *</label>
                  <input
                    type="text"
                    value={surveyForm.lab_name}
                    onChange={(e) => setSurveyForm({ ...surveyForm, lab_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">Total</label>
                  <input
                    type="number"
                    value={surveyForm.total_systems}
                    onChange={(e) => setSurveyForm({ ...surveyForm, total_systems: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Working</label>
                  <input
                    type="number"
                    value={surveyForm.functional_count}
                    onChange={(e) => setSurveyForm({ ...surveyForm, functional_count: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Repairable</label>
                  <input
                    type="number"
                    value={surveyForm.repairable_count}
                    onChange={(e) => setSurveyForm({ ...surveyForm, repairable_count: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Surplus</label>
                  <input
                    type="number"
                    value={surveyForm.surplus_for_students}
                    onChange={(e) => setSurveyForm({ ...surveyForm, surplus_for_students: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Harvestable Components</label>
                <textarea
                  rows="2"
                  value={surveyForm.notes}
                  onChange={(e) => setSurveyForm({ ...surveyForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Save Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FACULTY TRIAGE & RESOLUTION MODAL */}
      {showTriageModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                    Faculty Workshop Triage
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {selectedDept.split(' ')[0]} Lab
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  Evaluate & Resolve Ticket: {selectedTicket.device_name}
                </h2>
              </div>
              <button 
                onClick={() => setShowTriageModal(false)} 
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Ticket Snapshot */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 text-slate-700">
              <div className="flex justify-between items-center text-[11px]">
                <span>Requested by: <strong className="text-slate-900">{selectedTicket.user_name}</strong></span>
                <span>Assigned Lab: <strong className="text-slate-900">{selectedTicket.lab_name || 'Department Lab'}</strong></span>
              </div>
              <p className="text-[11px] text-slate-600 pt-0.5">
                <strong>Fault / Symptoms:</strong> {selectedTicket.symptom}
              </p>
            </div>

            <form onSubmit={handleResolveTicket} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Faculty / Staff In-Charge *</label>
                  <input
                    type="text"
                    value={triageForm.resolved_by}
                    onChange={(e) => setTriageForm({ ...triageForm, resolved_by: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Workshop / Lab *</label>
                  <input
                    type="text"
                    value={triageForm.lab_name}
                    onChange={(e) => setTriageForm({ ...triageForm, lab_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* 3 Circular Outcome Decisions */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Select Circular Resolution Outcome *
                </label>
                <div className="space-y-2">
                  {/* Option 1: Repaired & Returned */}
                  <label 
                    className={`block p-3 rounded-xl border cursor-pointer transition ${
                      triageForm.faculty_decision === 'repaired_returned'
                        ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="faculty_decision"
                        value="repaired_returned"
                        checked={triageForm.faculty_decision === 'repaired_returned'}
                        onChange={(e) => setTriageForm({ ...triageForm, faculty_decision: e.target.value })}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>✅ Repaired & Returned to Student (Working)</span>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-200 text-emerald-900">
                            +8.5 kg CO₂e
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Hardware has been successfully diagnosed, repaired, and safety-verified. Working device returned to student; product lifespan extended.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Unrepairable -> Advised to Split for Parts */}
                  <label 
                    className={`block p-3 rounded-xl border cursor-pointer transition ${
                      triageForm.faculty_decision === 'unrepairable_parts_advised'
                        ? 'border-purple-500 bg-purple-50/70 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="faculty_decision"
                        value="unrepairable_parts_advised"
                        checked={triageForm.faculty_decision === 'unrepairable_parts_advised'}
                        onChange={(e) => setTriageForm({ ...triageForm, faculty_decision: e.target.value })}
                        className="mt-0.5 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>🧩 Unrepairable → Advised to Split &amp; Give for Parts on Marketplace</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Motherboard / primary logic core is beyond repair. Student is advised to disassemble the device and list functioning sub-parts (RAM, display panel, chassis, power brick) on the Circular Marketplace for peer reuse.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Option 3: Lab Adopted -> Retained for Department Cannibalization */}
                  <label 
                    className={`block p-3 rounded-xl border cursor-pointer transition ${
                      triageForm.faculty_decision === 'lab_cannibalized'
                        ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="faculty_decision"
                        value="lab_cannibalized"
                        checked={triageForm.faculty_decision === 'lab_cannibalized'}
                        onChange={(e) => setTriageForm({ ...triageForm, faculty_decision: e.target.value })}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>🏢 Lab Adopted → Retained for Department Cannibalization</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          The student leaves the unit with the department lab. The workshop absorbs the scrap to harvest components (inductors, chips, connectors, casings) for college test benches and project benches (automatically registered into department inventory).
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Faculty Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Faculty Diagnostic & Triage Notes *
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Diagnosed shorted diode in 12V buck regulator. Replaced from spare bin; tested under load. / Advised student to salvage RAM and display panel."
                  value={triageForm.faculty_notes}
                  onChange={(e) => setTriageForm({ ...triageForm, faculty_notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTriageModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolvingTicket}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md shadow-orange-600/30 transition disabled:opacity-50"
                >
                  {resolvingTicket ? 'Saving Triage...' : 'Confirm Triage Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
