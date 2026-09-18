/**
 * A Paddington worker's cottage with an Ashgrove-style extension behind it,
 * described once and used twice: as the 3D scene, and as the static drawing
 * that stands in for it under reduced motion or without WebGL. Both are the
 * same building, so the fallback is never a different picture from the thing it
 * replaces.
 *
 * WHY THIS HOUSE. From Angus's review of the first draft: the section built a
 * generic modern cabin, and he wanted a traditional Queensland home — in his
 * words, Paddington cottage and Ashgrove extension style. Those are two
 * specific things, and this is both of them:
 *
 *   THE COTTAGE (Paddington). Narrow — 6.6m across the front — and raised on
 *   timber stumps. A hipped roof at 27 degrees: low and long, the way the type
 *   sits, not the steeper roof this started with. A full-width front verandah
 *   under a BULLNOSE roof, the curved sheet that is the signature of the style,
 *   with a batten frieze under its beam, quarter-fan brackets at the post heads
 *   and a picket balustrade. Weatherboards, corner boards, a central door with
 *   a pair of French doors either side of it opening onto the verandah, sash
 *   windows to the side walls, and a stair down to the street.
 *
 *   The pitch, the French doors and the weight of the fretwork are all from
 *   Angus's second review: the read was close but the roof was too tall, the
 *   verandah too plain and the front windows too ordinary for the type.
 *
 *   THE EXTENSION (Ashgrove). Behind the cottage, and stepping out past its
 *   side: a contemporary wing in charred vertical boards under a flat roof, a
 *   wall of sliding glass onto a deck, and a tall slot of glass looking forward.
 *   The same charred timber the hero's new wing uses, so the two houses on the
 *   home page speak the same language.
 *
 * It goes up in the order a renovation reads — the old house first and the new
 * wing after it, at every stage — so the section tells the story of the work
 * this business actually does: keep the cottage, add to it.
 *
 * Units are metres. Sections are the real ones a carpenter would order. It
 * finishes as a finished house, lit from within: the section is called "Drawn,
 * then built", so it has to end built.
 */

export type MaterialKey = 'frame' | 'clad' | 'charred' | 'roof' | 'glass' | 'deck'

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
   * False to leave this member out of the line-work. Only roof sheet uses it.
   * The drawing's lines stay on at a fifth of their strength once the house is
   * built, in Bellewood Green, and Green is lighter than the Deep Pine sheet:
   * every seam between strips drew a pale stroke down the roof. The rafters
   * beneath still draw, so the roof is still set out in line before it is clad.
   */
  lines?: false
  /**
   * Drawing order for the still, which has no depth buffer. 0 is the body of
   * the house, 1 the lower roofs (the verandah's and the extension's), 2 the
   * cottage's hipped roof. Sorting faces by depth alone put the top boards of
   * the walls over the eaves, because a long roof sheet's average depth lands
   * behind the short boards it actually covers. From this camera, above the
   * house, a roof is always in front of what is under it. The live scene has a
   * depth buffer and ignores this.
   */
  layer?: 1 | 2
}

type V3 = [number, number, number]

/* --- Setting out ------------------------------------------------------------
   x runs along the frontage, z from back (-) to street (+), y is up. The main
   floor is at y = 0 and the ground is below it. The camera looks from the front
   right, so the verandah, the stair, the cottage's right-hand wall and the
   extension's glazed side are what a visitor sees. Everything is re-centred on
   the origin at the end, so these numbers can be written as a builder would
   set them out rather than around the camera. */

/* The cottage. */
const CW = 6.6
const CD = 6.0
const CX = CW / 2
const CZ = CD / 2

/* The extension, behind the cottage and stepping out past its right side. */
const EX0 = -CX
const EX1 = 5.1
const EZ0 = -7.8
const EZ1 = -CZ
/** Lower than the cottage, so its roof tucks under the cottage's back eave
 *  instead of meeting it. */
const EXT_H = 2.6

const GROUND = -1.25
const BEARER_Y = -0.33
const BEARER_H = 0.19
const BEARER_BOTTOM = BEARER_Y - BEARER_H / 2
const JOIST_Y = -0.11

const WALL_H = 3.0
const STUD = 0.045
const STUD_W = 0.09
const PLATE = 0.045
const WALL_TOP = PLATE + WALL_H + STUD_W

const CLAD_T = 0.024
const CLAD_OFF = STUD_W / 2 + CLAD_T / 2
/** Weatherboard exposure on the cottage. Narrow, which is most of what makes a
 *  wall read as old. */
const WEATHERBOARD = 0.2
/** Vertical board width on the extension. */
const BATTEN = 0.14

/* The verandah, full width across the cottage's front. */
const VZ0 = CZ
const VD = 2.1
const VZ1 = CZ + VD
const POST_Z = VZ1 - 0.06
const BEAM_Y = 2.2

/* The cottage roof: a hip, all four planes at one pitch. */
/* 27 degrees, not 33. A hip at 33 reads as a modern roof: tall, and pointed
   enough that the eye takes the ridge as the subject. The type is lower and
   longer — a Paddington cottage hip sits nearer 25 to 28, and an Ashgrove hip
   the same. Six degrees off takes the ridge down 0.42m over this footprint, and
   the roof stops competing with the verandah, which is the part that actually
   says Queenslander. */
const PITCH = (27 * Math.PI) / 180
const TAN = Math.tan(PITCH)
const EAVE = 0.5
const LX = CX + EAVE
const LZ = CZ + EAVE
const ROOF_AT_WALL = WALL_TOP + 0.19
const EAVE_Y = ROOF_AT_WALL - EAVE * TAN
const RIDGE_Y = EAVE_Y + LZ * TAN
/** Half the ridge. The cottage is only a little wider than deep, so this is
 *  short and the roof reads as the near-pyramid these houses have. */
