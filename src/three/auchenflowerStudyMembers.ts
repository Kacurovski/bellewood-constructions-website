/**
 * A photo-led, hypothetical earlier cottage and a possible later addition.
 *
 * The left street gable, projecting three-sash bay, independent window hoods,
 * right-hand recessed porch and white fretwork come from Auchenflower exterior
 * photographs 01–04. The lower rear pavilion borrows the gabled outdoor-room
 * language of photograph 14. Exposed stumps, the plan and the added pavilion
 * are imagined; this is neither a measured model nor a record of its history.
 *
 * Street is +z. All shapes use the same box-member format as the live renderer
 * and its static drawing, so callouts stay in register in either presentation.
 */
import type { Member, HeritageRegion } from './heritageMembers'
import type { MaterialKey } from './materials'

type V3 = [number, number, number]
type Hole = { lo: number; hi: number; sill: number; head: number }
type WallAxis = 'x' | 'z'
const members: Member[] = []
let region: HeritageRegion = 'original'
const FLOOR = 1.7
const EAVES = 4.6

function box(p: V3, s: V3, mat: MaterialKey, rx = 0, rz = 0, detail = false) {
  if (s.some(value => !Number.isFinite(value) || value <= 0)) return
  members.push({ p, s, mat, rx, rz, region, ...(detail ? { detail: true } : {}) })
}

/** A rectangular member between any two points, with its length along local y. */
function beam(a: V3, b: V3, width: number, depth: number, mat: MaterialKey) {
  const d = b.map((value, i) => value - a[i]) as V3
  const length = Math.hypot(...d)
  if (length < 0.001) return
  const rz = -Math.asin(Math.max(-1, Math.min(1, d[0] / length)))
  const rx = Math.atan2(d[2], d[1])
  box(a.map((value, i) => (value + b[i]) / 2) as V3, [width, length, depth], mat, rx, rz)
}

/** Horizontal weatherboards split precisely around windows and doors. */
function wall(axis: WallAxis, fixed: number, lo: number, hi: number, bottom: number, top: number, holes: Hole[] = [], mat: MaterialKey = 'clad') {
  const course = 0.165
  for (let y = bottom; y < top - 0.001; y += course) {
    const y1 = Math.min(y + course - 0.008, top)
    const cuts = [lo, hi, ...holes.flatMap(hole => [hole.lo, hole.hi])]
      .filter(value => value >= lo && value <= hi).sort((a, b) => a - b)
    for (let i = 0; i < cuts.length - 1; i++) {
      const a = cuts[i], b = cuts[i + 1]
      if (b - a < 0.001) continue
      const middle = (a + b) / 2
      const cut = holes.find(hole => middle > hole.lo && middle < hole.hi && y1 > hole.sill && y < hole.head)
      const spans = cut ? [[y, Math.min(y1, cut.sill)], [Math.max(y, cut.head), y1]] : [[y, y1]]
      for (const [v0, v1] of spans) {
        if (v1 - v0 < 0.003) continue
        box(axis === 'x' ? [middle, (v0 + v1) / 2, fixed] : [fixed, (v0 + v1) / 2, middle],
          axis === 'x' ? [b - a, v1 - v0, 0.07] : [0.07, v1 - v0, b - a], mat)
      }
    }
  }
}

function window(axis: WallAxis, fixed: number, lo: number, hi: number, sill: number, head: number, panels = 1, smallPanes = true) {
  const place = (u: number, y: number, width: number, height: number, thick: number, mat: MaterialKey, outward = 0) => {
    box(axis === 'x' ? [u, y, fixed + outward] : [fixed + outward, y, u],
      axis === 'x' ? [width, height, thick] : [thick, height, width], mat)
  }
  const width = hi - lo
  const centre = (hi + lo) / 2
  place(centre, (sill + head) / 2, width - 0.08, head - sill - 0.08, 0.038, 'glass')
  for (const u of [lo, hi]) place(u, (sill + head) / 2, 0.085, head - sill + 0.14, 0.11, 'frame', 0.035)
  for (const y of [sill, head]) place(centre, y, width + 0.17, 0.09, 0.13, 'frame', 0.04)
  place(centre, sill - 0.05, width + 0.26, 0.065, 0.22, 'roof', 0.07)
  const rail = head - (head - sill) * 0.42
  place(centre, rail, width, 0.055, 0.095, 'frame', 0.055)
  for (let panel = 0; panel < panels; panel++) {
    const left = lo + width * panel / panels
    const right = lo + width * (panel + 1) / panels
    if (panel) place(left, (sill + head) / 2, 0.075, head - sill, 0.12, 'frame', 0.06)
    if (smallPanes) {
      place((left + right) / 2, (rail + head) / 2, 0.026, head - rail, 0.08, 'frame', 0.065)
      place((left + right) / 2, (rail + head) / 2, right - left, 0.026, 0.08, 'frame', 0.065)
    }
  }
}

