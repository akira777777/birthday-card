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
  trail: { x: number; y: number; alpha: number }[]
  type: "main" | "sparkle" | "trail"
}

interface Firework {
  x: number
  y: number
  particles: Particle[]
}

// Vibrant celebration colors
const colors = [
  "#FF6B6B", // Coral red
  "#4ECDC4", // Teal
  "#FFD93D", // Golden yellow
  "#6BCF7F", // Green
  "#FF9FF3", // Pink
  "#54A0FF", // Blue
  "#5F27CD", // Purple
  "#FF9F43", // Orange
  "#00D2D3", // Cyan
  "#F38181", // Salmon
  "#A8E6CF", // Mint
  "#FDCB6E", // Warm yellow
]

export const Fireworks = forwardRef<FireworksHandle, { className?: string; isMobile?: boolean }>(
  ({ className, isMobile = false }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationFrameRef = useRef<number>()
    const fireworksRef = useRef<Firework[]>([])
    const isAnimatingRef = useRef(false)

    useImperativeHandle(ref, () => ({
      launch: (x: number, y: number, count: number = 60) => {
        const particles: Particle[] = []
        const baseColor = colors[Math.floor(Math.random() * colors.length)]
        const secondaryColor = colors[Math.floor(Math.random() * colors.length)]

        // Main explosion particles with varied properties
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3
          const speed = 3 + Math.random() * 5
          const useSecondary = Math.random() > 0.6
          
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: useSecondary ? secondaryColor : baseColor,
            life: 1,
            maxLife: 80 + Math.random() * 40,
            size: 2.5 + Math.random() * 3.5,
            trail: [],
            type: "main",
          })
        }

        // Extra sparkle particles for shimmer effect
        const sparkleCount = Math.floor(count / 3)
        for (let i = 0; i < sparkleCount; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = 1.5 + Math.random() * 3.5

          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: "#FFFFFF",
            life: 1,
            maxLife: 50 + Math.random() * 30,
            size: 1 + Math.random() * 2,
            trail: [],
            type: "sparkle",
          })
        }

        // Trailing particles that appear after main explosion
        const trailCount = Math.floor(count / 5)
        for (let i = 0; i < trailCount; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = 0.8 + Math.random() * 2

          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1,
            maxLife: 100 + Math.random() * 50,
            size: 1.5 + Math.random() * 2,
            trail: [],
            type: "trail",
          })
        }

        fireworksRef.current.push({ x, y, particles })
        
        // Start animation if not already running
        if (!isAnimatingRef.current) {
          isAnimatingRef.current = true
          animate()
        }
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

    const animate = () => {
      const canvas = canvasRef.current
      if (!canvas) {
        isAnimatingRef.current = false
        return
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        isAnimatingRef.current = false
        return
      }

      const rect = canvas.getBoundingClientRect()

      // Clear with trail fade effect
      ctx.fillStyle = isMobile ? "rgba(0, 0, 0, 0.18)" : "rgba(0, 0, 0, 0.12)"
      ctx.fillRect(0, 0, rect.width, rect.height)

      fireworksRef.current = fireworksRef.current.filter((firework) => {
        let hasActiveParticles = false

        firework.particles.forEach((particle) => {
          if (particle.life > 0) {
            hasActiveParticles = true

            // Store trail position with alpha
            if (particle.trail.length < (isMobile ? 4 : 6)) {
              particle.trail.push({ x: particle.x, y: particle.y, alpha: particle.life })
            } else {
              particle.trail.shift()
              particle.trail.push({ x: particle.x, y: particle.y, alpha: particle.life })
            }

            // Update position
            particle.x += particle.vx
            particle.y += particle.vy

            // Apply gravity (less for trail particles for floatier effect)
            const gravityMultiplier = particle.type === "trail" ? 0.5 : 1
            particle.vy += 0.06 * gravityMultiplier

            // Air resistance
            particle.vx *= 0.988
            particle.vy *= 0.988

            // Update life
            particle.life -= 1 / particle.maxLife

            const alpha = Math.pow(particle.life, 0.8) // Ease out fade
            const particleSize = particle.size * (0.5 + particle.life * 0.5)

            // Draw particle based on type and device
            if (isMobile) {
              // Simplified rendering for mobile
              drawParticleMobile(ctx, particle, alpha, particleSize)
            } else {
              // Full rendering for desktop
              drawParticleDesktop(ctx, particle, alpha, particleSize)
            }
          }
        })

        return hasActiveParticles
      })

      ctx.globalAlpha = 1

      if (fireworksRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        isAnimatingRef.current = false
      }
    }

    // Simplified particle rendering for mobile
    const drawParticleMobile = (
      ctx: CanvasRenderingContext2D,
      particle: Particle,
      alpha: number,
      size: number
    ) => {
      // Draw trail
      if (particle.trail.length > 1 && particle.type !== "sparkle") {
        ctx.save()
        ctx.globalAlpha = alpha * 0.25
        ctx.strokeStyle = particle.color
        ctx.lineWidth = size * 0.4
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y)
        for (let i = 1; i < particle.trail.length; i++) {
          ctx.lineTo(particle.trail[i].x, particle.trail[i].y)
        }
        ctx.stroke()
        ctx.restore()
      }

      // Main particle
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    // Full particle rendering for desktop
    const drawParticleDesktop = (
      ctx: CanvasRenderingContext2D,
      particle: Particle,
      alpha: number,
      size: number
    ) => {
      const glowSize = size * 2.5

      // Draw gradient trail
      if (particle.trail.length > 1) {
        ctx.save()
        for (let i = 1; i < particle.trail.length; i++) {
          const trailAlpha = (i / particle.trail.length) * alpha * 0.4
          ctx.globalAlpha = trailAlpha
          ctx.strokeStyle = particle.color
          ctx.lineWidth = size * (i / particle.trail.length) * 0.6
          ctx.lineCap = "round"
          ctx.beginPath()
          ctx.moveTo(particle.trail[i - 1].x, particle.trail[i - 1].y)
          ctx.lineTo(particle.trail[i].x, particle.trail[i].y)
          ctx.stroke()
        }
        ctx.restore()
      }

      ctx.save()

      // Outer glow
      ctx.globalAlpha = alpha * 0.15
      ctx.shadowBlur = 20
      ctx.shadowColor = particle.color
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2)
      ctx.fill()

      // Middle glow
      ctx.globalAlpha = alpha * 0.4
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, glowSize * 0.6, 0, Math.PI * 2)
      ctx.fill()

      // Main particle body
      ctx.globalAlpha = alpha
      ctx.shadowBlur = 8
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
      ctx.fill()

      // Inner bright core
      if (particle.type !== "trail") {
        ctx.globalAlpha = alpha * 0.9
        ctx.shadowBlur = 6
        ctx.shadowColor = "white"
        ctx.fillStyle = "white"
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, size * 0.35, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const resize = () => {
        const dpr = isMobile 
          ? Math.min(window.devicePixelRatio || 1, 1.5) 
          : Math.min(window.devicePixelRatio || 1, 2)
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

      return () => {
        window.removeEventListener("resize", handleResize)
        if (resizeTimeout) clearTimeout(resizeTimeout)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }, [isMobile])

    return (
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none z-10 ${className || ""}`}
      />
    )
  }
)

Fireworks.displayName = "Fireworks"
