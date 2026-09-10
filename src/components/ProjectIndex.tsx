import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { Project } from '../data/projects'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './ProjectIndex.module.css'

type Props = {
  projects: Project[]
  /** Where the numbering starts. The index is 1-based on the page. */
  start?: number
  /**
   * Rendered under the list, inside the left column. The way on to /work lives
   * here rather than below the section: the list is three rows and the stage
   * beside it is tall, so without this the bottom-left quarter of the band is
   * empty ground.
   */
  footer?: ReactNode
}

/**
 * The work, set as a drawing register.
 *
 * A register is the sheet at the front of a set of drawings: a numbered list of
 * what is in the set, one line each. It is the calmest way to present a body of
 * work and it is the right one here for three reasons.
 *
 * It stops the section being a stack of pictures. A grid of six, full-bleed
 * bands, alternating rows — all of those are the same idea at different sizes,
 * and every builder's website is one of them. A register is a list of names,
 * and the photograph is what you get for showing interest in one of them.
 *
 * It puts the work in the reader's hands. Nothing changes until the pointer
 * moves, and the plate drifts as it does, so the section feels attached to the
 * reader rather than playing at them.
 *
 * And it carries placeholder photography far better than a grid does. Six stock
 * photographs laid out at size are six stock photographs; one at a time, chosen,
 * is a glimpse. When Angus's real library lands this gets better, but it does
 * not depend on it.
 *
 * The plate had a turn following the cursor. It read as chaotic, because it
 * was: a photograph moving under the pointer covers the row being read and the
 * rows either side of it, so the thing you were looking at is hidden by the
 * thing you asked to see. On its own sticky stage nothing overlaps anything.
 *
 * Touch devices never see this — there is no hover to reveal anything with — so
 * `SelectedProjects` renders the swipe rail instead and this never mounts.
 *
 * The caption under the plate is what makes the section legible standing still.
 * Without it this is three names beside a photograph, and nothing says the two
 * are connected until somebody happens to move the pointer over a row — which
 * is a lot to ask of a section most people only glance at.
 */
