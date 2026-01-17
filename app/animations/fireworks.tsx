"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"

export interface FireworksHandle {
  launch: (x: number, y: number, count?: number) => void
  clear: () => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  decay: number
  size: number
  color: string
  trail: { x: number; y: number }[]
}

interface FireworksProps {
  className?: string
  isMobile?: boolean
  motionScale?: number
}

const COLORS = ["#fef3c7", "#fbbf24", "#f87171", "#fb7185", "#a5b4fc", "#7dd3fc", "#6ee7b7"]
const GRAVITY = 0.06
const DRAG = 0.985
const TRAIL_LENGTH = 5

export const Fireworks = forwardRef<FireworksHandle, FireworksProps>(
  ({ className, isMobile = false, motionScale = 1 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationFrameRef = useRef<number | null>(null)
    const lastTimeRef = useRef<number>(0)
    const particlesRef = useRef<Particle[]>([])
    const sizeRef = useRef({ width: 0, height: 0 })

    const ensureAnimation = () => {
      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    const spawnParticles = (x: number, y: number, count: number) => {
      const finalCount = Math.max(12, Math.round(count * motionScale))
      const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)]

      for (let i = 0; i < finalCount; i += 1) {
        const angle = (Math.PI * 2 * i) / finalCount + (Math.random() - 0.5) * 0.3
        const speed = 2.5 + Math.random() * 3.5
        const color = Math.random() > 0.65 ? COLORS[Math.floor(Math.random() * COLORS.length)] : baseColor

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.012 + Math.random() * 0.01,
          size: 1.5 + Math.random() * 2.8,
          color,
          trail: [],
        })
      }
    }

    useImperativeHandle(ref, () => ({
      launch: (x: number, y: number, count: number = 44) => {
        spawnParticles(x, y, count)
        ensureAnimation()
      },
      clear: () => {
        particlesRef.current = []
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext("2d")
          ctx?.clearRect(0, 0, canvas.width, canvas.height)
        }
      },
    }))

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

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
    }, [isMobile])

    const animate = (time: number) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!canvas || !ctx) return

      // Delta-based animation keeps motion smooth across frame rates.
      const delta = Math.min((time - (lastTimeRef.current || time)) / 16.67, 2)
      lastTimeRef.current = time

      const { width, height } = sizeRef.current
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = "lighter"

      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.life -= particle.decay * delta
        if (particle.life <= 0) return false

        particle.vy += GRAVITY * delta
        particle.vx *= Math.pow(DRAG, delta)
        particle.vy *= Math.pow(DRAG, delta)
        particle.x += particle.vx * delta * (isMobile ? 0.9 : 1)
        particle.y += particle.vy * delta * (isMobile ? 0.9 : 1)

        particle.trail.push({ x: particle.x, y: particle.y })
        if (particle.trail.length > TRAIL_LENGTH) {
          particle.trail.shift()
        }

        const alpha = Math.max(particle.life, 0)

        ctx.save()
        if (particle.trail.length > 1) {
          ctx.globalAlpha = alpha * 0.35
          ctx.strokeStyle = particle.color
          ctx.lineWidth = particle.size * 0.6
          ctx.lineCap = "round"
          ctx.beginPath()
          ctx.moveTo(particle.trail[0].x, particle.trail[0].y)
          for (let i = 1; i < particle.trail.length; i += 1) {
            ctx.lineTo(particle.trail[i].x, particle.trail[i].y)
          }
          ctx.stroke()
        }

        ctx.globalAlpha = alpha
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
        return true
      })

      ctx.globalCompositeOperation = "source-over"

      if (particlesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        animationFrameRef.current = null
      }
    }

    return <canvas ref={canvasRef} className={`fireworks ${className ?? ""}`} />
  }
)

Fireworks.displayName = "Fireworks"
