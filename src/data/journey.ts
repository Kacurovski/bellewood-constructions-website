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
 * The documents and handover stages include draft descriptions of how
 * approvals and project paperwork are handled. Angus should review those
 * before publication. The "What happens next" block
 * in the enquiry section is the four-line version of this; they should agree,
 * and if he changes one the other follows.
 */

export type Stage = {
  title: string
  lead: string
  body: string[]
}

export const journey: Stage[] = [
  {
    title: 'A conversation',
    lead: 'Call Angus to talk about the job.',
    body: [
      'Let him know the suburb, what you want to do and whether you have drawings. He’ll let you know if it’s work we can take on.',
    ],
  },
  {
    title: 'A look at the house',
    lead: 'Show us what you want to change.',
    body: [
      'At the house, we look at the existing building and discuss the work you have in mind. We can go through any drawings with you there.',
    ],
  },
  {
    title: 'The documents',
    lead: 'We go through the drawings.',
    body: [
      'We review the plans with your architect or designer and put any questions in writing. The documents and approvals needed for the job are discussed at this stage.',
    ],
  },
  {
    title: 'Scope and price, in writing',
    lead: 'You receive a written quote.',
    body: [
      'The quote sets out the work, the price and anything excluded. You can read it in your own time and ask us about anything that isn’t clear.',
    ],
  },
  {
    title: 'A start date',
    lead: 'We discuss when work can begin.',
    body: [
      'We take on around four projects a year. We’ll discuss our availability and your timing early, so you know whether they fit.',
    ],
  },
  {
    title: 'The build',
    lead: 'Angus runs the job on site.',
    body: [
      'You continue dealing with Angus during construction. If something needs a decision, we raise it with you and your architect or designer in writing.',
    ],
  },
  {
    title: 'Handover',
    lead: 'We walk through the house with you.',
    body: [
      'Together, we check the finished work and go through the project paperwork. You can contact Angus with questions after handover too.',
    ],
  },
]
