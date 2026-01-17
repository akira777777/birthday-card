"use client"

import Image from "next/image"
import { useMemo, useRef, useState } from "react"
import { IMAGES } from "../assets/images"
import { withBasePath } from "../scripts/withBasePath"

interface GnomeProps {
  id: number
  x: number
  y: number
  onClick: (x: number, y: number, id?: number) => void
  isVisible: boolean
  isMobile?: boolean
}

export function Gnome({ id, x, y, onClick, isVisible, isMobile = false }: GnomeProps) {
  const [isBouncing, setIsBouncing] = useState(false)
  const bounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const gnomeSrc = useMemo(() => {
    const src = IMAGES.gnomes[id % IMAGES.gnomes.length]
    return withBasePath(src)
  }, [id])

  // Use a unified hitbox for all gnomes for consistent gameplay.
  // This also lets us animate positioning via transform (less jank than left/top).
  const box = useMemo(() => {
    const width = isMobile ? 92 : 120
    const height = isMobile ? 132 : 175
    return { width, height }
  }, [isMobile])

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isBouncing) return

    setIsBouncing(true)
    // Center of the hitbox for fireworks.
    onClick(x + box.width / 2, y + box.height / 2, id)
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
      className="absolute cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded-2xl will-change-transform touch-manipulation"
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${x}px, ${y}px, 0)`,
        pointerEvents: isBouncing ? "none" : "auto",
        transition: isBouncing ? "none" : "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
        // Larger touch target on mobile
        padding: isMobile ? "10px" : "0",
        margin: isMobile ? "-10px" : "0",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
      aria-label={`Click gnome ${id + 1}`}
      disabled={isBouncing}
    >
      <span
        className={`relative block gnome-inner ${isBouncing ? "gnome-bounce" : "gnome-idle"}`}
        style={{
          width: `${box.width}px`,
          height: `${box.height}px`,
          filter: isBouncing ? "drop-shadow(0 0 22px rgba(255, 215, 0, 0.9))" : "drop-shadow(0 14px 36px rgba(0, 0, 0, 0.35))",
          transition: "filter 200ms ease",
        }}
      >
        <Image
          src={gnomeSrc}
          alt="Гномик"
          fill
          sizes={isMobile ? "120px" : "180px"}
          className="select-none object-contain"
          priority
          draggable={false}
        />
      </span>
    </button>
  )
}
