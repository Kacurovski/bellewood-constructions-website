import { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from './useReducedMotion'

/**
 * Smooth scroll. Weighted and slow rather than floaty — the easing should feel
 * like something with mass moving, not a page sliding on ice.
 *
 * Disabled entirely under reduced motion, and on coarse pointers, where native
 * momentum scrolling is already better than anything we would impose.
 */
/**
 * The running instance, or null where smooth scroll is off.
 *
 * It has to be reachable from outside the hook. Lenis takes the page's scroll
 * over: it keeps its own position and writes it to the window every frame, so a
 * plain `window.scrollTo(0, 0)` is overwritten on the very next frame and the
 * page stays exactly where it was. That is what made a new route open at
 * whatever height the last one was left at.
 */
let current: Lenis | null = null

/** For the route change, which has to reset the scroll Lenis actually owns. */
export const getLenis = () => current

export function useLenis(): void {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      wheelMultiplier: 0.9,
touchMultiplier: 1.4,
    })

    current = lenis

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      current = null
    }
  }, [reduced])
}
