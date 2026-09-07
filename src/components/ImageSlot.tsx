import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { ImageSlot as Slot } from '../data/projects'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './ImageSlot.module.css'

type Props = {
  slot: Slot
  /** Aspect ratio as a CSS value, e.g. '4 / 3'. */
  ratio?: string
  /** Shown on the placeholder ground when no photograph exists yet. */
  label?: string
  sublabel?: string
  tone?: 'green' | 'sage'
  className?: string
  loading?: 'lazy' | 'eager'
  /**
   * Drift the photograph within its frame as it passes through the viewport.
   * On by default: a grid of photographs that sits perfectly still reads as a
   * contact sheet. Off where something else is already moving the image —
   * the before-and-after planes, which are dragged.
   */
  parallax?: boolean
}

/**
 * Every photograph on this site goes through here.
 *
 * There is currently no project photography at all, so the empty state is not
 * an afterthought — it is the state the whole site has to hold in. A slot with
 * no image renders a designed brand ground carrying the project title and its
 * suburb. Never a grey box, never a broken-image icon, never stock photography.
 *
 * The ruled corner marks read as a drawing waiting to be filled, which is the
 * honest thing for it to say.
 */
export function ImageSlot({
  slot,
  ratio = '4 / 3',
  label,
  sublabel,
  tone = 'green',
  className,
  loading = 'lazy',
  parallax = true,
}: Props) {
  const classes = [styles.slot, className].filter(Boolean).join(' ')
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  // Measured across the whole time the frame is on screen, so the drift is
  // continuous rather than starting when the image happens to be centred.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['-11%', '11%'])
  const moving = parallax && !reduced

  if (slot.src) {
    if (!moving) {
      return (
        <figure ref={ref} className={classes} style={{ aspectRatio: ratio }}>
          <img className={styles.img} src={slot.src} alt={slot.alt} loading={loading} />
        </figure>
      )
    }

    return (
      <figure ref={ref} className={classes} style={{ aspectRatio: ratio }}>
        {/* Two layers, one job each. The mask rises as the frame comes into
            view; the photograph inside settles back from an oversize and then
            drifts with the page. Together they read as arrival and depth —
            a single small translate on its own did not register as motion. */}
        <motion.div
          className={styles.mask}
          initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          viewport={{ once: true, margin: '-8% 0px -6% 0px' }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* A plain element for the hover zoom, so CSS owns one transform and
              framer owns the other. Both on the same node would mean CSS trying
              to override an inline style, and losing. */}
          <div className={styles.zoom}>
          <motion.img
            // Oversized, so neither the settle nor the drift exposes an edge.
            className={[styles.img, styles.imgDrift].join(' ')}
            style={{ y }}
            initial={{ scale: 1.24 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: '-8% 0px -6% 0px' }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            src={slot.src}
            alt={slot.alt}
            loading={loading}
            decoding="async"
          />
          </div>
        </motion.div>
      </figure>
    )
  }

  return (
    <div
      className={[classes, styles.empty, tone === 'sage' ? styles.sage : styles.green].join(' ')}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={slot.alt}
    >
      <span className={styles.corner} aria-hidden="true" />
      {(label || sublabel) && (
        <div className={styles.caption}>
          {label && <span className={styles.label}>{label}</span>}
          {sublabel && <span className={styles.sublabel}>{sublabel}</span>}
        </div>
      )}
    </div>
  )
}
