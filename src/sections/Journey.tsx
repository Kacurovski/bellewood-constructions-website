import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { DrawnRule, Ref } from '../components/Drawn'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { journey } from '../data/journey'
import styles from './Journey.module.css'

/**
 * From the first call to handover.
 *
 * The build animation above this shows the house going up. This is the job
 * around it: seven stages, from a phone call to a walk through the finished
 * house. Copy lives in `src/data/journey.ts`.
 *
 * It is set as a ledger with a SPINE: a vertical line down the reference
 * column that fills with the scroll, so the page keeps its place in the
 * sequence the way the progress bar in the header keeps its place in the
 * page. Each stage's number sits in a ring; the ring fills as the spine
 * reaches it, and the stage the reader is on carries full weight while the
 * others sit back. The same active/at-rest treatment the build's own steps
 * use, so the two halves of the page behave as one.
 *
 * Under reduced motion the spine is drawn full, every ring is filled, and
 * every stage sits at full weight: the finished drawing, still.
 */
export function Journey({ number = 'E-04' }: { number?: string }) {
  const reduced = useReducedMotion()
  const list = useRef<HTMLOListElement>(null)
  const [active, setActive] = useState(-1)

  // The spine fills as the list passes through the middle of the window.
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 72%', 'end 55%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.6 })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const n = journey.length
    const idx = v <= 0 ? -1 : Math.min(n - 1, Math.floor(v * n + 0.15))
    if (idx !== active) setActive(idx)
  })

  return (
    <section className={['section', styles.section].join(' ')} aria-labelledby="journey-heading">
      <div className="shell">
        <Reveal className={styles.head}>
          <SheetRef
            number={number}
            name={
              <h2 id="journey-heading" className={styles.heading}>
                From the first call to handover
              </h2>
            }
            note="How a job runs"
            rule={false}
          />
        </Reveal>

        <div className={styles.ledger}>
          {/* The spine. A hairline the full height of the list, and a green
              fill that grows down it with the scroll. */}
          <span className={styles.spine} aria-hidden="true">
            {reduced ? (
              <span className={[styles.spineFill, styles.spineFull].join(' ')} />
            ) : (
              <motion.span className={styles.spineFill} style={{ scaleY: fill }} />
            )}
          </span>

          <ol ref={list} className={styles.list}>
            {journey.map((stage, i) => {
              const done = reduced || i <= active
              const current = !reduced && i === active
              return (
                <Reveal
                  key={stage.title}
                  as="li"
                  className={[styles.item, done ? styles.itemDone : '', current ? styles.itemActive : ''].join(' ')}
                  delay={Math.min(i * 0.03, 0.18)}
                >
                  <span className={styles.refCol}>
                    <Ref done={done} active={current}>
                      {String(i + 1).padStart(2, '0')}
                    </Ref>
                  </span>
                  <h3 className={styles.title}>{stage.title}</h3>
                  <div className={styles.body}>
                    {stage.body.map((para) => (
                      <p key={para} className={['small', styles.para].join(' ')}>
                        {para}
                      </p>
                    ))}
                  </div>
                  <DrawnRule className={styles.rule} delay={0.1 + Math.min(i * 0.03, 0.18)} />
                </Reveal>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
