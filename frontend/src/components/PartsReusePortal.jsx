import React, { useState, useEffect } from 'react'
import { 
  Cpu, 
  Search, 
  Plus, 
  Check, 
  Filter, 
  MapPin, 
  Tag, 
  CheckCircle, 
  Clock, 
  HardDrive, 
  SlidersHorizontal 
} from 'lucide-react'
import { api } from '../services/api'

const CATEGORIES = [
  'All',
  'RAM / Memory',
  'Storage',
  'Peripherals',
  'Cables & Adapters',
  'Power Supplies',
  'Displays'
]

export default function PartsReusePortal() {
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [claimingPart, setClaimingPart] = useState(null)
  const [claimerName, setClaimerName] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'RAM / Memory',
    specs: '',
    condition: 'Functional/Tested',
    quantity: 1,
    location: 'CSE Systems Lab (Room 204)'
  })
  const [submitting, setSubmitting] = useState(false)

  const loadParts = async () => {
    try {
      setLoading(true)
      const data = await api.getParts(selectedCategory)
      setParts(data)
    } catch (err) {
      console.error('Failed to load parts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadParts()
  }, [selectedCategory])

  const handleAddPart = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await api.createPart(formData)
      setShowAddModal(false)
      setFormData({
        title: '',
        category: 'RAM / Memory',
        specs: '',
        condition: 'Functional/Tested',
        quantity: 1,
        location: 'CSE Systems Lab (Room 204)'
      })
      await loadParts()
    } catch (err) {
      alert('Error listing spare part: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClaim = async (e) => {
    e.preventDefault()
    if (!claimerName) return
    try {
      await api.claimPart(claimingPart.id, claimerName)
      setClaimingPart(null)
      setClaimerName('')
      await loadParts()
    } catch (err) {
      alert('Error claiming part: ' + err.message)
    }
  }

  const filtered = parts.filter(p => {
    const matchesSearch = 
      (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.specs || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Computer Parts Reuse Portal</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Exchange functional computer parts between campus labs, student projects, and research spaces.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Deposit Spare Part</span>
        </button>
      </div>

      {/* Categories & Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search parts by title, specs (e.g. DDR4, SATA, 450W), or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Parts Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading available parts catalog...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <Cpu className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No parts found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No components match your search. Have unused RAM, cables, or power supplies? List them for others!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(part => {
            const isAvailable = part.status === 'available'
            return (
              <div 
                key={part.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                      {part.category}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {part.status === 'available' ? 'Available' : `Claimed (${part.claimed_by || 'Reserved'})`}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {part.title}
                  </h3>

                  {part.specs && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono">
                      {part.specs}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Condition: <strong className="text-slate-700">{part.condition}</strong></span>
                    <span>Quantity: <strong className="text-slate-700">{part.quantity}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{part.location}</span>
                  </div>

                  {isAvailable ? (
                    <button
                      onClick={() => setClaimingPart(part)}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm"
                    >
                      Request / Claim Part
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-xl bg-slate-100 text-slate-500 text-center font-medium text-xs flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Claimed by {part.claimed_by}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Claim Modal */}
      {claimingPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Claim Spare Component</h2>
            <p className="text-xs text-slate-600">
              You are requesting: <strong className="text-blue-700">{claimingPart.title}</strong> located at <strong>{claimingPart.location}</strong>.
            </p>

            <form onSubmit={handleClaim} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Name & Roll No / Department *</label>
                <input
                  type="text"
                  placeholder="e.g. Anand K (S7 CSE, Roll 24)"
                  value={claimerName}
                  onChange={(e) => setClaimerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-800">
                💡 This item will be reserved in your name for 48 hours for physical pickup at the listed lab location.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimingPart(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/30 transition"
                >
                  Confirm Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Part Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Deposit Spare Computer Part</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPart} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Part Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Corsair Vengeance 8GB DDR3 1600MHz"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="RAM / Memory">RAM / Memory</option>
                    <option value="Storage">Storage (HDD / SSD)</option>
                    <option value="Peripherals">Peripherals (Keyboards, Mice)</option>
                    <option value="Cables & Adapters">Cables & Adapters</option>
                    <option value="Power Supplies">Power Supplies (SMPS)</option>
                    <option value="Displays">Displays & Monitors</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Technical Specs</label>
                <input
                  type="text"
                  placeholder="e.g. DDR3 DIMM, 1.5V, CL11, tested with 0 errors"
                  value={formData.specs}
                  onChange={(e) => setFormData({...formData, specs: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Like New">Like New</option>
                    <option value="Functional/Tested">Functional / Tested</option>
                    <option value="New">Brand New / Unused</option>
                    <option value="Needs Minor Repair">Needs Minor Repair</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Listing...' : 'List Component'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