const RIDGE_HALF = LX - LZ

/* The bullnose: a gentle straight fall off the wall, then a curve that rolls
   down to the gutter over the beam. It only ever falls. The first version set
   the curve from its radius and let the top land wherever that put it, which
   was higher than the wall: the roof climbed away from the house before it
   turned down, and read as a lip rather than a bullnose. So the curve is set
   from its two ends instead, and the radius is whatever joins them. */
const BULL_WALL_Y = 2.9
const BULL_TOP_Y = 2.84
const BULL_SWEEP = (75 * Math.PI) / 180
const BULL_EDGE_Z = VZ1 + 0.12
const BULL_EDGE_Y = BEAM_Y + 0.14
const BULL_R = (BULL_TOP_Y - BULL_EDGE_Y) / (1 - Math.cos(BULL_SWEEP))

/* The stair, central, from the verandah down to the street. */
const STAIR_W = 1.3
const RISERS = 6
const RISE = -GROUND / RISERS
const GOING = 0.27
const STAIR_Z1 = VZ1 + (RISERS - 1) * GOING

/* The deck off the extension's glazed side. */
const DX1 = 7.3
const DZ0 = -7.4
const DZ1 = -3.6

const members: Member[] = []
const add = (m: Member) => members.push(m)

/** Evenly spaced positions across a span, excluding its two ends. */
function across(from: number, to: number, spacing: number): number[] {
  const n = Math.max(Math.round((to - from) / spacing), 1)
  const out: number[] = []
  for (let i = 1; i < n; i++) out.push(from + (i * (to - from)) / n)
  return out
}

/** The same, including both ends. */
const along = (from: number, to: number, spacing: number) => [from, ...across(from, to, spacing), to]

/**
 * Pitch and yaw that lay a member's long axis (its local z) from one point to
 * another. In 'YXZ' order local z lands on (cos a·sin b, -sin a, cos a·cos b).
 */
function aim(from: V3, to: V3) {
  const d: V3 = [to[0] - from[0], to[1] - from[1], to[2] - from[2]]
  const length = Math.hypot(...d)
  const v = d.map((c) => c / length)
  return {
    p: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2] as V3,
    length,
    rx: -Math.asin(v[1]),
    ry: Math.atan2(v[0], v[2]),
  }
}

/* --- Walls ------------------------------------------------------------------
   A face is one wall: which way it faces, the plane it lies in, and the span
   it runs along. Openings and cladding are wall-local rectangles on it: `u`
   along the wall, `v` height above the floor. */

type Rect = { u0: number; v0: number; u1: number; v1: number }
type Face = { axis: 'x' | 'z'; at: number; sign: 1 | -1; u0: number; u1: number; top: number }

const COTTAGE_FRONT: Face = { axis: 'z', at: CZ, sign: 1, u0: -CX, u1: CX, top: WALL_TOP }
const COTTAGE_RIGHT: Face = { axis: 'x', at: CX, sign: 1, u0: -CZ, u1: CZ, top: WALL_TOP }
const COTTAGE_LEFT: Face = { axis: 'x', at: -CX, sign: -1, u0: -CZ, u1: CZ, top: WALL_TOP }
const EXT_RIGHT: Face = { axis: 'x', at: EX1, sign: 1, u0: EZ0, u1: EZ1, top: EXT_H + 0.1 }
const EXT_BACK: Face = { axis: 'z', at: EZ0, sign: -1, u0: EX0, u1: EX1, top: EXT_H + 0.1 }
const EXT_LEFT: Face = { axis: 'x', at: EX0, sign: -1, u0: EZ0, u1: EZ1, top: EXT_H + 0.1 }
/** The short run of the extension's front wall that stands beside the cottage. */
const EXT_FRONT: Face = { axis: 'z', at: EZ1, sign: 1, u0: CX, u1: EX1, top: EXT_H + 0.1 }

/** Places a wall-local rectangle as a panel on a face. */
function panel(face: Face, r: Rect, thickness: number, offset: number, mat: MaterialKey, at: number, stage: 0 | 1 | 2 | 3) {
  const u = (r.u0 + r.u1) / 2
  const v = (r.v0 + r.v1) / 2
  const uw = Math.max(r.u1 - r.u0, 0.01)
  const vh = Math.max(r.v1 - r.v0, 0.01)
  const plane = face.at + face.sign * offset
  if (face.axis === 'z') add({ p: [u, v, plane], s: [uw, vh, thickness], rx: 0, at, stage, mat, outer: true })
  else add({ p: [plane, v, u], s: [thickness, vh, uw], rx: 0, at, stage, mat, outer: true })
}

/**
 * Splits a wall into boards that stop short of every opening. Horizontal
 * boards run along the wall in bands of `board` height; vertical boards are the
 * same subtraction with the wall's two axes swapped, which is how the cottage
 * gets weatherboards and the extension gets upright boards from one routine.
 */
function cladding(wall: Rect, openings: Rect[], board: number, vertical: boolean): Rect[] {
  const swap = (r: Rect): Rect => ({ u0: r.v0, v0: r.u0, u1: r.v1, v1: r.u1 })
  const w = vertical ? swap(wall) : wall
  const os = vertical ? openings.map(swap) : openings
  const out: Rect[] = []
  for (let v = w.v0; v < w.v1 - 1e-6; v += board) {
    const vTop = Math.min(v + board * 0.92, w.v1)
    const spans = os
      .filter((o) => o.v1 > v + 1e-6 && o.v0 < v + board - 1e-6)
      .map((o): [number, number] => [Math.max(o.u0, w.u0), Math.min(o.u1, w.u1)])
      .sort((a, b) => a[0] - b[0])
    let u = w.u0
    for (const [s, e] of spans) {
      if (s > u + 0.02) out.push({ u0: u, v0: v, u1: s, v1: vTop })
      u = Math.max(u, e)
    }
    if (u < w.u1 - 0.02) out.push({ u0: u, v0: v, u1: w.u1, v1: vTop })
  }
  return vertical ? out.map(swap) : out
}

