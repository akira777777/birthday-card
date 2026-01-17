"use client"

import { useEffect, useRef, useState } from "react"

type ConfettiShape = "rect" | "circle" | "star" | "heart"

interface ConfettiPiece {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  size: number
  color: string
  life: number
  decay: number
  sway: number
  swaySpeed: number
  shape: ConfettiShape
}

interface ConfettiProps {
  active: boolean
  isMobile?: boolean
  motionScale?: number
  onComplete?: () => void
}

const COLORS = ["#f59e0b", "#fb7185", "#60a5fa", "#34d399", "#fbbf24", "#c084fc", "#f472b6", "#fde047", "#a78bfa"]
const SHAPES: ConfettiShape[] = ["rect", "circle", "star", "heart"]
const GRAVITY = 0.12

export const Confetti = ({ active, isMobile = false, motionScale = 1, onComplete }: ConfettiProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const piecesRef = useRef<ConfettiPiece[]>([])
  const sizeRef = useRef({ width: 0, height: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active) return
    setVisible(true)

    return () => {
      setVisible(false)
      piecesRef.current = []
    }
  }, [active])

  useEffect(() => {
    if (!visible) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { width, height }
    }

    resize()

    let resizeTimeout: number | null = null
    const handleResize = () => {
      if (resizeTimeout) window.clearTimeout(resizeTimeout)
      resizeTimeout = window.setTimeout(resize, 200)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (resizeTimeout) window.clearTimeout(resizeTimeout)
    }
  }, [visible, isMobile])

  useEffect(() => {
    if (!visible) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const { width, height } = sizeRef.current
    if (!width || !height) return
    const baseCount = isMobile ? 80 : 140
    const count = Math.max(40, Math.round(baseCount * motionScale))

    piecesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: -40 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 1.4,
      vy: 1.8 + Math.random() * 2.8,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      size: 6 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
      decay: 0.005 + Math.random() * 0.008,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.02 + Math.random() * 0.03,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    }))

    const animate = (time: number) => {
      // Delta-based updates keep the confetti flow consistent.
      const delta = Math.min((time - (lastTimeRef.current || time)) / 16.67, 2)
      lastTimeRef.current = time

      ctx.clearRect(0, 0, width, height)

      piecesRef.current = piecesRef.current.filter((piece) => {
        piece.life -= piece.decay * delta
        if (piece.life <= 0) return false

        piece.sway += piece.swaySpeed * delta
        piece.vy += GRAVITY * delta
        piece.x += (piece.vx + Math.sin(piece.sway) * 0.4) * delta
        piece.y += piece.vy * delta
        piece.rotation += piece.rotationSpeed * delta

        ctx.save()
        ctx.globalAlpha = Math.min(piece.life, 1)
        ctx.translate(piece.x, piece.y)
        ctx.rotate(piece.rotation)
        ctx.fillStyle = piece.color

        switch (piece.shape) {
          case "circle":
            ctx.beginPath()
            ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2)
            ctx.fill()
            break
          case "star":
            ctx.beginPath()
            for (let i = 0; i < 5; i++) {
              const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
              const radius = i % 2 === 0 ? piece.size / 2 : piece.size / 4
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius
              if (i === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
            ctx.closePath()
            ctx.fill()
            break
          case "heart":
            ctx.beginPath()
            const topCurveHeight = piece.size * 0.3
            ctx.moveTo(0, topCurveHeight)
            ctx.bezierCurveTo(0, 0, -piece.size / 2, 0, -piece.size / 2, topCurveHeight)
            ctx.bezierCurveTo(-piece.size / 2, piece.size * 0.5, 0, piece.size * 0.7, 0, piece.size)
            ctx.bezierCurveTo(0, piece.size * 0.7, piece.size / 2, piece.size * 0.5, piece.size / 2, topCurveHeight)
            ctx.bezierCurveTo(piece.size / 2, 0, 0, 0, 0, topCurveHeight)
            ctx.fill()
            break
          default: // rect
            ctx.fillRect(-piece.size / 2, -piece.size / 3, piece.size, piece.size * 0.6)
        }

        ctx.restore()

        return piece.y < height + 80
      })

      if (piecesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        animationFrameRef.current = null
        setVisible(false)
        onComplete?.()
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [visible, isMobile, motionScale, onComplete])

  if (!visible) return null

  return <canvas ref={canvasRef} className="confetti" />
}
