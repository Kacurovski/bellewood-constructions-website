import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useIsPresent, useScroll } from 'framer-motion'
import { Logo } from './Logo'
import { contact, nav, site } from '../config/site'
import { getLenis } from '../hooks/useLenis'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './Header.module.css'

const firstName = contact.principal.split(' ')[0]
type CloseReason = 'dismiss' | 'navigate' | 'resize'

/** The same navigation on every page, with a separate mobile modal panel. */
export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const closeReason = useRef<CloseReason>('dismiss')
  const location = useLocation()
  const { scrollYProgress } = useScroll()

  const closeMenu = useCallback((reason: CloseReason = 'dismiss') => {
    closeReason.current = reason
    setOpen(false)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => closeMenu('navigate'), [location.pathname, location.hash, closeMenu])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 881px)')
    const onResize = () => { if (desktop.matches) closeMenu('resize') }
    desktop.addEventListener('change', onResize)
    return () => desktop.removeEventListener('change', onResize)
  }, [closeMenu])

  const overDark = !scrolled
  const activeIndex = nav.findIndex(
    (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
  )

  return (
    <>
      <header className={[styles.header, scrolled ? styles.scrolled : '', overDark ? styles.overDark : ''].join(' ')}>
        <div className={[styles.inner, 'shell'].join(' ')}>
          <Link to="/" className={styles.brand} aria-label={`${site.name} home`}>
            <Logo variant="lockup" tone={overDark ? 'reverse' : 'green'} width={168} decorative />
          </Link>
          <PrimaryNav activeIndex={activeIndex} />
          <CallButton />
          <a className={styles.callCompact} href={contact.phoneHref} aria-label={`Call ${firstName} on ${contact.phone}`}>
            <PhoneGlyph />
          </a>
          <button type="button" className={styles.toggle} aria-expanded={open}
            aria-controls="mobile-nav" aria-haspopup="dialog"
            onClick={() => { closeReason.current = 'dismiss'; setOpen(true) }}>
            <span className="visually-hidden">Open menu</span>
            <span className={styles.bar} aria-hidden="true" />
          </button>
        </div>
        <motion.span className={styles.progress} style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      </header>
      <AnimatePresence>
        {open && <MobileMenu key="mobile-menu" activeIndex={activeIndex} closeReason={closeReason} onClose={closeMenu} />}
      </AnimatePresence>
    </>
  )
}

/** Native dialog supplies modal semantics, background inertness and focus containment.
 * It is mounted only while open/closing, so hidden links cannot receive focus. */
