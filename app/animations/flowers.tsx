"use client"

import { useEffect, useRef } from "react"

interface FlowersProps {
  className?: string
}

interface Flower {
  x: number
  y: number
  size: number
  color: string
  petalColor: string
  rotation: number
  delay: number
}

const FLOWER_COLORS = [
  { center: "#fbbf24", petals: "#fef3c7" },
  { center: "#fb7185", petals: "#fce7f3" },
  { center: "#c084fc", petals: "#f3e8ff" },
  { center: "#60a5fa", petals: "#dbeafe" },
  { center: "#f59e0b", petals: "#fed7aa" },
]

export const Flowers = ({ className }: FlowersProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const flowersRef = useRef<Flower[]>([])
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Создаём цветы в углах открытки
      const isMobile = width < 768
      const flowerSize = isMobile ? 30 : 50
      const spacing = isMobile ? 40 : 70

      flowersRef.current = []

      // Левый верхний угол
      for (let i = 0; i < 3; i++) {
        const colorSet = FLOWER_COLORS[i % FLOWER_COLORS.length]
        flowersRef.current.push({
          x: spacing + i * (flowerSize + 10),
          y: spacing + (i % 2) * 20,
          size: flowerSize - i * 5,
          color: colorSet.center,
          petalColor: colorSet.petals,
          rotation: Math.random() * Math.PI * 2,
          delay: i * 0.15,
        })
      }

      // Правый верхний угол
      for (let i = 0; i < 3; i++) {
        const colorSet = FLOWER_COLORS[(i + 2) % FLOWER_COLORS.length]
        flowersRef.current.push({
          x: width - spacing - i * (flowerSize + 10),
          y: spacing + (i % 2) * 20,
          size: flowerSize - i * 5,
          color: colorSet.center,
          petalColor: colorSet.petals,
          rotation: Math.random() * Math.PI * 2,
          delay: i * 0.15 + 0.3,
        })
      }

      // Левый нижний угол
      for (let i = 0; i < 2; i++) {
        const colorSet = FLOWER_COLORS[(i + 3) % FLOWER_COLORS.length]
        flowersRef.current.push({
          x: spacing + i * (flowerSize + 15),
          y: height - spacing - (i % 2) * 15,
          size: flowerSize - i * 8,
          color: colorSet.center,
          petalColor: colorSet.petals,
          rotation: Math.random() * Math.PI * 2,
          delay: i * 0.15 + 0.6,
        })
      }

      // Правый нижний угол
      for (let i = 0; i < 2; i++) {
        const colorSet = FLOWER_COLORS[(i + 1) % FLOWER_COLORS.length]
        flowersRef.current.push({
          x: width - spacing - i * (flowerSize + 15),
          y: height - spacing - (i % 2) * 15,
          size: flowerSize - i * 8,
          color: colorSet.center,
          petalColor: colorSet.petals,
          rotation: Math.random() * Math.PI * 2,
          delay: i * 0.15 + 0.75,
        })
      }
    }

    resize()

    const drawFlower = (flower: Flower, scale: number) => {
      if (!ctx) return

      ctx.save()
      ctx.translate(flower.x, flower.y)
      ctx.rotate(flower.rotation)
      ctx.scale(scale, scale)

      // Рисуем лепестки
      ctx.fillStyle = flower.petalColor
      for (let i = 0; i < 6; i++) {
        ctx.save()
        ctx.rotate((i * Math.PI) / 3)
        ctx.beginPath()
        ctx.ellipse(flower.size * 0.35, 0, flower.size * 0.3, flower.size * 0.2, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Рисуем центр цветка
      ctx.fillStyle = flower.color
      ctx.beginPath()
      ctx.arc(0, 0, flower.size * 0.2, 0, Math.PI * 2)
      ctx.fill()

      // Добавляем блик на центр
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
      ctx.beginPath()
      ctx.arc(-flower.size * 0.05, -flower.size * 0.05, flower.size * 0.1, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const animate = (time: number) => {
      if (!ctx || !canvas) return

      if (startTimeRef.current === 0) {
        startTimeRef.current = time
      }

      const elapsed = (time - startTimeRef.current) / 1000

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      flowersRef.current.forEach((flower) => {
        const timeSinceStart = elapsed - flower.delay
        if (timeSinceStart < 0) return

        // Анимация появления с упругим эффектом
        const duration = 0.8
        let scale = 0
        if (timeSinceStart < duration) {
          const t = timeSinceStart / duration
          // Упругая анимация (elastic ease-out)
          scale = Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1
          scale = Math.max(0, Math.min(1, scale))
        } else {
          scale = 1
          // Лёгкое покачивание после появления
          const swayTime = timeSinceStart - duration
          scale = 1 + Math.sin(swayTime * 2 + flower.delay * 5) * 0.03
        }

        drawFlower(flower, scale)
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    let resizeTimeout: number | null = null
    const handleResize = () => {
      if (resizeTimeout) window.clearTimeout(resizeTimeout)
      resizeTimeout = window.setTimeout(() => {
        resize()
        startTimeRef.current = 0
      }, 200)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (resizeTimeout) window.clearTimeout(resizeTimeout)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className={`flowers ${className ?? ""}`} />
}