/** Frames and glazes one opening: four members round the hole, any mullions,
 *  and glass set back behind them. A filled panel, however thin, sits in front
 *  of the glass on whichever side the camera is on and turns every window
 *  black. */
function glaze(face: Face, o: Rect, at: number, mullions: number[] = [], rails: number[] = []) {
  const b = 0.07
  const frames: Rect[] = [
    { u0: o.u0 - b, v0: o.v1, u1: o.u1 + b, v1: o.v1 + b },
    { u0: o.u0 - b, v0: o.v0 - b, u1: o.u1 + b, v1: o.v0 },
    { u0: o.u0 - b, v0: o.v0, u1: o.u0, v1: o.v1 },
    { u0: o.u1, v0: o.v0, u1: o.u1 + b, v1: o.v1 },
    ...mullions.map((u) => ({ u0: u - 0.025, v0: o.v0, u1: u + 0.025, v1: o.v1 })),
    // Horizontal glazing bars. A French door is panes, not a sheet of glass.
    ...rails.map((v) => ({ u0: o.u0, v0: v - 0.018, u1: o.u1, v1: v + 0.018 })),
  ]
  for (const f of frames) panel(face, f, CLAD_T + 0.03, CLAD_OFF, 'roof', at, 3)
  panel(face, o, 0.02, CLAD_OFF - 0.03, 'glass', at + 0.006, 3)
}

/** Tall and narrow, the proportion of a double-hung sash. */
const sash = (centre: number, width = 0.9): Rect => ({ u0: centre - width / 2, v0: 0.85, u1: centre + width / 2, v1: 2.35 })

/**
 * A pair of French doors: full height, from just above the verandah floor to
 * the head, split down the middle by a mullion and barred across into panes.
 *
 * This is what opens onto the verandah of one of these houses. The front wall
 * carried plain sashes with a sill at 850, which is a bedroom window, and it
 * left the verandah as somewhere to walk past rather than somewhere the house
 * opens onto. Glass to the floor also lets the interior light reach the boards
 * at the end of the build, which is the one thing the scene has to show: a
 * house being lived in.
 */
const frenchDoors = (centre: number, width = 1.25): Rect => ({
  u0: centre - width / 2,
  v0: 0.06,
  u1: centre + width / 2,
  v1: 2.25,
})
/** Where the glazing bars cross a French door. Two, not four: see the frieze. */
const FRENCH_RAILS = [0.78, 1.5]

/** A rectangular wall frame: plates top and bottom on all four sides, studs
 *  between. */
function wallFrame(x0: number, x1: number, z0: number, z1: number, height: number, at0: number, at1: number) {
  const plateY = PLATE / 2
  const studY = PLATE + height / 2
  const topY = PLATE + height + STUD_W / 2
  const lx = x1 - x0
  const lz = z1 - z0
  for (const z of [z0, z1]) {
    add({ p: [(x0 + x1) / 2, plateY, z], s: [lx, PLATE, STUD_W], rx: 0, at: at0, stage: 1, mat: 'frame' })
    add({ p: [(x0 + x1) / 2, topY, z], s: [lx, STUD_W, STUD_W], rx: 0, at: at1, stage: 1, mat: 'frame' })
    along(x0, x1, 0.75).forEach((x, i, all) => {
      add({ p: [x, studY, z], s: [STUD, height, STUD_W], rx: 0, at: at0 + 0.015 + (i / all.length) * (at1 - at0) * 0.6, stage: 1, mat: 'frame' })
    })
  }
  for (const x of [x0, x1]) {
    add({ p: [x, plateY, (z0 + z1) / 2], s: [STUD_W, PLATE, lz], rx: 0, at: at0, stage: 1, mat: 'frame' })
    add({ p: [x, topY, (z0 + z1) / 2], s: [STUD_W, STUD_W, lz], rx: 0, at: at1, stage: 1, mat: 'frame' })
    across(z0, z1, 0.75).forEach((z, i, all) => {
      add({ p: [x, studY, z], s: [STUD_W, height, STUD], rx: 0, at: at0 + 0.03 + (i / all.length) * (at1 - at0) * 0.5, stage: 1, mat: 'frame' })
    })
  }
}

/** A grid of stumps with a bearer along each row.
 *
 *  Stumps are 105mm, not 130. At 130 they read as piers rather than stumps —
 *  heavy enough that the eye reads the underfloor as the subject, which on a
 *  house whose whole point is the verandah above it is the wrong emphasis. A
 *  hardwood stump is 100 to 125 square, so this is still a real section. */
function substructure(xs: number[], zs: number[], x0: number, x1: number, at0: number) {
  const stumpH = BEARER_BOTTOM - GROUND
  const STUMP = 0.105
  zs.forEach((z, row) => {
    xs.forEach((x, col) => {
      add({ p: [x, GROUND + stumpH / 2, z], s: [STUMP, stumpH, STUMP], rx: 0, at: at0 + row * 0.005 + col * 0.0015, stage: 0, mat: 'frame', outer: true })
    })
    add({ p: [(x0 + x1) / 2, BEARER_Y, z], s: [x1 - x0 + 0.2, BEARER_H, 0.12], rx: 0, at: at0 + 0.03 + row * 0.004, stage: 0, mat: 'frame', outer: true })
  })
}

