/**
 * Layout samples, not collected client reviews.
 * Keep the visible draft notice and console warning while any placeholder is true.
 * Replace these with verified, approved client quotes before publication.
 * Real quotes must retain the client's wording and accurate attribution.
 */

export type Testimonial = {
  /** The client's own words. Two or three sentences is plenty. */
  quote: string
  /** How they are credited. A full name only with their written permission. */
  name: string
  /** Suburb and the kind of work, e.g. "Paddington · Renovation". */
  detail: string
  /** True while this is written copy rather than a real client's words. */
  placeholder: boolean
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'We had been told the front of the house would have to come out. Angus found a way to keep it, and the rooms we actually loved are still there. He was on site himself most days.',
    name: 'Homeowner',
    detail: 'Paddington · Renovation',
    placeholder: true,
  },
  {
    quote:
      'He rang us about the subfloor before it turned into a variation, with two options and what each one would cost. That phone call was the whole job in miniature. Nothing was ever a surprise.',
    name: 'Homeowner',
    detail: 'Ashgrove · Extension',
    placeholder: true,
  },
  {
    quote:
      'He builds what is drawn. Where something in the documentation does not work he asks before he improvises, which is rarer than it should be. I have sent him more than one project since.',
    name: 'Architect',
    detail: 'Inner Brisbane',
    placeholder: true,
  },
]

/** True while any entry above is written copy rather than a real client's words. */
export const testimonialsArePlaceholder = testimonials.some((t) => t.placeholder)
