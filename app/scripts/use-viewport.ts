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
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/f6222dd9-f5c7-4c16-892a-92bc4115664b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-viewport.ts:8',message:'viewport updated',data:{width:window.innerWidth,height:window.innerHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }

    updateViewport()
    window.addEventListener("resize", updateViewport)
    return () => window.removeEventListener("resize", updateViewport)
  }, [])

  return viewport
}
