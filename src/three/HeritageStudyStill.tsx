import { useMemo } from 'react'
import { HERITAGE_MEMBERS, HERITAGE_OFFSET, HERITAGE_YAW } from './heritageMembers'
import { projectMembers } from './axonometric'
import { LINE_COLOUR } from './materials'

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
}: {
  className?: string
  variant?: 'solid' | 'line'
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
      {polygons.map((p, i) => (
        <polygon
          key={i}
          points={p.pts}
          fill={line ? 'var(--wash)' : p.fill}
          stroke={LINE_COLOUR}
          strokeWidth={line ? 0.016 : 0.007}
          strokeOpacity={line ? 0.85 : 0.4}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
