import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { HERITAGE_MEMBERS, HERITAGE_OFFSET, HERITAGE_YAW } from './heritageMembers'
import { projectMembers } from './axonometric'
import { LINE_COLOUR } from './materials'
import type { MaterialKey } from './materials'
import { HERITAGE_MAQUETTE_PROJECTION, MAQUETTE_GROUND, MAQUETTE_SOFTEN } from './heritageMaquette'
import type { HeritageFocus, HeritagePresentation } from './heritageMaquette'
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
  presentation = 'default',
  focus = null,
}: {
  presentation?: HeritagePresentation
  focus?: HeritageFocus | null
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
  const maquette = presentation === 'maquette'
  const { polygons, viewBox } = useMemo(
    () =>
      maquette ? HERITAGE_MAQUETTE_PROJECTION : projectMembers(HERITAGE_MEMBERS, {
        eye: [8.5, 4.9, 12],
        offset: HERITAGE_OFFSET,
        yaw: HERITAGE_YAW,
        padding: 0.4,
      }),
    [maquette],
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
          data-groups={maquette ? p.groups : undefined}
          points={p.pts}
          fill={line ? 'var(--wash)' : p.fill}
          stroke={maquette ? '#617466' : LINE_COLOUR}
          strokeWidth={line ? 0.016 : 0.007}
          strokeOpacity={line ? 0.85 : maquette ? 0.2 : 0.4}
          strokeLinejoin="round"
          style={maquette ? {
            '--face': p.fill,
            '--quiet-face': `color-mix(in srgb, ${p.fill} ${(1 - MAQUETTE_SOFTEN) * 100}%, ${MAQUETTE_GROUND})`,
          } as CSSProperties : undefined}
        />
      )),
    [polygons, line, maquette],
  )

  return (
    <svg
      className={[styles.svg, maquette ? styles.maquette : '', className].filter(Boolean).join(' ')}
      viewBox={viewBox}
      // Opacity rather than a second colour: the drawing keeps its own palette
      // and simply steps back, so what is lit is lit by contrast rather than by
      // being repainted.
      data-lit={maquette ? undefined : highlight ?? undefined}
      data-focus={maquette ? focus ?? undefined : undefined}
      aria-hidden="true"
      role="presentation"
    >
      {faces}
    </svg>
  )
}
