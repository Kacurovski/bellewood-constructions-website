import type { Member } from './heritageMembers'

/** The proposed pavilion, its link and the garden deck. The street verandah,
 * its roof and entrance stairs always remain part of the original cottage. */
export function isStudyAddition(member: Member) {
  return member.region === 'extension'
    || (member.region === 'verandah' && member.p[0] > 3.7 && member.p[2] < 0)
}

/** In local model coordinates. Reveal from the connection towards the garden,
 * keeping the building's proportions and opaque materials intact. */
export const STUDY_ADDITION_REVEAL = { front: -0.85, back: -7.2 }

export const STUDY_POINTER_MOTION = { yaw: 0.12, tilt: 0.035 }
