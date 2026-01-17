import { useCallback, useEffect, useRef } from "react"

export const useTimeouts = () => {
  const timeoutsRef = useRef<number[]>([])

  const scheduleTimeout = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay)
    timeoutsRef.current.push(id)
    return id
  }, [])

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
  }, [])

  useEffect(() => {
    return () => clearTimeouts()
  }, [clearTimeouts])

  return { scheduleTimeout, clearTimeouts }
}
