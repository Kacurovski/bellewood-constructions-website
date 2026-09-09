/**
 * The project showcase.
 *
 * EVERY image on this site is a slot defined here. Swapping in the real
 * photography is a data edit, not a layout rebuild: drop files into
 * `public/projects/` and change the paths below. Nothing else changes.
 *
 * ===========================================================================
 * THE IMAGERY BELOW IS PLACEHOLDER. IT MUST NOT PUBLISH.
 *
 * These are stock photographs (Unsplash licence: free for commercial use, no
 * attribution required) standing in until Angus supplies the real library. They
 * are here so the design can be reviewed with something in it, and for no other
 * reason.
 *
 * Publishing them would present other people's buildings as Bellewood's work.
 * That is the one thing on this site that would actually be dishonest, so:
 *
 *   - every entry keeps `placeholder: true` until its real photography lands
 *   - `mediaIsPlaceholder` below is the single flag the site reads
 *   - the titles, suburbs and copy are STRUCTURE, not fact. No dollar values,
 *     dates, client names or testimonials have been invented, and none should
 *     be added without Angus confirming them
 *
 * When the real library arrives, per project: replace the paths, write real alt
 * text, fill in `year` if it is known, and set `placeholder: false`.
 * ===========================================================================
 */

/** True while any project is still carrying stock imagery. Flip when they all land. */
export const mediaIsPlaceholder = true

