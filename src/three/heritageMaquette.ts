import { projectMembers, viewFrom } from './axonometric'
import type { V3 } from './axonometric'
import { HERITAGE_MEMBERS, HERITAGE_OFFSET, HERITAGE_YAW } from './heritageMembers'
import type { Member } from './heritageMembers'
import type { MATERIALS, TONE } from './materials'

export type HeritagePresentation = 'default' | 'maquette'
export type HeritageFocus = 'original' | 'connection' | 'outdoors'

/** A hypothetical architectural study, not a reconstruction of any project's past. */
export const MAQUETTE_MATERIALS: typeof MATERIALS = {
  frame: { color: '#b7a386', roughness: 0.84, metalness: 0 },
  clad: { color: '#e5e3d8', roughness: 0.85, metalness: 0 },
  charred: { color: '#526a5d', roughness: 0.84, metalness: 0 },
  roof: { color: '#96a397', roughness: 0.64, metalness: 0.16 },
  glass: { color: '#a9c0bc', roughness: 0.22, metalness: 0.1 },
  deck: { color: '#b3926b', roughness: 0.88, metalness: 0 },
  shadow: { color: '#92988b', roughness: 0.96, metalness: 0 },
}

const MAQUETTE_TONES: typeof TONE = {
  frame: { base: '#b7a386', shade: '#7e735f' },
  clad: { base: '#e5e3d8', shade: '#a2aa9b' },
  charred: { base: '#526a5d', shade: '#304c3e' },
  roof: { base: '#a8b0a5', shade: '#647868' },
  glass: { base: '#c2d5d0', shade: '#6e8f84' },
  deck: { base: '#b3926b', shade: '#7c6a4d' },
  shadow: { base: '#92988b', shade: '#697368' },
}

export const MAQUETTE_SOFTEN = 0.46
export const MAQUETTE_GROUND = '#f7f7f4'
export const MAQUETTE_EYE: V3 = [8.5, 4.9, 12]

/**
 * Regions come from the actual cottage/verandah/extension generator blocks.
 * The joint includes the cottage's rear wall and trim (z = -2.4m); glazing
 * belongs to the outdoor idea wherever it occurs. Overlap is intentional:
 * a window can be part of both an original facade and the connection outside.
 */
export function heritageFocusGroups(member: Member): HeritageFocus[] {
  const groups: HeritageFocus[] = []
  if (member.region === 'original') groups.push('original')
  if (member.region === 'extension' || (member.region === 'original' && member.p[2] <= -2.3)) {
    groups.push('connection')
  }
  if (member.region === 'verandah' || member.mat === 'glass') groups.push('outdoors')
  return groups
}

const members = HERITAGE_MEMBERS.map((member) => ({
  ...member,
  groups: heritageFocusGroups(member).join(' '),
}))

/** One projection supplies the fallback, the live orthographic framing and DOM callout anchors. */
export const HERITAGE_MAQUETTE_PROJECTION = projectMembers(members, {
  eye: MAQUETTE_EYE,
  offset: HERITAGE_OFFSET,
  yaw: HERITAGE_YAW,
  padding: 0.48,
  tones: MAQUETTE_TONES,
})

const [viewX, viewY, viewWidth, viewHeight] = HERITAGE_MAQUETTE_PROJECTION.viewBox.split(' ').map(Number)
export const HERITAGE_MAQUETTE_ASPECT = viewWidth / viewHeight
const basis = viewFrom(MAQUETTE_EYE)

function rotate([x, y, z]: V3): V3 {
  return [x * Math.cos(HERITAGE_YAW) + z * Math.sin(HERITAGE_YAW), y, -x * Math.sin(HERITAGE_YAW) + z * Math.cos(HERITAGE_YAW)]
}

/** SVG projects offset before yaw. Use the same translation in the live group. */
export const MAQUETTE_OFFSET = rotate(HERITAGE_OFFSET)
export const MAQUETTE_TARGET: V3 = basis.right.map((right, i) =>
  right * (viewX + viewWidth / 2) - basis.up[i] * (viewY + viewHeight / 2),
) as V3

export function heritageMaquetteFrame(aspect: number) {
  const width = Math.max(viewWidth, viewHeight * aspect)
  const height = Math.max(viewHeight, viewWidth / Math.max(aspect, 0.01))
  return { width, height, x: viewX + (viewWidth - width) / 2, y: viewY + (viewHeight - height) / 2 }
}

const CALLOUT_POINTS: Record<HeritageFocus, V3> = {
  original: [3.57, 3.05, 0],
  connection: [2.65, 3.25, -2.95],
  outdoors: [-1.4, 1.5, 4.35],
}

/** Values are fractions of the SceneFrame bounds, including its contain-fit letterboxing. */
export function getHeritageMaquetteAnchors(aspect = HERITAGE_MAQUETTE_ASPECT) {
  const frame = heritageMaquetteFrame(aspect)
  return Object.fromEntries(Object.entries(CALLOUT_POINTS).map(([id, local]) => {
    const point = rotate(local.map((value, i) => value + HERITAGE_OFFSET[i]) as V3)
    const x = point.reduce((sum, value, i) => sum + value * basis.right[i], 0)
    const y = -point.reduce((sum, value, i) => sum + value * basis.up[i], 0)
    return [id, { x: (x - frame.x) / frame.width, y: (y - frame.y) / frame.height }]
  })) as Record<HeritageFocus, { x: number; y: number }>
}

export const HERITAGE_MAQUETTE_ANCHORS = getHeritageMaquetteAnchors()
