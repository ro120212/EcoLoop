import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Plus, 
  FileText, 
  TrendingUp, 
  Download, 
  Coins, 
  Cpu, 
  CheckCircle2,
  Building
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

export default function CampusLabAudit() {
  const [audits, setAudits] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
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
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [auditData, analyticsData] = await Promise.all([
        api.getAudits(),
        api.getAuditAnalytics()
      ])
      setAudits(auditData)
      setAnalytics(analyticsData)
    } catch (err) {
      console.error('Failed to load audits:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await api.createAudit(formData)
      setShowModal(false)
      setFormData({
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
      await loadData()
    } catch (err) {
      alert('Error creating lab audit: ' + err.message)
    } finally {
      setSubmitting(false)
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
            <h1 className="text-xl font-bold text-slate-900">Campus E-Waste Audit System</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Department hardware surveys, operational health, scrap generation, and NAAC green-audit material recovery.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Lab Audit Survey</span>
        </button>
      </div>

      {/* Recoverable Materials Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Copper Recovery</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-950 mt-1">
            {analytics?.recoverable_materials?.copper_grams || 2450} <span className="text-xs font-normal">grams</span>
          </p>
          <span className="text-[11px] text-amber-700">From audited cables & coils</span>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-white p-5 rounded-2xl border border-yellow-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-yellow-800">Gold Content</span>
            <Coins className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-950 mt-1">
            {analytics?.recoverable_materials?.gold_milligrams || 890} <span className="text-xs font-normal">mg</span>
          </p>
          <span className="text-[11px] text-yellow-700">PCB contact pins & connectors</span>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Aluminum & Metals</span>
            <Cpu className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {((analytics?.recoverable_materials?.aluminum_grams || 3200) / 1000).toFixed(1)} <span className="text-xs font-normal">kg</span>
          </p>
          <span className="text-[11px] text-slate-500">Heatsinks, chassis & brackets</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Comparison Bar Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Hardware Condition</h3>
              <p className="text-xs text-slate-500">Functional vs Repairable vs Scrap systems across campus labs</p>
            </div>
          </div>

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
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading charts...</div>
            )}
          </div>
        </div>

        {/* Peripheral Scrap Distribution */}
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

      {/* Lab Audits List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Completed Lab Audits</h3>
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

      {/* New Audit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Submit Campus Lab Audit</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Auditor Name / Faculty *</label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. Haridasan"
                    value={formData.auditor_name}
                    onChange={(e) => setFormData({...formData, auditor_name: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Computer Science and Engineering">CSE</option>
                    <option value="Electronics and Communication">ECE</option>
                    <option value="Electrical and Electronics">EEE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Civil Engineering">Civil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lab / Facility Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Networking Lab (Room 302)"
                  value={formData.lab_name}
                  onChange={(e) => setFormData({...formData, lab_name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total PCs</label>
                  <input
                    type="number"
                    value={formData.total_systems}
                    onChange={(e) => setFormData({...formData, total_systems: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Working</label>
                  <input
                    type="number"
                    value={formData.functional_count}
                    onChange={(e) => setFormData({...formData, functional_count: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Repairable</label>
                  <input
                    type="number"
                    value={formData.repairable_count}
                    onChange={(e) => setFormData({...formData, repairable_count: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scrap</label>
                  <input
                    type="number"
                    value={formData.scrap_count}
                    onChange={(e) => setFormData({...formData, scrap_count: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-700 block mb-2">Damaged Peripherals Count:</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-500 mb-1">Keyboards</label>
                    <input
                      type="number"
                      value={formData.keyboards_scrap}
                      onChange={(e) => setFormData({...formData, keyboards_scrap: parseInt(e.target.value) || 0})}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Mice</label>
                    <input
                      type="number"
                      value={formData.mice_scrap}
                      onChange={(e) => setFormData({...formData, mice_scrap: parseInt(e.target.value) || 0})}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Monitors</label>
                    <input
                      type="number"
                      value={formData.monitors_scrap}
                      onChange={(e) => setFormData({...formData, monitors_scrap: parseInt(e.target.value) || 0})}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Cables</label>
                    <input
                      type="number"
                      value={formData.cables_scrap}
                      onChange={(e) => setFormData({...formData, cables_scrap: parseInt(e.target.value) || 0})}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
