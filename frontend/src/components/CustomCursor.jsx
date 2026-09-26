import React, { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)

  useEffect(() => {
    // Only activate on pointer devices with fine control (desktop/mouse)
    const isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!isPointerFine) return

    setMounted(true)
    document.documentElement.classList.add('custom-cursor-active')

    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100
    let animationFrameId = null

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY

      setIsVisible(true)

      // Direct transform on the center dot for immediate 0ms response
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`
      }

      // Check for interactive targets
      const target = e.target
      const isInteractive = target && (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('[role="button"]') ||
        target.closest('[role="tab"]') ||
        target.closest('.cursor-pointer')
      )
      setIsHovering(Boolean(isInteractive))
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    // Smooth linear interpolation (LERP) loop for trailing reticle ring
    const render = () => {
      const ease = 0.2
      ringX += (mouseX - ringX) * ease
      ringY += (mouseY - ringY) * ease

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      }

      animationFrameId = requestAnimationFrame(render)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    animationFrameId = requestAnimationFrame(render)

    return () => {
      document.documentElement.classList.remove('custom-cursor-active')
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [])

  if (!mounted) return null

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden select-none transition-opacity duration-200"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {/* Trailing Precision HUD Ring / Reticle */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 -ml-4 -mt-4 will-change-transform"
        style={{
          width: isHovering ? '44px' : '32px',
          height: isHovering ? '44px' : '32px',
          marginLeft: isHovering ? '-22px' : '-16px',
          marginTop: isHovering ? '-22px' : '-16px',
          transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s cubic-bezier(0.16, 1, 0.3, 1), margin 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, border-color 0.2s ease'
        }}
      >
        <div
          className={`w-full h-full rounded-full border flex items-center justify-center transition-all duration-200 ${
            isClicking
              ? 'scale-75 border-[#3ECF8E] bg-[#3ECF8E]/30 shadow-[0_0_14px_#3ECF8E]'
              : isHovering
              ? 'border-[#3ECF8E] bg-[#3ECF8E]/12 shadow-[0_0_18px_rgba(62,207,142,0.35)] scale-105'
              : 'border-[#3ECF8E]/50 bg-[#3ECF8E]/5'
          }`}
        >
          {/* Technical Corner / Crosshair Ticks */}
          <span className="absolute -top-1 w-1 h-0.5 bg-[#3ECF8E] opacity-75" />
          <span className="absolute -bottom-1 w-1 h-0.5 bg-[#3ECF8E] opacity-75" />
          <span className="absolute -left-1 h-1 w-0.5 bg-[#3ECF8E] opacity-75" />
          <span className="absolute -right-1 h-1 w-0.5 bg-[#3ECF8E] opacity-75" />
        </div>
      </div>

      {/* Central Precision Emerald Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1 will-change-transform"
      >
        <div
          className={`rounded-full bg-[#3ECF8E] shadow-[0_0_8px_#3ECF8E] transition-transform duration-150 ${
            isHovering ? 'w-1.5 h-1.5 -ml-[1px] -mt-[1px] scale-125' : isClicking ? 'w-1 h-1 scale-75' : 'w-2 h-2'
          }`}
        />
      </div>
    </div>
  )
}
