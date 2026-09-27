import React from 'react'

/**
 * EcoLoopLogo
 * Pure vector SVG emblem with 100% transparent background.
 * Represents circular campus e-waste recycling and electronics rebirth.
 */
export default function EcoLoopLogo({ className = "w-8 h-8", ...props }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 drop-shadow-[0_0_10px_rgba(62,207,142,0.45)] ${className}`}
      {...props}
    >
      <defs>
        {/* Primary Vibrant Emerald Gradient */}
        <linearGradient id="ecoloop-gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3ECF8E" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Secondary Electric Highlight Gradient */}
        <linearGradient id="ecoloop-gradient-glow" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="60%" stopColor="#3ECF8E" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Soft Emerald Glow Filter */}
        <filter id="ecoloop-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor="#3ECF8E" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Main Continuous Infinity Circular Loop (Möbius Ribbon) */}
      <g filter="url(#ecoloop-glow)">
        {/* Left Loop Arch */}
        <path
          d="M50 50 C38 65, 20 65, 20 50 C20 35, 38 35, 50 50 Z"
          stroke="url(#ecoloop-gradient-primary)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Loop Arch */}
        <path
          d="M50 50 C62 35, 80 35, 80 50 C80 65, 62 65, 50 50 Z"
          stroke="url(#ecoloop-gradient-glow)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Circular Outer Flow Accents */}
        <path
          d="M26 36 C32 26, 45 22, 58 24"
          stroke="url(#ecoloop-gradient-primary)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M74 64 C68 74, 55 78, 42 76"
          stroke="url(#ecoloop-gradient-glow)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Tech Circuit Junction Nodes */}
        <circle cx="50" cy="50" r="4.5" fill="#3ECF8E" />
        <circle cx="50" cy="50" r="2" fill="#121212" />

        <circle cx="20" cy="50" r="3.5" fill="#34D399" />
        <circle cx="80" cy="50" r="3.5" fill="#10B981" />

        <circle cx="58" cy="24" r="2" fill="#6EE7B7" />
        <circle cx="42" cy="76" r="2" fill="#6EE7B7" />
      </g>
    </svg>
  )
}
