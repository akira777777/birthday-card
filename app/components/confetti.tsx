"use client"

import { useEffect, useRef, useState, useCallback } from "react"

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
  shape: "rect" | "circle" | "star"
  wobble: number
  wobbleSpeed: number
}

interface ConfettiProps {
  active: boolean
  onComplete?: () => void
  isMobile?: boolean
}

// Festive confetti colors
const confettiColors = [
  "#FF6B6B", "#4ECDC4", "#FFD93D", "#6BCF7F", "#A8E6CF",
  "#95E1D3", "#F38181", "#FFA07A", "#C7CEEA", "#FF9FF3",
  "#54A0FF", "#5F27CD", "#00D2D3", "#FF9F43", "#FDCB6E",
  "#E17055", "#00CEC9", "#FAB1A0", "#74B9FF", "#A29BFE"
]

export function Confetti({ active, onComplete, isMobile = false }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const confettiPiecesRef = useRef<ConfettiPiece[]>([])
  const [shouldRender, setShouldRender] = useState(false)
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSpawnRef = useRef(0)
  const isAnimatingRef = useRef(false)

  // Create a single confetti piece
  const createConfettiPiece = useCallback((id: number, canvasWidth: number): ConfettiPiece => {
    const shapes: ("rect" | "circle" | "star")[] = ["rect", "circle", "star"]
    return {
      id,
      x: Math.random() * canvasWidth,
      y: -15 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      size: isMobile ? 5 + Math.random() * 7 : 6 + Math.random() * 9,
      life: 1,
      maxLife: 180 + Math.random() * 120,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.03 + Math.random() * 0.04,
    }
  }, [isMobile])

  useEffect(() => {
    if (active && !shouldRender) {
      setShouldRender(true)

      // Initialize confetti pieces
      const canvas = canvasRef.current
      if (!canvas) return

      const pieces: ConfettiPiece[] = []
      const initialCount = isMobile ? 60 : 100

      for (let i = 0; i < initialCount; i++) {
        pieces.push(createConfettiPiece(i, canvas.width))
      }
      confettiPiecesRef.current = pieces
      lastSpawnRef.current = Date.now()
      
    } else if (!active && shouldRender) {
      // Start fade out
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
      fadeTimeoutRef.current = setTimeout(() => {
        setShouldRender(false)
        confettiPiecesRef.current = []
        fadeTimeoutRef.current = null
        if (onComplete) onComplete()
      }, 2500)
    }

    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
        fadeTimeoutRef.current = null
      }
    }
  }, [active, shouldRender, onComplete, isMobile, createConfettiPiece])

  useEffect(() => {
    if (!shouldRender) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
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
      resizeTimeout = setTimeout(resize, 200)
    }

    window.addEventListener("resize", handleResize)

    // Draw star shape
    const drawStar = (x: number, y: number, size: number) => {
      const spikes = 5
      const outerRadius = size
      const innerRadius = size * 0.4

      ctx.beginPath()
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / spikes - Math.PI / 2
        const px = x + Math.cos(angle) * radius
        const py = y + Math.sin(angle) * radius
        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
      ctx.closePath()
    }

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Spawn new confetti periodically while active
      if (active) {
        const now = Date.now()
        const spawnInterval = isMobile ? 150 : 80
        if (now - lastSpawnRef.current > spawnInterval && confettiPiecesRef.current.length < (isMobile ? 100 : 180)) {
          const newCount = isMobile ? 2 : 4
          for (let i = 0; i < newCount; i++) {
            confettiPiecesRef.current.push(
              createConfettiPiece(Date.now() + i, rect.width)
            )
          }
          lastSpawnRef.current = now
        }
      }

      confettiPiecesRef.current = confettiPiecesRef.current.filter((piece) => {
        if (piece.life <= 0 || piece.y > rect.height + 50) return false

        // Update wobble
        piece.wobble += piece.wobbleSpeed
        const wobbleX = Math.sin(piece.wobble) * 1.5

        // Update position
        piece.x += piece.vx + wobbleX
        piece.y += piece.vy
        piece.rotation += piece.rotationSpeed

        // Apply gravity
        piece.vy += 0.08

        // Air resistance
        piece.vx *= 0.99
        piece.vy *= 0.995

        // Update life (slow fade at the end)
        piece.life -= 1 / piece.maxLife

        // Draw confetti piece
        const alpha = piece.life > 0.3 ? 1 : piece.life / 0.3
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(piece.x, piece.y)
        ctx.rotate(piece.rotation)

        ctx.fillStyle = piece.color

        switch (piece.shape) {
          case "rect":
            // Draw rectangle with slight 3D effect
            ctx.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2)
            // Highlight
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
            ctx.fillRect(-piece.size / 2, -piece.size / 4, piece.size / 3, piece.size / 2)
            break

          case "circle":
            ctx.beginPath()
            ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2)
            ctx.fill()
            // Highlight
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
            ctx.beginPath()
            ctx.arc(-piece.size / 6, -piece.size / 6, piece.size / 4, 0, Math.PI * 2)
            ctx.fill()
            break

          case "star":
            drawStar(0, 0, piece.size / 2)
            ctx.fill()
            break
        }

        ctx.restore()

        return true
      })

      if (confettiPiecesRef.current.length > 0 || active) {
        animationFrameRef.current = requestAnimationFrame(animate)
        isAnimatingRef.current = true
      } else {
        isAnimatingRef.current = false
        if (onComplete) onComplete()
      }
    }

    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true
      animate()
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      if (resizeTimeout) clearTimeout(resizeTimeout)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      isAnimatingRef.current = false
    }
  }, [shouldRender, active, onComplete, isMobile, createConfettiPiece])

  if (!shouldRender) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
    />
  )
}
