/**
 * A traditional Queenslander, described once and used twice: as the 3D scene,
 * and as the static drawing that stands in for it under reduced motion or
 * without WebGL. Both are the same building, so the fallback is never a
 * different picture from the thing it replaces.
 *
 * It replaced a modern two-storey cabin. Angus builds on heritage homes in
 * inner Brisbane, and a flat-walled cabin with sliding doors was a generic new
 * build — the one kind of house this business does not do. So the section now
 * builds the house his clients actually live in:
 *
 *   - high-set on timber stumps, with a batten screen under the verandah
 *   - a steep hipped roof in corrugated sheet, laid strip by strip
 *   - a full-width front verandah under its own shallow roof, with posts,
 *     corner brackets and a vertical-picket balustrade
 *   - a central timber stair from the verandah to the ground
 *   - weatherboards, tall sash windows, and hoods over the side windows
 *
 * Units are metres. Sections are the real ones a carpenter would order. It goes
 * up in the order a building actually goes up — stumps and bearers, floor,
 * walls, roof frame, then the enclosure — and it finishes as a finished house,
 * lit from within. The section is called "Drawn, then built", so it has to end
 * built.
 */

export type MaterialKey = 'frame' | 'clad' | 'roof' | 'glass' | 'deck'

export type Member = {
  /** Centre position [x, y, z], metres. */
  p: [number, number, number]
  /** Full size [w, h, d], metres. */
  s: [number, number, number]
  /**
   * Rotation, radians, applied in three.js 'YXZ' order: roll about z first,
   * then pitch about x, then yaw about y. A roof sheet on the front or back of
   * the hip pitches about x; one on a hip end rolls about z; a hip or a stair
   * rail that runs diagonally in plan needs pitch and yaw together.
   */
  rx: number
  ry?: number
  rz?: number
  /** Scroll progress at which this member is placed, 0 to 1. */
  at: number
  stage: 0 | 1 | 2 | 3
  mat: MaterialKey
  /** True if this is part of the finished exterior, and so worth drawing in the
   *  still frame. The frame inside is hidden by then. */
  outer?: boolean
  /**
   * False to leave this member out of the line-work. Only the roof sheet uses
   * it. The drawing's lines stay on at a fifth of their strength once the house
   * is built, in Bellewood Green, and Green is lighter than the Deep Pine sheet:
   * every seam between strips drew a pale stroke down the roof. The rafters
   * beneath still draw, so the roof is still set out in line before it is clad.
   */
  lines?: false
  /**
   * Drawing order for the still, which has no depth buffer. 0 is the body of
   * the house, 1 the verandah roof, 2 the main roof. Sorting faces by depth
   * alone put the top boards of the walls over the eaves, because a long roof
   * sheet's average depth lands behind the short boards it actually covers.
   * From this camera, above the house, the roofs are always in front of what is
   * under them, so the still draws in these layers and sorts by depth within
   * each. The live scene has a depth buffer and ignores this.
   */
  layer?: 1 | 2
}

/* --- Setting out ------------------------------------------------------------
   x runs along the frontage, z from back (-) to street (+), y is up. The main
   floor is at y = 0; the ground is well below it, because the house is high-set.
   The camera looks from the front right, so the verandah, the stair and the
   right-hand side wall are the faces a visitor sees. */

const LENGTH = 9.0
const DEPTH = 7.0
const HALF_L = LENGTH / 2
const HALF_D = DEPTH / 2

/** The ground. Stumps run from here up to the bearers. */
const GROUND = -1.75
const BEARER_Y = -0.33
const BEARER_H = 0.19
const JOIST_Y = -0.11

/** Tall ceilings, as these houses have. */
const WALL_H = 3.1
const STUD = 0.045
const STUD_W = 0.09
const PLATE = 0.045
const WALL_TOP = PLATE + WALL_H + STUD_W

const CLAD_T = 0.024
/** Weatherboard exposure. Narrower than a modern board, which is most of what
 *  makes a wall read as old. */
const BOARD = 0.22
const CLAD_W_OFFSET = STUD_W / 2 + CLAD_T / 2

