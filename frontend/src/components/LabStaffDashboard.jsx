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
  Share2
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
  const [loading, setLoading] = useState(true)
  const [showSurveyModal, setShowSurveyModal] = useState(false)
  const [showReleaseModal, setShowReleaseModal] = useState(false)

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
      const [invData, auditData] = await Promise.all([
        api.getInventory(selectedDept),
        api.getAudits()
      ])
      setInventory(invData)
      setAudits(auditData.filter(a => a.department === selectedDept))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedDept])

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

      {/* Equipment Batches & Cannibalization Triage */}
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

      {/* Lab Surveys History */}
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
    </div>
  )
}
