import { Reveal } from './Reveal'
import { credentials } from '../config/site'
import styles from './Credentials.module.css'

/**
 * A quiet row of credentials.
 *
 * It used to be a band of its own between the mesh and the process section,
 * which made it a fifth thing on a page that already had too many bands of the
 * same weight. It sits at the foot of "What we build" now: that section is a
 * heading, a figure and forty words, so it had height going spare, and a row of
 * facts is a better use of it than empty ground.
 *
 * This is the place a builder's site would normally run a strip of accreditation
 * logos. There are none here on purpose: an industry body's mark on the page
 * claims a membership, and none of Angus's are confirmed. Every line is either a
 * fact already established elsewhere on this site or a requirement of holding a
 * Queensland licence, so the strip earns its place without claiming anything.
 */
export function Credentials({ inline = false }: { inline?: boolean } = {}) {
  const Wrap = inline ? 'div' : 'section'

  return (
    <Wrap
      className={[inline ? styles.inline : 'section--tight', styles.section].join(' ')}
      aria-label="Credentials"
    >
      <ul className={[inline ? '' : 'shell', styles.row].join(' ').trim()}>
        {credentials.map((item, i) => (
          <Reveal as="li" key={item.label} delay={i * 0.06} className={styles.item}>
            <span className={['eyebrow', styles.label].join(' ')}>{item.label}</span>
            <span className={styles.value}>{item.value}</span>
          </Reveal>
        ))}
      </ul>
    </Wrap>
  )
}
