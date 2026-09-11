/**
 * A Queenslander with a contemporary extension on the back.
 *
 * This is the object in the hero, and it is the whole proposition of the
 * business in one shape: the original cottage kept at the street — stumps,
 * weatherboards, gable, verandah, lights on — and behind it a new wing in dark
 * charred timber and glass. Heritage homes, rebuilt.
 *
 * An earlier version left the new wing as line-work, on the idea that a drawing
 * behind a built house would say "drawn, then built". It read as unfinished
 * rather than as a drawing convention. The two halves now tell the same story
 * through material instead: warm boards at the front, dark boards behind, and
 * the join between them is the whole job.
 *
 * Units are metres. Sections are the ones a carpenter would order.
 */

import type { MaterialKey } from './materials'

export type Member = {
  /** Centre position [x, y, z], metres. */
  p: [number, number, number]
  /** Full size [w, h, d], metres. */
  s: [number, number, number]
  /** Rotation about the x axis. Skillions and the verandah roof use it. */
  rx: number
  /** Rotation about the z axis. The cottage roof slopes towards ±x. */
  rz?: number
  mat: MaterialKey
  /**
   * Surface detail: roof corrugations, and anything else that is a texture on
   * another member rather than a part of the building.
   *
   * The live scene draws these — they are most of why the object reads as sheet
   * metal. The flat still skips them. A painter's algorithm cannot order six
   * hundred thin bars that sit a couple of centimetres off a surface: they share
   * a depth with the sheet they lie on and with everything the sheet passes, so
   * they surface through walls, posts and each other. In the still they cost
   * more than they give.
   */
  detail?: boolean
}

/* --- Setting out ------------------------------------------------------------
   The street is the +z side. The cottage ridge runs front to back so the gable
   faces the street, which is the silhouette the mark is drawn from. */

const LEN = 7.0
const DEP = 4.8
const HALF_L = LEN / 2
const HALF_D = DEP / 2

const STUMP_H = 1.15
const FLOOR = STUMP_H + 0.34
const WALL_H = 2.7
const WALL_TOP = FLOOR + WALL_H

const PITCH_RISE = 1.5
const PITCH = Math.atan2(PITCH_RISE, HALF_L)
const RAFTER_LEN = Math.hypot(HALF_L, PITCH_RISE)
const APEX = WALL_TOP + PITCH_RISE
const EAVE = 0.42

const CLAD_T = 0.026
const BOARD = 0.23
const CLAD_OFF = 0.062

const VER_D = 2.0
const VER_Z0 = HALF_D
const VER_Z1 = HALF_D + VER_D

// The new wing, off the back.
const EXT_HALF_L = 2.6
const EXT_Z1 = -HALF_D + 0.05
const EXT_Z0 = -HALF_D - 3.2
const EXT_DEP = EXT_Z1 - EXT_Z0
const EXT_MID_Z = (EXT_Z0 + EXT_Z1) / 2
const EXT_HIGH = FLOOR + 2.62 // against the cottage, and below its eave
const EXT_LOW = FLOOR + 2.18 // at the far end
const EXT_FALL = Math.atan2(EXT_HIGH - EXT_LOW, EXT_DEP)

const members: Member[] = []
const add = (m: Member) => members.push(m)

type Rect = { u0: number; v0: number; u1: number; v1: number }
type Plane = 'front' | 'back' | 'left' | 'right'

/* --- Openings --------------------------------------------------------------- */

const COTTAGE_FRONT: Rect[] = [
  { u0: -0.52, v0: FLOOR + 0.02, u1: 0.52, v1: FLOOR + 2.16 }, // front door
  { u0: -2.62, v0: FLOOR + 0.78, u1: -1.22, v1: FLOOR + 2.16 },
  { u0: 1.22, v0: FLOOR + 0.78, u1: 2.62, v1: FLOOR + 2.16 },
]

const COTTAGE_SIDE: Rect[] = [
  { u0: -1.62, v0: FLOOR + 0.82, u1: -0.52, v1: FLOOR + 2.12 },
  { u0: 0.52, v0: FLOOR + 0.82, u1: 1.62, v1: FLOOR + 2.12 },
]

const EXT_BACK: Rect[] = [
  { u0: -1.85, v0: FLOOR + 0.04, u1: 1.85, v1: FLOOR + 2.02 }, // glazed wall
]

const EXT_SIDE: Rect[] = [
  { u0: -0.9, v0: FLOOR + 1.05, u1: 0.9, v1: FLOOR + 2.0 }, // high window
]

/**
 * Splits a wall into cladding strips that stop short of every opening.
 *
 * `vertical` swaps the roles of the two axes, which is how the cottage gets
 * horizontal weatherboards and the extension gets vertical boards out of the
 * same routine. The contrast between the two is doing real work here.
 */
