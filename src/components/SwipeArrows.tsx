import styles from './SwipeArrows.module.css'

/**
 * The two arrows on a phone rail: back one plate, forward one plate.
 *
 * Every rail on the site — the selected work, the six kinds of work, the
 * seven stages — carries this same pair, so the way to move along one is
 * the way to move along all of them. Each is a full 44px tap target drawn
 * as a ring, the arrow a single stroke, and the one that cannot go any
 * further sits back rather than disappearing, so the pair never jumps.
 *
 * The rail's own counter and line stay with the rail; this is only the
 * means of moving it. A swipe still works exactly as before.
 */
export function SwipeArrows({
  onPrev,
  onNext,
  atStart,
  atEnd,
  label,
}: {
  onPrev: () => void
  onNext: () => void
  atStart: boolean
  atEnd: boolean
  /** What is being moved through, for the button names: "projects". */
  label: string
}) {
  return (
    <span className={styles.pair}>
      <button
        type="button"
        className={styles.btn}
        onClick={onPrev}
        aria-label={`Previous ${label}`}
        aria-disabled={atStart}
        disabled={atStart}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M12.5 4.5 7 10l5.5 5.5" />
        </svg>
      </button>
      <button
        type="button"
        className={styles.btn}
        onClick={onNext}
        aria-label={`Next ${label}`}
        aria-disabled={atEnd}
        disabled={atEnd}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M7.5 4.5 13 10l-5.5 5.5" />
        </svg>
      </button>
    </span>
  )
}
