import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { Project } from '../data/projects'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './ProjectIndex.module.css'

type Props = {
  projects: Project[]
  /** Where the numbering starts. The index is 1-based on the page. */
  start?: number
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
 */
export function ProjectIndex({ projects, start = 1 }: Props) {
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
              className={[styles.row, active === i ? styles.rowActive : ''].join(' ')}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
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

      {/* Every photograph is mounted and crossfaded rather than swapped on the
          src: swapping flashes the first time each one is reached, and a
          register whose plate flickers is worse than one with no plate.
          Decorative — each row is already a named link. */}
      <div className={styles.stage} aria-hidden="true">
        {projects.map((project, i) =>
          project.hero.src ? (
            <motion.img
              key={project.slug}
              className={[
                styles.plate,
                i === shown ? (active === null ? styles.plateResting : styles.plateOn) : '',
              ].join(' ')}
              style={reduced ? undefined : { x: driftX, y: driftY }}
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
    </div>
  )
}
