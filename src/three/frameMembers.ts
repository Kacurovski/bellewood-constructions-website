/**
 * A two-storey timber cabin, described once and used twice: as the 3D scene, and
 * as the static drawing that stands in for it under reduced motion or without
 * WebGL. Both are the same building, so the fallback is never a different
 * picture from the thing it replaces.
 *
 * Units are metres. Sections are the real ones a carpenter would order. It goes
 * up in the order a building actually goes up — substructure, floor, walls,
 * upper floor, roof, then the enclosure — and it finishes as a finished house:
 * clad on every side, glazed, decked, and lit from within.
 *
 * That last part matters. An earlier version stopped as a cutaway with the near
 * side left open, which read as unfinished rather than as a drawing convention.
 * The section is called "Drawn, then built", so it has to end built.
 */

export type MaterialKey = 'frame' | 'clad' | 'roof' | 'glass' | 'deck'

export type Member = {
  /** Centre position [x, y, z], metres. */
  p: [number, number, number]
  /** Full size [w, h, d], metres. */
  s: [number, number, number]
  /** Rotation about the x axis, radians. Only the roof needs it. */
  rx: number
  /** Scroll progress at which this member is placed, 0 to 1. */
  at: number
  stage: 0 | 1 | 2 | 3
  mat: MaterialKey
  /** True if this is part of the finished exterior, and so worth drawing in the
   *  still frame. The frame inside is hidden by then. */
  outer?: boolean
}

/* --- Setting out ----------------------------------------------------------- */

const LENGTH = 8.0
const DEPTH = 5.0
const HALF_L = LENGTH / 2
const HALF_D = DEPTH / 2

const GROUND_H = 2.6
const MID_THICK = 0.35
const UPPER_Y = GROUND_H + MID_THICK // 2.95
const UPPER_H = 2.35
const WALL_TOP = UPPER_Y + UPPER_H // 5.3

const PITCH_RISE = 1.32
const PITCH = Math.atan2(PITCH_RISE, HALF_D)
const RAFTER_LEN = Math.hypot(HALF_D, PITCH_RISE)
const APEX = WALL_TOP + PITCH_RISE
const EAVE = 0.45

const STUD = 0.045
const STUD_W = 0.09
const PLATE = 0.045
const CLAD_T = 0.024
const BOARD = 0.28 // cladding board exposure
/** How far the cladding face sits outside the wall centreline. */
const CLAD_W_OFFSET = STUD_W / 2 + CLAD_T / 2

// The deck runs off the front, which is the +z side.
const DECK_Z0 = HALF_D
const DECK_Z1 = HALF_D + 2.4
const DECK_X = 3.3
const DECK_Y = -0.08

const members: Member[] = []
const add = (m: Member) => members.push(m)

/* --- Openings ---------------------------------------------------------------
   Wall-local rectangles. `u` runs along the wall, `v` is height above the ground
   floor. Cladding is generated around these, which is what puts real windows and
   doors in the building rather than shapes stuck on the outside. */

type Rect = { u0: number; v0: number; u1: number; v1: number }

const FRONT_OPENINGS: Rect[] = [
  { u0: -1.5, v0: 0.06, u1: 1.5, v1: 2.32 }, // sliding doors to the deck
  { u0: -3.5, v0: 0.9, u1: -2.2, v1: 2.32 }, // ground window
  { u0: 2.2, v0: 0.9, u1: 3.5, v1: 2.32 },
  { u0: -1.6, v0: UPPER_Y + 0.75, u1: 1.6, v1: UPPER_Y + 2.05 }, // upper glazing
  { u0: -3.4, v0: UPPER_Y + 0.85, u1: -2.4, v1: UPPER_Y + 2.05 },
  { u0: 2.4, v0: UPPER_Y + 0.85, u1: 3.4, v1: UPPER_Y + 2.05 },
]

const BACK_OPENINGS: Rect[] = [
  { u0: -2.6, v0: 1.0, u1: -1.2, v1: 2.2 },
  { u0: 1.4, v0: 0.06, u1: 2.35, v1: 2.15 }, // back door
  { u0: -0.7, v0: UPPER_Y + 0.85, u1: 0.9, v1: UPPER_Y + 2.0 },
]

const LEFT_OPENINGS: Rect[] = [
  { u0: -1.1, v0: 0.95, u1: 0.1, v1: 2.25 },
  { u0: -0.7, v0: UPPER_Y + 0.85, u1: 0.5, v1: UPPER_Y + 2.0 },
]

const RIGHT_OPENINGS: Rect[] = [
  { u0: -0.7, v0: 0.95, u1: 0.7, v1: 2.25 },
  { u0: -0.6, v0: UPPER_Y + 0.9, u1: 0.6, v1: UPPER_Y + 2.0 },
]

