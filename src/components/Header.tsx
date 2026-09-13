import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, useMotionValue, useScroll, useSpring } from 'framer-motion'
import { Logo } from './Logo'
import { contact, nav, site } from '../config/site'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './Header.module.css'

/**
 * A quiet header. The mark, the routes, and the phone number — nothing else.
 *
 * The phone number is deliberately prominent and tap-to-call on mobile:
 * missed-call text-back runs off Angus's mobile and is the first thing this
 * engagement switched on.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  /* How far down the page you are, drawn along the header's own bottom rule.
     A bar of its own across the top of the window is the generic version of
     this and it would be a tenth element on a page that already has enough;
     the header already draws a line there, so the line is the indicator. */
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [location.pathname, location.hash])

  /* Every route now opens on a dark band — the hero on the home page, the
     PageHead masthead everywhere else — so at the top of any page the header
     floats over Deep Pine and goes reverse. It returns to ink as soon as the
     page is scrolled off that band, or when the mobile menu opens over it. */
  const overDark = !scrolled && !open

  /* The live route. A project page lives under Work, so it marks Work — the
     index is where you came from and where the header should say you are. */
  const activeIndex = nav.findIndex(
    (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
  )

  return (
    <header
      className={[
        styles.header,
        scrolled ? styles.scrolled : '',
        overDark ? styles.overDark : '',
        open ? styles.menuOpen : '',
      ].join(' ')}
    >
      <div className={[styles.inner, 'shell'].join(' ')}>
        <Link to="/" className={styles.brand} aria-label={`${site.name} — home`}>
          <Logo variant="lockup" tone={overDark ? 'reverse' : 'green'} width={168} decorative />
        </Link>

        <PrimaryNav activeIndex={activeIndex} />

        <CallButton />

        {/* On a phone the number used to vanish into the menu, which is the
            one place a tap-to-call button does no good. It stays in the bar
            as a square the same size as the menu toggle beside it. */}
        <a
          className={styles.callCompact}
          href={contact.phoneHref}
          aria-label={`Call ${firstName} on ${contact.phone}`}
        >
          <PhoneGlyph />
        </a>

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          <span className={[styles.bar, open ? styles.barOpen : ''].join(' ')} aria-hidden="true" />
        </button>
      </div>

      <motion.span
        className={styles.progress}
        style={{ scaleX: scrollYProgress }}
        aria-hidden="true"
      />

      <div id="mobile-nav" className={[styles.mobile, open ? styles.mobileOpen : ''].join(' ')}>
        {/* The panel opens and the links follow it in, one after another. It
            is the same stagger the headline uses, at the one moment on a phone
            where the whole screen changes at once. */}
        <ul className={styles.mobileList}>
          {nav.map((item, i) => (
            <li key={item.label} style={{ '--i': i } as React.CSSProperties}>
              <NavLink
                to={{ pathname: item.to, hash: item.hash }}
                className={[styles.mobileLink, i === activeIndex ? styles.mobileActive : '']
                  .join(' ')
                  .trim()}
              >
                <span className={styles.mobileIndex} aria-hidden="true">
                  {index(i)}
                </span>
                {item.label}
              </NavLink>
            </li>
          ))}
          <li className={styles.mobileCall} style={{ '--i': nav.length } as React.CSSProperties}>
            <CallButton block />
          </li>
        </ul>
      </div>
    </header>
  )
}

const firstName = contact.principal.split(' ')[0]

/** Two-digit sheet numbering — the same convention as A-01, Fig. 1, 01 / 06. */
const index = (i: number) => String(i + 1).padStart(2, '0')