/* The verandah: the full width of the house, across the front. */
const VER_Z0 = HALF_D
const VER_D = 2.4
const VER_Z1 = HALF_D + VER_D
const POST_Z = VER_Z1 - 0.06
const BEAM_Y = 2.39

/* The main roof: a hip, all four planes at one pitch. */
const PITCH = (32 * Math.PI) / 180
const TAN = Math.tan(PITCH)
const EAVE = 0.5
/** Half the roof's plan at the eave line. */
const LX = HALF_L + EAVE
const LZ = HALF_D + EAVE
/** Where the sheet surface sits directly above the wall line. */
const ROOF_AT_WALL = WALL_TOP + 0.19
const EAVE_Y = ROOF_AT_WALL - EAVE * TAN
const RIDGE_Y = EAVE_Y + LZ * TAN
/** Half the length of the ridge. The house is longer than it is deep, so the
 *  hip ends meet a short ridge rather than a point. */
const RIDGE_HALF = LX - LZ

/* The verandah roof: a shallow skillion tucked under the main eave. */
const VER_ROOF_WALL_Y = 2.78
const VER_OVERHANG = 0.25
const VER_PITCH = Math.atan((VER_ROOF_WALL_Y - (BEAM_Y + 0.13)) / (POST_Z - VER_Z0))

/* The front stair, central, down to the ground. */
const STAIR_W = 1.5
const RISERS = 8
const RISE = -GROUND / RISERS
const GOING = 0.27
const STAIR_Z1 = VER_Z1 + (RISERS - 1) * GOING

const members: Member[] = []
const add = (m: Member) => members.push(m)

/** Evenly spaced positions across a span, excluding its two ends. */
function across(from: number, to: number, spacing: number): number[] {
  const n = Math.max(Math.round((to - from) / spacing), 1)
  const out: number[] = []
  for (let i = 1; i < n; i++) out.push(from + (i * (to - from)) / n)
  return out
}

/**
 * Pitch and yaw that lay a member's long axis (its local z) along a direction.
 * In 'YXZ' order local z lands on (cos a·sin b, -sin a, cos a·cos b), so the
 * pitch is set by the direction's rise and the yaw by its heading in plan.
 */
function aim(from: [number, number, number], to: [number, number, number]) {
  const d: [number, number, number] = [to[0] - from[0], to[1] - from[1], to[2] - from[2]]
  const length = Math.hypot(...d)
  const v = d.map((c) => c / length)
  return {
    p: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2] as [number, number, number],
    length,
    rx: -Math.asin(v[1]),
    ry: Math.atan2(v[0], v[2]),
  }
}

/* --- Openings ---------------------------------------------------------------
   Wall-local rectangles. `u` runs along the wall, `v` is height above the
   floor. Cladding is generated around these, which is what puts real windows and
   doors in the building rather than shapes stuck on the outside. */

type Rect = { u0: number; v0: number; u1: number; v1: number }

/** Tall and narrow, the proportion of a double-hung sash. */
const sash = (centre: number, width = 0.9): Rect => ({
  u0: centre - width / 2,
  v0: 0.85,
  u1: centre + width / 2,
  v1: 2.35,
})

const FRONT_OPENINGS: Rect[] = [
  { u0: -0.55, v0: 0.05, u1: 0.55, v1: 2.3 }, // the front door, on the stair's line
  sash(-2.6, 1.2),
  sash(2.6, 1.2),
]

const BACK_OPENINGS: Rect[] = [sash(-2.2), { u0: 1.3, v0: 0.05, u1: 2.2, v1: 2.2 }]

const RIGHT_OPENINGS: Rect[] = [sash(-2.1), sash(-0.4), sash(1.9)]

const LEFT_OPENINGS: Rect[] = [sash(-1.4), sash(1.6)]

/**
 * Splits a wall into board-height strips that stop short of every opening.
 * A guillotine subtraction: bands by height, then spans across each band.
 */
