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
      toast.success('Item Listed', `"${savedTitle}" is now live on the marketplace.`)
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
            <h1 className="text-xl font-bold text-[#EDEDED]">Marketplace</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Browse and exchange available components across campus.
          </p>
        </div>

        <button
          onClick={() => setShowPostModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs shadow-sm transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ List Item</span>
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
              All
            </button>
            <button
              onClick={() => setPriceFilter('free')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                priceFilter === 'free' 
                  ? 'bg-[#3ECF8E] text-[#121212]' 
                  : 'text-zinc-400 hover:text-[#EDEDED]'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setPriceFilter('priced')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                priceFilter === 'priced' 
                  ? 'bg-[#3ECF8E] text-[#121212]' 
                  : 'text-zinc-400 hover:text-[#EDEDED]'
              }`}
            >
              Priced
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
            placeholder="Search components, parts, or donors..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] placeholder-zinc-500 text-xs focus:outline-none focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] shadow-sm"
          />
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500 text-xs">Loading items...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1c1c1c] p-12 text-center rounded-2xl border border-[#2e2e2e] shadow-sm space-y-2">
          <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-[#EDEDED]">No items found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            No items in this category yet. Have an unused device or spare parts? List it for others!
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
                className="bg-[#1c1c1c] p-5 rounded-2xl border border-[#2e2e2e] shadow-sm hover:border-[#3e3e3e] transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  {/* Item Photo if provided */}
                  {item.image_url && (
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-[#141414] border border-[#2e2e2e] mb-2 relative">
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#242424] text-[#3ECF8E] border border-[#2e2e2e] truncate max-w-[180px]">
                      {item.department.split(' ')[0]} • {item.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isFree ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/30' : 'bg-[#242424] text-[#EDEDED] border border-[#2e2e2e]'
                    }`}>
                      {isFree ? 'Free' : `₹${item.price}`}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#EDEDED] leading-snug line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.description || 'No description.'}
                  </p>

                  {/* Component Splitting Breakdown */}
                  {subParts.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-[#141414] border border-[#2e2e2e] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block flex items-center gap-1">
                        <Layers className="w-3 h-3 text-zinc-400" />
                        Parts:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {subParts.map((sp, idx) => (
                          <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#232323] border border-[#2e2e2e] text-zinc-300">
                            {sp.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2 border-t border-[#242424] text-xs">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Listed by: <strong className="text-zinc-200">{item.seller_name}</strong></span>
                    <span className="text-[11px] text-zinc-500">{item.condition}</span>
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
                      Claim
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
                      <span>Reserved • View PIN</span>
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-xl bg-[#242424] text-zinc-400 border border-[#2e2e2e] text-center font-semibold text-xs flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3ECF8E]" />
                      <span>{item.status === 'handoff_completed' ? 'Completed' : `Reserved`}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#1c1c1c] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#2e2e2e] space-y-4 text-[#EDEDED]">
            <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#EDEDED]">Claim Item</h2>
                <p className="text-xs text-zinc-400">Campus component handoff</p>
              </div>
              <button 
                onClick={() => setClaimingItem(null)} 
                className="text-zinc-400 hover:text-[#EDEDED] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {claimingSuccess ? (
              <div className="space-y-4 text-center py-2 text-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#EDEDED]">Item Reserved</h3>
                <p className="text-zinc-400">
                  Item: <strong className="text-zinc-200">{claimingItem?.title}</strong>
                </p>

                {/* Big PIN Box */}
                <div className="p-4 rounded-2xl bg-[#141414] border border-[#2e2e2e] text-white space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#3ECF8E] font-mono">
                      Handoff PIN
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyModalPin(claimingSuccess?.handoff_pin || claimingItem?.handoff_pin || '7492')}
                      className="px-2 py-0.5 rounded bg-[#242424] hover:bg-[#2c2c2c] text-zinc-300 hover:text-[#3ECF8E] font-mono text-[10px] flex items-center gap-1 cursor-pointer transition border border-[#2e2e2e]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedModalPin ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-3xl font-extrabold tracking-widest text-[#3ECF8E] select-all">
                    {claimingSuccess?.handoff_pin || claimingItem?.handoff_pin || '7492'}
                  </div>
                  <div className="pt-1 text-[11px] text-zinc-400 flex items-center justify-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#3ECF8E]" />
                    <span>Meeting Spot: <strong className="text-zinc-200">{claimingSuccess?.meeting_point || claimingItem?.meeting_point || 'Campus Meeting Spot'}</strong></span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500">
                  Meet the seller at your chosen location and share this PIN to complete the transfer.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setClaimingItem(null)
                      if (onGoToPortfolio) onGoToPortfolio('buyer')
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-bold text-xs transition cursor-pointer shadow-md shadow-[#3ECF8E]/20 flex items-center justify-center gap-2"
                  >
                    <span>View in Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-[#141414] border border-[#2e2e2e] space-y-1">
                  <strong className="text-[#EDEDED] block">{claimingItem.title}</strong>
                  <p className="text-zinc-400">Seller: {claimingItem.seller_name} ({claimingItem.department.split(' ')[0]})</p>
                </div>

                {/* Component Splitting Selection */}
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Select Claim Option</label>
                  <select
                    value={claimedComponent}
                    onChange={(e) => setClaimedComponent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:outline-none"
                  >
                    <option value="All">Entire Item</option>
                    {(() => {
                      try {
                        return JSON.parse(claimingItem.sub_components || '[]').map((p, idx) => (
                          <option key={idx} value={p.name}>Specific Part: {p.name}</option>
                        ))
                      } catch (e) {
                        return null
                      }
                    })()}
                  </select>
                </div>

                {/* BUYER CUSTOM MEETING POINT TYPEBOX */}
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    📍 Pickup Location & Time *
                  </label>
                  <input
                    type="text"
                    value={meetingPointInput}
                    onChange={(e) => setMeetingPointInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] text-xs focus:ring-1 focus:ring-[#3ECF8E] focus:outline-none"
                    placeholder="e.g. Outside CSE Lab 204, Canteen Table 4"
                    required
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Campus location where you want to meet the seller.
                  </span>
                </div>

                {claimingError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                    {claimingError}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setClaimingItem(null)}
                    className="px-4 py-2 rounded-xl border border-[#2e2e2e] hover:bg-[#242424] font-semibold text-zinc-400 hover:text-[#EDEDED] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={claimingLoading}
                    className="px-5 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold shadow-md shadow-[#3ECF8E]/20 transition disabled:opacity-50 cursor-pointer"
                  >
                    {claimingLoading ? 'Reserving...' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* POST ITEM MODAL WITH COMPONENT SPLITTING */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#1c1c1c] rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#2e2e2e] space-y-4 text-[#EDEDED]">
            <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#EDEDED]">List Item</h2>
                <p className="text-xs text-zinc-400">Offer hardware or components to other students</p>
              </div>
              <button onClick={() => setShowPostModal(false)} className="text-zinc-400 hover:text-[#EDEDED] font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Item Title *</label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Department *</label>
                  <select
                    value={postForm.department}
                    onChange={(e) => setPostForm({...postForm, department: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:outline-none cursor-pointer"
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
                  <label className="block font-semibold text-zinc-300 mb-1">Condition</label>
                  <select
                    value={postForm.condition}
                    onChange={(e) => setPostForm({...postForm, condition: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:outline-none cursor-pointer"
                  >
                    <option value="Functional/Tested">Functional / Tested</option>
                    <option value="Like New">Like New</option>
                    <option value="Needs Minor Repair">Needs Minor Repair</option>
                    <option value="Scrap for Component Harvesting">Scrap for Parts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Price</label>
                  <select
                    value={postForm.price_type}
                    onChange={(e) => setPostForm({...postForm, price_type: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:outline-none cursor-pointer"
                  >
                    <option value="free">Free</option>
                    <option value="priced">Priced (₹)</option>
                  </select>
                </div>
                {postForm.price_type === 'priced' && (
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={postForm.price}
                      onChange={(e) => setPostForm({...postForm, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={postForm.description}
                  onChange={(e) => setPostForm({...postForm, description: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:outline-none"
                ></textarea>
              </div>

              {/* Add Item Image */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-zinc-300">
                  Photo (Optional)
                </label>
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#2e2e2e] bg-[#141414] p-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={imagePreview}
                        alt="Upload preview"
                        className="w-14 h-14 rounded-xl object-cover border border-[#2e2e2e] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#EDEDED] truncate">Photo Attached</p>
                        <p className="text-[10px] text-[#3ECF8E] font-semibold">Ready to display</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-[#2e2e2e] hover:border-[#3ECF8E]/50 bg-[#141414] text-zinc-400 hover:text-[#3ECF8E] cursor-pointer transition text-xs font-semibold">
                      <Camera className="w-4 h-4 text-[#3ECF8E] shrink-0" />
                      <span>{imageUploading ? 'Processing Photo...' : 'Add Photo'}</span>
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
              <div className="p-3 rounded-2xl bg-[#141414] border border-[#2e2e2e] space-y-2">
                <span className="font-semibold text-zinc-300 block">
                  Sub-Components (Optional)
                </span>
                <p className="text-[11px] text-zinc-500">
                  Allow other students to claim specific parts if they don't need the whole item.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubPart}
                    onChange={(e) => setNewSubPart(e.target.value)}
                    placeholder="e.g. Power Supply, Keycaps, Screen"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#181818] border border-[#2e2e2e] text-[#EDEDED] text-xs focus:ring-1 focus:ring-[#3ECF8E] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubPart}
                    className="px-3 py-1.5 rounded-xl bg-[#242424] hover:bg-[#2c2c2c] text-[#EDEDED] border border-[#2e2e2e] font-semibold text-xs cursor-pointer transition"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {postForm.sub_components_list.map((sp, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#242424] border border-[#2e2e2e] text-zinc-300">
                      <span>{sp}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSubPart(idx)}
                        className="text-zinc-500 hover:text-rose-400 font-bold ml-1 cursor-pointer"
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
                  className="px-4 py-2 rounded-xl border border-[#2e2e2e] hover:bg-[#242424] font-semibold text-zinc-400 hover:text-[#EDEDED] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingLoading}
                  className="px-5 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold shadow-md shadow-[#3ECF8E]/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {postingLoading ? 'Listing...' : 'List Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
