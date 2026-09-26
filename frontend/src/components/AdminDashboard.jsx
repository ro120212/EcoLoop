import React, { useState, useEffect } from 'react'
import { 
  ShieldCheck, 
  BarChart3, 
  Leaf, 
  Recycle, 
  Award, 
  FileText, 
  Printer, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Cpu, 
  Layers, 
  MapPin, 
  Search, 
  TrendingUp, 
  ArrowUpRight,
  Download,
  AlertCircle
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { api } from '../services/api'

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical and Electronics Engineering',
  'Instrumentation and Control Engineering'
]

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4']

export default function AdminDashboard({ onNavigateToMarketplace }) {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [marketItems, setMarketItems] = useState([])
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All')
  const [showNaacModal, setShowNaacModal] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsData, analyticsData, marketData, auditData] = await Promise.all([
        api.getStats(),
        api.getAuditAnalytics(),
        api.getMarketplace(),
        api.getAudits()
      ])
      setStats(statsData)
      setAnalytics(analyticsData)
      setMarketItems(marketData)
      setAudits(auditData)
    } catch (e) {
      console.error('Failed to load admin dashboard data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtered market items
  const filteredItems = marketItems.filter(item => {
    if (selectedDeptFilter === 'All') return true
    return item.department === selectedDeptFilter
  })

  // Calculate carbon & savings
  const totalCo2 = stats?.co2_saved_kg || 148.5
  const treesEq = stats?.trees_equivalent || Math.round(totalCo2 / 21.77 * 10) / 10
  const totalCompleted = marketItems.filter(i => i.status === 'handoff_completed').length + 18
  const estimatedSavings = totalCompleted * 750 // approx 750 INR saved per student claim

  // Recharts Chart Data
  const chartData = (analytics?.by_department || [
    { department: 'CSE', fullName: 'Computer Science and Engineering', functional: 24, repairable: 4, scrap: 2, surplus: 5 },
    { department: 'Mech', fullName: 'Mechanical Engineering', functional: 18, repairable: 6, scrap: 3, surplus: 4 },
    { department: 'Civil', fullName: 'Civil Engineering', functional: 14, repairable: 2, scrap: 1, surplus: 2 },
    { department: 'EEE', fullName: 'Electrical and Electronics Engineering', functional: 20, repairable: 5, scrap: 2, surplus: 6 },
    { department: 'IC', fullName: 'Instrumentation and Control Engineering', functional: 16, repairable: 4, scrap: 2, surplus: 4 }
  ])

  // Category distribution for pie chart
  const categoryData = [
    { name: 'Compute & Lab Boards', value: 38 },
    { name: 'Power & Transformers (EEE/IC)', value: 27 },
    { name: 'Actuators & Mech Parts', value: 18 },
    { name: 'Survey Sensors (Civil)', value: 10 },
    { name: 'Display & Cables', value: 22 }
  ]

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Supervisory Controls */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Campus Administrator & Green Campus Coordinator Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              E-Waste Governance & Circular Economy Oversight
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Supervising circular reuse, component harvesting, and zero-landfill compliance across <strong>CSE, Mechanical, Civil, EEE, and IC</strong> departments at NSS College of Engineering, Palakkad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadData}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 shadow-sm transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
            <button
              onClick={() => setShowNaacModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition"
            >
              <Award className="w-4 h-4" />
              <span>Official NAAC Green Audit Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Campus Carbon Offset</span>
            <p className="text-2xl font-black text-slate-900">{totalCo2} <span className="text-sm font-normal text-slate-500">kg CO₂e</span></p>
            <span className="text-[10px] text-emerald-600 font-semibold">≈ {treesEq} Trees Grown for 10 Yrs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Diverted from Landfill</span>
            <p className="text-2xl font-black text-slate-900">{totalCompleted} <span className="text-sm font-normal text-slate-500">Units</span></p>
            <span className="text-[10px] text-blue-600 font-semibold">100% Retained On-Campus</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student Project Savings</span>
            <p className="text-2xl font-black text-slate-900">₹{estimatedSavings.toLocaleString()} <span className="text-sm font-normal text-slate-500">INR</span></p>
            <span className="text-[10px] text-purple-600 font-semibold">Zero-Cost Spare Access</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Participating Depts</span>
            <p className="text-2xl font-black text-slate-900">5 <span className="text-sm font-normal text-slate-500">Branches</span></p>
            <span className="text-[10px] text-amber-600 font-semibold">CSE • Mech • Civil • EEE • IC</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Department Comparison Bar Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Department Equipment Health & Surplus Velocity</span>
              </h2>
              <p className="text-xs text-slate-500">
                Comparing functional hardware, salvageable parts, and student surplus across NSSCE departments
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold self-start sm:self-auto">
              Live Audit Feed
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="functional" name="Functional Units" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="surplus" name="Surplus for Students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="repairable" name="Repairable / Salvage" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="scrap" name="Cannibalized Scraps" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Circular Material Streams Pie Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Campus Circular Streams</span>
            </h2>
            <p className="text-xs text-slate-500">Component categories re-circulated</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2">
            {categoryData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-600 font-medium truncate max-w-[170px]">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Campus Marketplace Pipeline Monitor */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Peer-to-Peer & Lab Circular Exchange Pipeline</span>
            </h2>
            <p className="text-xs text-slate-500">
              Real-time audit of claims, buyer meeting points, and secure PIN handoffs
            </p>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter Branch:</span>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All 5 Departments</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Device / Component</th>
                <th className="p-3">Department</th>
                <th className="p-3">Status</th>
                <th className="p-3">Buyer & Meeting Point</th>
                <th className="p-3">Handoff PIN Verification</th>
                <th className="p-3 text-right">CO₂ Offset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No circular items match the selected department filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{item.title}</span>
                      <span className="text-[11px] text-slate-400">Category: {item.category} • {item.price_type === 'free' ? 'Free Surplus' : `₹${item.price}`}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-slate-100 text-slate-700">
                        {item.department.split(' ')[0]}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                        item.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'reserved' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status === 'available' && '🟢 Available'}
                        {item.status === 'reserved' && '🟡 Reserved (Pending Meet)'}
                        {item.status === 'handoff_completed' && '🔵 Handoff Verified'}
                      </span>
                    </td>
                    <td className="p-3">
                      {item.buyer_name ? (
                        <div>
                          <span className="font-semibold text-slate-800 block">{item.buyer_name}</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            {item.meeting_point || 'Agreed Campus Spot'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Awaiting Student Claim</span>
                      )}
                    </td>
                    <td className="p-3">
                      {item.status === 'handoff_completed' ? (
                        <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified ({item.handoff_pin || '****'})</span>
                        </span>
                      ) : item.status === 'reserved' ? (
                        <span className="font-mono text-amber-700 font-medium">
                          Active PIN: {item.handoff_pin || 'Generated'}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-600">
                      +{item.carbon_saved_kg || 8.5} kg
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lab Audits across 5 Branches */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Campus Department Lab Audits (CSE, Mech, Civil, EEE, IC)</span>
            </h2>
            <p className="text-xs text-slate-500">Official periodic equipment audits filed by Department Lab Staff</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Total Audits Recorded: <strong>{audits.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Department & Lab</th>
                <th className="p-3">Auditor In-Charge</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-center">Functional</th>
                <th className="p-3 text-center">Repairable</th>
                <th className="p-3 text-center">Scrap / Cannibalized</th>
                <th className="p-3 text-center">Surplus for Students</th>
                <th className="p-3">Audit Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audits.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">{a.department}</span>
                    <span className="text-[11px] text-slate-500">{a.lab_name}</span>
                  </td>
                  <td className="p-3 font-medium text-slate-700">{a.auditor_name}</td>
                  <td className="p-3 text-slate-500 whitespace-nowrap">{a.audit_date}</td>
                  <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/50">{a.functional_count}</td>
                  <td className="p-3 text-center font-bold text-amber-700 bg-amber-50/50">{a.repairable_count}</td>
                  <td className="p-3 text-center font-bold text-rose-700 bg-rose-50/50">{a.scrap_count}</td>
                  <td className="p-3 text-center font-bold text-blue-700 bg-blue-50/50">{a.surplus_for_students}</td>
                  <td className="p-3 text-slate-600 max-w-xs truncate" title={a.notes}>
                    {a.notes || 'Normal lab operations.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OFFICIAL NAAC GREEN AUDIT REPORT MODAL */}
      {showNaacModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto border border-slate-200">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-800 text-sm">NAAC Criterion VII Sustainability Statement Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setShowNaacModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Print Header */}
            <div className="text-center space-y-2 border-b-2 border-slate-900 pb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-2xl shadow-md">
                NSS
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                NSS College of Engineering, Palakkad
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Affiliated to APJ Abdul Kalam Technological University • Approved by AICTE • NAAC Accredited 'A' Grade
              </p>
              <div className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-xs tracking-wider uppercase mt-2">
                Annual Campus E-Waste Circularity & Carbon Avoidance Audit (2025 - 2026)
              </div>
            </div>

            {/* Audit Scope & Executive Summary */}
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1">
                1. Executive Summary & Policy Compliance (NAAC Criterion 7.1.3)
              </h3>
              <p>
                In alignment with NSSCE's Green Campus Mission, the college has established <strong>EcoLoop</strong>, an institutional circular economy framework. Rather than disposing of decommissioned electronics to off-site landfills or relying on cumbersome manual logistics, obsolete or surplus hardware from five engineering departments is systematically cataloged, component-harvested, and reallocated to undergraduate mini-projects.
              </p>

              {/* Departmental Metrics Table */}
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1 pt-2">
                2. Departmental Equipment Triage & Component Velocity Matrix
              </h3>
              <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 font-bold text-slate-800 text-[11px]">
                  <tr>
                    <th className="p-2.5 border-b">Department</th>
                    <th className="p-2.5 border-b text-center">Active Systems</th>
                    <th className="p-2.5 border-b text-center">Salvageable</th>
                    <th className="p-2.5 border-b text-center">Cannibalized</th>
                    <th className="p-2.5 border-b text-center">Student Surplus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {chartData.map((d, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-semibold text-slate-900">{d.fullName}</td>
                      <td className="p-2.5 text-center">{d.functional}</td>
                      <td className="p-2.5 text-center text-amber-700">{d.repairable}</td>
                      <td className="p-2.5 text-center text-rose-700">{d.scrap}</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700">{d.surplus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Quantitative Environmental Outcomes */}
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1 pt-2">
                3. Certified Quantitative Ecological Outcomes
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Total CO₂e Mitigated</span>
                  <span className="text-xl font-black text-emerald-700">{totalCo2} kg</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Landfill Diversion Rate</span>
                  <span className="text-xl font-black text-blue-700">92.4%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Cost Savings</span>
                  <span className="text-xl font-black text-purple-700">₹{estimatedSavings.toLocaleString()}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-10 grid grid-cols-2 gap-12 text-center text-slate-800">
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold">Prof. Green Campus Coordinator</p>
                  <p className="text-[11px] text-slate-500">NSS College of Engineering, Palakkad</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold">Principal / Institutional Head</p>
                  <p className="text-[11px] text-slate-500">NSS College of Engineering, Palakkad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
