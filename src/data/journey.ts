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
  emphasis: string
  body: string[]
}

export const journey: Stage[] = [
  {
    title: 'A conversation',
    lead: 'You speak directly',
    emphasis: 'with Angus.',
    body: [
      'Tell us where the house is, what you have in mind and how far along you are. We’ll talk through whether it’s a good fit.',
    ],
  },
  {
    title: 'A look at the house',
    lead: 'Start with what makes',
    emphasis: 'it worth keeping.',
    body: [
      'We visit the house, look at its character and discuss what you want to keep or change. Bring drawings if you already have them.',
    ],
  },
  {
    title: 'The documents',
    lead: 'Resolve the questions',
    emphasis: 'while they’re on paper.',
    body: [
      'We review the drawings with your architect or designer, clarify the approvals needed and raise questions early, in writing.',
    ],
  },
  {
    title: 'Scope and price, in writing',
    lead: 'Know what’s included',
    emphasis: 'before you commit.',
    body: [
      'A written quote sets out the scope, exclusions and price. Take time to read it, compare it and ask questions.',
    ],
  },
  {
    title: 'A start date',
    lead: 'Make plans around',
    emphasis: 'a clear start date.',
    body: [
      'With around four projects a year, we discuss availability early. If your timing doesn’t fit, we’ll say so before you make plans.',
    ],
  },
  {
    title: 'The build',
    lead: 'Clear communication',
    emphasis: 'throughout the build.',
    body: [
      'Angus remains your person on site. We follow a clear sequence, raise questions early in writing, and keep the site orderly.',
    ],
  },
  {
    title: 'Handover',
    lead: 'A home to settle into.',
    emphasis: 'A builder you can call.',
    body: [
      'We walk through the finished house together and go through the project paperwork. Angus remains a point of contact after handover.',
    ],
  },
]
