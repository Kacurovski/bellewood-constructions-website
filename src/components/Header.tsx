import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, useScroll } from 'framer-motion'
import { Logo } from './Logo'
import { contact, nav, site } from '../config/site'
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

  return (
    <header
      className={[
        styles.header,
        scrolled ? styles.scrolled : '',
        overDark ? styles.overDark : '',
      ].join(' ')}
    >
      <div className={[styles.inner, 'shell'].join(' ')}>
        <Link to="/" className={styles.brand} aria-label={`${site.name} — home`}>
          <Logo variant="lockup" tone={overDark ? 'reverse' : 'green'} width={168} decorative />
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <ul className={styles.list}>
            {nav.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={{ pathname: item.to, hash: item.hash }}
                  end={!item.hash}
                  className={({ isActive }) =>
                    [styles.link, isActive && !item.hash ? styles.active : ''].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <a className={styles.phone} href={contact.phoneHref}>
          <span className={styles.phoneLabel}>Call Angus</span>
          <span className={styles.phoneNumber}>{contact.phone}</span>
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
        <ul className={styles.mobileList}>
          {nav.map((item) => (
            <li key={item.label}>
              <NavLink
                to={{ pathname: item.to, hash: item.hash }}
                className={styles.mobileLink}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
          <li>
            <a href={contact.phoneHref} className={styles.mobileLink}>
              {contact.phone}
            </a>
          </li>
        </ul>
      </div>
    </header>
  )
}
