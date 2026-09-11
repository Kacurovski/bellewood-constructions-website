import { useCallback, useEffect, useState } from 'react'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './Kept.module.css'

/**
 * A-03 — what gets kept, as a deck you turn through.
 *
 * The most interesting thing this business does is not that it renovates old
 * houses; it is the specific care of how one is taken apart and put back. A
 * homeowner does not know that floorboards get numbered before they are lifted,
 * and once they do know it they understand the whole proposition without being
 * sold anything.
 *
 * The three beats are not written for this section. They are the middle
 * paragraph of the Paddington story in `data/projects.ts`, which already says:
 * boards lifted, numbered and relaid, sashes rebuilt, the verandah brought back
 * to its proper line, everything new set behind and stopping short of the ridge.
 * That is a sequence — record, repair, add behind — and a sequence is exactly
 * what a deck is for, because you are meant to read one and then the next.
 *
 * It is a stack rather than three cards side by side. Only the front one carries
 * its words; the two behind show their backs, a number and the sheet's name, the
 * way a card in a deck does. Spread out across the column they were three things
 * to compare, which is the one thing this content is not.
 */

const STEPS = [
  {
    title: 'Recorded before it moves',
    note: 'Floorboards are lifted, numbered and set aside before anything is opened up, so what goes back down is what came up.',
  },
  {
    title: 'Repaired, not replaced',
    note: 'Sashes rebuilt, the verandah brought back to its proper line. The parts worth keeping are the ones that were already there.',
  },
  {
    title: 'The new sits behind',
    note: 'Everything added stops short of the ridge, so the original roof still reads from the footpath and the street sees the house it always had.',
  },
] as const

/** How long a card holds the front before the deck turns. */
const HOLD = 4500

export function Kept() {
  const reduced = useReducedMotion()
  const [at, setAt] = useState(0)
  /* Held while a pointer is on the stack or a focus is inside it. Turning a
     card out from under somebody who has reached for it is what makes this
     pattern feel cheap. Under reduced motion it never turns on its own. */
  const [held, setHeld] = useState(false)

  const go = useCallback((n: number) => {
    setAt(((n % STEPS.length) + STEPS.length) % STEPS.length)
  }, [])

  useEffect(() => {
    if (reduced || held) return
    const timer = window.setTimeout(() => go(at + 1), HOLD)
    return () => window.clearTimeout(timer)
  }, [reduced, held, at, go])

  return (
    <section className={['section', styles.section].join(' ')} aria-labelledby="kept-heading">
      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.head}>
          <SheetRef number="A-03" name="Kept" rule={false} />
          <h2 id="kept-heading" className={['section-heading', styles.heading].join(' ')}>
            An old house comes apart before it goes back together.
          </h2>
          <p className={[styles.lede, 'measure-tight'].join(' ')}>
            What that actually looks like, in the order it happens.
          </p>
        </Reveal>

        <Reveal delay={0.06} className={styles.stageWrap}>
          {/* The pointer-catch is on the stack, which is only as wide as the
              cards. It used to be the whole band — twelve hundred pixels of
              mostly empty ground — so a mouse resting anywhere near the section
              held it still and it looked as though it never turned at all. */}
          <div
            className={styles.stack}
            onPointerEnter={() => setHeld(true)}
            onPointerLeave={() => setHeld(false)}
          >
            {STEPS.map((step, i) => {
              /* 0 is the card you are reading; 1 and 2 are behind it. */
              const pos = (i - at + STEPS.length) % STEPS.length

              return (
                <article key={step.title} className={styles.card} data-pos={pos}>
                  {/* The face. Only the front card's words are readable, so the
                      other two are taken out of the accessibility tree with
                      their own contents rather than being left to be read out
                      from behind a card. */}
                  <div className={styles.front} aria-hidden={pos === 0 ? undefined : true}>
                    <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                    <h3 className={styles.title}>{step.title}</h3>
                    <p className={styles.note}>{step.note}</p>
                  </div>

                  {/* The back, which is what a card in a stack shows: its number
                      and the name of the set it belongs to. */}
                  <div className={styles.back} aria-hidden="true">
                    <span className={styles.backNum}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.backRule} />
                    <span className={styles.backLabel}>Kept</span>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Turn it by hand. The stack moves on its own, so this is for going
              back — and it is the whole of the keyboard path, because the cards
              behind cannot be read and should not be focusable. */}
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.step}
              onClick={() => go(at - 1)}
              onFocus={() => setHeld(true)}
              onBlur={() => setHeld(false)}
              aria-label="Previous step"
            >
              <svg viewBox="0 0 34 10" fill="none" aria-hidden="true">
                <path d="M34 5H2M6.5 1L2 5l4.5 4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>

            <span className={styles.count} aria-hidden="true">
              <span className={styles.countNow}>{String(at + 1).padStart(2, '0')}</span>
              <span className={styles.countRule} />
              <span>{String(STEPS.length).padStart(2, '0')}</span>
            </span>

            <button
              type="button"
              className={styles.step}
              onClick={() => go(at + 1)}
              onFocus={() => setHeld(true)}
              onBlur={() => setHeld(false)}
              aria-label="Next step"
            >
              <svg viewBox="0 0 34 10" fill="none" aria-hidden="true">
                <path d="M0 5h32M27.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
