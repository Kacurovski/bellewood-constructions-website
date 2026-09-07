import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/**
 * How far a section has travelled through the viewport, from 0 as its top
 * enters the bottom of the screen to 1 as its bottom leaves the top.
 *
 * Written to a ref rather than to state on purpose: the 3D scenes read it every
 * frame, and putting scroll position into React state would re-render the tree
 * sixty times a second for no reason at all.
 */
export function useSectionProgress(ref: RefObject<HTMLElement>) {
  const progress = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let frame = 0

    const measure = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const total = rect.height + vh
      const travelled = vh - rect.top
      progress.current = Math.min(Math.max(travelled / total, 0), 1)
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
  }, [ref])

  return progress
}
