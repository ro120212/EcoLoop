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
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#0c0f0d] select-none"
    >
      {/* Aurora Bloom 1: Top-Left Radiant Light Mint & Emerald Swell */}
      <div 
        className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] min-w-[420px] min-h-[420px] rounded-full bg-[radial-gradient(circle,rgba(110,231,183,0.65)_0%,rgba(52,211,153,0.38)_35%,rgba(16,185,129,0.18)_55%,transparent_75%)] blur-[75px] animate-aurora-1" 
      />

      {/* Aurora Bloom 2: Bottom-Right Luminous Spring Emerald Swell */}
      <div 
        className="absolute -bottom-[15%] -right-[10%] w-[65vw] h-[65vw] min-w-[440px] min-h-[440px] rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.58)_0%,rgba(110,231,183,0.34)_40%,rgba(16,185,129,0.15)_60%,transparent_75%)] blur-[80px] animate-aurora-2" 
      />

      {/* Aurora Bloom 3: Center Ambient Luminous Glow (Shines behind cards) */}
      <div 
        className="absolute top-[20%] left-[25%] w-[55vw] h-[55vw] min-w-[380px] min-h-[380px] rounded-full bg-[radial-gradient(circle,rgba(167,243,208,0.48)_0%,rgba(52,211,153,0.28)_45%,rgba(62,207,142,0.12)_65%,transparent_80%)] blur-[85px] animate-aurora-3" 
      />

      {/* Aurora Bloom 4: Bottom-Left Vibrant Aqua-Emerald Undulation */}
      <div 
        className="absolute bottom-[5%] -left-[10%] w-[55vw] h-[55vw] min-w-[380px] min-h-[380px] rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.52)_0%,rgba(52,211,153,0.30)_45%,transparent_75%)] blur-[75px] animate-aurora-4" 
      />

      {/* Supabase Technical Precision Dot-Grid Matrix */}
      <div className="absolute inset-0 bg-supabase-grid opacity-35" />

      {/* Soft Edge Fade to keep viewport corners smooth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,#0c0f0d_100%)] opacity-25" />
    </div>
  )
}
