import React from 'react'
import { 
  Recycle, 
  Cpu, 
  Leaf, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  BarChart3, 
  Wrench,
  ShoppingBag,
  Award,
  Calculator
} from 'lucide-react'

export default function StatsOverview({ stats, onSelectModule }) {
  const env = stats?.environmental_impact || {}

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white p-8 md:p-12 shadow-xl border border-emerald-800/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Leaf className="w-3.5 h-3.5" />
            NSS College of Engineering • Campus Circular Economy
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Close the Loop on Campus E-Waste.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Welcome to <span className="text-emerald-400 font-semibold">EcoLoop</span>, the smart platform uniting students, faculty, and college labs to collect, repair, redistribute, and responsibly recycle electronics with intelligent automated AI diagnostics.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onSelectModule('collection')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/30 transition flex items-center gap-2"
            >
              <Recycle className="w-4 h-4" />
              <span>Register E-Waste Item</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectModule('ai-scanner')}
              className="px-5 py-2.5 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>AI Waste Scanner & Guide</span>
            </button>
            <button
              onClick={() => onSelectModule('calculator')}
              className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 transition flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Carbon Calculator</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">E-Waste Diverted</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats?.e_waste_units_diverted ?? 28} <span className="text-xs font-normal text-slate-400">units</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Items on Exchange</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{(stats?.parts_available_for_reuse ?? 11) + (stats?.marketplace_active_items ?? 4)} <span className="text-xs font-normal text-slate-400">active</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">CO₂ Avoided</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{env.co2_saved_kg ?? 378.7} <span className="text-xs font-normal text-slate-400">kg</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Audited Labs</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats?.audited_labs_count ?? 3} <span className="text-xs font-normal text-slate-400">labs</span></h3>
          </div>
        </div>
      </div>

      {/* 5 Streamlined Core Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Campus Circular Modules</h2>
            <p className="text-xs text-slate-500">Streamlined 5-module system designed for NSS College of Engineering</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            5 Core Services
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div 
            onClick={() => onSelectModule('collection')}
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500/50 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Recycle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">1. Collection & Tracking</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Register broken or unwanted electronics for campus pickup. Follow the 6-stage lifecycle progress with a scannable QR tracking code.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition">
              <span>Open Collection Portal</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => onSelectModule('ai-scanner')}
            className="group bg-gradient-to-br from-purple-50/50 to-white p-6 rounded-2xl border border-purple-200 hover:border-purple-500 hover:shadow-lg transition cursor-pointer flex flex-col justify-between relative"
          >
            <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              Vision AI
            </span>
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition">2. AI Scanner & Guide</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Upload or capture an image of any waste. Automated AI vision detects materials, assesses toxicity hazard, and links you to the nearest campus drop-bin.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-purple-100 flex items-center text-xs font-semibold text-purple-700 group-hover:translate-x-1 transition">
              <span>Scan Waste with AI</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => onSelectModule('exchange')}
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500/50 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">3. Campus Reuse Exchange</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Unifies lab computer parts (RAM, SMPS, cables) and student reusables (calculators, textbooks, lab kits). Claim free components or purchase affordably.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition">
              <span>Explore Reuse Exchange</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => onSelectModule('repair')}
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-orange-500/50 hover:shadow-lg transition cursor-pointer flex flex-col justify-between relative"
          >
            <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              AI Diagnostic
            </span>
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-700 transition">4. Repair Before Replace</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Describe faulty gadget symptoms. The AI diagnostic assistant creates a safe, step-by-step DIY troubleshooting checklist, required tools, and campus technician contacts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-orange-600 group-hover:translate-x-1 transition">
              <span>Diagnose Fault with AI</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 5 */}
          <div 
            onClick={() => onSelectModule('audits-inventory')}
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-500/50 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition">5. Lab Audits & Triage</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Hardware surveys for CSE/ECE/EEE labs with dynamic Recharts, precious metal recovery estimates, and component cannibalization strategies.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition">
              <span>View Audits & Triage</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 6: Carbon Impact Shortcut */}
          <div 
            onClick={() => onSelectModule('calculator')}
            className="group bg-gradient-to-br from-teal-50 to-white p-6 rounded-2xl border border-teal-200 hover:border-teal-500 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition">Carbon Calculator & Certificate</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Tally up electronics you recycled or repaired. Calculate exact CO₂e prevented and generate a printable Green Campus Certificate.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-teal-100 flex items-center text-xs font-semibold text-teal-700 group-hover:translate-x-1 transition">
              <span>Generate Certificate</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
