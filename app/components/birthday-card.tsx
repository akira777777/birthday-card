"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { IMAGES } from "../assets/images"
import { withBasePath } from "../scripts/withBasePath"

interface BirthdayCardProps {
  isVisible: boolean
  isMobile?: boolean
  onReplay?: () => void
}

export function BirthdayCard({ isVisible, isMobile = false, onReplay }: BirthdayCardProps) {
  const [entered, setEntered] = useState(false)
  const [showReplay, setShowReplay] = useState(false)

  useEffect(() => {
    if (!isVisible) {
      setEntered(false)
      setShowReplay(false)
      return
    }

    const raf = requestAnimationFrame(() => setEntered(true))
    const t = window.setTimeout(() => setShowReplay(true), 1500)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden safe-area-inset p-4">
      <div
        className={`w-[min(92vw,960px)] transition-[transform,opacity] duration-700 ${
          entered ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        <div className="relative overflow-hidden rounded-2xl shadow-2xl card-float">
          <Image
            src={withBasePath(IMAGES.card)}
            alt="Открытка с поздравлением"
            width={1954}
            height={1406}
            priority
            sizes="(max-width: 768px) 92vw, 960px"
            className="h-auto w-full select-none"
            draggable={false}
          />
        </div>

        {showReplay && onReplay && (
          <div className={`mt-5 flex justify-center pointer-events-auto ${isMobile ? "mt-4" : "mt-6"}`}>
            <button
              onClick={onReplay}
              className="rounded-full bg-black/70 px-6 py-3 text-white font-semibold backdrop-blur-md border border-white/20 hover:bg-black/80 active:scale-[0.98] transition"
            >
              Ещё раз
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
