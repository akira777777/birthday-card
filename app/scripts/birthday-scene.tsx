"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { imageAssets } from "../assets/images"
import { Confetti } from "../animations/confetti"
import { Fireworks, FireworksHandle } from "../animations/fireworks"
import type { GnomePosition } from "./gnome-layout"
import { createGnomePositions, getGnomeDimensions, moveGnome } from "./gnome-layout"
import { GnomeSprite } from "./gnome-sprite"
import { useDeviceContext } from "./use-device-context"
import { useTimeouts } from "./use-timeouts"
import { useViewport } from "./use-viewport"

const CLICK_TARGET = {
  mobile: 6,
  desktop: 10,
}

const MOVE_DELAY = 320
const CONFETTI_DELAY = 450
const FINALE_DELAY = 600

const scaleCount = (value: number, motionScale: number, minValue: number) => {
  return Math.max(minValue, Math.round(value * motionScale))
}

export const BirthdayScene = () => {
  const viewport = useViewport()
  const { isMobile, prefersReducedMotion } = useDeviceContext()
  const motionScale = prefersReducedMotion ? 0.55 : 1
  const fireworksRef = useRef<FireworksHandle>(null)
  const clickCountRef = useRef(0)
  const { scheduleTimeout } = useTimeouts()

  const [clickCount, setClickCount] = useState(0)
  const [gnomes, setGnomes] = useState<GnomePosition[]>([])
  const [showCard, setShowCard] = useState(false)
  const [gnomesVisible, setGnomesVisible] = useState(true)
  const [confettiActive, setConfettiActive] = useState(false)

  const clicksNeeded = useMemo(
    () => (isMobile ? CLICK_TARGET.mobile : CLICK_TARGET.desktop),
    [isMobile]
  )

  const gnomeCount = imageAssets.gnomes.length
  const gnomeDimensions = getGnomeDimensions(isMobile)

  useEffect(() => {
    if (!viewport.width || !viewport.height) return
    setGnomes(createGnomePositions(gnomeCount, viewport, isMobile))
  }, [viewport, isMobile, gnomeCount])

  const runFinale = useCallback(() => {
    const { width, height } = viewport
    if (!width || !height) return

    const centerX = width / 2
    const centerY = height / 2
    const ringCount = scaleCount(isMobile ? 6 : 10, motionScale, 4)
    const ringParticles = scaleCount(isMobile ? 38 : 60, motionScale, 24)
    const burstParticles = scaleCount(isMobile ? 48 : 80, motionScale, 32)
    const finaleParticles = scaleCount(isMobile ? 70 : 120, motionScale, 48)

    for (let i = 0; i < ringCount; i += 1) {
      scheduleTimeout(() => {
        const angle = (Math.PI * 2 * i) / ringCount
        const radius = isMobile ? 140 : 220
        fireworksRef.current?.launch(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius,
          ringParticles
        )
      }, i * (isMobile ? 170 : 140))
    }

    scheduleTimeout(() => {
      for (let i = 0; i < 4; i += 1) {
        scheduleTimeout(() => {
          fireworksRef.current?.launch(
            centerX + (Math.random() - 0.5) * width * 0.6,
            centerY + (Math.random() - 0.5) * height * 0.5,
            burstParticles
          )
        }, i * 180)
      }
    }, isMobile ? 1200 : 1500)

    scheduleTimeout(() => {
      fireworksRef.current?.launch(centerX, centerY, finaleParticles)
      setShowCard(true)
      scheduleTimeout(() => setConfettiActive(true), CONFETTI_DELAY)
    }, isMobile ? 1800 : 2100)
  }, [viewport, isMobile, motionScale, scheduleTimeout])

  const handleGnomeClick = useCallback(
    (centerX: number, centerY: number, gnomeId: number) => {
      if (!gnomesVisible || showCard) return

      const nextCount = clickCountRef.current + 1
      clickCountRef.current = nextCount
      setClickCount(nextCount)

      const burstCount = scaleCount(isMobile ? 28 : 40, motionScale, 20)
      fireworksRef.current?.launch(centerX, centerY, burstCount)

      if (nextCount >= clicksNeeded) {
        setGnomesVisible(false)
        scheduleTimeout(runFinale, FINALE_DELAY)
        return
      }

      if (viewport.width && viewport.height) {
        scheduleTimeout(() => {
          setGnomes((prev) => moveGnome(prev, gnomeId, viewport, isMobile))
        }, MOVE_DELAY)
      }
    },
    [gnomesVisible, showCard, isMobile, motionScale, clicksNeeded, scheduleTimeout, runFinale, viewport]
  )

  return (
    <div className="scene">
      <Image
        src={imageAssets.card}
        alt=""
        fill
        priority
        sizes="100vw"
        className="scene__background"
        aria-hidden
      />

      <Fireworks ref={fireworksRef} isMobile={isMobile} motionScale={motionScale} />
      <Confetti
        active={confettiActive}
        isMobile={isMobile}
        motionScale={motionScale}
        onComplete={() => setConfettiActive(false)}
      />

      {!showCard && (
        <div className="scene__hud">
          <div className="scene__text scene__text--top" role="status" aria-live="polite">
            Гномики: <span className="scene__text--accent">{clickCount}</span> / {clicksNeeded}
          </div>
          {clickCount === 0 && (
            <div className="scene__text scene__text--bottom">Найдите и нажмите на гномиков</div>
          )}
        </div>
      )}

      {gnomes.map((gnome, index) => (
        <GnomeSprite
          key={gnome.id}
          id={gnome.id}
          src={imageAssets.gnomes[index % imageAssets.gnomes.length]}
          x={gnome.x}
          y={gnome.y}
          width={gnomeDimensions.width}
          height={gnomeDimensions.height}
          floatDelay={gnome.floatDelay}
          floatDuration={gnome.floatDuration}
          tilt={gnome.tilt}
          isVisible={gnomesVisible}
          prefersReducedMotion={prefersReducedMotion}
          onClick={handleGnomeClick}
        />
      ))}

      {showCard && (
        <div className="card">
          <Image
            src={imageAssets.card}
            alt="Поздравительная открытка"
            fill
            priority
            sizes="(max-width: 768px) 90vw, 820px"
            className="card__image"
          />
        </div>
      )}
    </div>
  )
}