/**
 * One plane of the cottage's hip, laid as strips running down the slope. That
 * is how corrugated sheet goes on, and the only way to make a triangle out of
 * boxes: each strip is cut where it meets the hip, so the strips shorten
 * towards the corners. The rafters are the same generator at wider centres.
 */
function hipPlane(plane: 'front' | 'back' | 'left' | 'right', spacing: number, width: number, thick: number, up: number, mat: MaterialKey, at0: number, at1: number, stage: 0 | 1 | 2 | 3, outer: boolean, sheet = false) {
  const long = plane === 'front' || plane === 'back'
  const half = long ? LX : LZ
  /* WHERE THE GAPS CAME FROM. `across` returns the interior points of a span
     and leaves both ends out, which is right for rafters — you do not want one
     sitting on the hip — and wrong for sheet. The outermost strip landed one
     spacing in from the edge, so a 145mm band of each plane was never covered
     and the hip read as a dotted orange line all the way down: the timber
     underneath, showing through the roof.

     Sheet is set out instead by band, each strip centred in its own share of
     the plane, so the run is covered edge to edge with no sliver left at
     either end. Strips still lap each other, and the hip capping covers where
     two planes meet. */
  const positions = sheet
    ? (() => {
        const n = Math.max(Math.round((half * 2) / spacing), 1)
        const step = (half * 2) / n
        return Array.from({ length: n }, (_, i) => -half + step * (i + 0.5))
      })()
    : across(-half, half, spacing)
  positions.forEach((c, i) => {
    const run = long ? Math.min(LZ, LX - Math.abs(c)) : LZ - Math.abs(c)
    if (run < 0.12) return
    const slope = run / Math.cos(PITCH)
    // Sheets lap: alternate strips sit a few millimetres proud, so where two
    // overlap they are never in one plane and never fight for the same pixels.
    const y = EAVE_Y + (run / 2) * TAN + up + (sheet && i % 2 ? 0.008 : 0)
    const at = at0 + (i / positions.length) * (at1 - at0)
    const extra = sheet ? ({ lines: false, layer: 2 } as const) : {}
    // Sheet is cut a little long so it laps its neighbour and runs over the
    // hip line rather than stopping short of it.
    const w = sheet ? Math.max(width, (half * 2) / positions.length + 0.03) : width
    if (long) {
      const sign = plane === 'front' ? 1 : -1
      add({ p: [c, y, sign * (LZ - run / 2)], s: [w, thick, slope + (sheet ? 0.04 : 0)], rx: sign * PITCH, at, stage, mat, outer, ...extra })
    } else {
      const sign = plane === 'right' ? 1 : -1
      add({ p: [sign * (LX - run / 2), y, c], s: [slope + (sheet ? 0.04 : 0), thick, w], rx: 0, rz: -sign * PITCH, at, stage, mat, outer, ...extra })
    }
  })
}

function hipsAndRidge(size: number, depth: number, up: number, mat: MaterialKey, at: number, stage: 0 | 1 | 2 | 3, outer: boolean) {
  const layer = outer ? ({ layer: 2 } as const) : {}
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const a = aim([sx * LX, EAVE_Y + up, sz * LZ], [sx * RIDGE_HALF, RIDGE_Y + up, 0])
      add({ p: a.p, s: [size, depth, a.length], rx: a.rx, ry: a.ry, at: at + (sx + 1) * 0.003 + (sz + 1) * 0.0015, stage, mat, outer, ...layer })
    }
  }
  add({ p: [0, RIDGE_Y + up, 0], s: [RIDGE_HALF * 2 + size, depth, size], rx: 0, at: at + 0.012, stage, mat, outer, ...layer })
}

/** Points along the bullnose's centreline, from the wall to the gutter. */
function bullnosePath(): V3[] {
  // The curve is a circle whose last point lands on the gutter line. Its top,
  // where the curve begins, is joined back to the wall by a gentle straight.
  const zc = BULL_EDGE_Z - BULL_R * Math.sin(BULL_SWEEP)
  const yc = BULL_TOP_Y - BULL_R
  const pts: V3[] = [[0, BULL_WALL_Y, VZ0]]
  const steps = 6
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * BULL_SWEEP
    pts.push([0, yc + BULL_R * Math.cos(t), zc + BULL_R * Math.sin(t)])
  }
  return pts
}

/* === Stage 0. Stumps, bearers, joists: the cottage, then the extension ===== */

substructure([-3.2, -1.1, 1.1, 3.2], [-2.9, -1.0, 1.0, 2.9, CZ + 0.8, VZ1 - 0.1], -CX, CX, 0.004)
along(-CX, CX, 0.6).forEach((x, i, all) => {
  add({ p: [x, JOIST_Y, 0], s: [0.045, 0.15, CD], rx: 0, at: 0.05 + (i / all.length) * 0.03, stage: 0, mat: 'frame' })
})
across(VZ0, VZ1, 0.6).forEach((z, i) => {
  add({ p: [0, JOIST_Y, z], s: [CW, 0.12, 0.045], rx: 0, at: 0.08 + i * 0.003, stage: 0, mat: 'frame' })
})

substructure([-3.2, -1.1, 1.0, 3.1, 5.0], [-3.4, -5.0, -6.4, -7.7], EX0, EX1, 0.09)
along(EX0, EX1, 0.6).forEach((x, i, all) => {
  add({ p: [x, JOIST_Y, (EZ0 + EZ1) / 2], s: [0.045, 0.15, EZ1 - EZ0], rx: 0, at: 0.115 + (i / all.length) * 0.02, stage: 0, mat: 'frame' })
})

/* === Stage 1. Wall frames, verandah posts, the stair ======================= */

