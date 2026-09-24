/**
 * From the first call to handover: how a job actually runs.
 *
 * The Approach page shows the build going up in four stages, which is the
 * building. This is the JOB — the part that starts months before a stump goes
 * in, and the part a person is actually trying to picture when they wonder
 * what it would be like to hire this builder.
 *
 * Grounded in the file: the first conversation is a phone call that reaches
 * Angus directly; he looks at the house and any drawings; scope and price come
 * in writing; the diary runs about four projects a year, so a start date is a
 * real date; he is on site on his own jobs; questions go back in writing
 * before they become variations.
 *
 * Steps four and six carry the least from the file and the most convention —
 * how documents and approvals usually run, and what a handover usually
 * includes. Angus should read those two hardest. The "What happens next" block
 * in the enquiry section is the four-line version of this; they should agree,
 * and if he changes one the other follows.
 */

export type Stage = {
  title: string
  body: string[]
}

export const journey: Stage[] = [
  {
    title: 'A conversation',
    body: [
      'It starts with a phone call, and the call reaches Angus, not an office. A suburb, a rough idea of what you are thinking and how far along you are is enough. If it is not a good fit you will be told that on the call and pointed somewhere better.',
    ],
  },
  {
    title: 'A look at the house',
    body: [
      'Then a visit. Old houses tell you most of what you need to know once you are standing in them — what has moved, what has been added, what is original and worth the trouble. If there are drawings already, this is where they meet the building for the first time.',
    ],
  },
  {
    title: 'The documents',
    body: [
      'If you have an architect or designer, we work from their documents and the questions start here, in writing, while they are cheap to answer. If you do not, this is the point to get one, and we can say which kind of documentation the job actually needs and which it does not.',
      'Character and heritage overlays, and any approvals the job needs, are sorted out in this stage rather than discovered later.',
    ],
  },
  {
    title: 'Scope and price, in writing',
    body: [
      'A written quote: what is in, what is out, and what it costs. Something you can read at the kitchen table, compare with another one, and ask about — not a number over the phone.',
    ],
  },
  {
    title: 'A start date',
    body: [
      'About four projects a year means the diary is a real diary. The start date you are given is when the job starts, and if the honest answer is that it cannot begin before your deadline, that is said now and not in three months.',
    ],
  },
  {
    title: 'The build',
    body: [
      'The same order on every job — stumps and bearers, frame, roof, then the finish — and the same builder on site from the first day to the last. When the house disagrees with the drawings, and a hundred-year-old house usually does somewhere, the question comes to you and the architect while it is still a question.',
      'The site is kept in a state you could bring somebody to. That is not a courtesy; it is how the work stays accurate.',
    ],
  },
  {
    title: 'Handover',
    body: [
      'A walk through the finished house together, the paperwork the job generated, and a builder who answers the phone afterwards. The licence number on the bottom of every page of this site is the same one on the contract, and it does not change with the name.',
    ],
  },
]
