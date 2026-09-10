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
  /** Surface detail, which this projection skips. See the note in the loop. */
  detail?: boolean
}

export type Polygon = {
  pts: string
  depth: number
  fill: string
  /** Which material this face belongs to, so a drawing can be keyed. */
  mat: MaterialKey
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

  /* Faces are grouped by the member they belong to, and it is the MEMBERS that
     get sorted — not the faces.

     A painter's algorithm over a flat list of faces sorts every face against
     every other by its own average depth, so the three visible faces of one
     board can end up split around a face belonging to something else entirely.
     Where two members meet — the verandah roof against the cottage roof, the new
     wing against the old — that interleaving paints a far face over a near one
     and leaves what looks like a hole punched in the building.

     A box is convex: its own visible faces cannot occlude each other, so their
     order within the member does not matter. Keeping them together and ordering
     whole members by their centre is both more correct and cheaper to sort. */
  const groups: { depth: number; faces: Polygon[] }[] = []
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

    /* Surface detail — the roof corrugations — is for the live scene, which has
       a depth buffer and can put six hundred thin bars two centimetres off a
       sheet without any of them surfacing through a wall. This drawing sorts
       whole members against each other, and a bar lying on a roof shares its
       depth with everything that roof passes: they came through the verandah
       ceiling, over the posts, and out across the cladding below the eave. */
    if (m.detail) return

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

    // The member's centre in view space, which is what its faces are ordered by.
    const centre = screen.reduce((s2, c) => s2 + c[2], 0) / screen.length
    const faces: Polygon[] = []

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

      faces.push({
        pts,
        depth,
        fill: `color-mix(in srgb, ${tone.base} ${Math.round(shade * 100)}%, ${tone.shade})`,
        mat: m.mat,
      })
    }

    if (faces.length) {
      // Nearest face first within the member, so its own front face paints last.
      faces.sort((a, b) => b.depth - a.depth)
      groups.push({ depth: centre, faces })
    }
  })

  groups.sort((a, b) => b.depth - a.depth)
  const out = groups.flatMap((g) => g.faces)

  return {
    polygons: out,
    viewBox: `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`,
  }
}
