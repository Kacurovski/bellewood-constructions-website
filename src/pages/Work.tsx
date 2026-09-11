import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PageHead } from '../components/PageHead'
import { LeadMagnet } from '../components/LeadMagnet'
import { projects } from '../data/projects'
import { contact } from '../config/site'
import { usePageTitle } from '../hooks/usePageTitle'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './Work.module.css'

const COUNT_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']

/**
 * The work.
 *
 * Six projects, and the page has been through three shapes. It was a contact
 * sheet: six plates in a grid, every one the same size, which is what every
 * builder's site is and which made six placeholder photographs the whole page.
 * Then it was the same grid with a pointer mark on it, which changed the
 * texture and not the shape.
 *
 * It is now a plate and a list: one large photograph held beside the six names,
 * changing to whichever project you have scrolled to.
 *
 * Scroll, not hover, is what drives it. That matters for two reasons. The home
 * page already carries a register that reveals its plate on hover, and doing
 * the same thing here twice would make the two pages one page; and a hover
 * register is nothing at all on a phone, where half this site is read. Keying
 * on scroll is the interaction this site already uses for the material legend,
 * and it is the only one that works the same for everybody — reading the list
 * IS the interaction.
 *
 * A pointer still overrides it, because somebody who reaches for a row has
 * asked a question and should get an answer before they scroll.
 */
