import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { getProject } from '../data/projects'
import { getLenis } from './useLenis'

type Visit = {
  key: string
  to: string
  pathname: string
  index: number | null
  scrollY: number
  from?: string
}
type ReturnLink = {
  to: string
  label: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}
const ReturnContext = createContext<ReturnLink>({ to: '/work', label: 'All work' })

function historyIndex(): number | null {
  const index: unknown = window.history.state?.idx
  return typeof index === 'number' && Number.isInteger(index) ? index : null
}

function routeName(pathname: string): string | undefined {
  const pages: Record<string, string> = {
    '/': 'Home', '/work': 'All work', '/approach': 'Approach', '/about': 'About', '/contact': 'Contact',
  }
  if (pages[pathname]) return pages[pathname]
  const match = /^\/work\/([^/]+)$/.exec(pathname)
  return match ? getProject(match[1])?.title : undefined
}

/** Track only entries visited in this running tab: no referrer guesses or stale
 * session storage. New tabs, refreshes and direct arrivals get an honest fallback.
 */
export function RouteReturnProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const action = useNavigationType()
  const navigate = useNavigate()
  const to = location.pathname + location.search + location.hash
  const current = useRef<Visit>({ key: location.key, to, pathname: location.pathname, index: historyIndex(), scrollY: 0 })
  const visits = useRef(new Map<string, Visit>([[current.current.key, current.current]]))
  const indices = useRef(new Map<number, string>())
  const [, refresh] = useState(0)

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    const remember = () => { current.current.scrollY = window.scrollY }
    // Capture before a Link changes the DOM; scroll events retain positions for
    // browser Back/Forward and programmatic route changes too.
    window.addEventListener('scroll', remember, { passive: true })
    document.addEventListener('click', remember, true)
    return () => {
      window.history.scrollRestoration = previousRestoration
      window.removeEventListener('scroll', remember)
      document.removeEventListener('click', remember, true)
    }
  }, [])

  useLayoutEffect(() => {
    const previous = current.current
    const index = historyIndex()
    const changed = previous.key !== location.key || previous.to !== to
    let visit = visits.current.get(location.key)
    const knownVisit = visit?.to === to

    if (!knownVisit) {
      let from: string | undefined
      if (action === 'PUSH' && previous.index !== null && index === previous.index + 1) {
        // A repeated link or an anchor within the same page is not a useful
        // return destination. Keep the original source and skip that duplicate.
        from = previous.pathname === location.pathname ? previous.from : previous.key
      } else if (action === 'REPLACE') {
        from = previous.from
      }
      visit = { key: location.key, to, pathname: location.pathname, index, scrollY: 0, from }
      visits.current.set(location.key, visit)
    }
    const incoming = visit!
    if (action === 'PUSH' && index !== null) {
      // Pushing after Back discards the forward branch of browser history.
      for (const existing of indices.current.keys()) {
        if (existing >= index) indices.current.delete(existing)
      }
    }
    if (index !== null) indices.current.set(index, incoming.key)
    current.current = incoming
    if (changed) refresh((value) => value + 1)

    const restore = action === 'POP' && knownVisit && changed
    const scrollY = restore ? incoming.scrollY : 0
    let secondFrame = 0
    const position = () => {
      const lenis = getLenis()
      lenis?.resize()
      const anchor = !restore && location.hash ? document.getElementById(location.hash.slice(1)) : null
      if (anchor) {
        const clearance = Number.parseFloat(getComputedStyle(anchor).scrollMarginTop) || 0
        if (lenis) lenis.scrollTo(anchor, { offset: -clearance, immediate: true, force: true })
        else anchor.scrollIntoView({ behavior: 'auto', block: 'start' })
        if (anchor.hasAttribute('tabindex')) anchor.focus({ preventScroll: true })
      } else if (lenis) {
        lenis.scrollTo(scrollY, { immediate: true, force: true })
      } else {
        window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' })
      }
    }
    // Position before paint, then once after layout effects and Lenis setup.
    // Image/scene frames already reserve their dimensions in the page layout.
    position()
    const firstFrame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(position) })
    return () => { cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame) }
  }, [location.key, location.pathname, location.hash, to, action])

  const visit = current.current
  const source = visit.from ? visits.current.get(visit.from) : undefined
  const name = source ? routeName(source.pathname) : undefined
  const canReturn = source && name && source.pathname !== visit.pathname &&
    source.index !== null && visit.index !== null && source.index < visit.index &&
    indices.current.get(source.index) === source.key

  const link: ReturnLink = canReturn ? {
    to: source.to,
    label: `Back to ${name}`,
    onClick: (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return
      event.preventDefault()
      const now = historyIndex()
      // Only traverse a verified earlier entry in this tab; never use an
      // unbounded history.back() which could send a direct visitor off-site.
      if (now === visit.index && source.index !== null && indices.current.get(source.index) === source.key) {
        navigate(source.index - now!)
      } else {
        navigate('/work')
      }
    },
  } : { to: '/work', label: 'All work' }

  return <ReturnContext.Provider value={link}>{children}</ReturnContext.Provider>
}

export function useRouteReturn(): ReturnLink {
  return useContext(ReturnContext)
}
