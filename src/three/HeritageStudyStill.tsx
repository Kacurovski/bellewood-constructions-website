import { useMemo } from 'react'
import { HERITAGE_MEMBERS, HERITAGE_OFFSET, HERITAGE_YAW } from './heritageMembers'
import { projectMembers } from './axonometric'
import { LINE_COLOUR } from './materials'
import type { MaterialKey } from './materials'
import styles from './HeritageStudyStill.module.css'

/**
 * The static frame for the hero.
 *
 * The same house, through the same camera, at the resting angle the live scene
 * drifts around. A visitor with reduced motion turned on, or on a device with no
 * WebGL, sees the object rather than an empty space.
 *
 * `variant="line"` draws the same projection as a line drawing: every face
 * filled with the page's own ground and stroked in Bellewood Green. Filling
 * with the background is what does the hidden-line removal — the projection is
 * already sorted back to front, so each face paints out the edges behind it, and
 * what is left is the outline a draughtsman would have drawn. Stroking without
 * the fill gives a wireframe with every hidden edge showing through, which is a
 * different and much worse drawing.
 */
export function HeritageStudyStill({
  className,
  variant = 'solid',
  highlight = null,
}: {
  className?: string
  variant?: 'solid' | 'line'
  /**
   * Draw one material at full strength and drop everything else back. The key
   * on the approach page uses it: point at "cladding" and the cladding is what
   * is left lit. Every face carries its material key from `projectMembers`, so
   * this needs no second copy of the geometry.
   */
  highlight?: MaterialKey | null
}) {
  const { polygons, viewBox } = useMemo(
    () =>
      projectMembers(HERITAGE_MEMBERS, {
        eye: [8.5, 4.9, 12],
        offset: HERITAGE_OFFSET,
        yaw: HERITAGE_YAW,
        padding: 0.4,
      }),
    [],
  )

  const line = variant === 'line'

  /* The faces are built once and never rebuilt.
     `highlight` is deliberately NOT a dependency: which material is lit is
     resolved by CSS from one attribute on the <svg>, so changing it costs a
     single attribute write instead of reconciling eight hundred children. That
     reconciliation is what made this clunky — React re-rendered the whole
     drawing before a single pixel moved. */
  const faces = useMemo(
    () =>
      polygons.map((p, i) => (
        <polygon
          key={i}
          data-mat={p.mat}
          points={p.pts}
          fill={line ? 'var(--wash)' : p.fill}
          stroke={LINE_COLOUR}
          strokeWidth={line ? 0.016 : 0.007}
          strokeOpacity={line ? 0.85 : 0.4}
          strokeLinejoin="round"
        />
      )),
    [polygons, line],
  )

  return (
    <svg
      className={[styles.svg, className].filter(Boolean).join(' ')}
      viewBox={viewBox}
      // Opacity rather than a second colour: the drawing keeps its own palette
      // and simply steps back, so what is lit is lit by contrast rather than by
      // being repainted.
      data-lit={highlight ?? undefined}
      aria-hidden="true"
      role="presentation"
    >
      {faces}
    </svg>
  )
}
