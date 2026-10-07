import React, { useState, useEffect } from 'react'
import { 
  User, 
  ShoppingBag, 
  Sparkles, 
  Wrench, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  KeyRound, 
  QrCode, 
  ShieldCheck, 
  RefreshCw, 
  Plus,
  Package,
  Layers,
  Filter,
  Check,
  AlertCircle,
  HelpCircle,
  Tag,
  Camera,
  UploadCloud,
  X,
  Copy
} from 'lucide-react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Instrumentation and Control Engineering'
]

export default function StudentDashboard({ user, onNavigate, initialTab = 'seller', onTabChange }) {
  const toast = useToast()
  const [portfolio, setPortfolio] = useState({ my_listings: [], my_claims: [], total_co2_saved_kg: 0, items_diverted_count: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTabState] = useState(initialTab || 'seller') // 'seller' | 'buyer'
  const [sellerStatusFilter, setSellerStatusFilter] = useState('all') // 'all', 'available', 'reserved', 'sold'
  const [copiedPin, setCopiedPin] = useState({})

  const setActiveTab = (tab) => {
    setActiveTabState(tab)
    if (onTabChange) onTabChange(tab)
  }

  const handleCopyPin = (itemId, pin) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(pin))
    }
    setCopiedPin(prev => ({ ...prev, [itemId]: true }))
    toast.info('Pickup PIN Copied!', `Show code "${pin}" to the seller at your meeting spot.`)
    setTimeout(() => {
      setCopiedPin(prev => ({ ...prev, [itemId]: false }))
    }, 2000)
  }
  
  // PIN verification states
  const [verifyingId, setVerifyingId] = useState(null)
  const [pinInputs, setPinInputs] = useState({})
  const [verifyMsg, setVerifyMsg] = useState({})

  // Quick List Item Modal
  const [showListModal, setShowListModal] = useState(false)
  const [submittingItem, setSubmittingItem] = useState(false)
  const [newItemForm, setNewItemForm] = useState({
    title: '',
    description: '',
    category: 'Microcontrollers & Embedded',
    department: 'Computer Science and Engineering',
    condition: 'Functional/Tested',
    price_type: 'free',
    price: 0,
    image_url: '',
    sub_component_input: 'Main Unit, Connection Cables',
    carbon_saved_kg: 6.5
  })
  const [imagePreview, setImagePreview] = useState('')
  const [imageUploading, setImageUploading] = useState(false)

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
          setNewItemForm(prev => ({ ...prev, image_url: compressed }))
          setImageUploading(false)
        }
        img.onerror = () => {
          setImagePreview(uploadEvent.target.result)
          setNewItemForm(prev => ({ ...prev, image_url: uploadEvent.target.result }))
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
    setNewItemForm(prev => ({ ...prev, image_url: '' }))
  }

  const studentId = user?.id || user?.email || 'student'
  const studentName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Student')
  const studentDept = user?.user_metadata?.department || 'Engineering Department'

  const loadPortfolio = async () => {
    try {
      setLoading(true)
      const data = await api.getUserPortfolio(studentId, user?.email, studentName)
      setPortfolio(data)
      const claims = data?.my_claims || []
      const active = claims.filter(i => i.status === 'reserved')
      const listings = data?.my_listings || []
      if (initialTab === 'buyer' || (active.length > 0 && listings.length === 0)) {
        setActiveTabState('buyer')
      }
    } catch (e) {
      console.error('Failed to load portfolio:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPortfolio()
  }, [])

  useEffect(() => {
    if (initialTab) {
      setActiveTabState(initialTab)
    }
  }, [initialTab])

  const handleVerifyPin = async (itemId) => {
    const pin = pinInputs[itemId]
    if (!pin) return
    try {
      setVerifyingId(itemId)
      const res = await api.verifyHandoffPin(itemId, pin)
      const co2 = res.co2_saved_kg || 8.5
      setVerifyMsg({ ...verifyMsg, [itemId]: { success: true, text: res.message || 'Handoff verified successfully! Status updated to Sold.' } })
      toast.celebrate('Physical Handoff Verified! 🎉', `Status updated to Sold. +${co2} kg CO₂e offset credited to your profile!`)
      await loadPortfolio()
    } catch (err) {
      setVerifyMsg({ ...verifyMsg, [itemId]: { success: false, text: err.message } })
      toast.error('PIN Verification Failed', err.message)
    } finally {
      setVerifyingId(null)
    }
  }

  const handleCreateListing = async (e) => {
    e.preventDefault()
    if (!newItemForm.title.trim()) return

    try {
      setSubmittingItem(true)
      const subParts = newItemForm.sub_component_input
        ? newItemForm.sub_component_input.split(',').map(s => ({ name: s.trim(), status: 'available' }))
        : [{ name: 'Main Unit', status: 'available' }]

      await api.createMarketItem({
        title: newItemForm.title,
        description: newItemForm.description,
        category: newItemForm.category,
        department: newItemForm.department,
        condition: newItemForm.condition,
        price_type: newItemForm.price_type,
        price: newItemForm.price_type === 'free' ? 0 : Number(newItemForm.price),
        sub_components: JSON.stringify(subParts),
        carbon_saved_kg: Number(newItemForm.carbon_saved_kg) || 8.0,
        seller_id: studentId,
        seller_name: studentName,
        image_url: newItemForm.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60'
      })

      const listedTitle = newItemForm.title
      setShowListModal(false)
      setImagePreview('')
      setNewItemForm({
        title: '',
        description: '',
        category: 'Microcontrollers & Embedded',
        department: studentDept,
        condition: 'Functional/Tested',
        price_type: 'free',
        price: 0,
        image_url: '',
        sub_component_input: 'Main Unit, Connection Cables',
        carbon_saved_kg: 6.5
      })
      toast.success('Listing Published!', `"${listedTitle}" is now live on your profile and circular marketplace.`)
      await loadPortfolio()
      setActiveTab('seller')
      setSellerStatusFilter('available')
    } catch (err) {
      toast.error('Listing Error', err.message)
    } finally {
      setSubmittingItem(false)
    }
  }

  // Filter listings
  const myListings = portfolio.my_listings || []
  const availableListings = myListings.filter(i => i.status === 'available')
  const reservedListings = myListings.filter(i => i.status === 'reserved')
  const soldListings = myListings.filter(i => i.status === 'handoff_completed')

  const filteredSellerListings = myListings.filter(item => {
    if (sellerStatusFilter === 'available') return item.status === 'available'
    if (sellerStatusFilter === 'reserved') return item.status === 'reserved'
    if (sellerStatusFilter === 'sold') return item.status === 'handoff_completed'
    return true
  })

  const myClaims = portfolio.my_claims || []
  const activeClaims = myClaims.filter(i => i.status === 'reserved')
  const completedClaims = myClaims.filter(i => i.status === 'handoff_completed')

  return (
    <div className="space-y-8 pb-16">
      {/* Consolidated Student Campus Circular Hub Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1c1c1c] text-[#EDEDED] p-6 sm:p-8 shadow-xl border border-[#2e2e2e] space-y-6">
        {/* Top Header Row with Action Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#232323] border border-[#2e2e2e] text-[#3ECF8E] text-xs font-semibold">
              <User className="w-3.5 h-3.5" />
              <span>Student Profile: <strong className="text-[#EDEDED]">{studentName}</strong> • {studentDept}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EDEDED]">
              My Campus Circular Hub
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              Track your listed e-waste sales, monitor buyer meeting spots, enter verification PINs, and manage claimed hardware.
            </p>
          </div>

          <button
            onClick={() => setShowListModal(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs shadow-lg shadow-[#3ECF8E]/20 flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ List Electronics for Sale / Free</span>
          </button>
        </div>

        {/* Nested Sub-Cards Grid */}
        <div className="pt-6 border-t border-[#282828] grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div 
            onClick={() => { setActiveTab('seller'); setSellerStatusFilter('all'); }}
            className={`p-4 rounded-2xl border shadow-sm flex items-center gap-3 cursor-pointer transition ${
              activeTab === 'seller' && sellerStatusFilter === 'all'
                ? 'bg-[#181818] border-[#3ECF8E]/50'
                : 'bg-[#141414] border-[#282828] hover:border-zinc-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#232323] border border-[#2e2e2e] text-[#3ECF8E] flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Total Listed</span>
              <p className="text-xl font-bold text-[#EDEDED]">{myListings.length} Items</p>
              <span className="text-[10px] text-zinc-400">{availableListings.length} currently active</span>
            </div>
          </div>

          <div 
            onClick={() => { setActiveTab('seller'); setSellerStatusFilter('reserved'); }}
            className={`p-4 rounded-2xl border shadow-sm flex items-center gap-3 cursor-pointer transition ${
              activeTab === 'seller' && sellerStatusFilter === 'reserved'
                ? 'bg-[#181818] border-amber-500/50'
                : 'bg-[#141414] border-[#282828] hover:border-zinc-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#232323] border border-[#2e2e2e] text-amber-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Pending Meetups</span>
              <p className="text-xl font-bold text-amber-400">{reservedListings.length} Reserved</p>
              <span className="text-[10px] text-amber-300 font-medium">Awaiting PIN handoff</span>
            </div>
          </div>

          <div 
            onClick={() => { setActiveTab('seller'); setSellerStatusFilter('sold'); }}
            className={`p-4 rounded-2xl border shadow-sm flex items-center gap-3 cursor-pointer transition ${
              activeTab === 'seller' && sellerStatusFilter === 'sold'
                ? 'bg-[#181818] border-[#3ECF8E]/50'
                : 'bg-[#141414] border-[#282828] hover:border-zinc-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#232323] border border-[#2e2e2e] text-[#3ECF8E] flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Sold / Handed Off</span>
              <p className="text-xl font-bold text-[#3ECF8E]">{soldListings.length} Taken</p>
              <span className="text-[10px] text-[#3ECF8E] font-medium">Transferred to peers</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('buyer')}
            className={`p-4 rounded-2xl border shadow-sm flex items-center gap-3 cursor-pointer transition ${
              activeTab === 'buyer'
                ? 'bg-[#181818] border-[#3ECF8E]/60 ring-1 ring-[#3ECF8E]/25'
                : 'bg-[#141414] border-[#282828] hover:border-[#3ECF8E]/40'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#232323] border border-[#2e2e2e] text-zinc-300 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-[#3ECF8E]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Claimed by Me</span>
                {activeClaims.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold font-mono animate-pulse">
                    READY
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-zinc-200">{myClaims.length} Items</p>
              <span className="text-[10px] text-[#3ECF8E] font-medium font-mono">{activeClaims.length} awaiting pickup PIN ➜</span>
            </div>
          </div>
        </div>
      </div>

      {/* HIGH PRIORITY BANNER: ACTIVE CLAIMED HARDWARE AWAITING MEETUP */}
      {activeClaims.length > 0 && (
        <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#1c1c1c] to-[#1c1c1c] border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <KeyRound className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Pickup Ready
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[#EDEDED]">
                  You have {activeClaims.length} reserved item{activeClaims.length > 1 ? 's' : ''} awaiting meetup &amp; handoff!
                </h3>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                "{activeClaims[0]?.title}" • Meeting Point: <strong className="text-amber-300">{activeClaims[0]?.meeting_point || 'Campus'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('buyer')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#3ECF8E]/25 shrink-0"
          >
            <QrCode className="w-4 h-4" />
            <span>View 4-Digit PIN &amp; Location</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dual Tab Switcher: Seller vs Buyer */}
      <div className="border-b border-[#2e2e2e]">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('seller')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'seller'
                ? 'border-[#3ECF8E] text-[#3ECF8E]'
                : 'border-transparent text-zinc-400 hover:text-[#EDEDED]'
            }`}
          >
            <Package className="w-4 h-4 text-[#3ECF8E]" />
            <span>📦 My Listed Items &amp; Sales Tracker ({myListings.length})</span>
            {reservedListings.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono animate-pulse">
                {reservedListings.length} Action Needed
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('buyer')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'buyer'
                ? 'border-[#3ECF8E] text-[#3ECF8E]'
                : 'border-transparent text-zinc-400 hover:text-[#EDEDED]'
            }`}
          >
            <QrCode className="w-4 h-4 text-[#3ECF8E]" />
            <span>🎒 My Claimed Hardware &amp; Handoff PINs ({myClaims.length})</span>
            {activeClaims.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/30 text-[10px] font-bold font-mono animate-pulse">
                {activeClaims.length} Ready to Pickup
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ================= SELLER VIEW ================= */}
      {activeTab === 'seller' && (
        <div className="space-y-6">
          {/* Helpful banner inside seller view if user has claimed items */}
          {activeClaims.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#141414] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-zinc-300 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#3ECF8E] shrink-0" />
                <span>You have <strong>{activeClaims.length} claimed hardware item(s)</strong> awaiting pickup. Looking for your secret PIN?</span>
              </span>
              <button 
                onClick={() => setActiveTab('buyer')}
                className="text-[#3ECF8E] hover:underline font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>Switch to My Claimed Hardware</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1c1c1c] p-3 rounded-2xl border border-[#2e2e2e] shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
              <span className="text-zinc-500 mr-2 text-[11px] font-bold uppercase tracking-wider font-mono">Status:</span>
              <button
                onClick={() => setSellerStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  sellerStatusFilter === 'all'
                    ? 'bg-[#3ECF8E] text-[#121212] font-bold shadow-xs'
                    : 'text-zinc-400 hover:bg-[#282828] hover:text-[#EDEDED]'
                }`}
              >
                All Listings ({myListings.length})
              </button>
              <button
                onClick={() => setSellerStatusFilter('available')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer ${
                  sellerStatusFilter === 'available'
                    ? 'bg-[#3ECF8E] text-[#121212] font-bold shadow-xs'
                    : 'text-[#3ECF8E] bg-[#3ECF8E]/10 hover:bg-[#3ECF8E]/20 border border-[#3ECF8E]/25'
                }`}
              >
                <span>🟢 Active ({availableListings.length})</span>
              </button>
              <button
                onClick={() => setSellerStatusFilter('reserved')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer ${
                  sellerStatusFilter === 'reserved'
                    ? 'bg-amber-500 text-[#121212] font-bold shadow-xs'
                    : 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                }`}
              >
                <span>🟡 Reserved ({reservedListings.length})</span>
              </button>
              <button
                onClick={() => setSellerStatusFilter('sold')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer ${
                  sellerStatusFilter === 'sold'
                    ? 'bg-blue-500 text-white font-bold shadow-xs'
                    : 'text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30'
                }`}
              >
                <span>🔵 Sold & Taken ({soldListings.length})</span>
              </button>
            </div>

            <button
              onClick={() => setShowListModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-bold text-xs flex items-center gap-1.5 transition self-end sm:self-auto cursor-pointer shadow-sm shadow-[#3ECF8E]/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Listing</span>
            </button>
          </div>

          {/* Listings Feed */}
          {filteredSellerListings.length === 0 ? (
            <div className="bg-[#1c1c1c] p-12 rounded-3xl border border-[#2e2e2e] text-center space-y-3">
              <Package className="w-12 h-12 text-zinc-600 mx-auto" />
              <h4 className="text-base font-bold text-[#EDEDED]">No items in this category</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                {sellerStatusFilter === 'available' && "You don't have any unsold items live on the marketplace right now."}
                {sellerStatusFilter === 'reserved' && "No buyers have currently reserved your items."}
                {sellerStatusFilter === 'sold' && "No completed sales or handoffs recorded yet."}
                {sellerStatusFilter === 'all' && "You haven't listed any electronics or components yet."}
              </p>
              <button
                onClick={() => setShowListModal(true)}
                className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs transition cursor-pointer shadow-sm shadow-[#3ECF8E]/20"
              >
                + List an Item Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSellerListings.map(item => {
                let subParts = []
                try {
                  subParts = typeof item.sub_components === 'string' ? JSON.parse(item.sub_components) : (item.sub_components || [])
                } catch {
                  subParts = []
                }

                return (
                  <div
                    key={item.id}
                    className={`bg-[#1c1c1c] rounded-3xl border shadow-sm p-6 transition space-y-4 ${
                      item.status === 'reserved' ? 'border-amber-500/50 ring-1 ring-amber-500/20' :
                      item.status === 'handoff_completed' ? 'border-blue-500/30 bg-[#161616]' :
                      'border-[#2e2e2e] hover:border-[#3ECF8E]/40'
                    }`}
                  >
                    {/* Header: Title, Category, Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2e2e2e] pb-3">
                      <div className="flex items-start gap-3.5">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-14 h-14 rounded-2xl object-cover border border-[#2e2e2e] shrink-0"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#242424] text-zinc-300 border border-[#2e2e2e] font-mono">
                              {item.category}
                            </span>
                            <span className="text-[10px] font-semibold text-zinc-500">
                              Dept: {item.department.split(' ')[0]}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-[#EDEDED]">{item.title}</h3>
                          <p className="text-xs text-zinc-400">{item.description}</p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                        {item.status === 'available' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3ECF8E]/10 text-[#3ECF8E] text-xs font-bold border border-[#3ECF8E]/25">
                            <span className="w-2 h-2 rounded-full bg-[#3ECF8E] animate-pulse" />
                            <span>Active in Marketplace (Unsold)</span>
                          </span>
                        )}
                        {item.status === 'reserved' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/30">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Reserved (Meetup Scheduled)</span>
                          </span>
                        )}
                        {item.status === 'handoff_completed' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold border border-blue-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                            <span>Sold & Taken (Lifespan Extended)</span>
                          </span>
                        )}
                        <span className="text-xs font-bold text-zinc-300">
                          {item.price_type === 'free' ? '🎁 Free Surplus' : `₹${item.price}`}
                        </span>
                      </div>
                    </div>

                    {/* Visual 4-Stage Lifecycle Stepper */}
                    <div className="py-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 relative">
                        {/* Step 1: Listed */}
                        <div className="flex items-center gap-1.5 text-[#3ECF8E]">
                          <CheckCircle2 className="w-4 h-4 text-[#3ECF8E] flex-shrink-0" />
                          <span>1. Listed on Campus</span>
                        </div>
                        <div className={`h-0.5 flex-1 mx-3 ${item.status !== 'available' ? 'bg-[#3ECF8E]' : 'bg-[#2a2a2a]'}`} />

                        {/* Step 2: Buyer Claimed */}
                        <div className={`flex items-center gap-1.5 ${item.status !== 'available' ? 'text-[#3ECF8E]' : 'text-zinc-600'}`}>
                          {item.status !== 'available' ? (
                            <CheckCircle2 className="w-4 h-4 text-[#3ECF8E] flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-zinc-700 flex items-center justify-center text-[9px] text-zinc-600">2</div>
                          )}
                          <span>2. Buyer Claimed</span>
                        </div>
                        <div className={`h-0.5 flex-1 mx-3 ${item.status === 'handoff_completed' ? 'bg-[#3ECF8E]' : item.status === 'reserved' ? 'bg-amber-400 animate-pulse' : 'bg-[#2a2a2a]'}`} />

                        {/* Step 3: Meetup & Verification */}
                        <div className={`flex items-center gap-1.5 ${item.status === 'reserved' ? 'text-amber-300 font-bold' : item.status === 'handoff_completed' ? 'text-[#3ECF8E]' : 'text-zinc-600'}`}>
                          {item.status === 'handoff_completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-[#3ECF8E] flex-shrink-0" />
                          ) : item.status === 'reserved' ? (
                            <Clock className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-zinc-700 flex items-center justify-center text-[9px] text-zinc-600">3</div>
                          )}
                          <span>3. PIN Verification</span>
                        </div>
                        <div className={`h-0.5 flex-1 mx-3 ${item.status === 'handoff_completed' ? 'bg-[#3ECF8E]' : 'bg-[#2a2a2a]'}`} />

                        {/* Step 4: Sold / Taken */}
                        <div className={`flex items-center gap-1.5 ${item.status === 'handoff_completed' ? 'text-blue-300 font-bold' : 'text-zinc-600'}`}>
                          {item.status === 'handoff_completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-zinc-700 flex items-center justify-center text-[9px] text-zinc-600">4</div>
                          )}
                          <span>4. Sold & Diverted</span>
                        </div>
                      </div>
                    </div>

                    {/* LOCATION TRACKER & HANDOFF DETAILS */}
                    <div className="rounded-2xl p-4 bg-[#141414] border border-[#2e2e2e] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <span>Item Location Status:</span>
                        </span>
                        <span className="font-bold text-[#3ECF8E]">+{item.carbon_saved_kg || 6.5} kg CO₂e Offset</span>
                      </div>

                      {item.status === 'available' && (
                        <p className="text-zinc-400">
                          📍 <strong className="text-zinc-200">In your custody (Campus/Hostel)</strong> — Currently visible to all NSSCE students. No buyer has claimed it yet.
                        </p>
                      )}

                      {item.status === 'reserved' && (
                        <div className="space-y-1">
                          <p className="text-zinc-300">
                            📍 <strong className="text-zinc-200">Scheduled Meetup:</strong> <span className="font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">{item.meeting_point}</span>
                          </p>
                          <p className="text-zinc-400">
                            Claimed by Buyer: <strong className="text-zinc-200">{item.buyer_name}</strong> {item.claimed_component && item.claimed_component !== 'All' ? `(Part: ${item.claimed_component})` : '(Complete Device)'}
                          </p>
                        </div>
                      )}

                      {item.status === 'handoff_completed' && (
                        <p className="text-blue-300 font-medium">
                          📍 <strong className="text-zinc-200">Handed off & In Use:</strong> Transferred to <strong className="text-zinc-200">{item.buyer_name}</strong> for academic project. Zero landfill waste generated.
                        </p>
                      )}
                    </div>

                    {/* Sub-components list if any */}
                    {subParts.length > 0 && (
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-zinc-500 text-[11px]">Harvestable Components:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {subParts.map((sp, idx) => (
                            <span 
                              key={idx}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                                item.status === 'handoff_completed' 
                                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' 
                                  : 'bg-[#242424] text-zinc-300 border-[#2e2e2e]'
                              }`}
                            >
                              {sp.name || sp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* INLINE PIN VERIFICATION BOX (FOR RESERVED ITEMS ONLY) */}
                    {item.status === 'reserved' && (
                      <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 text-xs">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-amber-400" />
                          <h4 className="font-bold text-amber-300">Confirm In-Person Physical Handoff</h4>
                        </div>
                        <p className="text-zinc-300 leading-relaxed">
                          When you meet <strong className="text-[#EDEDED]">{item.buyer_name}</strong> at <em className="text-amber-300">"{item.meeting_point}"</em>, ask them for the <strong className="text-[#EDEDED]">4-digit code</strong> generated on their phone. Enter it below to mark the item as sold:
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            maxLength="4"
                            value={pinInputs[item.id] || ''}
                            onChange={(e) => setPinInputs({ ...pinInputs, [item.id]: e.target.value })}
                            className="w-32 px-3 py-2 text-center font-mono font-bold tracking-widest text-base rounded-xl border border-amber-500/40 bg-[#141414] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:outline-none"
                          />
                          <button
                            onClick={() => handleVerifyPin(item.id)}
                            disabled={verifyingId === item.id || !pinInputs[item.id]}
                            className="px-5 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>{verifyingId === item.id ? 'Verifying PIN...' : 'Verify Code & Mark as Sold'}</span>
                          </button>
                        </div>

                        {verifyMsg[item.id] && (
                          <div className={`p-2.5 rounded-xl text-xs font-semibold ${
                            verifyMsg[item.id].success ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                          }`}>
                            {verifyMsg[item.id].text}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= BUYER VIEW ================= */}
      {activeTab === 'buyer' && (
        <div className="space-y-6">
          {activeClaims.length === 0 && completedClaims.length === 0 ? (
            <div className="bg-[#1c1c1c] p-12 rounded-3xl border border-[#2e2e2e] text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto" />
              <h4 className="text-base font-bold text-[#EDEDED]">No hardware claims yet</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Need spare components for your mini-project? Browse hardware released by lab staff and fellow students.
              </p>
              <button
                onClick={() => onNavigate('marketplace')}
                className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs transition cursor-pointer shadow-sm shadow-[#3ECF8E]/20"
              >
                Browse Circular Marketplace
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Claims with PIN */}
              {activeClaims.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Pending Handoffs (Show This Code to Seller)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeClaims.map(item => (
                      <div key={item.id} className="bg-[#1c1c1c] p-5 rounded-3xl border border-amber-500/30 hover:border-amber-500/50 shadow-md space-y-4 text-xs flex flex-col justify-between transition">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#242424] text-zinc-300 border border-[#2e2e2e] font-mono">
                              {item.department}
                            </span>
                            <span className="text-[10px] font-bold text-[#3ECF8E] bg-[#3ECF8E]/10 border border-[#3ECF8E]/25 px-2 py-0.5 rounded font-mono">
                              {item.price_type === 'free' ? 'FREE GIFT' : `₹${item.price}`}
                            </span>
                          </div>

                          <div className="flex items-start gap-3">
                            {item.image_url ? (
                              <img 
                                src={item.image_url} 
                                alt={item.title} 
                                className="w-14 h-14 rounded-2xl object-cover border border-[#2e2e2e] shrink-0" 
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-[#242424] border border-[#2e2e2e] flex items-center justify-center text-[#3ECF8E] shrink-0">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-[#EDEDED] text-base leading-snug">{item.title}</h4>
                              <p className="text-zinc-400 text-xs mt-0.5">
                                Donor / Seller: <strong className="text-zinc-200">{item.seller_name}</strong>
                              </p>
                              {item.claimed_component && item.claimed_component !== 'All' && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#232323] text-amber-300 border border-amber-500/20 text-[10px] font-semibold">
                                  Harvesting: {item.claimed_component}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* PIN & QR Code Box */}
                        <div className="p-4 rounded-2xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] space-y-2.5 text-center">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 font-mono">
                              Your 4-Digit Pickup PIN
                            </span>
                            <button
                              onClick={() => handleCopyPin(item.id, item.handoff_pin || '7492')}
                              className="px-2 py-1 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] text-zinc-300 hover:text-[#3ECF8E] font-mono text-[10px] flex items-center gap-1 cursor-pointer transition border border-[#2e2e2e]"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedPin[item.id] ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>

                          <div className="font-mono text-3xl font-black tracking-widest text-[#3ECF8E] drop-shadow-sm select-all">
                            {item.handoff_pin || '7492'}
                          </div>

                          <div className="p-2 rounded-xl bg-[#1c1c1c] border border-[#282828] text-[11px] text-zinc-300 flex items-center justify-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span>Meeting Spot: <strong className="text-amber-300">{item.meeting_point || 'Campus Meeting Spot'}</strong></span>
                          </div>

                          <p className="text-[10px] text-zinc-500">
                            Show this secret code to the seller when you meet in person to confirm receipt.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Claims */}
              {completedClaims.length > 0 && (
                <div className="bg-[#1c1c1c] p-6 rounded-3xl border border-[#2e2e2e] shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3ECF8E]" />
                    <h3 className="text-sm font-bold text-[#EDEDED]">Collected Hardware (In Use)</h3>
                  </div>
                  <div className="divide-y divide-[#2a2a2a] text-xs">
                    {completedClaims.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between">
                        <div>
                          <strong className="text-[#EDEDED]">{item.title}</strong>
                          <span className="block text-[11px] text-zinc-500">
                            Obtained from: {item.seller_name} • {item.department}
                          </span>
                        </div>
                        <span className="font-bold text-[#3ECF8E] bg-[#3ECF8E]/10 border border-[#3ECF8E]/25 px-2.5 py-1 rounded-lg font-mono">
                          +{item.carbon_saved_kg || 8.5} kg CO₂e Saved
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* QUICK SHORTCUT CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#EDEDED]">Student Circular Tools</h3>
          <span className="text-xs text-zinc-500">Fast access to active modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            onClick={() => onNavigate('marketplace')}
            className="group bg-[#1c1c1c] p-5 rounded-2xl border border-[#2e2e2e] hover:border-[#3ECF8E]/50 hover:shadow-[0_0_15px_rgba(62,207,142,0.15)] transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#242424] text-[#3ECF8E] border border-[#2e2e2e] flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#EDEDED] group-hover:text-[#3ECF8E] transition">Circular Marketplace</h4>
              <p className="text-xs text-zinc-400 mt-1">Browse and claim spare RAM, motors, cables, and tools across CSE, Mech, Civil, EEE, IC.</p>
            </div>
            <span className="text-xs font-semibold text-[#3ECF8E] mt-3 flex items-center gap-1">
              Browse Items <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('ai_scanner')}
            className="group bg-[#1c1c1c] p-5 rounded-2xl border border-[#2e2e2e] hover:border-[#3ECF8E]/50 hover:shadow-[0_0_15px_rgba(62,207,142,0.15)] transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#242424] text-[#3ECF8E] border border-[#2e2e2e] flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#EDEDED] group-hover:text-[#3ECF8E] transition">AI E-Waste Scanner</h4>
              <p className="text-xs text-zinc-400 mt-1">Snap a photo. Automated AI vision detects salvageable components and 1-click lists it for reuse.</p>
            </div>
            <span className="text-xs font-semibold text-[#3ECF8E] mt-3 flex items-center gap-1">
              Scan with AI <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('repair')}
            className="group bg-[#1c1c1c] p-5 rounded-2xl border border-[#2e2e2e] hover:border-[#3ECF8E]/50 hover:shadow-[0_0_15px_rgba(62,207,142,0.15)] transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#242424] text-[#3ECF8E] border border-[#2e2e2e] flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-sm">
                <Wrench className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#EDEDED] group-hover:text-[#3ECF8E] transition">Repair Before Replace</h4>
              <p className="text-xs text-zinc-400 mt-1">Get intelligent diagnostic checklists to fix faulty electronics before giving up on them.</p>
            </div>
            <span className="text-xs font-semibold text-[#3ECF8E] mt-3 flex items-center gap-1">
              Troubleshoot Fault <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* QUICK LIST ITEM MODAL */}
      {showListModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1c1c1c] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-[#2e2e2e] text-[#EDEDED]">
            <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#EDEDED]">List Electronics for Sale or Free Reuse</h3>
                  <p className="text-xs text-zinc-400">Items will be visible to students across all 5 NSSCE branches</p>
                </div>
              </div>
              <button 
                onClick={() => setShowListModal(false)}
                className="text-zinc-400 hover:text-[#EDEDED] text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Item Title *</label>
                <input
                  type="text"
                  required
                  value={newItemForm.title}
                  onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Department</label>
                  <select
                    value={newItemForm.department}
                    onChange={(e) => setNewItemForm({ ...newItemForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none cursor-pointer"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Category</label>
                  <select
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none cursor-pointer"
                  >
                    <option value="Microcontrollers & Embedded">Microcontrollers & Embedded</option>
                    <option value="PC Towers & Hardware">PC Towers & Hardware</option>
                    <option value="Motors & Actuators">Motors & Actuators (Mech)</option>
                    <option value="Power & Transformers">Power & Transformers (EEE)</option>
                    <option value="Sensors & Transducers">Sensors & Transducers (IC)</option>
                    <option value="Calculators & Drafting">Calculators & Drafting (Civil)</option>
                    <option value="Peripherals">Peripherals & Cables</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Condition</label>
                  <select
                    value={newItemForm.condition}
                    onChange={(e) => setNewItemForm({ ...newItemForm, condition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none cursor-pointer"
                  >
                    <option value="Like New">Like New</option>
                    <option value="Functional/Tested">Functional / Tested</option>
                    <option value="Needs Minor Repair">Needs Minor Repair</option>
                    <option value="Scrap for Parts Harvesting">Scrap for Parts Harvesting</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Pricing Option</label>
                  <div className="flex gap-2">
                    <select
                      value={newItemForm.price_type}
                      onChange={(e) => setNewItemForm({ ...newItemForm, price_type: e.target.value })}
                      className="w-1/2 px-3 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none cursor-pointer"
                    >
                      <option value="free">Free Gift 🎁</option>
                      <option value="priced">Student Price (₹)</option>
                    </select>
                    {newItemForm.price_type === 'priced' && (
                      <input
                        type="number"
                        min="1"
                        value={newItemForm.price}
                        onChange={(e) => setNewItemForm({ ...newItemForm, price: e.target.value })}
                        className="w-1/2 px-3 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none font-bold"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Splittable Components (Comma separated)</label>
                <input
                  type="text"
                  value={newItemForm.sub_component_input}
                  onChange={(e) => setNewItemForm({ ...newItemForm, sub_component_input: e.target.value })}
                  placeholder="e.g. 8GB RAM Stick, 500W Power Supply, CPU Fan"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] placeholder-zinc-500 focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none"
                />
                <span className="text-[10px] text-zinc-500">Allows other students to harvest specific parts if they don't need the whole device.</span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Description & Working Notes</label>
                <textarea
                  rows={2}
                  value={newItemForm.description}
                  onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                  placeholder="Describe functionality, port conditions, or accessories included"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#2e2e2e] bg-[#141414] text-[#EDEDED] placeholder-zinc-500 focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] focus:outline-none"
                />
              </div>

              {/* Add Item Image */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300 block">Item Photo (Optional)</label>
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
                        <p className="text-[10px] text-[#3ECF8E] font-semibold">Ready to display on ad</p>
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
                    <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-[#2e2e2e] hover:border-[#3ECF8E]/50 bg-[#141414] hover:bg-[#1a1a1a] text-zinc-400 hover:text-[#3ECF8E] cursor-pointer transition text-xs font-semibold">
                      <Camera className="w-4 h-4 text-[#3ECF8E] shrink-0" />
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

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowListModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#2e2e2e] text-zinc-400 hover:text-[#EDEDED] hover:bg-[#242424] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingItem}
                  className="px-5 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-bold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#3ECF8E]/20"
                >
                  {submittingItem ? 'Listing Item...' : 'Publish to Marketplace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