function claddingStrips(
  wall: Rect,
  openings: Rect[],
  step: number,
  vertical: boolean,
): Rect[] {
  const swap = (r: Rect): Rect =>
    vertical ? { u0: r.v0, v0: r.u0, u1: r.v1, v1: r.u1 } : r

  const out: Rect[] = []
  const w = swap(wall)
  const holes = openings.map(swap)

  for (let v = w.v0; v < w.v1 - 1e-6; v += step) {
    const vTop = Math.min(v + step * 0.93, w.v1)

    const blocking = holes
      .filter((o) => o.v1 > v + 1e-6 && o.v0 < vTop - 1e-6)
      .map((o) => ({ ...o, u0: Math.max(o.u0, w.u0), u1: Math.min(o.u1, w.u1) }))
      .sort((a, b) => a.u0 - b.u0)

    let u = w.u0
    for (const o of blocking) {
      if (o.u0 > u + 0.02) out.push(swap({ u0: u, v0: v, u1: o.u0, v1: vTop }))

      /* A course that merely clips an opening still runs across it, ripped to
         fit — under the sill, over the head, or both. Dropping the whole course
         wherever it touched an opening left a band of bare wall under every
         window, one course tall, which is exactly what a builder would never
         leave and what the backing behind it made look like a hole. */
      const start = Math.max(o.u0, u)
      if (o.v0 > v + 0.02) {
        out.push(swap({ u0: start, v0: v, u1: o.u1, v1: Math.min(o.v0, vTop) }))
      }
      if (o.v1 < vTop - 0.02) {
        out.push(swap({ u0: start, v0: Math.max(o.v1, v), u1: o.u1, v1: vTop }))
      }

      u = Math.max(u, o.u1)
    }
    if (u < w.u1 - 0.02) out.push(swap({ u0: u, v0: v, u1: w.u1, v1: vTop }))
  }
  return out
}

/**
 * Covers a wall exactly, leaving its openings clear.
 *
 * This is what goes behind the cladding. The boards are deliberately gapped so
 * they read as boards, and with nothing behind them every gap looked straight
 * through the building to the background — along every course, down the corner
 * joints, and worst of all as a bright band under each window sill, where a
 * course that merely touched the sill was cut away across the whole opening.
 *
 * Bands are cut at the openings' own edges rather than on the board pitch, so
 * the cover is exact however the two happen to line up.
 */
function backingPanels(wall: Rect, openings: Rect[]): Rect[] {
  const cuts = new Set<number>([wall.v0, wall.v1])
  for (const o of openings) {
    if (o.v0 > wall.v0 && o.v0 < wall.v1) cuts.add(o.v0)
    if (o.v1 > wall.v0 && o.v1 < wall.v1) cuts.add(o.v1)
  }
  const rows = [...cuts].sort((a, b) => a - b)

  const out: Rect[] = []
  for (let i = 0; i < rows.length - 1; i++) {
    const v0 = rows[i]
    const v1 = rows[i + 1]
    if (v1 - v0 < 1e-4) continue

    const mid = (v0 + v1) / 2
    const spans = openings
      .filter((o) => o.v0 <= mid && o.v1 >= mid)
      .map((o): [number, number] => [Math.max(o.u0, wall.u0), Math.min(o.u1, wall.u1)])
      .sort((a, b) => a[0] - b[0])

    let u = wall.u0
    for (const [span0, span1] of spans) {
      if (span0 > u + 0.005) out.push({ u0: u, v0, u1: span0, v1 })
      u = Math.max(u, span1)
    }
    if (u < wall.u1 - 0.005) out.push({ u0: u, v0, u1: wall.u1, v1 })
  }
  return out
}

/** Thickness and inset of that backing, sized to meet the boards in front. */
const BACK_T = 0.09
const BACK_OFF = 0.012

/** Places a wall-local rectangle on a wall of a box footprint. */
function panelOn(
  plane: Plane,
  halfX: number,
  halfZ: number,
  midZ: number,
  r: Rect,
  thickness: number,
  offset: number,
  mat: MaterialKey,
) {
  const u = (r.u0 + r.u1) / 2
  const v = (r.v0 + r.v1) / 2
  const uw = Math.max(r.u1 - r.u0, 0.008)
  const vh = Math.max(r.v1 - r.v0, 0.008)

  if (plane === 'front' || plane === 'back') {
    const z = plane === 'front' ? midZ + halfZ + offset : midZ - halfZ - offset
    add({ p: [u, v, z], s: [uw, vh, thickness], rx: 0, mat })
  } else {
    const x = plane === 'right' ? halfX + offset : -halfX - offset
    add({ p: [x, v, u + midZ], s: [thickness, vh, uw], rx: 0, mat })
  }
}