export function ProjectIndex({ projects, start = 1, footer }: Props) {
  const [active, setActive] = useState<number | null>(null)
  const reduced = useReducedMotion()
  const frame = useRef<HTMLDivElement>(null)

  // Pointer position across the register, 0 to 1, as a small parallax on the
  // plate. It is the only thing on this component that follows the cursor, and
  // it moves a few pixels — enough to feel live, not enough to distract.
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, { stiffness: 90, damping: 22, mass: 0.5 })
  const sy = useSpring(py, { stiffness: 90, damping: 22, mass: 0.5 })
  const driftX = useTransform(sx, [0, 1], ['2.4%', '-2.4%'])
  const driftY = useTransform(sy, [0, 1], ['2.4%', '-2.4%'])

  function onMove(event: ReactPointerEvent<HTMLDivElement>) {
    const box = frame.current?.getBoundingClientRect()
    if (!box) return
    px.set((event.clientX - box.left) / box.width)
    py.set((event.clientY - box.top) / box.height)
  }

  // Before anything is hovered the stage holds the first project, so the
  // section is never an empty rectangle waiting to be discovered.
  const shown = active ?? 0

  return (
    <div
      ref={frame}
      className={styles.wrap}
      onPointerMove={reduced ? undefined : onMove}
      onPointerLeave={() => setActive(null)}
    >
      <ol className={styles.list}>
        {projects.map((project, i) => (
          <li key={project.slug} className={styles.item}>
            <Link
              to={`/work/${project.slug}`}
              className={[
                styles.row,
                i === shown ? styles.rowActive : '',
                // At rest the first row is the one on the stage, so it is lit —
                // but only the row the pointer is actually on gets the travel.
                active === i ? styles.rowHot : '',
              ].join(' ')}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              {/* The rule that marks the live row. It draws down the left edge
                  rather than filling or boxing anything, which is the only kind
                  of emphasis the rest of this site uses. */}
              <span className={styles.edge} aria-hidden="true" />
              <span className={styles.number}>{String(start + i).padStart(2, '0')}</span>
              <span className={styles.title}>{project.title}</span>
              <span className={styles.detail}>
                {project.kind}
                <span className={styles.dot} aria-hidden="true" />
                {project.suburb}
              </span>
              <span className={styles.arrow} aria-hidden="true">
                <svg viewBox="0 0 34 10" fill="none">
                  <path d="M0 5h32M27.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {/* The live project's number, at size, in the ground the three rows leave
          empty. It is the same information the row already carries — which is
          the point: it is not a label, it is the section acknowledging what you
          are pointing at, in the one place there was nothing to look at. */}
      <div className={styles.mark} aria-hidden="true">
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={shown}
            className={styles.markFigure}
            initial={reduced ? false : { opacity: 0, y: '0.14em' }}
            animate={{ opacity: 1, y: '0em' }}
            exit={reduced ? { opacity: 1 } : { opacity: 0, y: '-0.14em' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {String(start + shown).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>

      {footer && <div className={styles.footer}>{footer}</div>}

      {/* The stage, and the caption that ties it to the list.

          Without the caption the section is three names and a photograph, and
          nothing on it says the two are connected until you happen to move the
          pointer over a row. The caption names what is on the plate and counts
          it against the set, so the link is legible standing still — which is
          the state most people see it in. */}
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.frame}>
          {/* Every photograph is mounted and crossfaded rather than swapped on
              the src: swapping flashes the first time each one is reached, and a
              register whose plate flickers is worse than one with no plate. */}
          {projects.map((project, i) =>
            project.hero.src ? (
              <motion.img
                key={project.slug}
                className={styles.plate}
                style={reduced ? undefined : { x: driftX, y: driftY }}
                // The plate is uncovered from the bottom rather than faded in,
                // and settles from slightly oversize as it arrives. A crossfade
                // between two photographs is a dissolve; this is one being
                // drawn over the other, which is the move the rest of the site
                // makes with its rules and its masks.
                animate={
                  i === shown
                    ? { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, opacity: 1 }
                    : { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.06, opacity: 0 }
                }
                transition={
                  reduced
                    ? { duration: 0 }
                    : {
                        // Slow. The plate is the largest thing that moves on
                        // this page and it is being uncovered, not switched —
                        // at three quarters of a second it read as a flick.
                        clipPath: { duration: 1.25, ease: [0.16, 1, 0.3, 1] },
                        scale: { duration: 1.9, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.45 },
                      }
                }
                src={project.hero.src}
                alt=""
                loading="eager"
                decoding="async"
              />
            ) : (
              <span
                key={project.slug}
                className={[styles.corner, i === shown ? styles.cornerOn : ''].join(' ')}
              />
            ),
          )}
        </div>

        {/* A second, smaller plate lapping the corner of the first, changing a
            beat behind it. One rectangle is a picture; two overlapping, arriving
            out of step, is a composition — and it doubles what the section
            shows without doubling what it takes up. */}
        <div className={styles.inset}>
          {projects.map((project, i) => {
            const detail = project.gallery[0]
            return detail?.src ? (
              <motion.img
                key={project.slug}
                className={styles.insetPlate}
                animate={
                  i === shown
                    ? { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, opacity: 1 }
                    : { clipPath: 'inset(0% 100% 0% 0%)', scale: 1.08, opacity: 0 }
                }
                transition={
                  reduced
                    ? { duration: 0 }
                    : {
                        // A fifth of a second behind the plate above, and just
                        // as unhurried, so the two arrivals are legibly two.
                        clipPath: { duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
                        scale: { duration: 1.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.4, delay: 0.2 },
                      }
                }
                src={detail.src}
                alt=""
                loading="eager"
                decoding="async"
              />
            ) : null
          })}
        </div>

        <div className={styles.caption}>
          {/* The name is swapped by rising out from behind the caption rule,
              the same entrance the plate above it makes and the same one the
              headline uses. Swapping the text in place made the plate move and
              the label blink, which are two different kinds of change for one
              event. */}
          <span className={styles.captionSlot}>
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={shown}
                className={styles.captionName}
                initial={reduced ? false : { y: '110%' }}
                animate={{ y: '0%' }}
                exit={reduced ? { y: '0%' } : { y: '-110%' }}
                transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className={styles.captionNumber}>
                  {String(start + shown).padStart(2, '0')}
                </span>
                {projects[shown]?.title}
              </motion.span>
            </AnimatePresence>
          </span>

          <span className={styles.captionCount}>
            {String(start + shown).padStart(2, '0')}
            <span className={styles.captionSlash} />
            {String(projects.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  )
}
