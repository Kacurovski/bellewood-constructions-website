import { motion } from 'framer-motion'
import { credentials } from '../config/site'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './Credentials.module.css'

const EASE = [0.16, 1, 0.3, 1] as const

/** How long the rule takes to cross the page. */
const RULE = 1.5

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
 * It is drawn as a dimension string, which is the thing it already almost was.
 * A rule crossing the page, an oblique tick struck through it at each division
 * and at both ends, an extension line dropped from each tick, and the figure
 * sitting under the run it measures. The rule draws from the left and each tick
 * is struck as the rule reaches it, so four facts in a row arrive as four
 * measurements taken off a drawing rather than as a footer. The section above
 * is a drawing and a photograph of that drawing; this is the same hand.
 */
export function Credentials({ inline = false }: { inline?: boolean } = {}) {
  const Wrap = inline ? 'div' : 'section'
  const reduced = useReducedMotion()

  /* Where along the rule each division falls. Ticks are struck at the divisions
     rather than on a flat stagger, so the mark always lands where the rule is
     rather than somewhere near it. */
  const at = (i: number) => (i / credentials.length) * RULE * 0.82

  type Frame = Record<string, number | string>

  const drawn = (delay: number, from: Frame, to: Frame, duration = 0.7) =>
    reduced
      ? {}
      : {
          initial: from,
          whileInView: to,
          viewport: { once: true, margin: '-8% 0px -10% 0px' },
          transition: { duration, delay, ease: EASE },
        }

  /* The oblique ticks carry their own rotation and centring, and it has to go
     through here rather than through CSS: an animated transform is written
     whole, so a `rotate(45deg)` left in the stylesheet is wiped the moment the
     tick is scaled. */
  const struck = (delay: number, end = false) =>
    drawn(
      delay,
      { opacity: 0, scale: 0.2, rotate: 45, x: end ? '50%' : '-50%', y: '-50%' },
      { opacity: 1, scale: 1, rotate: 45, x: end ? '50%' : '-50%', y: '-50%' },
      0.6,
    )

  return (
    <Wrap
      className={[inline ? styles.inline : 'section--tight', styles.section].join(' ')}
      aria-label="Credentials"
    >
      <div className={[inline ? '' : 'shell', styles.dim].join(' ').trim()}>
        <motion.span
          aria-hidden="true"
          className={styles.rule}
          {...drawn(0, { scaleX: 0 }, { scaleX: 1 }, RULE)}
        />

        {/* The mark that closes the run. A dimension string is open at the end
            without it, and an open dimension is a different thing entirely. */}
        <motion.span
          aria-hidden="true"
          className={[styles.mark, styles.markEnd].join(' ')}
          {...struck(RULE * 0.86, true)}
        />

        <ul className={styles.row}>
          {credentials.map((item, i) => (
            <li className={styles.item} key={item.label}>
              <motion.span
                aria-hidden="true"
                className={styles.mark}
                {...struck(at(i))}
              />

              {i > 0 && (
                <motion.span
                  aria-hidden="true"
                  className={styles.tick}
                  {...drawn(at(i) + 0.06, { scaleY: 0 }, { scaleY: 1 })}
                />
              )}

              <motion.span
                className={styles.text}
                {...drawn(at(i) + 0.12, { opacity: 0, y: 10 }, { opacity: 1, y: 0 }, 0.8)}
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
