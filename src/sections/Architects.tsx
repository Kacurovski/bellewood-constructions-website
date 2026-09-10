import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { ScrollWords } from '../components/ScrollWords'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { contact } from '../config/site'
import styles from './Architects.module.css'

/**
 * For architects and designers.
 *
 * The referral engine, and the audience arriving from LinkedIn outreach. They
 * need one thing: evidence that this builder will not embarrass them in front
 * of their own client. So the section is short, plain and specific about how the
 * work runs — no sales language, nothing about partnership or synergy.
 *
 * It says the same two sentences it always did. What changed is that they are
 * now the largest thing in the band rather than a note beside a heading: this
 * is the one section on the site written to a professional, and it was set like
 * a footnote.
 *
 * The ground is section hatching — the 45° ruling a drawing uses to show a cut
 * through material — lit around the pointer. A-03 stands on the setting-out
 * grid; this stands on hatch. Two bands, two conventions, so they are
 * recognisably from the same set without being the same move twice.
 */
export function Architects() {
  const band = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  function onMove(event: ReactPointerEvent<HTMLElement>) {
    const box = band.current?.getBoundingClientRect()
    if (!box) return
    band.current?.style.setProperty('--mx', `${event.clientX - box.left}px`)
    band.current?.style.setProperty('--my', `${event.clientY - box.top}px`)
  }

  return (
    <section
      ref={band}
      className={['section', styles.section].join(' ')}
      aria-labelledby="architects-heading"
      onPointerMove={reduced ? undefined : onMove}
    >
      {/* Drawn in CSS and carrying nothing to read. */}
      <span className={styles.hatch} aria-hidden="true" />

      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.head}>
          <SheetRef
            number="A-06"
            name={
              <h2 id="architects-heading" className={styles.heading}>
                For architects and designers
              </h2>
            }
            note="We build to the drawings"
            rule={false}
          />
        </Reveal>

        <Reveal delay={0.06} className={styles.statementWrap}>
          <ScrollWords
            className={styles.statement}
            text="Questions come early, in writing, *before they become variations*. Site is kept in a state *you can bring a client to*."
          />
        </Reveal>

        <Reveal delay={0.12} className={styles.callWrap}>
          <p className={styles.callLabel}>Talk it through before tender</p>
          <a href={contact.phoneHref} className={styles.call}>
            {contact.phone}
            <span className={styles.callArrow} aria-hidden="true">
              <svg viewBox="0 0 34 10" fill="none">
                <path d="M0 5h32M27.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