function claddingRects(wall: Rect, openings: Rect[]): Rect[] {
  const out: Rect[] = []
  for (let v = wall.v0; v < wall.v1 - 1e-6; v += BOARD) {
    const vTop = Math.min(v + BOARD * 0.92, wall.v1)
    const spans = openings
      .filter((o) => o.v1 > v + 1e-6 && o.v0 < v + BOARD - 1e-6)
      .map((o): [number, number] => [Math.max(o.u0, wall.u0), Math.min(o.u1, wall.u1)])
      .sort((a, b) => a[0] - b[0])

    let u = wall.u0
    for (const [s, e] of spans) {
      if (s > u + 0.02) out.push({ u0: u, v0: v, u1: s, v1: vTop })
      u = Math.max(u, e)
    }
    if (u < wall.u1 - 0.02) out.push({ u0: u, v0: v, u1: wall.u1, v1: vTop })
  }
  return out
}

type Plane = 'front' | 'back' | 'left' | 'right'

/** Places a wall-local rectangle as a panel on one of the four walls. */
function panel(
  plane: Plane,
  r: Rect,
  thickness: number,
  offset: number,
  mat: MaterialKey,
  at: number,
  stage: 0 | 1 | 2 | 3,
) {
  const u = (r.u0 + r.u1) / 2
  const v = (r.v0 + r.v1) / 2
  const uw = Math.max(r.u1 - r.u0, 0.01)
  const vh = Math.max(r.v1 - r.v0, 0.01)

  if (plane === 'front' || plane === 'back') {
    const z = plane === 'front' ? HALF_D + offset : -HALF_D - offset
    add({ p: [u, v, z], s: [uw, vh, thickness], rx: 0, at, stage, mat, outer: true })
  } else {
    const x = plane === 'right' ? HALF_L + offset : -HALF_L - offset
    add({ p: [x, v, u], s: [thickness, vh, uw], rx: 0, at, stage, mat, outer: true })
  }
}

/**
 * One plane of the hip, laid as strips that run down the slope.
 *
 * That is how corrugated sheet actually goes on, and it is also the only way to
 * make a triangle out of boxes: each strip is cut where it meets the hip, so the
 * strips shorten towards the corners and the plane comes out as a trapezoid on
 * the long sides and a triangle on the ends. The rafters under the sheet are the
 * same generator at wider centres, which is why they meet the hips too.
 *
 * `up` lifts the layer off the roof surface — negative for the rafters beneath.
 */
function hipPlane(
  plane: Plane,
  spacing: number,
  width: number,
  thick: number,
  up: number,
  mat: MaterialKey,
  at0: number,
  at1: number,
  stage: 0 | 1 | 2 | 3,
  outer: boolean,
  sheet = false,
) {
  const long = plane === 'front' || plane === 'back'
  const half = long ? LX : LZ
  const positions = across(-half, half, spacing)
  positions.forEach((c, i) => {
    const run = long ? Math.min(LZ, LX - Math.abs(c)) : LZ - Math.abs(c)
    if (run < 0.12) return
    const slope = run / Math.cos(PITCH)
    // Sheets lap: alternate strips sit a few millimetres proud of their
    // neighbours, so where two overlap they are never in the same plane and the
    // renderer never has to guess which is in front.
    const y = EAVE_Y + (run / 2) * TAN + up + (sheet && i % 2 ? 0.008 : 0)
    const extra = sheet ? ({ lines: false, layer: 2 } as const) : {}
    const at = at0 + (i / positions.length) * (at1 - at0)

    if (plane === 'front' || plane === 'back') {
      const sign = plane === 'front' ? 1 : -1
      add({
        p: [c, y, sign * (LZ - run / 2)],
        s: [width, thick, slope],
        rx: sign * PITCH,
        at,
        stage,
        mat,
        outer,
        ...extra,
      })
    } else {
      const sign = plane === 'right' ? 1 : -1
      add({
        p: [sign * (LX - run / 2), y, c],
        s: [slope, thick, width],
        rx: 0,
        rz: -sign * PITCH,
        at,
        stage,
        mat,
        outer,
        ...extra,
      })
    }
  })
}

