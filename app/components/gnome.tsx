"use client"

import Image from "next/image"
import { useRef, useState, useEffect } from "react"

interface GnomeProps {
  id: number
  x: number
  y: number
  onClick: (x: number, y: number, id?: number) => void
  isVisible: boolean
  isMobile?: boolean
}

// PNG gnome images - ordered by id
const gnomeImages = [
  "/birthday-card/Слой 2.png",  // Red/green gnome
  "/birthday-card/Слой 3.png",  // Blue/red gnome
  "/birthday-card/Слой 4.png",  // Golden/red gnome
]

export function Gnome({ id, x, y, onClick, isVisible, isMobile = false }: GnomeProps) {
  const [isClicked, setIsClicked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const clickLockRef = useRef(false)
  
  // Get base path for GitHub Pages compatibility
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

  // Gnome dimensions - larger for better visibility
  const size = isMobile 
    ? { width: 100, height: 130 } 
    : { width: 140, height: 180 }

  const handleActivate = (event: React.SyntheticEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (clickLockRef.current || isClicked) return

    clickLockRef.current = true
    setIsClicked(true)

    // Calculate center position for fireworks
    const centerX = x + size.width / 2
    const centerY = y + size.height / 2
    onClick(centerX, centerY, id)

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }

    clickTimeoutRef.current = setTimeout(() => {
      setIsClicked(false)
      clickLockRef.current = false
      clickTimeoutRef.current = null
    }, 500)
  }

  // Cleanup on unmount or when visibility changes
  useEffect(() => {
    if (!isVisible && clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }

    if (!isVisible) {
      setIsClicked(false)
      setIsHovered(false)
      clickLockRef.current = false
    }
    
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
        clickTimeoutRef.current = null
      }
      clickLockRef.current = false
    }
  }, [isVisible])

  if (!isVisible) return null

  // Get the appropriate image for this gnome
  const imageSrc = basePath + gnomeImages[id % gnomeImages.length]

  return (
    <button
      onPointerUp={handleActivate}
      onClick={handleActivate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        absolute cursor-pointer 
        focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:ring-offset-2 
        rounded-full will-change-transform
        transition-none
        ${isClicked ? "animate-gnome-click" : "animate-gnome-float"}
      `}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        pointerEvents: isClicked ? "none" : "auto",
        transform: isClicked 
          ? "scale(1.15) translateY(-20px)" 
          : isHovered 
            ? "scale(1.08)" 
            : "scale(1)",
        transition: isClicked 
          ? "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" 
          : "left 0.6s cubic-bezier(0.4, 0, 0.2, 1), top 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease-out",
        filter: isClicked
          ? "drop-shadow(0 0 30px rgba(255, 215, 0, 0.9)) brightness(1.2)"
          : isHovered
            ? "drop-shadow(0 15px 35px rgba(0, 0, 0, 0.4)) brightness(1.05)"
            : "drop-shadow(0 10px 25px rgba(0, 0, 0, 0.35))",
        // Larger touch target on mobile
        padding: isMobile ? "8px" : "4px",
        margin: isMobile ? "-8px" : "-4px",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        opacity: imageLoaded ? 1 : 0,
      }}
      aria-label={`Гномик ${id + 1}`}
      disabled={isClicked}
    >
      {/* Glow effect behind gnome when hovered/clicked */}
      <div 
        className={`
          absolute inset-0 rounded-full 
          bg-gradient-radial from-yellow-400/30 via-yellow-400/10 to-transparent
          transition-opacity duration-300 ease-out
          ${isHovered || isClicked ? "opacity-100" : "opacity-0"}
        `}
        style={{
          transform: "scale(1.5)",
          filter: "blur(10px)",
        }}
      />
      
      {/* PNG Gnome Image */}
      <Image
        src={imageSrc}
        alt={`Гномик ${id + 1}`}
        width={size.width}
        height={size.height}
        className="object-contain relative z-10 select-none pointer-events-none"
        style={{
          imageRendering: "auto",
          // Smooth scaling for retina displays
          transform: "translateZ(0)",
        }}
        onLoad={() => setImageLoaded(true)}
        priority={true}
        draggable={false}
      />
      
      {/* Sparkle effect on click */}
      {isClicked && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-sparkle-burst"
              style={{
                left: "50%",
                top: "50%",
                animationDelay: `${i * 0.05}s`,
                transform: `rotate(${i * 60}deg) translateY(-30px)`,
              }}
            />
          ))}
        </div>
      )}
    </button>
  )
}
