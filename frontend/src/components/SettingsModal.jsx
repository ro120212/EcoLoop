import React, { useState } from 'react'
import { Key, Database, Sparkles, CheckCircle2, ExternalLink } from 'lucide-react'
import { api } from '../services/api'

export default function SettingsModal({ onClose }) {
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!apiKey) return
    try {
      setSaving(true)
      await api.setGeminiKey(apiKey)
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onClose()
      }, 1200)
    } catch (err) {
      alert('Error updating API key: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">API & Cloud Settings</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
        </div>

        {/* AI API Key Section */}
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">AI Diagnostic API Key</label>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-purple-600 hover:underline flex items-center gap-1"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Powers the <strong>AI Waste Classifier</strong> and the <strong>Repair Troubleshooting Assistant</strong>.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving || !apiKey}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save API Key'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Supabase Status Section */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600" />
              Supabase Project Connection
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>
          <p className="font-mono text-slate-600 text-[11px]">
            URL: https://cxhqjmrxtlfrthuboaij.supabase.co
          </p>
          <p className="text-slate-500 text-[11px]">
            To run the complete table migration on your Supabase dashboard, open the included <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">supabase_schema.sql</code> file in Supabase SQL Editor.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
