import { useMemo } from 'react'
import { HERITAGE_MEMBERS, HERITAGE_OFFSET, HERITAGE_YAW } from './heritageMembers'
import { projectMembers } from './axonometric'
import { LINE_COLOUR } from './materials'
import type { MaterialKey } from './materials'

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

  return (
    <svg className={className} viewBox={viewBox} aria-hidden="true" role="presentation">
      {polygons.map((p, i) => {
        const dimmed = highlight !== null && p.mat !== highlight
        return (
          <polygon
            key={i}
            points={p.pts}
            fill={line ? 'var(--wash)' : p.fill}
            stroke={LINE_COLOUR}
            strokeWidth={line ? 0.016 : 0.007}
            strokeOpacity={line ? 0.85 : 0.4}
            strokeLinejoin="round"
            /* Opacity rather than a second colour: the drawing keeps its own
               palette and simply steps back, so what is lit is lit by contrast
               and not by being repainted. */
            opacity={dimmed ? 0.13 : 1}
            style={{ transition: 'opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        )
      })}
    </svg>
  )
}
