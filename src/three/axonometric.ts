import { TONE } from './materials'
import type { MaterialKey } from './materials'

/**
 * Projects a list of boxes through a fixed axonometric view into SVG polygons.
 *
 * Both static frames on this site use it. Each is meant to be the same building
 * its live scene draws, minus the motion, and the surest way to keep that true
 * is for the still to walk the very same member list through the same camera.
 *
 * Painter's algorithm, back to front, with back faces culled. That is enough for
 * boxes lit by one soft key, and it means no WebGL, no canvas, and a drawing
 * that stays crisp at any size.
 */

export type V3 = [number, number, number]

export type ProjectableMember = {
  p: V3
  s: V3
  /** Rotation about the x axis. */
  rx: number
  /** Rotation about the z axis. */
  rz?: number
  mat: MaterialKey
}

export type Polygon = {
  pts: string
  depth: number
  fill: string
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

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]

const norm = (v: V3): V3 => {
  const l = Math.hypot(...v) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

/** Rotate about the x axis. */
function pitchX([x, y, z]: V3, a: number): V3 {
  if (!a) return [x, y, z]
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [x, y * c - z * s, y * s + z * c]
}

/** Rotate about the z axis. */
function rollZ([x, y, z]: V3, a: number): V3 {
  if (!a) return [x, y, z]
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [x * c - y * s, x * s + y * c, z]
}

/** Rotate about the y axis, so a still can match a scene that has been turned. */
function yawY([x, y, z]: V3, a: number): V3 {
  if (!a) return [x, y, z]
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [x * c + z * s, y, -x * s + z * c]
}

/** A camera looking at the origin from `eye`, resolved to screen axes. */
export function viewFrom(eye: V3) {
  const len = Math.hypot(...eye) || 1
  const fwd: V3 = [-eye[0] / len, -eye[1] / len, -eye[2] / len]
  const right = norm(cross(fwd, [0, 1, 0]))
  const up = cross(right, fwd)
  return { fwd, right, up }
}

/** The soft key, matching the one lighting both live scenes. */
const KEY: V3 = [-0.55, 0.7, 0.45]

export function projectMembers(
  members: ProjectableMember[],
  options: { eye: V3; offset?: V3; yaw?: number; padding?: number },
): { polygons: Polygon[]; viewBox: string } {
  const view = viewFrom(options.eye)
  const offset = options.offset ?? [0, 0, 0]
  const yaw = options.yaw ?? 0
  const pad = options.padding ?? 0.3

  const out: Polygon[] = []
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  members.forEach((m, index) => {
    /* The backing layer behind the cladding is for the live scene, which draws
       against a transparent page and would otherwise show daylight through
       every gap between the boards. This drawing has no such hole to fill: it
       paints back to front, so the gaps already land on whatever is behind them.

       It also cannot draw the backing correctly. A painter's algorithm sorts
       whole faces by one average depth, which cannot separate two surfaces a
       few centimetres apart when one is a wall-sized panel and the other is a
       single board — the backing kept surfacing through, worst of all as a dark
       band under every window sill. Skipping it is both cheaper and right. */
    if (m.mat === 'shadow') return

    // Deterministic per-member tone, so real timber does not read as plastic.
    const n = Math.sin(index * 12.9898) * 43758.5453
    const jitter = (n - Math.floor(n) - 0.5) * 0.16

    const screen = CORNERS.map((c): [number, number, number] => {
      const local: V3 = [c[0] * m.s[0], c[1] * m.s[1], c[2] * m.s[2]]
      // Same order the renderer composes them in: roll, then pitch.
      const pitched = pitchX(rollZ(local, m.rz ?? 0), m.rx)
      const world = yawY(
        [
          pitched[0] + m.p[0] + offset[0],
          pitched[1] + m.p[1] + offset[1],
          pitched[2] + m.p[2] + offset[2],
        ],
        yaw,
      )
      return [dot(world, view.right), dot(world, view.up), dot(world, view.fwd)]
    })

    for (const f of FACES) {
      const normal = yawY(pitchX(rollZ(f.n, m.rz ?? 0), m.rx), yaw)
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
      const tone = TONE[m.mat]
      const spread = m.mat === 'glass' ? 0.1 : 0.34
      const lit = Math.max(dot(normal, KEY), 0)
      // Clamped: an unclamped value produces a color-mix percentage over 100,
      // which is invalid CSS and silently paints the face black.
      const shade = Math.min(Math.max(0.64 + lit * spread + jitter * 0.06, 0), 1)

      out.push({
        pts,
        depth,
        fill: `color-mix(in srgb, ${tone.base} ${Math.round(shade * 100)}%, ${tone.shade})`,
      })
    }
  })

  out.sort((a, b) => b.depth - a.depth)

  return {
    polygons: out,
    viewBox: `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`,
  }
}
