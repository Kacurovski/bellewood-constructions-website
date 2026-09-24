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
    lead: 'Making an old house work as a home again, without losing what made it worth keeping.',
    body:
      'Kitchens, bathrooms, living spaces and the services behind them, brought up to standard inside a house whose bones are worth the trouble. The original detail is repaired and matched rather than replaced where it can be.',
  },
  {
    title: 'Extension',
    lead: 'New rooms behind or beside the original, so the street still sees the house it always has.',
    body:
      'Most extensions to older Brisbane houses go out the back and open to the north, and the join between old and new is the whole job. It is drawn to be honest about which is which, and built so the original roof still reads from the footpath.',
  },
  {
    title: 'Lift and build-under',
    lead: 'Raising the house and building a new level beneath it.',
    body:
      'The Brisbane way to double a house without touching its face. The original goes up on new stumps, a new ground floor is framed in timber underneath, and the house you see from the street is the same house, higher.',
  },
  {
    title: 'Restoration',
    lead: 'Putting a house back the way it was built, with modern services behind it.',
    body:
      'Verandahs brought back to their proper line, sashes rebuilt, boards lifted and relaid, fretwork and brackets repaired or remade to match. The parts nobody sees — wiring, plumbing, structure — are done properly at the same time.',
  },
  {
    title: 'Character and heritage work',
    lead: 'Houses in a character overlay, and what can and cannot be done to them.',
    body:
      'Much of inner Brisbane sits in a character or heritage overlay, and the rules for the street elevation are not the rules for the back. Most of the work on this site is exactly this kind: keep and repair what the street sees, put the new work behind it.',
  },
  {
    title: 'Apartment refurbishment',
    lead: 'Full interior refurbishments, in Brisbane and on the Sunshine Coast.',
    body:
      'Not the main work, but done to the same standard, and by the same builder. Apartments bring their own constraints — body corporate, access, working hours — and those are handled as part of the job rather than as surprises.',
  },
]
