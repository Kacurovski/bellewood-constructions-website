import { useCallback, useEffect, useRef, useState } from 'react'
import { useMotionValue } from 'framer-motion'

const REVEAL_MS = 2200
const HOLD_MS = 3000

/** One clock drives both the model and its native range input. React only
 * renders when the visitor changes mode, not on every animation frame. */
export function useHousePreview(active: boolean) {
  const progress = useMotionValue(0)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)
  const sequence = useRef({ phase: 'hold' as 'hold' | 'move', elapsed: 0, duration: 1600, from: 0, to: 1 })
  const running = active && !paused

  const pause = useCallback(() => {
    pausedRef.current = true
    setPaused(true)
  }, [])

  const resume = useCallback(() => {
    pausedRef.current = false
    setPaused(false)
  }, [])

  const seek = useCallback((value: number) => {
    pause()
    const next = Math.max(0, Math.min(1, value))
    const previous = progress.get()
    // Continue in the visitor's direction when they resume, including a
    // reversal at either endpoint. Seeking never adds smoothing or a delay.
    const to = next === 0 ? 1 : next === 1 ? 0 : next > previous ? 1 : next < previous ? 0 : sequence.current.to
    sequence.current = { phase: 'move', elapsed: 0, duration: Math.max(350, REVEAL_MS * Math.abs(to - next)), from: next, to }
    progress.set(next)
  }, [pause, progress])

  useEffect(() => {
    if (!running) return
    let frame = 0
    let previousTime: number | undefined
    const tick = (now: number) => {
      if (pausedRef.current) return
      const delta = previousTime === undefined ? 0 : now - previousTime
      previousTime = now
      const leg = sequence.current
      leg.elapsed = Math.min(leg.duration, leg.elapsed + delta)
      if (leg.phase === 'move') {
        const t = leg.elapsed / leg.duration
        progress.set(leg.from + (leg.to - leg.from) * t * t * (3 - 2 * t))
      }
      if (leg.elapsed >= leg.duration) {
        sequence.current = leg.phase === 'hold'
          ? { phase: 'move', elapsed: 0, duration: REVEAL_MS, from: progress.get(), to: leg.to }
          : { phase: 'hold', elapsed: 0, duration: HOLD_MS, from: leg.to, to: leg.to === 1 ? 0 : 1 }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    // Preserve the exact phase and position when hidden, off-screen or paused.
    return () => cancelAnimationFrame(frame)
  }, [running, progress])

  return { progress, paused, running, pause, resume, seek }
}
