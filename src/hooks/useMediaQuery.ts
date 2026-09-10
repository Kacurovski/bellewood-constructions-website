import { useEffect, useState } from 'react'

/**
 * Tracks a media query, and keeps tracking it if the window is resized or the
 * device changes underneath it.
 *
 * Used where the difference between two layouts is not something CSS can
 * express — the work index renders a hover preview on a pointer device and a
 * swipe rail on a touch one, and rendering both and hiding one with CSS would
 * put every photograph in the DOM twice.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    // Read once on mount as well: the query can have changed between the
    // initial render and the effect running.
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return matches
}
