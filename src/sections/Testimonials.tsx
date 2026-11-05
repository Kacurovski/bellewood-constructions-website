import { ActionGlyph } from '../components/ActionGlyph'
import { useCallback, useEffect, useRef, useState } from 'react'
import { photo } from '../data/photos'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { testimonials, testimonialsArePlaceholder } from '../data/testimonials'
import { GoogleReviewBadge } from '../components/GoogleReviewBadge'
import { googleReviews } from '../config/site'
import styles from './Testimonials.module.css'

/** Photo-backed testimonial layout. Sample quotes carry a visible draft notice. */

/** How long each quote holds. Long: this is reading, not a slideshow. */
const HOLD = 8000

/** How far past the hold the push-in runs, so it never lands and sits still. */
const PUSH = (HOLD + 2600) / 1000

type Plate = {
  /** A still, pushed in slowly. A bare name resolved by `photo`. */
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
 * Photographs used for the layout preview. They are not evidence of a review
 * about the pictured project. Index for index with `testimonials`.
 */
const PLATES: Plate[] = [
  // Angus's own photographs. The quotes in front of them are still written
  // placeholders (see data/testimonials.ts); the houses behind them are real.
  { image: photo('kalinga-01') },
  { image: photo('auchenflower-13') },
  { image: photo('clayfield-05') },
]

export function Testimonials({ sheetNumber = "A-07" }: { sheetNumber?: string } = {}) {
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

  // Also flag sample testimonials for developers during preview.
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
            number={sheetNumber}
            name="In their words"
            note="Clients and architects"
            rule={false}
          />
          <div className={styles.headingRow}>
            <h2 id="said-heading" className={['section-heading', styles.heading].join(' ')}>
              What clients say.
            </h2>
            {googleReviews.placements.testimonials && <GoogleReviewBadge />}
          </div>
          {testimonialsArePlaceholder && <p className={styles.draftNote}>Sample quotes, not client reviews. These will be replaced with genuine client feedback before publication.</p>}
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

          {/* Quote navigation and current position. */}
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
              <ActionGlyph name="previous" />
            </button>

            <span className={styles.count} aria-hidden="true">
              <span className={styles.countNow}>{String(at + 1).padStart(2, '0')}</span>
              <span>/</span>
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
              <ActionGlyph name="next" />
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
