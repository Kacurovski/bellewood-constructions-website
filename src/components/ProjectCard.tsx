import { Link } from 'react-router-dom'
import { ImageSlot } from './ImageSlot'
import type { Project } from '../data/projects'
import styles from './ProjectCard.module.css'

type Props = {
  project: Project
  /** Index in the list, shown as a drawing-style reference number. */
  index: number
  /** Cards alternate their vertical offset to break the grid's regularity. */
  offset?: boolean
  ratio?: string
  /**
   * `row` is the home page's selection: a medium plate beside its meta, the
   * two alternating down the page. `card` is the index treatment used on /work.
   */
  variant?: 'card' | 'row'
  /** Puts the plate on the right instead of the left. Alternated by the list. */
  flip?: boolean
}

export function ProjectCard({
  project,
  index,
  offset = false,
  ratio = '4 / 5',
  variant = 'card',
  flip = false,
}: Props) {
  return (
    <article
      className={[
        styles.card,
        variant === 'row' ? styles.row : '',
        variant === 'row' && flip ? styles.flip : '',
        offset ? styles.offset : '',
      ]
        .join(' ')
        .trim()}
    >
      <Link to={`/work/${project.slug}`} className={styles.link}>
        <div className={styles.media}>
          {/* No label on the ground: the title and suburb sit directly beneath
              it, and printing them twice reads as a mistake rather than as a
              considered empty state. */}
          <ImageSlot slot={project.hero} ratio={ratio} tone={index % 3 === 0 ? 'green' : 'sage'} />
        </div>

        <div className={styles.meta}>
          <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
          <div>
            <h3 className={['sub-heading', styles.title].join(' ')}>{project.title}</h3>
            {/* Wrapped rather than bare text: on the mobile rail the card is
                narrow enough that these two go on separate lines, and bare text
                nodes in a flex row cannot be told to do that. */}
            <p className={['small', styles.kind].join(' ')}>
              <span>{project.kind}</span>
              <span className={styles.dot} aria-hidden="true" />
              <span>{project.suburb}</span>
            </p>

            {/* The row is the only variant with room for an affordance, and it
                is the one whose plate is not obviously a link. */}
            {variant === 'row' && (
              <span className={styles.go}>
                View project
                <span className={styles.goArrow} aria-hidden="true">
                  <svg viewBox="0 0 34 10" fill="none">
                    <path d="M0 5h32M27.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </span>
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
