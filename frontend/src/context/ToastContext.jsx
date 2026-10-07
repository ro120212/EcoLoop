import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(({ type = 'success', title, message, duration = 4000 }) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const newToast = { id, type, title, message }

    setToasts((prev) => [...prev, newToast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [removeToast])

  const toast = {
    success: (title, message, duration = 4000) => addToast({ type: 'success', title, message, duration }),
    error: (title, message, duration = 5000) => addToast({ type: 'error', title, message, duration }),
    info: (title, message, duration = 3500) => addToast({ type: 'info', title, message, duration }),
    celebrate: (title, message, duration = 5000) => addToast({ type: 'celebrate', title, message, duration })
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Toast Container */}
      <div 
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-none"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === 'success'
          const isError = t.type === 'error'
          const isCelebrate = t.type === 'celebrate'
          const isInfo = t.type === 'info'

          return (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-2xl p-4 shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
                isCelebrate
                  ? 'bg-gradient-to-r from-[#1c1c1c] via-[#141414] to-[#1c1c1c] border-[#3ECF8E] shadow-[0_0_25px_rgba(62,207,142,0.25)] text-[#EDEDED]'
                  : isSuccess
                  ? 'bg-[#181818]/95 border-[#3ECF8E]/40 text-[#EDEDED] shadow-[0_0_20px_rgba(62,207,142,0.15)]'
                  : isError
                  ? 'bg-[#181818]/95 border-rose-500/40 text-[#EDEDED] shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                  : 'bg-[#181818]/95 border-blue-500/40 text-[#EDEDED] shadow-[0_0_20px_rgba(59,130,246,0.15)]'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Status Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                    isCelebrate
                      ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border-[#3ECF8E]/40 animate-pulse'
                      : isSuccess
                      ? 'bg-[#3ECF8E]/15 text-[#3ECF8E] border-[#3ECF8E]/30'
                      : isError
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  }`}
                >
                  {isCelebrate ? (
                    <Sparkles className="w-4 h-4" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isError ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-1">
                  {t.title && (
                    <h4 className="text-xs sm:text-sm font-bold text-[#EDEDED] leading-tight">
                      {t.title}
                    </h4>
                  )}
                  {t.message && (
                    <p className="text-[11px] sm:text-xs text-zinc-300 mt-1 leading-relaxed">
                      {t.message}
                    </p>
                  )}
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="text-zinc-500 hover:text-zinc-200 p-1 rounded-lg hover:bg-[#282828] transition shrink-0 cursor-pointer"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
