"use client"

import { useEffect, useState } from "react"
import { soundManager } from "../utils/sounds"

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

  // Initialize candles
  useEffect(() => {
    const initialCandles: Candle[] = []
    for (let i = 0; i < CANDLE_COUNT; i++) {
      initialCandles.push({
        id: i,
        lit: true,
        x: (i * 100) / (CANDLE_COUNT - 1), // Percentage position
      })
    }
    setCandles(initialCandles)
  }, [])

  const handleCandleClick = (candleId: number) => {
    setCandles((prev) => {
      const candle = prev.find((c) => c.id === candleId)
      if (!candle || !candle.lit) return prev

      // Play blow sound
      soundManager.playBlow()

      // Add blowing animation
      setBlowingAnimations((prev) => new Set(prev).add(candleId))

      // Remove blowing animation after animation completes
      setTimeout(() => {
        setBlowingAnimations((prev) => {
          const next = new Set(prev)
          next.delete(candleId)
          return next
        })
      }, 800)

      // Blow out the candle
      const newCandles = prev.map((c) => (c.id === candleId ? { ...c, lit: false } : c))
      const allBlown = newCandles.every((c) => !c.lit)

      if (allBlown && onAllCandlesBlown) {
        // Play success sound when all candles are blown
        soundManager.playSuccess()
        setTimeout(() => {
          onAllCandlesBlown()
        }, 500)
      }

      return newCandles
    })
  }

  const size = isMobile ? 200 : 280
  const cakeWidth = size
  const cakeHeight = size * 0.7
  const candleHeight = size * 0.3

  return (
    <div className="relative flex items-center justify-center" style={{ width: `${cakeWidth}px`, height: `${cakeHeight + candleHeight}px` }}>
      <svg
        width={cakeWidth}
        height={cakeHeight + candleHeight}
        viewBox={`0 0 ${cakeWidth} ${cakeHeight + candleHeight}`}
        className="drop-shadow-2xl"
      >
        {/* Cake base */}
        <ellipse
          cx={cakeWidth / 2}
          cy={cakeHeight - 10}
          rx={cakeWidth / 2 - 20}
          ry={cakeHeight * 0.15}
          fill="url(#cakeGradient)"
          stroke="#8B4513"
          strokeWidth="2"
        />
        <rect
          x={20}
          y={cakeHeight * 0.25}
          width={cakeWidth - 40}
          height={cakeHeight * 0.7}
          rx={15}
          fill="url(#cakeGradient)"
          stroke="#8B4513"
          strokeWidth="2"
        />

        {/* Frosting decoration */}
        <path
          d={`M 20 ${cakeHeight * 0.25} Q ${cakeWidth / 4} ${cakeHeight * 0.2} ${cakeWidth / 2} ${cakeHeight * 0.22} T ${cakeWidth - 20} ${cakeHeight * 0.25}`}
          fill="none"
          stroke="#FFD700"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Candles */}
        {candles.map((candle) => {
          const candleX = (candle.x / 100) * (cakeWidth - 40) + 20
          const isBlowing = blowingAnimations.has(candle.id)

          return (
            <g key={candle.id}>
              {/* Candle stick */}
              <rect
                x={candleX - 3}
                y={cakeHeight * 0.1}
                width="6"
                height={candleHeight}
                fill={candle.lit ? "#FFD700" : "#C0C0C0"}
                stroke="#8B4513"
                strokeWidth="1"
                rx="2"
              />

              {/* Flame */}
              {candle.lit && (
                <g className="cursor-pointer" onClick={() => handleCandleClick(candle.id)}>
                  {/* Outer glow */}
                  <ellipse
                    cx={candleX}
                    cy={cakeHeight * 0.1 - 8}
                    rx="8"
                    ry="12"
                    fill="#FFD700"
                    opacity="0.3"
                    className="animate-pulse"
                  />

                  {/* Flame body */}
                  <path
                    d={`M ${candleX} ${cakeHeight * 0.1} Q ${candleX + 3} ${cakeHeight * 0.1 - 10} ${candleX} ${cakeHeight * 0.1 - 15} Q ${candleX - 3} ${cakeHeight * 0.1 - 10} ${candleX} ${cakeHeight * 0.1}`}
                    fill="url(#flameGradient)"
                    className="animate-flicker"
                  />

                  {/* Inner bright core */}
                  <ellipse
                    cx={candleX}
                    cy={cakeHeight * 0.1 - 8}
                    rx="3"
                    ry="6"
                    fill="#FFFFFF"
                    opacity="0.8"
                    className="animate-pulse"
                  />

                  {/* Clickable area (invisible but larger) */}
                  <circle
                    cx={candleX}
                    cy={cakeHeight * 0.1 - 8}
                    r="15"
                    fill="transparent"
                    className="hover:opacity-50"
                  />
                </g>
              )}

              {/* Blowing animation - smoke */}
              {isBlowing && (
                <g className="animate-smoke">
                  {[...Array(8)].map((_, i) => (
                    <circle
                      key={i}
                      cx={candleX + (Math.random() - 0.5) * 10}
                      cy={cakeHeight * 0.1 - 15 - i * 8}
                      r={2 + Math.random() * 3}
                      fill={`rgba(200, 200, 200, ${0.8 - i * 0.1})`}
                    />
                  ))}
                </g>
              )}

              {/* Extinguished wick */}
              {!candle.lit && (
                <circle cx={candleX} cy={cakeHeight * 0.1} r="2" fill="#555555" />
              )}
            </g>
          )
        })}

        {/* Gradients */}
        <defs>
          <linearGradient id="cakeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFB6C1" />
            <stop offset="50%" stopColor="#FF69B4" />
            <stop offset="100%" stopColor="#FF1493" />
          </linearGradient>
          <linearGradient id="flameGradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FF6348" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
        </defs>
      </svg>

      {/* CSS animations - using inline styles for SVG compatibility */}
      <style>{`
        @keyframes cake-flicker {
          0%, 100% {
            transform: scaleY(1) scaleX(1);
            opacity: 1;
          }
          25% {
            transform: scaleY(1.1) scaleX(0.95);
            opacity: 0.9;
          }
          50% {
            transform: scaleY(0.95) scaleX(1.05);
            opacity: 0.95;
          }
          75% {
            transform: scaleY(1.05) scaleX(0.98);
            opacity: 0.92;
          }
        }

        @keyframes cake-smoke {
          0% {
            transform: translateY(0);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-30px);
            opacity: 0;
          }
        }

        .animate-flicker {
          animation: cake-flicker 0.3s ease-in-out infinite;
          transform-origin: center bottom;
        }

        .animate-smoke {
          animation: cake-smoke 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