/** The four hips and the ridge: from each eave corner up to the ridge's ends. */
function hipsAndRidge(size: number, depth: number, up: number, mat: MaterialKey, at: number, stage: 0 | 1 | 2 | 3, outer: boolean) {
  const layer = outer ? ({ layer: 2 } as const) : {}
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const a = aim([sx * LX, EAVE_Y + up, sz * LZ], [sx * RIDGE_HALF, RIDGE_Y + up, 0])
      add({ p: a.p, s: [size, depth, a.length], rx: a.rx, ry: a.ry, at: at + (sx + 1) * 0.004 + (sz + 1) * 0.002, stage, mat, outer, ...layer })
    }
  }
  add({ p: [0, RIDGE_Y + up, 0], s: [RIDGE_HALF * 2 + size, depth, size], rx: 0, at: at + 0.02, stage, mat, outer, ...layer })
}

/* --- Stage 0. Stumps, bearers and the floor --------------------------------- */

const STUMP_XS = [-4.4, -2.2, 0, 2.2, 4.4]
const HOUSE_BEARERS = [-3.4, -1.15, 1.15, 3.4]
const VER_BEARERS = [4.7, VER_Z1 - 0.1]
const BEARER_BOTTOM = BEARER_Y - BEARER_H / 2
const stumpH = BEARER_BOTTOM - GROUND

;[...HOUSE_BEARERS, ...VER_BEARERS].forEach((z, row) => {
  STUMP_XS.forEach((x, col) => {
    add({
      p: [x, GROUND + stumpH / 2, z],
      s: [0.13, stumpH, 0.13],
      rx: 0,
      at: 0.004 + row * 0.006 + col * 0.002,
      stage: 0,
      mat: 'frame',
      outer: true,
    })
  })
  add({
    p: [0, BEARER_Y, z],
    s: [LENGTH + 0.2, BEARER_H, 0.12],
    rx: 0,
    at: 0.045 + row * 0.006,
    stage: 0,
    mat: 'frame',
    outer: true,
  })
})

const joistXs = [-HALF_L, ...across(-HALF_L, HALF_L, 0.6), HALF_L]
joistXs.forEach((x, i) => {
  add({
    p: [x, JOIST_Y, 0],
    s: [0.045, 0.15, DEPTH],
    rx: 0,
    at: 0.085 + (i / joistXs.length) * 0.045,
    stage: 0,
    mat: 'frame',
  })
})

// The verandah's joists run the other way, so its boards can run out from the
// house and shed water off the front edge.
across(VER_Z0, VER_Z1, 0.6).forEach((z, i) => {
  add({
    p: [0, JOIST_Y, z],
    s: [LENGTH, 0.12, 0.045],
    rx: 0,
    at: 0.12 + i * 0.004,
    stage: 0,
    mat: 'frame',
  })
})

/* --- Stage 1. The wall frame, the verandah posts, the stair ------------------ */

{
  const plateY = PLATE / 2
  const studY = PLATE + WALL_H / 2
  const topY = PLATE + WALL_H + STUD_W / 2
  const at0 = 0.15
  const at1 = 0.34

  for (const z of [-HALF_D, HALF_D]) {
    add({ p: [0, plateY, z], s: [LENGTH, PLATE, STUD_W], rx: 0, at: at0, stage: 1, mat: 'frame' })
    add({ p: [0, topY, z], s: [LENGTH, STUD_W, STUD_W], rx: 0, at: at1, stage: 1, mat: 'frame' })
  }
  for (const x of [-HALF_L, HALF_L]) {
    add({ p: [x, plateY, 0], s: [STUD_W, PLATE, DEPTH], rx: 0, at: at0, stage: 1, mat: 'frame' })
    add({ p: [x, topY, 0], s: [STUD_W, STUD_W, DEPTH], rx: 0, at: at1, stage: 1, mat: 'frame' })
  }

  const studXs = [-HALF_L, ...across(-HALF_L, HALF_L, 0.75), HALF_L]
  studXs.forEach((x, i) => {
    for (const z of [-HALF_D, HALF_D]) {
      add({
        p: [x, studY, z],
        s: [STUD, WALL_H, STUD_W],
        rx: 0,
        at: at0 + 0.02 + (i / studXs.length) * (at1 - at0) * 0.6,
        stage: 1,
        mat: 'frame',
      })
    }
  })

  const endStuds = across(-HALF_D, HALF_D, 0.75)
  for (const x of [-HALF_L, HALF_L]) {
    endStuds.forEach((z, i) => {
      add({
        p: [x, studY, z],
        s: [STUD_W, WALL_H, STUD],
        rx: 0,
        at: at0 + 0.05 + (i / endStuds.length) * (at1 - at0) * 0.5,
        stage: 1,
        mat: 'frame',
      })
    })
  }
}

