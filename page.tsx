"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { BirthdayCard } from "./components/birthday-card"
import { Fireworks, FireworksHandle } from "./components/fireworks"
import { Confetti } from "./components/confetti"
import { Gnome } from "./components/gnome"
import { soundManager } from "./utils/sounds"

const GNOME_COUNT = 4

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
  const [confettiActive, setConfettiActive] = useState(false)
  const fireworksRef = useRef<FireworksHandle>(null)
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())

  // Helper to track timeouts for cleanup
  const trackTimeout = useCallback((timeoutId: NodeJS.Timeout) => {
    timeoutsRef.current.add(timeoutId)
    return timeoutId
  }, [])

  // Cleanup timeouts on unmount
  useEffect(() => {
    // Capture current ref value to avoid stale closure issues
    const timeouts = timeoutsRef.current
    return () => {
      // Clear all tracked timeouts
      timeouts.forEach((timeoutId) => clearTimeout(timeoutId))
      timeouts.clear()
    }
  }, [])

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Fewer clicks needed on mobile for better UX
  const clicksNeeded = useMemo(() => (isMobile ? 6 : 10), [isMobile])

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

  // Initialize gnomes
  useEffect(() => {
    const initialGnomes: GnomePosition[] = []
    for (let i = 0; i < GNOME_COUNT; i++) {
      initialGnomes.push(generateRandomPosition(i))
    }
    setGnomes(initialGnomes)

    const handleResize = () => {
      setGnomes((prev) => prev.map((gnome) => generateRandomPosition(gnome.id)))
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [generateRandomPosition])

  const handleGnomeClick = useCallback(
    (clickX: number, clickY: number, gnomeId?: number) => {
      if (showCard || !gnomesVisible) return

      const newCount = clickCount + 1
      setClickCount(newCount)

      // Play click sound
      soundManager.playClick()

      // Launch fireworks at click position (fewer particles on mobile)
      if (fireworksRef.current) {
        fireworksRef.current.launch(clickX, clickY, isMobile ? 30 : 50)
      }

      // If reached target clicks, show card
      if (newCount >= clicksNeeded) {
        setGnomesVisible(false)

        // Launch spectacular fireworks show
        trackTimeout(setTimeout(() => {
          if (fireworksRef.current) {
            const centerX = window.innerWidth / 2
            const centerY = window.innerHeight / 2
            const particleCount = isMobile ? 60 : 100
            const extraParticles = isMobile ? 40 : 80

            // First wave: ring fireworks
            const ringCount = isMobile ? 6 : 12
            for (let i = 0; i < ringCount; i++) {
              trackTimeout(setTimeout(() => {
                if (fireworksRef.current) {
                  // Play firework sound occasionally
                  if (i % 3 === 0) {
                    soundManager.playFirework()
                  }
                  const angle = (Math.PI * 2 * i) / ringCount
                  const distance = isMobile ? 100 : 200
                  fireworksRef.current.launch(
                    centerX + Math.cos(angle) * distance,
                    centerY + Math.sin(angle) * distance,
                    particleCount
                  )
                }
              }, i * (isMobile ? 200 : 150)))
            }

            // Additional random fireworks
            const additionalCount = isMobile ? 3 : 6
            for (let i = 0; i < additionalCount; i++) {
              trackTimeout(setTimeout(() => {
                if (fireworksRef.current) {
                  const randomX = centerX + (Math.random() - 0.5) * window.innerWidth * 0.6
                  const randomY = centerY + (Math.random() - 0.5) * window.innerHeight * 0.6
                  fireworksRef.current.launch(randomX, randomY, extraParticles)
                }
              }, (isMobile ? 1200 : 1800) + i * 200))
            }

            // Final center mega-firework
            trackTimeout(setTimeout(
              () => {
                if (fireworksRef.current) {
                  fireworksRef.current.launch(centerX, centerY, isMobile ? 100 : 150)
                  trackTimeout(setTimeout(() => {
                    if (fireworksRef.current) {
                      const burstCount = isMobile ? 3 : 5
                      for (let j = 0; j < burstCount; j++) {
                        trackTimeout(setTimeout(() => {
                          if (fireworksRef.current) {
                            const offset = isMobile ? 50 : 80
                            fireworksRef.current.launch(
                              centerX + (Math.random() - 0.5) * offset,
                              centerY + (Math.random() - 0.5) * offset,
                              isMobile ? 40 : 60
                            )
                          }
                        }, j * 100))
                      }
                    }
                  }, 200))
                }
                setShowCard(true)
                // Activate confetti after card appears (with delay for fireworks to complete)
                trackTimeout(setTimeout(() => {
                  setConfettiActive(true)
                }, 500))
              },
              isMobile ? 1500 : 2000
            ))
          }
        }, 300))
      } else {
        // Move clicked gnome to new position
        trackTimeout(setTimeout(() => {
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
        }, 700))
      }
    },
    [clickCount, showCard, gnomesVisible, generateRandomPosition, isMobile, clicksNeeded, trackTimeout]
  )

  // Stars count based on device
  const starsCount = isMobile ? 40 : 80
  const twinkleCount = isMobile ? 10 : 20

  // Generate stable star positions using useMemo to avoid hydration issues
  const stars = useMemo(() => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }
    return Array.from({ length: starsCount }, (_, i) => {
      const seed = i * 7919
      return {
        left: seededRandom(seed) * 100,
        top: seededRandom(seed + 1) * 100,
        size: seededRandom(seed + 2) * 3 + 1,
        opacity: seededRandom(seed + 3) * 0.6 + 0.3,
        delay: seededRandom(seed + 4) * 3,
        duration: 2 + seededRandom(seed + 5) * 4,
      }
    })
  }, [starsCount])

  const twinkles = useMemo(() => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }
    return Array.from({ length: twinkleCount }, (_, i) => {
      const seed = (i + starsCount) * 7919
      return {
        left: seededRandom(seed) * 100,
        top: seededRandom(seed + 1) * 100,
        width: seededRandom(seed + 2) * 2 + 1,
        height: seededRandom(seed + 3) * 2 + 1,
        delay: seededRandom(seed + 4) * 2,
      }
    })
  }, [twinkleCount, starsCount])

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
              left: `${star.left}%`,
              top: `${star.top}%`,
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
              left: `${twinkle.left}%`,
              top: `${twinkle.top}%`,
              width: `${twinkle.width}px`,
              height: `${twinkle.height}px`,
              opacity: 0,
              animationDelay: `${twinkle.delay}s`,
              animationDuration: "1.5s",
              boxShadow: "0 0 6px rgba(255, 255, 200, 1)",
            }}
          />
        ))}
      </div>

      {/* Fireworks canvas */}
      <Fireworks ref={fireworksRef} isMobile={isMobile} />

      {/* Confetti */}
      <Confetti active={confettiActive} isMobile={isMobile} />

      {/* Progress indicator - mobile optimized */}
      {!showCard && gnomesVisible && (
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 z-20 bg-black/60 backdrop-blur-xl border-2 border-yellow-400/80 shadow-2xl shadow-yellow-400/50 animate-scale-in ${isMobile ? "top-4 rounded-2xl px-4 py-3" : "top-8 rounded-full px-8 py-4"
            }`}
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
      <BirthdayCard
        isVisible={showCard}
        isMobile={isMobile}
        onCakeComplete={() => {
          // Trigger additional confetti when all candles are blown
          setConfettiActive(true)
        }}
      />

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
