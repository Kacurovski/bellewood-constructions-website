import { photo } from './photos'
import { projectPhotos } from './photoLibrary'

/** All photographs come from the nine named project_photos subfolders.
 * See scripts/photo-catalog.json for source hashes and build_photo_library.py
 * for reproducible web derivatives. Loose files and simulated before images
 * are excluded. Project descriptions reflect visible features only.
 */

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
  /** Selected work on the home page: five projects with their photo galleries. */
  featured: boolean
}

const img = (file: string, alt: string): ImageSlot => ({ src: photo(file), alt })
const none = (alt: string): ImageSlot => ({ src: null, alt })
export { none as emptySlot }

export const projects: Project[] = [
  {
    slug: 'kalinga',
    title: 'Kalinga',
    suburb: 'Kalinga',
    kind: 'Two-storey Queenslander',
    year: null,
    summary: 'A two-storey Queenslander behind a white picket fence, verandahs on both levels.',
    story: [
      'Verandahs span both levels of this Queenslander, with French doors opening onto the upper deck. White timber detailing continues from the balustrades to the front fence and gate.',
    ],
    hero: projectPhotos['kalinga'][0],
    before: none('No verified before photograph supplied'),
    after: projectPhotos['kalinga'][0],
    gallery: projectPhotos['kalinga'].filter((_, index) => index !== 0),
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
      'A gabled verandah overlooks the garden, with a sheltered dining area beneath it. Alongside, the weatherboard wing retains its sash windows and window hoods.',
      'Vertical boards line the interior. The kitchen has a long island and pendant lights, while the stair landing has a timber handrail. A glazed door opens onto the wine room, and patterned wallpaper finishes the bathroom. The furnished upper verandah looks towards the city.',
    ],
    hero: projectPhotos['auchenflower'][13],
    before: none('No verified before photograph supplied'),
    after: projectPhotos['auchenflower'][13],
    gallery: projectPhotos['auchenflower'].filter((_, index) => index !== 13),
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
      'A full-width upper verandah sits above decorative latticework, with two round windows framing the entrance below. A low fence and wrought-iron gate complete the street frontage.',
    ],
    hero: projectPhotos['clayfield'][4],
    before: none('No verified before photograph supplied'),
    after: projectPhotos['clayfield'][4],
    gallery: projectPhotos['clayfield'].filter((_, index) => index !== 4),
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
      'Deep navy glazed doors sit beneath a fanlight on the verandah. Inside, timber floors lead into a front room with a window seat beneath three sash windows.',
    ],
    hero: projectPhotos['ascot'][8],
    before: none('No verified before photograph supplied'),
    after: projectPhotos['ascot'][8],
    gallery: projectPhotos['ascot'].filter((_, index) => index !== 8),
    placeholder: false,
    featured: true,
  },
  {
    slug: 'windsor',
    title: 'Windsor',
    suburb: 'Windsor',
    kind: 'Family home',
    year: null,
    summary: 'A living room under a coffered ceiling, opening through full-height glass to the deck and the view.',
    story: [
      'A coffered ceiling and timber floors define the living room, which opens onto a broad deck overlooking the suburb. A stone-clad fireplace and fitted timber shelving sit along one wall.',
    ],
    hero: projectPhotos['windsor'][7],
    before: none('No verified before photograph supplied'),
    after: projectPhotos['windsor'][7],
    gallery: projectPhotos['windsor'].filter((_, index) => index !== 7),
    placeholder: false,
    featured: true,
  },
  {
    slug: 'camp-hill',
    title: 'Camp Hill',
    suburb: 'Camp Hill',
    kind: 'New homes',
    year: null,
    summary: 'A pair of new homes side by side, in weatherboard, brick and timber.',
    story: [
      'Two neighbouring homes use weatherboard, brick and timber in different ways. One has a timber-screened balcony above the garage; the other combines vertical cladding with a brick base.',
    ],
    hero: projectPhotos['camp-hill'][8],
    before: none('No verified before photograph supplied'),
    after: projectPhotos['camp-hill'][8],
    gallery: projectPhotos['camp-hill'].filter((_, index) => index !== 8),
    placeholder: false,
    featured: false,
  },
  {
    slug: 'bardon',
    title: 'Bardon',
    suburb: 'Bardon',
    kind: "Home among the trees",
    year: null,
    summary: "Timber floors, exposed beams and wide openings connect the kitchen to a sheltered deck and pool.",
    story: ["The kitchen and living room share a timber floor beneath exposed ceiling beams. Wide glazed openings lead onto a covered deck, with the pool and mature trees alongside.", "Timber continues through the kitchen cabinetry, stair and bathroom vanity. Outside, the raised weatherboard house sits among the trees, with sheltered walkways and views back towards the garden."],
    hero: projectPhotos['bardon'][0],
    before: none('No verified before photograph supplied'),
    after: projectPhotos['bardon'][0],
    gallery: projectPhotos['bardon'].filter((_, index) => index !== 0),
    placeholder: false,
    featured: false,
  },
  {
    slug: 'wilston',
    title: 'Wilston',
    suburb: 'Wilston',
    kind: "Queenslander, inside and out",
    year: null,
    summary: "A gabled Queenslander with bright living spaces, covered outdoor dining and a garden pool.",
    story: ["A white picket fence and gabled street frontage introduce the house. Inside, timber floors connect the kitchen, dining and living spaces, with large windows and white cabinetry keeping the rooms light.", "At the rear, sliding doors connect a sitting room to the covered outdoor dining area. The terrace looks onto the lawn and pool, with an outdoor kitchen tucked beneath the upper level."],
    hero: projectPhotos['wilston'][9],
    before: none('No verified before photograph supplied'),
    after: projectPhotos['wilston'][9],
    gallery: projectPhotos['wilston'].filter((_, index) => index !== 9),
    placeholder: false,
    featured: false,
  },
  {
    slug: 'yeronga',
    title: 'Yeronga',
    suburb: 'Yeronga',
    kind: "Character home",
    year: null,
    summary: "Weatherboard verandahs, polished timber floors and leadlight windows, with a pool and lawn behind the house.",
    story: ["Front stairs rise between the weatherboard wings to a sheltered verandah. Inside, polished timber floors lead through the hallway to the kitchen, and leadlight windows frame a bathroom with a clawfoot bath.", "The rear opens onto a lawn and pool beneath two levels of verandahs. Alongside the traditional painted joinery, a contemporary bathroom combines timber cabinetry, dark tiles and glass."],
    hero: projectPhotos['yeronga'][4],
    before: none('No verified before photograph supplied'),
    after: projectPhotos['yeronga'][4],
    gallery: projectPhotos['yeronga'].filter((_, index) => index !== 4),
    placeholder: false,
    featured: false,
  },
]

