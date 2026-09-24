import { motion } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
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

        <ol className={styles.grid}>
          {services.map((item, i) => {
            const delay = Math.min(i * 0.05, 0.25)
            return (
              <Reveal key={item.title} as="li" className={styles.plate} delay={delay}>
                {/* The green plane that rises under the pointer. */}
                <span className={styles.fill} aria-hidden="true" />
                <span className={styles.watermark} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className={styles.inner}>
                  <Drawing paths={pictograms[item.title] ?? []} delay={delay} reduced={reduced} />
                  <h3 className={styles.title}>{item.title}</h3>
                  <p className={styles.lead}>{item.lead}</p>
                  <p className={['small', styles.body].join(' ')}>{item.body}</p>
                </div>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
