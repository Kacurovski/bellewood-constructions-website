import { Link } from 'react-router-dom'
import { SheetRef } from '../components/Sheet'
import { companyPhoto } from '../data/company'
import styles from './AboutIntroduction.module.css'

/** A portrait of the people behind the work, rather than another project card. */
export function AboutIntroduction() {
  return (
    <header className={['on-green', styles.intro].join(' ')} data-page-intro="about">
      <div className={styles.layout}>
        <div className={styles.copy}>
          <div className={styles.heading}>
            <SheetRef name="About Bellewood" rule={false} />
            <h1>
              Good homes <br />begin with<br />
              <em>good relationships.</em>
            </h1>
          </div>

          <div className={styles.support}>
            <p>Working with homeowners, architects and designers.</p>
            <nav className={styles.links} aria-label="Explore the About page">
              <Link to={{ pathname: '/about', hash: '#about-builder' }}>
                Get to know Angus <Arrow />
              </Link>
              <Link to={{ pathname: '/about', hash: '#about-name' }}>
                Why Bellewood <Arrow />
              </Link>
            </nav>
          </div>
        </div>

        <figure className={styles.photo}>
          <div className={styles.window}>
            <img src={companyPhoto.src} alt={companyPhoto.alt}
              width={1080} height={1080} fetchPriority="high" decoding="async" />
          </div>
        </figure>
      </div>
    </header>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 5 19 19M5 19h14V5" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}
