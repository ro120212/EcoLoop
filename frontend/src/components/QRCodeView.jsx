import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { QrCode, Copy, Check, ShieldCheck } from 'lucide-react'

export default function QRCodeView({ 
  pin = '0000', 
  title = 'Handoff Verification',
  subtitle = 'Show this QR code or 4-digit PIN to the seller to confirm physical pickup.',
  compact = false,
  onCopySuccess
}) {
  const [qrUrl, setQrUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(!compact)

  useEffect(() => {
    let isMounted = true
    // Plain 4-digit PIN payload is instantly recognized by 100% of native phone cameras (iPhone, Google Lens, Samsung)
    const payload = String(pin || '0000')
    QRCode.toDataURL(payload, {
      width: 240,
      margin: 1,
      color: {
        dark: '#EDEDED',
        light: '#141414'
      }
    })
      .then(url => {
        if (isMounted) setQrUrl(url)
      })
      .catch(err => {
        console.warn('QR code generation error:', err)
      })

    return () => {
      isMounted = false
    }
  }, [pin])

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(pin))
    }
    setCopied(true)
    if (onCopySuccess) onCopySuccess(pin)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 rounded-2xl bg-[#141414] border border-[#2e2e2e] text-[#EDEDED] space-y-3 shadow-md">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#3ECF8E]" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#3ECF8E] font-mono">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className="px-2 py-0.5 rounded bg-[#242424] hover:bg-[#2c2c2c] text-zinc-300 hover:text-[#3ECF8E] font-mono text-[10px] flex items-center gap-1 cursor-pointer transition border border-[#2e2e2e]"
          >
            <QrCode className="w-3 h-3" />
            <span>{showQr ? 'Hide QR' : 'Show QR'}</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="px-2 py-0.5 rounded bg-[#242424] hover:bg-[#2c2c2c] text-zinc-300 hover:text-[#3ECF8E] font-mono text-[10px] flex items-center gap-1 cursor-pointer transition border border-[#2e2e2e]"
          >
            {copied ? <Check className="w-3 h-3 text-[#3ECF8E]" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied!' : 'Copy PIN'}</span>
          </button>
        </div>
      </div>

      {/* QR Code Container (Interactive Toggle) */}
      {showQr && (
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#181818] border border-[#262626]">
          {qrUrl ? (
            <div className="p-2 rounded-xl bg-[#141414] border border-[#3ECF8E]/30 shadow-[0_0_20px_rgba(62,207,142,0.12)]">
              <img 
                src={qrUrl} 
                alt={`QR code for PIN ${pin}`}
                className="w-36 h-36 rounded-lg object-contain"
              />
            </div>
          ) : (
            <div className="w-36 h-36 rounded-lg bg-[#141414] border border-[#2e2e2e] flex items-center justify-center text-xs text-zinc-500 font-mono">
              Generating QR...
            </div>
          )}
          <span className="text-[10px] text-zinc-500 font-mono mt-2">
            Scan via phone camera or enter PIN below
          </span>
        </div>
      )}

      {/* Numeric PIN Display */}
      <div className="text-center space-y-1">
        <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
          Numeric Passcode
        </div>
        <div className="font-mono text-3xl font-extrabold tracking-[0.25em] text-[#3ECF8E] select-all drop-shadow-sm">
          {pin}
        </div>
      </div>

      {subtitle && (
        <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}
