import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './SwipeRow.module.css'

type Props = {
  children: ReactNode
  /** Accessible name for the scroller, e.g. "Selected projects". */
  label: string
  /** Columns on a wide screen. Two and three are what this site uses. */
  columns?: 2 | 3
  className?: string
  /** A list of things should still be a list. */
  as?: 'div' | 'ul'
}

/**
 * A grid on a wide screen, a swipeable rail on a phone.
 *
 * Six project cards in one column is nine screens of scrolling on a 390px
 * phone, and the sixth may as well not exist. Side by side they cost about one
 * screen, and the swipe does the work the stagger does on desktop.
 *
 * The layout switch is entirely CSS. This component only measures what the CSS
 * decided: the counter and the progress rule appear when the track actually
 * overflows, so the breakpoint is written once and an indicator can never turn
 * up under a grid that does not move.
 */
export function SwipeRow({ children, label, columns = 3, className, as: Tag = 'div' }: Props) {
  const track = useRef<HTMLElement | null>(null)
  const [rail, setRail] = useState(false)
  const [count, setCount] = useState(0)
  const [active, setActive] = useState(0)

  const read = useCallback(() => {
    const el = track.current
    if (!el) return

    setCount(el.children.length)

    const overflows = el.scrollWidth - el.clientWidth > 4
    setRail(overflows)
    if (!overflows) {
      setActive(0)
      return
    }

    const first = el.firstElementChild
    if (!first) return
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    const step = first.getBoundingClientRect().width + gap
    setActive(step > 0 ? Math.round(el.scrollLeft / step) : 0)
  }, [])

  useEffect(() => {
    const el = track.current
    if (!el) return

    read()
    // Catches the breakpoint crossing and a rotation, both of which change
    // whether this is a rail at all.
    const observer = new ResizeObserver(read)
    observer.observe(el)
    el.addEventListener('scroll', read, { passive: true })

    return () => {
      observer.disconnect()
      el.removeEventListener('scroll', read)
    }
  }, [read])

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <Tag
        // A callback ref, because the element is a div or a ul depending on
        // what is being laid out and one object ref cannot be typed as both.
        ref={(el: HTMLElement | null) => {
          track.current = el
        }}
        className={styles.track}
        style={{ '--cols': columns } as React.CSSProperties}
        // A region you can only reach by swiping is a region some people cannot
        // reach. Focusable, so it scrolls with the arrow keys too.
        {...(rail ? { role: 'group', 'aria-label': label, tabIndex: 0 } : {})}
      >
        {children}
      </Tag>

      {/* Purely an orientation cue — every card is in the DOM either way, so
          there is nothing here for a screen reader to gain. */}
      {rail && count > 1 && (
        <div className={styles.meter} aria-hidden="true">
          <span className={styles.count}>
            {String(Math.min(active + 1, count)).padStart(2, '0')}
            <span className={styles.of} />
            {String(count).padStart(2, '0')}
          </span>
          <span className={styles.bar} style={{ '--cells': count } as React.CSSProperties}>
            <span className={styles.fill} style={{ transform: `translateX(${active * 100}%)` }} />
          </span>
        </div>
      )}
    </div>
  )
}
