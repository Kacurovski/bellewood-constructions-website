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
        <Reveal className={styles.head}>
          <SheetRef number="A-03" name="Selected work" note="Six projects" />
          <h2 id="work-heading" className="section-heading">
            Selected work
          </h2>
        </Reveal>

        <SwipeRow label="Selected projects" columns={3} className={styles.grid}>
          {featuredProjects.map((project, i) => (
            <Reveal key={project.slug} delay={(i % 3) * 0.07} className={styles.cell}>
              <ProjectCard project={project} index={i} offset={i % 2 === 1} />
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
