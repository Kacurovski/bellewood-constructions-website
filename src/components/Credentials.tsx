import { motion } from 'framer-motion'
import { credentials } from '../config/site'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './Credentials.module.css'

const EASE = [0.16, 1, 0.3, 1] as const

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
 *
 * It arrives as a dimension line. The rule above it draws across the page from
 * the left, and each division drops its tick as the rule reaches it, so four
 * facts set in a row read as four measurements taken off a drawing rather than
 * as a footer. The section above it is a drawing and a photograph of a drawing;
 * this is the same hand.
 */
export function Credentials({ inline = false }: { inline?: boolean } = {}) {
  const Wrap = inline ? 'div' : 'section'
  const reduced = useReducedMotion()

  /* How long the rule takes to cross, and how far along it each tick sits.
     Ticks at the divisions rather than on a flat stagger, so the drop always
     happens where the rule is rather than near it. */
  const RULE = 1.5
  const at = (i: number) => (i / credentials.length) * RULE * 0.82

  const still = { initial: undefined, whileInView: undefined }

  return (
    <Wrap
      className={[inline ? styles.inline : 'section--tight', styles.section].join(' ')}
      aria-label="Credentials"
    >
      <div className={[inline ? '' : 'shell', styles.dim].join(' ').trim()}>
        <motion.span
          aria-hidden="true"
          className={styles.rule}
          {...(reduced
            ? still
            : {
                initial: { scaleX: 0 },
                whileInView: { scaleX: 1 },
                viewport: { once: true, margin: '-8% 0px -10% 0px' },
                transition: { duration: RULE, ease: EASE },
              })}
        />

        <ul className={styles.row}>
          {credentials.map((item, i) => (
            <li className={styles.item} key={item.label}>
              {i > 0 && (
                <motion.span
                  aria-hidden="true"
                  className={styles.tick}
                  {...(reduced
                    ? still
                    : {
                        initial: { scaleY: 0 },
                        whileInView: { scaleY: 1 },
                        viewport: { once: true, margin: '-8% 0px -10% 0px' },
                        transition: { duration: 0.7, delay: at(i), ease: EASE },
                      })}
                />
              )}

              <motion.span
                className={styles.text}
                {...(reduced
                  ? still
                  : {
                      initial: { opacity: 0, y: 10 },
                      whileInView: { opacity: 1, y: 0 },
                      viewport: { once: true, margin: '-8% 0px -10% 0px' },
                      transition: { duration: 0.8, delay: at(i) + 0.12, ease: EASE },
                    })}
              >
                <span className={['eyebrow', styles.label].join(' ')}>{item.label}</span>
                <span className={styles.value}>{item.value}</span>
              </motion.span>
            </li>
          ))}
        </ul>
      </div>
    </Wrap>
  )
}