export const featuredProjects = projects.filter((p) => p.featured)

export const getProject = (slug: string): Project | undefined =>
  projects.find((p) => p.slug === slug)

/** A before-and-after only makes sense when both halves exist. */
export const hasBeforeAfter = (p: Project) => Boolean(p.before.src && p.after.src)

/** Approved project photographs used outside the project index. */
export const stills = {
  hero: projectPhotos.kalinga[0],
  onSite: projectPhotos.auchenflower[12],
  preEnquiry: projectPhotos.windsor[3],
  approachClosing: projectPhotos.bardon[3],
  detail: projectPhotos.auchenflower[11],
}

// Version one: the first five Ascot photographs in ascending filename order.
// Web-sized copies rebuilt from the approved Ascot subfolder.
// The original camera filenames stay in the private source folder.
// Focal points are normalized image coordinates, chosen from visible architecture.
// Placements leave the hall arch, kitchen island and verandah furniture clear.
export type HeroFrame = {
  src: string
  alt: string
  room: string
  title: string
  body: string
  placement: 'left' | 'upperLeft' | 'upperRight'
  focus: [number, number]
  position: string
}

export const ascotHeroFrames: HeroFrame[] = [
  {
    src: photo('ascot-01'),
    alt: 'Ascot entry hall, with timber floors, an ornamental arch and a blue front door.',
    room: 'The arrival',
    title: 'Heritage, lived in.',
    body: 'Renovations and extensions for Brisbane homes. Built in timber, with care for what makes them yours.',
    placement: 'left',
    focus: [0.48, 0.49],
    position: '48% 50%',
  },
  {
    src: photo('ascot-02'),
    alt: 'The Ascot kitchen with a stone island, white cabinetry and plantation shutters.',
    room: 'The kitchen',
    title: 'A place to come together.',
    body: 'Stone benchtops and timber cabinetry in a kitchen made for everyday use.',
    placement: 'upperLeft',
    focus: [0.49, 0.54],
    position: '50% 50%',
  },
  {
    src: photo('ascot-03'),
    alt: 'An open living room connecting the Ascot kitchen to the verandah.',
    room: 'The connection',
    title: 'Room to open up.',
    body: 'Living spaces connected by timber floors, daylight and an open outlook.',
    placement: 'upperRight',
    focus: [0.29, 0.52],
    position: '40% 50%',
  },
  {
    src: photo('ascot-04'),
    alt: 'Timber-framed sofas and a dining table on the covered Ascot verandah.',
    room: 'The verandah',
    title: 'Life, a little further out.',
    body: 'A sheltered verandah, made for long afternoons above the treetops.',
    placement: 'upperLeft',
    focus: [0.57, 0.50],
    position: '50% 50%',
  },
  {
    src: photo('ascot-05'),
    alt: 'Looking from the Ascot verandah into the living room and kitchen through wide sliding doors.',
    room: 'The whole home',
    title: 'Every room. One home.',
    body: 'From the first conversation to the finishing details. Bellewood Constructions, Brisbane.',
    placement: 'upperLeft',
    focus: [0.61, 0.49],
    position: '60% 50%',
  },
]


/** Home-page photo stories. Captions describe visible details, not inferred project history. */
export const photographyStories = {
  proposition: {
    reference: img('auchenflower-14', 'The Auchenflower house: a large gabled verandah above an open terrace, beside a smaller gabled weatherboard wing'),
  },
  living: {
    main: img('bardon-01', 'The Bardon kitchen, with timber cabinetry and floors opening onto a covered deck'),
    detail: img('yeronga-03', 'Leadlight windows, lined walls and a freestanding bath at Yeronga'),
    exterior: img('windsor-07', 'The Windsor street facade and landscaped front garden'),
  },
  craft: {
    overview: img('auchenflower-12', 'A timber stair handrail, white balusters and sash windows at Auchenflower'),
    details: [
      {
        project: 'Bardon',
        title: 'Timber & joinery',
        note: 'Timber cabinetry, floorboards and the edge of the kitchen island.',
        crop: img('bardon-joinery-detail', 'A close view of timber cabinetry and floorboards in the Bardon kitchen'),
        full: img('bardon-01', 'The complete Bardon kitchen and its connection to the covered deck'),
      },
      {
        project: 'Yeronga',
        title: 'Light & character',
        note: 'Leadlight glass set within painted timber window frames.',
        crop: img('yeronga-window-detail', 'Leadlight glass and painted timber window framing at Yeronga'),
        full: img('yeronga-03', 'The complete Yeronga bathroom, with leadlight windows and a freestanding bath'),
      },
    ],
  },
}
