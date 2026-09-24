/**
 * One line drawing per kind of work, in the same construction as the mark: a
 * house drawn as a continuous outline, one stroke weight, nothing filled.
 * Each is a set of SVG path strings in a 64 x 48 box, drawn in order.
 *
 * They are deliberately plain. A pictogram that tries to illustrate the work
 * turns into clip art; one that draws the roofline the work touches reads as a
 * detail on the sheet.
 */
export const pictograms: Record<string, string[]> = {
  // The house, with the inside opened up: an interior wall and an opening.
  Renovation: [
    'M8 22 L32 6 L56 22',
    'M12 20 V42 H52 V20',
    'M32 42 V28',
    'M20 42 V32 H28',
  ],
  // The original at the front, the new room stepping out behind it.
  Extension: [
    'M6 22 L26 8 L46 22',
    'M10 20 V42 H42',
    'M42 24 H58 V42 H42',
    'M58 24 L50 16 H42',
  ],
  // The house up on new stumps, the new level framed beneath.
  'Lift and build-under': [
    'M10 18 L32 4 L54 18',
    'M14 16 V26 H50 V16',
    'M14 26 V44 M26 26 V44 M38 26 V44 M50 26 V44',
    'M8 44 H56',
    'M32 30 V38 M28 34 L32 38 L36 34',
  ],
  // The verandah: bullnose, posts, balustrade.
  Restoration: [
    'M8 22 C14 12 22 10 32 10 C42 10 50 12 56 22',
    'M12 22 V44 M52 22 V44',
    'M12 34 H52',
    'M20 34 V44 M28 34 V44 M36 34 V44 M44 34 V44',
  ],
  // A street: two houses side by side and the fence line in front.
  'Character and heritage work': [
    'M4 24 L18 12 L32 24',
    'M32 24 L46 12 L60 24',
    'M8 22 V36 H28 V22',
    'M36 22 V36 H56 V22',
    'M4 42 H60',
  ],
  // Three floors, stacked.
  'Apartment refurbishment': [
    'M16 44 V6 H48 V44',
    'M16 18 H48 M16 31 H48',
    'M24 10 V14 M32 10 V14 M40 10 V14',
    'M24 23 V27 M32 23 V27 M40 23 V27',
    'M24 36 V40 M40 36 V40',
    'M8 44 H56',
  ],
}
