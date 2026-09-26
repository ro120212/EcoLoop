import React, { useState, useEffect } from 'react'
import { 
  User, 
  Leaf, 
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
  X
} from 'lucide-react'
import { api } from '../services/api'

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical and Electronics Engineering',
  'Instrumentation and Control Engineering'
]

export default function StudentDashboard({ user, onNavigate }) {
  const [portfolio, setPortfolio] = useState({ my_listings: [], my_claims: [], total_co2_saved_kg: 0, items_diverted_count: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('seller') // 'seller' | 'buyer'
  const [sellerStatusFilter, setSellerStatusFilter] = useState('all') // 'all', 'available', 'reserved', 'sold'
  
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

  const studentId = user?.id || (user?.email ? user.email : 'student')
  const studentName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Student')
  const studentDept = user?.user_metadata?.department || 'Engineering Department'

  const loadPortfolio = async () => {
    try {
      setLoading(true)
      const data = await api.getUserPortfolio(studentId)
      setPortfolio(data)
    } catch (e) {
      console.error('Failed to load portfolio:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPortfolio()
  }, [])

  const handleVerifyPin = async (itemId) => {
    const pin = pinInputs[itemId]
    if (!pin) return
    try {
      setVerifyingId(itemId)
      const res = await api.verifyHandoffPin(itemId, pin)
      setVerifyMsg({ ...verifyMsg, [itemId]: { success: true, text: res.message || 'Handoff verified successfully! Status updated to Sold.' } })
      await loadPortfolio()
    } catch (err) {
      setVerifyMsg({ ...verifyMsg, [itemId]: { success: false, text: err.message } })
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
      await loadPortfolio()
      setActiveTab('seller')
      setSellerStatusFilter('available')
    } catch (err) {
      alert('Error creating listing: ' + err.message)
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
      {/* Student Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1c1c1c] text-[#EDEDED] p-6 sm:p-8 shadow-xl border border-[#2e2e2e]">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Quick Score Card */}
            <div className="bg-[#141414] border border-[#2e2e2e] p-4 rounded-2xl flex items-center gap-4 text-xs shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/25 text-[#3ECF8E] flex items-center justify-center flex-shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Personal Carbon Mitigated</span>
                <p className="text-lg font-bold text-[#3ECF8E] font-mono">{portfolio.total_co2_saved_kg || 28.5} kg CO₂e</p>
                <span className="text-[10px] text-zinc-400 font-mono">NSSCE Campus Diverted</span>
              </div>
            </div>

            {/* List Item CTA Button */}
            <button
              onClick={() => setShowListModal(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs shadow-lg shadow-[#3ECF8E]/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ List Electronics for Sale / Free</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1c1c1c] p-4 rounded-2xl border border-[#2e2e2e] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#232323] border border-[#2e2e2e] text-[#3ECF8E] flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Total Listed</span>
            <p className="text-xl font-bold text-[#EDEDED]">{myListings.length} Items</p>
            <span className="text-[10px] text-zinc-400">{availableListings.length} currently active</span>
          </div>
        </div>

        <div className="bg-[#1c1c1c] p-4 rounded-2xl border border-[#2e2e2e] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#232323] border border-[#2e2e2e] text-amber-400 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Pending Meetups</span>
            <p className="text-xl font-bold text-amber-400">{reservedListings.length} Reserved</p>
            <span className="text-[10px] text-amber-300 font-medium">Awaiting PIN handoff</span>
          </div>
        </div>

        <div className="bg-[#1c1c1c] p-4 rounded-2xl border border-[#2e2e2e] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#232323] border border-[#2e2e2e] text-[#3ECF8E] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Sold / Handed Off</span>
            <p className="text-xl font-bold text-[#3ECF8E]">{soldListings.length} Taken</p>
            <span className="text-[10px] text-[#3ECF8E] font-medium">Transferred to peers</span>
          </div>
        </div>

        <div className="bg-[#1c1c1c] p-4 rounded-2xl border border-[#2e2e2e] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#232323] border border-[#2e2e2e] text-zinc-300 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Claimed by Me</span>
            <p className="text-xl font-bold text-zinc-200">{myClaims.length} Items</p>
            <span className="text-[10px] text-zinc-400 font-medium">{activeClaims.length} ready for pickup</span>
          </div>
        </div>
      </div>

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
          </button>
        </div>
      </div>

      {/* ================= SELLER VIEW ================= */}
      {activeTab === 'seller' && (
        <div className="space-y-6">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
              <span className="text-slate-400 mr-2 text-[11px] font-bold uppercase tracking-wider">Status:</span>
              <button
                onClick={() => setSellerStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  sellerStatusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Listings ({myListings.length})
              </button>
              <button
                onClick={() => setSellerStatusFilter('available')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  sellerStatusFilter === 'available'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                <span>🟢 Active in Marketplace ({availableListings.length})</span>
              </button>
              <button
                onClick={() => setSellerStatusFilter('reserved')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  sellerStatusFilter === 'reserved'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <span>🟡 Reserved / Meetup Scheduled ({reservedListings.length})</span>
              </button>
              <button
                onClick={() => setSellerStatusFilter('sold')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  sellerStatusFilter === 'sold'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <span>🔵 Sold & Taken ({soldListings.length})</span>
              </button>
            </div>

            <button
              onClick={() => setShowListModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition self-end sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Listing</span>
            </button>
          </div>

          {/* Listings Feed */}
          {filteredSellerListings.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">No items in this category</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {sellerStatusFilter === 'available' && "You don't have any unsold items live on the marketplace right now."}
                {sellerStatusFilter === 'reserved' && "No buyers have currently reserved your items."}
                {sellerStatusFilter === 'sold' && "No completed sales or handoffs recorded yet."}
                {sellerStatusFilter === 'all' && "You haven't listed any electronics or components yet."}
              </p>
              <button
                onClick={() => setShowListModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
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
                    className={`bg-white rounded-3xl border shadow-sm p-6 transition space-y-4 ${
                      item.status === 'reserved' ? 'border-amber-300 ring-2 ring-amber-100' :
                      item.status === 'handoff_completed' ? 'border-blue-200 bg-slate-50/40' :
                      'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header: Title, Category, Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-start gap-3.5">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {item.category}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              Dept: {item.department.split(' ')[0]}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                          <p className="text-xs text-slate-500">{item.description}</p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                        {item.status === 'available' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active in Marketplace (Unsold)</span>
                          </span>
                        )}
                        {item.status === 'reserved' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Reserved (Meetup Scheduled)</span>
                          </span>
                        )}
                        {item.status === 'handoff_completed' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Sold & Taken (Lifespan Extended)</span>
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-700">
                          {item.price_type === 'free' ? '🎁 Free Surplus' : `₹${item.price}`}
                        </span>
                      </div>
                    </div>

                    {/* Visual 4-Stage Lifecycle Stepper */}
                    <div className="py-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 relative">
                        {/* Step 1: Listed */}
                        <div className="flex items-center gap-1.5 text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>1. Listed on Campus</span>
                        </div>
                        <div className={`h-0.5 flex-1 mx-3 ${item.status !== 'available' ? 'bg-emerald-500' : 'bg-slate-200'}`} />

                        {/* Step 2: Buyer Claimed */}
                        <div className={`flex items-center gap-1.5 ${item.status !== 'available' ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {item.status !== 'available' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center text-[9px] text-slate-400">2</div>
                          )}
                          <span>2. Buyer Claimed</span>
                        </div>
                        <div className={`h-0.5 flex-1 mx-3 ${item.status === 'handoff_completed' ? 'bg-emerald-500' : item.status === 'reserved' ? 'bg-amber-400 animate-pulse' : 'bg-slate-200'}`} />

                        {/* Step 3: Meetup & Verification */}
                        <div className={`flex items-center gap-1.5 ${item.status === 'reserved' ? 'text-amber-800 font-bold' : item.status === 'handoff_completed' ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {item.status === 'handoff_completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : item.status === 'reserved' ? (
                            <Clock className="w-4 h-4 text-amber-600 animate-spin flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center text-[9px] text-slate-400">3</div>
                          )}
                          <span>3. PIN Verification</span>
                        </div>
                        <div className={`h-0.5 flex-1 mx-3 ${item.status === 'handoff_completed' ? 'bg-emerald-500' : 'bg-slate-200'}`} />

                        {/* Step 4: Sold / Taken */}
                        <div className={`flex items-center gap-1.5 ${item.status === 'handoff_completed' ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
                          {item.status === 'handoff_completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center text-[9px] text-slate-400">4</div>
                          )}
                          <span>4. Sold & Diverted</span>
                        </div>
                      </div>
                    </div>

                    {/* LOCATION TRACKER & HANDOFF DETAILS */}
                    <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>Item Location Status:</span>
                        </span>
                        <span className="font-bold text-emerald-700">+{item.carbon_saved_kg || 6.5} kg CO₂e Offset</span>
                      </div>

                      {item.status === 'available' && (
                        <p className="text-slate-700">
                          📍 <strong>In your custody (Campus/Hostel)</strong> — Currently visible to all NSSCE students. No buyer has claimed it yet.
                        </p>
                      )}

                      {item.status === 'reserved' && (
                        <div className="space-y-1">
                          <p className="text-slate-800">
                            📍 <strong>Scheduled Meetup:</strong> <span className="font-bold text-slate-900 bg-amber-100 px-2 py-0.5 rounded">{item.meeting_point}</span>
                          </p>
                          <p className="text-slate-600">
                            Claimed by Buyer: <strong>{item.buyer_name}</strong> {item.claimed_component && item.claimed_component !== 'All' ? `(Part: ${item.claimed_component})` : '(Complete Device)'}
                          </p>
                        </div>
                      )}

                      {item.status === 'handoff_completed' && (
                        <p className="text-blue-900 font-medium">
                          📍 <strong>Handed off & In Use:</strong> Transferred to <strong>{item.buyer_name}</strong> for academic project. Zero landfill waste generated.
                        </p>
                      )}
                    </div>

                    {/* Sub-components list if any */}
                    {subParts.length > 0 && (
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-slate-600 text-[11px]">Harvestable Components:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {subParts.map((sp, idx) => (
                            <span 
                              key={idx}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                                item.status === 'handoff_completed' 
                                  ? 'bg-blue-50 text-blue-800 border-blue-200' 
                                  : 'bg-white text-slate-700 border-slate-200'
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
                      <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3 text-xs">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-amber-700" />
                          <h4 className="font-bold text-amber-950">Confirm In-Person Physical Handoff</h4>
                        </div>
                        <p className="text-amber-900 leading-relaxed">
                          When you meet <strong>{item.buyer_name}</strong> at <em>"{item.meeting_point}"</em>, ask them for the <strong>4-digit code</strong> generated on their phone. Enter it below to mark the item as sold:
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            maxLength="4"
                            value={pinInputs[item.id] || ''}
                            onChange={(e) => setPinInputs({ ...pinInputs, [item.id]: e.target.value })}
                            className="w-32 px-3 py-2 text-center font-mono font-bold tracking-widest text-base rounded-xl border border-amber-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                          <button
                            onClick={() => handleVerifyPin(item.id)}
                            disabled={verifyingId === item.id || !pinInputs[item.id]}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>{verifyingId === item.id ? 'Verifying PIN...' : 'Verify Code & Mark as Sold'}</span>
                          </button>
                        </div>

                        {verifyMsg[item.id] && (
                          <div className={`p-2.5 rounded-xl text-xs font-semibold ${
                            verifyMsg[item.id].success ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
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
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">No hardware claims yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Need spare components for your mini-project? Browse hardware released by lab staff and fellow students.
              </p>
              <button
                onClick={() => onNavigate('marketplace')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
              >
                Browse Circular Marketplace
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Claims with PIN */}
              {activeClaims.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Pending Handoffs (Show This Code to Seller)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeClaims.map(item => (
                      <div key={item.id} className="bg-white p-5 rounded-3xl border border-blue-200 shadow-sm space-y-3 text-xs flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                              {item.department}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {item.price_type === 'free' ? 'FREE GIFT' : `₹${item.price}`}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                          <p className="text-slate-600 text-xs">
                            Seller: <strong>{item.seller_name}</strong>
                          </p>
                        </div>

                        {/* PIN & QR Code Box */}
                        <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-950 text-white space-y-2 text-center">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300">
                            Your Secret 4-Digit Pickup PIN
                          </span>
                          <div className="font-mono text-3xl font-black tracking-widest text-emerald-400">
                            {item.handoff_pin || '7492'}
                          </div>
                          <div className="pt-1 text-[11px] text-slate-300 flex items-center justify-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span>Meeting Spot: <strong>{item.meeting_point}</strong></span>
                          </div>
                          <p className="text-[10px] text-slate-400 pt-1">
                            Show this code to the seller when you meet in person.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Claims */}
              {completedClaims.length > 0 && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Collected Hardware (In Use)</h3>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {completedClaims.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between">
                        <div>
                          <strong className="text-slate-800">{item.title}</strong>
                          <span className="block text-[11px] text-slate-400">
                            Obtained from: {item.seller_name} • {item.department}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
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
          <h3 className="text-sm font-bold text-slate-900">Student Circular Tools</h3>
          <span className="text-xs text-slate-500">Fast access to active modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            onClick={() => onNavigate('marketplace')}
            className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">Circular Marketplace</h4>
              <p className="text-xs text-slate-500 mt-1">Browse and claim spare RAM, motors, cables, and tools across CSE, Mech, Civil, EEE, IC.</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 mt-3 flex items-center gap-1">
              Browse Items <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('ai_scanner')}
            className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition">AI E-Waste Scanner</h4>
              <p className="text-xs text-slate-500 mt-1">Snap a photo. Automated AI vision detects salvageable components and 1-click lists it for reuse.</p>
            </div>
            <span className="text-xs font-semibold text-purple-600 mt-3 flex items-center gap-1">
              Scan with AI <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('repair')}
            className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Wrench className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-700 transition">Repair Before Replace</h4>
              <p className="text-xs text-slate-500 mt-1">Get intelligent diagnostic checklists to fix faulty electronics before giving up on them.</p>
            </div>
            <span className="text-xs font-semibold text-orange-600 mt-3 flex items-center gap-1">
              Troubleshoot Fault <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* QUICK LIST ITEM MODAL */}
      {showListModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">List Electronics for Sale or Free Reuse</h3>
                  <p className="text-xs text-slate-500">Items will be visible to students across all 5 NSSCE branches</p>
                </div>
              </div>
              <button 
                onClick={() => setShowListModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Item Title *</label>
                <input
                  type="text"
                  required
                  value={newItemForm.title}
                  onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Department</label>
                  <select
                    value={newItemForm.department}
                    onChange={(e) => setNewItemForm({ ...newItemForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  <label className="font-bold text-slate-700">Condition</label>
                  <select
                    value={newItemForm.condition}
                    onChange={(e) => setNewItemForm({ ...newItemForm, condition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Like New">Like New</option>
                    <option value="Functional/Tested">Functional / Tested</option>
                    <option value="Needs Minor Repair">Needs Minor Repair</option>
                    <option value="Scrap for Parts Harvesting">Scrap for Parts Harvesting</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pricing Option</label>
                  <div className="flex gap-2">
                    <select
                      value={newItemForm.price_type}
                      onChange={(e) => setNewItemForm({ ...newItemForm, price_type: e.target.value })}
                      className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                        className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Splittable Components (Comma separated)</label>
                <input
                  type="text"
                  value={newItemForm.sub_component_input}
                  onChange={(e) => setNewItemForm({ ...newItemForm, sub_component_input: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Allows other students to harvest specific parts if they don't need the whole device.</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description & Working Notes</label>
                <textarea
                  rows={2}
                  value={newItemForm.description}
                  onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Add Item Image */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Item Photo (Optional)</label>
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

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowListModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingItem}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition disabled:opacity-50 flex items-center gap-1.5"
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
