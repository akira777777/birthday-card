"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

interface GnomeProps {
  id: number
  x: number
  y: number
  onClick: (x: number, y: number, id?: number) => void
  isVisible: boolean
  isMobile?: boolean
}

// Get base path for GitHub Pages compatibility
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

// Gnome images mapping
const gnomeImagePaths = [
  "/assets/images/gnome-1.png",
  "/assets/images/gnome-2.png",
  "/assets/images/gnome-3.png",
]

export function Gnome({ id, x, y, onClick, isVisible, isMobile = false }: GnomeProps) {
  const [isBouncing, setIsBouncing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const lastTapRef = useRef<number>(0)

  // Get gnome image based on ID with base path
  const gnomeImage = useMemo(() => {
    const path = gnomeImagePaths[id % gnomeImagePaths.length]
    return `${basePath}${path}`
  }, [id])

  // Size based on device
  const size = isMobile
    ? { width: 100, height: 140 }
    : { width: 130, height: 180 }

  // Haptic feedback
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([15, 30, 15])
    }
  }, [])

  // Prevent double-tap zoom on mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      e.preventDefault()
    }
    lastTapRef.current = now
  }, [])

  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isBouncing) return

    setIsBouncing(true)
    triggerHaptic()

    // Center of gnome for fireworks
    onClick(x + size.width / 2, y + size.height / 2, id)

    setTimeout(() => setIsBouncing(false), 600)
  }, [isBouncing, onClick, x, y, size.width, size.height, id, triggerHaptic])

  // Mouse/touch handlers for hover state
  const handlePointerEnter = useCallback(() => {
    if (!isMobile) setIsHovered(true)
  }, [isMobile])

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsBouncing(false)
      setIsHovered(false)
    }
  }, [])

  if (!isVisible) return null

  const scale = isBouncing ? 1.25 : isHovered ? 1.1 : 1
  const translateY = isBouncing ? -30 : isHovered ? -10 : 0
  const rotation = isBouncing ? (Math.random() > 0.5 ? 5 : -5) : 0

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`absolute cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 rounded-full gpu-accelerated no-select ${isBouncing ? "animate-bounce-gnome" : "animate-pulse-gnome"
        }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transform: `scale(${scale}) translateY(${translateY}px) rotate(${rotation}deg)`,
        pointerEvents: isBouncing ? "none" : "auto",
        transition: isBouncing
          ? "none"
          : "left 0.5s ease-out, top 0.5s ease-out, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        filter: isBouncing
          ? "drop-shadow(0 0 30px rgba(255, 215, 0, 1)) drop-shadow(0 0 60px rgba(255, 215, 0, 0.6))"
          : isHovered
            ? "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))"
            : "drop-shadow(0 15px 30px rgba(0, 0, 0, 0.4))",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        zIndex: isBouncing ? 100 : 10,
      }}
      aria-label={`Нажми на гномика ${id + 1}`}
      disabled={isBouncing}
    >
      {/* Glow effect behind gnome */}
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-300 ${isBouncing ? 'opacity-100' : isHovered ? 'opacity-50' : 'opacity-0'
          }`}
        style={{
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)',
          transform: 'scale(1.5)',
        }}
      />

      {/* Gnome image */}
      <Image
        src={gnomeImage}
        alt={`Гномик ${id + 1}`}
        width={size.width}
        height={size.height}
        className={`object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        style={{
          touchAction: "manipulation",
        }}
        onLoad={() => setImageLoaded(true)}
        priority
        draggable={false}
      />

      {/* Sparkle effects when bouncing */}
      {isBouncing && (
        <>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${10 + Math.random() * 40}%`,
                width: '8px',
                height: '8px',
                backgroundColor: '#FFD700',
                borderRadius: '50%',
                animationDuration: '0.6s',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Touch feedback ripple on mobile */}
      {isMobile && isBouncing && (
        <div
          className="absolute inset-0 rounded-full bg-yellow-400/40 animate-ping"
          style={{ animationDuration: '0.6s' }}
        />
      )}
    </button>
  )
}
