import React, { useState } from 'react'
import { 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw,
  ShoppingBag,
  Wrench,
  Package,
  AlertTriangle
} from 'lucide-react'
import { api } from '../services/api'

const DEPARTMENT_LABS = {
  'Computer Science and Engineering': ['Hardware & Systems Lab', 'IoT & Embedded Lab', 'Networking Lab'],
  'Mechanical Engineering': ['Central Workshop', 'Fab Lab & Mechatronics', 'CAD/CAM Lab'],
  'Civil Engineering': ['Surveying Lab', 'Geotechnical Testing Lab', 'Strength of Materials Lab'],
  'Electrical and Electronics Engineering': ['Power Electronics Lab', 'Electrical Machines Lab', 'Circuits & Measurements Lab'],
  'Instrumentation and Control Engineering': ['Sensors & Transducers Lab', 'Process Control Lab', 'Industrial Instrumentation Lab']
}

export default function AIWasteClassifier({ user, onNavigateModule }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Approval Modals State
  const [showListingModal, setShowListingModal] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [submittingAction, setSubmittingAction] = useState(false)
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null) // { title, message, actionText, actionView }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setResult(null)
    setError('')
    setActionSuccessMsg(null)
  }

  const handleClassify = async () => {
    if (!selectedFile) return
    try {
      setLoading(true)
      setError('')
      setActionSuccessMsg(null)
      const data = await api.classifyWaste(selectedFile)
      setResult(data)
    } catch (err) {
      setError('Classification failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Image compression helper
  const compressImage = (file) => {
    return new Promise((resolve) => {
      if (!file) return resolve('')
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 600
          const MAX_HEIGHT = 600
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
          resolve(canvas.toDataURL('image/jpeg', 0.8))
        }
        img.onerror = () => resolve(e.target.result)
        img.src = e.target.result
      }
      reader.onerror = () => resolve('')
      reader.readAsDataURL(file)
    })
  }

  // 1-Click Approve & Post to Marketplace
  const handleApproveListing = async () => {
    if (!result) return
    try {
      setSubmittingAction(true)
      const base64Image = await compressImage(selectedFile)
      const studentDept = user?.user_metadata?.department || 'Computer Science and Engineering'
      const studentId = user?.id || (user?.email ? user.email : 'student')
      const studentName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Student')

      await api.createMarketItem({
        title: result.item_name || 'Classified Electronics',
        description: `${result.campus_disposal_advice || ''} | Materials detected: ${result.materials_detected?.join(', ') || 'Salvageable circuitry'}`,
        department: studentDept,
        category: result.category || 'Peripherals',
        condition: 'Functional/Tested',
        price_type: 'free',
        price: 0,
        sub_components: JSON.stringify(result.materials_detected || []),
        carbon_saved_kg: parseFloat(result.carbon_savings_if_diverted_kg) || 8.5,
        image_url: base64Image || previewUrl,
        seller_id: studentId,
        seller_name: studentName
      })

      setShowListingModal(false)
      setActionSuccessMsg({
        title: 'Listing Approved & Published! 🎁',
        message: `"${result.item_name}" is now live on the Circular Marketplace for fellow NSSCE students to claim for their projects.`,
        actionText: 'View in Circular Marketplace',
        actionView: 'marketplace'
      })
    } catch (err) {
      alert('Failed to post item: ' + err.message)
    } finally {
      setSubmittingAction(false)
    }
  }

  // 1-Click Approve & Submit Repair Ticket
  const handleApproveRepairTicket = async () => {
    if (!result) return
    try {
      setSubmittingAction(true)
      const studentDept = user?.user_metadata?.department || 'Computer Science and Engineering'
      const labs = DEPARTMENT_LABS[studentDept] || ['Hardware & Systems Lab']
      const studentId = user?.id || (user?.email ? user.email : 'student')
      const studentName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Student')

      await api.createRepairTicket({
        user_id: studentId,
        user_name: studentName,
        device_name: result.item_name || 'Hardware Device',
        symptom: result.hazard_reason || 'Requires lab troubleshooting and component inspection.',
        department: studentDept,
        lab_name: labs[0],
        technician_name: `${studentDept.split(' ')[0]} Faculty / Lab In-Charge`,
        ai_diagnosis: `Hazard: ${result.hazard_level || 'Low'}. Advice: ${result.campus_disposal_advice || ''}`,
        ai_steps: `1. Safety check materials: ${result.materials_detected?.join(', ') || 'N/A'}\n2. Recommended disposal/repair route: ${result.recommended_action || 'Inspect'}`,
        difficulty: result.hazard_level === 'High' ? 'Hard' : 'Medium',
        tools_needed: result.materials_detected?.join(', ') || 'Multimeter, Screwdriver set'
      })

      setShowTicketModal(false)
      setActionSuccessMsg({
        title: 'Repair Ticket Approved & Dispatched! 🔧',
        message: `A helpdesk ticket for "${result.item_name}" has been routed to the ${studentDept.split(' ')[0]} ${labs[0]}. You can view its triage status in Repair Before Replace.`,
        actionText: 'Track Ticket in Repair Clinic',
        actionView: 'repair'
      })
    } catch (err) {
      alert('Failed to submit ticket: ' + err.message)
    } finally {
      setSubmittingAction(false)
    }
  }

  const studentDept = user?.user_metadata?.department || 'Computer Science and Engineering'
  const labs = DEPARTMENT_LABS[studentDept] || ['Hardware & Systems Lab']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1c1c1c] p-6 rounded-2xl border border-[#2e2e2e] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-[#EDEDED]">Smart AI Waste &amp; Component Classifier</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 font-mono">
              AI Vision Classifier
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Identify e-waste materials, component specifications, toxicity hazards, and recovery routes instantly with automated AI vision.
          </p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessMsg && (
        <div className="bg-[#141414] border border-[#3ECF8E]/40 p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#EDEDED]">{actionSuccessMsg.title}</h4>
              <p className="text-xs text-zinc-400 mt-0.5">{actionSuccessMsg.message}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateModule(actionSuccessMsg.actionView)}
            className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer shadow-sm shadow-[#3ECF8E]/20"
          >
            <span>{actionSuccessMsg.actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* AI Camera & Vision Scanner */}
        <div className="space-y-4">
          <div className="bg-[#1c1c1c] p-6 rounded-2xl border border-[#2e2e2e] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3ECF8E]" />
              <span>Scan or Upload E-Waste Item</span>
            </h3>

            <div className="border-2 border-dashed border-[#2e2e2e] hover:border-[#3ECF8E]/50 rounded-2xl p-6 text-center transition bg-[#141414]">
              {previewUrl ? (
                <div className="space-y-3">
                  <img 
                    src={previewUrl} 
                    alt="Waste preview" 
                    className="max-h-56 mx-auto rounded-xl object-contain shadow-sm border border-[#2e2e2e]" 
                  />
                  <label className="inline-block cursor-pointer px-3 py-1.5 rounded-xl bg-[#232323] border border-[#2e2e2e] text-xs font-semibold text-zinc-300 hover:bg-[#282828] hover:text-[#EDEDED]">
                    Change Photo
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#232323] text-[#3ECF8E] border border-[#2e2e2e] flex items-center justify-center mx-auto shadow-sm">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#3ECF8E]">Click to upload photo or take picture</span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Supports JPG, PNG, WEBP of cables, batteries, boards, or peripherals</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>

            {selectedFile && (
              <button
                onClick={handleClassify}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs shadow-lg shadow-[#3ECF8E]/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#121212]" />
                    <span>Analyzing image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Classify Waste &amp; Materials</span>
                  </>
                )}
              </button>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                {error}
              </div>
            )}
          </div>

          {/* AI Analysis Result */}
          {result && (
            <div className="bg-[#1c1c1c] p-6 rounded-2xl border border-[#2e2e2e] shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                    Automated Multimodal AI Analysis
                  </span>
                  <h3 className="text-base font-bold text-[#EDEDED] mt-0.5">{result.item_name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {result.cached && (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 font-mono">
                      ⚡ Instant Cache Hit
                    </span>
                  )}
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#232323] text-zinc-300 border border-[#2e2e2e]">
                    {result.category}
                  </span>
                </div>
              </div>

              {/* Hazard Meter */}
              <div className="p-3.5 rounded-xl bg-[#141414] border border-[#2e2e2e] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-300">Toxicity &amp; Handling Hazard:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] font-mono border ${
                    result.hazard_level === 'High' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' :
                    result.hazard_level === 'Medium' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                    'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/30'
                  }`}>
                    {result.hazard_level} Hazard
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px]">{result.hazard_reason}</p>
              </div>

              {/* Materials */}
              <div>
                <span className="font-semibold text-zinc-300 block mb-1.5">Materials Detected:</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.materials_detected?.map((m, i) => (
                    <span key={i} className="font-medium px-2 py-0.5 rounded-md bg-[#232323] text-zinc-300 border border-[#2e2e2e] text-[11px] font-mono">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Advice */}
              <div className="p-3.5 rounded-xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/25 text-[#EDEDED] space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="font-semibold flex items-center gap-1.5 text-[#3ECF8E]">
                    <CheckCircle2 className="w-4 h-4" />
                    Recommended Route: {result.recommended_action}
                  </strong>
                  <span className="font-mono text-xs text-[#3ECF8E]">Est. {result.carbon_savings_if_diverted_kg} kg CO₂</span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  {result.campus_disposal_advice}
                </p>
              </div>

              {/* Action Buttons: Open Pre-filled Approval Modals */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  onClick={() => setShowListingModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer shadow-sm shadow-[#3ECF8E]/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>List on Circular Marketplace</span>
                </button>
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#232323] border border-[#2e2e2e] hover:bg-[#282828] text-[#EDEDED] font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-[#3ECF8E]" />
                  <span>Diagnose in Repair Clinic</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= PRE-FILLED MARKETPLACE LISTING APPROVAL MODAL ================= */}
      {showListingModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#1c1c1c] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#2e2e2e] space-y-4 text-[#EDEDED]">
            <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#EDEDED]">Approve Marketplace Listing</h2>
                  <p className="text-xs text-zinc-400">All AI-extracted details are pre-filled below</p>
                </div>
              </div>
              <button 
                onClick={() => setShowListingModal(false)} 
                className="text-zinc-400 hover:text-[#EDEDED] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Pre-filled Details Card */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#2e2e2e] space-y-3 text-xs">
              <div className="flex items-start gap-3">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt={result.item_name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#2e2e2e] shrink-0"
                  />
                )}
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#242424] text-[#3ECF8E] border border-[#2e2e2e] font-mono">
                    {result.category}
                  </span>
                  <h4 className="font-bold text-[#EDEDED] text-sm truncate">{result.item_name}</h4>
                  <p className="text-zinc-400 text-[11px]">Dept: {studentDept.split(' ')[0]}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#242424]">
                <div>
                  <span className="text-zinc-500 font-mono text-[10px] block">Condition:</span>
                  <span className="text-zinc-300 font-semibold">Functional / Tested</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-mono text-[10px] block">Price:</span>
                  <span className="text-[#3ECF8E] font-semibold">🎁 Free Campus Gift</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-mono text-[10px] block">Carbon Diverted:</span>
                  <span className="text-[#3ECF8E] font-semibold font-mono">+{result.carbon_savings_if_diverted_kg} kg CO₂</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-mono text-[10px] block">Components:</span>
                  <span className="text-zinc-300 font-semibold">{result.materials_detected?.length || 0} harvestable parts</span>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 font-mono text-[10px] block mb-1">Listing Description:</span>
                <p className="p-2 rounded-xl bg-[#181818] border border-[#2e2e2e] text-zinc-300 text-[11px] leading-relaxed">
                  {result.campus_disposal_advice}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400">
              Only your approval is required. By approving, this item will immediately go live on the Circular Marketplace for student and lab reuse.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowListingModal(false)}
                className="px-4 py-2 rounded-xl border border-[#2e2e2e] text-zinc-400 hover:text-[#EDEDED] hover:bg-[#242424] font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveListing}
                disabled={submittingAction}
                className="px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-bold text-xs shadow-md shadow-[#3ECF8E]/20 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submittingAction ? 'Publishing...' : 'Approve & Post to Marketplace'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRE-FILLED REPAIR TICKET APPROVAL MODAL ================= */}
      {showTicketModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#1c1c1c] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#2e2e2e] space-y-4 text-[#EDEDED]">
            <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#EDEDED]">Approve Repair Helpdesk Ticket</h2>
                  <p className="text-xs text-zinc-400">Pre-filled diagnosis ready to route to department lab</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTicketModal(false)} 
                className="text-zinc-400 hover:text-[#EDEDED] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Pre-filled Ticket Card */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#2e2e2e] space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-[#242424] pb-2">
                <span className="text-zinc-400 font-mono text-[11px]">Device:</span>
                <span className="font-bold text-[#EDEDED] text-sm">{result.item_name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#242424] pb-2">
                <span className="text-zinc-400 font-mono text-[11px]">Lab Destination:</span>
                <span className="font-semibold text-[#3ECF8E]">{studentDept.split(' ')[0]} — {labs[0]}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#242424] pb-2">
                <span className="text-zinc-400 font-mono text-[11px]">Hazard Level:</span>
                <span className="font-bold text-amber-300 font-mono">{result.hazard_level || 'Low'} Hazard</span>
              </div>
              <div>
                <span className="text-zinc-400 font-mono text-[11px] block mb-1">Reported Malfunction / Reason:</span>
                <p className="p-2 rounded-xl bg-[#181818] border border-[#2e2e2e] text-zinc-300 text-xs">
                  {result.hazard_reason || 'Equipment diagnosed by AI scanner requiring faculty workbench evaluation.'}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400">
              Only your approval is required. By approving, this ticket will be submitted directly to the {studentDept.split(' ')[0]} laboratory workshop.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="px-4 py-2 rounded-xl border border-[#2e2e2e] text-zinc-400 hover:text-[#EDEDED] hover:bg-[#242424] font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveRepairTicket}
                disabled={submittingAction}
                className="px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-bold text-xs shadow-md shadow-[#3ECF8E]/20 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submittingAction ? 'Submitting...' : 'Approve & Submit Repair Ticket'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
