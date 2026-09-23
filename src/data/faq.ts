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
      'Renovations, extensions and restorations to houses in inner Brisbane, and most of them are heritage or older homes — worker’s cottages, Queenslanders, post-war houses worth keeping. Lifting a house and building under it is part of that. So is opening the back of a cottage to the north without touching what the street sees.',
      'Alongside the houses there are apartment refurbishments, in Brisbane and on the coast, done to the same standard.',
    ],
  },
  {
    q: 'Do I need an architect before I call you?',
    a: [
      'No. Plenty of conversations start with a house, a rough idea and no drawings at all. If that is where you are, call and we will talk about whether the idea works and what it would take to find out.',
      'If you already have an architect or designer, better again. We build to their documents, and the earlier we see them the more useful we are.',
    ],
  },
  {
    q: 'Who is actually on site?',
    a: [
      'Angus. This is a one-builder business by choice, not by size — he is on his own jobs, and the person you meet at the first visit is the person running the build.',
      'That is also why there are only about four projects a year. It is as many as one builder can run properly.',
    ],
  },
  {
    q: 'How do you price a job?',
    a: [
      'After a look at the house and whatever drawings exist, you get scope and price in writing. Not a number over the phone, and not a figure you have to decide on while somebody is standing in your kitchen.',
      'You should be able to read a quote properly, compare it with another one, and see what is and is not in it.',
    ],
  },
  {
    q: 'What happens when something in the drawings does not work on site?',
    a: [
      'You hear about it before it is built, not after. Old houses are full of things nobody could have drawn — a wall that is not where the survey says, a floor that has moved, a stump that has been doing nothing for forty years.',
      'When one of those turns up, the question comes to you and the architect in writing, while it is still a question. That is the difference between a decision and a variation.',
    ],
  },
  {
    q: 'Do you work on character and heritage houses?',
    a: [
      'Most of the work is exactly that. A lot of inner Brisbane sits in a character overlay, and what you can do to the street elevation is not the same as what you can do at the back.',
      'It shapes the job rather than stopping it: keep and repair what the street sees, and put the new work behind it.',
    ],
  },
  {
    q: 'How long does a renovation take?',
    a: [
      'It depends on the house and on how settled the drawings are before a start date is set. What is worth knowing is that the programme you are given is one builder’s real diary, not a best case written to win the job.',
      'If the honest answer is that we could not start until after your deadline, you will be told that at the first conversation.',
    ],
  },
  {
    q: 'Are you licensed and insured?',
    a: [
      'Yes. QBCC licence 1014350, and the statutory home warranty cover that goes with a job of this size. The licence number is at the bottom of every page on this site.',
      'The company name on the licence is Angus Cowan Constructions Pty Ltd. Bellewood is the same business under a new name — same licence, same builder.',
    ],
  },
  {
    q: 'Where do you work?',
    a: [
      'Inner Brisbane for the houses, and the Sunshine Coast for apartment work. If you are outside that, ring anyway and we will tell you honestly whether we are the right ones for it.',
    ],
  },
  {
    q: 'What is the quickest way to reach you?',
    a: [
      'The phone. If Angus is on site and cannot pick up, you will get a text back, so a missed call is not a lost one. The form on the contact page reaches him directly as well.',
    ],
  },
]
