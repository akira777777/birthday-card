"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface ConfettiPiece {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  color: string
  size: number
  life: number // remaining seconds
  maxLife: number // seconds
  shape: "rect" | "circle"
}

interface ConfettiProps {
  active: boolean
  onComplete?: () => void
  isMobile?: boolean
}

const confettiColors = [
  "#FF6B6B", "#4ECDC4", "#FFD93D", "#6BCF7F", "#A8E6CF",
  "#95E1D3", "#F38181", "#FFA07A", "#C7CEEA", "#FF9FF3",
  "#54A0FF", "#5F27CD", "#00D2D3", "#FF9F43", "#FF6348"
]

export function Confetti({ active, onComplete, isMobile = false }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const confettiPiecesRef = useRef<ConfettiPiece[]>([])
  const [shouldRender, setShouldRender] = useState(false)
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTimeRef = useRef<number>(0)
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 })

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const dpr = isMobile ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    sizeRef.current = { w: rect.width, h: rect.height }
  }, [isMobile])

  useEffect(() => {
    if (active && !shouldRender) {
      setShouldRender(true)

      // Initialize confetti pieces
      const pieces: ConfettiPiece[] = []
      const canvas = canvasRef.current
      if (!canvas) return
      // Ensure canvas is sized before seeding positions.
      resize()
      const { w } = sizeRef.current

      // Reduced count on mobile for better performance
      const count = isMobile ? 70 : 130
      for (let i = 0; i < count; i++) {
        const shape: ConfettiPiece["shape"] = Math.random() > 0.45 ? "rect" : "circle"
        pieces.push({
          id: i,
          x: Math.random() * w,
          y: -10 - Math.random() * 100,
          vx: (Math.random() - 0.5) * 80,
          vy: 140 + Math.random() * 220,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 3.5,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          size: 4 + Math.random() * 9,
          life: 3.8 + Math.random() * 1.8,
          maxLife: 3.8 + Math.random() * 1.8,
          shape,
        })
      }
      confettiPiecesRef.current = pieces
    } else if (!active && shouldRender) {
      // Fade out confetti
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
      fadeTimeoutRef.current = setTimeout(() => {
        setShouldRender(false)
        confettiPiecesRef.current = []
        fadeTimeoutRef.current = null
        if (onComplete) onComplete()
      }, 2000)
    }

    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
        fadeTimeoutRef.current = null
      }
    }
  }, [active, shouldRender, onComplete, isMobile])

  useEffect(() => {
    if (!shouldRender) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    resize()

    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(resize, 250)
    }

    window.addEventListener("resize", handleResize)

    lastTimeRef.current = performance.now()

    const animate = (now: number) => {
      const dt = Math.min(0.033, Math.max(0.001, (now - lastTimeRef.current) / 1000))
      lastTimeRef.current = now
      const { w, h } = sizeRef.current
      ctx.clearRect(0, 0, w, h)

      confettiPiecesRef.current = confettiPiecesRef.current.filter((piece) => {
        if (piece.life <= 0) return false

        // Update (dt-based)
        const sway = Math.sin((piece.id + now * 0.001) * 0.9) * (isMobile ? 18 : 26)
        piece.x += (piece.vx + sway) * dt
        piece.y += piece.vy * dt
        piece.rotation += piece.rotationSpeed * dt

        // Apply gravity
        piece.vy += 420 * dt

        // Air resistance
        const drag = Math.pow(0.985, dt * 60)
        piece.vx *= drag
        piece.vy *= drag

        // Update life
        piece.life -= dt

        // Draw confetti piece
        const t = 1 - piece.life / piece.maxLife
        const alpha = Math.max(0, Math.min(1, 1 - t))
        ctx.save()
        // Slight ease-out to make the fade feel softer.
        ctx.globalAlpha = alpha * alpha
        ctx.translate(piece.x, piece.y)
        ctx.rotate(piece.rotation)

        ctx.fillStyle = piece.color
        if (piece.shape === "rect") {
          ctx.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()

        // Recycle when out of bounds (keeps FPS stable and avoids huge offscreen arrays).
        if (piece.y > h + 40) piece.life = 0
        return true
      })

      if (confettiPiecesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else if (onComplete) {
        onComplete()
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (resizeTimeout) clearTimeout(resizeTimeout)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [shouldRender, onComplete, isMobile, resize])

  if (!shouldRender) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
    />
  )
}