// Verandah posts and the beam they carry. The two either side of the stair
// frame the way up to the front door.
const POST_XS = [-4.42, -2.6, -STAIR_W / 2 - 0.1, STAIR_W / 2 + 0.1, 2.6, 4.42]
POST_XS.forEach((x, i) => {
  add({
    p: [x, BEAM_Y / 2 - 0.05, POST_Z],
    s: [0.1, BEAM_Y - 0.1, 0.1],
    rx: 0,
    at: 0.36 + i * 0.006,
    stage: 1,
    mat: 'frame',
    outer: true,
  })
})
add({
  p: [0, BEAM_Y, POST_Z],
  s: [LENGTH + 0.1, 0.18, 0.1],
  rx: 0,
  at: 0.41,
  stage: 1,
  mat: 'frame',
  outer: true,
})

// The stair: two stringers from the verandah edge to the ground, then treads.
{
  const top: [number, number, number] = [0, -0.06, VER_Z1]
  const bottom: [number, number, number] = [0, GROUND + 0.08, STAIR_Z1 + 0.12]
  for (const x of [-STAIR_W / 2 + 0.03, STAIR_W / 2 - 0.03]) {
    const a = aim([x, top[1], top[2]], [x, bottom[1], bottom[2]])
    add({ p: a.p, s: [0.05, 0.26, a.length], rx: a.rx, ry: a.ry, at: 0.42, stage: 1, mat: 'frame', outer: true })
  }
}

/* --- Stage 2. The roof frame ------------------------------------------------ */

for (const [plane, i] of [['front', 0], ['right', 1], ['back', 2], ['left', 3]] as const) {
  hipPlane(plane, 0.9, 0.045, 0.14, -0.1, 'frame', 0.5 + i * 0.03, 0.53 + i * 0.03, 2, false)
}
hipsAndRidge(0.06, 0.2, -0.08, 'frame', 0.63, 2, false)

// The verandah roof's rafters, from the wall down to the beam and past it.
{
  const length = (VER_D + VER_OVERHANG) / Math.cos(VER_PITCH)
  const zMid = VER_Z0 + (VER_D + VER_OVERHANG) / 2
  const yMid = VER_ROOF_WALL_Y - ((VER_D + VER_OVERHANG) / 2) * Math.tan(VER_PITCH) - 0.08
  const xs = [-HALF_L, ...across(-HALF_L, HALF_L, 0.9), HALF_L]
  xs.forEach((x, i) => {
    add({
      p: [x, yMid, zMid],
      s: [0.045, 0.12, length],
      rx: VER_PITCH,
      at: 0.67 + (i / xs.length) * 0.04,
      stage: 2,
      mat: 'frame',
    })
  })
}

/* --- Stage 3. The enclosure ------------------------------------------------- */

const wallSpecs: { plane: Plane; openings: Rect[]; half: number; at0: number }[] = [
  { plane: 'front', openings: FRONT_OPENINGS, half: HALF_L, at0: 0.73 },
  { plane: 'right', openings: RIGHT_OPENINGS, half: HALF_D, at0: 0.745 },
  { plane: 'back', openings: BACK_OPENINGS, half: HALF_L, at0: 0.76 },
  { plane: 'left', openings: LEFT_OPENINGS, half: HALF_D, at0: 0.77 },
]

