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
  const bounceTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (bounceTimeoutRef.current) {
        window.clearTimeout(bounceTimeoutRef.current)
      }
    }
  }, [])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (isBouncing) return

    setIsBouncing(true)
    onClick(x + width / 2, y + height / 2, id)

    if (bounceTimeoutRef.current) {
      window.clearTimeout(bounceTimeoutRef.current)
    }

    bounceTimeoutRef.current = window.setTimeout(() => {
      setIsBouncing(false)
    }, BOUNCE_DURATION)
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
    </button>
  )
}