/** Frames an opening, glazes it, and puts a mullion in anything wide. */
function glazeOn(plane: Plane, halfX: number, halfZ: number, midZ: number, o: Rect) {
  const b = 0.075
  const frames: Rect[] = [
    { u0: o.u0 - b, v0: o.v1, u1: o.u1 + b, v1: o.v1 + b },
    { u0: o.u0 - b, v0: o.v0 - b, u1: o.u1 + b, v1: o.v0 },
    { u0: o.u0 - b, v0: o.v0, u1: o.u0, v1: o.v1 },
    { u0: o.u1, v0: o.v0, u1: o.u1 + b, v1: o.v1 },
  ]
  for (const f of frames) {
    panelOn(plane, halfX, halfZ, midZ, f, CLAD_T + 0.032, CLAD_OFF, 'roof')
  }
  panelOn(plane, halfX, halfZ, midZ, o, 0.02, CLAD_OFF - 0.032, 'glass')

  // Mullions. A window without one reads as a hole with a light behind it.
  const width = o.u1 - o.u0
  const bars = width > 2.6 ? 3 : width > 1.15 ? 1 : 0
  for (let i = 1; i <= bars; i++) {
    const u = o.u0 + (width * i) / (bars + 1)
    panelOn(
      plane,
      halfX,
      halfZ,
      midZ,
      { u0: u - 0.028, v0: o.v0, u1: u + 0.028, v1: o.v1 },
      CLAD_T + 0.026,
      CLAD_OFF,
      'roof',
    )
  }
}

/* --- Under the cottage ------------------------------------------------------
   High-set on stumps, which is the most Queenslander thing about it and the
   reason the verandah reads from the street. */

for (const x of [-HALF_L + 0.45, -1.1, 1.1, HALF_L - 0.45]) {
  for (const z of [-HALF_D + 0.45, 0, HALF_D - 0.45]) {
    add({ p: [x, STUMP_H / 2, z], s: [0.17, STUMP_H, 0.17], rx: 0, mat: 'frame' })
  }
}
for (const z of [-HALF_D + 0.45, 0, HALF_D - 0.45]) {
  add({ p: [0, STUMP_H + 0.11, z], s: [LEN, 0.21, 0.13], rx: 0, mat: 'frame' })
}
const joists = Math.round(LEN / 0.6)
for (let i = 0; i <= joists; i++) {
  add({
    p: [-HALF_L + (i * LEN) / joists, STUMP_H + 0.29, 0],
    s: [0.05, 0.16, DEP],
    rx: 0,
    mat: 'frame',
  })
}

/* --- Cottage weatherboards -------------------------------------------------- */

const cottageWalls: { plane: Plane; half: number; openings: Rect[] }[] = [
  { plane: 'front', half: HALF_L, openings: COTTAGE_FRONT },
  { plane: 'back', half: HALF_L, openings: [] },
  { plane: 'left', half: HALF_D, openings: COTTAGE_SIDE },
  { plane: 'right', half: HALF_D, openings: COTTAGE_SIDE },
]

for (const wall of cottageWalls) {
  const face: Rect = { u0: -wall.half, v0: FLOOR - 0.32, u1: wall.half, v1: WALL_TOP }

  for (const r of backingPanels(face, wall.openings)) {
    panelOn(wall.plane, HALF_L, HALF_D, 0, r, BACK_T, BACK_OFF, 'shadow')
  }

  for (const r of claddingStrips(face, wall.openings, BOARD, false)) {
    panelOn(wall.plane, HALF_L, HALF_D, 0, r, CLAD_T, CLAD_OFF, 'clad')
  }

  for (const o of wall.openings) glazeOn(wall.plane, HALF_L, HALF_D, 0, o)
}

/* Corner boards. Two cladding planes meeting at a corner leave a notch the
   width of their own stand-off; this is the trim that closes it, and every
   weatherboard house has one. */
for (const sx of [-1, 1] as const) {
  for (const sz of [-1, 1] as const) {
    add({
      p: [sx * (HALF_L + 0.04), (FLOOR - 0.32 + WALL_TOP) / 2, sz * (HALF_D + 0.04)],
      s: [0.13, WALL_TOP - FLOOR + 0.32, 0.13],
      rx: 0,
      mat: 'clad',
    })
  }
}

/* Gable infill: vertical boards, not the weatherboard of the walls below.

   That is a real Queenslander detail, and it is also the only way rectangles
   follow a rake cleanly — a vertical board simply stops where the roof line is,
   so the error along the pitch is one board's WIDTH. Horizontal courses got it
   the other way round: each course was cut to the width of its own bottom edge
   and then stood 0.21 taller, which at this pitch overshoots the rake by half a
   metre. Every course sawtoothed out through the roof sheet, which is the row
   of tan wedges that used to step down both sides of the roof. */