for (const spec of wallSpecs) {
  const rects = claddingRects({ u0: -spec.half, v0: -0.12, u1: spec.half, v1: WALL_TOP }, spec.openings)
  rects.forEach((r, i) => {
    panel(spec.plane, r, CLAD_T, CLAD_W_OFFSET, 'clad', spec.at0 + (i / rects.length) * 0.08, 3)
  })

  // Each opening is framed and then glazed. Four members around the hole rather
  // than one panel behind it: a filled panel, however thin, sits in front of the
  // glass on whichever side the camera is on and turns every window black.
  spec.openings.forEach((o, i) => {
    const at = spec.at0 + 0.06 + i * 0.004
    const b = 0.07
    const frames: Rect[] = [
      { u0: o.u0 - b, v0: o.v1, u1: o.u1 + b, v1: o.v1 + b },
      { u0: o.u0 - b, v0: o.v0 - b, u1: o.u1 + b, v1: o.v0 },
      { u0: o.u0 - b, v0: o.v0, u1: o.u0, v1: o.v1 },
      { u0: o.u1, v0: o.v0, u1: o.u1 + b, v1: o.v1 },
    ]
    // The meeting rail across the middle of a sash window.
    if (o.v0 > 0.5) frames.push({ u0: o.u0, v0: (o.v0 + o.v1) / 2 - 0.025, u1: o.u1, v1: (o.v0 + o.v1) / 2 + 0.025 })
    for (const f of frames) panel(spec.plane, f, CLAD_T + 0.03, CLAD_W_OFFSET, 'roof', at, 3)
    panel(spec.plane, o, 0.02, CLAD_W_OFFSET - 0.03, 'glass', at + 0.006, 3)

    // A hood over every window the verandah does not already shelter. It is
    // the detail that most says Queensland: a little skillion of sheet over
    // each sash, for the afternoon sun and the summer storms.
    if (spec.plane === 'front' || o.v0 < 0.5) return
    const reach = 0.5
    const width = o.u1 - o.u0 + 0.3
    const lean = 0.5
    const out = CLAD_W_OFFSET + (reach / 2) * Math.cos(lean)
    const y = o.v1 + 0.34
    const hoodAt = 0.9 + i * 0.004
    const u = (o.u0 + o.u1) / 2
    if (spec.plane === 'right' || spec.plane === 'left') {
      const sign = spec.plane === 'right' ? 1 : -1
      add({ p: [sign * (HALF_L + out), y, u], s: [reach, 0.035, width], rx: 0, rz: -sign * lean, at: hoodAt, stage: 3, mat: 'roof', outer: true })
    } else {
      add({ p: [u, y, -(HALF_D + out)], s: [width, 0.035, reach], rx: -lean, at: hoodAt, stage: 3, mat: 'roof', outer: true })
    }
  })
}

// The verandah floor: boards running out from the house to the front edge.
{
  const xs = across(-HALF_L - 0.05, HALF_L + 0.05, 0.15)
  xs.forEach((x, i) => {
    add({
      p: [x, -0.015, (VER_Z0 + VER_Z1) / 2],
      s: [0.13, 0.03, VER_D],
      rx: 0,
      at: 0.74 + (i / xs.length) * 0.05,
      stage: 3,
      mat: 'deck',
      outer: true,
    })
  })
}

// Corner boards, where the weatherboards of two walls meet. Every old
// weatherboard house has them, and they are also what closes the corner: the
// boards of two walls stop a board's thickness apart, and without a stop over
// the join a thin line of daylight ran down each corner.
for (const sx of [-1, 1]) {
  for (const sz of [-1, 1]) {
    const off = CLAD_W_OFFSET + 0.01
    add({
      p: [sx * (HALF_L + off), (WALL_TOP - 0.12) / 2, sz * (HALF_D + off)],
      s: [0.1, WALL_TOP + 0.12, 0.1],
      rx: 0,
      at: 0.815,
      stage: 3,
      mat: 'frame',
      outer: true,
    })
  }
}

