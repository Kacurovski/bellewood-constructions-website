import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './Drawn.module.css'

/**
 * Things that draw themselves in.
 *
 * The site is set as a drawing sheet, and its idea is "drawn, then built": the
 * house on the home page is line-work before it is timber. These are the same
 * idea for the flat parts of the page — a rule that draws from left to right
 * as it enters view, a pictogram whose stroke runs round its outline — so the
 * written sections behave like the rest of the set rather than simply
 * appearing.
 *
 * Two rules. Everything here is a settle, not an entrance: one weighted ease,
 * no bounce, no overshoot, and it runs once. And under reduced motion each one
 * renders finished and still, which is the correct fallback for a drawing.
 */

const EASE = [0.16, 1, 0.3, 1] as const

/** A horizontal rule that draws itself from the left as it enters view. */
export function DrawnRule({ className, delay = 0 }: { className?: string; delay?: number }) {
  const reduced = useReducedMotion()
  const cls = [styles.rule, className].filter(Boolean).join(' ')
  if (reduced) return <span className={cls} aria-hidden="true" />
  return (
    <motion.span
      className={cls}
      aria-hidden="true"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-8% 0px -4% 0px' }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    />
  )
}

/**
 * A small line drawing whose stroke runs round its paths as it enters view.
 * Paths are plain SVG `d` strings in a 64 x 48 box, drawn at one weight.
 */
export function Sketch({
  paths,
  className,
  delay = 0,
  title,
}: {
  paths: string[]
  className?: string
  delay?: number
  title?: string
}) {
  const reduced = useReducedMotion()
  return (
    <svg
      className={[styles.sketch, className].filter(Boolean).join(' ')}
      viewBox="0 0 64 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {paths.map((d, i) =>
        reduced ? (
          <path key={i} d={d} />
        ) : (
          <motion.path
            key={i}
            d={d}
            initial={{ pathLength: 0, opacity: 0.4 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-8% 0px -4% 0px' }}
            transition={{ duration: 1.3, delay: delay + i * 0.12, ease: EASE }}
          />
        ),
      )}
    </svg>
  )
}

/**
 * A numbered reference set in a ring, the way a drawing keys a detail. The
 * ring fills when `done`, and the whole thing lifts when `active`.
 */
export function Ref({ children, active = false, done = false }: { children: ReactNode; active?: boolean; done?: boolean }) {
  return (
    <span className={[styles.ref, active ? styles.refActive : '', done ? styles.refDone : ''].join(' ')} aria-hidden="true">
      {children}
    </span>
  )
}
