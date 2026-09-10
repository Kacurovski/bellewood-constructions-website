import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { ProjectCard } from '../components/ProjectCard'
import { ProjectIndex } from '../components/ProjectIndex'
import { SwipeRow } from '../components/SwipeRow'
import { featuredProjects } from '../data/projects'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './SelectedProjects.module.css'

/**
 * The showcase.
 *
 * A selection, not an index. The full set lives on /work, which is what the row
 * at the bottom leads to — with every project featured here the two views showed
 * the same thing and that link went nowhere new.
 *
 * There is deliberately no count anywhere in this section. A number describes the
 * photo library, not the career behind it: this builder has been working for more
 * than two decades at around four projects a year, and "6 projects" on the page
 * would undersell that badly.
 */
export function SelectedProjects() {
  /* A register needs two things: a pointer to reveal with, and enough width to
     put the plate beside the names rather than under them. Below either, the
     rail is the better section — it is the one that still has photographs in it.
     The two never both mount, so no photograph is in the DOM twice. */
  const canHover = useMediaQuery('(min-width: 1001px) and (pointer: fine)')
  const reduced = useReducedMotion()
  const band = useRef<HTMLElement>(null)

  /* The setting-out grid behind this band is lit in a pool around the pointer.
     The position is written straight to two custom properties on the section —
     no state, so no React render on a mousemove, and the browser only repaints
     a mask. At rest the pool sits where the CSS parks it, so the grid is there
     before anybody has moved anything. */
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
      aria-labelledby="work-heading"
      onPointerMove={reduced || !canHover ? undefined : onMove}
    >
      {/* The sheet the work is set out on. Decorative — it is drawn entirely in
          CSS and carries nothing to read. */}
      <span className={styles.grid} aria-hidden="true" />

      <div className="shell">
        {/* The reference carries the heading. This band's title is two words
            and the strip already prints them — a separate 56px "Selected work"
            under a strip reading "A-03 — Selected work" was the same two words
            twice, and the two of them collided. */}
        <Reveal className={styles.head}>
          <SheetRef
            number="A-03"
            name={
              <h2 id="work-heading" className={styles.heading}>
                Selected work
              </h2>
            }
            note="Three of them"
            rule={false}
          />
        </Reveal>

        {/* On a pointer device the work is a register: names on ruled lines,
            and one photograph following the cursor. Everything this section has
            been before — a grid of six, full-bleed bands, alternating rows — was
            the same idea at a different size, and every builder's site is one of
            them.

            On touch there is no hover to reveal anything with, so it stays the
            swipe rail. Three rows stacked are three screens of scrolling before
            the page moves on; side by side they are one, and the card cut by
            the right edge is what says the row moves. */}
        <Reveal className={styles.list}>
          {canHover ? (
            <ProjectIndex
              projects={[...featuredProjects]}
              footer={
                <Link to="/work" className={styles.more}>
                  <span className={styles.moreLabel}>See all work</span>
                  <span className={styles.moreArrow} aria-hidden="true">
                    <svg viewBox="0 0 34 10" fill="none">
                      <path d="M0 5h32M27.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </span>
                </Link>
              }
            />
          ) : (
            <SwipeRow as="ul" label="Selected projects" columns={1}>
              {featuredProjects.map((project, i) => (
                <Reveal as="li" key={project.slug} delay={0.05} className={styles.cell}>
                  <ProjectCard
                    project={project}
                    index={i}
                    variant="row"
                    flip={i % 2 === 1}
                    ratio="3 / 2"
                  />
                </Reveal>
              ))}
            </SwipeRow>
          )}
        </Reveal>

        {/* Only the rail needs this. On a pointer device the way on lives
            inside the register, in the corner the list leaves empty. */}
        {!canHover && (
          <Reveal className={styles.foot}>
            <Link to="/work" className={styles.more}>
              <span className={styles.moreLabel}>See all work</span>
              <span className={styles.moreArrow} aria-hidden="true">
                <svg viewBox="0 0 34 10" fill="none">
                  <path d="M0 5h32M27.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </span>
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  )
}
