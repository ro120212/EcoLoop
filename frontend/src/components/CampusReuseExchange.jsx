import React, { useState, useEffect } from 'react'
import { 
  ShoppingBag, 
  Cpu, 
  Search, 
  Plus, 
  Tag, 
  MapPin, 
  CheckCircle2, 
  Check, 
  Clock, 
  Sparkles,
  Phone,
  Filter
} from 'lucide-react'
import { api } from '../services/api'

const TABS = [
  { id: 'all', label: 'All Campus Items' },
  { id: 'pc_parts', label: '🖥️ PC & Lab Hardware', isPart: true },
  { id: 'free', label: '🎁 Free Giveaways' },
  { id: 'tools', label: 'Calculators & Tools' },
  { id: 'kits', label: 'Lab Kits & Boards' }
]

export default function CampusReuseExchange() {
  const [activeTab, setActiveTab] = useState('all')
  const [parts, setParts] = useState([])
  const [marketItems, setMarketItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [claimingItem, setClaimingItem] = useState(null)
  const [claimerName, setClaimerName] = useState('')

  // Form state
  const [isComponent, setIsComponent] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: 'PC & Lab Hardware',
    specs: '',
    condition: 'Functional/Tested',
    price_type: 'free',
    price: 0,
    location_or_contact: 'CSE Systems Lab (Room 204)',
    description: '',
    image_url: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [partsData, marketData] = await Promise.all([
        api.getParts(),
        api.getMarketplace()
      ])
      setParts(partsData)
      setMarketItems(marketData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleClaimPart = async (e) => {
    e.preventDefault()
    if (!claimerName || !claimingItem) return
    try {
      await api.claimPart(claimingItem.id, claimerName)
      setClaimingItem(null)
      setClaimerName('')
      await loadData()
    } catch (err) {
      alert('Error claiming component: ' + err.message)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      if (isComponent) {
        await api.createPart({
          title: formData.title,
          category: formData.category,
          specs: formData.specs,
          condition: formData.condition,
          quantity: 1,
          location: formData.location_or_contact
        })
      } else {
        await api.createMarketItem({
          title: formData.title,
          description: formData.description,
          price_type: formData.price_type,
          price: formData.price,
          category: formData.category,
          contact_info: formData.location_or_contact,
          image_url: formData.image_url
        })
      }
      setShowDepositModal(false)
      setFormData({
        title: '',
        category: 'PC & Lab Hardware',
        specs: '',
        condition: 'Functional/Tested',
        price_type: 'free',
        price: 0,
        location_or_contact: 'CSE Systems Lab (Room 204)',
        description: '',
        image_url: ''
      })
      await loadData()
    } catch (err) {
      alert('Error listing item: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Combined item list
  const unifiedItems = [
    ...parts.map(p => ({
      ...p,
      type: 'part',
      price_type: 'free',
      price: 0,
      contact_info: p.location,
      isAvailable: p.status === 'available'
    })),
    ...marketItems.map(m => ({
      ...m,
      type: 'market',
      isAvailable: m.status === 'active'
    }))
  ]

  const filtered = unifiedItems.filter(item => {
    const matchesSearch = 
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false
    if (activeTab === 'all') return true
    if (activeTab === 'pc_parts') return item.type === 'part' || item.category?.includes('RAM') || item.category?.includes('Hardware')
    if (activeTab === 'free') return item.price_type === 'free' || item.price == 0
    if (activeTab === 'tools') return item.category?.includes('Calculators') || item.category?.includes('Tools')
    if (activeTab === 'kits') return item.category?.includes('Lab') || item.category?.includes('Component')
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Campus Reuse Exchange & Parts Portal</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Exchange spare computer parts (RAM, cables, power supplies) and student reusables (calculators, lab kits, books) across campus.
          </p>
        </div>

        <button
          onClick={() => setShowDepositModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Deposit / List Item</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading items from campus exchange...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No items match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Have unused computer parts or textbooks? Deposit them for fellow students using the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => {
            const isPart = item.type === 'part'
            const isFree = item.price_type === 'free' || item.price == 0

            return (
              <div 
                key={`${item.type}-${item.id}`}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                      {isPart ? '🖥️ Lab Component' : item.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-900 text-white'
                    }`}>
                      {isFree ? 'FREE GIFT' : `₹${item.price}`}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {item.title}
                  </h3>

                  {item.specs ? (
                    <p className="text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {item.specs}
                    </p>
                  ) : item.description ? (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <strong className="text-slate-700 truncate max-w-[170px]">{item.location || item.contact_info}</strong>
                    </span>
                    {item.condition && (
                      <span className="text-[11px] text-slate-400">{item.condition}</span>
                    )}
                  </div>

                  {isPart ? (
                    item.isAvailable ? (
                      <button
                        onClick={() => setClaimingItem(item)}
                        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm"
                      >
                        Claim Component
                      </button>
                    ) : (
                      <div className="w-full py-2 rounded-xl bg-slate-100 text-slate-500 text-center font-medium text-xs flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Claimed by {item.claimed_by || 'Reserved'}</span>
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => alert(`Direct Owner Contact:\n${item.contact_info}\n\nItem: ${item.title}`)}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                    >
                      View Contact & Arrange Pickup
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Claim Modal */}
      {claimingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Claim Lab Component</h2>
            <p className="text-xs text-slate-600">
              You are claiming: <strong className="text-blue-700">{claimingItem.title}</strong> located at <strong>{claimingItem.location}</strong>.
            </p>

            <form onSubmit={handleClaimPart} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Name & Roll No / Dept *</label>
                <input
                  type="text"
                  value={claimerName}
                  onChange={(e) => setClaimerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-800">
                💡 This part will be reserved in your name for 48 hours for pickup at the lab.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimingItem(null)}
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

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">List an Item on Campus Exchange</h2>
              <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setIsComponent(true)}
                className={`flex-1 py-1.5 rounded-lg font-bold transition ${isComponent ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600'}`}
              >
                🖥️ Computer / Lab Part
              </button>
              <button
                type="button"
                onClick={() => setIsComponent(false)}
                className={`flex-1 py-1.5 rounded-lg font-bold transition ${!isComponent ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600'}`}
              >
                📦 Student Gadget / Reusable
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {isComponent ? (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Technical Specifications</label>
                    <input
                      type="text"
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
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      >
                        <option value="Functional/Tested">Functional / Tested</option>
                        <option value="Like New">Like New</option>
                        <option value="Needs Minor Repair">Needs Minor Repair</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Campus Lab Location *</label>
                      <input
                        type="text"
                        value={formData.location_or_contact}
                        onChange={(e) => setFormData({...formData, location_or_contact: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Price Model</label>
                      <select
                        value={formData.price_type}
                        onChange={(e) => setFormData({...formData, price_type: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      >
                        <option value="free">Free Giveaway</option>
                        <option value="priced">Student Price (₹)</option>
                      </select>
                    </div>
                    {formData.price_type === 'priced' && (
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Your Contact Info *</label>
                    <input
                      type="text"
                      value={formData.location_or_contact}
                      onChange={(e) => setFormData({...formData, location_or_contact: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
