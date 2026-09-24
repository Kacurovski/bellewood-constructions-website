import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { SwipeArrows } from '../components/SwipeArrows'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { services } from '../data/services'
import { pictograms } from './servicePictograms'
import styles from './Services.module.css'

/**
 * What we take on.
 *
 * Six kinds of work, set as six plates in a ruled grid: hairlines between the
 * cells, touching, like a set-out table on the sheet. Each plate carries a
 * line drawing in the mark's own construction, a reference numeral set large
 * and faint behind it, a title, a line and a short account. Copy is in
 * `src/data/services.ts`; the drawings in `servicePictograms.ts`.
 *
 * Two motions, both once and both weighted. As a plate enters view its
 * drawing runs its own outline. Under a pointer a Bellewood-green plane rises
 * from the foot of the plate, the type turns to wash, and the drawing REDRAWS
 * itself in white — the job-site mesh, green field and white line, at the
 * scale of one cell. Pointer-only, so a phone never shows a plate stuck in
 * its hover state after a tap.
 *
 * Under reduced motion the drawings render complete and the hover fill is
 * still there, without the sweep.
 *
 * ON A PHONE the grid becomes a swipe: the plates in a row, native
 * scroll-snap, the next one peeking in from the right, and a rail beneath —
 * a counter and a line that fills as you go — so you always know where you
 * are in the six. Six plates stacked is most of two thousand pixels of
 * scrolling; a swipe is one screen. The scroller is the browser's own, so it
 * has real momentum and costs nothing.
 */

const EASE = [0.16, 1, 0.3, 1] as const

/* The drawing. A parent that owns the variants; each path follows them. On
   enter it draws once; on hover it draws again from nothing; when the pointer
   leaves it settles back to complete. */
function Drawing({ paths, delay, reduced }: { paths: string[]; delay: number; reduced: boolean }) {
  const common = {
    viewBox: '0 0 64 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: styles.drawing,
    'aria-hidden': true,
  }
  if (reduced) {
    return (
      <svg {...common}>
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    )
  }
  return (
    <motion.svg
      {...common}
      initial="hidden"
      whileInView="drawn"
      whileHover="redraw"
      viewport={{ once: true, margin: '-8% 0px -4% 0px' }}
    >
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          variants={{
            hidden: { pathLength: 0, opacity: 0.4 },
            drawn: { pathLength: 1, opacity: 1, transition: { duration: 1.3, delay: delay + i * 0.12, ease: EASE } },
            redraw: { pathLength: [0, 1], opacity: 1, transition: { duration: 0.9, delay: i * 0.07, ease: EASE } },
          }}
        />
      ))}
    </motion.svg>
  )
}

export function Services({ number = 'B-08' }: { number?: string }) {
  const reduced = useReducedMotion()
  const rail = useRef<HTMLOListElement>(null)
  const [at, setAt] = useState(0)
  const [progress, setProgress] = useState(0)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const on = () => setNarrow(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  // One plate along, either way.
  const move = (dir: 1 | -1) => {
    const el = rail.current
    if (!el) return
    el.scrollBy({ left: dir * (el.scrollWidth / services.length), behavior: 'smooth' })
  }

  // Which plate the swipe is on, and how far through the row it is. Only the
  // phone layout scrolls sideways; on a desk these never change from zero.
  useEffect(() => {
    const el = rail.current
    if (!el) return
    let raf = 0
    const read = () => {
      raf = 0
      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) return
      const step = el.scrollWidth / services.length
      setAt(Math.min(services.length - 1, Math.round(el.scrollLeft / step)))
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

  return (
    <section className={['section', styles.section].join(' ')} aria-labelledby="services-heading">
      <div className="shell">
        <Reveal className={styles.head}>
          <SheetRef
            number={number}
            name={
              <h2 id="services-heading" className={styles.heading}>
                What we take on
              </h2>
            }
            note="Six kinds of work"
            rule={false}
          />
        </Reveal>

        {/* On a desk each plate settles in on its own as it enters view. On a
            phone the ROW settles in once and every plate is solid from then
            on: a plate that fades in as it slides in reads as a card
            appearing from nothing, and plates off to the right of a swipe
            are never "in view" until they are already arriving. */}
        <Reveal as="div" className={narrow ? undefined : styles.rowStatic}>
          <ol ref={rail} className={styles.grid}>
            {services.map((item, i) => {
              const delay = Math.min(i * 0.05, 0.25)
              const content = (
                <>
                  {/* The green plane that rises under the pointer. */}
                  <span className={styles.fill} aria-hidden="true" />
                  <span className={styles.watermark} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className={styles.inner}>
                    <Drawing paths={pictograms[item.title] ?? []} delay={narrow ? 0 : delay} reduced={reduced} />
                    <h3 className={styles.title}>{item.title}</h3>
                    <p className={styles.lead}>{item.lead}</p>
                    <p className={['small', styles.body].join(' ')}>{item.body}</p>
                  </div>
                </>
              )
              return narrow ? (
                <li key={item.title} className={styles.plate}>
                  {content}
                </li>
              ) : (
                <Reveal key={item.title} as="li" className={styles.plate} delay={delay}>
                  {content}
                </Reveal>
              )
            })}
          </ol>
        </Reveal>

        {/* The rail: phone only. Where you are in the six, how far, and the
            arrows to move along. */}
        <div className={styles.rail}>
          <span className={styles.railCount} aria-hidden="true">
            <span className={styles.railAt}>{String(at + 1).padStart(2, '0')}</span> / {String(services.length).padStart(2, '0')}
          </span>
          <span className={styles.railTrack} aria-hidden="true">
            <span className={styles.railFill} style={{ transform: `scaleX(${Math.max(progress, 1 / services.length)})` }} />
          </span>
          <SwipeArrows onPrev={() => move(-1)} onNext={() => move(1)} atStart={at <= 0} atEnd={at >= services.length - 1} label="kind of work" />
        </div>
      </div>
    </section>
  )
}
