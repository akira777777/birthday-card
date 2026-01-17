"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { BirthdayCard } from "@/components/birthday-card"
import { Fireworks, FireworksHandle } from "@/components/fireworks"
import { Confetti } from "@/components/confetti"
import { Gnome } from "@/components/gnome"

const GNOME_COUNT = 3
const REDUCED_MOTION_FACTOR = 0.6
const MIN_STARS_COUNT = 20
const MIN_TWINKLE_COUNT = 6

interface GnomePosition {
  id: number
  x: number
  y: number
}

export default function BirthdayCardPage() {
  const [clickCount, setClickCount] = useState(0)
  const [gnomes, setGnomes] = useState<GnomePosition[]>([])
  const [showCard, setShowCard] = useState(false)
  const [gnomesVisible, setGnomesVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [confettiActive, setConfettiActive] = useState(false)
  const fireworksRef = useRef<FireworksHandle>(null)
  const timeoutsRef = useRef<number[]>([])

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Respect reduced motion preference
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updatePreference = () => setPrefersReducedMotion(media.matches)

    updatePreference()
    if (media.addEventListener) {
      media.addEventListener("change", updatePreference)
      return () => media.removeEventListener("change", updatePreference)
    }

    media.addListener(updatePreference)
    return () => media.removeListener(updatePreference)
  }, [])

  // Fewer clicks needed on mobile for better UX
  const clicksNeeded = useMemo(() => (isMobile ? 3 : 5), [isMobile])

  const scaleCount = useCallback(
    (count: number, min = 1) => {
      const factor = prefersReducedMotion ? REDUCED_MOTION_FACTOR : 1
      return Math.max(min, Math.round(count * factor))
    },
    [prefersReducedMotion]
  )

  // Generate random position for gnomes - optimized for mobile
  const generateRandomPosition = useCallback(
    (index: number): GnomePosition => {
      if (typeof window === "undefined") {
        return { id: index, x: 100, y: 100 }
      }

      const gnomeSize = isMobile ? 100 : 120
      const padding = isMobile ? 60 : Math.max(150, window.innerWidth * 0.1)
      const topPadding = isMobile ? 120 : padding // Extra space for progress bar
      const bottomPadding = isMobile ? 100 : padding // Extra space for instructions

      const maxX = window.innerWidth - padding - gnomeSize
      const maxY = window.innerHeight - bottomPadding - gnomeSize

      return {
        id: index,
        x: padding + Math.random() * Math.max(maxX - padding, 50),
        y: topPadding + Math.random() * Math.max(maxY - topPadding, 50),
      }
    },
    [isMobile]
  )

  const createGnomes = useCallback(() => {
    return Array.from({ length: GNOME_COUNT }, (_, index) => generateRandomPosition(index))
  }, [generateRandomPosition])

  // Initialize gnomes
  useEffect(() => {
    setGnomes(createGnomes())

    const handleResize = () => {
      setGnomes(createGnomes())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [createGnomes])

  const scheduleTimeout = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay)
    timeoutsRef.current.push(id)
    return id
  }, [])

  const clearScheduledTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
  }, [])

  useEffect(() => {
    return () => clearScheduledTimeouts()
  }, [clearScheduledTimeouts])

  const handleGnomeClick = useCallback(
    (clickX: number, clickY: number, gnomeId?: number) => {
      if (showCard || !gnomesVisible) return

      const newCount = clickCount + 1
      setClickCount(newCount)

      // Launch fireworks at click position (fewer particles on mobile/reduced motion)
      if (fireworksRef.current) {
        const baseParticles = isMobile ? 30 : 50
        fireworksRef.current.launch(clickX, clickY, scaleCount(baseParticles, 20))
      }

      // If reached target clicks, show card
      if (newCount >= clicksNeeded) {
        setGnomesVisible(false)

        // Launch spectacular fireworks show
        scheduleTimeout(() => {
          if (fireworksRef.current) {
            const centerX = window.innerWidth / 2
            const centerY = window.innerHeight / 2
            const particleCount = scaleCount(isMobile ? 60 : 100, 40)
            const extraParticles = scaleCount(isMobile ? 40 : 80, 25)

            // First wave: ring fireworks
            const ringCount = scaleCount(isMobile ? 6 : 12, 4)
            for (let i = 0; i < ringCount; i++) {
              scheduleTimeout(() => {
                if (fireworksRef.current) {
                  const angle = (Math.PI * 2 * i) / ringCount
                  const distance = isMobile ? 100 : 200
                  fireworksRef.current.launch(
                    centerX + Math.cos(angle) * distance,
                    centerY + Math.sin(angle) * distance,
                    particleCount
                  )
                }
              }, i * (isMobile ? 200 : 150))
            }

            // Additional random fireworks
            const additionalCount = scaleCount(isMobile ? 3 : 6, 2)
            for (let i = 0; i < additionalCount; i++) {
              scheduleTimeout(() => {
                if (fireworksRef.current) {
                  const randomX = centerX + (Math.random() - 0.5) * window.innerWidth * 0.6
                  const randomY = centerY + (Math.random() - 0.5) * window.innerHeight * 0.6
                  fireworksRef.current.launch(randomX, randomY, extraParticles)
                }
              }, (isMobile ? 1200 : 1800) + i * 200)
            }

            // Final center mega-firework
            scheduleTimeout(
              () => {
                if (fireworksRef.current) {
                  fireworksRef.current.launch(centerX, centerY, scaleCount(isMobile ? 100 : 150, 60))
                  scheduleTimeout(() => {
                    if (fireworksRef.current) {
                      const burstCount = scaleCount(isMobile ? 3 : 5, 2)
                      for (let j = 0; j < burstCount; j++) {
                        scheduleTimeout(() => {
                          if (fireworksRef.current) {
                            const offset = isMobile ? 50 : 80
                            fireworksRef.current.launch(
                              centerX + (Math.random() - 0.5) * offset,
                              centerY + (Math.random() - 0.5) * offset,
                              scaleCount(isMobile ? 40 : 60, 25)
                            )
                          }
                        }, j * 100)
                      }
                    }
                  }, 200)
                }
                setShowCard(true)
                // Start confetti
                scheduleTimeout(() => setConfettiActive(true), 500)
              },
              isMobile ? 1500 : 2000
            )
          }
        }, 300)
      } else {
        // Move clicked gnome to new position
        scheduleTimeout(() => {
          setGnomes((prev) => {
            const newGnomes = [...prev]
            let gnomeToMove = prev[0]
            if (gnomeId !== undefined) {
              gnomeToMove = prev.find((g) => g.id === gnomeId) || prev[0]
            } else {
              let minDistance = Infinity
              for (const gnome of prev) {
                const distance = Math.sqrt(Math.pow(gnome.x - clickX, 2) + Math.pow(gnome.y - clickY, 2))
                if (distance < minDistance) {
                  minDistance = distance
                  gnomeToMove = gnome
                }
              }
            }
            const index = newGnomes.findIndex((g) => g.id === gnomeToMove.id)
            if (index !== -1) {
              newGnomes[index] = generateRandomPosition(gnomeToMove.id)
            }
            return newGnomes
          })
        }, 700)
      }
    },
    [clickCount, showCard, gnomesVisible, generateRandomPosition, isMobile, clicksNeeded, scaleCount, scheduleTimeout]
  )

  // Stars count based on device
  const starsCount = useMemo(() => scaleCount(isMobile ? 40 : 80, MIN_STARS_COUNT), [isMobile, scaleCount])
  const twinkleCount = useMemo(
    () => scaleCount(isMobile ? 10 : 20, MIN_TWINKLE_COUNT),
    [isMobile, scaleCount]
  )

  const stars = useMemo(
    () =>
      Array.from({ length: starsCount }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.3,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 4,
      })),
    [starsCount]
  )

  const twinkles = useMemo(
    () =>
      Array.from({ length: twinkleCount }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 2,
      })),
    [twinkleCount]
  )

  const handleReset = useCallback(() => {
    clearScheduledTimeouts()
    fireworksRef.current?.clear()
    setClickCount(0)
    setShowCard(false)
    setConfettiActive(false)
    setGnomesVisible(true)
    setGnomes(createGnomes())
  }, [clearScheduledTimeouts, createGnomes])

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 via-blue-900 to-purple-950 touch-none select-none">
      {/* Safe area padding for mobile notch/home indicator */}
      <div className="absolute inset-0 safe-area-inset" />

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 animate-pulse" />

      {/* Background stars - reduced for mobile performance */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)`,
            }}
          />
        ))}

        {/* Twinkling stars */}
        {twinkles.map((twinkle, i) => (
          <div
            key={`twinkle-${i}`}
            className="absolute rounded-full bg-yellow-200 animate-pulse"
            style={{
              left: twinkle.left,
              top: twinkle.top,
              width: `${twinkle.size}px`,
              height: `${twinkle.size}px`,
              opacity: 0,
              animationDelay: `${twinkle.delay}s`,
              animationDuration: "1.5s",
              boxShadow: "0 0 6px rgba(255, 255, 200, 1)",
            }}
          />
        ))}
      </div>

      {/* Fireworks canvas */}
      <Fireworks ref={fireworksRef} />

      {/* Confetti */}
      <Confetti active={confettiActive} isMobile={isMobile} />

      {/* Progress indicator - mobile optimized */}
      {!showCard && gnomesVisible && (
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 z-20 bg-black/60 backdrop-blur-xl border-2 border-yellow-400/80 shadow-2xl shadow-yellow-400/50 animate-scale-in ${isMobile ? "top-4 rounded-2xl px-4 py-3" : "top-8 rounded-full px-8 py-4"
            }`}
          role="status"
          aria-live="polite"
        >
          <div className={`flex ${isMobile ? "flex-col gap-2" : "flex-row items-center gap-4"}`}>
            <p className={`text-white font-bold whitespace-nowrap text-center ${isMobile ? "text-base" : "text-lg"}`}>
              Найдено гномиков: <span className="text-yellow-400 animate-pulse">{clickCount}</span> / {clicksNeeded}
            </p>
            {/* Progress bar */}
            <div
              className={`bg-black/40 rounded-full overflow-hidden border border-yellow-400/30 ${isMobile ? "w-full h-2" : "w-48 h-3"
                }`}
            >
              <div
                className="h-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                style={{ width: `${(clickCount / clicksNeeded) * 100}%` }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                  style={{ backgroundSize: "200% 100%" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gnomes */}
      {gnomes.map((gnome) => (
        <Gnome
          key={`gnome-${gnome.id}-${gnome.x}-${gnome.y}`}
          id={gnome.id}
          x={gnome.x}
          y={gnome.y}
          onClick={handleGnomeClick}
          isVisible={gnomesVisible}
          isMobile={isMobile}
        />
      ))}

      {/* Birthday card */}
      <BirthdayCard isVisible={showCard} isMobile={isMobile} onReplay={handleReset} />


      {/* Instructions - mobile optimized */}
      {clickCount === 0 && !showCard && (
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 z-20 bg-black/60 backdrop-blur-xl border-2 border-yellow-400/80 shadow-2xl shadow-yellow-400/50 animate-fade-in ${isMobile ? "bottom-6 rounded-2xl px-5 py-3 mx-4 max-w-[calc(100%-2rem)]" : "bottom-8 rounded-2xl px-10 py-5"
            }`}
        >
          <p
            className={`text-white font-bold text-center flex items-center justify-center gap-2 ${isMobile ? "text-base" : "text-xl md:text-2xl gap-3"
              }`}
          >
            <span className={`animate-bounce ${isMobile ? "text-xl" : "text-2xl md:text-3xl"}`}>🎯</span>
            <span>{isMobile ? "Нажми на гномиков!" : "Найди и кликни на всех гномиков!"}</span>
            <span
              className={`animate-bounce ${isMobile ? "text-xl" : "text-2xl md:text-3xl"}`}
              style={{ animationDelay: "0.2s" }}
            >
              ✨
            </span>
          </p>
        </div>
      )}
    </div>
  )
}