const GABLE_STEP = 0.155
for (const plane of ['front', 'back'] as Plane[]) {
  const cols = Math.ceil((HALF_L * 2) / GABLE_STEP)
  for (let i = 0; i < cols; i++) {
    const u0 = -HALF_L + i * GABLE_STEP
    const u1 = Math.min(u0 + GABLE_STEP * 0.94, HALF_L)
    /* Cut to the roof line above whichever edge is further out, so no board can
       rise through the sheet.

       The step this leaves — each board stopping short of the rake by the rise
       across its own width — is nominally closed by the barge board. It is not.
       The barge sits under an eave that oversails it by more than a board's
       width, so from any view above the gutter line it is not on the drawing at
       all, which was worth finding out before trying to fix the rake with it.
       Cutting at each board's midpoint instead halves the step and changes
       nothing you can see at the size this is drawn. */
    const outer = Math.max(Math.abs(u0), Math.abs(u1))
    const v1 = WALL_TOP + PITCH_RISE * (1 - outer / HALF_L)
    if (v1 - WALL_TOP < 0.05) continue

    // Behind first, at the full step width so the joints between boards close.
    const back = Math.min(u0 + GABLE_STEP, HALF_L)
    panelOn(plane, HALF_L, HALF_D, 0, { u0, v0: WALL_TOP - 0.06, u1: back, v1 }, BACK_T, BACK_OFF, 'shadow')
    panelOn(plane, HALF_L, HALF_D, 0, { u0, v0: WALL_TOP - 0.03, u1, v1 }, CLAD_T, CLAD_OFF, 'clad')
  }
}

/* --- Cottage roof ----------------------------------------------------------- */

/** A point in one roof plane's frame: `along` runs up the slope, `up` above it. */
function onRoof(side: -1 | 1, along: number, up: number): [number, number, number] {
  const ca = Math.cos(PITCH)
  const sa = side < 0 ? -Math.sin(PITCH) : Math.sin(PITCH)
  // The two slopes mirror each other, so up-slope is +z in world terms on one
  // and -z on the other. Without this the right-hand sheet, its corrugations
  // and its fascia all measured down-slope backwards and ended up pasted along
  // the ridge instead of hanging at the eave.
  const run = side < 0 ? along : -along
  return [
    (side * HALF_L) / 2 + up * sa + run * ca,
    WALL_TOP + PITCH_RISE / 2 + up * ca - run * sa,
    0,
  ]
}

const roofTilt = (side: -1 | 1) => (side < 0 ? PITCH : -PITCH)
const ROOF_SHIFT = -EAVE / 2
const ROOF_RUN = DEP + EAVE * 1.7

/* Sheet cover, and the reason this roof is laid in sheets at all.

   It used to be one slab per side, seven metres of it, and in the flat drawing
   that slab could not be sorted. The still paints whole members back to front
   by their centres, and a seven metre board has no meaningful centre: the
   gable end wall standing at the near end of it has a centre far nearer the
   eye, so the wall painted last — over the top of the roof that overhangs it.
   That is the pale timber triangle that sat on the dark roof, and it put the
   verandah roof through the gable as well.

   Cutting the slab into sheets fixes it because each sheet's centre is its
   own: the ones that overhang the gable sort in front of the wall and the ones
   behind it sort behind. It is also simply how a roof is covered — sheets run
   up the slope and lie side by side along the ridge — so the joints the drawing
   now shows are joints that are really there. */
const SHEET_W = 0.762

for (const side of [-1, 1] as const) {
  const bed = onRoof(side, ROOF_SHIFT, 0)
  const sheets = Math.max(2, Math.round(ROOF_RUN / SHEET_W))
  const sheetW = ROOF_RUN / sheets

  for (let i = 0; i < sheets; i++) {
    add({
      // rz turns the sheet about z, so a shift along z needs no rotating.
      p: [bed[0], bed[1], -ROOF_RUN / 2 + (i + 0.5) * sheetW],
      s: [RAFTER_LEN + EAVE, 0.03, sheetW],
      rx: 0,
      rz: roofTilt(side),
      mat: 'roof',
    })
  }

  // Corrugations. Every Australian roof has them, and nothing says sheet metal
  // faster — which is most of why this object reads as a house at all.
  const seat = onRoof(side, ROOF_SHIFT, 0.027)
  const ribs = Math.round(ROOF_RUN / 0.26)
  for (let i = 0; i <= ribs; i++) {
    add({
      p: [seat[0], seat[1], -ROOF_RUN / 2 + (i * ROOF_RUN) / ribs],
      s: [RAFTER_LEN + EAVE, 0.026, 0.05],
      rx: 0,
      rz: roofTilt(side),
      mat: 'roof',
      detail: true,
    })
  }

  // Fascia and gutter at the eave.
  const eave = onRoof(side, -(RAFTER_LEN + EAVE) / 2 + 0.05, -0.05)
  add({ p: [eave[0], eave[1] - 0.1, 0], s: [0.05, 0.22, ROOF_RUN], rx: 0, mat: 'clad' })
  add({
    p: [eave[0] + side * 0.07, eave[1] - 0.24, 0],
    s: [0.12, 0.11, ROOF_RUN],
    rx: 0,
    mat: 'roof',
  })
}

