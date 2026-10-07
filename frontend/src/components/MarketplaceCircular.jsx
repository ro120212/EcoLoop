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
  Check,
  Camera,
  UploadCloud,
  X,
  Image as ImageIcon,
  ArrowRight,
  Copy
} from 'lucide-react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'

const DEPARTMENTS = [
  'All',
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Instrumentation and Control Engineering'
]

export default function MarketplaceCircular({ user, onGoToPortfolio }) {
  const toast = useToast()
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
  const [copiedModalPin, setCopiedModalPin] = useState(false)

  const handleCopyModalPin = (pin) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(pin))
    }
    setCopiedModalPin(true)
    toast.info('PIN Copied to Clipboard!', `Show code "${pin}" to the seller at your meeting spot.`)
    setTimeout(() => setCopiedModalPin(false), 2000)
  }

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
    image_url: '',
    sub_components_list: ['Main Unit']
  })
  const [imagePreview, setImagePreview] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const [newSubPart, setNewSubPart] = useState('')
  const [postingLoading, setPostingLoading] = useState(false)

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setImageUploading(true)
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 800
          const MAX_HEIGHT = 800
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          const compressed = canvas.toDataURL('image/jpeg', 0.82)
          setImagePreview(compressed)
          setPostForm(prev => ({ ...prev, image_url: compressed }))
          setImageUploading(false)
        }
        img.onerror = () => {
          setImagePreview(uploadEvent.target.result)
          setPostForm(prev => ({ ...prev, image_url: uploadEvent.target.result }))
          setImageUploading(false)
        }
        img.src = uploadEvent.target.result
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Image upload error:', err)
      setImageUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview('')
    setPostForm(prev => ({ ...prev, image_url: '' }))
  }

  const studentId = user?.id || user?.email || 'student'
  const studentName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Student')

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
      toast.success('Hardware Reserved!', `4-digit PIN generated for "${claimingItem.title}".`)
      await loadItems()
    } catch (err) {
      setClaimingError(err.message)
      toast.error('Reservation Failed', err.message)
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
        image_url: postForm.image_url || ''
      })
      const savedTitle = postForm.title
      setShowPostModal(false)
      setImagePreview('')
      setPostForm({
        title: '',
        description: '',
        department: 'Computer Science and Engineering',
        category: 'Hardware & Components',
        condition: 'Functional/Tested',
        price_type: 'free',
        price: 0,
        image_url: '',
        sub_components_list: ['Main Unit']
      })
      toast.success('Hardware Listed for Campus Reuse!', `"${savedTitle}" is now live on the circular marketplace.`)
      await loadItems()
    } catch (err) {
      toast.error('Listing Failed', err.message)
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1c1c1c] p-6 rounded-2xl border border-[#2e2e2e] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-[#EDEDED]">Campus Circular Marketplace &amp; Component Exchange</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Exchange e-waste, surplus lab systems, and project materials across CSE, Mechanical, Civil, EEE, and IC.
          </p>
        </div>

        <button
          onClick={() => setShowPostModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs shadow-sm transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    selectedDept === d
                      ? 'bg-[#3ECF8E] text-[#121212] shadow-sm'
                      : 'bg-[#1c1c1c] border border-[#2e2e2e] text-zinc-400 hover:text-[#EDEDED] hover:bg-[#232323]'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-1.5 bg-[#181818] border border-[#2e2e2e] p-1 rounded-xl text-xs">
            <button
              onClick={() => setPriceFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                priceFilter === 'all' 
                  ? 'bg-[#232323] shadow-sm text-[#EDEDED] border border-[#2e2e2e]' 
                  : 'text-zinc-400 hover:text-[#EDEDED]'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setPriceFilter('free')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                priceFilter === 'free' 
                  ? 'bg-[#3ECF8E] text-[#121212]' 
                  : 'text-zinc-400 hover:text-[#EDEDED]'
              }`}
            >
              🎁 Free Gifts
            </button>
            <button
              onClick={() => setPriceFilter('priced')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                priceFilter === 'priced' 
                  ? 'bg-[#3ECF8E] text-[#121212]' 
                  : 'text-zinc-400 hover:text-[#EDEDED]'
              }`}
            >
              💰 Student Price
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search electronics, lab surplus, microcontrollers, cables, or parts..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] placeholder-zinc-500 text-xs focus:outline-none focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] shadow-sm"
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
                  {/* Item Photo if provided */}
                  {item.image_url && (
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 mb-2 relative">
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                  )}

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
                      className="w-full py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs transition shadow-sm cursor-pointer"
                    >
                      Claim / Buy for Project
                    </button>
                  ) : item.status === 'reserved' && (
                    item.buyer_id === studentId || 
                    item.buyer_name === studentName || 
                    (user?.email && (item.buyer_id === user.email || item.buyer_name === user.email)) ||
                    (studentId === 'student' && (item.buyer_id === 'student' || item.buyer_id === 'demo-student' || item.buyer_id === 'campus-member'))
                  ) ? (
                    <button
                      onClick={() => {
                        setClaimingItem(item)
                        setClaimedComponent(item.claimed_component || 'All')
                        setClaimingSuccess({
                          item_id: item.id,
                          handoff_pin: item.handoff_pin || 'Pending',
                          meeting_point: item.meeting_point || 'Campus Meeting Point',
                          claimed_component: item.claimed_component || 'All'
                        })
                        setClaimingError('')
                      }}
                      className="w-full py-2 rounded-xl bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/40 text-center font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#3ECF8E]/30 transition"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Reserved by You • View PIN</span>
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
                  You requested: <strong>{claimingItem?.title}</strong>
                </p>

                {/* Big PIN Box */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">
                      Your 4-Digit Handoff PIN
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyModalPin(claimingSuccess?.handoff_pin || claimingItem?.handoff_pin || '7492')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 font-mono text-[10px] flex items-center gap-1 cursor-pointer transition border border-slate-700"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedModalPin ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-3xl font-extrabold tracking-widest text-emerald-400 select-all">
                    {claimingSuccess?.handoff_pin || claimingItem?.handoff_pin || '7492'}
                  </div>
                  <div className="pt-1 text-[11px] text-slate-300 flex items-center justify-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Meeting Spot: <strong>{claimingSuccess?.meeting_point || claimingItem?.meeting_point || 'Campus Meeting Spot'}</strong></span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Meet the seller at your typed spot and show this PIN or QR code to complete the transfer.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setClaimingItem(null)
                      if (onGoToPortfolio) onGoToPortfolio('buyer')
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-bold text-xs transition cursor-pointer shadow-md shadow-[#3ECF8E]/20 flex items-center justify-center gap-2"
                  >
                    <span>View in My Dashboard &amp; Copy PIN</span>
                    <ArrowRight className="w-4 h-4" />
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
                    className="px-5 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold shadow-md shadow-[#3ECF8E]/20 transition disabled:opacity-50 cursor-pointer"
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
                    <option value="Electronics and Communication Engineering">ECE</option>
                    <option value="Electrical and Electronics Engineering">EEE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Civil Engineering">Civil</option>
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

              {/* Add Item Image */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Item Photo (Optional)
                </label>
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={imagePreview}
                        alt="Upload preview"
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">Photo Attached</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">Ready to display on ad</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/40 text-slate-600 hover:text-emerald-700 cursor-pointer transition text-xs font-semibold">
                      <Camera className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{imageUploading ? 'Processing Photo...' : 'Add / Upload Item Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
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
                  className="px-5 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold shadow-md shadow-[#3ECF8E]/20 transition disabled:opacity-50 cursor-pointer"
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
