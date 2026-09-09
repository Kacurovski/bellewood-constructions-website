import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { ProjectCard } from '../components/ProjectCard'
import { SwipeRow } from '../components/SwipeRow'
import { featuredProjects } from '../data/projects'
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
  return (
    <section className={['section', styles.section].join(' ')} aria-labelledby="work-heading">
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
          />
        </Reveal>

        {/* Three rows rather than a grid of six, and rows rather than the
            full-bleed bands they were briefly: a 1440px plate is a slideshow,
            not a selection.

            One column on a wide screen, a swipe rail on a phone. Stacked, three
            rows are three screens of scrolling before the page moves on; side
            by side they are one, and the card cut by the right edge is what
            says the row moves. */}
        <SwipeRow
          as="ul"
          label="Selected projects"
          columns={1}
          className={styles.list}
        >
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

        {/* A full-width row rather than a link floating in the middle of a lot
            of empty ground. The rule and the arrow are what say "this is the
            way on"; a bare underlined phrase in the centre of a section said
            nothing at all. */}
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
      </div>
    </section>
  )
}