add({ p: [0, APEX + 0.05, 0], s: [0.26, 0.07, DEP + EAVE * 1.8], rx: 0, mat: 'roof' })

/* Barge boards. Every gable has one, and here it also closes the shallow step
   left where the vertical infill is cut to the rake. Set outside the cladding
   and inside the roof's overhang, so it reads as trim rather than structure. */
for (const side of [-1, 1] as const) {
  const seat = onRoof(side, ROOF_SHIFT, -0.08)
  for (const z of [HALF_D + 0.075, -(HALF_D + 0.075)]) {
    add({
      p: [seat[0], seat[1], z],
      s: [RAFTER_LEN + EAVE, 0.15, 0.05],
      rx: 0,
      rz: roofTilt(side),
      mat: 'clad',
    })
  }
}

/* --- Verandah --------------------------------------------------------------- */

/* Set out downwards from the deck surface, so every layer under it lands where
   the one above needs it. The verandah stumps used to be the same height as the
   cottage's and simply stopped 0.29 short of the boards, with nothing at all in
   between — no bearer, no joists, and daylight where the posts should have met
   the deck. */
const VER_POST_Z = VER_Z1 - 0.22
/* Post lines. They double as the ends of the balustrade bays, so the stair
   opening falls between the middle pair and the rails die into a post at every
   end — which is how a balustrade is actually built, and what the old full
   width rail runs could not do: they passed straight through the posts and left
   the balusters bunching against them. */
const VER_POST_X = [-3.26, -0.88, 0.88, 3.26]
const VER_DECK_Y = FLOOR - 0.05
const VER_BOARD_T = 0.036
const VER_JOIST_H = 0.16
const VER_BEARER_H = 0.21
const VER_JOIST_TOP = VER_DECK_Y - VER_BOARD_T / 2
const VER_BEARER_TOP = VER_JOIST_TOP - VER_JOIST_H
const VER_STUMP_TOP = VER_BEARER_TOP - VER_BEARER_H
const VER_DECK_TOP = VER_DECK_Y + 0.018

/* Decking. The gap between boards was 20mm, which at this size read as a stipple
   of daylight rather than as boards — you could see the ground through the
   floor. 8mm is what a chippy actually leaves. */
const VER_PITCH = 0.15
const verBoards = Math.round(VER_D / VER_PITCH)
for (let i = 0; i < verBoards; i++) {
  add({
    p: [0, VER_DECK_Y, VER_Z0 + VER_PITCH / 2 + i * VER_PITCH],
    s: [LEN - 0.24, VER_BOARD_T, VER_PITCH - 0.008],
    rx: 0,
    mat: 'deck',
  })
}

/* Joists across the verandah, on a bearer at the front and a ledger against the
   cottage. They run at right angles to the boards, which is the only way round
   that works and is what you would see through the gaps. */
const verJoists = Math.round(LEN / 0.6)
for (let i = 0; i <= verJoists; i++) {
  add({
    p: [-HALF_L + 0.12 + (i * (LEN - 0.24)) / verJoists, VER_JOIST_TOP - VER_JOIST_H / 2, (VER_Z0 + VER_Z1) / 2],
    s: [0.05, VER_JOIST_H, VER_D],
    rx: 0,
    mat: 'frame',
  })
}

// Bearer on the posts at the front, ledger bolted to the cottage at the back.
add({
  p: [0, VER_BEARER_TOP - VER_BEARER_H / 2, VER_POST_Z],
  s: [LEN, VER_BEARER_H, 0.13],
  rx: 0,
  mat: 'frame',
})
add({
  p: [0, VER_BEARER_TOP - VER_BEARER_H / 2, VER_Z0 + 0.07],
  s: [LEN, VER_BEARER_H, 0.1],
  rx: 0,
  mat: 'frame',
})

add({ p: [0, FLOOR - 0.19, VER_Z1 - 0.08], s: [LEN - 0.2, 0.22, 0.09], rx: 0, mat: 'clad' })

/* Verandah roof: a shallow skillion meeting the cottage just above the wall
   plate and falling towards the street. Both ends are named and the tilt is
   derived from them. Writing the angle in by hand is how this roof came to lean
   uphill, hanging 0.19 clear of the posts that were meant to be holding it up.

   Same sign rule as the extension: a plate rotated by rx sits at y = -z*tan(rx),
   so falling away towards +z needs a POSITIVE angle. */
const VER_ROOF_W = LEN + 0.28
const VER_ROOF_SPAN = VER_D + 0.55
const VER_ROOF_DROP = 0.36
const VER_FALL = Math.atan2(VER_ROOF_DROP, VER_D)
/** How far past the deck the sheet reaches at each end. */
const VER_OVERHANG = (VER_ROOF_SPAN - VER_D) / 2

/** Height of the cottage roof plane directly above a given x. */
const cottageRoofAt = (x: number) => WALL_TOP + PITCH_RISE * (1 - Math.abs(x) / HALF_L)

