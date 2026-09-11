import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
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
 *
 * --- The ground ------------------------------------------------------------
 * Each quote stands on the house it is about, moving.
 *
 * This band has now been through three grounds. It was flat. Then it was ruled
 * paper, drifting — which was honest to the drawing language and far too quiet
 * to carry the last thing a reader sees before deciding whether to ring; at a
 * glance it read as a lined notepad. So the ground is now the project itself:
 * the plate for the quote's own job, darkened right down under a green scrim,
 * slowly pushing in the whole time it holds and cross-fading to the next.
 *
 * That is the live background, and it is built from footage this business
 * owns rather than bought footage of somebody else's site. A `PLATES` entry
 * takes a `video` instead of an `image` the day there is real footage of
 * Angus's own work — nothing else has to change.
 */

/** How long each quote holds. Long: this is reading, not a slideshow. */
const HOLD = 8000

/** How far past the hold the push-in runs, so it never lands and sits still. */
const PUSH = (HOLD + 2600) / 1000

type Plate = {
  /** A still, pushed in slowly. Every one is already in `public/projects`. */
  image?: string
  /**
   * A muted, looping clip, used in place of the still when one exists. There
   * is none yet and none should be bought: a band headed "What the owners say"
   * standing on somebody else's building is the same misrepresentation as
   * stock photography, and worse for moving. Real site footage of Angus's own
   * jobs is the thing to put here.
   */
  video?: string
}

/**
 * The plate behind each quote — the project that quote is actually about, so
 * the ground is never decoration. Index for index with `testimonials`.
 */
const PLATES: Plate[] = [
  { image: 'projects/paddington-after.jpg' }, // Paddington · Renovation
  { image: 'projects/ashgrove-after.jpg' }, // Ashgrove · Extension
  { image: 'projects/interior-dining.jpg' }, // Architect · Inner Brisbane
]

