import React from 'react'

/**
 * LiveWallpaper
 * Continuous, smooth emerald aurora blooms designed for Supabase/Obsidian dark aesthetic.
 * Runs 100% GPU hardware-accelerated animations with negligible CPU footprint.
 */
export default function LiveWallpaper() {
  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#101010] select-none"
    >
      {/* Aurora Bloom 1: Top-Left Primary Vibrant Emerald Swell */}
      <div 
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] min-w-[380px] min-h-[380px] rounded-full bg-[radial-gradient(circle,rgba(62,207,142,0.22)_0%,rgba(16,185,129,0.08)_45%,transparent_70%)] blur-[95px] animate-aurora-1" 
      />

      {/* Aurora Bloom 2: Bottom-Right Deep Jade & Emerald Swell */}
      <div 
        className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] min-w-[420px] min-h-[420px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18)_0%,rgba(5,150,105,0.06)_50%,transparent_70%)] blur-[110px] animate-aurora-2" 
      />

      {/* Aurora Bloom 3: Center-Right Luminous Spring Emerald Surge */}
      <div 
        className="absolute top-[25%] right-[15%] w-[45vw] h-[45vw] min-w-[340px] min-h-[340px] rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.16)_0%,rgba(62,207,142,0.05)_55%,transparent_75%)] blur-[105px] animate-aurora-3" 
      />

      {/* Aurora Bloom 4: Bottom-Left Gentle Deep Teal-Emerald Undulation */}
      <div 
        className="absolute bottom-[10%] -left-[15%] w-[50vw] h-[50vw] min-w-[360px] min-h-[360px] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.14)_0%,rgba(62,207,142,0.04)_50%,transparent_70%)] blur-[120px] animate-aurora-4" 
      />

      {/* Supabase Technical Precision Dot-Grid Matrix */}
      <div className="absolute inset-0 bg-supabase-grid opacity-25" />

      {/* Soft Vignette Mask to keep foreground content perfectly legible */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,#101010_100%)] opacity-85" />
    </div>
  )
}
