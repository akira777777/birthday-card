"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"

interface BirthdayCardProps {
  isVisible: boolean
  isMobile?: boolean
  onReplay?: () => void
}

// Get base path for GitHub Pages compatibility
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const cardImagePath = `${basePath}/assets/images/card-image.png`

// Confetti colors matching the card's gold/green theme
const confettiColors = [
  "#FFD700", "#DAA520", "#B8860B", "#F0E68C", "#FAFAD2",
  "#228B22", "#2E8B57", "#3CB371", "#DC143C", "#FF6347"
]

interface ConfettiPiece {
  id: number
  x: number
  delay: number
  duration: number
  color: string
  size: number
  rotation: number
  shape: 'circle' | 'star' | 'rect'
}

export function BirthdayCard({ isVisible, isMobile = false, onReplay }: BirthdayCardProps) {
  const [showCard, setShowCard] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showReplayButton, setShowReplayButton] = useState(false)

  // Generate confetti pieces with memoization
  const confettiPieces = useMemo<ConfettiPiece[]>(() => {
    const count = isMobile ? 30 : 60
    const shapes: Array<'circle' | 'star' | 'rect'> = ['circle', 'star', 'rect']
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 3,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      size: isMobile ? 6 + Math.random() * 10 : 8 + Math.random() * 14,
      rotation: Math.random() * 360,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }))
  }, [isMobile])

  // Haptic feedback for mobile
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30, 10, 50]
      }
      navigator.vibrate(patterns[type])
    }
  }, [])

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/9c660348-1fae-41cb-ac60-ee349900db14', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'birthday-card.tsx:67', message: 'BirthdayCard useEffect triggered', data: { isVisible, hasOnReplay: !!onReplay }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'initial', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion

    if (!isVisible) {
      setShowCard(false)
      setShowConfetti(false)
      setShowReplayButton(false)
      return
    }

    // Start confetti immediately
    setShowConfetti(true)
    triggerHaptic('heavy')

    // Show card with slight delay for dramatic effect
    setTimeout(() => {
      setShowCard(true)
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/9c660348-1fae-41cb-ac60-ee349900db14', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'birthday-card.tsx:85', message: 'Card shown', data: { showCard: true }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'initial', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion
    }, 200)

    // Show replay button after card animation
    setTimeout(() => {
      setShowReplayButton(true)
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/9c660348-1fae-41cb-ac60-ee349900db14', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'birthday-card.tsx:93', message: 'Replay button shown', data: { showReplayButton: true }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'initial', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion
    }, 2500)

  }, [isVisible, triggerHaptic, onReplay])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none overflow-hidden safe-area-inset">
      {/* Confetti rain effect */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confettiPieces.map((piece) => (
            <div
              key={`confetti-${piece.id}`}
              className="absolute animate-confetti-fall gpu-accelerated"
              style={{
                left: `${piece.x}%`,
                top: '-5%',
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
              }}
            >
              {piece.shape === 'star' ? (
                <svg
                  width={piece.size}
                  height={piece.size}
                  viewBox="0 0 24 24"
                  style={{ transform: `rotate(${piece.rotation}deg)` }}
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill={piece.color}
                  />
                </svg>
              ) : (
                <div
                  style={{
                    width: `${piece.size}px`,
                    height: piece.shape === 'rect' ? `${piece.size / 2}px` : `${piece.size}px`,
                    backgroundColor: piece.color,
                    borderRadius: piece.shape === 'circle' ? '50%' : '2px',
                    transform: `rotate(${piece.rotation}deg)`,
                    boxShadow: `0 0 ${piece.size / 2}px ${piece.color}40`,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Glowing background effect */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${showCard ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
        }}
      />

      {/* Main card container */}
      <div
        className={`relative transition-all duration-1000 ease-out ${showCard
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-75 translate-y-12'
          } ${isMobile ? 'w-[95vw] max-w-[400px]' : 'w-[90vw] max-w-[700px]'}`}
      >
        {/* Outer glow */}
        <div
          className={`absolute -inset-4 bg-gradient-to-r from-yellow-400/50 via-amber-300/50 to-yellow-400/50 rounded-3xl blur-2xl animate-glow-pulse transition-opacity duration-500 ${showCard ? 'opacity-100' : 'opacity-0'
            }`}
        />

        {/* Sparkle decorations around card */}
        {showCard && !isMobile && (
          <div className="absolute -inset-16 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-sparkle"
                style={{
                  left: `${50 + Math.cos((i * Math.PI * 2) / 12) * 55}%`,
                  top: `${50 + Math.sin((i * Math.PI * 2) / 12) * 55}%`,
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFD700">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            ))}
          </div>
        )}

        {/* Card with image */}
        <div
          className={`relative rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-200/60 ${isMobile ? 'rounded-xl border-2' : 'rounded-3xl'
            }`}
          style={{
            boxShadow: showCard
              ? '0 25px 80px rgba(218, 165, 32, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3), inset 0 0 60px rgba(255, 215, 0, 0.1)'
              : 'none',
          }}
        >
          {/* Birthday card image */}
          <Image
            src={cardImagePath}
            alt="С Днём Рождения, Татьяна!"
            width={isMobile ? 400 : 700}
            height={isMobile ? 300 : 525}
            className={`w-full h-auto transition-all duration-700 ${imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
              }`}
            onLoad={() => setImageLoaded(true)}
            priority
            draggable={false}
          />

          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none"
            style={{ backgroundSize: '200% 100%' }}
          />

          {/* Corner decorations */}
          <div className={`absolute ${isMobile ? 'top-1 left-1 text-lg' : 'top-2 left-2 text-2xl'} animate-float`}>
            ✨
          </div>
          <div className={`absolute ${isMobile ? 'top-1 right-1 text-lg' : 'top-2 right-2 text-2xl'} animate-float`} style={{ animationDelay: '0.5s' }}>
            🌟
          </div>
          <div className={`absolute ${isMobile ? 'bottom-1 left-1 text-lg' : 'bottom-2 left-2 text-2xl'} animate-float`} style={{ animationDelay: '1s' }}>
            💫
          </div>
          <div className={`absolute ${isMobile ? 'bottom-1 right-1 text-lg' : 'bottom-2 right-2 text-2xl'} animate-float`} style={{ animationDelay: '1.5s' }}>
            ⭐
          </div>
        </div>

        {/* Replay button */}
        {showReplayButton && onReplay && (
          <div
            className={`flex justify-center pointer-events-auto animate-slide-up ${isMobile ? 'mt-4' : 'mt-8'
              }`}
          >
            <button
              onClick={onReplay}
              className={`group relative overflow-hidden bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white font-bold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-amber-300/50 ${isMobile
                ? "px-6 py-3 text-base"
                : "px-10 py-4 text-xl"
                }`}
              style={{
                boxShadow: '0 10px 40px rgba(218, 165, 32, 0.4)',
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="animate-wiggle">🔄</span>
                <span>Ещё раз!</span>
                <span className="animate-wiggle" style={{ animationDelay: "0.25s" }}>🎉</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        )}
      </div>

      {/* Floating emojis around the screen */}
      {showCard && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['🎂', '🎁', '🎈', '🎊', '💝', '🌸'].map((emoji, i) => (
            <div
              key={emoji}
              className="absolute text-3xl md:text-4xl animate-float"
              style={{
                left: `${10 + (i * 15)}%`,
                top: `${15 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
