/**
 * What we take on: the six kinds of work, each described.
 *
 * The site said "renovations, extensions and restorations" in several places
 * and never once said what those words mean for an older Brisbane house, or
 * that lifting a house, character work and apartment refurbishment sit in the
 * same list. This is that list. It is the section a person reads to find out
 * whether their job is the kind of job this builder does.
 *
 * Everything here is supported by the file: the work profile in the brand
 * notes (heritage and older homes in inner Brisbane, predominantly timber,
 * apartment refurbishments in Brisbane and on the coast) and the kinds of work
 * the project index already lists. Nothing claims a job he has not described.
 *
 * Angus will rewrite these. The order is deliberate — the most common work
 * first, the apartment work last because it is the exception — and worth
 * keeping unless he says otherwise.
 */

export type Service = {
  title: string
  /** One line: what it is, in the plainest terms. */
  lead: string
  /** Two or three sentences at most. */
  body: string
}

export const services: Service[] = [
  {
    title: 'Renovation',
    lead: 'Updating an older home to suit the people living in it.',
    body:
      'Kitchens, bathrooms and living spaces, along with the plumbing, wiring and structural work they need. Original details are repaired or matched where possible.',
  },
  {
    title: 'Extension',
    lead: 'Adding rooms behind or beside the existing house.',
    body:
      'An extension can add living space, bedrooms or a connection to the garden. We work from your architect’s or designer’s drawings, paying attention to where the addition meets the existing building.',
  },
  {
    title: 'Lift and build-under',
    lead: 'Raising the house and building a new level beneath it.',
    body:
      'The existing house is raised and supported while a new ground floor is built below. The work brings together the structure, stairs and connections between the two levels.',
  },
  {
    title: 'Restoration',
    lead: 'Repairing the original fabric and details of an older house.',
    body:
      'Verandahs, sash windows, floorboards, fretwork and brackets can be repaired or remade to match. Structural repairs, wiring and plumbing are considered alongside the visible work.',
  },
  {
    title: 'Character and heritage work',
    lead: 'Renovations that retain the features of character and heritage homes.',
    body:
      'We work with your architect or designer to carry out the specified repairs and additions, including the timber profiles, windows and verandah details that need to be retained or matched.',
  },
  {
    title: 'Apartment refurbishment',
    lead: 'Full interior refurbishments, in Brisbane and on the Sunshine Coast.',
    body:
      'Apartment work needs planning around building access, body corporate requirements and permitted working hours. We discuss these arrangements as part of the job.',
  },
]
