"use client"

import { useEffect, useMemo, useState } from "react"
import { Cake } from "./cake"

interface BirthdayCardProps {
  isVisible: boolean
  isMobile?: boolean
  onCakeComplete?: () => void
}

const greeting = "С Днем Рождения,"
const name = "Татьяна!"
const message1 = "Пусть каждый день будет наполнен"
const message2 = "радостью и счастьем!"

export function BirthdayCard({ isVisible, isMobile = false, onCakeComplete }: BirthdayCardProps) {
  const [displayedGreeting, setDisplayedGreeting] = useState("")
  const [displayedName, setDisplayedName] = useState("")
  const [displayedMessage1, setDisplayedMessage1] = useState("")
  const [displayedMessage2, setDisplayedMessage2] = useState("")
  const [showCake, setShowCake] = useState(false)

  useEffect(() => {
    if (!isVisible) return

    // Faster animation on mobile
    const greetingSpeed = isMobile ? 60 : 80
    const nameSpeed = isMobile ? 80 : 100

    // Animate greeting letter by letter
    let currentIndex = 0
    const timersRef = {
      greetingInterval: null as NodeJS.Timeout | null,
      nameTimeout: null as NodeJS.Timeout | null,
      nameInterval: null as NodeJS.Timeout | null,
      messageTimeout1: null as NodeJS.Timeout | null,
      messageTimeout2: null as NodeJS.Timeout | null,
    }
    timersRef.greetingInterval = setInterval(() => {
      if (currentIndex <= greeting.length) {
        setDisplayedGreeting(greeting.slice(0, currentIndex))
        currentIndex++
      } else {
        if (timersRef.greetingInterval) {
          clearInterval(timersRef.greetingInterval)
          timersRef.greetingInterval = null
        }

        // Start name animation after greeting
        timersRef.nameTimeout = setTimeout(() => {
          let nameIndex = 0
          timersRef.nameInterval = setInterval(() => {
            if (nameIndex <= name.length) {
              setDisplayedName(name.slice(0, nameIndex))
              nameIndex++
            } else {
              if (timersRef.nameInterval) {
                clearInterval(timersRef.nameInterval)
                timersRef.nameInterval = null
              }

              // Show cake after name animation completes
              timersRef.messageTimeout1 = setTimeout(() => {
                setShowCake(true)
                setDisplayedMessage1(message1)
                timersRef.messageTimeout2 = setTimeout(() => {
                  setDisplayedMessage2(message2)
                }, 300)
              }, 400)
            }
          }, nameSpeed)
        }, 300)
      }
    }, greetingSpeed)

    return () => {
      if (timersRef.greetingInterval) {
        clearInterval(timersRef.greetingInterval)
        timersRef.greetingInterval = null
      }
      if (timersRef.nameTimeout) {
        clearTimeout(timersRef.nameTimeout)
        timersRef.nameTimeout = null
      }
      if (timersRef.nameInterval) {
        clearInterval(timersRef.nameInterval)
        timersRef.nameInterval = null
      }
      if (timersRef.messageTimeout1) {
        clearTimeout(timersRef.messageTimeout1)
        timersRef.messageTimeout1 = null
      }
      if (timersRef.messageTimeout2) {
        clearTimeout(timersRef.messageTimeout2)
        timersRef.messageTimeout2 = null
      }
    }
  }, [isVisible, isMobile])

  // Reduced particles for mobile performance
  const particleCount = isMobile ? 15 : 30
  const sparkleCount = isMobile ? 12 : 24

  // Generate stable particle positions using useMemo to avoid hydration issues
  // Must be called before any early returns (React Hooks rules)
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      // Use seeded random for consistent values
      const seed = i * 7919 // Prime number for better distribution
      const random = (seed: number) => {
        const x = Math.sin(seed) * 10000
        return x - Math.floor(x)
      }
      return {
        left: random(seed) * 100,
        top: random(seed + 1) * 100,
        width: random(seed + 2) * 8 + 4,
        height: random(seed + 3) * 8 + 4,
        delay: random(seed + 4) * 3,
        duration: 3 + random(seed + 5) * 2,
      }
    })
  }, [particleCount])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden p-4">
      {/* Animated background particles - reduced on mobile */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full bg-yellow-400/30 animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative animate-card-entrance w-full max-w-3xl">
        {/* Enhanced sparkles around card - reduced on mobile */}
        {!isMobile && (
          <div className="absolute -inset-12">
            {[...Array(sparkleCount)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-sparkle"
                style={{
                  left: `${50 + Math.cos((i * Math.PI * 2) / sparkleCount) * (isMobile ? 200 : 400)}px`,
                  top: `${50 + Math.sin((i * Math.PI * 2) / sparkleCount) * (isMobile ? 200 : 400)}px`,
                  animationDelay: `${i * 0.08}s`,
                  animationDuration: `${2 + (i % 4) * 0.3}s`,
                }}
              >
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 rounded-full shadow-2xl shadow-yellow-400/80 animate-glow-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Main card with glassmorphism */}
        <div
          className={`relative bg-gradient-to-br from-white/95 via-pink-50/95 to-purple-50/95 shadow-2xl border-4 border-yellow-300/80 backdrop-blur-xl animate-card-entrance ${isMobile ? "rounded-2xl p-5 mx-2" : "rounded-3xl md:rounded-[2.5rem] p-8 sm:p-12 md:p-16 lg:p-20"
            }`}
        >
          {/* Animated border glow */}
          <div
            className={`absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-75 blur-xl animate-glow-pulse -z-10 ${isMobile ? "rounded-2xl" : "rounded-3xl md:rounded-[2.5rem]"
              }`}
          />

          {/* Decorative corner emojis */}
          <div
            className={`absolute animate-float ${isMobile ? "top-2 left-2 text-2xl" : "top-4 left-4 text-5xl md:text-6xl"
              }`}
            style={{ animationDelay: "0s" }}
          >
            🎉
          </div>
          <div
            className={`absolute animate-float ${isMobile ? "top-2 right-2 text-2xl" : "top-4 right-4 text-5xl md:text-6xl"
              }`}
            style={{ animationDelay: "0.5s" }}
          >
            🎈
          </div>
          <div
            className={`absolute animate-float ${isMobile ? "bottom-2 left-2 text-2xl" : "bottom-4 left-4 text-5xl md:text-6xl"
              }`}
            style={{ animationDelay: "1s" }}
          >
            🎁
          </div>
          <div
            className={`absolute animate-float ${isMobile ? "bottom-2 right-2 text-2xl" : "bottom-4 right-4 text-5xl md:text-6xl"
              }`}
            style={{ animationDelay: "1.5s" }}
          >
            🎊
          </div>

          {/* Side floating emojis - only on desktop */}
          {!isMobile && (
            <>
              <div className="absolute top-1/2 -left-8 text-3xl animate-float" style={{ animationDelay: "0.3s" }}>
                ✨
              </div>
              <div className="absolute top-1/2 -right-8 text-3xl animate-float" style={{ animationDelay: "0.7s" }}>
                ⭐
              </div>
            </>
          )}

          {/* Content with letter-by-letter animation */}
          <div
            className={`text-center relative z-10 ${isMobile ? "space-y-3 pt-4 pb-2" : "space-y-6 md:space-y-8"}`}
          >
            {/* Greeting */}
            <h1
              className={`font-bold leading-tight ${isMobile ? "text-2xl min-h-[1.5em]" : "text-5xl sm:text-6xl md:text-8xl min-h-[1.2em]"
                }`}
            >
              {displayedGreeting.split("").map((char, index) => (
                <span
                  key={index}
                  className="inline-block bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-text-reveal"
                  style={{
                    animationDelay: `${index * 0.08}s`,
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
              {displayedGreeting.length > 0 && displayedGreeting.length < greeting.length && (
                <span className="inline-block w-0.5 h-full bg-yellow-400 animate-pulse ml-0.5">|</span>
              )}
            </h1>

            {/* Name with shimmer effect */}
            <h2
              className={`font-extrabold leading-tight ${isMobile ? "text-4xl min-h-[1.3em]" : "text-6xl sm:text-7xl md:text-9xl min-h-[1.2em]"
                }`}
            >
              {displayedName.split("").map((char, index) => (
                <span
                  key={index}
                  className="inline-block bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-letter-bounce"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    backgroundSize: "200% 100%",
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
              {displayedName.length > 0 && displayedName.length < name.length && (
                <span className="inline-block w-0.5 h-full bg-orange-400 animate-pulse ml-0.5">|</span>
              )}
            </h2>

            {/* Interactive Cake */}
            {showCake && (
              <div className={`flex justify-center items-center ${isMobile ? "my-4" : "my-6 md:my-8"}`}>
                <div className="pointer-events-auto">
                  <Cake onAllCandlesBlown={onCakeComplete} isMobile={isMobile} />
                </div>
              </div>
            )}

            {/* Messages */}
            <div className={isMobile ? "pt-2 space-y-1" : "pt-4 md:pt-6 space-y-2 md:space-y-3"}>
              {displayedMessage1 && (
                <p
                  className={`text-gray-700 font-medium animate-text-reveal ${isMobile ? "text-sm" : "text-xl sm:text-2xl md:text-3xl"
                    }`}
                  style={{ animationDelay: "0.2s" }}
                >
                  {displayedMessage1}
                </p>
              )}
              {displayedMessage2 && (
                <p
                  className={`text-gray-700 font-medium animate-text-reveal flex items-center justify-center gap-1 ${isMobile ? "text-sm" : "text-xl sm:text-2xl md:text-3xl gap-2"
                    }`}
                  style={{ animationDelay: "0.4s" }}
                >
                  {displayedMessage2}{" "}
                  <span className="inline-block animate-float" style={{ animationDelay: "0.5s" }}>
                    ✨
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Bottom decoration */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 animate-shimmer ${isMobile ? "h-2 rounded-b-2xl" : "h-3 rounded-b-3xl md:rounded-b-[2.5rem]"
              }`}
            style={{ backgroundSize: "200% 100%" }}
          />
        </div>
      </div>
    </div>
  )
}
