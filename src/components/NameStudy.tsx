import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './NameStudy.module.css'

type Half = 'belle' | 'wood'

/**
 * The name, taken apart.
 *
 * The paragraph beside this says it in a sentence: Belle for beautiful, wood
 * for what we build with. This says the same thing as a drawing. It arrives as
 * one word, Bellewood, and as it comes into view the word opens at the join, a
 * hairline drops into the gap, and each half is pinned to what it means with a
 * leader and a dot — the same callout the model in the hero is annotated with.
 *
 * The two halves are set in the site's two faces, and the choice is the point
 * rather than decoration. Belle is in Newsreader, the serif, because it is the
 * half about beauty; wood is in Archivo, the grotesque, because it is the half
 * about the material and the build. Put back together it is the pairing the
 * whole identity runs on.
 *
 * Point at a half and the other steps back, the way every keyed element on this
 * site answers. Nothing is invented here: both meanings are the client's own
 * words from the copy, which is also why this is hidden from assistive tech —
 * the paragraph already says it, and reading it twice would be noise.
 */
export function NameStudy() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref, { once: true, margin: '-18% 0px -18% 0px' })
  const [keyed, setKeyed] = useState<Half | null>(null)

  /* Opened once it has been seen, or straight away when motion is reduced, so
     the reduced version is the finished drawing rather than the closed word. */
  const open = reduced || seen

  /* Settled once the entrance has played. Until then the leaders and notes keep
     their staggered delays; after it, hovering answers immediately instead of
     waiting out a delay that only made sense on the way in. */
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    if (!open) return
    const done = window.setTimeout(() => setSettled(true), reduced ? 0 : 1900)
    return () => window.clearTimeout(done)
  }, [open, reduced])

  return (
    <div
      ref={ref}
      className={[
        styles.study,
        open ? styles.open : '',
        settled ? styles.settled : '',
        keyed === 'belle' ? styles.keyedBelle : '',
        keyed === 'wood' ? styles.keyedWood : '',
      ]
        .join(' ')
        .trim()}
      aria-hidden="true"
      onPointerLeave={() => setKeyed(null)}
    >
      <div className={[styles.half, styles.belle].join(' ')} onPointerEnter={() => setKeyed('belle')}>
        <span className={styles.glyphs}>Belle</span>
        <span className={styles.leader} />
        <span className={styles.note}>for beautiful</span>
      </div>

      <span className={styles.join} />

      <div className={[styles.half, styles.wood].join(' ')} onPointerEnter={() => setKeyed('wood')}>
        <span className={styles.glyphs}>wood</span>
        <span className={styles.leader} />
        <span className={styles.note}>for what we build with</span>
      </div>
    </div>
  )
}
