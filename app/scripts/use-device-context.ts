import { useEffect, useState } from "react"

interface DeviceContext {
  isMobile: boolean
  prefersReducedMotion: boolean
}

const MOBILE_WIDTH_BREAKPOINT = 768

export const useDeviceContext = (): DeviceContext => {
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const updateDevice = () => {
      const hasTouch = navigator.maxTouchPoints > 0 || "ontouchstart" in window
      setIsMobile(window.innerWidth < MOBILE_WIDTH_BREAKPOINT || hasTouch)
    }

    updateDevice()
    window.addEventListener("resize", updateDevice)
    return () => window.removeEventListener("resize", updateDevice)
  }, [])

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

  return { isMobile, prefersReducedMotion }
}
