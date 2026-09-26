import React, { useState, useEffect } from 'react'
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Tag, 
  Phone, 
  Mail, 
  Sparkles, 
  Heart, 
  Check, 
  Filter 
} from 'lucide-react'
import { api } from '../services/api'

const CATEGORIES = [
  'All',
  'Calculators & Tools',
  'Lab Components',
  'Storage & Peripherals',
  'Cables & Power',
  'Textbooks & Notes'
]

export default function ReuseMarketplace() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [filterType, setFilterType] = useState('all') // 'all', 'free', 'priced'
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_type: 'free',
    price: 0,
    category: 'Lab Components',
    contact_info: '',
    image_url: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const loadItems = async () => {
    try {
      setLoading(true)
      const data = await api.getMarketplace()
      setItems(data)
    } catch (err) {
      console.error('Failed to load marketplace:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await api.createMarketItem(formData)
      setShowAddModal(false)
      setFormData({
        title: '',
        description: '',
        price_type: 'free',
        price: 0,
        category: 'Lab Components',
        contact_info: '',
        image_url: ''
      })
      await loadItems()
    } catch (err) {
      alert('Error listing item: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = items.filter(item => {
    const matchesSearch = 
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory
    const matchesPrice = filterType === 'all' || item.price_type === filterType
    return matchesSearch && matchesCat && matchesPrice
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Campus Reusables Marketplace</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Give away or trade used electronics, lab toolkits, calculators, and engineering accessories before graduating.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Reusable Item</span>
        </button>
      </div>

      {/* Categories & Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${filterType === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'}`}
            >
              All Items
            </button>
            <button
              onClick={() => setFilterType('free')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${filterType === 'free' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
            >
              🎁 Free Giveaways
            </button>
            <button
              onClick={() => setFilterType('priced')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${filterType === 'priced' ? 'bg-rose-600 text-white' : 'text-slate-600'}`}
            >
              💰 Under-Cost Sale
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading marketplace listings...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No marketplace listings match</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first to list an item or give away your unused lab equipment to a junior.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map(item => {
            const isFree = item.price_type === 'free' || item.price == 0
            return (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-rose-300 transition overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {item.image_url ? (
                    <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover hover:scale-105 transition duration-300" 
                      />
                      <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                        isFree ? 'bg-emerald-600 text-white' : 'bg-slate-900/80 text-white backdrop-blur'
                      }`}>
                        {isFree ? 'FREE GIFT' : `₹${item.price}`}
                      </span>
                    </div>
                  ) : (
                    <div className="h-28 bg-gradient-to-tr from-slate-100 to-rose-50 flex items-center justify-center relative">
                      <ShoppingBag className="w-8 h-8 text-rose-300" />
                      <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                        isFree ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
                      }`}>
                        {isFree ? 'FREE GIFT' : `₹${item.price}`}
                      </span>
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium truncate max-w-[150px]">
                      {item.contact_info}
                    </span>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition"
                    >
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Item Details / Contact Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Claim / Inquire Item</h2>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900">{selectedItem.title}</h3>
              <p className="text-slate-600 leading-relaxed">{selectedItem.description}</p>
              
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-700 block">Owner Contact Details:</span>
                <p className="font-mono text-emerald-800 text-xs font-bold">{selectedItem.contact_info}</p>
              </div>

              <p className="text-[11px] text-slate-400">
                Tip: Arrange hand-off during college hours at a safe campus location such as the college canteen, library, or department department foyer.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Post Item on Marketplace</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="Lab Components">Lab Components</option>
                    <option value="Calculators & Tools">Calculators & Tools</option>
                    <option value="Storage & Peripherals">Storage & Peripherals</option>
                    <option value="Cables & Power">Cables & Power</option>
                    <option value="Textbooks & Notes">Textbooks & Notes</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pricing Model *</label>
                  <select
                    value={formData.price_type}
                    onChange={(e) => setFormData({...formData, price_type: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="free">Free Giveaway</option>
                    <option value="priced">Fixed Price (₹)</option>
                  </select>
                </div>
              </div>

              {formData.price_type === 'priced' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Contact Info (Campus Email / Phone / Room) *</label>
                <input
                  type="text"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
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
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md shadow-rose-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
