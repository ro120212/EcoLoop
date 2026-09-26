import React, { useState } from 'react'
import { 
  Calculator, 
  Leaf, 
  Award, 
  CheckCircle2, 
  Printer, 
  ArrowRight, 
  Building2, 
  Sparkles,
  TreeDeciduous,
  Car
} from 'lucide-react'
import { api } from '../services/api'

const ITEMS_CONFIG = [
  { key: 'laptop', label: 'Laptops', factor: 210, toxic: 35, icon: '💻' },
  { key: 'smartphone', label: 'Smartphones', factor: 55, toxic: 12, icon: '📱' },
  { key: 'desktop_pc', label: 'Desktop CPUs / Towers', factor: 320, toxic: 85, icon: '🖥️' },
  { key: 'monitor', label: 'Monitors / LCDs', factor: 80, toxic: 40, icon: '📺' },
  { key: 'keyboard', label: 'Keyboards', factor: 3.5, toxic: 2, icon: '⌨️' },
  { key: 'mouse', label: 'Mice & Optical Trackers', factor: 2.0, toxic: 1, icon: '🖱️' },
  { key: 'cable', label: 'Cables & Adapters', factor: 1.2, toxic: 0.5, icon: '🔌' },
  { key: 'battery', label: 'Lithium Battery Packs', factor: 8.0, toxic: 45, icon: '🔋' },
  { key: 'smps_power_supply', label: 'SMPS Power Units', factor: 28.0, toxic: 18, icon: '⚡' }
]

export default function EcoImpactCalculator() {
  const [counts, setCounts] = useState({
    laptop: 1,
    smartphone: 1,
    desktop_pc: 0,
    monitor: 0,
    keyboard: 2,
    mouse: 2,
    cable: 4,
    battery: 1,
    smps_power_supply: 0
  })

  const [studentName, setStudentName] = useState('Campus Green Contributor')
  const [logged, setLogged] = useState(false)
  const [saving, setSaving] = useState(false)

  // Calculations
  const totalCo2 = Object.entries(counts).reduce((acc, [k, v]) => {
    const item = ITEMS_CONFIG.find(i => i.key === k)
    return acc + (item ? item.factor * v : 0)
  }, 0)

  const totalToxic = Object.entries(counts).reduce((acc, [k, v]) => {
    const item = ITEMS_CONFIG.find(i => i.key === k)
    return acc + (item ? item.toxic * v : 0)
  }, 0)

  const treesEquiv = (totalCo2 / 21.77).toFixed(1)
  const carKmEquiv = Math.round(totalCo2 * 6.5)
  const materialsSavedGrams = (totalCo2 * 1.8).toFixed(0)

  const updateCount = (key, delta) => {
    setCounts(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta)
    }))
    setLogged(false)
  }

  const handleLogImpact = async () => {
    try {
      setSaving(true)
      const summary = Object.entries(counts)
        .filter(([_, v]) => v > 0)
        .map(([k, v]) => `${v} ${k.replace('_', ' ')}`)
        .join(', ')

      await api.logImpact({
        item_summary: summary || 'Assorted campus e-waste',
        co2_saved_kg: totalCo2,
        toxic_diverted_g: totalToxic,
        materials_saved_g: parseFloat(materialsSavedGrams),
        trees_equivalent: parseFloat(treesEquiv)
      })
      setLogged(true)
    } catch (err) {
      alert('Error logging impact: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">E-Waste Carbon & Eco-Impact Calculator</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Calculate the lifecycle carbon emissions, diverted toxic chemicals, and raw minerals saved by reusing or recycling your electronics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Counter Selection */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Select Devices Diverted from Landfills</h3>
              <button
                onClick={() => setCounts({
                  laptop: 0, smartphone: 0, desktop_pc: 0, monitor: 0,
                  keyboard: 0, mouse: 0, cable: 0, battery: 0, smps_power_supply: 0
                })}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Reset
              </button>
            </div>

            <div className="space-y-2">
              {ITEMS_CONFIG.map(item => {
                const count = counts[item.key] || 0
                return (
                  <div 
                    key={item.key} 
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                        <span className="block text-[10px] text-slate-400">~{item.factor} kg CO₂e / unit</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCount(item.key, -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">{count}</span>
                      <button
                        onClick={() => updateCount(item.key, 1)}
                        className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contributor Name on Certificate:</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live Metrics & Certificate Column */}
        <div className="lg:col-span-6 space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
              <span className="text-xs font-bold text-emerald-800">Carbon Avoided</span>
              <p className="text-2xl font-extrabold text-emerald-950 mt-1">
                {totalCo2.toFixed(1)} <span className="text-xs font-normal">kg CO₂e</span>
              </p>
              <span className="text-[11px] text-emerald-700">Scope 3 embodied footprint</span>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl">
              <span className="text-xs font-bold text-rose-800">Toxic Leach Prevented</span>
              <p className="text-2xl font-extrabold text-rose-950 mt-1">
                {totalToxic.toFixed(1)} <span className="text-xs font-normal">grams</span>
              </p>
              <span className="text-[11px] text-rose-700">Lead, cadmium, mercury</span>
            </div>

            <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-200/60 text-teal-800 flex items-center justify-center">
                <TreeDeciduous className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-teal-800">Tree Equivalent</span>
                <p className="text-lg font-bold text-teal-950">{treesEquiv} seedlings</p>
                <span className="text-[10px] text-teal-700">Grown for 10 years</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-200/60 text-blue-800 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-blue-800">Car Mileage</span>
                <p className="text-lg font-bold text-blue-950">{carKmEquiv} km</p>
                <span className="text-[10px] text-blue-700">Gasoline driving avoided</span>
              </div>
            </div>
          </div>

          {/* Certificate Card */}
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-500/30 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>

            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">NSS College of Engineering, Palakkad</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                ECO-CERT-2026
              </span>
            </div>

            <div className="text-center space-y-2 py-2">
              <Award className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-xs uppercase tracking-widest text-emerald-300 font-semibold">Green Campus Circular Award</h4>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{studentName || 'Campus Contributor'}</h2>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                has contributed to the campus circular economy by actively diverting electronics from landfills, mitigating <strong className="text-emerald-400">{totalCo2.toFixed(1)} kg CO₂e</strong>.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Carbon Saved</span>
                <span className="font-bold text-emerald-400">{totalCo2.toFixed(1)} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Toxic Diverted</span>
                <span className="font-bold text-teal-400">{totalToxic.toFixed(1)} g</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Trees Equiv</span>
                <span className="font-bold text-emerald-300">{treesEquiv}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>

              <button
                onClick={handleLogImpact}
                disabled={saving || logged || totalCo2 === 0}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/30 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {logged ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Logged to Database!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{saving ? 'Logging...' : 'Record to Campus Tally'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