/* The verandah is at the gable end, so this sheet runs in underneath the
   cottage roof's overhang and has to clear it right across the width it spans.
   The main roof FALLS as |x| grows, which is the part that catches you out: the
   binding point is not the middle, it is this sheet's own outer corner at its
   highest end. Solved from that, not picked.

   Set by hand at WALL_TOP + 0.04 it cleared the middle comfortably and drove a
   0.36 wide wedge of verandah roof up through the main roof at both front
   corners — the green flap that showed above the eaves on either side. */
const VER_ROOF_HIGH =
  cottageRoofAt(VER_ROOF_W / 2) - 0.05 - VER_OVERHANG * Math.tan(VER_FALL)
const VER_ROOF_LOW = VER_ROOF_HIGH - VER_ROOF_DROP
const VER_ROOF_Z = (VER_Z0 + VER_Z1) / 2
const VER_ROOF_Y = (VER_ROOF_HIGH + VER_ROOF_LOW) / 2

/** Underside of the verandah sheet at a given z — what the posts have to meet. */
const verSoffit = (z: number) => VER_ROOF_Y - (z - VER_ROOF_Z) * Math.tan(VER_FALL) - 0.014

const VER_POST_H = verSoffit(VER_POST_Z) - VER_DECK_TOP

for (const x of VER_POST_X) {
  // Stump to the bearer, then the post proper from the deck surface up.
  add({
    p: [x, VER_STUMP_TOP / 2, VER_POST_Z],
    s: [0.17, VER_STUMP_TOP, 0.17],
    rx: 0,
    mat: 'frame',
  })
  add({
    p: [x, VER_DECK_TOP + VER_POST_H / 2, VER_POST_Z],
    s: [0.115, VER_POST_H, 0.115],
    rx: 0,
    mat: 'deck',
  })
  // Brackets: the detail that makes a verandah look like a verandah.
  add({
    p: [x, VER_DECK_TOP + VER_POST_H - 0.16, VER_POST_Z],
    s: [0.44, 0.15, 0.05],
    rx: 0,
    mat: 'deck',
  })
}

/* One bay of balustrade, running between two posts along either axis. */
const RAIL_TOP = 0.92
const RAIL_BOT = 0.46

function balustrade(a: number, b: number, along: 'x' | 'z', at: number) {
  const width = Math.abs(b - a)
  if (width < 0.14) return
  const mid = (a + b) / 2

  const put = (u: number, y: number, len: number, h: number, t: number) =>
    add({
      p: along === 'x' ? [u, y, at] : [at, y, u],
      s: along === 'x' ? [len, h, t] : [t, h, len],
      rx: 0,
      mat: 'deck',
    })

  put(mid, VER_DECK_TOP + RAIL_TOP, width, 0.085, 0.075)
  put(mid, VER_DECK_TOP + RAIL_BOT, width, 0.05, 0.05)

  const gaps = Math.max(Math.round(width / 0.135), 2)
  for (let i = 1; i < gaps; i++) {
    put(
      a + ((b - a) * i) / gaps,
      VER_DECK_TOP + (RAIL_TOP + RAIL_BOT) / 2,
      0.032,
      RAIL_TOP - RAIL_BOT,
      0.032,
    )
  }
}

// Along the front, in the bays either side of the steps.
balustrade(VER_POST_X[0], VER_POST_X[1], 'x', VER_POST_Z)
balustrade(VER_POST_X[2], VER_POST_X[3], 'x', VER_POST_Z)

// And returning down both ends, back to the cottage wall.
for (const x of [VER_POST_X[0], VER_POST_X[3]]) {
  balustrade(VER_Z0 + 0.1, VER_POST_Z, 'z', x)
}

add({
  p: [0, VER_ROOF_Y, VER_ROOF_Z],
  s: [VER_ROOF_W, 0.028, VER_ROOF_SPAN],
  rx: VER_FALL,
  mat: 'roof',
})
const verRibs = Math.round(VER_ROOF_W / 0.26)
for (let i = 0; i <= verRibs; i++) {
  add({
    p: [-VER_ROOF_W / 2 + (i * VER_ROOF_W) / verRibs, VER_ROOF_Y + 0.025, VER_ROOF_Z],
    s: [0.05, 0.024, VER_ROOF_SPAN],
    rx: VER_FALL,
    mat: 'roof',
    detail: true,
  })
}
// Fascia, hung off the sheet's own lower edge rather than at a guessed height.
const VER_EDGE_Z = VER_ROOF_Z + (VER_ROOF_SPAN / 2) * Math.cos(VER_FALL)
add({
  p: [0, verSoffit(VER_EDGE_Z) - 0.08, VER_EDGE_Z + 0.03],
  s: [LEN + 0.32, 0.18, 0.05],
  rx: 0,
  mat: 'clad',
})

/* Front steps. They have to reach the ground: the three treads that were here
   stopped 0.71 short and hung in the air with nothing under them. A real flight
   is treads carried on two raking stringers, bottom tread down on the dirt. */
