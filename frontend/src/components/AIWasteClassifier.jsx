import React, { useState } from 'react'
import { 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw 
} from 'lucide-react'
import { api } from '../services/api'

export default function AIWasteClassifier({ onNavigateModule }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

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

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => onNavigateModule('marketplace')}
                  className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-semibold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>List on Circular Marketplace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigateModule('repair')}
                  className="px-4 py-2 rounded-xl bg-[#232323] border border-[#2e2e2e] hover:bg-[#282828] text-[#EDEDED] font-semibold text-xs transition cursor-pointer"
                >
                  Diagnose in Repair Clinic
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
