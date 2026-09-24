import { photo } from './photos'

/**
 * The project showcase.
 *
 * EVERY image on this site is a slot defined here. Adding a photograph is a
 * data edit, not a layout rebuild: drop the file into `src/assets/projects/`
 * and name it below. The names are bare — `kalinga-1`, no folder and no
 * extension — and `photo` in ./photos turns each one into the URL the bundler
 * gave the file.
 *
 * THE PHOTOGRAPHS ARE ANGUS'S OWN. Twelve arrived on 25 September 2026,
 * covering six jobs. They are named by suburb only: the files he sent carry
 * his clients' surnames, and those stay off the site and out of the
 * repository (the originals are ignored by git; see .gitignore).
 *
 * WHAT IS AND IS NOT KNOWN. He sent photographs, not job details. So each
 * entry describes what is in the photograph and nothing more — no dates, no
 * scope he has not stated, no story of what the house was before. `kind` is
 * the kind of house, not the kind of work, for the same reason. When he
 * confirms what each job involved, `scope`, `architect`, `duration` and
 * `year` are waiting, and the stories can grow. Before-and-after pairs need
 * before photographs, which he has not sent; the comparison hides itself
 * until both halves exist.
 */

/** True while any project is carrying stock imagery. None is: every photograph
 *  on the site is the client's own. Testimonials have their own flag. */
export const mediaIsPlaceholder = false

/**
 * THE BEFORE PHOTOGRAPHS ARE PLACEHOLDERS. Angus sent finished photographs
 * only, so every project's `before` is its own `after` faded to monochrome —
 * named `<slug>-before-placeholder` — standing in so the comparison can be
 * reviewed. The comparison labels itself as a placeholder while this is true.
 * When a real before photograph lands for a project, point its `before` at
 * the real file; when the last one does, set this to false and delete the
 * `-before-placeholder` files. Never pair a stock photograph with his: that
 * would present somebody else's house as the start of his job.
 */
export const beforeIsPlaceholder = true

export type ImageSlot = {
  /** A resolved photograph URL from `photo`, or null for the empty ground. */
  src: string | null
  alt: string
}

export type Project = {
  slug: string
  title: string
  suburb: string
  /** Short label for the kind of work. Kept factual and general. */
  kind: string
  /** OPEN: completion year. Null until confirmed, and never guessed. */
  year: string | null
  /** One line for the index card. */
  summary: string
  /** Long-form story, set in Newsreader. */
  story: string[]
  /**
   * The facts of the job, for when they are known. All optional, and nothing
   * renders until they are filled — so a real write-up drops straight in
   * without a layout change. The shape to fill: what was done (three to six
   * short items), who drew it, and how long it took on site.
   */
  scope?: string[]
  /** The architect or designer, credited by name only with their agreement. */
  architect?: string | null
  /** Time on site, in his words: "seven months", "a year with the lift". */
  duration?: string | null
  hero: ImageSlot
  before: ImageSlot
  after: ImageSlot
  gallery: ImageSlot[]
  /** True while this entry is carrying placeholder content or imagery. */
  placeholder: boolean
  /**
   * Shown in the "Selected work" section on the home page.
   *
   * Three, not six. Six was chosen when the home page laid these out as a grid
   * of cards — three across, two clean rows, no orphan at any breakpoint — and
   * that reasoning was about the grid, not about the page. It had two costs:
   * the home page showed exactly what /work shows, so the link at the bottom
   * led nowhere new, and six photographs sharing a screen meant none of them
   * was ever bigger than a postcard.
   *
   * They are now three full-width bands. Fewer, and each large enough to
   * actually be looked at. The home page is a selection; /work is the index.
   * Leave this at three as the library grows.
   */
  featured: boolean
}

/* The bare file name, not a path. `photo` resolves it through the bundler —
   see src/data/photos.ts for why that matters. */
