import { useRef, useState } from 'react'
import { ImageSlot } from './ImageSlot'
import type { ImageSlot as Slot } from '../data/projects'
import styles from './BeforeAfter.module.css'

type Props = {
  before: Slot
  after: Slot
  label?: string
  ratio?: string
}

/**
 * Before and after, with depth.
 *
 * Heritage before-and-after is the strongest material this business owns, so it
 * gets a treatment of its own rather than a stock comparison slider. The two
 * states sit at different depths and you push between them by dragging: the
 * state being revealed comes forward, the one being covered settles back. There
 * is no handle with a chevron on it.
 *
 * The control underneath is a real range input, so it works with a keyboard and
 * announces itself properly. It is invisible, not absent.
 *
 * Built now and filled with placeholders, because the layout has to be ready the
 * day the photo library lands.
 */
export function BeforeAfter({ before, after, label = 'Before and after', ratio = '16 / 10' }: Props) {
  const [value, setValue] = useState(55)
  const dragging = useRef(false)

  const onPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current && event.type === 'pointermove') return
    const rect = event.currentTarget.getBoundingClientRect()
    const next = ((event.clientX - rect.left) / rect.width) * 100
    setValue(Math.min(100, Math.max(0, next)))
  }

  return (
    <figure className={styles.wrap}>
      <div
        className={styles.stage}
        style={{ aspectRatio: ratio, ['--split' as string]: `${value}%` }}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          onPointer(e)
        }}
        onPointerMove={onPointer}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* The state being covered stays where it is. Only the revealed state
            moves, which is enough to read as two planes and leaves no gap at
            the edges for the ground behind to show through. */}
        <div className={styles.plane}>
          <ImageSlot slot={before} ratio={ratio} tone="sage" className={styles.img} parallax={false} />
        </div>

        {/* The state being revealed comes forward as it is revealed. The labels
            live in the caption below, not on the planes: the front plane covers
            the back one's caption, so putting them here would show only one. */}
        <div
          className={[styles.plane, styles.front].join(' ')}
          style={{ ['--depth' as string]: `${(value / 100) * 0.02}` }}
        >
          <ImageSlot slot={after} ratio={ratio} tone="green" className={styles.img} parallax={false} />
        </div>

        <span className={styles.seam} aria-hidden="true" />

        <input
          className={styles.range}
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={value}
          aria-label={`${label}. Drag or use the arrow keys to move between the two.`}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </div>

      <figcaption className={['small', styles.caption].join(' ')}>
        <span>Before</span>
        <span className={styles.hint}>Drag to compare</span>
        <span>After</span>
      </figcaption>
    </figure>
  )
}