/**
 * Splits a wall into board-height strips that stop short of every opening.
 * A guillotine subtraction: bands by height, then spans across each band.
 */
function claddingRects(wall: Rect, openings: Rect[]): Rect[] {
  const out: Rect[] = []
  for (let v = wall.v0; v < wall.v1 - 1e-6; v += BOARD) {
    const vTop = Math.min(v + BOARD * 0.94, wall.v1)
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
function panel(plane: Plane, r: Rect, thickness: number, offset: number, mat: MaterialKey, at: number, stage: 0 | 1 | 2 | 3) {
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
 * A point in one roof plane's own frame: `along` runs up the slope from the
 * rafter's centre, `up` sits above its top face.
 *
 * A member lying along its local z, rotated about x by `a`, maps local
 * (0, up, along) to (up·cos a - along·sin a, up·sin a + along·cos a). Writing
 * that out by hand is how battens ended up flying off past the eaves twice.
 */
function onRoof(side: -1 | 1, along: number, up: number): [number, number, number] {
  const ca = Math.cos(PITCH)
  const sa = side < 0 ? -Math.sin(PITCH) : Math.sin(PITCH)
  return [
    0,
    WALL_TOP + PITCH_RISE / 2 + up * ca - along * sa,
    (side * HALF_D) / 2 + up * sa + along * ca,
  ]
}

/** Rotation for a member lying in one roof plane. */
const roofTilt = (side: -1 | 1) => (side < 0 ? -PITCH : PITCH)

/** The eave overhangs at the bottom of the slope only, never past the ridge. */
const EAVE_SHIFT = -EAVE / 2

/* --- Stage 0. Substructure and floor --------------------------------------- */

for (let i = 0; i < 4; i++) {
  add({
    p: [0, -0.34, -HALF_D + (i * DEPTH) / 3],
    s: [LENGTH, 0.19, 0.14],
    rx: 0,
    at: 0.004 + i * 0.016,
    stage: 0,
    mat: 'frame',
  })
}

const joistCount = Math.round(LENGTH / 0.6)
for (let i = 0; i <= joistCount; i++) {
  add({
    p: [-HALF_L + (i * LENGTH) / joistCount, -0.11, 0],
    s: [0.045, 0.15, DEPTH],
    rx: 0,
    at: 0.055 + (i / joistCount) * 0.05,
    stage: 0,
    mat: 'frame',
  })
}

// Deck posts and bearers, off the front.
for (let i = 0; i < 4; i++) {
  const x = -DECK_X + (i * DECK_X * 2) / 3
  for (const z of [DECK_Z0 + 0.3, DECK_Z1 - 0.25]) {
    add({
      p: [x, DECK_Y - 0.55, z],
      s: [0.11, 1.1, 0.11],
      rx: 0,
      at: 0.02 + i * 0.012,
      stage: 0,
      mat: 'frame',
      outer: true,
    })
  }
}
for (const z of [DECK_Z0 + 0.3, DECK_Z1 - 0.25]) {
  add({
    p: [0, DECK_Y - 0.14, z],
    s: [DECK_X * 2 + 0.3, 0.17, 0.09],
    rx: 0,
    at: 0.1,
    stage: 0,
    mat: 'frame',
    outer: true,
  })
}

/* --- Stage 1. Walls, upper floor, upper walls ------------------------------- */

const wallStages: { y0: number; height: number; at0: number; at1: number }[] = [
  { y0: 0, height: GROUND_H, at0: 0.15, at1: 0.29 },
  { y0: UPPER_Y, height: UPPER_H, at0: 0.34, at1: 0.47 },
]

for (const level of wallStages) {
  const plateY = level.y0 + PLATE / 2
  const studY = level.y0 + PLATE + level.height / 2
  const topY = level.y0 + PLATE + level.height + STUD_W / 2
  const spread = level.at1 - level.at0

  for (const z of [-HALF_D, HALF_D]) {
    add({ p: [0, plateY, z], s: [LENGTH, PLATE, STUD_W], rx: 0, at: level.at0, stage: 1, mat: 'frame' })
    add({ p: [0, topY, z], s: [LENGTH, STUD_W, STUD_W], rx: 0, at: level.at1, stage: 1, mat: 'frame' })
  }
  for (const x of [-HALF_L, HALF_L]) {
    add({ p: [x, plateY, 0], s: [STUD_W, PLATE, DEPTH], rx: 0, at: level.at0, stage: 1, mat: 'frame' })
    add({ p: [x, topY, 0], s: [STUD_W, STUD_W, DEPTH], rx: 0, at: level.at1, stage: 1, mat: 'frame' })
  }

  const studs = Math.round(LENGTH / 0.8)
  for (let i = 0; i <= studs; i++) {
    const x = -HALF_L + (i * LENGTH) / studs
    for (const z of [-HALF_D, HALF_D]) {
      add({
        p: [x, studY, z],
        s: [STUD, level.height, STUD_W],
        rx: 0,
        at: level.at0 + 0.02 + (i / studs) * spread * 0.6,
        stage: 1,
        mat: 'frame',
      })
    }
  }

  const endStuds = Math.round(DEPTH / 0.8)
  for (const x of [-HALF_L, HALF_L]) {
    for (let i = 1; i < endStuds; i++) {
      add({
        p: [x, studY, -HALF_D + (i * DEPTH) / endStuds],
        s: [STUD_W, level.height, STUD],
        rx: 0,
        at: level.at0 + 0.05 + (i / endStuds) * spread * 0.5,
        stage: 1,
        mat: 'frame',
      })
    }
  }
}

// The floor between the two storeys.
const midCount = Math.round(LENGTH / 0.6)
for (let i = 0; i <= midCount; i++) {
  add({
    p: [-HALF_L + (i * LENGTH) / midCount, GROUND_H + MID_THICK / 2, 0],
    s: [0.045, 0.24, DEPTH],
    rx: 0,
    at: 0.3 + (i / midCount) * 0.035,
    stage: 1,
    mat: 'frame',
  })
}

/* --- Stage 2. The roof ------------------------------------------------------ */

const rafterCount = Math.round(LENGTH / 0.9)
for (let i = 0; i <= rafterCount; i++) {
  const x = -HALF_L + (i * LENGTH) / rafterCount
  for (const side of [-1, 1] as const) {
    const at = onRoof(side, EAVE_SHIFT, 0)
    add({
      p: [x, at[1], at[2]],
      s: [0.045, 0.19, RAFTER_LEN + EAVE],
      rx: roofTilt(side),
      at: 0.5 + (i / rafterCount) * 0.13 + (side > 0 ? 0.012 : 0),
      stage: 2,
      mat: 'frame',
    })
  }
}

add({ p: [0, APEX - 0.08, 0], s: [LENGTH, 0.24, 0.045], rx: 0, at: 0.65, stage: 2, mat: 'frame' })

for (let i = 0; i < 5; i++) {
  add({
    p: [-3.2 + i * 1.6, WALL_TOP + PITCH_RISE * 0.42, 0],
    s: [0.045, 0.09, DEPTH * 0.55],
    rx: 0,
    at: 0.67 + i * 0.008,
    stage: 2,
    mat: 'frame',
  })
}

/* --- Stage 3. The enclosure ------------------------------------------------- */

/** Where a wall's cladding stops: the top plate of the upper storey. */
const CLAD_TOP = WALL_TOP

const wallSpecs: { plane: Plane; openings: Rect[]; half: number; at0: number }[] = [
  { plane: 'front', openings: FRONT_OPENINGS, half: HALF_L, at0: 0.73 },
  { plane: 'back', openings: BACK_OPENINGS, half: HALF_L, at0: 0.75 },
  { plane: 'left', openings: LEFT_OPENINGS, half: HALF_D, at0: 0.78 },
  { plane: 'right', openings: RIGHT_OPENINGS, half: HALF_D, at0: 0.79 },
]

for (const spec of wallSpecs) {
  const rects = claddingRects(
    { u0: -spec.half, v0: -0.12, u1: spec.half, v1: CLAD_TOP },
    spec.openings,
  )
  rects.forEach((r, i) => {
    panel(spec.plane, r, CLAD_T, CLAD_W_OFFSET, 'clad', spec.at0 + (i / rects.length) * 0.1, 3)
  })

  // Each opening is framed and then glazed. The frame is four members around
  // the hole rather than one panel behind it: a filled panel, however thin,
  // sits in front of the glass on whichever side the camera is on and turns
  // every window into a black rectangle.
  spec.openings.forEach((o, i) => {
    const at = spec.at0 + 0.07 + i * 0.004
    const b = 0.07
    const frames: Rect[] = [
      { u0: o.u0 - b, v0: o.v1, u1: o.u1 + b, v1: o.v1 + b },
      { u0: o.u0 - b, v0: o.v0 - b, u1: o.u1 + b, v1: o.v0 },
      { u0: o.u0 - b, v0: o.v0, u1: o.u0, v1: o.v1 },
      { u0: o.u1, v0: o.v0, u1: o.u1 + b, v1: o.v1 },
    ]
    for (const f of frames) {
      panel(spec.plane, f, CLAD_T + 0.03, CLAD_W_OFFSET, 'roof', at, 3)
    }
    // Glazing sits back from the frame face, the way a window actually does.
    panel(spec.plane, o, 0.02, CLAD_W_OFFSET - 0.03, 'glass', at + 0.006, 3)
  })
}

// Gable ends, stepped so the boards follow the pitch.
for (const plane of ['left', 'right'] as Plane[]) {
  const rows = Math.ceil(PITCH_RISE / BOARD)
  for (let i = 0; i < rows; i++) {
    const v = CLAD_TOP + i * BOARD
    const t = (i * BOARD) / PITCH_RISE
    const halfWidth = HALF_D * (1 - t)
    if (halfWidth < 0.12) continue
    panel(
      plane,
      { u0: -halfWidth, v0: v, u1: halfWidth, v1: Math.min(v + BOARD * 0.94, APEX) },
      CLAD_T,
      CLAD_W_OFFSET,
      'clad',
      0.8 + (i / rows) * 0.05,
      3,
    )
  }
}


for (const side of [-1, 1] as const) {
  for (let i = 0; i < 4; i++) {
    const along = EAVE_SHIFT + (i / 3 - 0.5) * (RAFTER_LEN + EAVE) * 0.82
    add({
      p: onRoof(side, along, 0.12),
      s: [LENGTH + EAVE * 1.5, 0.035, 0.07],
      rx: roofTilt(side),
      at: 0.84 + i * 0.012,
      stage: 3,
      mat: 'frame',
      outer: true,
    })
  }
  add({
    p: onRoof(side, EAVE_SHIFT, 0.17),
    s: [LENGTH + EAVE * 1.7, 0.03, RAFTER_LEN + EAVE],
    rx: roofTilt(side),
    at: 0.9 + (side > 0 ? 0.02 : 0),
    stage: 3,
    mat: 'roof',
    outer: true,
  })
}

// Ridge capping.
add({
  p: [0, APEX + 0.12, 0],
  s: [LENGTH + EAVE * 1.8, 0.06, 0.22],
  rx: 0,
  at: 0.94,
  stage: 3,
  mat: 'roof',
  outer: true,
})

/* --- The deck ---------------------------------------------------------------
   The terrace off the front, its balustrade, and the balcony above it. */

const deckBoards = Math.round((DECK_Z1 - DECK_Z0) / 0.16)
for (let i = 0; i < deckBoards; i++) {
  add({
    p: [0, DECK_Y, DECK_Z0 + 0.08 + i * 0.16],
    s: [DECK_X * 2, 0.032, 0.14],
    rx: 0,
    at: 0.76 + (i / deckBoards) * 0.06,
    stage: 3,
    mat: 'deck',
    outer: true,
  })
}

// Balustrade: posts and horizontal rails, which is the modern detail and also
// a tenth of the members a picket run would need.
for (const x of [-DECK_X, -1.1, 1.1, DECK_X]) {
  add({
    p: [x, DECK_Y + 0.5, DECK_Z1 - 0.06],
    s: [0.08, 1.0, 0.08],
    rx: 0,
    at: 0.85,
    stage: 3,
    mat: 'deck',
    outer: true,
  })
}
for (let i = 0; i < 3; i++) {
  add({
    p: [0, DECK_Y + 0.3 + i * 0.32, DECK_Z1 - 0.06],
    s: [DECK_X * 2, 0.07, 0.055],
    rx: 0,
    at: 0.87 + i * 0.008,
    stage: 3,
    mat: 'deck',
    outer: true,
  })
}
for (const x of [-DECK_X, DECK_X]) {
  for (let i = 0; i < 3; i++) {
    add({
      p: [x, DECK_Y + 0.3 + i * 0.32, (DECK_Z0 + DECK_Z1) / 2 + 0.2],
      s: [0.07, 0.07, DECK_Z1 - DECK_Z0 - 0.4],
      rx: 0,
      at: 0.88 + i * 0.006,
      stage: 3,
      mat: 'deck',
      outer: true,
    })
  }
}

// An upper balcony was tried here and removed. Seen down the axonometric it
// crossed the front elevation and read as a rail floating in mid-air rather than
// as a balcony. The deck below already answers for the terrace.

// Two lights under the eave over the deck. Small, and the only reason they are
// here is that a house at dusk with nothing lit reads as empty.
for (const x of [-2.2, 2.2]) {
  add({
    p: [x, GROUND_H + 0.05, HALF_D + 0.12],
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
  height: APEX,
  deckZ: DECK_Z1,
  centreY: APEX / 2 - 0.2,
}

/**
 * Where each named stage begins, as a fraction of the section's pinned scroll.
 * These line up with the `at` values above.
 */
export const FRAME_STAGE_STARTS = [0, 0.14, 0.48, 0.72] as const

export const FRAME_STAGES = [
  { label: 'Drawings', note: 'Set out from the architect’s documents.' },
  { label: 'Frame', note: 'Floor, walls and the storey above. Everything square.' },
  { label: 'Roof', note: 'Rafters to the ridge and the building is closed in.' },
  { label: 'Finish', note: 'Cladding, glazing, the deck and the detail that gets looked at.' },
] as const
