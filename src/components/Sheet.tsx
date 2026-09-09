import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './Sheet.module.css'

/**
 * The drawing-sheet marks: a sheet reference, a dimension line, and corner
 * registration crosses.
 *
 * These replace the eyebrow, the hairline and the plain section head across the
 * site. The point is not decoration — it is that a builder who works from
 * documents should have a website that is built like one, and this is the only
 * thing on the page a competitor cannot buy off a template.
 *
 * Every mark is `aria-hidden` or plain text. None of it is an image, so it all
 * scales, reverses and prints with the rest of the page.
 */

type RefProps = {
  /** The sheet number, e.g. "SK-02". Set tabular. */
  number: string
  /** What the sheet is. This is the old eyebrow. */
  name: string
  /** The right-hand field. A scale note on a real sheet. */
  note?: string
  className?: string
  /** A rule under the strip, which is what separates a sheet head from its body. */
  rule?: boolean
}

export function SheetRef({ number, name, note, className, rule = true }: RefProps) {
  return (
    <div className={className}>
      <p className={styles.ref}>
        <span className={styles.number}>{number}</span>
        <span className={styles.tick} aria-hidden="true" />
        <span className={styles.name}>{name}</span>
        {note && <span className={styles.note}>{note}</span>}
      </p>
      {rule && <hr className={styles.refRule} />}
    </div>
  )
}

type DimProps = {
  /** The figure carried on the line. A real dimension, in millimetres. */
  figure: string
  /** Vertical runs up the side of a plate, the way a height is dimensioned. */
  vertical?: boolean
  className?: string
}

/**
 * A dimension line: tick, rule, figure, rule, tick.
 *
 * The rule draws itself in from the left as the line enters. Under reduced
 * motion it is simply there — a dimension that has to animate before it can be
 * read is a dimension that fails for the people who most need it to hold still.
 */
export function Dimension({ figure, vertical = false, className }: DimProps) {
  const reduced = useReducedMotion()
  const axis = vertical ? 'scaleY' : 'scaleX'

  const line = (key: string) =>
    reduced ? (
      <span key={key} className={styles.dimLine} />
    ) : (
      <motion.span
        key={key}
        className={styles.dimLine}
        initial={{ [axis]: 0 }}
        whileInView={{ [axis]: 1 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
    )

  return (
    <div
      className={[styles.dim, vertical ? styles.dimV : '', className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      {line('a')}
      <span className={styles.dimFigure}>{figure}</span>
      {line('b')}
    </div>
  )
}

/** The four corner crosses. The parent has to be positioned. */
export function RegistrationMarks() {
  return (
    <div className={styles.marks} aria-hidden="true">
      <span className={[styles.mark, styles.tl].join(' ')} />
      <span className={[styles.mark, styles.tr].join(' ')} />
      <span className={[styles.mark, styles.bl].join(' ')} />
      <span className={[styles.mark, styles.br].join(' ')} />
    </div>
  )
}

export type { ReactNode }