const STAIR_W = 1.55
const STAIR_TOP = FLOOR - 0.03
const STAIR_STEPS = 8
const STAIR_RISE = STAIR_TOP / STAIR_STEPS
const STAIR_GOING = 0.27
const STAIR_Z0 = VER_Z1 + 0.06

for (let i = 1; i <= STAIR_STEPS; i++) {
  add({
    p: [0, STAIR_TOP - i * STAIR_RISE - 0.03, STAIR_Z0 + (i - 0.5) * STAIR_GOING],
    s: [STAIR_W, 0.06, STAIR_GOING + 0.03],
    rx: 0,
    mat: 'deck',
  })
}

/* Stringers, running the full flight.

   A raking board cannot meet the deck at one end and the ground at the other
   with both ends cut square — one corner always overshoots. Cutting them a
   going short avoided that and left the bottom tread stranded on its own, with
   daylight between it and the rest of the flight. So they run the whole way
   instead and their bottom corner beds into the ground by exactly as much as
   the bottom tread does, which reads as the pair of them going into the dirt.
   The top runs a little past the deck, which is what a string does where it
   meets a newel. */
const STAIR_RUN = STAIR_STEPS * STAIR_GOING
const STAIR_PITCH = Math.atan2(STAIR_TOP, STAIR_RUN)
const STRING_LEN = Math.hypot(STAIR_RUN, STAIR_TOP)
const STRING_T = 0.24
/** How far the raked board reaches vertically from its own centre. */
const STRING_HY =
  (STRING_T / 2) * Math.cos(STAIR_PITCH) + (STRING_LEN / 2) * Math.sin(STAIR_PITCH)

for (const x of [-(STAIR_W / 2 - 0.05), STAIR_W / 2 - 0.05]) {
  add({
    p: [x, STRING_HY - 0.06, STAIR_Z0 + STAIR_RUN / 2],
    s: [0.05, STRING_T, STRING_LEN],
    rx: STAIR_PITCH,
    mat: 'deck',
  })
}

/* --- The extension ----------------------------------------------------------
   Dark charred boards, run vertically, and a wall of glass at the far end. The
   contrast with the weatherboards at the front is the point of the object. */

for (const x of [-EXT_HALF_L + 0.4, 0, EXT_HALF_L - 0.4]) {
  for (const z of [EXT_Z0 + 0.4, EXT_Z1 - 0.4]) {
    add({ p: [x, STUMP_H / 2, z], s: [0.15, STUMP_H, 0.15], rx: 0, mat: 'frame' })
  }
}
for (const z of [EXT_Z0 + 0.4, EXT_Z1 - 0.4]) {
  add({ p: [0, STUMP_H + 0.11, z], s: [EXT_HALF_L * 2, 0.19, 0.12], rx: 0, mat: 'frame' })
}

/* The extension's two open corners get the same trim as the cottage's. The
   other two run into the cottage wall and need none. */
for (const sx of [-1, 1] as const) {
  add({
    p: [sx * (EXT_HALF_L + 0.04), (FLOOR - 0.3 + EXT_LOW) / 2, EXT_Z0 + 0.04],
    s: [0.13, EXT_LOW - FLOOR + 0.3, 0.13],
    rx: 0,
    mat: 'charred',
  })
}

/* Skillion roof, falling away from the cottage.

   EXT_HIGH sits at EXT_Z1 (+z, against the cottage) and EXT_LOW at EXT_Z0, so
   the sheet has to rise towards +z. A positive rx does the opposite: a plate
   rotated by rx sits at y = -z*tan(rx), so rising towards +z needs a NEGATIVE
   angle. Written as +EXT_FALL this roof buried its high end 0.38 in the cottage
   wall and left the low end floating 0.54 above the wall it was meant to sit on.

   Declared before the walls, because the walls are cut to fit under it. */
const EXT_TILT = -EXT_FALL
const EXT_ROOF_Y = (EXT_HIGH + EXT_LOW) / 2 + 0.08

/** Underside of the extension sheet at a given z. */
const extSoffit = (z: number) => EXT_ROOF_Y - (z - EXT_MID_Z) * Math.tan(EXT_TILT) - 0.02

const extWalls: {
  plane: Plane
  half: number
  openings: Rect[]
  top: number
  /** True where the wall runs under the fall and has to be cut to it. */
  raked?: boolean
}[] = [
  { plane: 'back', half: EXT_HALF_L, openings: EXT_BACK, top: EXT_LOW },
  { plane: 'left', half: EXT_DEP / 2, openings: EXT_SIDE, top: EXT_HIGH, raked: true },
  { plane: 'right', half: EXT_DEP / 2, openings: EXT_SIDE, top: EXT_HIGH, raked: true },
]