wallFrame(-CX, CX, -CZ, CZ, WALL_H, 0.15, 0.28)
wallFrame(EX0, EX1, EZ0, EZ1, EXT_H, 0.3, 0.39)

const POST_XS = [-3.25, -STAIR_W / 2 - 0.1, STAIR_W / 2 + 0.1, 3.25]
POST_XS.forEach((x, i) => {
  add({ p: [x, BEAM_Y / 2 - 0.05, POST_Z], s: [0.1, BEAM_Y - 0.1, 0.1], rx: 0, at: 0.41 + i * 0.005, stage: 1, mat: 'frame', outer: true })
})
add({ p: [0, BEAM_Y, POST_Z], s: [CW + 0.1, 0.18, 0.1], rx: 0, at: 0.44, stage: 1, mat: 'frame', outer: true })

for (const x of [-STAIR_W / 2 + 0.03, STAIR_W / 2 - 0.03]) {
  const a = aim([x, -0.06, VZ1], [x, GROUND + 0.08, STAIR_Z1 + 0.12])
  add({ p: a.p, s: [0.05, 0.24, a.length], rx: a.rx, ry: a.ry, at: 0.455, stage: 1, mat: 'frame', outer: true })
}

/* === Stage 2. Roof frames: the cottage's hip, its bullnose, the extension === */

for (const [plane, i] of [['front', 0], ['right', 1], ['back', 2], ['left', 3]] as const) {
  hipPlane(plane, 0.9, 0.045, 0.14, -0.1, 'frame', 0.5 + i * 0.022, 0.522 + i * 0.022, 2, false)
}
hipsAndRidge(0.06, 0.2, -0.08, 'frame', 0.6, 2, false)

// Bullnose rafters: each one bent to the curve, as a run of short members.
{
  const path = bullnosePath()
  along(-CX, CX, 0.85).forEach((x, i, all) => {
    for (let k = 0; k < path.length - 1; k++) {
      const a = aim([x, path[k][1] - 0.08, path[k][2]], [x, path[k + 1][1] - 0.08, path[k + 1][2]])
      add({ p: a.p, s: [0.045, 0.1, a.length + 0.02], rx: a.rx, ry: a.ry, at: 0.625 + (i / all.length) * 0.03 + k * 0.001, stage: 2, mat: 'frame' })
    }
  })
}

// The extension's roof joists, flat.
along(EZ0, EZ1, 0.6).forEach((z, i, all) => {
  add({ p: [(EX0 + EX1) / 2, EXT_H + PLATE + STUD_W + 0.1, z], s: [EX1 - EX0, 0.19, 0.045], rx: 0, at: 0.665 + (i / all.length) * 0.04, stage: 2, mat: 'frame' })
})

/* === Stage 3. The enclosure ================================================ */

/* --- The cottage, in weatherboard --- */

const COTTAGE_WALLS: { face: Face; openings: Rect[]; mullions?: number[][]; at0: number }[] = [
  {
    face: COTTAGE_FRONT,
    // The door in the middle, a pair of French doors either side of it.
    openings: [{ u0: -0.5, v0: 0.05, u1: 0.5, v1: 2.25 }, frenchDoors(-2.1), frenchDoors(2.1)],
    mullions: [[], [-2.1], [2.1]],
    at0: 0.725,
  },
  { face: COTTAGE_RIGHT, openings: [sash(-1.4), sash(1.2)], at0: 0.74 },
  { face: COTTAGE_LEFT, openings: [sash(-1.2), sash(1.3)], at0: 0.75 },
]

for (const { face, openings, mullions, at0 } of COTTAGE_WALLS) {
  const rects = cladding({ u0: face.u0, v0: -0.12, u1: face.u1, v1: face.top }, openings, WEATHERBOARD, false)
  rects.forEach((r, i) => panel(face, r, CLAD_T, CLAD_OFF, 'clad', at0 + (i / rects.length) * 0.06, 3))
  openings.forEach((o, i) => {
    const bars = mullions?.[i] ?? []
    glaze(face, o, at0 + 0.05 + i * 0.004, bars, bars.length ? FRENCH_RAILS : [])
    // The meeting rail across the middle of a sash. The door has none.
    if (o.v0 > 0.5) {
      const mid = (o.v0 + o.v1) / 2
      panel(face, { u0: o.u0, v0: mid - 0.025, u1: o.u1, v1: mid + 0.025 }, CLAD_T + 0.03, CLAD_OFF, 'roof', at0 + 0.055 + i * 0.004, 3)
    }

    // A hood over each side window. The verandah already shelters the front.
    if (face.axis !== 'x') return
    const reach = 0.46
    const lean = 0.5
    const out = CLAD_OFF + (reach / 2) * Math.cos(lean)
    add({
      p: [face.at + face.sign * out, o.v1 + 0.32, (o.u0 + o.u1) / 2],
      s: [reach, 0.035, o.u1 - o.u0 + 0.3],
      rx: 0,
      rz: -face.sign * lean,
      at: 0.9 + i * 0.004,
      stage: 3,
      mat: 'roof',
      outer: true,
    })
  })
}

// Corner boards where two walls' weatherboards meet.
for (const [x, z] of [[CX, CZ], [-CX, CZ], [CX, -CZ], [-CX, -CZ]] as const) {
  const off = CLAD_OFF + 0.01
  add({ p: [x + Math.sign(x) * off, (WALL_TOP - 0.12) / 2, z + Math.sign(z) * off], s: [0.1, WALL_TOP + 0.12, 0.1], rx: 0, at: 0.8, stage: 3, mat: 'frame', outer: true })
}

