import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { Logo } from '../components/Logo'
import { Credentials } from '../components/Credentials'
import styles from './ContinuityIntroduction.module.css'

/** The name and the assurances belong to one continuing builder's story. */
export function ContinuityIntroduction() {
  return (
    <section className={styles.section} aria-labelledby="continuity-heading" data-builder-introduction>
      <div className={['shell', styles.inner].join(' ')}>
        <div className={styles.introduction}>
          <Reveal className={styles.titleBlock} y={14}>
            <p className={styles.eyebrow}>The builder behind the homes</p>
            <h2 id="continuity-heading" className={styles.heading}>
              <span className={styles.established}>Angus Cowan Constructions</span>{' '}
              <span className={styles.newName}>is becoming <em>Bellewood.</em></span>
            </h2>
          </Reveal>
          <Reveal className={styles.identity} delay={0.15} y={10}>
            <Logo variant="symbol" width={76} decorative className={styles.mark} />
            <div className={styles.aside}>
              <p>Same company.<br />{' '}Same licence.</p>
              <Link to="/about" className={styles.link}>
                Meet Angus and Bellewood
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>
              </Link>
            </div>
          </Reveal>
        </div>
        <Credentials inline />
      </div>
    </section>
  )
}
