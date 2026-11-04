import { ActionGlyph } from '../components/ActionGlyph'
import { useRef } from 'react'
import type { PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { ScrollWords } from '../components/ScrollWords'
import { SheetRef } from '../components/Sheet'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { contact } from '../config/site'
import styles from './AboutClosing.module.css'

/** The former process and architects statements share one closing on About. */
export function AboutClosing() {
  const section = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  function followPointer(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    section.current?.style.setProperty('--hatch-x', `${event.clientX - bounds.left}px`)
    section.current?.style.setProperty('--hatch-y', `${event.clientY - bounds.top}px`)
  }

  function resetPointer() {
    section.current?.style.removeProperty('--hatch-x')
    section.current?.style.removeProperty('--hatch-y')
  }

  return (
    <section ref={section} id="working-with-bellewood" className={styles.section}
      aria-labelledby="about-closing-heading"
      onPointerMove={reduced ? undefined : followPointer} onPointerLeave={resetPointer}>
      <span className={styles.hatch} aria-hidden="true" />
      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.header}>
          <SheetRef number="C-03" name="Working with Bellewood" rule={false} />
        </Reveal>

        <Reveal delay={0.05} className={styles.promise}>
          <ScrollWords as="h2" id="about-closing-heading" className={styles.statement}
            text="The drawings you were handed are the drawings *you get.*" />
          <p className={styles.care}>
            The same sequence on every job. The same care, from the first week to the last.
          </p>
        </Reveal>

        <Reveal delay={0.12} className={styles.detail}>
          <p className={styles.audience}>For architects and designers</p>
          <p className={styles.copy}>
            Questions come early, in writing, before they become variations.
            {' '}The site is kept in a state you can bring a client to.
          </p>
          <div className={styles.contact}>
            <p className={styles.invitation}>Talk it through with Angus</p>
            <a href={contact.phoneHref} className={styles.phone}>
              <span>{contact.phone}</span>
              <ActionGlyph name="phone" />
            </a>
            <Link to="/contact" className={styles.enquiry}>
              Send an enquiry
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
