<<<<<<< Current (Your changes)
=======
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
  color: string
  life: number
  maxLife: number
  size: number
  trail: { x: number; y: number }[]
}

interface Firework {
  x: number
  y: number
  particles: Particle[]
}

const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFD93D",
  "#6BCF7F",
  "#A8E6CF",
  "#95E1D3",
  "#F38181",
  "#FFA07A",
  "#C7CEEA",
  "#FF9FF3",
  "#54A0FF",
  "#5F27CD",
]

export const Fireworks = forwardRef<FireworksHandle, { className?: string }>(({ className }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const fireworksRef = useRef<Firework[]>([])
  const canvasSizeRef = useRef({ width: 0, height: 0 })

  useImperativeHandle(ref, () => ({
    launch: (x: number, y: number, count: number = 50) => {
      const particles: Particle[] = []
      const baseColor = colors[Math.floor(Math.random() * colors.length)]

      // Create particles with varied properties for more interesting effects
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
        const speed = 2 + Math.random() * 6
        const colorIndex = Math.random() > 0.7 ? Math.floor(Math.random() * colors.length) : colors.indexOf(baseColor)

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[colorIndex >= 0 ? colorIndex : 0],
          life: 1,
          maxLife: 70 + Math.random() * 50,
          size: 2 + Math.random() * 4,
          trail: [],
        })
      }

      // Add extra sparkle particles
      for (let i = 0; i < Math.floor(count / 4); i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1 + Math.random() * 3

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: "#FFFFFF",
          life: 1,
          maxLife: 40 + Math.random() * 30,
          size: 1 + Math.random() * 2,
          trail: [],
        })
      }

      fireworksRef.current.push({ x, y, particles })
    },
    clear: () => {
      fireworksRef.current = []
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) // Cap DPR for performance
      const rect = canvas.getBoundingClientRect()
      canvasSizeRef.current = { width: rect.width, height: rect.height }
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
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
      // Clear with fade effect for trail
      const { width, height } = canvasSizeRef.current
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)"
      ctx.fillRect(0, 0, width, height)

      fireworksRef.current = fireworksRef.current.filter((firework) => {
        let hasActiveParticles = false

        firework.particles.forEach((particle) => {
          if (particle.life > 0) {
            hasActiveParticles = true

            // Store trail position
            if (particle.trail.length < 5) {
              particle.trail.push({ x: particle.x, y: particle.y })
            } else {
              particle.trail.shift()
              particle.trail.push({ x: particle.x, y: particle.y })
            }

            // Update position
            particle.x += particle.vx
            particle.y += particle.vy

            // Apply gravity
            particle.vy += 0.08

            // Friction
            particle.vx *= 0.985
            particle.vy *= 0.985

            // Update life
            particle.life -= 1 / particle.maxLife

            const alpha = particle.life
            const glowSize = particle.size * alpha * 3
            const particleSize = particle.size * alpha

            // Draw trail
            if (particle.trail.length > 1) {
              ctx.save()
              ctx.globalAlpha = alpha * 0.3
              ctx.strokeStyle = particle.color
              ctx.lineWidth = particleSize * 0.5
              ctx.lineCap = "round"
              ctx.beginPath()
              ctx.moveTo(particle.trail[0].x, particle.trail[0].y)
              for (let i = 1; i < particle.trail.length; i++) {
                ctx.lineTo(particle.trail[i].x, particle.trail[i].y)
              }
              ctx.stroke()
              ctx.restore()
            }

            // Outer glow
            ctx.save()
            ctx.globalAlpha = alpha * 0.15
            ctx.shadowBlur = 25
            ctx.shadowColor = particle.color
            ctx.fillStyle = particle.color
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, glowSize * 1.5, 0, Math.PI * 2)
            ctx.fill()

            // Middle glow
            ctx.globalAlpha = alpha * 0.4
            ctx.shadowBlur = 15
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2)
            ctx.fill()

            // Main particle
            ctx.globalAlpha = alpha
            ctx.shadowBlur = 10
            ctx.fillStyle = particle.color
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2)
            ctx.fill()

            // Inner bright white core
            ctx.globalAlpha = alpha * 0.9
            ctx.shadowBlur = 8
            ctx.shadowColor = "white"
            ctx.fillStyle = "white"
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particleSize * 0.4, 0, Math.PI * 2)
            ctx.fill()

            ctx.restore()
          }
        })

        ctx.globalAlpha = 1
        return hasActiveParticles
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return <canvas ref={canvasRef} className={`fixed inset-0 pointer-events-none z-10 ${className || ""}`} />
})

Fireworks.displayName = "Fireworks"
>>>>>>> Incoming (Background Agent changes)