// Treads, top to bottom.
for (let i = 1; i < RISERS; i++) {
  add({
    p: [0, -i * RISE - 0.02, VER_Z1 + (i - 0.5) * GOING],
    s: [STAIR_W - 0.08, 0.04, GOING + 0.03],
    rx: 0,
    at: 0.8 + i * 0.005,
    stage: 3,
    mat: 'deck',
    outer: true,
  })
}

// The main roof in sheet, then its hips, ridge and gutters.
for (const [plane, i] of [['front', 0], ['right', 1], ['back', 2], ['left', 3]] as const) {
  // A little wider than their spacing, so each sheet laps the next the way
  // corrugated iron is laid and no seam opens onto the ground behind.
  hipPlane(plane, 0.32, 0.345, 0.03, 0.03, 'roof', 0.83 + i * 0.012, 0.845 + i * 0.012, 3, true, true)
}
hipsAndRidge(0.16, 0.07, 0.07, 'roof', 0.9, 3, true)

for (const sz of [-1, 1]) {
  add({ p: [0, EAVE_Y - 0.06, sz * (LZ + 0.04)], s: [LX * 2 + 0.1, 0.11, 0.1], rx: 0, at: 0.93, stage: 3, mat: 'roof', outer: true, layer: 2 })
}
for (const sx of [-1, 1]) {
  add({ p: [sx * (LX + 0.04), EAVE_Y - 0.06, 0], s: [0.1, 0.11, LZ * 2 + 0.1], rx: 0, at: 0.93, stage: 3, mat: 'roof', outer: true, layer: 2 })
}

// The verandah roof in sheet, and its fascia.
{
  const length = (VER_D + VER_OVERHANG) / Math.cos(VER_PITCH)
  const zMid = VER_Z0 + (VER_D + VER_OVERHANG) / 2
  const yMid = VER_ROOF_WALL_Y - ((VER_D + VER_OVERHANG) / 2) * Math.tan(VER_PITCH)
  const xs = across(-HALF_L - 0.2, HALF_L + 0.2, 0.32)
  xs.forEach((x, i) => {
    add({
      p: [x, yMid + (i % 2 ? 0.008 : 0), zMid],
      s: [0.345, 0.03, length],
      rx: VER_PITCH,
      at: 0.88 + (i / xs.length) * 0.03,
      stage: 3,
      mat: 'roof',
      outer: true,
      lines: false,
      layer: 1,
    })
  })
  const edgeY = VER_ROOF_WALL_Y - (VER_D + VER_OVERHANG) * Math.tan(VER_PITCH)
  add({ p: [0, edgeY - 0.08, VER_Z1 + VER_OVERHANG], s: [LENGTH + 0.45, 0.16, 0.03], rx: 0, at: 0.92, stage: 3, mat: 'frame', outer: true, layer: 1 })
}

/* --- The verandah's detail --------------------------------------------------
   Posts are up already. This is what turns a deck into a verandah: the
   balustrade of vertical pickets, the brackets at the post heads, and the batten
   screen that closes in the space under the floor. */

const RAIL_TOP = 0.95
const RAIL_LOW = 0.13
const PICKET_H = RAIL_TOP - RAIL_LOW - 0.05

/** One run of balustrade between two points on the verandah's edge. */
function balustrade(from: number, to: number, fixed: number, alongX: boolean, at: number) {
  const mid = (from + to) / 2
  const len = Math.abs(to - from)
  for (const y of [RAIL_TOP, RAIL_LOW]) {
    add({
      p: alongX ? [mid, y, fixed] : [fixed, y, mid],
      s: alongX ? [len, 0.05, 0.07] : [0.07, 0.05, len],
      rx: 0,
      at,
      stage: 3,
      mat: 'frame',
      outer: true,
    })
  }
  across(from, to, 0.13).forEach((c, i) => {
    add({
      p: alongX ? [c, (RAIL_TOP + RAIL_LOW) / 2, fixed] : [fixed, (RAIL_TOP + RAIL_LOW) / 2, c],
      s: [0.03, PICKET_H, 0.03],
      rx: 0,
      at: at + 0.004 + i * 0.0006,
      stage: 3,
      mat: 'frame',
      outer: true,
    })
  })
}

