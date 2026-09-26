import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Recycle, 
  Wrench, 
  Sparkles,
  Building,
  RefreshCw
} from 'lucide-react'
import { api } from '../services/api'

export default function DeptInventoryTriage() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDept, setSelectedDept] = useState('All')
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    department: 'Computer Science',
    item_name: '',
    category: 'Peripherals',
    total_qty: 12,
    working_qty: 7,
    repairable_qty: 3,
    recyclable_qty: 2
  })
  const [submitting, setSubmitting] = useState(false)

  const loadInventory = async () => {
    try {
      setLoading(true)
      const data = await api.getInventory(selectedDept)
      setInventory(data)
    } catch (err) {
      console.error('Failed to load inventory:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [selectedDept])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await api.upsertInventory(formData)
      setShowModal(false)
      setFormData({
        department: 'Computer Science',
        item_name: '',
        category: 'Peripherals',
        total_qty: 12,
        working_qty: 7,
        repairable_qty: 3,
        recyclable_qty: 2
      })
      await loadInventory()
    } catch (err) {
      alert('Error updating inventory: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Department Reuse Inventory & Triage</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Department equipment inventory tracking (operational vs repairable vs recyclable) with automated component-harvesting recommendations.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add / Update Batch Inventory</span>
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-600">Filter Department:</span>
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Computer Science', 'Electronics & Comm', 'Electrical Eng', 'Central Computing'].map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedDept === dept
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading department inventory batches...</div>
      ) : inventory.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No inventory batches found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Log your department lab equipment batches to receive triage and cannibalization recommendations.
          </p>
        </div>
      ) : (
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

                {/* Breakdown Badges */}
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

                {/* Health Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Working Ratio</span>
                    <span className="font-bold text-slate-700">{workingPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                    <div style={{ width: `${(item.working_qty / item.total_qty) * 100}%` }} className="bg-emerald-500"></div>
                    <div style={{ width: `${(item.repairable_qty / item.total_qty) * 100}%` }} className="bg-amber-500"></div>
                    <div style={{ width: `${(item.recyclable_qty / item.total_qty) * 100}%` }} className="bg-rose-500"></div>
                  </div>
                </div>

                {/* Automated Triage Recommendation */}
                <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-100 text-xs text-cyan-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-900">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
                    <span>Automated Triage Strategy:</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    {item.recommended_action}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Record Department Inventory Batch</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Electrical Eng">Electrical Eng</option>
                    <option value="Central Computing">Central Computing</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="Peripherals">Peripherals (Keyboards, Mice)</option>
                    <option value="Storage">Storage (HDD, SSD)</option>
                    <option value="Power">Power Supplies (SMPS)</option>
                    <option value="Networking">Networking (Switches, Cables)</option>
                    <option value="Displays">Displays & Monitors</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Equipment Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dell KB216 USB Keyboards"
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.total_qty}
                    onChange={(e) => {
                      const tot = parseInt(e.target.value) || 0
                      setFormData({...formData, total_qty: tot})
                    }}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Working</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.working_qty}
                    onChange={(e) => setFormData({...formData, working_qty: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Repairable</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.repairable_qty}
                    onChange={(e) => setFormData({...formData, repairable_qty: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recycle</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.recyclable_qty}
                    onChange={(e) => setFormData({...formData, recyclable_qty: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                The platform will automatically generate a triage strategy (e.g. part harvesting from scrap units to repair salvageable units).
              </p>

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
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-md shadow-cyan-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save & Triage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
