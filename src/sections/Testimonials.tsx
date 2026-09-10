import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { SwipeRow } from '../components/SwipeRow'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { testimonials, testimonialsArePlaceholder } from '../data/testimonials'
import styles from './Testimonials.module.css'

/**
 * What past clients say.
 *
 * Placed immediately before the enquiry, which is where another owner's words
 * do the most work: someone weighing up a two-million-dollar renovation reads
 * this last, then decides whether to make contact.
 *
 * The quotes in `data/testimonials.ts` are WRITTEN, not collected, and nothing
 * on the page says so — that is deliberate, so the section can be reviewed as
 * finished work. It also means the only thing standing between a fabricated
 * endorsement and a live website is the warning below and the README. Do not
 * remove either until the real quotes are in.
 */
/** How long each quote holds. Long: this is reading, not a slideshow. */
const HOLD = 8000

export function Testimonials() {
  /* One at a time on a wide screen with a pointer; the swipe rail everywhere
     else, which is what a phone should have and already had. */
  const one = useMediaQuery('(min-width: 861px) and (pointer: fine)')
  const reduced = useReducedMotion()
  const [at, setAt] = useState(0)
  /* Held while the pointer is on the set. Advancing a quote out from under
     somebody who has just reached for it is what makes this pattern feel
     cheap, and under reduced motion it never advances on its own at all. */
  const [held, setHeld] = useState(false)

  useEffect(() => {
    if (!one || reduced || held) return
    const timer = window.setTimeout(() => setAt((n) => (n + 1) % testimonials.length), HOLD)
    return () => window.clearTimeout(timer)
  }, [one, reduced, held, at])

  // The page carries no visible marker, so the warning goes somewhere a
  // developer will see it and a visitor never will.
  useEffect(() => {
    if (!testimonialsArePlaceholder) return
    console.warn(
      '[Bellewood] The testimonials on this page are placeholder copy, not real ' +
        'client words. They must be replaced before this site publishes — a ' +
        'fabricated endorsement of a licensed business is a fake review. ' +
        'See src/data/testimonials.ts.',
    )
  }, [])

  return (
    <section className={['section', styles.section].join(' ')} aria-labelledby="said-heading">
      {/* Ruled paper, drifting. Faint horizontal ruling is the surface words get
          written on, which is what this band is — and it moves, very slowly and
          without stopping, so the section is alive before anybody touches it.
          Drawn in CSS, carrying nothing to read, and off entirely under reduced
          motion. */}
      <span className={styles.rule} aria-hidden="true" />

      <div className="shell">
        <Reveal className={styles.head}>
          {/* The heading sits under the strip rather than inside it. A-03 puts
              its two-word title in the reference because the title IS a label;
              this one is a sentence at fifty-six pixels, and a strip built for
              eleven-pixel type put a tiny tick and a tiny number against it. */}
          <SheetRef
            number="A-07"
            name="In their words"
            note={one ? 'One at a time' : undefined}
            rule={false}
          />
          <h2 id="said-heading" className={['section-heading', styles.heading].join(' ')}>
            What the owners say.
          </h2>
        </Reveal>

        {one ? (
          <div className={styles.stage}>
            {/* One quote, at the size a client's own words are worth on a page
                selling this size of job. Three columns of body-sized text is a
                page of testimonials; this is a statement. */}
            {/* The live quote's number, in a column of its own beside the
                words. See the stylesheet for why it is not behind them. */}
            <div className={styles.markSlot} aria-hidden="true">
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  key={at}
                  className={styles.mark}
                  initial={reduced ? false : { opacity: 0, y: '0.4em' }}
                  animate={{ opacity: 1, y: '0em' }}
                  exit={reduced ? { opacity: 1 } : { opacity: 0, y: '-0.4em' }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  {String(at + 1).padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className={styles.quoteSlot}>
              <AnimatePresence initial={false} mode="wait">
                <motion.figure
                  key={at}
                  className={styles.card}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Real typographic quotes, so the hanging indent in the CSS
                      has something to hang. Written in rather than added with
                      ::before, so the opening mark is part of the first line box
                      and the indent lines up with the text beneath it. */}
                  <blockquote className={styles.quote}>
                    {'“'}
                    {testimonials[at].quote}
                    {'”'}
                  </blockquote>
                  <figcaption className={styles.by}>
                    <span className={styles.name}>{testimonials[at].name}</span>
                    <span className={styles.detail}>{testimonials[at].detail}</span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            {/* The set, numbered like everything else here. The live one carries
                its dwell as a rule that fills, so the section says how long it
                will hold rather than changing under the reader without warning. */}
            <ol className={styles.set}>
              {testimonials.map((item, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className={[styles.pick, i === at ? styles.pickOn : ''].join(' ')}
                    aria-current={i === at ? 'true' : undefined}
                    onClick={() => setAt(i)}
                    onPointerEnter={() => setHeld(true)}
                    onPointerLeave={() => setHeld(false)}
                    onFocus={() => setHeld(true)}
                    onBlur={() => setHeld(false)}
                  >
                    <span className={styles.pickNumber}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.pickName}>{item.name}</span>
                    <span className={styles.dwell} aria-hidden="true">
                      {i === at && !held && !reduced && (
                        <motion.span
                          key={at}
                          className={styles.dwellFill}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: HOLD / 1000, ease: 'linear' }}
                        />
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <SwipeRow as="ul" label="What the owners say" columns={3} className={styles.grid}>
            {testimonials.map((item, i) => (
              <Reveal as="li" key={i} delay={i * 0.07} className={styles.item}>
                <figure className={styles.card}>
                  <blockquote className={styles.quote}>
                    {'“'}
                    {item.quote}
                    {'”'}
                  </blockquote>
                  <figcaption className={styles.by}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.detail}>{item.detail}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </SwipeRow>
        )}

      </div>
    </section>
  )
}