// The verandah floor: boards running out from the house to the front edge.
across(-CX - 0.05, CX + 0.05, 0.15).forEach((x, i, all) => {
  add({ p: [x, -0.015, (VZ0 + VZ1) / 2], s: [0.13, 0.03, VD], rx: 0, at: 0.73 + (i / all.length) * 0.04, stage: 3, mat: 'deck', outer: true })
})

// Treads.
for (let i = 1; i < RISERS; i++) {
  add({ p: [0, -i * RISE - 0.02, VZ1 + (i - 0.5) * GOING], s: [STAIR_W - 0.08, 0.04, GOING + 0.03], rx: 0, at: 0.78 + i * 0.004, stage: 3, mat: 'deck', outer: true })
}

// The hipped roof in sheet, then its hips, ridge and gutters.
for (const [plane, i] of [['front', 0], ['right', 1], ['back', 2], ['left', 3]] as const) {
  hipPlane(plane, 0.32, 0.345, 0.03, 0.03, 'roof', 0.815 + i * 0.01, 0.828 + i * 0.01, 3, true, true)
}
hipsAndRidge(0.22, 0.075, 0.075, 'roof', 0.86, 3, true)
for (const sz of [-1, 1]) {
  add({ p: [0, EAVE_Y - 0.06, sz * (LZ + 0.04)], s: [LX * 2 + 0.1, 0.11, 0.1], rx: 0, at: 0.875, stage: 3, mat: 'roof', outer: true, layer: 2 })
}
for (const sx of [-1, 1]) {
  add({ p: [sx * (LX + 0.04), EAVE_Y - 0.06, 0], s: [0.1, 0.11, LZ * 2 + 0.1], rx: 0, at: 0.875, stage: 3, mat: 'roof', outer: true, layer: 2 })
}

// The bullnose in sheet. Each run of the curve is one full-width panel: at
// this scale a curve reads from its facets, and seams across a curve would
// only chop it up.
{
  const path = bullnosePath()
  for (let k = 0; k < path.length - 1; k++) {
    const a = aim([0, path[k][1], path[k][2]], [0, path[k + 1][1], path[k + 1][2]])
    add({ p: a.p, s: [CW + 0.35, 0.03, a.length + 0.03], rx: a.rx, ry: a.ry, at: 0.84 + k * 0.004, stage: 3, mat: 'roof', outer: true, lines: false, layer: 1 })
  }
  const last = path[path.length - 1]
  add({ p: [0, last[1] - 0.06, last[2] + 0.03], s: [CW + 0.4, 0.1, 0.1], rx: 0, at: 0.87, stage: 3, mat: 'roof', outer: true, layer: 1 })
}

/* --- The verandah's detail --- */

const RAIL_TOP = 0.95
const RAIL_LOW = 0.13

function balustrade(from: number, to: number, fixed: number, alongX: boolean, at: number) {
  const mid = (from + to) / 2
  const len = Math.abs(to - from)
  for (const y of [RAIL_TOP, RAIL_LOW]) {
    add({ p: alongX ? [mid, y, fixed] : [fixed, y, mid], s: alongX ? [len, 0.05, 0.07] : [0.07, 0.05, len], rx: 0, at, stage: 3, mat: 'frame', outer: true })
  }
  across(from, to, 0.12).forEach((c, i) => {
    add({ p: alongX ? [c, (RAIL_TOP + RAIL_LOW) / 2, fixed] : [fixed, (RAIL_TOP + RAIL_LOW) / 2, c], s: [0.03, RAIL_TOP - RAIL_LOW - 0.05, 0.03], rx: 0, at: at + 0.004 + i * 0.0006, stage: 3, mat: 'frame', outer: true })
  })
}

for (let i = 0; i < POST_XS.length - 1; i++) {
  if (POST_XS[i] < 0 && POST_XS[i + 1] > 0) continue // the stair
  balustrade(POST_XS[i], POST_XS[i + 1], POST_Z, true, 0.88 + i * 0.008)
}
for (const x of [-3.25, 3.25]) balustrade(VZ0 + 0.08, POST_Z, x, false, 0.9)

/* The frieze: a band of battens under the verandah beam, between the posts,
   closed top and bottom by a rail. With the bullnose it is the detail that most
   says an old Brisbane cottage.

   DEEPER AND COARSER THAN IT WAS, deliberately. It ran 320mm deep in 25mm
   battens at 100 centres, which is about right on a real house and wrong here:
   at the size this renders, battens that fine and that close average out into a
   grey smear under the beam and read as nothing at all. 420mm deep, 32mm
   battens at 118 centres is the same comb with gaps the eye can resolve. The
   rule for anything added to this scene is that detail has to survive being
   small — if it cannot be seen it is only polygons. */
{
  const top = BEAM_Y - 0.08
  const bottom = BEAM_Y - 0.5
  for (let i = 0; i < POST_XS.length - 1; i++) {
    const a = POST_XS[i] + 0.06
    const b = POST_XS[i + 1] - 0.06
    for (const y of [bottom, top]) {
      add({ p: [(a + b) / 2, y, POST_Z], s: [b - a, 0.05, 0.05], rx: 0, at: 0.91, stage: 3, mat: 'frame', outer: true })
    }
    across(a, b, 0.118).forEach((x, k) => {
      add({ p: [x, (top + bottom) / 2, POST_Z], s: [0.032, top - bottom, 0.028], rx: 0, at: 0.912 + k * 0.0005, stage: 3, mat: 'frame', outer: true })
    })
  }
}

/* Brackets at the post heads, under the frieze. Two members to each one, a
   diagonal and a shorter piece outboard of it, so the bracket reads as the
   filled quarter-fan these verandahs carry rather than as a single stick
   leaning on the post. Larger than it was for the same reason the frieze is
   coarser: at this size a 340mm bracket is a few pixels of nothing. */
