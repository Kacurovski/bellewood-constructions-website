import { Reveal } from './Reveal'
import { credentials } from '../config/site'
import styles from './Credentials.module.css'

/**
 * A quiet row of credentials, sitting between the mesh and the process section.
 *
 * This is the place a builder's site would normally run a strip of accreditation
 * logos. There are none here on purpose: an industry body's mark on the page
 * claims a membership, and none of Angus's are confirmed. Every line is either a
 * fact already established elsewhere on this site or a requirement of holding a
 * Queensland licence, so the strip earns its place without claiming anything.
 */
export function Credentials() {
  return (
    <section className={['section--tight', styles.section].join(' ')} aria-label="Credentials">
      <ul className={['shell', styles.row].join(' ')}>
        {credentials.map((item, i) => (
          <Reveal as="li" key={item.label} delay={i * 0.06} className={styles.item}>
            <span className={['eyebrow', styles.label].join(' ')}>{item.label}</span>
            <span className={styles.value}>{item.value}</span>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
