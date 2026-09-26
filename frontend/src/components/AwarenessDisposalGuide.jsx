import React, { useState, useEffect } from 'react'
import { 
  BookOpen, 
  AlertTriangle, 
  MapPin, 
  ShieldAlert, 
  CheckCircle, 
  HelpCircle, 
  Flame, 
  Skull, 
  Droplets,
  ExternalLink
} from 'lucide-react'
import { api } from '../services/api'

export default function AwarenessDisposalGuide() {
  const [guide, setGuide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('hazards')

  useEffect(() => {
    async function fetchGuide() {
      try {
        const data = await api.getAwarenessGuide()
        setGuide(data)
      } catch (e) {
        console.error('Failed to load guide:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchGuide()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">E-Waste Awareness & Disposal Guide</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Learn about hazardous heavy metals, secure data sanitization rules, and campus drop-off bin coordinates at NSS College of Engineering.
        </p>

        {/* Tab Switcher */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('hazards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'hazards'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ⚠️ Hazardous Materials
          </button>
          <button
            onClick={() => setActiveTab('bins')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'bins'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📍 Campus Drop-off Bins
          </button>
          <button
            onClick={() => setActiveTab('data-safety')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'data-safety'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🔒 Data Sanitization & Safety
          </button>
        </div>
      </div>

      {/* Tab 1: Hazards */}
      {activeTab === 'hazards' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-orange-500/10 p-4 rounded-2xl border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <strong className="font-bold">Why E-Waste Must Never Enter Municipal Landfills:</strong> Electronics contain heavy metals that leach into groundwater, bioaccumulate in crops, and release carcinogenic dioxins when incinerated in open dump sites.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guide?.hazardous_materials?.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Skull className="w-4 h-4 text-rose-600" />
                    {item.material}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                    Toxic
                  </span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600">
                  <p><strong className="text-slate-700">Found In:</strong> {item.found_in}</p>
                  <p><strong className="text-slate-700">Health Threat:</strong> {item.hazard}</p>
                  <p className="bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-100 font-medium">
                    🛡️ <strong>Safe Handling:</strong> {item.safe_handling}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Campus Drop-off Bins */}
      {activeTab === 'bins' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Designated Campus E-Waste Drop-Boxes</h3>
            <p className="text-xs text-slate-500 mb-4">
              Students and staff can directly drop items into these color-coded bins across NSS College of Engineering:
            </p>

            <div className="space-y-3">
              {guide?.campus_bins?.map((bin, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{bin.location}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      <strong className="text-slate-700">Accepted:</strong> {bin.types}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Data Safety */}
      {activeTab === 'data-safety' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Data Sanitization Protocol Before Disposal</h3>
            <p className="text-xs text-slate-500">
              Follow these standard cybersecurity steps before surrendering any computer or phone:
            </p>

            <div className="space-y-2">
              {guide?.data_sanitization_rules?.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <strong className="font-bold flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-700" />
                Lithium Battery Safety Protocol:
              </strong>
              <p>
                Never puncture, bend, or crush a swollen battery. If a battery is swollen or warm to touch, place insulating electric tape over the positive and negative terminals and alert the lab staff immediately.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
