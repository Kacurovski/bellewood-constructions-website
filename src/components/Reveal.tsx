import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

type Props = {
  children: ReactNode
  /** Stagger position when several reveals sit together. */
  delay?: number
  /** Distance travelled, in px. Kept small — this is a settle, not an entrance. */
  y?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article'
}

/**
 * A slow settle as content enters. Weighted easing, no bounce, no overshoot,
 * short travel — the content should look like it was always there and the page
 * simply caught up with it.
 *
 * Under reduced motion this renders the element plainly with no animation at
 * all, which is the correct fallback for content (as distinct from the 3D
 * scenes, which fall back to a static rendered frame).
 */
export function Reveal({ children, delay = 0, y = 18, className, as = 'div' }: Props) {
  const reduced = useReducedMotion()
  const Tag = motion[as]

  if (reduced) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px -8% 0px' }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </Tag>
  )
}
