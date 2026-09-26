import React, { useState, useEffect } from 'react'
import { 
  Recycle, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  QrCode, 
  Truck, 
  Calendar, 
  AlertCircle,
  Filter
} from 'lucide-react'
import { api } from '../services/api'

const STAGES = [
  { id: 'submitted', label: '1. Submitted' },
  { id: 'verified', label: '2. Verified' },
  { id: 'collection_scheduled', label: '3. Scheduled' },
  { id: 'collected', label: '4. Collected' },
  { id: 'reused_recycled', label: '5. Processing' },
  { id: 'completed', label: '6. Completed' }
]

export default function CollectionTracker() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedReq, setSelectedReq] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    item_type: 'Keyboards & Peripherals',
    brand_model: '',
    condition: 'Needs Minor Repair',
    quantity: 1,
    pickup_location: 'CSE Systems Lab (Room 204)',
    pickup_date: '',
    contact_phone: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const loadRequests = async () => {
    try {
      setLoading(true)
      const data = await api.getCollections()
      setRequests(data)
    } catch (err) {
      console.error('Failed to load collections:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await api.createCollection(formData)
      setShowModal(false)
      setFormData({
        item_type: 'Keyboards & Peripherals',
        brand_model: '',
        condition: 'Needs Minor Repair',
        quantity: 1,
        pickup_location: 'CSE Systems Lab (Room 204)',
        pickup_date: '',
        contact_phone: '',
        notes: ''
      })
      await loadRequests()
      setSelectedReq(res)
    } catch (err) {
      alert('Error creating collection request: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const advanceStatus = async (reqId, currentStatus) => {
    const currentIndex = STAGES.findIndex(s => s.id === currentStatus)
    if (currentIndex < STAGES.length - 1) {
      const nextStatus = STAGES[currentIndex + 1].id
      await api.updateCollectionStatus(reqId, nextStatus, 'Processed via Campus Hub')
      await loadRequests()
    }
  }

  const filtered = requests.filter(r => {
    const matchesSearch = 
      (r.tracking_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.item_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.brand_model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.pickup_location || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStageIndex = (status) => {
    const idx = STAGES.findIndex(s => s.id === status)
    return idx === -1 ? 0 : idx
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Recycle className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">E-Waste Collection & Status Tracker</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Register discarded electronics, schedule campus pickup, and track transparent multi-stage recycling progress.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection Request</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Tracking Code (e.g. ECL-2026), item type, or lab location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        >
          <option value="all">All Stages</option>
          {STAGES.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading collection requests from database...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <Recycle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No collection records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No items match your query. Submit an unwanted electronics item for collection using the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(req => {
            const currentStageIdx = getStageIndex(req.status)
            return (
              <div 
                key={req.id} 
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        {req.tracking_code}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Qty: {req.quantity}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        • {new Date(req.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {req.item_type} {req.brand_model && <span className="font-normal text-slate-600">({req.brand_model})</span>}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 capitalize flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {req.status?.replace('_', ' ')}
                    </span>
                    {currentStageIdx < STAGES.length - 1 && (
                      <button
                        onClick={() => advanceStatus(req.id, req.status)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-xs font-medium transition border border-slate-200"
                        title="Simulate advance to next workflow step"
                      >
                        Advance Step →
                      </button>
                    )}
                  </div>
                </div>

                {/* Multi-stage Progress Stepper */}
                <div className="py-2">
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {STAGES.map((stage, idx) => {
                      const isCompleted = idx < currentStageIdx
                      const isCurrent = idx === currentStageIdx
                      return (
                        <div 
                          key={stage.id} 
                          className={`p-2 rounded-xl text-center border text-[11px] font-semibold transition ${
                            isCompleted 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                              : isCurrent 
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {isCompleted ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : null}
                            <span>{stage.label}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Details Footer */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Location: <strong className="text-slate-800">{req.pickup_location}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pickup Date: <strong className="text-slate-800">{req.pickup_date || 'Standard Campus Drive'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Triage: <strong className="text-emerald-700">{req.action_taken || 'Pending Inspection'}</strong></span>
                  </div>
                </div>

                {req.notes && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Audit Notes:</span> {req.notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Register E-Waste for Collection</h2>
                <p className="text-xs text-slate-500">Provide device information to schedule collection on campus</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Category / Type *</label>
                <select
                  value={formData.item_type}
                  onChange={(e) => setFormData({...formData, item_type: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                >
                  <option value="Keyboards & Peripherals">Keyboards & Peripherals</option>
                  <option value="Mice & Trackpads">Mice & Optical Devices</option>
                  <option value="Laptop & Swollen Batteries">Lithium Batteries / Power Packs</option>
                  <option value="Monitors & Displays (LCD/CRT)">Monitors & Displays (LCD/CRT)</option>
                  <option value="Cables, Adapters & Chargers">Cables, Adapters & Power Bricks</option>
                  <option value="Motherboards & PCBs">Motherboards, RAM & Circuit Boards</option>
                  <option value="SMPS & Transformers">SMPS & Transformer Coils</option>
                  <option value="Full Desktop / Server Towers">Full CPU / Server Towers</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand & Model Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dell KB216 / TVS Gold"
                    value={formData.brand_model}
                    onChange={(e) => setFormData({...formData, brand_model: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condition *</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Needs Minor Repair">Needs Minor Repair</option>
                    <option value="Functional / Working">Functional / Working</option>
                    <option value="Damaged / Scrap">Damaged / Scrap</option>
                    <option value="Battery Swollen (Hazardous)">Battery Swollen (Hazardous)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Pickup Date</label>
                  <input
                    type="date"
                    value={formData.pickup_date}
                    onChange={(e) => setFormData({...formData, pickup_date: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campus Pickup Location *</label>
                <select
                  value={formData.pickup_location}
                  onChange={(e) => setFormData({...formData, pickup_location: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="CSE Systems Lab (Room 204)">CSE Systems Lab (Room 204)</option>
                  <option value="ECE Microprocessor Lab">ECE Microprocessor Lab</option>
                  <option value="EEE Machines Lab Annexe">EEE Machines Lab Annexe</option>
                  <option value="Central Library Foyer Drop-Bin">Central Library Foyer Drop-Bin</option>
                  <option value="Men's Hostel 1 Common Room">Men's Hostel 1 Common Room</option>
                  <option value="Ladies Hostel Security Desk">Ladies Hostel Security Desk</option>
                  <option value="Campus Central Workshop">Campus Central Workshop</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone (Student / Lab Staff)</label>
                <input
                  type="text"
                  placeholder="e.g. 9447123456"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Additional Notes / Defect Details</label>
                <textarea
                  rows="2"
                  placeholder="e.g. USB cable severed, rest of the membrane circuit is intact."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Register Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