export type ImageSlot = {
  /** Path under public/, or null to render the designed empty ground. */
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

const img = (file: string, alt: string): ImageSlot => ({ src: `projects/${file}.jpg`, alt })
const none = (alt: string): ImageSlot => ({ src: null, alt })

export const projects: Project[] = [
  {
    slug: 'paddington-workers-cottage',
    title: 'Paddington cottage',
    suburb: 'Paddington',
    kind: 'Renovation and rear extension',
    year: null,
    summary:
      'A tight character block, an original cottage kept at the front and opened to the north at the rear.',
    story: [
      'The cottage had been added to twice before we got to it, both times badly, and both times in a way that turned its back on the north. The brief was to undo that without changing what the street sees.',
      'The front three rooms were kept and repaired: boards lifted, numbered and relaid, sashes rebuilt, the verandah brought back to its proper line. Everything new sits behind and stops short of the ridge, so the original roof still reads from the footpath.',
      'Placeholder copy. Replace with the real account once the details are confirmed. The shape to write to: what the house was, what the constraint was, what was kept, what was rebuilt, and how it lives now.',
    ],
    hero: img('paddington-after', 'A restored timber cottage at dusk behind a white picket fence'),
    before: img('paddington-before', 'A weatherboard cottage before work, paint failed and the yard overgrown'),
    after: img('paddington-after', 'The same cottage after restoration, lit from within at dusk'),
    gallery: [img('interior-dining', 'A dining room with timber floors and lined walls')],
    placeholder: true,
    featured: true,
  },
  {
    slug: 'new-farm-queenslander',
    title: 'New Farm Queenslander',
    suburb: 'New Farm',
    kind: 'Full renovation',
    year: null,
    summary:
      'Original VJ walls and hoop pine floors retained, with a new kitchen and living wing set behind.',
    story: [
      'A Queenslander that had been tenanted for thirty years and maintained for none of them. Structurally it was sound, which is usually the way with these houses. Everything else needed doing.',
      'Placeholder copy. Replace once confirmed. Heritage before and after is the strongest material this business owns, so where a before photograph exists, lead with it.',
    ],
    hero: img('newfarm-after', 'A Queenslander on stumps with a corrugated roof and timber battens'),
    before: img('newfarm-before', 'A weathered timber house with a failing corrugated roof'),
    after: img('newfarm-after', 'The Queenslander after renovation, roof and battens made good'),
    gallery: [img('interior-kitchen-windows', 'A kitchen opening to the garden through full-height windows')],
    placeholder: true,
    featured: true,
  },
  {
    slug: 'ashgrove-post-war-lift',
    title: 'Ashgrove lift and build-under',
    suburb: 'Ashgrove',
    kind: 'Lift, build-under and extension',
    year: null,
    summary:
      'The house raised, a new lower level framed in timber, and the street elevation left as it was found.',
    story: [
      'Lifting a house is the least interesting part of lifting a house. What matters is what goes in underneath, and whether the result still looks like it was always there.',
      'Placeholder copy. Replace once confirmed.',
    ],
    hero: img('ashgrove-after', 'A brick and render home with a tiled roof behind established hedges'),
    before: img('ashgrove-before', 'An older house overgrown and closed up before work began'),
    after: img('ashgrove-after', 'The house after lifting, building under and landscaping'),
    gallery: [img('interior-floor', 'Timber flooring running through to the kitchen')],
    placeholder: true,
    featured: false,
  },
  {
    slug: 'bardon-hillside-extension',
    title: 'Bardon hillside extension',
    suburb: 'Bardon',
    kind: 'Extension',
    year: null,
    summary:
      'A steep site handled with a light timber structure that steps down rather than cutting in.',
    story: [
      'The cheap way to build on a slope is to cut a flat pad and retain it. The better way, and the one the drawings called for, is to let the building step and leave the ground doing what it was doing.',
      'Placeholder copy. Replace once confirmed.',
    ],
    hero: img('detail-timber-cladding', 'Vertical timber cladding meeting a rendered wall on the extension'),
    before: img('bardon-before', 'A tired timber building on an open site before work'),
    after: img('detail-timber-cladding', 'The completed extension, timber cladding against render'),
    gallery: [
      img('bardon-after', 'The extension settled into established subtropical planting'),
      img('interior-kitchen-green', 'A kitchen with glazed green tiles and timber joinery'),
    ],
    placeholder: true,
    featured: true,
  },
  {
    slug: 'red-hill-cottage-restoration',
    title: 'Red Hill restoration',
    suburb: 'Red Hill',
    kind: 'Restoration',
    year: null,
    summary:
      'Original detail repaired and matched rather than replaced, with the services brought up to standard behind it.',
    story: [
      'Restoration work is mostly patience. Profiles get matched, not approximated. Where a board could be repaired it was repaired, and where it could not, the replacement was milled to the original section.',
      'Placeholder copy. Replace once confirmed.',
    ],
    hero: img('redhill-hero', 'A dining room in a restored cottage, dark walls and warm timber'),
    before: none('The Red Hill cottage before restoration'),
    after: none('The Red Hill cottage after restoration'),
    gallery: [img('interior-dining', 'A dining room lined and lit, the restored floor running through')],
    placeholder: true,
    featured: false,
  },
  {
    slug: 'coastal-apartment-refurbishment',
    title: 'Coastal apartment',
    suburb: 'Sunshine Coast',
    kind: 'Apartment refurbishment',
    year: null,
    summary:
      'A full interior refurbishment carried out to the same standard as the housing work.',
    story: [
      'An apartment is a different set of constraints to a house and the same set of standards. Everything comes up in a lift, nothing can be noisy before eight, and the finish still has to be right.',
      'Placeholder copy. Replace once confirmed.',
    ],
    hero: img('interior-kitchen-timber', 'An apartment kitchen with a long timber table and pendant lighting'),
    before: none('The coastal apartment before refurbishment'),
    after: none('The coastal apartment after refurbishment'),
    gallery: [img('coastal-hero', 'The island and joinery running the length of the kitchen')],
    placeholder: true,
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
   * against the brand as much as for the subject: warm, heritage, and out of
   * blue. The market this business is leaving is blue and grey, and a hero that
   * reads blue would undo the single most valuable decision in the identity.
   */
  hero: img('paddington-after', 'A restored cottage at dusk, lit from within, behind a white picket fence'),
  onSite: img('detail-timber-cladding', 'Vertical timber cladding meeting a rendered wall'),
  /**
   * The detail plate on the home page. It used to reach into Paddington's
   * gallery by index, which coupled a home page section to the second item of
   * one project's array — reorder that array and the home page changes. It is a
   * still in its own right now.
   *
   * It was `detail-roof-timber`, which at thumbnail size read as an exposed
   * timber roof and at full size was the Sydney Opera House. A recognisable
   * landmark on a Brisbane builder's page is worse than a generic stock photo:
   * generic reads as a placeholder, a landmark reads as a lie. That file is out
   * of the repo. **Check every placeholder at full size, not on a contact
   * sheet** — this one survived several passes because it was only ever looked
   * at small.
   */
  detail: img('site-frame-lift', 'A timber wall frame being lifted into place on site'),
}
