"use client"

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react"

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
  life: number // remaining seconds
  maxLife: number // seconds
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

export const Fireworks = forwardRef<FireworksHandle, { className?: string; isMobile?: boolean }>(({ className, isMobile = false }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const fireworksRef = useRef<Firework[]>([])
  const runningRef = useRef(false)
  const lastTimeRef = useRef<number>(0)
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 })

  const start = useCallback(() => {
    if (runningRef.current) return
    runningRef.current = true
    lastTimeRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stop = useCallback(() => {
    runningRef.current = false
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = undefined
    }
  }, [])

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    // Lower DPR on mobile for better performance
    const dpr = isMobile ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Important: reset transform to avoid cumulative scaling on resize.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    sizeRef.current = { w: rect.width, h: rect.height }
  }, [isMobile])

  const tick = useCallback((now: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { w, h } = sizeRef.current
    const dt = Math.min(0.033, Math.max(0.001, (now - lastTimeRef.current) / 1000))
    lastTimeRef.current = now

    // Fade the previous frame to create trails.
    ctx.save()
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = isMobile ? 0.22 : 0.18
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, w, h)
    ctx.restore()

    // Update & draw particles.
    fireworksRef.current = fireworksRef.current
      .map((fw) => {
        const particles = fw.particles
          .map((p) => {
            // Store trail (fixed size, no extra allocations).
            if (p.trail.length < 4) p.trail.push({ x: p.x, y: p.y })
            else {
              p.trail.shift()
              p.trail.push({ x: p.x, y: p.y })
            }

            // Physics (dt-based).
            p.x += p.vx * dt
            p.y += p.vy * dt
            p.vy += 280 * dt // gravity px/s^2
            const drag = Math.pow(0.985, dt * 60)
            p.vx *= drag
            p.vy *= drag

            p.life -= dt
            return p
          })
          .filter((p) => p.life > 0)

        return { ...fw, particles }
      })
      .filter((fw) => fw.particles.length > 0)

    for (const fw of fireworksRef.current) {
      for (const p of fw.particles) {
        const t = 1 - p.life / p.maxLife
        const alpha = Math.max(0, Math.min(1, 1 - t))
        const size = p.size * (0.85 + (1 - t) * 0.25)

        // Trail
        if (p.trail.length > 1) {
          ctx.save()
          ctx.globalAlpha = alpha * (isMobile ? 0.18 : 0.28)
          ctx.strokeStyle = p.color
          ctx.lineWidth = Math.max(0.8, size * (isMobile ? 0.18 : 0.35))
          ctx.lineCap = "round"
          ctx.beginPath()
          ctx.moveTo(p.trail[0].x, p.trail[0].y)
          for (let i = 1; i < p.trail.length; i++) ctx.lineTo(p.trail[i].x, p.trail[i].y)
          ctx.stroke()
          ctx.restore()
        }

        // Particle (glow only on desktop)
        ctx.save()
        ctx.globalAlpha = alpha
        if (!isMobile) {
          ctx.shadowBlur = 16
          ctx.shadowColor = p.color
        }
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0.8, size), 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    if (fireworksRef.current.length === 0) {
      // Stop the RAF loop shortly after the last particles (saves CPU).
      stop()
      return
    }

    animationFrameRef.current = requestAnimationFrame(tick)
  }, [isMobile, stop])

  useImperativeHandle(ref, () => ({
    launch: (x: number, y: number, count: number = 50) => {
      const particles: Particle[] = []
      const baseColor = colors[Math.floor(Math.random() * colors.length)]

      // Create particles with varied properties for more interesting effects
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
        const speed = 120 + Math.random() * 280 // px/s
        const colorIndex = Math.random() > 0.7 ? Math.floor(Math.random() * colors.length) : colors.indexOf(baseColor)

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[colorIndex >= 0 ? colorIndex : 0],
          life: 0.9 + Math.random() * 0.65,
          maxLife: 0.9 + Math.random() * 0.65,
          size: 1.4 + Math.random() * 2.8,
          trail: [],
        })
      }

      // Add extra sparkle particles
      for (let i = 0; i < Math.floor(count / 4); i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 80 + Math.random() * 160

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: "#FFFFFF",
          life: 0.45 + Math.random() * 0.4,
          maxLife: 0.45 + Math.random() * 0.4,
          size: 0.9 + Math.random() * 1.4,
          trail: [],
        })
      }

      fireworksRef.current.push({ x, y, particles })
      start()
    },
    clear: () => {
      fireworksRef.current = []
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          const { w, h } = sizeRef.current
          ctx.clearRect(0, 0, w, h)
        }
      }
      stop()
    },
  }))

  useEffect(() => {
    resize()

    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(resize, 250)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      stop()
    }
  }, [resize, stop])

  return <canvas ref={canvasRef} className={`fixed inset-0 pointer-events-none z-10 ${className || ""}`} />
})

Fireworks.displayName = "Fireworks"

