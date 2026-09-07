import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import type { ImageSlot } from '../data/projects'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './SlicedImage.module.css'

const SLICES = 4

type Props = {
  slot: ImageSlot
  className?: string
  /** Scroll-driven drift, supplied by the section that owns the scroll. */
  parallaxY?: MotionValue<string>
  parallaxScale?: MotionValue<number>
}

/**
 * The hero photograph, set as panels rather than as one flat image.
 *
 * It arrives in four vertical slices that rise into place one after another,
 * with a hairline running down each seam as it lands and then fading. It reads
 * as something being set, which is the same idea as the section further down the
 * page: drawn, then built. Once it has landed the panels are seamless and it is
 * simply a photograph.
 *
 * After that it never sits completely still — it drifts with the page as you
 * scroll, and leans a few pixels towards the pointer. Both are small enough to
 * register as depth rather than as an effect.
 *
 * The panels are four identical full-size copies of the photograph, each clipped
 * to its own vertical band by a single `inset()`. Nothing is ever offset or
 * resized per panel, so they cannot fall out of register: an earlier version
 * used a wrapper per slice with the image shifted inside it, and sub-pixel
 * rounding left hairline seams down the finished picture.
 *
 * Under reduced motion the photograph simply appears.
 */
export function SlicedImage({ slot, className, parallaxY, parallaxScale }: Props) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [landed, setLanded] = useState(false)

  // Pointer lean. Springs so it trails the cursor with a little weight instead
  // of snapping to it.
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const leanX = useSpring(pointerX, { stiffness: 60, damping: 20, mass: 0.6 })
  const leanY = useSpring(pointerY, { stiffness: 60, damping: 20, mass: 0.6 })
  const translateX = useTransform(leanX, [-1, 1], ['-1.1%', '1.1%'])
  const translateY = useTransform(leanY, [-1, 1], ['-1.4%', '1.4%'])

  useEffect(() => {
    if (reduced) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const onMove = (event: PointerEvent) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      pointerX.set(((event.clientX - rect.left) / rect.width) * 2 - 1)
      pointerY.set(((event.clientY - rect.top) / rect.height) * 2 - 1)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced, pointerX, pointerY])

  // Narrowed once, so the value stays a string inside the slice callbacks.
  const src = slot.src
  if (!src) return null

  if (reduced) {
    return (
      <div className={[styles.frame, className].filter(Boolean).join(' ')}>
        <img className={styles.image} src={src} alt={slot.alt} loading="eager" />
      </div>
    )
  }

  return (
    <div ref={ref} className={[styles.frame, className].filter(Boolean).join(' ')}>
      <motion.div className={styles.drift} style={{ y: parallaxY, scale: parallaxScale }}>
        <motion.div className={styles.lean} style={{ x: translateX, y: translateY }}>
          {Array.from({ length: SLICES }, (_, i) => {
            // The band this copy is allowed to show, as insets from each edge.
            const left = (i / SLICES) * 100
            const right = ((SLICES - 1 - i) / SLICES) * 100
            return (
              <motion.img
                key={i}
                className={styles.image}
                src={src}
                // Only the first copy carries the description. The other three
                // are the same photograph and would be read out four times.
                alt={i === 0 ? slot.alt : ''}
                aria-hidden={i === 0 ? undefined : true}
                loading="eager"
                decoding="async"
                draggable={false}
                initial={{ clipPath: `inset(100% ${right}% 0% ${left}%)` }}
                animate={{ clipPath: `inset(0% ${right}% 0% ${left}%)` }}
                transition={{
                  duration: 1.15,
                  delay: 0.12 + i * 0.11,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onAnimationComplete={i === SLICES - 1 ? () => setLanded(true) : undefined}
              />
            )
          })}
        </motion.div>
      </motion.div>

      {/* A hairline down each seam as its panel lands, then gone. */}
      {!landed &&
        Array.from({ length: SLICES - 1 }, (_, i) => (
          <motion.span
            key={i}
            className={styles.seam}
            style={{ left: `${((i + 1) / SLICES) * 100}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0] }}
            transition={{ duration: 1.3, delay: 0.2 + i * 0.11, ease: 'easeOut' }}
            aria-hidden="true"
          />
        ))}
    </div>
  )
}
