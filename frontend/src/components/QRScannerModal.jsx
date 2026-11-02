import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, X, AlertTriangle, KeyRound, RefreshCw, CheckCircle2 } from 'lucide-react'

export default function QRScannerModal({ 
  isOpen, 
  onClose, 
  onScanSuccess, 
  expectedItemId = null,
  title = "Scan Handoff QR Code",
  onManualFallback
}) {
  const [cameraError, setCameraError] = useState('')
  const [isStarting, setIsStarting] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const scannerRef = useRef(null)
  const containerId = "ecoloop-qr-reader-container"

  useEffect(() => {
    if (!isOpen) return

    let html5QrCode = null
    let isMounted = true
    setIsStarting(true)
    setCameraError('')
    setIsSuccess(false)

    // Give DOM a tick to render container element
    const timer = setTimeout(() => {
      if (!isMounted) return
      try {
        html5QrCode = new Html5Qrcode(containerId)
        scannerRef.current = html5QrCode

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        }

        html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            // Success handler
            if (!isMounted) return
            setIsSuccess(true)

            // Extract PIN and optional itemId from payload
            let pin = ''
            let scannedItemId = expectedItemId

            try {
              const parsed = JSON.parse(decodedText)
              if (parsed && typeof parsed === 'object') {
                pin = String(parsed.pin || parsed.code || '')
                if (parsed.itemId) scannedItemId = parsed.itemId
              }
            } catch (_) {
              // Not JSON - check if plain numeric or formatted string
              const match = decodedText.match(/\b\d{4}\b/)
              if (match) {
                pin = match[0]
              } else {
                pin = decodedText.trim()
              }
            }

            // Stop camera immediately
            if (html5QrCode && html5QrCode.isScanning) {
              html5QrCode.stop().then(() => {
                html5QrCode.clear()
              }).catch(() => {})
            }

            // Trigger success callback after small feedback delay
            setTimeout(() => {
              if (onScanSuccess) {
                onScanSuccess(pin, scannedItemId)
              }
            }, 400)
          },
          () => {
            // Continuous scanning frame miss - ignore
          }
        ).then(() => {
          if (isMounted) setIsStarting(false)
        }).catch((err) => {
          if (isMounted) {
            setIsStarting(false)
            console.warn('Camera start error:', err)
            setCameraError(
              'Camera access was denied or is unavailable on this device. You can type the 4-digit PIN manually instead.'
            )
          }
        })
      } catch (err) {
        if (isMounted) {
          setIsStarting(false)
          setCameraError('Failed to initialize camera scanner.')
        }
      }
    }, 150)

    return () => {
      isMounted = false
      clearTimeout(timer)
      if (html5QrCode) {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().then(() => {
            html5QrCode.clear()
          }).catch(() => {})
        } else {
          try { html5QrCode.clear() } catch (_) {}
        }
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-3xl max-w-md w-full p-6 text-[#EDEDED] shadow-2xl space-y-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#EDEDED]">{title}</h3>
              <p className="text-[11px] text-zinc-400">Point your camera at the QR code on the screen</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-[#EDEDED] p-1 rounded-lg hover:bg-[#262626] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport Area */}
        <div className="relative rounded-2xl overflow-hidden bg-[#121212] border border-[#2e2e2e] aspect-square flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-amber-300">Camera Unavailable</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs mx-auto">
                {cameraError}
              </p>
              {onManualFallback && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onManualFallback()
                  }}
                  className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#121212] font-bold text-xs transition cursor-pointer flex items-center gap-1.5 mx-auto shadow-sm"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Enter 4-Digit PIN Manually</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* html5-qrcode mounts inside this DOM container */}
              <div id={containerId} className="w-full h-full object-cover" />

              {/* Viewfinder Target Overlay */}
              {!isStarting && !isSuccess && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-48 h-48 border-2 border-[#3ECF8E]/60 rounded-2xl relative shadow-[0_0_20px_rgba(62,207,142,0.2)]">
                    {/* Corner Reticle Accents */}
                    <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#3ECF8E]" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#3ECF8E]" />
                    <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#3ECF8E]" />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#3ECF8E]" />
                    {/* Animated Emerald Laser Line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#3ECF8E] to-transparent animate-pulse absolute top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono tracking-wider mt-3 bg-[#121212]/80 px-2.5 py-1 rounded-full border border-[#2e2e2e]">
                    Align QR code within frame
                  </span>
                </div>
              )}

              {/* Starting Camera Spinner */}
              {isStarting && (
                <div className="absolute inset-0 bg-[#121212] flex flex-col items-center justify-center space-y-2.5">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" />
                  <span className="text-xs text-zinc-400 font-mono">Initializing camera...</span>
                </div>
              )}

              {/* Success Flash Overlay */}
              {isSuccess && (
                <div className="absolute inset-0 bg-[#121212]/90 flex flex-col items-center justify-center space-y-2 animate-in fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/40 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-[#EDEDED]">QR Code Scanned!</span>
                  <span className="text-xs text-[#3ECF8E] font-mono">Verifying handoff...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-1">
          {onManualFallback ? (
            <button
              type="button"
              onClick={() => {
                onClose()
                onManualFallback()
              }}
              className="px-3 py-1.5 rounded-xl bg-[#242424] hover:bg-[#2c2c2c] text-zinc-300 hover:text-[#3ECF8E] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition border border-[#2e2e2e]"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Type PIN Instead</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-[#2e2e2e] hover:bg-[#242424] text-zinc-400 hover:text-[#EDEDED] text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