/** Solid gable faces under a pitched roof; no oversized triangular proxy panels. */
function gableFace(cx: number, half: number, z: number, eave: number, rise: number) {
  for (let y = 0; y < rise - 0.02; y += 0.14) {
    const height = Math.min(0.132, rise - y)
    const halfWidth = half * (1 - (y + height) / rise)
    if (halfWidth > 0.03) box([cx, eave + y + height / 2, z], [halfWidth * 2, height, 0.075], 'clad')
  }
}

function gableRoof(cx: number, half: number, z0: number, z1: number, eave: number, rise: number, overhang = 0.3, closeEnds = true) {
  const slope = rise / half
  const pitch = Math.atan(slope)
  const span = half + overhang
  const apex = eave + rise
  const edge = apex - span * slope
  const depth = z1 - z0 + overhang * 2
  const midZ = (z0 + z1) / 2
  for (const side of [-1, 1] as const) {
    const roll = -side * pitch
    box([cx + side * span / 2, (apex + edge) / 2, midZ], [span / Math.cos(pitch) + 0.025, 0.075, depth], 'roof', 0, roll)
    // Fine corrugations run down each slope.
    for (let z = z0 - overhang + 0.05; z <= z1 + overhang; z += 0.14) {
      box([cx + side * span / 2, (apex + edge) / 2 + 0.045, z], [span / Math.cos(pitch), 0.018, 0.021], 'roof', 0, roll, true)
    }
    // Bargeboard, fine edge bead and eaves gutter.
    for (const z of [z0 - overhang, z1 + overhang]) {
      beam([cx, apex - 0.105, z], [cx + side * span, edge - 0.105, z], 0.16, 0.11, 'frame')
      beam([cx, apex + 0.035, z + 0.025], [cx + side * span, edge + 0.035, z + 0.025], 0.035, 0.045, 'roof')
    }
    box([cx + side * span, edge - 0.045, midZ], [0.14, 0.13, depth + 0.1], 'roof')
  }
  box([cx, apex + 0.035, midZ], [0.14, 0.08, depth + 0.05], 'roof')
  if (closeEnds) for (const z of [z0, z1]) gableFace(cx, half, z, eave, rise)
}

function hood(axis: WallAxis, fixed: number, lo: number, hi: number, top: number, projection = 0.53) {
  const width = hi - lo + 0.34
  const centre = (lo + hi) / 2
  const drop = 0.17
  const angle = Math.atan2(drop, projection)
  if (axis === 'x') {
    box([centre, top - drop / 2, fixed + projection / 2], [width, 0.055, Math.hypot(projection, drop)], 'roof', angle)
    box([centre, top - drop - 0.055, fixed + projection], [width + 0.04, 0.095, 0.09], 'frame')
    for (const x of [lo - 0.08, hi + 0.08]) {
      beam([x, top - 0.53, fixed + 0.03], [x, top - drop - 0.07, fixed + projection - 0.08], 0.075, 0.08, 'frame')
      box([x, top - 0.32, fixed + 0.015], [0.09, 0.69, 0.1], 'frame')
    }
  } else {
    box([fixed + projection / 2, top - drop / 2, centre], [Math.hypot(projection, drop), 0.055, width], 'roof', 0, -angle)
    box([fixed + projection, top - drop - 0.055, centre], [0.09, 0.095, width + 0.04], 'frame')
    for (const z of [lo - 0.08, hi + 0.08]) {
      beam([fixed + 0.03, top - 0.53, z], [fixed + projection - 0.08, top - drop - 0.07, z], 0.08, 0.075, 'frame')
      box([fixed + 0.015, top - 0.32, z], [0.1, 0.69, 0.09], 'frame')
    }
    for (let z = lo; z < hi + 0.04; z += 0.22) box([fixed + projection, top - drop - 0.17, z], [0.06, 0.22, 0.035], 'frame')
  }
}