POST_XS.forEach((x, i) => {
  for (const side of [-1, 1]) {
    if ((i === 0 && side < 0) || (i === POST_XS.length - 1 && side > 0)) continue
    add({ p: [x + side * 0.19, BEAM_Y - 0.64, POST_Z], s: [0.05, 0.46, 0.05], rx: 0, rz: -side * (Math.PI / 4), at: 0.93 + i * 0.003, stage: 3, mat: 'frame', outer: true })
    add({ p: [x + side * 0.31, BEAM_Y - 0.62, POST_Z], s: [0.035, 0.3, 0.04], rx: 0, rz: -side * (Math.PI / 4), at: 0.932 + i * 0.003, stage: 3, mat: 'frame', outer: true })
  }
})

// Stair handrails and newels.
for (const x of [-STAIR_W / 2 - 0.02, STAIR_W / 2 + 0.02]) {
  const a = aim([x, RAIL_TOP - 0.02, VZ1], [x, GROUND + RAIL_TOP - 0.1, STAIR_Z1])
  add({ p: a.p, s: [0.05, 0.05, a.length], rx: a.rx, ry: a.ry, at: 0.94, stage: 3, mat: 'frame', outer: true })
  add({ p: [x, GROUND + (RAIL_TOP + 0.05) / 2, STAIR_Z1 + 0.05], s: [0.09, RAIL_TOP + 0.05, 0.09], rx: 0, at: 0.935, stage: 3, mat: 'frame', outer: true })
}

/* The skirt: battens closing the gap between the ground and the floor.
 *
 *  It was one flat run straight across the front, full width, with the stair
 *  descending in front of it — so the battens carried on behind the steps and
 *  the whole thing read as a fence somebody had put up in front of the
 *  cottage, which is what it looked like and not what it is.
 *
 *  Three changes make it the house's own skirt: an opening where the stair
 *  comes down, so the stair goes THROUGH it rather than in front of it;
 *  returns along both sides, so it turns the corner and encloses the
 *  underfloor instead of standing as a plane; and a rail top and bottom to
 *  each run, so the battens are held in something. */
{
  const top = BEARER_BOTTOM - 0.02
  const h = top - GROUND
  const y = GROUND + h / 2
  const clear = STAIR_W / 2 + 0.14
  const zFront = VZ1 - 0.1

  for (const [a, b] of [[-CX, -clear], [clear, CX]] as [number, number][]) {
    across(a, b, 0.16).forEach((x, i, all) => {
      add({ p: [x, y, zFront], s: [0.07, h, 0.02], rx: 0, at: 0.945 + (i / all.length) * 0.008, stage: 3, mat: 'frame', outer: true })
    })
    for (const railY of [top - 0.07, GROUND + 0.1]) {
      add({ p: [(a + b) / 2, railY, zFront], s: [b - a, 0.09, 0.035], rx: 0, at: 0.955, stage: 3, mat: 'frame', outer: true })
    }
  }

  for (const sx of [-1, 1]) {
    const z0 = CZ - 0.6
    across(z0, zFront, 0.16).forEach((z, i, all) => {
      add({ p: [sx * (CX - 0.08), y, z], s: [0.02, h, 0.07], rx: 0, at: 0.95 + (i / all.length) * 0.008, stage: 3, mat: 'frame', outer: true })
    })
    for (const railY of [top - 0.07, GROUND + 0.1]) {
      add({ p: [sx * (CX - 0.08), railY, (z0 + zFront) / 2], s: [0.035, 0.09, zFront - z0], rx: 0, at: 0.956, stage: 3, mat: 'frame', outer: true })
    }
  }
}

/* --- The extension, in charred vertical boards and glass --- */

const EXT_WALLS: { face: Face; openings: Rect[]; mullions: number[][]; at0: number }[] = [
  // A wall of sliding glass onto the deck.
  { face: EXT_RIGHT, openings: [{ u0: -7.3, v0: 0.05, u1: -4.1, v1: 2.3 }], mullions: [[-6.5, -5.7, -4.9]], at0: 0.8 },
  // A tall slot of glass beside the cottage, looking up the street.
  { face: EXT_FRONT, openings: [{ u0: 3.75, v0: 0.3, u1: 4.65, v1: 2.3 }], mullions: [[]], at0: 0.81 },
  { face: EXT_BACK, openings: [{ u0: -1.2, v0: 0.9, u1: 1.2, v1: 2.2 }], mullions: [[]], at0: 0.82 },
  { face: EXT_LEFT, openings: [], mullions: [], at0: 0.825 },
]

for (const { face, openings, mullions, at0 } of EXT_WALLS) {
  const rects = cladding({ u0: face.u0, v0: -0.12, u1: face.u1, v1: face.top }, openings, BATTEN, true)
  rects.forEach((r, i) => panel(face, r, CLAD_T, CLAD_OFF, 'charred', at0 + (i / rects.length) * 0.05, 3))
  openings.forEach((o, i) => glaze(face, o, at0 + 0.04 + i * 0.004, mullions[i] ?? []))
}

