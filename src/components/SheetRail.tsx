import { useEffect, useState } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import styles from './SheetRail.module.css'

export type Sheet = {
  /** The number in the set, e.g. "A-03". */
  number: string
  /** What the sheet is. Shown for the sheet you are on. */
  name: string
  /** The id of the heading that section is labelled by. */
  target: string
  /** True if that section is a dark band, so the rail reverses over it. */
  dark?: boolean
}

/**
 * The set's index, pinned to the left edge.
 *
 * A set of drawings opens with a register of what is in it, and the pages
 * themselves carry the sheet number in the corner so you always know where in
 * the set you are. This is that, for a scrolling page: the eight sheet numbers,
 * the one you are on lit and named, and a tick that grows to mark it.
 *
 * It is a navigation aid as well as an ornament — the home page is ten thousand
 * pixels long and this is the only thing on it that says how far through you
 * are or lets you jump.
 *
 * Numbers only. The sheet's name is in the DOM for the link's accessible name
 * and hidden visually: printed in the margin it made the rail wide enough to
 * overlap the page, and a position indicator that covers the thing whose
 * position it indicates is not much of one.
 *
 * Only above 1600px, and that number is measured rather than chosen. The shell
 * is capped at 1440 and adds its own gutter, so content starts at
 * (width - 1440) / 2 + 64: at 1500 that is 83px against a rail whose right edge
 * is at 93, which overlaps. At 1600 content starts at 144 and the rail clears it
 * by fifty. Below that there is no margin to put this in, and taking one from
 * the content would cost more than the rail is worth.
 */
export function SheetRail({ sheets }: { sheets: Sheet[] }) {
  // 1600, and the number is measured rather than guessed. The shell is capped
  // at 1440 and adds its own gutter, so content starts at (w - 1440) / 2 + 64.
  // At 1500 that is 83px and the rail's right edge is 93 — ten pixels of
  // overlap. At 1600 content starts at 144 and the rail clears it by fifty.
  const wide = useMediaQuery('(min-width: 1600px)')
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!wide) return

    // The sheet you are on is the last one whose section has started above the
    // middle of the screen. A scroll listener rather than an observer: one of
    // these sections is pinned for two and a half screens, and intersection
    // thresholds on a sticky element are a fight not worth having.
    const read = () => {
      // The same line the rail itself sits on, so its colour flips exactly as
      // it crosses from one ground to the next rather than a screen early.
      const line = window.innerHeight * 0.5
      let current = 0
      sheets.forEach((sheet, i) => {
        const section = document.getElementById(sheet.target)?.closest('section')
        if (!section) return
        if (section.getBoundingClientRect().top <= line) current = i
      })
      setActive(current)
    }

    read()
    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    return () => {
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
    }
  }, [wide, sheets])

  if (!wide) return null

  return (
    <nav
      className={[styles.rail, sheets[active]?.dark ? styles.railReverse : ''].join(' ')}
      aria-label="Sheets"
    >
      <ol className={styles.list}>
        {sheets.map((sheet, i) => (
          <li key={sheet.number}>
            <a
              href={`#${sheet.target}`}
              className={[styles.item, i === active ? styles.itemOn : ''].join(' ')}
              onClick={(event) => {
                // The site is hash-routed, so a bare fragment href would be read
                // as a route. Scroll it directly instead.
                event.preventDefault()
                document
                  .getElementById(sheet.target)
                  ?.closest('section')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              <span className={styles.tick} aria-hidden="true" />
              <span className={styles.number}>{sheet.number}</span>
              {/* The name is for the link's accessible name, not for the
                  margin. Printed, it made the rail wide enough to land on the
                  page — and a position indicator that covers the thing whose
                  position it is indicating is not much of one. */}
              <span className="visually-hidden">{sheet.name}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
