import React, { useState, useEffect } from 'react'
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  MapPin, 
  Tag, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  QrCode, 
  KeyRound,
  Filter,
  Layers,
  Building2,
  Check
} from 'lucide-react'
import { api } from '../services/api'

const DEPARTMENTS = [
  'All',
  'Computer Science and Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical and Electronics Engineering',
  'Instrumentation and Control Engineering'
]

export default function MarketplaceCircular({ user, onGoToPortfolio }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDept, setSelectedDept] = useState('All')
  const [priceFilter, setPriceFilter] = useState('all') // 'all', 'free', 'priced'
  const [searchTerm, setSearchTerm] = useState('')
  
  // Claim modal state
  const [claimingItem, setClaimingItem] = useState(null)
  const [claimedComponent, setClaimedComponent] = useState('All')
  const [meetingPointInput, setMeetingPointInput] = useState('')
  const [claimingSuccess, setClaimingSuccess] = useState(null)
  const [claimingError, setClaimingError] = useState('')
  const [claimingLoading, setClaimingLoading] = useState(false)

  // Post modal state
  const [showPostModal, setShowPostModal] = useState(false)
  const [postForm, setPostForm] = useState({
    title: '',
    description: '',
    department: 'Computer Science and Engineering',
    category: 'Hardware & Components',
    condition: 'Functional/Tested',
    price_type: 'free',
    price: 0,
    sub_components_list: ['Main Unit']
  })
  const [newSubPart, setNewSubPart] = useState('')
  const [postingLoading, setPostingLoading] = useState(false)

  const studentId = user?.id || 'demo-student'
  const studentName = user?.email?.split('@')[0] || 'Rahul K (S7 CSE)'

  const loadItems = async () => {
    try {
      setLoading(true)
      const data = await api.getMarketplace(selectedDept)
      setItems(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [selectedDept])

  const handleClaimSubmit = async (e) => {
    e.preventDefault()
    if (!meetingPointInput.trim()) {
      setClaimingError('Please enter a meeting location on campus.')
      return
    }

    try {
      setClaimingLoading(true)
      setClaimingError('')
      const res = await api.claimItem(
        claimingItem.id,
        studentId,
        studentName,
        meetingPointInput.trim(),
        claimedComponent
      )
      setClaimingSuccess(res)
      await loadItems()
    } catch (err) {
      setClaimingError(err.message)
    } finally {
      setClaimingLoading(false)
    }
  }

  const handleAddSubPart = () => {
    if (!newSubPart.trim()) return
    setPostForm({
      ...postForm,
      sub_components_list: [...postForm.sub_components_list, newSubPart.trim()]
    })
    setNewSubPart('')
  }

  const handleRemoveSubPart = (index) => {
    setPostForm({
      ...postForm,
      sub_components_list: postForm.sub_components_list.filter((_, i) => i !== index)
    })
  }

  const handlePostSubmit = async (e) => {
    e.preventDefault()
    try {
      setPostingLoading(true)
      const subCompJson = JSON.stringify(
        postForm.sub_components_list.map(name => ({ name, status: 'available' }))
      )
      await api.createMarketItem({
        title: postForm.title,
        description: postForm.description,
        department: postForm.department,
        category: postForm.category,
        condition: postForm.condition,
        price_type: postForm.price_type,
        price: postForm.price,
        sub_components: subCompJson,
        carbon_saved_kg: postForm.price_type === 'free' ? 12.0 : 8.5,
        seller_id: studentId,
        seller_name: studentName,
        image_url: ''
      })
      setShowPostModal(false)
      setPostForm({
        title: '',
        description: '',
        department: 'Computer Science and Engineering',
        category: 'Hardware & Components',
        condition: 'Functional/Tested',
        price_type: 'free',
        price: 0,
        sub_components_list: ['Main Unit']
      })
      await loadItems()
    } catch (err) {
      alert('Error creating listing: ' + err.message)
    } finally {
      setPostingLoading(false)
    }
  }

  const filtered = items.filter(item => {
    const matchesSearch = 
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.seller_name || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPrice = 
      priceFilter === 'all' || 
      (priceFilter === 'free' && (item.price_type === 'free' || item.price == 0)) ||
      (priceFilter === 'priced' && item.price_type === 'priced' && item.price > 0)

    return matchesSearch && matchesPrice
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
            <h1 className="text-xl font-bold text-slate-900">Campus Circular Marketplace & Component Exchange</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Exchange e-waste, surplus lab systems, and project materials across CSE, Mechanical, Civil, EEE, and IC.
          </p>
        </div>

        <button
          onClick={() => setShowPostModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Item / Split Parts</span>
        </button>
      </div>

      {/* Department Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-wrap gap-1.5">
            {DEPARTMENTS.map(d => {
              const label = d === 'All' ? 'All Departments' : d.split(' ')[0]
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDept(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedDept === d
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setPriceFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold ${priceFilter === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'}`}
            >
              All Items
            </button>
            <button
              onClick={() => setPriceFilter('free')}
              className={`px-2.5 py-1 rounded-lg font-semibold ${priceFilter === 'free' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
            >
              🎁 Free Gifts
            </button>
            <button
              onClick={() => setPriceFilter('priced')}
              className={`px-2.5 py-1 rounded-lg font-semibold ${priceFilter === 'priced' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
            >
              💰 Student Price
            </button>
          </div>
        </div>

        {/* Search */}
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

      {/* Items Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading circular marketplace items...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No items found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No items in this category yet. Have an unused device or spare parts in your room? Post it for other students!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => {
            const isFree = item.price_type === 'free' || item.price == 0
            const isAvailable = item.status === 'available'
            let subParts = []
            try {
              subParts = JSON.parse(item.sub_components || '[]')
            } catch (e) {
              subParts = []
            }

            return (
              <div 
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 truncate max-w-[180px]">
                      {item.department.split(' ')[0]} • {item.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-900 text-white'
                    }`}>
                      {isFree ? 'FREE GIFT' : `₹${item.price}`}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description || 'No description.'}
                  </p>

                  {/* Component Splitting Breakdown */}
                  {subParts.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-500" />
                        Salvageable Components:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {subParts.map((sp, idx) => (
                          <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                            {sp.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Donor: <strong className="text-slate-800">{item.seller_name}</strong></span>
                    <span className="text-[11px] text-slate-400">{item.condition}</span>
                  </div>

                  {isAvailable ? (
                    <button
                      onClick={() => {
                        setClaimingItem(item)
                        setClaimedComponent('All')
                        setMeetingPointInput('')
                        setClaimingSuccess(null)
                        setClaimingError('')
                      }}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm"
                    >
                      Claim / Buy for Project
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-xl bg-slate-100 text-slate-500 text-center font-semibold text-xs flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.status === 'handoff_completed' ? 'Reused in Project' : `Reserved by ${item.buyer_name || 'Student'}`}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CLAIM MODAL WITH BUYER TYPED MEETING POINT */}
      {claimingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Claim / Request Hardware</h2>
                <p className="text-xs text-slate-500">Peer-to-peer campus circular handoff</p>
              </div>
              <button 
                onClick={() => setClaimingItem(null)} 
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {claimingSuccess ? (
              <div className="space-y-4 text-center py-2 text-xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Item Successfully Reserved!</h3>
                <p className="text-slate-600">
                  You requested: <strong>{claimingItem.title}</strong>
                </p>

                {/* Big PIN Box */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">
                    Your 4-Digit Handoff PIN
                  </span>
                  <div className="font-mono text-3xl font-extrabold tracking-widest text-emerald-400">
                    {claimingSuccess.handoff_pin}
                  </div>
                  <div className="pt-1 text-[11px] text-slate-300 flex items-center justify-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Meeting Spot: <strong>{claimingSuccess.meeting_point}</strong></span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Meet the seller at your typed spot and show this PIN or QR code to complete the transfer.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setClaimingItem(null)
                      if (onGoToPortfolio) onGoToPortfolio()
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
                  >
                    View in My Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <strong className="text-slate-900 block">{claimingItem.title}</strong>
                  <p className="text-slate-500">Seller: {claimingItem.seller_name} ({claimingItem.department.split(' ')[0]})</p>
                </div>

                {/* Component Splitting Selection */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">What would you like to claim?</label>
                  <select
                    value={claimedComponent}
                    onChange={(e) => setClaimedComponent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="All">Take Entire Device / Unit</option>
                    {(() => {
                      try {
                        return JSON.parse(claimingItem.sub_components || '[]').map((p, idx) => (
                          <option key={idx} value={p.name}>Harvest Specific Part: {p.name}</option>
                        ))
                      } catch (e) {
                        return null
                      }
                    })()}
                  </select>
                </div>

                {/* BUYER CUSTOM MEETING POINT TYPEBOX */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    📍 Where and when do you want to meet to hand off this item? *
                  </label>
                  <input
                    type="text"
                    value={meetingPointInput}
                    onChange={(e) => setMeetingPointInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Type any campus spot: e.g. "Outside CSE Lab 204", "Civil CAD Lab foyer", "Canteen Table 4".
                  </span>
                </div>

                {claimingError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px]">
                    {claimingError}
                  </div>
                )}

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
                    disabled={claimingLoading}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/30 transition disabled:opacity-50"
                  >
                    {claimingLoading ? 'Reserving...' : 'Confirm & Get Handoff PIN'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* POST ITEM MODAL WITH COMPONENT SPLITTING */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Post E-Waste / Component for Campus Reuse</h2>
                <p className="text-xs text-slate-500">Offer hardware or split components to other students</p>
              </div>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Title *</label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={postForm.department}
                    onChange={(e) => setPostForm({...postForm, department: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Computer Science and Engineering">CSE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Civil Engineering">Civil</option>
                    <option value="Electrical and Electronics Engineering">EEE</option>
                    <option value="Instrumentation and Control Engineering">Instrumentation (IC)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={postForm.condition}
                    onChange={(e) => setPostForm({...postForm, condition: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Functional/Tested">Functional / Tested</option>
                    <option value="Like New">Like New</option>
                    <option value="Needs Minor Repair">Needs Minor Repair</option>
                    <option value="Scrap for Component Harvesting">Scrap for Parts Harvesting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price Type</label>
                  <select
                    value={postForm.price_type}
                    onChange={(e) => setPostForm({...postForm, price_type: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="free">Free Gift (Giveaway)</option>
                    <option value="priced">Student Nominal Price (₹)</option>
                  </select>
                </div>
                {postForm.price_type === 'priced' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={postForm.price}
                      onChange={(e) => setPostForm({...postForm, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Known Defect/Status</label>
                <textarea
                  rows="2"
                  value={postForm.description}
                  onChange={(e) => setPostForm({...postForm, description: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                ></textarea>
              </div>

              {/* COMPONENT SPLITTING BUILDER */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-800 block">
                  ⚙️ Enable Component Splitting (List Salvageable Sub-Parts):
                </span>
                <p className="text-[11px] text-slate-500">
                  Allow other students to harvest specific parts if they don't need the whole item.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubPart}
                    onChange={(e) => setNewSubPart(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubPart}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
                  >
                    + Add Part
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {postForm.sub_components_list.map((sp, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                      <span>{sp}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSubPart(idx)}
                        className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {postingLoading ? 'Publishing...' : 'Publish to Campus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
