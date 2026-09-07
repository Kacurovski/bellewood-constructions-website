/**
 * The palette shared by both 3D scenes and both of their static frames.
 *
 * Silky Oak is the brand's timber accent and it carries the structure; cladding
 * and deck sit either side of it so the three read apart without becoming three
 * different colours. Roofs are Deep Pine, which keeps the darkest value on the
 * page inside the brand rather than reaching for a neutral grey.
 */

export type MaterialKey = 'frame' | 'clad' | 'charred' | 'roof' | 'glass' | 'deck' | 'shadow'

export const MATERIAL_KEYS: MaterialKey[] = [
  'shadow',
  'frame',
  'clad',
  'charred',
  'deck',
  'roof',
  'glass',
]

/** For the live scenes. */
export const MATERIALS: Record<MaterialKey, { color: string; roughness: number; metalness: number }> = {
  frame: { color: '#9a7b4f', roughness: 0.84, metalness: 0 },
  clad: { color: '#ab8354', roughness: 0.88, metalness: 0 },
  /* Charred timber: what a contemporary extension behind a heritage cottage is
     actually clad in, and the contrast that tells old from new at a glance. */
  charred: { color: '#2b2723', roughness: 0.74, metalness: 0 },
  deck: { color: '#8f7248', roughness: 0.9, metalness: 0 },
  roof: { color: '#1c4129', roughness: 0.5, metalness: 0.32 },
  glass: { color: '#5c6b60', roughness: 0.08, metalness: 0.1 },
  /* What sits behind the boards. The cladding is deliberately gapped so it
     reads as boards, and with nothing behind it every gap looked straight
     through the building. Against this the same gaps become the shadow line a
     weatherboard actually casts. */
  shadow: { color: '#4a3a25', roughness: 0.95, metalness: 0 },
}

/** Lit glazing. Warm, and the only light in either scene. */
export const GLASS_EMISSIVE = '#ffc178'

/** For the SVG stills: a base and the colour it shades towards. */
export const TONE: Record<MaterialKey, { base: string; shade: string }> = {
  frame: { base: '#9a7b4f', shade: '#4a3d2a' },
  clad: { base: '#ab8354', shade: '#4f3f28' },
  charred: { base: '#3b3630', shade: '#15130f' },
  deck: { base: '#8f7248', shade: '#443722' },
  roof: { base: '#2c503a', shade: '#0e2116' },
  glass: { base: '#ffd7a2', shade: '#b58048' },
  shadow: { base: '#4a3a25', shade: '#221a10' },
}

/** Bellewood Green, used for every line in both scenes. */
export const LINE_COLOUR = '#1c4129'
