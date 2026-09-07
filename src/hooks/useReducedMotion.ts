import { useEffect, useState } from 'react'

/**
 * Tracks the visitor's reduced-motion preference, and keeps tracking it if they
 * change it mid-session.
 *
 * Every 3D scene and every scroll animation on this site reads this. Under
 * reduced motion a scene returns a static rendered frame, never a blank space.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
