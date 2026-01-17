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
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/f6222dd9-f5c7-4c16-892a-92bc4115664b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'gnome-sprite.tsx:48',message:'gnome sprite clicked',data:{id,x,y,width,height,calculatedCenterX:x+width/2,calculatedCenterY:y+height/2,isBouncing},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (isBouncing) return

    setIsBouncing(true)
    onClick(x + width / 2, y + height / 2, id)

    if (bounceTimeoutRef.current) {
      window.clearTimeout(bounceTimeoutRef.current)
    }

    bounceTimeoutRef.current = window.setTimeout(() => {
      setIsBouncing(false)
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/f6222dd9-f5c7-4c16-892a-92bc4115664b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'gnome-sprite.tsx:60',message:'bounce timeout completed',data:{id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
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