function railing(axis: WallAxis, fixed: number, lo: number, hi: number, floor = FLOOR) {
  const centre = (lo + hi) / 2
  for (const y of [floor + 0.14, floor + 0.97]) {
    box(axis === 'x' ? [centre, y, fixed] : [fixed, y, centre], axis === 'x' ? [hi - lo, 0.07, 0.075] : [0.075, 0.07, hi - lo], 'frame')
  }
  for (let u = lo + 0.09; u < hi - 0.04; u += 0.15) {
    box(axis === 'x' ? [u, floor + 0.55, fixed] : [fixed, floor + 0.55, u], [0.038, 0.79, 0.038], 'frame')
  }
}

function deck(x0: number, x1: number, z0: number, z1: number) {
  for (let x = x0; x < x1 - 0.02; x += 0.14) {
    const width = Math.min(0.132, x1 - x)
    box([x + width / 2, FLOOR - 0.04, (z0 + z1) / 2], [width, 0.075, z1 - z0], 'deck')
  }
  for (const z of [z0 + 0.07, z1 - 0.07]) box([(x0 + x1) / 2, FLOOR - 0.17, z], [x1 - x0, 0.2, 0.14], 'frame')
}

/* The imagined original house: recognisable photographed street face above an
   open undercroft, rather than pretending we have a historical before photo. */
for (const x of [-3.3, -1.4, 0.35, 1.9, 3.42]) {
  for (const z of [-2.2, 0, 1.4, 3.23]) {
    if (x > 0.5 && z > 1.5) continue
    box([x, 0.75, z], [0.18, 1.5, 0.18], 'frame')
  }
}
box([-1.5, FLOOR - 0.14, 0.5], [4, 0.23, 5.8], 'frame')
box([2.05, FLOOR - 0.14, -0.425], [3.1, 0.23, 3.95], 'frame')
const frontBay: Hole = { lo: -3.05, hi: 0.05, sill: FLOOR + 0.67, head: 4.28 }
wall('x', 3.4, -3.5, 0.5, FLOOR, EAVES, [frontBay])
wall('z', -3.5, -2.4, 3.4, FLOOR, EAVES, [
  { lo: -1.95, hi: -0.85, sill: 2.5, head: 4.15 },
  { lo: 0.5, hi: 1.6, sill: 2.5, head: 4.15 },
])
for (const range of [[-1.95, -0.85], [0.5, 1.6]]) window('z', -3.54, range[0], range[1], 2.5, 4.15)
wall('z', 0.5, 1.55, 3.4, FLOOR, EAVES)
wall('x', -2.4, -3.5, 0.5, FLOOR, EAVES)
wall('x', -2.4, 0.5, 3.6, FLOOR, 4.12, [{ lo: 0.85, hi: 3.4, sill: FLOOR, head: 4.1 }])

// The box bay projects under its own shallow hood, with three tall sash lights.
box([-1.5, FLOOR - 0.12, 3.725], [3.1, 0.2, 0.65], 'frame')
wall('x', 4.05, -3.05, 0.05, FLOOR, 4.4, [frontBay])
for (const x of [-3.05, 0.05]) {
  wall('z', x, 3.4, 4.05, FLOOR, 4.4, [{ lo: 3.48, hi: 3.97, sill: 2.45, head: 4.2 }])
  window('z', x, 3.48, 3.97, 2.45, 4.2)
  box([x, (FLOOR + 4.4) / 2, 4.09], [0.115, 4.4 - FLOOR + 0.08, 0.14], 'frame')
}
window('x', 4.09, -3.05, 0.05, frontBay.sill, frontBay.head, 3)
hood('x', 3.97, -3.17, 0.17, 4.48, 0.65)
for (let x = -2.95; x < 0.05; x += 0.51) box([x, FLOOR + 0.24, 4.12], [0.065, 0.2, 0.15], 'frame')
box([-1.5, FLOOR + 0.27, 4.09], [3.25, 0.1, 0.11], 'frame')

