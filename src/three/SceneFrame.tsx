import { Suspense, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { hasWebGL } from '../lib/webgl'
import styles from './SceneFrame.module.css'

type Props = {
  /** The 3D scene. Only mounted once the frame is near the viewport. */
  children: ReactNode
  /**
   * The static frame. Shown under reduced motion, while the scene chunk loads,
   * and if the device cannot carry the scene. It is never a blank space: it is
   * the same drawing, rendered still.
   */
  still: ReactNode
  className?: string
  /** How far ahead of the viewport to start loading. */
  rootMargin?: string
  label?: string
}

/**
 * Every 3D scene on this site goes through here.
 *
 * Three rules, all of them non-negotiable:
 *   1. 3D never blocks first paint. Nothing mounts until the frame approaches
 *      the viewport, and the three.js chunk is code-split away from the entry.
 *   2. Under `prefers-reduced-motion` the scene never mounts at all. The still
 *      frame is the whole experience, and it is a drawing, not an empty box.
 *   3. If WebGL is unavailable or the context is lost, the still frame stays.
 *      A visitor should not be able to tell that anything failed.
 */
export function SceneFrame({
  children,
  still,
  className,
  rootMargin = '400px 0px',
  label,
}: Props) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (reduced || failed) return
    const el = ref.current
    if (!el) return

    // No WebGL, no scene. Fall back silently and permanently.
    if (!hasWebGL()) {
      setFailed(true)
      return
    }

    if (!('IntersectionObserver' in window)) {
      setNear(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced, failed, rootMargin])

  const showScene = near && !reduced && !failed

  return (
    <div ref={ref} className={[styles.frame, className].filter(Boolean).join(' ')}>
      {/* The still frame always renders. The scene, when it arrives, sits on
          top of it — so there is never a moment of empty space. */}
      <div className={[styles.still, showScene ? styles.stillHidden : ''].join(' ')} aria-hidden={showScene || undefined}>
        {still}
      </div>

      {showScene && (
        <div className={styles.scene} aria-hidden="true">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      )}

      {label && <span className="visually-hidden">{label}</span>}
    </div>
  )
}