/**
 * The routes, in a capsule of frosted glass.
 *
 * Two earlier versions were sent back. Four bare words had no design until the
 * pointer arrived; a framed strip with sheet numbers had design, but it was
 * square and technical, and it sat next to a call button whose round badge and
 * rolling words were the part of the bar that felt right. So the routes now
 * speak the button's language instead of the drawing's: one soft capsule at
 * rest, a pill of light that glides between routes, and words that roll.
 *
 * The roll is where the brand comes in. Each route turns over from Archivo into
 * the same word in Newsreader, the serif the hero's changing word is set in, so
 * pointing at a link borrows the one typographic gesture the home page is built
 * around. It is upright, not italic: there is no italic cut in the self-hosted
 * files, and a slanted faux italic is the cheapest thing a browser draws.
 *
 * The pill rests behind the page you are on, slides to whichever route you
 * point at, stretches to its width, and returns when you leave. The text never
 * changes colour under it: a fill that inverts the text has to flip the text at
 * one instant while the fill is still travelling, and for that moment the word
 * is the colour of the ground. A tint the text can sit on either way has no
 * such moment.
 */
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
  }, [])

  /* The route under the pointer wins; with nothing pointed at, the pill rests
     behind the live page. On the home page there is no live route in the
     capsule, so it rests nowhere and only appears when it is wanted. */
  const target = pointed ?? (activeIndex >= 0 ? activeIndex : null)
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

/**
 * Call Angus, as the one solid thing in the bar.
 *
 * Everything else in the header is line and tint, so the single most valuable
 * action on the site is the only filled shape: Wash on the dark hero, Bellewood
 * Green on the pale header. The handset sits in a round badge — the same round
 * mark the callouts on the hero's model are pinned with — and a ring leaves it
 * every few seconds, slowly, the way a phone rings, so the button reads as live
 * before anyone has pointed at it.
 *
 * On hover the words roll: the label and number slide up and out and the same
 * words roll in from below, while the handset rings once. The button also leans
 * a few pixels toward the pointer as it comes near, the same idea as the house
 * leaning toward the cursor. Pointer only, never under reduced motion, and never
 * by more than a few pixels.
 */
function CallButton({ block = false }: { block?: boolean }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLAnchorElement>(null)
  const [finePointer] = useState(
    () =>
      typeof window !== 'undefined' &&
      !!window.matchMedia &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )

  const pullX = useMotionValue(0)
  const pullY = useMotionValue(0)
  const x = useSpring(pullX, { stiffness: 220, damping: 18, mass: 0.5 })
  const y = useSpring(pullY, { stiffness: 220, damping: 18, mass: 0.5 })
  const leans = finePointer && !reduced && !block

  const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v))

  function onMove(event: ReactPointerEvent<HTMLAnchorElement>) {
    const el = ref.current
    if (!leans || !el) return
    const box = el.getBoundingClientRect()
    pullX.set(clamp((event.clientX - (box.left + box.width / 2)) * 0.12, 5))
    pullY.set(clamp((event.clientY - (box.top + box.height / 2)) * 0.2, 4))
  }

  function onLeave() {
    pullX.set(0)
    pullY.set(0)
  }

  const words = (
    <>
      <span className={styles.callLabel}>Call {firstName}</span>
      <span className={styles.callNumber}>{contact.phone}</span>
    </>
  )

  return (
    <motion.a
      ref={ref}
      href={contact.phoneHref}
      className={[styles.call, block ? styles.callBlock : ''].join(' ').trim()}
      style={leans ? { x, y } : undefined}
      onPointerMove={leans ? onMove : undefined}
      onPointerLeave={leans ? onLeave : undefined}
    >
      <span className={styles.callBadge} aria-hidden="true">
        <span className={styles.callRing} />
        <PhoneGlyph />
      </span>

      {/* Two copies of the same words, stacked in a window one copy tall. The
          second is for the roll and is hidden from assistive tech, so the link
          is announced once. */}
      <span className={styles.callWindow}>
        <span className={styles.callRoll}>
          <span className={styles.callWords}>{words}</span>
          <span className={styles.callWords} aria-hidden="true">
            {words}
          </span>
        </span>
      </span>
    </motion.a>
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
