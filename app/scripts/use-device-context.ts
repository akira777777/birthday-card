import { useEffect, useRef, useState } from "react"

interface DeviceContext {
  isMobile: boolean
  prefersReducedMotion: boolean
}

const MOBILE_WIDTH_BREAKPOINT = 768
const RESIZE_DEBOUNCE_MS = 150

/**
 * Determines if device is mobile based on:
 * 1. Screen width below breakpoint
 * 2. CSS pointer media query (coarse = touch primary input)
 * 
 * Note: hasTouch alone is unreliable as many laptops support touch.
 */
const checkIsMobile = (): boolean => {
  if (typeof window === "undefined") return false
  
  const isNarrowScreen = window.innerWidth < MOBILE_WIDTH_BREAKPOINT
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches
  const isPortrait = window.matchMedia("(orientation: portrait)").matches
  
  // Mobile = narrow screen OR (coarse pointer AND portrait orientation)
  // This catches phones but excludes touch-enabled laptops
  return isNarrowScreen || (hasCoarsePointer && isPortrait)
}

export const useDeviceContext = (): DeviceContext => {
  const [isMobile, setIsMobile] = useState(() => checkIsMobile())
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const resizeTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const updateDevice = () => {
      setIsMobile(checkIsMobile())
    }

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current)
      }
      resizeTimeoutRef.current = window.setTimeout(updateDevice, RESIZE_DEBOUNCE_MS)
    }

    // Initial check
    updateDevice()
    
    window.addEventListener("resize", handleResize)
    
    // Also listen for orientation changes on mobile
    window.addEventListener("orientationchange", updateDevice)
    
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", updateDevice)
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updatePreference = () => setPrefersReducedMotion(media.matches)

    updatePreference()
    media.addEventListener("change", updatePreference)
    return () => media.removeEventListener("change", updatePreference)
  }, [])

  return { isMobile, prefersReducedMotion }
}
