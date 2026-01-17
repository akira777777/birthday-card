"use client"

import { useEffect, useState, useRef } from "react"

interface CakeProps {
  onAllCandlesBlown?: () => void
  isMobile?: boolean
}

interface Candle {
  id: number
  lit: boolean
  x: number
}

const CANDLE_COUNT = 5

export function Cake({ onAllCandlesBlown, isMobile = false }: CakeProps) {
  const [candles, setCandles] = useState<Candle[]>([])
  const [blowingAnimations, setBlowingAnimations] = useState<Set<number>>(new Set())
  const animationTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map())

  // Initialize candles
  useEffect(() => {
    const initialCandles: Candle[] = []
    for (let i = 0; i < CANDLE_COUNT; i++) {
      initialCandles.push({
        id: i,
        lit: true,
        x: (i * 100) / (CANDLE_COUNT - 1),
      })
    }
    setCandles(initialCandles)
    
    return () => {
      // Cleanup all animation timeouts
      animationTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      animationTimeoutsRef.current.clear()
    }
  }, [])

  const handleCandleClick = (candleId: number) => {
    setCandles((prev) => {
      const candle = prev.find((c) => c.id === candleId)
      if (!candle || !candle.lit) return prev

      // Add blowing animation
      setBlowingAnimations((prevAnim) => new Set(prevAnim).add(candleId))

      // Clear existing timeout for this candle
      const existingTimeout = animationTimeoutsRef.current.get(candleId)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Remove blowing animation after animation completes
      const timeout = setTimeout(() => {
        setBlowingAnimations((prevAnim) => {
          const next = new Set(prevAnim)
          next.delete(candleId)
          return next
        })
        animationTimeoutsRef.current.delete(candleId)
      }, 700)
      
      animationTimeoutsRef.current.set(candleId, timeout)

      // Blow out the candle
      const newCandles = prev.map((c) => (c.id === candleId ? { ...c, lit: false } : c))
      const allBlown = newCandles.every((c) => !c.lit)

      if (allBlown && onAllCandlesBlown) {
        setTimeout(() => {
          onAllCandlesBlown()
        }, 400)
      }

      return newCandles
    })
  }

  const size = isMobile ? 200 : 280
  const cakeWidth = size
  const cakeHeight = size * 0.7
  const candleHeight = size * 0.3

  return (
    <div 
      className="relative flex items-center justify-center" 
      style={{ width: `${cakeWidth}px`, height: `${cakeHeight + candleHeight}px` }}
    >
      <svg
        width={cakeWidth}
        height={cakeHeight + candleHeight}
        viewBox={`0 0 ${cakeWidth} ${cakeHeight + candleHeight}`}
        className="drop-shadow-2xl"
        style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.3))" }}
      >
        {/* Gradients */}
        <defs>
          <linearGradient id="cakeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFB6C1" />
            <stop offset="50%" stopColor="#FF69B4" />
            <stop offset="100%" stopColor="#FF1493" />
          </linearGradient>
          <linearGradient id="frostingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFF8DC" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
          <linearGradient id="flameGradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FF6348" />
            <stop offset="40%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Cake base - bottom ellipse */}
        <ellipse
          cx={cakeWidth / 2}
          cy={cakeHeight - 10}
          rx={cakeWidth / 2 - 20}
          ry={cakeHeight * 0.15}
          fill="url(#cakeGradient)"
          stroke="#C71585"
          strokeWidth="2"
        />
        
        {/* Cake body */}
        <rect
          x={20}
          y={cakeHeight * 0.25}
          width={cakeWidth - 40}
          height={cakeHeight * 0.7}
          rx={15}
          fill="url(#cakeGradient)"
          stroke="#C71585"
          strokeWidth="2"
        />

        {/* Frosting decoration - wavy top */}
        <path
          d={`M 20 ${cakeHeight * 0.25} 
              Q ${cakeWidth * 0.15} ${cakeHeight * 0.18} ${cakeWidth * 0.25} ${cakeHeight * 0.22}
              T ${cakeWidth * 0.4} ${cakeHeight * 0.2}
              T ${cakeWidth * 0.55} ${cakeHeight * 0.23}
              T ${cakeWidth * 0.7} ${cakeHeight * 0.19}
              T ${cakeWidth * 0.85} ${cakeHeight * 0.22}
              T ${cakeWidth - 20} ${cakeHeight * 0.25}`}
          fill="none"
          stroke="url(#frostingGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Decorative dots */}
        {[...Array(7)].map((_, i) => (
          <circle
            key={`dot-${i}`}
            cx={35 + i * ((cakeWidth - 70) / 6)}
            cy={cakeHeight * 0.55}
            r="4"
            fill="#FFD700"
            opacity="0.8"
          />
        ))}

        {/* Candles */}
        {candles.map((candle) => {
          const candleX = (candle.x / 100) * (cakeWidth - 80) + 40
          const isBlowing = blowingAnimations.has(candle.id)

          return (
            <g key={candle.id}>
              {/* Candle stick */}
              <rect
                x={candleX - 4}
                y={cakeHeight * 0.08}
                width="8"
                height={candleHeight}
                fill={candle.lit ? "#FFD700" : "#A0A0A0"}
                stroke={candle.lit ? "#DAA520" : "#808080"}
                strokeWidth="1"
                rx="3"
                style={{
                  transition: "fill 0.3s ease, stroke 0.3s ease",
                }}
              />

              {/* Flame */}
              {candle.lit && (
                <g 
                  className="cursor-pointer" 
                  onClick={() => handleCandleClick(candle.id)}
                  style={{ filter: "url(#glow)" }}
                >
                  {/* Outer glow */}
                  <ellipse
                    cx={candleX}
                    cy={cakeHeight * 0.08 - 10}
                    rx="10"
                    ry="14"
                    fill="#FFD700"
                    opacity="0.25"
                    className="animate-flame-glow"
                  />

                  {/* Flame body */}
                  <path
                    d={`M ${candleX} ${cakeHeight * 0.08 - 2} 
                        Q ${candleX + 4} ${cakeHeight * 0.08 - 12} ${candleX} ${cakeHeight * 0.08 - 20}
                        Q ${candleX - 4} ${cakeHeight * 0.08 - 12} ${candleX} ${cakeHeight * 0.08 - 2}`}
                    fill="url(#flameGradient)"
                    className="animate-flame-dance"
                    style={{ transformOrigin: `${candleX}px ${cakeHeight * 0.08}px` }}
                  />

                  {/* Inner bright core */}
                  <ellipse
                    cx={candleX}
                    cy={cakeHeight * 0.08 - 10}
                    rx="3"
                    ry="7"
                    fill="#FFFFFF"
                    opacity="0.9"
                    className="animate-flame-core"
                  />

                  {/* Clickable area (invisible but larger) */}
                  <circle
                    cx={candleX}
                    cy={cakeHeight * 0.08 - 10}
                    r={isMobile ? 25 : 18}
                    fill="transparent"
                    className="hover:opacity-30 transition-opacity duration-200"
                  />
                </g>
              )}

              {/* Blowing animation - smoke particles */}
              {isBlowing && (
                <g className="animate-smoke-rise">
                  {[...Array(6)].map((_, i) => (
                    <circle
                      key={i}
                      cx={candleX + (Math.sin(i * 1.5) * 6)}
                      cy={cakeHeight * 0.08 - 18 - i * 10}
                      r={2 + i * 0.5}
                      fill={`rgba(180, 180, 180, ${0.7 - i * 0.1})`}
                      className="animate-smoke-particle"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    />
                  ))}
                </g>
              )}

              {/* Extinguished wick */}
              {!candle.lit && (
                <g>
                  <line
                    x1={candleX}
                    y1={cakeHeight * 0.08 - 2}
                    x2={candleX}
                    y2={cakeHeight * 0.08 - 8}
                    stroke="#333"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle 
                    cx={candleX} 
                    cy={cakeHeight * 0.08 - 2} 
                    r="2.5" 
                    fill="#444" 
                  />
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
