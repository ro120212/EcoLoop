import React, { useState, useEffect } from 'react'
import { 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  Trash2, 
  AlertTriangle, 
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  Database
} from 'lucide-react'
import { api } from '../services/api'

export default function AdminConsole() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await api.getCollections()
      setRequests(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdate = async (id, newStatus, action) => {
    try {
      setUpdatingId(id)
      await api.updateCollectionStatus(id, newStatus, action)
      await loadData()
    } catch (err) {
      alert('Error updating status: ' + err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Campus Administrator Console</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervisory dashboard for department lab administrators, collection scheduling, and recycling batch authorization.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Supabase Status Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-950">
            <Database className="w-4 h-4 text-emerald-700" />
            <span>Supabase PostgreSQL Integration Active</span>
          </div>
          <p className="text-emerald-800 leading-relaxed">
            Project: <code className="bg-white/80 px-1.5 py-0.5 rounded text-emerald-900 font-mono">cxhqjmrxtlfrthuboaij.supabase.co</code>. All operations persist to Supabase tables with high-availability local sync.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-200/60 text-emerald-900 font-bold text-[10px] uppercase">
          Connected
        </span>
      </div>

      {/* Queue Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">E-Waste Triage & Collection Queue</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Tracking Code</th>
                <th className="p-3">Device & Specs</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action Route</th>
                <th className="p-3 text-right">Quick Triage Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-emerald-800">{r.tracking_code}</td>
                  <td className="p-3 font-medium text-slate-900">
                    {r.item_type}
                    {r.brand_model && <span className="text-slate-400 block text-[11px]">{r.brand_model} (Qty: {r.quantity})</span>}
                  </td>
                  <td className="p-3 text-slate-600">{r.condition}</td>
                  <td className="p-3 text-slate-600 truncate max-w-[150px]">{r.pickup_location}</td>
                  <td className="p-3">
                    <span className="capitalize font-semibold text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                      {r.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-emerald-700">{r.action_taken || 'Pending'}</td>
                  <td className="p-3 text-right space-x-1">
                    {r.status !== 'completed' && (
                      <>
                        <button
                          onClick={() => handleUpdate(r.id, 'collection_scheduled', 'Scheduled for Campus Pickup')}
                          className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-semibold"
                        >
                          Schedule
                        </button>
                        <button
                          onClick={() => handleUpdate(r.id, 'reused_recycled', 'Re-assigned to Student Lab')}
                          className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-semibold"
                        >
                          Reassign
                        </button>
                        <button
                          onClick={() => handleUpdate(r.id, 'completed', 'Recycled by Certified Vendor')}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold"
                        >
                          Mark Done
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