for (let i = 0; i < POST_XS.length - 1; i++) {
  // No balustrade across the top of the stair.
  if (POST_XS[i] < 0 && POST_XS[i + 1] > 0) continue
  balustrade(POST_XS[i], POST_XS[i + 1], POST_Z, true, 0.86 + i * 0.008)
}
for (const x of [-4.42, 4.42]) balustrade(VER_Z0 + 0.08, POST_Z, x, false, 0.9)

// Brackets at the post heads, braced into the beam at forty-five degrees.
POST_XS.forEach((x, i) => {
  for (const side of [-1, 1]) {
    // The end posts only bracket inwards; there is no beam past them.
    if ((i === 0 && side < 0) || (i === POST_XS.length - 1 && side > 0)) continue
    add({
      p: [x + side * 0.16, BEAM_Y - 0.26, POST_Z],
      s: [0.045, 0.42, 0.045],
      rx: 0,
      rz: -side * (Math.PI / 4),
      at: 0.94 + i * 0.003,
      stage: 3,
      mat: 'frame',
      outer: true,
    })
  }
})

// The stair's handrails and newel posts.
{
  for (const x of [-STAIR_W / 2 - 0.02, STAIR_W / 2 + 0.02]) {
    const a = aim([x, RAIL_TOP - 0.02, VER_Z1], [x, GROUND + RAIL_TOP - 0.1, STAIR_Z1])
    add({ p: a.p, s: [0.05, 0.05, a.length], rx: a.rx, ry: a.ry, at: 0.95, stage: 3, mat: 'frame', outer: true })
    add({
      p: [x, GROUND + (RAIL_TOP + 0.05) / 2, STAIR_Z1 + 0.05],
      s: [0.09, RAIL_TOP + 0.05, 0.09],
      rx: 0,
      at: 0.945,
      stage: 3,
      mat: 'frame',
      outer: true,
    })
  }
}

// The batten screen under the verandah front, between the stumps.
{
  const top = BEARER_BOTTOM - 0.02
  const h = top - GROUND
  const xs = across(-HALF_L, HALF_L, 0.16)
  xs.forEach((x, i) => {
    add({
      p: [x, GROUND + h / 2, VER_Z1 - 0.1],
      s: [0.07, h, 0.02],
      rx: 0,
      at: 0.955 + (i / xs.length) * 0.02,
      stage: 3,
      mat: 'frame',
      outer: true,
    })
  })
}

// Two lights under the verandah roof, either side of the door. A house at dusk
// with nothing lit reads as empty.
for (const x of [-1.5, 1.5]) {
  add({
    p: [x, 2.48, HALF_D + 0.14],
    s: [0.16, 0.06, 0.16],
    rx: 0,
    at: 0.97,
    stage: 3,
    mat: 'glass',
    outer: true,
  })
}

export const FRAME_MEMBERS = members

/** Bounds, so the camera and the still frame can both fit it without guessing. */
export const FRAME_BOUNDS = {
  length: LENGTH,
  depth: DEPTH,
  /** The top of the ridge. */
  height: RIDGE_Y + 0.1,
  /** How far forward it reaches: the foot of the stair. */
  deckZ: STAIR_Z1 + 0.2,
  /** The ground it stands on, below the main floor. */
  ground: GROUND,
  /** Half the roof's width at the eave, which is wider than the walls. */
  halfWidth: LX,
  centreY: (RIDGE_Y + GROUND) / 2,
}

/**
 * Where each named stage begins, as a fraction of the section's pinned scroll.
 * These line up with the `at` values above.
 */
export const FRAME_STAGE_STARTS = [0, 0.14, 0.48, 0.72] as const

export const FRAME_STAGES = [
  { label: 'Drawings', note: 'Set out from the architect’s documents.' },
  { label: 'Frame', note: 'Stumps, bearers, the floor and the walls. Everything square.' },
  { label: 'Roof', note: 'A hipped roof to the ridge, and the verandah roof below it.' },
  { label: 'Finish', note: 'Weatherboards, sash windows, the verandah and the stair.' },
] as const
