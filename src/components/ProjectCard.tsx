import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { ImageSlot } from './ImageSlot'
import { useReducedMotion } from '../hooks/useReducedMotion'
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
  const plate = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  /* The pointer's position inside the plate, written straight to two custom
     properties rather than to state: a mousemove that re-renders a card is a
     mousemove that costs a render on every one of six cards. The browser moves
     one transform and nothing else. */
  function onMove(event: ReactPointerEvent<HTMLDivElement>) {
    const box = plate.current?.getBoundingClientRect()
    if (!box) return
    plate.current?.style.setProperty('--cx', `${event.clientX - box.left}px`)
    plate.current?.style.setProperty('--cy', `${event.clientY - box.top}px`)
  }

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
        <div
          ref={plate}
          className={styles.media}
          onPointerMove={variant === 'card' && !reduced ? onMove : undefined}
        >
          {/* No label on the ground: the title and suburb sit directly beneath
              it, and printing them twice reads as a mistake rather than as a
              considered empty state. */}
          <ImageSlot slot={project.hero} ratio={ratio} tone={index % 3 === 0 ? 'green' : 'sage'} />

          {/* The index plate's affordance, and the only thing on the site that
              follows the pointer.

              The row variant can afford a written "View project" under its
              meta; the index cannot — six of those is a page of buttons. So the
              index says it on the plate instead, and only while a pointer is
              actually on one. It is drawn as a registration mark rather than a
              button, which is the vocabulary the rest of the page is in.

              Hidden entirely where there is no pointer to follow: on a phone it
              would either never appear or, worse, stick where the last tap
              landed. */}
          {variant === 'card' && (
            <span className={styles.trace} aria-hidden="true">
              <span className={styles.traceMark} />
              View
            </span>
          )}
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
