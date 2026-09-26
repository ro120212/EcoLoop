import React, { useState, useEffect } from 'react'
import { 
  Sparkles, 
  UploadCloud, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Leaf, 
  ArrowRight, 
  RefreshCw, 
  MapPin,
  Skull,
  BookOpen,
  ShieldAlert
} from 'lucide-react'
import { api } from '../services/api'

export default function AIWasteClassifier({ onNavigateModule }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeGuideTab, setActiveGuideTab] = useState('bins') // 'bins', 'hazards', 'data'
  const [guideData, setGuideData] = useState(null)

  useEffect(() => {
    async function loadGuide() {
      try {
        const data = await api.getAwarenessGuide()
        setGuideData(data)
      } catch (e) {
        console.error(e)
      }
    }
    loadGuide()
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setResult(null)
    setError('')
  }

  const handleClassify = async () => {
    if (!selectedFile) return
    try {
      setLoading(true)
      setError('')
      const data = await api.classifyWaste(selectedFile)
      setResult(data)
    } catch (err) {
      setError('Classification failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Pre-load demo image for instant testing
  const loadDemoImage = async (type) => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = type === 'circuit' ? '#0f172a' : '#1e293b'
    ctx.fillRect(0, 0, 400, 300)
    ctx.fillStyle = '#10b981'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText(type === 'circuit' ? 'PCB Motherboard Sample' : 'Swollen Lithium Battery Sample', 30, 150)
    
    canvas.toBlob((blob) => {
      const file = new File([blob], `${type}-sample.jpg`, { type: 'image/jpeg' })
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResult(null)
      setError('')
    }, 'image/jpeg')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Smart AI Waste Classifier & Campus Disposal Guide</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              AI Vision Classifier
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Identify waste materials instantly with automated AI vision, assess toxicity hazard, and find certified campus drop-off points.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadDemoImage('circuit')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            🧪 Sample PCB
          </button>
          <button
            onClick={() => loadDemoImage('battery')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            🧪 Sample Battery
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Camera & Vision Scanner */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Step 1: Scan / Upload Item</span>
            </h3>

            <div className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl p-6 text-center transition bg-slate-50/50">
              {previewUrl ? (
                <div className="space-y-3">
                  <img 
                    src={previewUrl} 
                    alt="Waste preview" 
                    className="max-h-56 mx-auto rounded-xl object-contain shadow-sm border border-slate-200" 
                  />
                  <label className="inline-block cursor-pointer px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Change Photo
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-700">Click to upload photo or take picture</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Supports JPG, PNG, WEBP of cables, batteries, boards, or peripherals</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>

            {selectedFile && (
              <button
                onClick={handleClassify}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
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
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {error}
              </div>
            )}
          </div>

          {/* AI Analysis Result */}
          {result && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Automated Multimodal AI Analysis
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{result.item_name}</h3>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  result.category === 'E-Waste' ? 'bg-purple-100 text-purple-800' :
                  result.category === 'Metal' ? 'bg-blue-100 text-blue-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {result.category}
                </span>
              </div>

              {/* Hazard Meter */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Toxicity & Handling Hazard:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    result.hazard_level === 'High' ? 'bg-rose-100 text-rose-700' :
                    result.hazard_level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {result.hazard_level} Hazard
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{result.hazard_reason}</p>
              </div>

              {/* Materials */}
              <div>
                <span className="font-bold text-slate-700 block mb-1.5">Materials Detected:</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.materials_detected?.map((m, i) => (
                    <span key={i} className="font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Advice */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="font-bold flex items-center gap-1.5 text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Recommended Route: {result.recommended_action}
                  </strong>
                  <span className="font-semibold text-emerald-700">Est. {result.carbon_savings_if_diverted_kg} kg CO₂</span>
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  {result.campus_disposal_advice}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => onNavigateModule('marketplace')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <span>List on Circular Marketplace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigateModule('repair')}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                >
                  Diagnose in Repair Clinic
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Integrated Campus Disposal Guide & Bin Locator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Step 2: Campus Disposal Guide</span>
              </h3>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveGuideTab('bins')}
                className={`flex-1 py-1 rounded-lg font-semibold transition ${
                  activeGuideTab === 'bins' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'
                }`}
              >
                📍 Campus Drop Bins
              </button>
              <button
                onClick={() => setActiveGuideTab('hazards')}
                className={`flex-1 py-1 rounded-lg font-semibold transition ${
                  activeGuideTab === 'hazards' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'
                }`}
              >
                ⚠️ Toxic Hazards
              </button>
              <button
                onClick={() => setActiveGuideTab('data')}
                className={`flex-1 py-1 rounded-lg font-semibold transition ${
                  activeGuideTab === 'data' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'
                }`}
              >
                🔒 Data Rules
              </button>
            </div>

            {/* Tab: Bins */}
            {activeGuideTab === 'bins' && (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 text-xs">
                <p className="text-[11px] text-slate-500">
                  Drop-off bins stationed across NSS College of Engineering:
                </p>
                {guideData?.campus_bins?.map((bin, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{bin.location}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] pl-5">
                      <strong className="text-slate-700">Accepted:</strong> {bin.types}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Hazards */}
            {activeGuideTab === 'hazards' && (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 text-xs">
                {guideData?.hazardous_materials?.map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Skull className="w-3.5 h-3.5 text-rose-600" />
                        {item.material}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700">
                        Hazard
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600"><strong>Source:</strong> {item.found_in}</p>
                    <p className="text-[11px] text-emerald-800 bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-100">
                      <strong>Safe Handling:</strong> {item.safe_handling}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Data */}
            {activeGuideTab === 'data' && (
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-800 block mb-1">Before Disposal:</span>
                {guideData?.data_sanitization_rules?.map((rule, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2 text-slate-700 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
