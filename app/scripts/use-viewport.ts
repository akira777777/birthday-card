import { useEffect, useRef, useState } from "react"
import type { ViewportSize } from "./gnome-layout"

const RESIZE_DEBOUNCE_MS = 100

const getViewportSize = (): ViewportSize => {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 }
  }
  // visualViewport is more accurate on mobile (excludes browser chrome, keyboard)
  if (window.visualViewport) {
    return {
      width: window.visualViewport.width,
      height: window.visualViewport.height,
    }
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

/**
 * Returns viewport dimensions with debounced resize handling.
 * Uses visualViewport API when available for accurate mobile dimensions
 * (accounts for virtual keyboard, browser chrome, etc.)
 */
export const useViewport = (): ViewportSize => {
  const [viewport, setViewport] = useState<ViewportSize>(getViewportSize)
  const resizeTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const updateViewport = () => {
      setViewport(getViewportSize())
    }

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current)
      }
      resizeTimeoutRef.current = window.setTimeout(updateViewport, RESIZE_DEBOUNCE_MS)
    }

    // Initial update
    updateViewport()

    window.addEventListener("resize", handleResize, { passive: true })
    window.addEventListener("orientationchange", handleResize, { passive: true })

    // visualViewport fires separate resize events (e.g., when keyboard opens)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize)
      }
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [])

  return viewport
}
