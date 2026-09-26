import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Package, 
  Plus, 
  Coins, 
  Cpu, 
  Sparkles, 
  Building, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts'
import { api } from '../services/api'

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1']

export default function LabAuditsAndInventory() {
  const [activeTab, setActiveTab] = useState('audits') // 'audits' or 'inventory'
  const [audits, setAudits] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAuditModal, setShowAuditModal] = useState(false)
  const [showInvModal, setShowInvModal] = useState(false)

  // Audit form
  const [auditForm, setAuditForm] = useState({
    auditor_name: '',
    department: 'Computer Science and Engineering',
    lab_name: '',
    total_systems: 30,
    functional_count: 24,
    repairable_count: 4,
    scrap_count: 2,
    keyboards_scrap: 4,
    mice_scrap: 5,
    monitors_scrap: 1,
    cables_scrap: 8,
    notes: ''
  })

  // Inventory form
  const [invForm, setInvForm] = useState({
    department: 'Computer Science',
    item_name: '',
    category: 'Peripherals',
    total_qty: 15,
    working_qty: 9,
    repairable_qty: 4,
    recyclable_qty: 2
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [auditData, analyticsData, invData] = await Promise.all([
        api.getAudits(),
        api.getAuditAnalytics(),
        api.getInventory()
      ])
      setAudits(auditData)
      setAnalytics(analyticsData)
      setInventory(invData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAuditSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.createAudit(auditForm)
      setShowAuditModal(false)
      await loadData()
    } catch (err) {
      alert('Error creating audit: ' + err.message)
    }
  }

  const handleInvSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.upsertInventory(invForm)
      setShowInvModal(false)
      await loadData()
    } catch (err) {
      alert('Error saving inventory: ' + err.message)
    }
  }

  const peripheralPieData = analytics?.peripherals_breakdown ? [
    { name: 'Keyboards', value: analytics.peripherals_breakdown.keyboards },
    { name: 'Mice', value: analytics.peripherals_breakdown.mice },
    { name: 'Monitors', value: analytics.peripherals_breakdown.monitors },
    { name: 'Cables', value: analytics.peripherals_breakdown.cables }
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Lab Audits & Department Inventory Triage</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Department hardware health surveys, material recovery estimates, and component cannibalization strategies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'audits' ? (
            <button
              onClick={() => setShowAuditModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Lab Audit</span>
            </button>
          ) : (
            <button
              onClick={() => setShowInvModal(true)}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Inventory Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Mode Toggle */}
      <div className="flex gap-2 p-1 bg-slate-200/70 rounded-2xl w-full sm:w-fit text-xs">
        <button
          onClick={() => setActiveTab('audits')}
          className={`flex-1 sm:flex-none px-5 py-2 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'audits' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          <span>📊 Lab Hardware Audits & Charts</span>
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 sm:flex-none px-5 py-2 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'inventory' ? 'bg-white text-cyan-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 text-cyan-600" />
          <span>📦 Dept Inventory & Triage</span>
        </button>
      </div>

      {/* TAB 1: AUDITS & CHARTS */}
      {activeTab === 'audits' && (
        <div className="space-y-6">
          {/* Recovery Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-200 shadow-sm">
              <span className="text-xs font-bold text-amber-800">Copper Recovery</span>
              <p className="text-2xl font-bold text-amber-950 mt-1">
                {analytics?.recoverable_materials?.copper_grams || 2450} <span className="text-xs font-normal">grams</span>
              </p>
              <span className="text-[11px] text-amber-700">From cables & transformers</span>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-white p-5 rounded-2xl border border-yellow-200 shadow-sm">
              <span className="text-xs font-bold text-yellow-800">Gold Content</span>
              <p className="text-2xl font-bold text-yellow-950 mt-1">
                {analytics?.recoverable_materials?.gold_milligrams || 890} <span className="text-xs font-normal">mg</span>
              </p>
              <span className="text-[11px] text-yellow-700">PCB contact pins & connectors</span>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-700">Aluminum & Metals</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {((analytics?.recoverable_materials?.aluminum_grams || 3200) / 1000).toFixed(1)} <span className="text-xs font-normal">kg</span>
              </p>
              <span className="text-[11px] text-slate-500">Heatsinks & metal enclosures</span>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Department Hardware Health</h3>
              <div className="h-64 w-full">
                {analytics?.by_department ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.by_department} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="functional" fill="#10b981" name="Functional" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="repairable" fill="#f59e0b" name="Repairable" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="scrap" fill="#ef4444" name="Scrap / E-Waste" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Scrap Peripherals</h3>
              <div className="h-52 w-full flex items-center justify-center">
                {peripheralPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={peripheralPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {peripheralPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {peripheralPieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                    <span className="text-slate-600">{d.name}: <strong>{d.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Surveys Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Completed Lab Surveys</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Lab Name & Dept</th>
                    <th className="p-3">Auditor</th>
                    <th className="p-3">Systems</th>
                    <th className="p-3">Working</th>
                    <th className="p-3">Repairable</th>
                    <th className="p-3">Scrap</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {audits.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-900">
                        {a.lab_name}
                        <span className="block text-[11px] font-normal text-slate-500">{a.department}</span>
                      </td>
                      <td className="p-3 text-slate-600">{a.auditor_name}</td>
                      <td className="p-3 font-bold text-slate-800">{a.total_systems}</td>
                      <td className="p-3 font-semibold text-emerald-600">{a.functional_count}</td>
                      <td className="p-3 font-semibold text-amber-600">{a.repairable_count}</td>
                      <td className="p-3 font-semibold text-rose-600">{a.scrap_count}</td>
                      <td className="p-3 text-slate-400">{a.audit_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY & TRIAGE */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inventory.map(item => {
              const workingPct = item.total_qty > 0 ? Math.round((item.working_qty / item.total_qty) * 100) : 0
              return (
                <div 
                  key={item.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-cyan-300 transition space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.department} • {item.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{item.item_name}</h3>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                      Total: {item.total_qty} units
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                      <span className="text-slate-500 block text-[10px]">Operational</span>
                      <strong className="text-emerald-700 text-sm">{item.working_qty}</strong>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl">
                      <span className="text-slate-500 block text-[10px]">Repairable</span>
                      <strong className="text-amber-700 text-sm">{item.repairable_qty}</strong>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                      <span className="text-slate-500 block text-[10px]">Recyclable Scrap</span>
                      <strong className="text-rose-700 text-sm">{item.recyclable_qty}</strong>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Operational Ratio</span>
                      <span className="font-bold text-slate-700">{workingPct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                      <div style={{ width: `${(item.working_qty / item.total_qty) * 100}%` }} className="bg-emerald-500"></div>
                      <div style={{ width: `${(item.repairable_qty / item.total_qty) * 100}%` }} className="bg-amber-500"></div>
                      <div style={{ width: `${(item.recyclable_qty / item.total_qty) * 100}%` }} className="bg-rose-500"></div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-100 text-xs text-cyan-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-cyan-900">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
                      <span>Cannibalization & Triage Strategy:</span>
                    </div>
                    <p className="leading-relaxed text-[11px]">
                      {item.recommended_action}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* New Audit Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Submit Campus Lab Survey</h2>
              <button onClick={() => setShowAuditModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleAuditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Auditor Name / Faculty *</label>
                  <input
                    type="text"
                    value={auditForm.auditor_name}
                    onChange={(e) => setAuditForm({...auditForm, auditor_name: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={auditForm.department}
                    onChange={(e) => setAuditForm({...auditForm, department: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Computer Science and Engineering">CSE</option>
                    <option value="Electronics and Communication">ECE</option>
                    <option value="Electrical and Electronics">EEE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lab Name *</label>
                <input
                  type="text"
                  value={auditForm.lab_name}
                  onChange={(e) => setAuditForm({...auditForm, lab_name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total PCs</label>
                  <input
                    type="number"
                    value={auditForm.total_systems}
                    onChange={(e) => setAuditForm({...auditForm, total_systems: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Working</label>
                  <input
                    type="number"
                    value={auditForm.functional_count}
                    onChange={(e) => setAuditForm({...auditForm, functional_count: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Repairable</label>
                  <input
                    type="number"
                    value={auditForm.repairable_count}
                    onChange={(e) => setAuditForm({...auditForm, repairable_count: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scrap</label>
                  <input
                    type="number"
                    value={auditForm.scrap_count}
                    onChange={(e) => setAuditForm({...auditForm, scrap_count: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600"
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

      {/* New Inventory Modal */}
      {showInvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Add Department Equipment Batch</h2>
              <button onClick={() => setShowInvModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleInvSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={invForm.department}
                    onChange={(e) => setInvForm({...invForm, department: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Electrical Eng">Electrical Eng</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={invForm.category}
                    onChange={(e) => setInvForm({...invForm, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Peripherals">Peripherals</option>
                    <option value="Storage">Storage</option>
                    <option value="Power">Power Supplies</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Equipment Name *</label>
                <input
                  type="text"
                  value={invForm.item_name}
                  onChange={(e) => setInvForm({...invForm, item_name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total</label>
                  <input
                    type="number"
                    value={invForm.total_qty}
                    onChange={(e) => setInvForm({...invForm, total_qty: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Working</label>
                  <input
                    type="number"
                    value={invForm.working_qty}
                    onChange={(e) => setInvForm({...invForm, working_qty: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Repairable</label>
                  <input
                    type="number"
                    value={invForm.repairable_qty}
                    onChange={(e) => setInvForm({...invForm, repairable_qty: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recycle</label>
                  <input
                    type="number"
                    value={invForm.recyclable_qty}
                    onChange={(e) => setInvForm({...invForm, recyclable_qty: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
                >
                  Save & Triage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
