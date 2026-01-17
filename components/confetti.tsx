"use client"

import { useEffect, useRef, useState } from "react"

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
  life: number
  maxLife: number
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

  useEffect(() => {
    if (active && !shouldRender) {
      setShouldRender(true)

      // Initialize confetti pieces
      const pieces: ConfettiPiece[] = []
      const canvas = canvasRef.current
      if (!canvas) return

      // Reduced count on mobile for better performance
      const count = isMobile ? 80 : 150
      for (let i = 0; i < count; i++) {
        pieces.push({
          id: i,
          x: Math.random() * canvas.width,
          y: -10 - Math.random() * 100,
          vx: (Math.random() - 0.5) * 2,
          vy: 2 + Math.random() * 4,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          size: 4 + Math.random() * 8,
          life: 1,
          maxLife: 200 + Math.random() * 100,
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

    const resize = () => {
      // Lower DPR on mobile for better performance
      const dpr = isMobile ? Math.min(window.devicePixelRatio || 1, 1.5) : window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }

    resize()

    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(resize, 250)
    }

    window.addEventListener("resize", handleResize)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      confettiPiecesRef.current = confettiPiecesRef.current.filter((piece) => {
        if (piece.life <= 0) return false

        // Update position
        piece.x += piece.vx
        piece.y += piece.vy
        piece.rotation += piece.rotationSpeed

        // Apply gravity
        piece.vy += 0.15

        // Air resistance
        piece.vx *= 0.98
        piece.vy *= 0.98

        // Update life
        piece.life -= 1 / piece.maxLife

        // Draw confetti piece
        const alpha = piece.life
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(piece.x, piece.y)
        ctx.rotate(piece.rotation)

        // Draw different shapes for variety
        if (Math.random() > 0.5) {
          // Rectangle
          ctx.fillStyle = piece.color
          ctx.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2)
        } else {
          // Circle
          ctx.fillStyle = piece.color
          ctx.beginPath()
          ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }

        // Add sparkle effect
        if (Math.random() > 0.7 && alpha > 0.5) {
          ctx.fillStyle = "#FFFFFF"
          ctx.beginPath()
          ctx.arc(0, 0, 1, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()

        return true
      })

      if (confettiPiecesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else if (onComplete) {
        onComplete()
      }
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      if (resizeTimeout) clearTimeout(resizeTimeout)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [shouldRender, onComplete, isMobile])

  if (!shouldRender) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
    />
  )
}