export function Testimonials() {
  const reduced = useReducedMotion()
  const coarse = useMediaQuery('(pointer: coarse)')
  const [at, setAt] = useState(0)
  /* Held while a pointer is anywhere on the controls. Advancing a quote out
     from under somebody who has just reached for it is what makes this pattern
     feel cheap, and under reduced motion it never advances on its own at all. */
  const [held, setHeld] = useState(false)

  const go = useCallback((n: number) => {
    setAt(((n % testimonials.length) + testimonials.length) % testimonials.length)
  }, [])

  useEffect(() => {
    if (reduced || held) return
    const timer = window.setTimeout(() => go(at + 1), HOLD)
    return () => window.clearTimeout(timer)
  }, [reduced, held, at, go])

  // --- Swipe, where there is no pointer to click with -----------------------
  const down = useRef<number | null>(null)
  function onDown(e: ReactPointerEvent<HTMLElement>) {
    if (!coarse) return
    down.current = e.clientX
  }
  function onUp(e: ReactPointerEvent<HTMLElement>) {
    if (down.current === null) return
    const moved = e.clientX - down.current
    down.current = null
    if (Math.abs(moved) > 44) go(at + (moved < 0 ? 1 : -1))
  }

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

  const live = testimonials[at]

  return (
    <section
      className={['section', 'on-green', styles.section].join(' ')}
      aria-labelledby="said-heading"
      onPointerDown={onDown}
      onPointerUp={onUp}
    >
      {/* --- The ground ---------------------------------------------------
          The plate for the live quote's own job. Cross-faded rather than cut,
          and pushing in the whole time it holds, so the band is moving before
          anybody touches it and on every device. Under reduced motion it holds
          perfectly still and simply swaps. */}
      <div className={styles.plates} aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.div
            key={at}
            className={styles.plate}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 1.4, ease: 'linear' }}
          >
            {PLATES[at].video ? (
              <video
                className={styles.plateMedia}
                src={PLATES[at].video}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <motion.img
                className={styles.plateMedia}
                src={PLATES[at].image}
                alt=""
                initial={reduced ? { scale: 1.08 } : { scale: 1.04 }}
                animate={reduced ? { scale: 1.08 } : { scale: 1.19 }}
                transition={{ duration: PUSH, ease: 'linear' }}
              />
            )}
          </motion.div>
        </AnimatePresence>
        {/* Two scrims. The flat one takes the whole plate down far enough that
            Wash clears AA over the brightest pixel in any of them; the raking
            one takes the left further still, because that is where the words
            are and a quote at this size should sit on near-solid ground. */}
        <span className={styles.scrim} />
        <span className={styles.rake} />
      </div>

      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.head}>
          <SheetRef
            number="A-08"
            name="In their words"
            note="One at a time"
            rule={false}
          />
          <h2 id="said-heading" className={['section-heading', styles.heading].join(' ')}>
            What the owners say.
          </h2>
        </Reveal>

        <div className={styles.stage}>
          <div className={styles.quoteSlot}>
            <AnimatePresence initial={false} mode="wait">
              <motion.figure
                key={at}
                className={styles.card}
                initial={reduced ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 1 } : { opacity: 0, y: -16 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Real typographic quotes, so the hanging indent in the CSS
                    has something to hang. Written in rather than added with
                    ::before, so the opening mark is part of the first line box
                    and the indent lines up with the text beneath it. */}
                <blockquote className={styles.quote}>
                  {'“'}
                  {live.quote}
                  {'”'}
                </blockquote>
                <figcaption className={styles.by}>
                  <span className={styles.name}>{live.name}</span>
                  <span className={styles.detail}>{live.detail}</span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {/* --- Step and count ---------------------------------------------
              Two arrows and the position, under the words.

              The band could already be swiped, tabbed and picked from the set,
              and none of those SAY there is more than one quote here — a
              reader who does not hover the set and does not swipe sees one
              testimonial and no reason to think there are three. Arrows are
              the plainest possible statement that this moves, which is why
              every slider has had them for thirty years.

              They sit under the quote rather than over the plate: floating
              chevrons on a photograph is the stock treatment, and this band
              is set as a sheet. */}
          <div className={styles.nav}>
            <button
              type="button"
              className={styles.step}
              onClick={() => go(at - 1)}
              onPointerEnter={() => setHeld(true)}
              onPointerLeave={() => setHeld(false)}
              onFocus={() => setHeld(true)}
              onBlur={() => setHeld(false)}
              aria-label="Previous quote"
            >
              <svg viewBox="0 0 34 10" fill="none" aria-hidden="true">
                <path d="M34 5H2M6.5 1L2 5l4.5 4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>

            <span className={styles.count} aria-hidden="true">
              <span className={styles.countNow}>{String(at + 1).padStart(2, '0')}</span>
              <span className={styles.countRule} />
              <span>{String(testimonials.length).padStart(2, '0')}</span>
            </span>

            <button
              type="button"
              className={styles.step}
              onClick={() => go(at + 1)}
              onPointerEnter={() => setHeld(true)}
              onPointerLeave={() => setHeld(false)}
              onFocus={() => setHeld(true)}
              onBlur={() => setHeld(false)}
              aria-label="Next quote"
            >
              <svg viewBox="0 0 34 10" fill="none" aria-hidden="true">
                <path d="M0 5h32M27.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          </div>

          {/* --- The set ----------------------------------------------------
              Three plates rather than three words. A list reading "Homeowner,
              Homeowner, Architect" tells a reader nothing about what they are
              choosing between; the houses do, and they are the same plates the
              ground is cross-fading through, so picking one is visibly picking
              the thing behind the words. The live one carries its dwell as a
              rule that fills, so the band says how long it will hold rather
              than changing under the reader without warning. */}
          <ol
            className={styles.set}
            onPointerEnter={() => setHeld(true)}
            onPointerLeave={() => setHeld(false)}
          >
            {testimonials.map((item, i) => (
              <li key={i}>
                <button
                  type="button"
                  className={[styles.pick, i === at ? styles.pickOn : ''].join(' ')}
                  aria-current={i === at ? 'true' : undefined}
                  aria-label={`Quote ${i + 1} of ${testimonials.length}: ${item.name}, ${item.detail}`}
                  onClick={() => go(i)}
                  onFocus={() => setHeld(true)}
                  onBlur={() => setHeld(false)}
                >
                  <span className={styles.thumb} aria-hidden="true">
                    {PLATES[i].image && <img src={PLATES[i].image} alt="" loading="lazy" />}
                  </span>
                  <span className={styles.pickText}>
                    <span className={styles.pickNumber}>{String(i + 1).padStart(2, '0')}</span>
                    {/* The suburb alone. `detail` is "Paddington · Renovation",
                        and the whole of it truncated to an ellipsis in the
                        side column anywhere under about 1200px. The kind of
                        work is already set in full under the quote, so the
                        column carries the half that identifies the house. */}
                    <span className={styles.pickName}>{item.detail.split('·')[0].trim()}</span>
                  </span>
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
      </div>
    </section>
  )
}