export default function Work() {
  usePageTitle('Work')

  const pointer = useMediaQuery('(min-width: 941px) and (pointer: fine)')
  const reduced = useReducedMotion()
  const [at, setAt] = useState(0)

  const rows = useRef<(HTMLLIElement | null)[]>([])
  const plate = useRef<HTMLAnchorElement>(null)

  /* The row being read is the last one whose top has passed a line drawn across
     the upper third of the window. Measured against the window rather than
     against the plate, so the answer does not change when the plate does. */
  const readScroll = useCallback(() => {
    const line = window.innerHeight * 0.38
    let next = 0
    rows.current.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top <= line) next = i
    })
    setAt(next)
  }, [])

  useEffect(() => {
    readScroll()
    window.addEventListener('scroll', readScroll, { passive: true })
    window.addEventListener('resize', readScroll)
    return () => {
      window.removeEventListener('scroll', readScroll)
      window.removeEventListener('resize', readScroll)
    }
  }, [readScroll])

  /* The pointer's position inside the plate, written straight to two custom
     properties so a mousemove costs no React render. The browser moves two
     hairlines and a tag, and nothing else. */
  function onMove(event: ReactPointerEvent<HTMLElement>) {
    const box = plate.current?.getBoundingClientRect()
    if (!box) return
    plate.current?.style.setProperty('--cx', `${event.clientX - box.left}px`)
    plate.current?.style.setProperty('--cy', `${event.clientY - box.top}px`)
  }

  const shown =
    projects.length < COUNT_WORDS.length ? COUNT_WORDS[projects.length] : String(projects.length)

  const live = projects[at]

  return (
    <>
      <PageHead
        number="B-01"
        eyebrow="Work"
        title="Renovations, extensions and restorations."
        lede="A small number of projects, each one taken from the drawings through to the last piece of trim. Most are heritage or older homes in inner Brisbane."
        meta={[
          { label: 'Projects', value: <span className={styles.count}>{shown} shown</span> },
          { label: 'Where', value: contact.serviceArea },
          { label: 'Enquiries', value: <a href={contact.phoneHref}>{contact.phone}</a> },
        ]}
      />

      {/* Not `shell`. See the note in the stylesheet: the two fight. */}
      <div className={styles.set}>
        <div className={styles.split}>
          {/* --- The plate ------------------------------------------------
              Sticky, and a link to whichever project it is showing, so the
              photograph is a way in rather than an illustration of one. It has
              to be SHORTER than the list beside it or it has nothing to stick
              through — that is the whole mechanism, and it is why the height
              here is bounded by the window rather than by its contents. */}
          <div className={styles.plateCol}>
            <Link
              ref={plate}
              to={`/work/${live.slug}`}
              className={styles.plate}
              tabIndex={-1}
              aria-hidden="true"
              onPointerMove={pointer && !reduced ? onMove : undefined}
            >
              <AnimatePresence initial={false}>
                {/* Two photographs, one on top of the other: the house as it is,
                    and under the pointer the house as it was.

                    The push is a CSS animation rather than a framer one because
                    both layers have to run it in lockstep — they mount together,
                    so one keyframe list keeps them registered to the pixel. A
                    plate this size holding still reads as a slab; eighteen
                    seconds of it means the photograph never arrives. */}
                <motion.div
                  key={live.slug}
                  className={styles.plateShot}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <img className={styles.plateImg} src={live.hero.src ?? undefined} alt="" />

                  {/* Clipped to the left of the pointer by the SAME figure the
                      crosshair's vertical rule is drawn at, and with the same
                      lag, so the line you are moving is the edge of the reveal
                      rather than something that happens to sit near it.

                      The clip is on this wrapper and not on the photograph,
                      because the photograph is being scaled and a clip inside a
                      scaled box is measured in that box's own stretched
                      coordinates — the edge would drift away from the line. */}
                  {live.before.src && (
                    <span className={styles.beforeClip} aria-hidden="true">
                      <img className={styles.plateImg} src={live.before.src} alt="" />
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Setting-out lines, following the pointer across the plate.
                  Fixing a position by ruling to it is what a drawing does; a
                  disc with "View" in it, which is what this was, is what every
                  template does. */}
              <span className={styles.trace}>
                <span className={styles.traceH} />
                <span className={styles.traceV} />
                <span className={styles.traceTag}>
                  <span className={styles.traceNum}>{String(at + 1).padStart(2, '0')}</span>
                  View project
                </span>

                {/* Named at the two ends of the rule, so what is happening is
                    readable the moment the pointer lands rather than something
                    you have to work out. Only where there is a before to show:
                    two of the six have no photograph of the house as it was,
                    and a label over a plate that is not revealing anything is
                    worse than no label. */}
                {live.before.src && (
                  <>
                    <span className={[styles.edge, styles.edgeBefore].join(' ')}>Before</span>
                    <span className={[styles.edge, styles.edgeAfter].join(' ')}>After</span>
                  </>
                )}
              </span>
            </Link>

            {/* The caption is what makes the plate legible standing still.
                Without it this is a photograph beside a list, and nothing says
                the two are connected. */}
            <p className={styles.plateCap}>
              <span className={styles.plateNum}>{String(at + 1).padStart(2, '0')}</span>
              <span className={styles.plateTitle}>{live.title}</span>
              <span className={styles.plateOf}>
                {String(at + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
              </span>
            </p>

            {/* How far through the index you are, drawn as a rule that fills.
                The list is six screens tall, so without this there is nothing
                on the page that says whether you are near the start of it or
                near the end. */}
            <span className={styles.rail} aria-hidden="true">
              <motion.span
                className={styles.railFill}
                animate={{ scaleX: (at + 1) / projects.length }}
                transition={{ duration: reduced ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </span>
          </div>

          <ol className={styles.list}>
            {projects.map((project, i) => (
              <li
                key={project.slug}
                ref={(el) => {
                  rows.current[i] = el
                }}
                className={[styles.row, i === at ? styles.rowOn : ''].join(' ')}
                onPointerEnter={pointer ? () => setAt(i) : undefined}
              >
                <Link to={`/work/${project.slug}`} className={styles.rowLink}>
                  <span className={styles.rowNum}>{String(i + 1).padStart(2, '0')}</span>

                  <span className={styles.rowBody}>
                    <span className={['sub-heading', styles.rowTitle].join(' ')}>
                      {project.title}
                    </span>
                    <span className={styles.rowMeta}>
                      <span>{project.kind}</span>
                      <span className={styles.dot} aria-hidden="true" />
                      <span>{project.suburb}</span>
                    </span>

                    {/* The one line the data has always carried and the index
                        has always thrown away. Six names and a suburb each is a
                        contents page; this is what makes the list worth moving
                        through, and it opens on the row you are actually on. */}
                    <span className={styles.rowSummary}>
                      <span>{project.summary}</span>
                    </span>
                  </span>

                  <span className={styles.rowArrow} aria-hidden="true">
                    <svg viewBox="0 0 34 10" fill="none">
                      <path d="M0 5h32M27.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </span>

                  {/* The plate, inline. Below the split's breakpoint there is no
                      sticky column to carry it and no pointer to reveal it with,
                      so every row carries its own — which is the plain stacked
                      list a phone should have had all along. */}
                  <span className={styles.rowPlate} aria-hidden="true">
                    <img src={project.hero.src ?? undefined} alt="" loading="lazy" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className={['shell', styles.magnet].join(' ')}>
        <LeadMagnet tone="green" />
      </div>
    </>
  )
}