function MobileMenu({ activeIndex, closeReason, onClose }: {
  activeIndex: number
  closeReason: MutableRefObject<CloseReason>
  onClose: (reason?: CloseReason) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()
  const present = useIsPresent()

  useLayoutEffect(() => {
    const node = dialog.current
    if (!node) return
    const previousFocus = document.activeElement
    const root = document.documentElement
    const rootOverflow = root.style.overflow
    const bodyOverflow = document.body.style.overflow
    const rootPadding = root.style.paddingRight
    const scrollbar = window.innerWidth - root.clientWidth
    const lenis = getLenis()
    const resume = lenis && !lenis.isStopped
    lenis?.stop()
    root.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) root.style.paddingRight = `${parseFloat(getComputedStyle(root).paddingRight) + scrollbar}px`
    node.showModal()
    closeButton.current?.focus({ preventScroll: true })

    return () => {
      node.close()
      root.style.overflow = rootOverflow
      document.body.style.overflow = bodyOverflow
      root.style.paddingRight = rootPadding
      if (resume) lenis?.start()
      if (closeReason.current === 'navigate') {
        document.getElementById('main')?.focus({ preventScroll: true })
      } else if (closeReason.current === 'resize') {
        const destination = document.querySelector<HTMLElement>('nav[aria-label="Primary"] a[aria-current="page"]')
          ?? document.querySelector<HTMLElement>('header a')
        destination?.focus({ preventScroll: true })
      } else if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true })
      }
    }
  }, [closeReason])

  return (
    <motion.dialog ref={dialog} id="mobile-nav" aria-label="Main menu" className={styles.mobileDialog}
      data-lenis-prevent data-exiting={!present || undefined}
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : -10 }}
      animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -8 }}
      transition={{ duration: reduced ? 0 : present ? .4 : .2, ease: [0.16, 1, 0.3, 1] }}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const links = event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)')
        const first = links[0]
        const last = links[links.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (event.clientY > rect.bottom || event.clientY < rect.top || event.clientX < rect.left || event.clientX > rect.right) onClose()
      }}>
      <div className={[styles.mobileTop, 'shell'].join(' ')}>
        <Link to="/" className={styles.brand} aria-label={`${site.name} home`} onClick={() => onClose('navigate')}>
          <Logo variant="lockup" tone="green" width={168} decorative />
        </Link>
        <button ref={closeButton} type="button" className={styles.close} onClick={() => onClose()} autoFocus>
          <span>Close</span>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M6 18 18 6" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
      <div className={[styles.mobileBody, 'shell'].join(' ')}>
        <nav aria-label="Mobile primary">
          <ul className={styles.mobileList}>
            {nav.map((item, i) => (
              <li key={item.to}>
                <NavLink to={{ pathname: item.to, hash: item.hash }} onClick={() => onClose('navigate')}
                  className={[styles.mobileLink, i === activeIndex ? styles.mobileActive : ''].join(' ')}>
                  <span className={styles.mobileLabel}>{item.label}</span>
                  {i === activeIndex ? <span className={styles.currentPage} aria-hidden="true">You're here</span> : <MenuArrow />}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <a className={styles.mobileCall} href={contact.phoneHref}>
          <span><span className={styles.mobileCallLabel}>Call {firstName}</span><span className={styles.mobileNumber}>{contact.phone}</span></span>
          <span className={styles.mobileCallIcon}><PhoneGlyph /></span>
        </a>
      </div>
    </motion.dialog>
  )
}

function MenuArrow() {
  return <svg className={styles.menuArrow} viewBox="0 0 40 24" width="40" height="24" fill="none" aria-hidden="true">
    <path d="M2 12h34m-9-8 9 8-9 8" stroke="currentColor" strokeWidth="1.2" />
  </svg>
}

/** The capsule's moving hover wash is independent of the current-page marker. */
function PrimaryNav({ activeIndex }: { activeIndex: number }) {
  const reduced = useReducedMotion()
  const listRef = useRef<HTMLUListElement>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [pointed, setPointed] = useState<number | null>(null)
  const [spans, setSpans] = useState<{ left: number; width: number }[]>([])

  /* Where each route sits inside the capsule. Measured rather than guessed,
     because the labels are different lengths, each is as wide as the wider of
     its two faces, and the variable fonts may still be arriving. Measured from
     inside the capsule's border, since that is what the pill is placed
     against. */
  useLayoutEffect(() => {
    const measure = () => {
      const list = listRef.current
      if (!list) return
      const origin = list.getBoundingClientRect().left + list.clientLeft
      setSpans(
        linkRefs.current.map((link) => {
          if (!link) return { left: 0, width: 0 }
          const box = link.getBoundingClientRect()
          return { left: box.left - origin, width: box.width }
        }),
      )
    }
    measure()
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => window.removeEventListener('resize', measure)
  }, [activeIndex])

  // Hover/focus has its own soft surface. The current route keeps its underline.
  const target = pointed
  const span = target == null ? null : spans[target]
  const visible = span != null && span.width > 0

  /* When the pill appears from nothing it should appear WHERE it is going, not
     slide in from the left end of the capsule. So the first frame after it was
     hidden places it instantly, and only moves between routes are eased. */
  const last = useRef<{ left: number; width: number }>({ left: 0, width: 0 })
  const wasVisible = useRef(false)
  if (span && visible) last.current = span
  const jump = !wasVisible.current || reduced
  useEffect(() => {
    wasVisible.current = visible
  })

  const glide = { duration: jump ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] as const }

  return (
    <nav className={styles.nav} aria-label="Primary">
      <ul ref={listRef} className={styles.list} onPointerLeave={() => setPointed(null)}>
        <motion.li
          aria-hidden="true"
          className={styles.cell}
          initial={false}
          animate={{
            x: last.current.left,
            width: last.current.width,
            opacity: visible ? 1 : 0,
          }}
          transition={{ x: glide, width: glide, opacity: { duration: reduced ? 0 : 0.25 } }}
        />

        {nav.map((item, i) => (
          <li key={item.label} className={styles.item}>
            <NavLink
              ref={(el) => {
                linkRefs.current[i] = el
              }}
              to={{ pathname: item.to, hash: item.hash }}
              className={[styles.link, i === activeIndex ? styles.active : ''].join(' ').trim()}
              aria-current={i === activeIndex ? 'page' : undefined}
              onPointerEnter={() => setPointed(i)}
              onFocus={() => setPointed(i)}
              onBlur={() => setPointed(null)}
            >
              {/* The word, then the same word set in Newsreader — the serif the
                  hero's changing word is set in — stacked in a window one line
                  tall. The serif copy is only there to roll into view, so it is
                  hidden from assistive tech and the link is read once. */}
              <span className={styles.linkWindow}>
                <span className={styles.linkRoll}>
                  <span className={styles.linkSans}>{item.label}</span>
                  <span className={styles.linkSerif} aria-hidden="true">
                    {item.label}
                  </span>
                </span>
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** One steady call action, with a small handset response on hover. */
function CallButton() {
  return (
    <a href={contact.phoneHref} className={styles.call}>
      <span className={styles.callBadge} aria-hidden="true"><PhoneGlyph /></span>
      <span className={styles.callWords}>
        <span className={styles.callLabel}>Call {firstName}</span>
        <span className={styles.callNumber}>{contact.phone}</span>
      </span>
    </a>
  )
}

/** A handset, drawn at the site's line weight rather than taken from an icon set. */
function PhoneGlyph() {
  return (
    <svg
      className={styles.glyph}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6.6 3.5h2.6l1.6 4.2-2 1.3a10.5 10.5 0 0 0 6.2 6.2l1.3-2 4.2 1.6v2.6a1.8 1.8 0 0 1-1.9 1.8A15.8 15.8 0 0 1 4.8 5.4a1.8 1.8 0 0 1 1.8-1.9z" />
    </svg>
  )
}