// Asymmetrical lower right roof and a genuinely recessed porch doorway.
const door: Hole = { lo: 1.7, hi: 2.8, sill: FLOOR, head: 4.02 }
const leadlight: Hole = { lo: 0.88, hi: 1.28, sill: 2.45, head: 3.6 }
wall('x', 1.55, 0.5, 3.6, FLOOR, 4.12, [door, leadlight])
window('x', 1.59, leadlight.lo, leadlight.hi, leadlight.sill, leadlight.head, 1, false)
window('x', 1.59, door.lo, door.hi, door.sill + 0.05, door.head, 1, false)
box([2.25, FLOOR + 0.45, 1.67], [0.9, 0.78, 0.06], 'charred')
box([2.66, FLOOR + 1.07, 1.73], [0.04, 0.045, 0.07], 'roof')
const rightWindows: Hole[] = [
  { lo: -1.8, hi: -0.65, sill: 2.45, head: 3.86 },
  { lo: -0.05, hi: 1.05, sill: 2.45, head: 3.86 },
]
wall('z', 3.6, -2.4, 1.55, FLOOR, 4.14, rightWindows)
for (const hole of rightWindows) {
  window('z', 3.64, hole.lo, hole.hi, hole.sill, hole.head)
  hood('z', 3.64, hole.lo, hole.hi, hole.head + 0.16, 0.48)
}
for (const [x, z] of [[-3.5, -2.4], [-3.5, 3.4], [0.5, 3.4], [3.6, -2.4], [3.6, 1.55]]) {
  const top = x > 3 ? 4.12 : 4.4
  box([x, (FLOOR + top) / 2, z], [0.13, top - FLOOR + 0.06, 0.13], 'frame')
}
gableRoof(-1.5, 2, -2.4, 3.4, EAVES, 1.18, 0.34)

// Gable return cornices, layered trim and short decorative eave brackets.
for (const x of [-3.55, 0.55]) {
  box([x + (x < 0 ? 0.18 : -0.18), EAVES - 0.08, 3.79], [0.72, 0.14, 0.18], 'frame')
  for (let i = 0; i < 3; i++) {
    const bx = x + (x < 0 ? 1 : -1) * (0.1 + i * 0.19)
    beam([bx, EAVES - 0.52, 3.42], [bx, EAVES - 0.18, 3.73], 0.055, 0.075, 'frame')
  }
}
// A curved inset gable motif approximated with a sequence of small clean beams.
const archZ = 3.46
const archPoints: V3[] = []
for (let i = 0; i <= 20; i++) {
  const x = -3.07 + i * 3.14 / 20
  const t = (x + 1.5) / 1.57
  archPoints.push([x, EAVES + 0.08 + 0.58 * (1 - t * t), archZ])
}
for (let i = 1; i < archPoints.length; i++) beam(archPoints[i - 1], archPoints[i], 0.13, 0.075, 'frame')

// The lean-to follows the main roof at the lower shoulder, not a second full gable.
const leanAngle = Math.atan2(0.68, 3.6)
for (const z of [-2.4, 1.55]) {
  for (let y = 4.12; y < 4.74; y += 0.13) {
    const height = Math.min(0.122, 4.74 - y)
    const end = Math.min(3.6, 2.05 + (4.42 - y - height) / Math.tan(leanAngle))
    if (end > 0.53) box([(0.5 + end) / 2, y + height / 2, z], [end - 0.5, height, 0.07], 'clad')
  }
}
for (const [z0, z1] of [[-2.73, 1.55], [1.55, 3.85]]) {
  region = z0 >= 1.55 ? 'verandah' : 'original'
  box([2.05, 4.47, (z0 + z1) / 2], [3.6 / Math.cos(leanAngle), 0.075, z1 - z0], 'roof', 0, -leanAngle)
  box([3.84, 4.13, (z0 + z1) / 2], [0.12, 0.14, z1 - z0 + 0.025], 'roof')
}
for (const z of [-2.73, 3.85]) {
  region = z > 1.55 ? 'verandah' : 'original'
  beam([0.25, 4.81, z], [3.85, 4.13, z], 0.13, 0.1, 'frame')
}
for (let z = -2.68; z <= 3.8; z += 0.14) {
  region = z > 1.55 ? 'verandah' : 'original'
  box([2.05, 4.52, z], [3.6 / Math.cos(leanAngle), 0.017, 0.02], 'roof', 0, -leanAngle, true)
}
region = 'original'
for (const [x, z] of [[-3.85, 3.6], [3.83, -2.55]]) {
  box([x, 2.5, z], [0.065, 3.1, 0.065], 'frame')
  beam([x, 4.05, z], [x + (x < 0 ? 0.17 : -0.17), 4.15, z], 0.065, 0.065, 'frame')
}

