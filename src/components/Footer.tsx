import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { ComplianceLine } from './ComplianceLine'
import { contact, nav, site, socialLinks } from '../config/site'
import { getLenis } from '../hooks/useLenis'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './Footer.module.css'

/** A compact closing signature, useful links and one complete compliance line. */
export function Footer() {
  const year = new Date().getFullYear()
  const reduced = useReducedMotion()

  function backToTop() {
    const home = document.querySelector<HTMLElement>('header a[href="#/"]')
    home?.focus({ preventScroll: true })
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { immediate: reduced, duration: 1 })
    else window.scrollTo({ top: 0, left: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <footer className={['on-green', styles.footer].join(' ')}>
      <div className="shell">
        <div className={styles.inner}>
          <div className={styles.brand}>
            <Link to="/" aria-label={`${site.name} home`} className={styles.logoLink}>
              <Logo variant="lockup" tone="reverse" width={220} decorative />
            </Link>
            <p className={styles.blurb}>{site.description}</p>
          </div>

          <nav className={styles.explore} aria-label="Footer">
            <h2 className={styles.columnHeading}>Explore</h2>
            <ul className={styles.navigation}>
              {nav.map((item) => (
                <li key={item.label}>
                  <Link to={{ pathname: item.to, hash: item.hash }}>
                    <span>{item.label}</span><span className={styles.linkArrow} aria-hidden="true">&#8599;</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.contact}>
            <h2 className={styles.columnHeading}>Contact Angus</h2>
            <a className={styles.phone} href={contact.phoneHref}>{contact.phone}</a>
            <a className={styles.email} href={contact.emailHref}>{contact.email}</a>
            <p className={styles.area}>{contact.serviceArea}</p>
            {socialLinks.length > 0 && <ul className={styles.social} aria-label="Follow Bellewood">
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} target="_blank" rel="noreferrer noopener">
                    {item.label}<span className={styles.linkArrow} aria-hidden="true">&#8599;</span>
                  </a>
                </li>
              ))}
            </ul>}
          </div>
        </div>

        <div className={styles.legal}>
          <div className={styles.legalCopy}>
            <ComplianceLine className={styles.compliance} />
            <p className={styles.director}>{contact.role}: {contact.principal}</p>
          </div>
          <div className={styles.endnote}>
            <p className={styles.copyright}>&copy; {year} {site.name}</p>
            <button type="button" className={styles.backTop} onClick={backToTop}>
              Back to top
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20V4m-7 7 7-7 7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
