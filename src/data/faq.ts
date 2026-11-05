/**
 * The questions people ask a builder before they ring one.
 *
 * WHY THIS EXISTS. Angus asked for the site to be "loaded up" so he can read it
 * and change the wording where he wants it different. Everything else on the
 * site is written to be looked at; this is written to be read, and it is the
 * page where his own voice will end up doing the most work. It is also the part
 * a person reads at eleven at night when they are deciding whether their house
 * is worth keeping.
 *
 * WHAT IS IN HERE. Only what the file supports: he is a sole operator, on site
 * on his own jobs; he runs about four projects a year; the work is mostly
 * heritage and older homes in inner Brisbane, built predominantly in timber,
 * plus apartment refurbishments in Brisbane and on the coast; he works from
 * architect and designer documents; he quotes scope and price in writing; a
 * missed call gets a text back; he is QBCC licensed, 1014350.
 *
 * WHAT IS DELIBERATELY NOT IN HERE, because answering it would mean inventing
 * something he has to stand behind. Ask him, then add:
 *   - the smallest job he will take, and whether there is a price floor
 *   - how far out the diary actually is right now
 *   - the defects period he offers beyond the statutory one
 *   - whether he prefers fixed price or cost plus, and when
 *   - which architects and designers he will name as regular collaborators
 *
 * Every answer here is his to rewrite. The questions are the useful part: they
 * are the ones he will recognise from site visits.
 */

export type Question = {
  q: string
  /** Answer paragraphs. Two at most — this is a read, not an essay. */
  a: string[]
}

export const faq: Question[] = [
  {
    q: 'What kind of work do you take on?',
    a: [
      'Mostly renovations, extensions and restorations to older homes in inner Brisbane, including worker’s cottages, Queenslanders and post-war houses. We also lift houses and build underneath them.',
      'We take on apartment refurbishments in Brisbane and on the Sunshine Coast too.',
    ],
  },
  {
    q: 'Do I need an architect before I call you?',
    a: [
      'No. You can call with an idea before you have drawings. We’ll discuss what you want to do and what you might need next.',
      'If you’re already working with an architect or designer, we can review their documents with you.',
    ],
  },
  {
    q: 'Who is actually on site?',
    a: [
      'Angus runs the build and is on site on his own jobs. You deal with him from the first visit through to handover.',
      'We take on around four projects a year.',
    ],
  },
  {
    q: 'How do you price a job?',
    a: [
      'We look at the house and the available drawings, then provide a written quote setting out the work, price and exclusions.',
      'You can review it in your own time and ask about anything that needs explaining.',
    ],
  },
  {
    q: 'What happens when something in the drawings does not work on site?',
    a: [
      'Existing buildings can differ from the drawings, and some conditions only become visible during construction.',
      'We raise these issues with you and your architect or designer in writing, so you can discuss the options before the affected work proceeds.',
    ],
  },
  {
    q: 'Do you work on character and heritage houses?',
    a: [
      'Yes. Most of our work is on heritage and older homes in inner Brisbane. We work with your architect or designer on the details of the existing house and the proposed changes.',
    ],
  },
  {
    q: 'How long does a renovation take?',
    a: [
      'The scope of work, the condition of the house and the stage of the drawings all affect the timing.',
      'Tell Angus if you have a deadline. We’ll discuss availability early and let you know whether it fits.',
    ],
  },
  {
    q: 'Are you licensed and insured?',
    a: [
      'Yes. Our company QBCC licence is 1014350. Ask Angus about the insurance and home warranty cover for your project.',
      'The licensed company is Angus Cowan Constructions Pty Ltd, trading as Bellewood Constructions.',
    ],
  },
  {
    q: 'Where do you work?',
    a: [
      'Our house projects are mostly in inner Brisbane. We also refurbish apartments in Brisbane and on the Sunshine Coast. Call Angus to discuss a project outside these areas.',
    ],
  },
  {
    q: 'What is the quickest way to reach you?',
    a: [
      'Call Angus. If he’s on site and can’t answer, you’ll get a text back. You can also use the enquiry form on the Contact page.',
    ],
  },
]