const img = (file: string, alt: string): ImageSlot => ({ src: photo(file), alt })
/* An empty slot, for a photograph that does not exist yet. Unused while every
   slot on the site holds a photograph; kept for the next project without one. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const none = (alt: string): ImageSlot => ({ src: null, alt })
export { none as emptySlot }

/* WRITING THE REAL STORIES. Each entry's `story` is placeholder until Angus
   supplies the job; the shape to write to is: what the house was, what the
   constraint was, what was kept, what was rebuilt, and how it lives now. Where
   a before photograph exists, lead with it — heritage before-and-after is the
   strongest material this business owns. Guidance lives HERE and not in the
   story arrays: a note in the array renders on the page, and it did. */
export const projects: Project[] = [
  {
    slug: 'kalinga',
    title: 'Kalinga',
    suburb: 'Kalinga',
    kind: 'Two-storey Queenslander',
    year: null,
    summary: 'A two-storey Queenslander behind a white picket fence, verandahs on both levels.',
    story: [
      'Double verandahs across the full width of the house, on turned posts with fretwork brackets at every head, and French doors opening onto the upper deck. The whole house in one pale colour under a corrugated roof, and a picket fence and gate to the street in the same white as the balustrades.',
    ],
    hero: img('kalinga-1', 'A two-storey Queenslander with verandahs on both levels, behind a white picket fence'),
    before: img('kalinga-before-placeholder', 'Placeholder for the before photograph, which is still to come: the finished house, faded to monochrome'),
    after: img('kalinga-1', 'The finished house'),
    gallery: [],
    placeholder: false,
    featured: true,
  },
  {
    slug: 'auchenflower',
    title: 'Auchenflower',
    suburb: 'Auchenflower',
    kind: 'Queenslander, two levels',
    year: null,
    summary: 'A Queenslander over two levels, with a verandah that looks across the suburb to the city.',
    story: [
      'From the garden: a gabled verandah on the upper level, the house carried on posts over an open lower floor with the dining table under it, and the original weatherboard wing running off to the side with its sash windows and window hoods.',
      'Inside, the house is lined in vertical boards throughout — the kitchen with its long island and pendant lights, the stair landing with its timber handrail, the hallway with a glazed door onto the wine room, and the bathroom with its patterned wallpaper. The upper verandah is furnished as a room, with the city on the skyline.',
    ],
    hero: img('auchenflower-5', 'The rear of a two-storey Queenslander: a gabled upper verandah over an open lower level, the weatherboard wing beside it'),
    before: img('auchenflower-before-placeholder', 'Placeholder for the before photograph, which is still to come: the finished house, faded to monochrome'),
    after: img('auchenflower-5', 'The finished house'),
    gallery: [
      img('auchenflower-4', 'The upper verandah furnished as an outdoor room, with the city on the skyline beyond the balustrade'),
      img('auchenflower-2', 'A kitchen lined in vertical boards, with a long navy island under two pendant lights'),
      img('auchenflower-3', 'A stair landing with a timber handrail, white balusters and sash windows'),
      img('auchenflower-6', 'A hallway with a glazed door onto a lit wine room'),
      img('auchenflower-1', 'A bathroom vanity with a marble top, brass tapware and patterned wallpaper'),
    ],
    placeholder: false,
    featured: true,
  },
  {
    slug: 'clayfield',
    title: 'Clayfield',
    suburb: 'Clayfield',
    kind: 'Two-storey character home',
    year: null,
    summary: 'A two-storey character home at dusk, its verandah and lattice lit from within.',
    story: [
      'The street front: a full-width verandah on the upper level with a timber balustrade on turned posts, a lattice frieze beneath it, two round windows either side of the entry, and a low fence with a wrought-iron gate. The lights are on inside.',
    ],
    hero: img('clayfield-1', 'The front of a two-storey character home at dusk, verandah and lattice lit from within, a wrought-iron gate at the street'),
    before: img('clayfield-before-placeholder', 'Placeholder for the before photograph, which is still to come: the finished house, faded to monochrome'),
    after: img('clayfield-1', 'The finished house'),
    gallery: [],
    placeholder: false,
    featured: true,
  },
  {
    slug: 'ascot',
    title: 'Ascot',
    suburb: 'Ascot',
    kind: 'Character home',
    year: null,
    summary: 'A character home in Ascot: a navy front door under a fanlight, and a window seat in the front room.',
    story: [
      'The entry: a pair of glazed doors in deep navy under a fanlight, on a verandah lined in vertical boards. Inside, the front room is lined the same way, with a window seat set into the bay under three sash windows and the timber floor running through.',
    ],
    hero: img('ascot-2', 'A front room with a cushioned window seat set into a bay of three sash windows, timber floor and lined walls'),
    before: img('ascot-before-placeholder', 'Placeholder for the before photograph, which is still to come: the finished house, faded to monochrome'),
    after: img('ascot-2', 'The finished house'),
    gallery: [img('ascot-1', 'A pair of navy glazed front doors under a fanlight, on a verandah lined in vertical boards')],
    placeholder: false,
    featured: false,
  },
  {
    slug: 'windsor',
    title: 'Windsor',
    suburb: 'Windsor',
    kind: 'Family home',
    year: null,
    summary: 'A living room under a coffered ceiling, opening through full-height glass to the deck and the view.',
    story: [
      'One long room: a coffered ceiling overhead, wide timber boards underfoot, a stone-clad fireplace wall with the television set into it, timber shelving beside it, and full-height glazing along the far side opening onto a deck with the suburb below.',
    ],
    hero: img('windsor-1', 'A living room under a coffered ceiling, with a stone fireplace wall, timber shelving and full-height glass onto a deck'),
    before: img('windsor-before-placeholder', 'Placeholder for the before photograph, which is still to come: the finished house, faded to monochrome'),
    after: img('windsor-1', 'The finished house'),
    gallery: [],
    placeholder: false,
    featured: false,
  },
  {
    slug: 'camp-hill',
    title: 'Camp Hill',
    suburb: 'Camp Hill',
    kind: 'New homes',
    year: null,
    summary: 'A pair of new homes side by side, in weatherboard, brick and timber.',
    story: [
      'Two houses on neighbouring blocks, photographed at dusk with the lights on: one in horizontal weatherboard with a timber-screened balcony over a garage, the other in vertical board over a brick base. The one departure on this site from older homes.',
    ],
    hero: img('camp-hill-1', 'Two new homes side by side at dusk, one in weatherboard with a timber-screened balcony, the other in vertical board over brick'),
    before: img('camp-hill-before-placeholder', 'Placeholder for the before photograph, which is still to come: the finished house, faded to monochrome'),
    after: img('camp-hill-1', 'The finished house'),
    gallery: [],
    placeholder: false,
    featured: false,
  },
]

