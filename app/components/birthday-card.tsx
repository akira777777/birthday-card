"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { Cake } from "./cake"

interface BirthdayCardProps {
  isVisible: boolean
  isMobile?: boolean
  onCakeComplete?: () => void
}

export function BirthdayCard({ isVisible, isMobile = false, onCakeComplete }: BirthdayCardProps) {
  const [showContent, setShowContent] = useState(false)
  const [showCake, setShowCake] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Get base path for GitHub Pages compatibility
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

  useEffect(() => {
    if (!isVisible) {
      setShowContent(false)
      setShowCake(false)
      return
    }

    // Delay content reveal for smoother animation sequence
    const contentTimer = setTimeout(() => {
      setShowContent(true)
    }, 600)

    const cakeTimer = setTimeout(() => {
      setShowCake(true)
    }, 1200)

    return () => {
      clearTimeout(contentTimer)
      clearTimeout(cakeTimer)
    }
  }, [isVisible])

  // Reduced particles for mobile performance
  const particleCount = isMobile ? 12 : 24

  // Generate stable particle positions using useMemo
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      const seed = i * 7919
      const random = (s: number) => {
        const x = Math.sin(s) * 10000
        return x - Math.floor(x)
      }
      return {
        left: random(seed) * 100,
        top: random(seed + 1) * 100,
        size: random(seed + 2) * 8 + 4,
        delay: random(seed + 4) * 3,
        duration: 3 + random(seed + 5) * 2,
      }
    })
  }, [particleCount])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden p-4">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full bg-yellow-400/25 animate-float-gentle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      <div className={`relative animate-card-reveal w-full ${isMobile ? "max-w-sm" : "max-w-2xl"}`}>
        {/* Glow effect behind card */}
        <div 
          className={`
            absolute -inset-4 
            bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-blue-500/30 
            blur-2xl animate-glow-breathe -z-10
            ${isMobile ? "rounded-2xl" : "rounded-3xl"}
          `}
        />

        {/* Main card container */}
        <div
          className={`
            relative overflow-hidden
            shadow-2xl border-4 border-yellow-300/70
            backdrop-blur-sm
            ${isMobile ? "rounded-2xl" : "rounded-3xl"}
          `}
          style={{
            boxShadow: "0 25px 80px -20px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.2)",
          }}
        >
          {/* PNG Background Card Image */}
          <div className="relative w-full aspect-[4/3]">
            <Image
              src={`${basePath}/birthday-card/Слоwdй 2.png`}
              alt="С Днём Рождения, Татьяна!"
              fill
              className={`
                object-cover 
                transition-opacity duration-700 ease-out
                ${imageLoaded ? "opacity-100" : "opacity-0"}
              `}
              style={{
                imageRendering: "auto",
              }}
              onLoad={() => setImageLoaded(true)}
              priority={true}
              sizes={isMobile ? "100vw" : "672px"}
            />
            
            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 animate-pulse flex items-center justify-center">
                <div className="text-4xl animate-bounce-gentle">🎂</div>
              </div>
            )}
          </div>

          {/* Interactive Cake overlay - positioned at bottom */}
          {showCake && (
            <div 
              className={`
                absolute left-1/2 transform -translate-x-1/2 
                pointer-events-auto animate-fade-up
                ${isMobile ? "bottom-4" : "bottom-6"}
              `}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="relative">
                {/* Instruction text */}
                <p 
                  className={`
                    absolute -top-8 left-1/2 transform -translate-x-1/2 
                    whitespace-nowrap text-center
                    bg-black/60 backdrop-blur-sm rounded-full px-4 py-1
                    text-white font-medium animate-pulse-soft
                    ${isMobile ? "text-xs" : "text-sm"}
                  `}
                >
                  Задуй свечи! 🎂
                </p>
                <Cake onAllCandlesBlown={onCakeComplete} isMobile={isMobile} />
              </div>
            </div>
          )}

          {/* Decorative sparkles on card edges */}
          {showContent && !isMobile && (
            <>
              <div className="absolute top-4 left-4 text-2xl animate-sparkle-rotate">✨</div>
              <div className="absolute top-4 right-4 text-2xl animate-sparkle-rotate" style={{ animationDelay: "0.3s" }}>✨</div>
              <div className="absolute bottom-4 left-4 text-2xl animate-sparkle-rotate" style={{ animationDelay: "0.6s" }}>✨</div>
              <div className="absolute bottom-4 right-4 text-2xl animate-sparkle-rotate" style={{ animationDelay: "0.9s" }}>✨</div>
            </>
          )}

          {/* Shimmer overlay effect */}
          <div 
            className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-slide"
            style={{ backgroundSize: "200% 100%" }}
          />

          {/* Bottom decorative bar */}
          <div
            className={`
              absolute bottom-0 left-0 right-0 
              bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 
              animate-gradient-flow
              ${isMobile ? "h-1.5" : "h-2"}
            `}
            style={{ backgroundSize: "200% 100%" }}
          />
        </div>
      </div>
    </div>
  )
}
