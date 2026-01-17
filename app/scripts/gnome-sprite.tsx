"use client"

import Image from "next/image"
import { useEffect, useRef, useState, type CSSProperties } from "react"

interface GnomeSpriteProps {
  id: number
  src: string
  x: number
  y: number
  width: number
  height: number
  floatDelay: number
  floatDuration: number
  tilt: number
  isVisible: boolean
  prefersReducedMotion: boolean
  onClick: (centerX: number, centerY: number, id: number) => void
}

const BOUNCE_DURATION = 520
const STARS_DURATION = 800
const TRAIL_DURATION = 1500

interface Star {
  id: number
  angle: number
  distance: number
  size: number
  rotation: number
}

interface TrailStar {
  id: string
  x: number
  y: number
  delay: number
  size: number
}

export const GnomeSprite = ({
  id,
  src,
  x,
  y,
  width,
  height,
  floatDelay,
  floatDuration,
  tilt,
  isVisible,
  prefersReducedMotion,
  onClick,
}: GnomeSpriteProps) => {
  const [isBouncing, setIsBouncing] = useState(false)
  const [showStars, setShowStars] = useState(false)
  const [stars, setStars] = useState<Star[]>([])
  const [trailStars, setTrailStars] = useState<TrailStar[]>([])
  const bounceTimeoutRef = useRef<number | null>(null)
  const starsTimeoutRef = useRef<number | null>(null)
  const trailTimeoutRef = useRef<number | null>(null)
  const prevPositionRef = useRef({ x, y })

  useEffect(() => {
    return () => {
      if (bounceTimeoutRef.current) {
        window.clearTimeout(bounceTimeoutRef.current)
      }
      if (starsTimeoutRef.current) {
        window.clearTimeout(starsTimeoutRef.current)
      }
      if (trailTimeoutRef.current) {
        window.clearTimeout(trailTimeoutRef.current)
      }
    }
  }, [])

  // Отслеживаем изменение позиции и создаём след
  useEffect(() => {
    const prevX = prevPositionRef.current.x
    const prevY = prevPositionRef.current.y

    if (prevX !== x || prevY !== y) {
      // Гномик переместился - создаём след
      const dx = x - prevX
      const dy = y - prevY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const steps = Math.min(Math.floor(distance / 30), 8) // Максимум 8 звёздочек в следе

      if (steps > 0) {
        const newTrail: TrailStar[] = []
        for (let i = 0; i < steps; i++) {
          const progress = (i + 1) / (steps + 1)
          newTrail.push({
            id: `${id}-${Date.now()}-${i}`,
            x: prevX + dx * progress + width / 2,
            y: prevY + dy * progress + height / 2,
            delay: i * 50,
            size: 14 + Math.random() * 6,
          })
        }
        setTrailStars(newTrail)

        if (trailTimeoutRef.current) {
          window.clearTimeout(trailTimeoutRef.current)
        }
        trailTimeoutRef.current = window.setTimeout(() => {
          setTrailStars([])
        }, TRAIL_DURATION)
      }

      prevPositionRef.current = { x, y }
    }
  }, [x, y, width, height, id])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (isBouncing) return

    setIsBouncing(true)
    
    // Создаём звёздочки
    const starCount = 5
    const newStars: Star[] = Array.from({ length: starCount }, (_, i) => ({
      id: i,
      angle: (Math.PI * 2 * i) / starCount + Math.random() * 0.3,
      distance: 40 + Math.random() * 20,
      size: 12 + Math.random() * 8,
      rotation: Math.random() * 360,
    }))
    setStars(newStars)
    setShowStars(true)

    onClick(x + width / 2, y + height / 2, id)

    if (bounceTimeoutRef.current) {
      window.clearTimeout(bounceTimeoutRef.current)
    }
    if (starsTimeoutRef.current) {
      window.clearTimeout(starsTimeoutRef.current)
    }

    bounceTimeoutRef.current = window.setTimeout(() => {
      setIsBouncing(false)
    }, BOUNCE_DURATION)

    starsTimeoutRef.current = window.setTimeout(() => {
      setShowStars(false)
    }, STARS_DURATION)
  }

  const spriteClass = prefersReducedMotion
    ? "gnome__sprite"
    : isBouncing
      ? "gnome__sprite gnome__sprite--bounce"
      : "gnome__sprite gnome__sprite--float"

  const style = {
    transform: `translate3d(${x}px, ${y}px, 0)`,
    width: `${width}px`,
    height: `${height}px`,
    ["--float-delay" as string]: `${floatDelay}s`,
    ["--float-duration" as string]: `${floatDuration}s`,
    ["--float-rotate" as string]: `${tilt}deg`,
    ["--float-rotate-alt" as string]: `${-tilt}deg`,
  } as CSSProperties

  const buttonClassName = isVisible ? "gnome" : "gnome gnome--hidden"

  return (
    <>
      {/* След из звёздочек */}
      {trailStars.map((trailStar) => (
        <div
          key={trailStar.id}
          className="gnome__trail-star"
          style={{
            left: `${trailStar.x}px`,
            top: `${trailStar.y}px`,
            fontSize: `${trailStar.size}px`,
            animationDelay: `${trailStar.delay}ms`,
          }}
        >
          ✨
        </div>
      ))}

      <button
        type="button"
        className={buttonClassName}
        onClick={handleClick}
        style={style}
        aria-label={`Гном ${id + 1}`}
      >
        <span className={spriteClass}>
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 768px) 120px, 160px"
            priority
            className="gnome__image"
          />
        </span>
        {showStars && (
          <div className="gnome__stars">
            {stars.map((star) => (
              <div
                key={star.id}
                className="gnome__star"
                style={{
                  // Pre-calculate cos/sin for browser compatibility (CSS cos/sin not supported in Safari <15.4)
                  "--star-cos": Math.cos(star.angle),
                  "--star-sin": Math.sin(star.angle),
                  "--star-distance": `${star.distance}px`,
                  "--star-size": `${star.size}px`,
                  "--star-rotation": `${star.rotation}deg`,
                } as CSSProperties}
              >
                ✨
              </div>
            ))}
          </div>
        )}
      </button>
    </>
  )
}
