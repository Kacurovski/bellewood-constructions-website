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
 */
export function HeritageStudyStill({ className }: { className?: string }) {
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

  return (
    <svg className={className} viewBox={viewBox} aria-hidden="true" role="presentation">
      {polygons.map((p, i) => (
        <polygon
          key={i}
          points={p.pts}
          fill={p.fill}
          stroke={LINE_COLOUR}
          strokeWidth={0.007}
          strokeOpacity={0.4}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
