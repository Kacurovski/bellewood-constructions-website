import { useEffect } from 'react'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { SwipeRow } from '../components/SwipeRow'
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
export function Testimonials() {
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
      <div className="shell">
        <Reveal className={styles.head}>
          <SheetRef number="A-06" name="In their words" rule={false} />
          <h2 id="said-heading" className={['section-heading', styles.heading].join(' ')}>
            What the owners say.
          </h2>
        </Reveal>

        <SwipeRow as="ul" label="What the owners say" columns={3} className={styles.grid}>
          {testimonials.map((item, i) => (
            <Reveal as="li" key={i} delay={i * 0.07} className={styles.item}>
              <figure className={styles.card}>
                {/* Real typographic quotes, so the hanging indent in the CSS
                    has something to hang. They are written in rather than added
                    with ::before so the opening mark is part of the first line
                    box and the indent lines up with the text beneath it. */}
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

      </div>
    </section>
  )
}
