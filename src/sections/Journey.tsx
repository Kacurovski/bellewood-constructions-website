import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { DrawnRule, Ref } from '../components/Drawn'
import { SwipeArrows } from '../components/SwipeArrows'
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
 *
 * ON A PHONE it is a swipe — the same pattern the six kinds of work use, and
 * it suits a sequence even better: seven stages in a row, native scroll-snap,
 * the next peeking in, and the spine becomes the rail beneath, a counter and
 * a line that fills as you move through the seven. Rings fill as you pass
 * them. Seven stages stacked was two and a half thousand pixels of scrolling.
 */
export function Journey({ number = 'E-04' }: { number?: string }) {
  const reduced = useReducedMotion()
  const list = useRef<HTMLOListElement>(null)
  const [active, setActive] = useState(-1)
  const [narrow, setNarrow] = useState(false)
  const [at, setAt] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const on = () => setNarrow(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  // One stage along, either way.
  const move = (dir: 1 | -1) => {
    const el = list.current
    if (!el) return
    el.scrollBy({ left: dir * (el.scrollWidth / journey.length), behavior: 'smooth' })
  }

  // The swipe's position, for the rail and the rings on a phone.
  useEffect(() => {
    const el = list.current
    if (!el) return
    let raf = 0
    const read = () => {
      raf = 0
      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) return
      const step = el.scrollWidth / journey.length
      setAt(Math.min(journey.length - 1, Math.round(el.scrollLeft / step)))
      setProgress(el.scrollLeft / max)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    read()
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

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
              // On a desk the spine decides; on a phone the swipe does.
              const done = reduced || (narrow ? i <= at : i <= active)
              const current = !reduced && (narrow ? i === at : i === active)
              const cls = [styles.item, done ? styles.itemDone : '', current ? styles.itemActive : ''].join(' ')
              const content = (
                <>
                  <span className={styles.refCol}>
                    <Ref done={done} active={current}>
                      {String(i + 1).padStart(2, '0')}
                    </Ref>
                  </span>
                  <div className={styles.card}>
                    <h3 className={styles.title}>{stage.title}</h3>
                    <div className={styles.body}>
                      {stage.body.map((para) => (
                        <p key={para} className={['small', styles.para].join(' ')}>
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                  <DrawnRule className={styles.rule} delay={0.1 + Math.min(i * 0.03, 0.18)} />
                </>
              )
              // A plain item on a phone — the row is the thing that arrives —
              // and a settling one on a desk.
              return narrow ? (
                <li key={stage.title} className={cls}>
                  {content}
                </li>
              ) : (
                <Reveal key={stage.title} as="li" className={cls} delay={Math.min(i * 0.03, 0.18)}>
                  {content}
                </Reveal>
              )
            })}
          </ol>

          {/* The rail: phone only. Where you are in the seven, how far, and
              the arrows to move along. */}
          <div className={styles.rail}>
            <span className={styles.railCount} aria-hidden="true">
              <span className={styles.railAt}>{String(at + 1).padStart(2, '0')}</span> / {String(journey.length).padStart(2, '0')}
            </span>
            <span className={styles.railTrack} aria-hidden="true">
              <span className={styles.railFill} style={{ transform: `scaleX(${Math.max(progress, 1 / journey.length)})` }} />
            </span>
            <SwipeArrows onPrev={() => move(-1)} onNext={() => move(1)} atStart={at <= 0} atEnd={at >= journey.length - 1} label="stage" />
          </div>
        </div>
      </div>
    </section>
  )
}