/* The porch, stairs and garden threshold are a separate hover region. */
region = 'verandah'
deck(0.56, 3.64, 1.6, 3.77)
for (const x of [0.64, 1.65, 2.8, 3.54]) box([x, 0.77, 3.61], [0.16, 1.54, 0.16], 'frame')
for (const x of [0.62, 3.58]) {
  const postTop = 4.37 - (x - 2.05) * Math.tan(leanAngle)
  const inset = x < 2 ? 0.4 : -0.4
  box([x, (FLOOR + postTop) / 2, 3.69], [0.14, postTop - FLOOR, 0.14], 'frame')
  box([x, postTop - 0.05, 3.69], [0.22, 0.15, 0.22], 'frame')
  beam([x, postTop - 0.43, 3.69], [x + inset, postTop - inset * Math.tan(leanAngle), 3.69], 0.07, 0.095, 'frame')
}
beam([0.62, 4.64, 3.69], [3.58, 4.08, 3.69], 0.13, 0.14, 'frame')
railing('x', 3.69, 0.62, 1.65)
railing('x', 3.69, 2.8, 3.58)
railing('z', 3.58, 1.67, 3.69)
// The stair gap is deliberately open; neither rails nor balusters cross it.
for (const x of [1.65, 2.8]) box([x, FLOOR + 0.53, 3.69], [0.12, 1.12, 0.12], 'frame')
const steps = 10
for (let i = 0; i < steps; i++) {
  const y = (i + 1) * FLOOR / steps
  const z = 6.42 - (i + 0.5) * 0.265
  box([2.225, y - 0.025, z], [1.13, 0.065, 0.29], 'deck')
  box([2.225, y - 0.11, z - 0.115], [1.08, 0.145, 0.045], 'frame')
  const railHeight = 1.02 + (6.3 - z) * (1.67 / 2.61) - 0.04
  const balusterBase = y + 0.045
  for (const x of [1.67, 2.78]) box([x, (balusterBase + railHeight) / 2, z], [0.038, railHeight - balusterBase, 0.038], 'frame')
}
for (const x of [1.65, 2.8]) {
  beam([x, 0.11, 6.4], [x, FLOOR - 0.1, 3.76], 0.1, 0.17, 'frame')
  beam([x, 1.02, 6.3], [x, FLOOR + 0.99, 3.69], 0.085, 0.08, 'frame')
  box([x, 0.57, 6.3], [0.12, 1.14, 0.12], 'frame')
}

/* A possible addition: an offset, lower gabled garden pavilion joined through
   a narrow glazed link. This is an imagined proposal, not Auchenflower's plan. */
