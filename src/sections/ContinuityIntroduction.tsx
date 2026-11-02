import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useInView } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { Credentials } from '../components/Credentials'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './ContinuityIntroduction.module.css'

const continuity = ['Same builder.', 'Same company.', 'Same licence.', 'A new name.']

/** A moving continuity line and a rotating set of three practical assurances.
 * The actual announcement stays still and readable throughout. */
export function ContinuityIntroduction() {
  const section = useRef<HTMLElement>(null)
  const visible = useInView(section, { amount: .25 })
  const reduced = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  const running = visible && pageVisible && !reduced && !paused

  return (
    <section ref={section} className={styles.section} aria-labelledby="continuity-heading"
      data-builder-introduction data-running={running}>
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.track}>
          {[0, 1].map(copy => (
            <div className={styles.phrases} key={copy}>
              {continuity.map((phrase, i) => (
                <span className={styles.phrase} key={phrase}>
                  {i === 3 ? <em>{phrase}</em> : phrase}
                  <span className={styles.separator} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.story} y={12}>
          <p className={styles.eyebrow}>A continuing story</p>
          <h2 id="continuity-heading" className={styles.heading}>
            <span>Angus Cowan{' '}<br />Constructions</span>{' '}
            <span className={styles.newName}>is becoming <em>Bellewood.</em></span>
          </h2>
          <p className={styles.reassurance}>The same company, the same licence.<br />Angus, still on site.</p>
          <Link to="/about" className={styles.link}>
            <span>Meet Angus and Bellewood</span>
            <svg viewBox="0 0 32 24" fill="none" aria-hidden="true"><path d="M1 12h28m-8-8 8 8-8 8" /></svg>
          </Link>
        </Reveal>

        <Credentials running={running} paused={paused}
          onPause={() => setPaused(true)} onToggleMotion={() => setPaused(value => !value)} />
      </div>
    </section>
  )
}
