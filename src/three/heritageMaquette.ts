import { projectMembers, viewFrom } from './axonometric'
import type { V3 } from './axonometric'
import {
  AUCHENFLOWER_STUDY_MEMBERS, AUCHENFLOWER_STUDY_OFFSET,
  AUCHENFLOWER_STUDY_YAW, AUCHENFLOWER_STUDY_POINTS,
} from './auchenflowerStudyMembers'
import type { Member } from './heritageMembers'
import type { MATERIALS, MaterialKey } from './materials'

export type HeritagePresentation = 'default' | 'maquette'
export type HeritageFocus = 'original' | 'connection' | 'outdoors'

/** A hypothetical architectural study, not a reconstruction of any project's past. */
export const MAQUETTE_MATERIALS: typeof MATERIALS = {
  frame: { color: '#edece4', roughness: 0.9, metalness: 0 },
  clad: { color: '#c7c3b7', roughness: 0.9, metalness: 0 },
  charred: { color: '#204b37', roughness: 0.9, metalness: 0 },
  roof: { color: '#05432a', roughness: 0.8, metalness: 0.06 },
  glass: { color: '#304b40', roughness: 0.4, metalness: 0.04 },
  deck: { color: '#9a7346', roughness: 0.92, metalness: 0 },
  shadow: { color: '#575a52', roughness: 0.96, metalness: 0 },
}

/** Green identifies a selected region. Unselected parts keep their full material
 * colour and depth, so the model never bleaches out or looks semi-transparent. */
export const MAQUETTE_FOCUS_COLOURS: Record<MaterialKey, string> = {
  frame: '#3b6b52', clad: '#1d593d', charred: '#05432a',
  roof: '#2a4634', glass: '#9aad9d', deck: '#92764f', shadow: '#233d2b',
}

export const MAQUETTE_EYE: V3 = [8.5, 6, 12]
export const MAQUETTE_MEMBERS = AUCHENFLOWER_STUDY_MEMBERS
export const MAQUETTE_YAW = AUCHENFLOWER_STUDY_YAW

/**
 * Regions come from the actual cottage/verandah/extension generator blocks.
 * The model's proposed junction belongs to the extension group; glazing
 * belongs to the outdoor idea wherever it occurs. Overlap is intentional:
 * a window can be part of both an original facade and the connection outside.
 */
export function heritageFocusGroups(member: Member): HeritageFocus[] {
  const groups: HeritageFocus[] = []
  if (member.region === 'original') groups.push('original')
  if (member.region === 'extension') {
    groups.push('connection')
  }
  if (member.region === 'verandah' || member.mat === 'glass') groups.push('outdoors')
  return groups
}

/** Shared framing for the live camera, rendered fallback and DOM callouts. */
export const HERITAGE_MAQUETTE_PROJECTION = projectMembers(MAQUETTE_MEMBERS, {
  eye: MAQUETTE_EYE,
  offset: AUCHENFLOWER_STUDY_OFFSET,
  yaw: MAQUETTE_YAW,
  padding: 0.48,
})

const [viewX, viewY, viewWidth, viewHeight] = HERITAGE_MAQUETTE_PROJECTION.viewBox.split(' ').map(Number)
export const HERITAGE_MAQUETTE_ASPECT = viewWidth / viewHeight
const basis = viewFrom(MAQUETTE_EYE)

function rotate([x, y, z]: V3): V3 {
  return [x * Math.cos(MAQUETTE_YAW) + z * Math.sin(MAQUETTE_YAW), y, -x * Math.sin(MAQUETTE_YAW) + z * Math.cos(MAQUETTE_YAW)]
}

/** SVG projects offset before yaw. Use the same translation in the live group. */
export const MAQUETTE_OFFSET = rotate(AUCHENFLOWER_STUDY_OFFSET)
export const MAQUETTE_TARGET: V3 = basis.right.map((right, i) =>
  right * (viewX + viewWidth / 2) - basis.up[i] * (viewY + viewHeight / 2),
) as V3

export function heritageMaquetteFrame(aspect: number) {
  const width = Math.max(viewWidth, viewHeight * aspect)
  const height = Math.max(viewHeight, viewWidth / Math.max(aspect, 0.01))
  return { width, height, x: viewX + (viewWidth - width) / 2, y: viewY + (viewHeight - height) / 2 }
}

const CALLOUT_POINTS = AUCHENFLOWER_STUDY_POINTS

/** Values are fractions of the SceneFrame bounds, including its contain-fit letterboxing. */
export function getHeritageMaquetteAnchors(aspect = HERITAGE_MAQUETTE_ASPECT) {
  const frame = heritageMaquetteFrame(aspect)
  return Object.fromEntries(Object.entries(CALLOUT_POINTS).map(([id, local]) => {
    const point = rotate(local.map((value, i) => value + AUCHENFLOWER_STUDY_OFFSET[i]) as V3)
    const x = point.reduce((sum, value, i) => sum + value * basis.right[i], 0)
    const y = -point.reduce((sum, value, i) => sum + value * basis.up[i], 0)
    return [id, { x: (x - frame.x) / frame.width, y: (y - frame.y) / frame.height }]
  })) as Record<HeritageFocus, { x: number; y: number }>
}

export const HERITAGE_MAQUETTE_ANCHORS = getHeritageMaquetteAnchors()
