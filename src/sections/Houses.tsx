import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { getProject } from '../data/projects'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './Houses.module.css'

/**
 * E-04 — the three houses, as a deck that turns.
 *
 * The three kinds of house are not invented for this section. They are the
 * sentence A-02 opens with on the home page — a worker's cottage, a
 * Queenslander, a post-war home worth keeping — and the same three the hero
 * cycles through. This is that claim given a card each.
 *
 * Every line on a card is read out of `data/projects.ts` rather than written
 * here, so a card cannot drift from the project it points at: the summary IS
 * the project's summary, and the link goes to it. Change the project, change
 * the card.
 *
 * The deck turns rather than sliding. One card faces you and the other two are
 * angled back beside it, and they rotate through — which is a different device
 * from everything else on this site, all of which either fades, wipes or
 * builds. It earns a section of its own for that reason: repeating an
 * interaction is what made /work and the home page feel like one page.
 */

/** Slug per house type. The words come from the project, not from here. */
const HOUSES = [
  { kind: "Worker's cottage", slug: 'paddington-workers-cottage' },
  { kind: 'Queenslander', slug: 'new-farm-queenslander' },
  { kind: 'Post-war home', slug: 'ashgrove-post-war-lift' },
] as const

/** How long a card holds the front before the deck turns. */
const HOLD = 6000

export function Houses() {
  const reduced = useReducedMotion()
  const [at, setAt] = useState(0)
  /* Held while a pointer or a focus is anywhere in the deck. Turning a card out
     from under somebody who has reached for it is what makes this pattern feel
     cheap, and under reduced motion it never turns on its own at all. */
  const [held, setHeld] = useState(false)

  const go = useCallback((n: number) => {
    setAt(((n % HOUSES.length) + HOUSES.length) % HOUSES.length)
  }, [])

  useEffect(() => {
    if (reduced || held) return
    const timer = window.setTimeout(() => go(at + 1), HOLD)
    return () => window.clearTimeout(timer)
  }, [reduced, held, at, go])

  return (
    <section className={['section', styles.section].join(' ')} aria-labelledby="houses-heading">
      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.head}>
          <SheetRef
            number="E-04"
            name="Three houses"
            note={reduced ? undefined : 'The deck turns'}
            rule={false}
          />
          <h2 id="houses-heading" className={['section-heading', styles.heading].join(' ')}>
            Three houses, and what each one needs.
          </h2>
        </Reveal>

        <Reveal delay={0.06}>
          <div
            className={styles.deck}
            onPointerEnter={() => setHeld(true)}
            onPointerLeave={() => setHeld(false)}
          >
            {HOUSES.map((house, i) => {
              const project = getProject(house.slug)
              if (!project) return null

              /* Where this card sits in the turn: 0 is the front, 1 is the one
                 angled back on the right, 2 the one on the left. Done in
                 positions rather than in pixels so the deck reads the same at
                 every width — the stylesheet owns what a position looks like. */
              const pos = (i - at + HOUSES.length) % HOUSES.length

              return (
                <article
                  key={house.slug}
                  className={styles.card}
                  data-pos={pos}
                  aria-hidden={pos === 0 ? undefined : true}
                >
                  {/* The two angled cards are turned away, so their links are
                      taken out of the tab order with them — otherwise the
                      keyboard lands on something the eye cannot read. The
                      controls under the deck are how a keyboard turns it. */}
                  <button
                    type="button"
                    className={styles.face}
                    tabIndex={pos === 0 ? -1 : undefined}
                    aria-label={`Bring ${house.kind} to the front`}
                    onClick={() => go(i)}
                    onFocus={() => setHeld(true)}
                    onBlur={() => setHeld(false)}
                  >
                    <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.kind}>{house.kind}</span>
                    <span className={styles.note}>{project.summary}</span>
                  </button>

                  <Link
                    to={`/work/${house.slug}`}
                    className={styles.go}
                    tabIndex={pos === 0 ? undefined : -1}
                    onFocus={() => setHeld(true)}
                    onBlur={() => setHeld(false)}
                  >
                    {project.title}
                    <span className={styles.arrow} aria-hidden="true">
                      <svg viewBox="0 0 34 10" fill="none">
                        <path d="M0 5h32M27.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    </span>
                  </Link>
                </article>
              )
            })}
          </div>
        </Reveal>

        {/* Turn it by hand. The deck moves on its own, so this is for anybody
            who wants to go back — and it is the whole of the keyboard path. */}
        <Reveal delay={0.12} className={styles.controls}>
          <button
            type="button"
            className={styles.step}
            onClick={() => go(at - 1)}
            onFocus={() => setHeld(true)}
            onBlur={() => setHeld(false)}
            aria-label="Previous house"
          >
            <svg viewBox="0 0 34 10" fill="none" aria-hidden="true">
              <path d="M34 5H2M6.5 1L2 5l4.5 4" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>

          <span className={styles.count} aria-hidden="true">
            <span className={styles.countNow}>{String(at + 1).padStart(2, '0')}</span>
            <span className={styles.countRule} />
            <span>{String(HOUSES.length).padStart(2, '0')}</span>
          </span>

          <button
            type="button"
            className={styles.step}
            onClick={() => go(at + 1)}
            onFocus={() => setHeld(true)}
            onBlur={() => setHeld(false)}
            aria-label="Next house"
          >
            <svg viewBox="0 0 34 10" fill="none" aria-hidden="true">
              <path d="M0 5h32M27.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </Reveal>
      </div>
    </section>
  )
}
