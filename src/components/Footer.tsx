import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { ComplianceLine } from './ComplianceLine'
import { contact, nav, site, social } from '../config/site'
import styles from './Footer.module.css'

/**
 * The footer, on green.
 *
 * The compliance line lives here and appears on every page of the site as a
 * result. It is the legally required advertising line, not a courtesy.
 *
 * Note there is deliberately no link to the Google Business Profile. That
 * profile stays under the current name until the ASIC change so its review
 * history is not put at risk, and nothing on this site should point at it.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={['on-green', styles.footer].join(' ')}>
      <div className={['shell', styles.inner].join(' ')}>
        <div className={styles.brand}>
          <Link to="/" aria-label={`${site.name} — home`} className={styles.logoLink}>
            <Logo variant="lockup" tone="reverse" width={200} decorative />
          </Link>
          <p className={[styles.blurb, 'small'].join(' ')}>{site.description}</p>
        </div>

        <nav className={styles.column} aria-label="Footer">
          <h2 className={['eyebrow', styles.columnHeading].join(' ')}>Site</h2>
          <ul className={styles.list}>
            {nav.map((item) => (
              <li key={item.label}>
                <Link to={{ pathname: item.to, hash: item.hash }}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.column}>
          <h2 className={['eyebrow', styles.columnHeading].join(' ')}>Contact</h2>
          <ul className={styles.list}>
            <li>
              <a href={contact.phoneHref}>{contact.phone}</a>
            </li>
            <li>
              <a href={contact.emailHref}>{contact.email}</a>
            </li>
            <li className={styles.plain}>{contact.serviceArea}</li>
          </ul>
        </div>

        <div className={styles.column}>
          <h2 className={['eyebrow', styles.columnHeading].join(' ')}>Follow</h2>
          <ul className={styles.list}>
            {social.map((item) => (
              <li key={item.label}>
                <a href={item.href} target="_blank" rel="noreferrer noopener">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={['shell', styles.legal].join(' ')}>
        <ComplianceLine />
        <p className={['fine', styles.copyright].join(' ')}>
          © {year} {site.name}
        </p>
      </div>
    </footer>
  )
}