for (const wall of extWalls) {
  const face: Rect = { u0: -wall.half, v0: FLOOR - 0.3, u1: wall.half, v1: wall.top }
  const strips = claddingStrips(face, wall.openings, 0.2, true)
  /* Behind the boards, cut to the same rake. Charred rather than the cottage's
     shadow brown: on a near-black wall the gap between boards should read as
     the wall carrying on, not as a lighter line behind it. */
  for (const r of backingPanels(face, wall.openings)) {
    const top = wall.raked
      ? Math.min(r.v1, extSoffit(Math.min(r.u0, r.u1) + EXT_MID_Z))
      : r.v1
    if (top - r.v0 < 0.02) continue
    panelOn(
      wall.plane,
      EXT_HALF_L,
      EXT_DEP / 2,
      EXT_MID_Z,
      { ...r, v1: top },
      BACK_T,
      BACK_OFF,
      'charred',
    )
  }

  for (const r of strips) {
    /* The side walls run the length of a falling roof, so each board stops at
       the sheet above it. A flat top left them standing 0.2 proud at the low
       end — charred cladding poking up through the metal. Cut at the board's
       lower edge, since the sheet falls towards -z. */
    const top = wall.raked
      ? Math.min(r.v1, extSoffit(Math.min(r.u0, r.u1) + EXT_MID_Z))
      : r.v1
    if (top - r.v0 < 0.05) continue
    panelOn(
      wall.plane,
      EXT_HALF_L,
      EXT_DEP / 2,
      EXT_MID_Z,
      { ...r, v1: top },
      CLAD_T,
      CLAD_OFF,
      'charred',
    )
  }
  for (const o of wall.openings) {
    glazeOn(wall.plane, EXT_HALF_L, EXT_DEP / 2, EXT_MID_Z, o)
  }
}
add({
  p: [0, EXT_ROOF_Y, EXT_MID_Z],
  s: [EXT_HALF_L * 2 + 0.3, 0.03, EXT_DEP + 0.36],
  rx: EXT_TILT,
  mat: 'roof',
})
const extRibs = Math.round((EXT_HALF_L * 2 + 0.3) / 0.26)
for (let i = 0; i <= extRibs; i++) {
  add({
    p: [
      -(EXT_HALF_L * 2 + 0.3) / 2 + (i * (EXT_HALF_L * 2 + 0.3)) / extRibs,
      EXT_ROOF_Y + 0.026,
      EXT_MID_Z,
    ],
    s: [0.05, 0.024, EXT_DEP + 0.36],
    rx: EXT_TILT,
    mat: 'roof',
    detail: true,
  })
}
add({
  p: [0, EXT_LOW - 0.03, EXT_Z0 - 0.17],
  s: [EXT_HALF_L * 2 + 0.32, 0.18, 0.05],
  rx: 0,
  mat: 'charred',
})

export const HERITAGE_MEMBERS = members

/**
 * Measured from the members, not declared alongside them.
 *
 * Each member contributes its own axis-aligned half-extents, rotated where it
 * is rotated. An earlier version expanded every member by half its LONGEST side
 * on all three axes, which sounded safely conservative and was not: a seven
 * metre cladding board inflated the box by three and a half metres vertically,
 * and the camera pulled back to frame a volume mostly made of nothing.
 */
const bounds = (() => {
  const min: [number, number, number] = [Infinity, Infinity, Infinity]
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity]

  for (const m of members) {
    let [hx, hy, hz] = [m.s[0] / 2, m.s[1] / 2, m.s[2] / 2]

    if (m.rz) {
      const c = Math.abs(Math.cos(m.rz))
      const sn = Math.abs(Math.sin(m.rz))
      ;[hx, hy] = [hx * c + hy * sn, hx * sn + hy * c]
    }
    if (m.rx) {
      const c = Math.abs(Math.cos(m.rx))
      const sn = Math.abs(Math.sin(m.rx))
      ;[hy, hz] = [hy * c + hz * sn, hy * sn + hz * c]
    }

    const half = [hx, hy, hz]
    for (let a = 0; a < 3; a++) {
      min[a] = Math.min(min[a], m.p[a] - half[a])
      max[a] = Math.max(max[a], m.p[a] + half[a])
    }
  }

  const centre: [number, number, number] = [
    (min[0] + max[0]) / 2,
    (min[1] + max[1]) / 2,
    (min[2] + max[2]) / 2,
  ]
  const radius = Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]) / 2
  return { min, max, centre, radius }
})()

export const HERITAGE_BOUNDS = { length: LEN, height: APEX, ...bounds }

/** Move the building so its own centre sits at the origin. */
export const HERITAGE_OFFSET: [number, number, number] = [
  -bounds.centre[0],
  -bounds.centre[1],
  -bounds.centre[2],
]

/** Ground level, once the building has been recentred. */
export const HERITAGE_GROUND = HERITAGE_OFFSET[1]

/** The angle the house rests at, shared by the scene and its still. */
export const HERITAGE_YAW = -0.62