// The flat roof: sheet, and a crisp fascia round the edge, which is what makes
// it read as a contemporary box rather than a shed.
{
  const y = EXT_H + PLATE + STUD_W + 0.22
  across(EZ0 - 0.2, EZ1 + 0.15, 0.4).forEach((z, i, all) => {
    add({ p: [(EX0 + EX1) / 2, y + (i % 2 ? 0.006 : 0), z], s: [EX1 - EX0 + 0.4, 0.03, 0.43], rx: 0, at: 0.885 + (i / all.length) * 0.02, stage: 3, mat: 'roof', outer: true, lines: false, layer: 1 })
  })
  const f = 0.2
  const cx = (EX0 + EX1) / 2
  const cz = (EZ0 + EZ1) / 2
  const w = EX1 - EX0 + 0.44
  const d = EZ1 - EZ0 + 0.44
  add({ p: [cx, y, EZ0 - 0.22], s: [w, f, 0.04], rx: 0, at: 0.905, stage: 3, mat: 'charred', outer: true, layer: 1 })
  add({ p: [cx, y, EZ1 + 0.22], s: [w, f, 0.04], rx: 0, at: 0.905, stage: 3, mat: 'charred', outer: true, layer: 1 })
  add({ p: [EX0 - 0.22, y, cz], s: [0.04, f, d], rx: 0, at: 0.905, stage: 3, mat: 'charred', outer: true, layer: 1 })
  add({ p: [EX1 + 0.22, y, cz], s: [0.04, f, d], rx: 0, at: 0.905, stage: 3, mat: 'charred', outer: true, layer: 1 })
}

/* --- The deck off the glass --- */

/* The deck's own stumps. They were at 5.9 and 7.2: the first stood within
   200mm of the extension's own stump line at 5.0, so from the front the two
   read as one doubled post, and the deck cantilevered 800mm past it on the
   inside. Moved to 5.65 and 7.05 — clear of the house's line, and near enough
   to each edge of the deck that it looks carried rather than balanced. */
substructure([5.65, 7.05], [-7.2, -5.5, -3.8], EX1, DX1, 0.13)
across(DZ0, DZ1, 0.15).forEach((z, i, all) => {
  add({ p: [(EX1 + DX1) / 2 + 0.05, -0.015, z], s: [DX1 - EX1 + 0.1, 0.03, 0.13], rx: 0, at: 0.92 + (i / all.length) * 0.02, stage: 3, mat: 'deck', outer: true })
})
// A slim steel balustrade, the new wing's answer to the cottage's pickets.
{
  const corners: [number, number][] = [[DX1 - 0.05, DZ0 + 0.05], [DX1 - 0.05, DZ1 - 0.05], [EX1 + 0.3, DZ1 - 0.05]]
  for (const [x, z] of corners) {
    add({ p: [x, 0.5, z], s: [0.05, 1.0, 0.05], rx: 0, at: 0.95, stage: 3, mat: 'roof', outer: true })
  }
  for (const y of [0.5, 0.97]) {
    add({ p: [DX1 - 0.05, y, (DZ0 + DZ1) / 2], s: [0.04, 0.04, DZ1 - DZ0 - 0.1], rx: 0, at: 0.955, stage: 3, mat: 'roof', outer: true })
    add({ p: [(EX1 + 0.3 + DX1 - 0.05) / 2, y, DZ1 - 0.05], s: [DX1 - EX1 - 0.35, 0.04, 0.04], rx: 0, at: 0.955, stage: 3, mat: 'roof', outer: true })
  }
}

// Lights under the bullnose, either side of the door.
for (const x of [-1.3, 1.3]) {
  add({ p: [x, 2.6, CZ + 0.14], s: [0.16, 0.06, 0.16], rx: 0, at: 0.97, stage: 3, mat: 'glass', outer: true })
}

/* --- Re-centre --------------------------------------------------------------
   The house was set out from the cottage's own centre, but with the extension
   behind it and the deck off its side the whole is well off the origin, and the
   camera looks at the origin. Every member is moved so the plan is centred, and
   the bounds are measured from what was actually built. */

const bounds = members.reduce(
  (b, m) => {
    const rotated = m.rx || m.ry || m.rz
    const r = Math.max(...m.s) / 2
    const hx = rotated ? r : m.s[0] / 2
    const hz = rotated ? r : m.s[2] / 2
    return {
      minX: Math.min(b.minX, m.p[0] - hx),
      maxX: Math.max(b.maxX, m.p[0] + hx),
      minZ: Math.min(b.minZ, m.p[2] - hz),
      maxZ: Math.max(b.maxZ, m.p[2] + hz),
    }
  },
  { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity },
)
const shiftX = (bounds.minX + bounds.maxX) / 2
const shiftZ = (bounds.minZ + bounds.maxZ) / 2
for (const m of members) m.p = [m.p[0] - shiftX, m.p[1], m.p[2] - shiftZ]

export const FRAME_MEMBERS = members

/** Bounds, so the camera and the still frame can both fit it without guessing. */
export const FRAME_BOUNDS = {
  /** The cottage's frontage, which is the dimension printed under the scene. */
  length: CW,
  /** Half the whole building's width, eaves and deck included. */
  halfWidth: (bounds.maxX - bounds.minX) / 2,
  /** Front and back, after re-centring. */
  minZ: bounds.minZ - shiftZ,
  maxZ: bounds.maxZ - shiftZ,
  /** The top of the ridge. */
  height: RIDGE_Y + 0.1,
  /** The ground it stands on, below the floor. */
  ground: GROUND,
  centreY: (RIDGE_Y + GROUND) / 2,
}

/**
 * Where each named stage begins, as a fraction of the section's pinned scroll.
 * These line up with the `at` values above.
 */
export const FRAME_STAGE_STARTS = [0, 0.14, 0.48, 0.72] as const

export const FRAME_STAGES = [
  { label: 'Drawings', note: 'Set out from the architect’s documents.' },
  { label: 'Frame', note: 'Stumps, floor and walls: the cottage, then the new wing behind it.' },
  { label: 'Roof', note: 'The cottage’s hip and bullnose verandah, then the extension.' },
  { label: 'Finish', note: 'Weatherboards on the old, charred timber and glass on the new.' },
] as const
