import { useMemo } from 'react'
import { FRAME_BOUNDS, FRAME_MEMBERS } from './frameMembers'
import type { MaterialKey } from './frameMembers'

/**
 * The static frame for scene 3.
 *
 * Not a picture of a different thing: it projects the very same member list
 * through the same axonometric view, so a visitor with reduced motion turned on
 * sees the building the animation ends on, minus the assembly.
 *
 * Pure SVG — no WebGL, no canvas, crisp at any size, and it renders on a device
 * that cannot give us a GL context at all.
 */

type V3 = [number, number, number]

// Matches the camera in TimberFrame.tsx: position [9, 6.2, 10.5] looking at the
// origin, orthographic. Resolved once, at module load.
const view = (() => {
  const eye: V3 = [9, 6.2, 10.5]
  const len = Math.hypot(...eye)
  const fwd: V3 = [-eye[0] / len, -eye[1] / len, -eye[2] / len]
  const cross = (a: V3, b: V3): V3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
  const norm = (v: V3): V3 => {
    const l = Math.hypot(...v) || 1
    return [v[0] / l, v[1] / l, v[2] / l]
  }
  const right = norm(cross(fwd, [0, 1, 0]))
  const up = cross(right, fwd)
  return { fwd, right, up }
})()

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

/** Rotate about the x axis — the roof pitch, the only rotation in the frame. */
function pitchX([x, y, z]: V3, a: number): V3 {
  if (!a) return [x, y, z]
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [x, y * c - z * s, y * s + z * c]
}

const CORNERS: V3[] = [
  [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5],
  [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5],
]

const FACES: { idx: number[]; n: V3 }[] = [
  { idx: [0, 1, 2, 3], n: [0, 0, -1] },
  { idx: [5, 4, 7, 6], n: [0, 0, 1] },
  { idx: [4, 0, 3, 7], n: [-1, 0, 0] },
  { idx: [1, 5, 6, 2], n: [1, 0, 0] },
  { idx: [3, 2, 6, 7], n: [0, 1, 0] },
  { idx: [4, 5, 1, 0], n: [0, -1, 0] },
]

type Poly = { pts: string; depth: number; fill: string }

/** The same warm key from over the left shoulder that lights the live scene. */
const KEY: V3 = [-0.55, 0.7, 0.45]

/** The live scene's palette, and the lights on. */
const TONE: Record<MaterialKey, { base: string; shade: string }> = {
  frame: { base: '#9a7b4f', shade: '#4a3d2a' },
  clad: { base: '#ab8354', shade: '#4f3f28' },
  deck: { base: '#8f7248', shade: '#443722' },
  roof: { base: '#22392c', shade: '#0b1a12' },
  glass: { base: '#ffd7a2', shade: '#b58048' },
}

export function TimberFrameStill({ className }: { className?: string }) {
  const { polys, viewBox } = useMemo(() => {
    const out: Poly[] = []
    const offsetY = -FRAME_BOUNDS.centreY

    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    // Only the finished exterior. By the end of the sequence the frame is
    // enclosed and every stud is behind cladding, so drawing all three hundred
    // members would put nine hundred hidden polygons in the DOM for nothing.
    const visible = FRAME_MEMBERS.filter((m) => m.outer)

    visible.forEach((m, index) => {
      // Deterministic per-member tone, so real timber does not read as plastic.
      const n = Math.sin(index * 12.9898) * 43758.5453
      const jitter = (n - Math.floor(n) - 0.5) * 0.16

      const screen = CORNERS.map((c): [number, number, number] => {
        const local: V3 = [c[0] * m.s[0], c[1] * m.s[1], c[2] * m.s[2]]
        const pitched = pitchX(local, m.rx)
        const world: V3 = [
          pitched[0] + m.p[0],
          pitched[1] + m.p[1] + offsetY,
          pitched[2] + m.p[2],
        ]
        return [dot(world, view.right), dot(world, view.up), dot(world, view.fwd)]
      })

      for (const f of FACES) {
        const normal = pitchX(f.n, m.rx)
        if (dot(normal, view.fwd) > -0.02) continue // facing away

        const pts = f.idx
          .map((i) => {
            const [sx, sy] = screen[i]
            minX = Math.min(minX, sx)
            maxX = Math.max(maxX, sx)
            minY = Math.min(minY, -sy)
            maxY = Math.max(maxY, -sy)
            return `${sx.toFixed(3)},${(-sy).toFixed(3)}`
          })
          .join(' ')

        const depth = f.idx.reduce((s, i) => s + screen[i][2], 0) / f.idx.length
        const lit = Math.max(dot(normal, KEY), 0)
        // Narrow shading range, clamped: an unclamped value produces an invalid
        // percentage and paints the face black.
        const tone = TONE[m.mat]
        const spread = m.mat === 'glass' ? 0.1 : 0.34
        const shade = Math.min(Math.max(0.64 + lit * spread + jitter * 0.06, 0), 1)
        out.push({
          pts,
          depth,
          fill: `color-mix(in srgb, ${tone.base} ${Math.round(shade * 100)}%, ${tone.shade})`,
        })
      }
    })

    // Painter's algorithm: furthest first.
    out.sort((a, b) => b.depth - a.depth)

    const pad = 0.3
    return {
      polys: out,
      viewBox: `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`,
    }
  }, [])

  return (
    <svg className={className} viewBox={viewBox} aria-hidden="true" role="presentation">
      {polys.map((p, i) => (
        <polygon
          key={i}
          points={p.pts}
          fill={p.fill}
          stroke="#1c4129"
          strokeWidth={0.008}
          strokeOpacity={0.55}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
