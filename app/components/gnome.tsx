"use client"

import { useRef, useState } from "react"

interface GnomeProps {
  id: number
  x: number
  y: number
  onClick: (x: number, y: number, id?: number) => void
  isVisible: boolean
  isMobile?: boolean
}

const gnomeColors = [
  { hat: "#FF6B6B", body: "#4ECDC4", beard: "#95E1D3" },
  { hat: "#FFD93D", body: "#6BCF7F", beard: "#95E1D3" },
  { hat: "#A8E6CF", body: "#FFD93D", beard: "#FFA07A" },
  { hat: "#95E1D3", body: "#F38181", beard: "#AAE3E2" },
  { hat: "#F38181", body: "#FFD93D", beard: "#C7CEEA" },
]

export function Gnome({ id, x, y, onClick, isVisible, isMobile = false }: GnomeProps) {
  const [isBouncing, setIsBouncing] = useState(false)
  const [colorSet] = useState(gnomeColors[id % gnomeColors.length])
  const bounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Larger size on mobile for easier tapping
  const size = isMobile ? { width: 100, height: 130 } : { width: 120, height: 160 }

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isBouncing) return

    setIsBouncing(true)
    // Center of gnome for fireworks
    onClick(x + size.width / 2, y + size.height / 2, id)
    if (bounceTimeoutRef.current) {
      clearTimeout(bounceTimeoutRef.current)
    }
    bounceTimeoutRef.current = setTimeout(() => {
      setIsBouncing(false)
      bounceTimeoutRef.current = null
    }, 600)
  }

  // Cleanup on unmount
  if (!isVisible) {
    if (bounceTimeoutRef.current) {
      clearTimeout(bounceTimeoutRef.current)
      bounceTimeoutRef.current = null
    }
    return null
  }

  return (
    <button
      onClick={handleClick}
      onTouchEnd={handleClick}
      className={`absolute cursor-pointer transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded-full will-change-transform active:scale-125 ${isBouncing ? "animate-bounce-gnome" : "animate-pulse-gnome"
        } ${isMobile ? "hover:scale-105" : "hover:scale-110"}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: isBouncing ? "scale(1.2) translateY(-30px)" : "none",
        pointerEvents: isBouncing ? "none" : "auto",
        transition: isBouncing ? "none" : "left 0.5s ease-out, top 0.5s ease-out",
        filter: isBouncing
          ? "drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))"
          : "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))",
        // Larger touch target on mobile
        padding: isMobile ? "10px" : "0",
        margin: isMobile ? "-10px" : "0",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
      aria-label={`Click gnome ${id + 1}`}
      disabled={isBouncing}
    >
      <svg
        width={size.width}
        height={size.height}
        viewBox="0 0 120 160"
        className="drop-shadow-2xl"
        style={{
          touchAction: "manipulation",
          filter: isBouncing
            ? "drop-shadow(0 0 25px rgba(255, 215, 0, 1))"
            : "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.4))",
          transition: "filter 0.3s ease",
        }}
      >
        {/* Hat */}
        <path
          d="M20 30 Q20 10 40 10 Q60 10 80 10 Q100 10 100 30 L100 50 Q100 60 90 65 L80 70 L40 70 L30 65 Q20 60 20 50 Z"
          fill={colorSet.hat}
          stroke="#2C3E50"
          strokeWidth="2"
        />
        <circle cx="60" cy="45" r="8" fill="#FFD700" />
        <circle cx="60" cy="35" r="5" fill="#FFD700" />

        {/* Face */}
        <circle cx="60" cy="90" r="35" fill="#FFDBAC" stroke="#2C3E50" strokeWidth="2" />

        {/* Eyes - cute blinking animation */}
        <circle cx="50" cy="85" r="5" fill="#2C3E50" />
        <circle cx="70" cy="85" r="5" fill="#2C3E50" />
        <circle cx="48" cy="83" r="2" fill="white" />
        <circle cx="68" cy="83" r="2" fill="white" />

        {/* Rosy cheeks */}
        <circle cx="40" cy="95" r="6" fill="#FFB6C1" opacity="0.6" />
        <circle cx="80" cy="95" r="6" fill="#FFB6C1" opacity="0.6" />

        {/* Nose */}
        <ellipse cx="60" cy="95" rx="4" ry="5" fill="#FF8C69" />

        {/* Smile */}
        <path d="M50 105 Q60 115 70 105" stroke="#2C3E50" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Beard */}
        <path
          d="M35 110 Q35 135 60 145 Q85 135 85 110 L85 100 Q85 95 80 90 L40 90 Q35 95 35 100 Z"
          fill={colorSet.beard}
          stroke="#2C3E50"
          strokeWidth="2"
        />

        {/* Body */}
        <rect x="35" y="120" width="50" height="40" rx="25" fill={colorSet.body} stroke="#2C3E50" strokeWidth="2" />

        {/* Arms */}
        <ellipse cx="25" cy="125" rx="10" ry="18" fill={colorSet.body} stroke="#2C3E50" strokeWidth="2" />
        <ellipse cx="95" cy="125" rx="10" ry="18" fill={colorSet.body} stroke="#2C3E50" strokeWidth="2" />

        {/* Hands */}
        <circle cx="25" cy="140" r="6" fill="#FFDBAC" stroke="#2C3E50" strokeWidth="1.5" />
        <circle cx="95" cy="140" r="6" fill="#FFDBAC" stroke="#2C3E50" strokeWidth="1.5" />

        {/* Belt with buckle */}
        <rect x="35" y="140" width="50" height="10" fill="#2C3E50" />
        <rect x="52" y="141" width="16" height="8" rx="2" fill="#FFD700" />

        {/* Legs/Boots */}
        <ellipse cx="45" cy="158" rx="10" ry="6" fill="#2C3E50" />
        <ellipse cx="75" cy="158" rx="10" ry="6" fill="#2C3E50" />
      </svg>
    </button>
  )
}
