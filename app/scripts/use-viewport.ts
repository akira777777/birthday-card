import { useEffect, useState } from "react"
import type { ViewportSize } from "./gnome-layout"

export const useViewport = (): ViewportSize => {
  const [viewport, setViewport] = useState<ViewportSize>(() => {
    if (typeof window !== "undefined") {
      return { width: window.innerWidth, height: window.innerHeight }
    }
    return { width: 0, height: 0 }
  })

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }

    updateViewport()
    window.addEventListener("resize", updateViewport)
    return () => window.removeEventListener("resize", updateViewport)
  }, [])

  return viewport
}