export const featuredProjects = projects.filter((p) => p.featured)

export const getProject = (slug: string): Project | undefined =>
  projects.find((p) => p.slug === slug)

/** A before-and-after only makes sense when both halves exist. */
export const hasBeforeAfter = (p: Project) => Boolean(p.before.src && p.after.src)

/** Loose imagery used outside the project list, on exactly the same terms. */
export const stills = {
  /**
   * The hero photograph sets the colour of the entire page, so it is chosen
   * against the brand as much as for the subject: warm, heritage, out of blue.
   * Kalinga — a two-storey Queenslander in one pale colour behind a white
   * picket fence — is the house this business is about.
   */
  hero: img('kalinga-1', 'A two-storey Queenslander with verandahs on both levels, behind a white picket fence'),
  /** The About page plate: the Auchenflower verandah, a room with the city in it. */
  onSite: img('auchenflower-4', 'A verandah furnished as an outdoor room, with the city on the skyline beyond the balustrade'),
  /**
   * The detail plate on the home page, beside the drawing of the cottage. It
   * was a stock photograph of a wall frame being lifted, captioned as the
   * build going up; there is no photograph of that yet. The Auchenflower stair
   * stands in — lined walls, sash windows, a timber rail — and the caption
   * says what it shows.
   */
  detail: img('auchenflower-3', 'A stair landing lined in vertical boards, with a timber handrail and sash windows'),
}
