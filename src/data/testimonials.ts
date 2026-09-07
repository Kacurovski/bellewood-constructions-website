/**
 * What past clients say.
 *
 * ===========================================================================
 * !!! THESE ARE NOT REAL. THEY MUST BE REPLACED BEFORE THIS SITE PUBLISHES !!!
 *
 * They are written to read naturally so the page can be reviewed as finished
 * work, and there is deliberately nothing on the page itself that marks them as
 * placeholder. That makes them the single most dangerous thing in this repo:
 * a fabricated endorsement of a real, licensed business reads as a real one.
 *
 * Publishing them would be a fake review. In Australia that is misleading
 * conduct under the ACL and the ACCC pursues it.
 *
 * Two safeguards, since the page carries no warning:
 *   - `testimonialsArePlaceholder` below logs a warning to the browser console
 *     on every load while it is true.
 *   - The README carries it as an open item.
 *
 * Attributions are a role and a suburb rather than invented full names. No
 * fictional person is created here, and it is how a builder normally credits a
 * client anyway.
 *
 * When the real ones arrive: replace `quote`, `name` and `detail`, set every
 * `placeholder` to false. Get written permission for the name and suburb first.
 * ===========================================================================
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
      'He rang us about the subfloor before it turned into a variation — two options, and what each one would cost. That phone call was the whole job in miniature. Nothing was ever a surprise.',
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