region = 'extension'
for (const x of [0.98, 3.2, 5.48]) for (const z of [-6.5, -4.9, -3.5]) box([x, 0.76, z], [0.16, 1.52, 0.16], 'frame')
box([3.225, FLOOR - 0.13, -5.1], [4.85, 0.23, 3.4], 'frame')
box([2.2, FLOOR - 0.13, -2.9], [2.8, 0.23, 1], 'frame')
// Link roof is a discrete lower seam, so the original eaves remain legible.
box([2.2, 4.06, -2.9], [2.86, 0.09, 1.08], 'roof')
for (const x of [0.84, 3.56]) window('z', x, -3.35, -2.45, FLOOR + 0.04, 4, 1, false)
const pavilionTop = 4.24
wall('x', -6.8, 0.8, 5.65, FLOOR, pavilionTop, [{ lo: 1.25, hi: 5.2, sill: 2.1, head: 4.05 }], 'charred')
window('x', -6.84, 1.25, 5.2, 2.1, 4.05, 3, false)
wall('z', 0.8, -6.8, -3.4, FLOOR, pavilionTop, [{ lo: -6.15, hi: -4.15, sill: 2.45, head: 3.9 }], 'charred')
window('z', 0.76, -6.15, -4.15, 2.45, 3.9, 2, false)
wall('z', 5.65, -6.8, -3.4, FLOOR, pavilionTop, [{ lo: -6.48, hi: -3.69, sill: FLOOR + 0.04, head: 4.04 }], 'charred')
window('z', 5.69, -6.48, -3.69, FLOOR + 0.04, 4.04, 3, false)
// Full-height front openings line up with the link and sheltered garden deck.
wall('x', -3.4, 0.8, 5.65, FLOOR, pavilionTop, [
  { lo: 0.88, hi: 3.5, sill: FLOOR, head: 4.03 },
  { lo: 3.82, hi: 5.48, sill: FLOOR, head: 4.03 },
], 'charred')
window('x', -3.36, 3.82, 5.48, FLOOR + 0.04, 4.03, 2, false)
for (const x of [0.8, 5.65]) for (const z of [-6.8, -3.4]) box([x, (FLOOR + pavilionTop) / 2, z], [0.115, pavilionTop - FLOOR - 0.12, 0.115], 'frame')
gableRoof(3.225, 2.425, -6.8, -3.4, pavilionTop, 0.9, 0.24)

// A small garden verandah alongside the original side wall, roofed at the
// pavilion shoulder. Its structure remains independent of the original trim.
region = 'verandah'
deck(3.75, 5.7, -3.37, -1.2)
for (const x of [3.84, 5.6]) {
  for (const z of [-3.25, -1.29]) box([x, 0.77, z], [0.14, 1.54, 0.14], 'frame')
  box([x, 2.77, -1.28], [0.12, 2.3, 0.12], 'frame')
}
box([4.725, 3.99, -2.27], [2.12, 0.07, 2.4], 'roof', 0.07)
box([4.725, 3.88, -1.08], [2.15, 0.15, 0.12], 'frame')
railing('x', -1.27, 3.84, 5.6)
railing('z', 5.6, -3.25, -1.27)

export const AUCHENFLOWER_STUDY_MEMBERS = members
export const AUCHENFLOWER_STUDY_YAW = 0

// Conservative rotation-aware bounds, shared with the framing and ground.
const bounds = (() => {
  const min: V3 = [Infinity, Infinity, Infinity]
  const max: V3 = [-Infinity, -Infinity, -Infinity]
  for (const member of members) {
    const c = Math.cos(member.rz ?? 0), s = Math.sin(member.rz ?? 0)
    const cx = Math.cos(member.rx), sx = Math.sin(member.rx)
    const hx = Math.abs(c) * member.s[0] / 2 + Math.abs(s) * member.s[1] / 2
    const hy0 = Math.abs(s) * member.s[0] / 2 + Math.abs(c) * member.s[1] / 2
    const hz0 = member.s[2] / 2
    const half = [hx, Math.abs(cx) * hy0 + Math.abs(sx) * hz0, Math.abs(sx) * hy0 + Math.abs(cx) * hz0]
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], member.p[axis] - half[axis])
      max[axis] = Math.max(max[axis], member.p[axis] + half[axis])
    }
  }
  return { min, max }
})()
export const AUCHENFLOWER_STUDY_OFFSET = bounds.min.map((value, i) => -(value + bounds.max[i]) / 2) as V3
export const AUCHENFLOWER_STUDY_POINTS: Record<'original' | 'connection' | 'outdoors', V3> = {
  original: [-1.5, FLOOR + 0.43, 4.14],
  connection: [5.72, 3.1, -4.25],
  outdoors: [3.58, FLOOR + 0.65, 2.9],
}
