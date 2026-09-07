import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

/**
 * Progress through a section that is taller than the viewport, measured from
 * the moment its top reaches the top of the screen.
 *
 * This is the mapping a pinned section needs. It reads 0 exactly when the
 * section locks into place and 1 when it releases, so a scene driven by it
 * starts genuinely empty rather than half-built — which is what happens if you
 * measure from the moment the section first appears at the bottom of the screen.
 *
 * Progress is written to a ref, not to state: the scene reads it every frame,
 * and putting scroll position into React state would re-render the tree sixty
 * times a second for nothing. The stage index is state, but it only changes
 * four times across the whole section, so it costs four renders.
 *
 * When `enabled` is false — reduced motion, or no WebGL — progress is pinned at
 * 1 so the still frame shows the finished building rather than an empty site.
 */
export function usePinProgress(
  ref: RefObject<HTMLElement>,
  stageStarts: readonly number[],
  enabled: boolean,
) {
  const progress = useRef(enabled ? 0 : 1)
  const [stage, setStage] = useState(enabled ? 0 : stageStarts.length - 1)

  useEffect(() => {
    if (!enabled) {
      progress.current = 1
      setStage(stageStarts.length - 1)
      return
    }

    const el = ref.current
    if (!el) return

    let frame = 0

    const measure = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      // How far the section can travel while its sticky stage is held in place.
      const travel = Math.max(rect.height - vh, 1)
      const p = Math.min(Math.max(-rect.top / travel, 0), 1)
      progress.current = p

      let next = 0
      for (let i = 0; i < stageStarts.length; i++) {
        if (p >= stageStarts[i]) next = i
      }
      setStage((current) => (current === next ? current : next))
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref, stageStarts, enabled])

  return { progress, stage }
}
