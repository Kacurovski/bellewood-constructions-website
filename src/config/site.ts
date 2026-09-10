/**
 * Bellewood Constructions — single source of configuration.
 *
 * Everything a future editor needs to change lives in this file. There are no
 * runtime environment variables anywhere in this project, by design: the build
 * is handed over as static output and finished inside GHL AI Studio.
 *
 * Open items are marked `OPEN:` and are listed again in the README.
 */

import lockupGreen from '../assets/brand/bellewood-lockup-green.png'
import lockupReverse from '../assets/brand/bellewood-lockup-reverse.png'
import symbolGreen from '../assets/brand/bellewood-symbol-green.png'
import symbolReverse from '../assets/brand/bellewood-symbol-reverse.png'

export const site = {
  name: 'Bellewood Constructions',
  shortName: 'Bellewood',

  // OPEN: domain spelling. ASIC registration and the June 2026 email thread both
  // say "Bellewood". One meeting note recorded "bellwood.com.au". Confirm against
  // the GoDaddy record before DNS is pointed anywhere.
  domain: 'bellewood.com.au',
  url: 'https://bellewood.com.au',

  description:
    'Renovations and extensions to heritage and older homes in inner Brisbane, built predominantly in timber.',

  // OPEN: tagline carry-forward. "Quality that's built in" is in use under the
  // current name but is not carried into the brand book. Do not place it in the
  // hero until Angus confirms it.
  tagline: null as string | null,
} as const

export const contact = {
  principal: 'Angus Cowan',
  role: 'Director',
  // Surfaced prominently and tap-to-call: missed-call text-back runs off this
  // number and is the first visible win of the engagement.
  phone: '0417 751 521',
  phoneHref: 'tel:+61417751521',
  // The address Angus chose at kickoff. It is not live yet — the mailbox has to
  // be created on the domain before this can receive anything.
  email: 'angus@bellewood.com.au',
  emailHref: 'mailto:angus@bellewood.com.au',
  serviceArea: 'Brisbane and the Sunshine Coast',
} as const

export const social = [
  // Instagram is being rebranded, not replaced, so the existing handle and its
  // following carry over. Handles are finalised under Bellewood at the name change.
  { label: 'Instagram', href: 'https://www.instagram.com/anguscowan_constructions/' },
  { label: 'Facebook', href: 'https://www.facebook.com/' }, // OPEN: page URL
  { label: 'LinkedIn', href: 'https://www.linkedin.com/' }, // OPEN: company page URL
] as const

/**
 * Legal — Queensland law requires the licensed name and licence number to appear
 * in advertising. Bellewood is a trading name until the ASIC name change takes
 * effect on 1 July 2027, so the licensed entity must appear on every public
 * surface until that date.
 *
 * After 1 July 2027: set `tradingNameClause` to null. The licence number stays.
 * That is the only edit required. Nothing else in the codebase needs to change.
 */
export const compliance = {
  /**
   * CONFIRMED at the kickoff call, 25 August 2026.
   *
   * Angus holds two QBCC licences: the company licence 1014350 and his own
   * individual licence 78490. The number that must appear in advertising is the
   * one held by the entity contracting the work, and the capture list records
   * the licence as held by the company — which is also the entity named in the
   * line below. So 1014350 is right.
   */
  licenceNumber: '1014350',
  licensedEntity: 'Angus Cowan Constructions Pty Ltd',
  tradingNameClause: 'a trading name of Angus Cowan Constructions Pty Ltd',
  // Set to null on 1 July 2027, when the ASIC name change takes effect.
  nameChangeDate: '1 July 2027',

  /**
   * Company details, confirmed at kickoff. Not rendered anywhere: the brand book
   * specifies exactly what the fine print says, and it is the licensed name and
   * licence number, not the ABN. Held here because the existing site carries an
   * ABN belonging to a different, deregistered company (see the README), so
   * whoever rebuilds the invoices and quotes will want the right one to hand.
   */
  abn: '19 512 919 083',
  acn: '101 528 698',
  registeredAddress: '8 Scenic Road, Kenmore QLD 4069',
} as const

/**
 * Brand artwork. Swap a PNG for an SVG here and the whole site follows —
 * <Logo /> is the only component that reads these values.
 *
 * These are the real exports from the shared Drive folder — lockups at 900px and
 * symbols at 400px, in both colourways. An earlier build ran on 262px versions
 * lifted out of the Brand Book PDF, which was all that was to hand and which
 * showed as soft edges wherever the mark was drawn large.
 *
 * Still outstanding: a vector master, and the separately drawn reverse,
 * small-size and solid-fill variants the designer brief calls for. Those arrive
 * at Milestone 1.
 */
export const brand = {
  lockup: {
    green: lockupGreen,
    reverse: lockupReverse,
    // Intrinsic aspect of the supplied artwork, used to reserve layout space.
    width: 900,
    height: 234,
  },
  symbol: {
    green: symbolGreen,
    reverse: symbolReverse,
    width: 400,
    height: 358,
  },
  // Minimum sizes from the brand book. The full lockup is never set below
  // 120px wide, and the symbol is never used below 24px — and then only with
  // the small-size variant, which does not exist yet, so the symbol is not
  // used small anywhere on this site.
  minLockupWidth: 120,
  minSymbolWidth: 24,
  // OPEN: favicon set (16, 32, 180, 512) and the 1000x1000 social avatar are
  // Milestone 1 deliverables. public/favicon.svg is a stand-in traced from the
  // supplied symbol; replace all four sizes when the master arrives.
} as const

/**
 * Forms.
 *
 * Both the enquiry form and the lead magnet post here. Replace this one value
 * with the GHL inbound webhook URL and both are live — there is no second place
 * to change. Until then submissions are held and reported to the visitor
 * honestly rather than silently dropped.
 */
export const forms = {
  // OPEN: GHL webhook endpoint. Placeholder — nothing is delivered until this is set.
  endpoint: '' as string,
  /* Where notifications should land once the sending domain is configured.
     Angus is a sole operator and the kickoff capture list names this as his
     address; there is no hello@ and nobody asked for one. Kept in step with
     `contact.email` deliberately — two addresses on one one-man business is how
     an enquiry ends up in a mailbox nobody opens. */
  notifyTo: contact.email,
  leadMagnet: {
    // Working concept per the Service Agreement. Title is not final.
    title: 'The 18-point checklist for first-time home builders',
    blurb:
      'The questions worth asking before you commit to a builder, and the ones most people only think of afterwards.',
    // OPEN: the PDF itself. Delivered with Milestone 2.
    file: null as string | null,
  },
} as const

/**
 * What happens after someone gets in touch.
 *
 * This is the question a two-million-dollar decision leaves unanswered, and the
 * site had no answer to it. Four lines is enough.
 *
 * OPEN: only the first step is drawn from anything on file — Angus is a sole
 * operator and the missed-call text-back runs off his own mobile, so an enquiry
 * genuinely does reach him directly. Steps two to four are how this normally
 * goes for a builder of this size, written conservatively and deliberately
 * short on promises. **They are not his words and he has not agreed them.**
 * Nothing here commits him to a timeframe, and nothing should until he has read
 * it back and said it is right.
 */
export const nextSteps = [
  {
    label: 'You get in touch',
    note: 'Call or send the form. Either reaches Angus directly, and a missed call gets a text back.',
  },
  {
    label: 'We look at the house',
    note: 'A conversation first, then a look at the place and the drawings if there are any.',
  },
  {
    label: 'A written quote',
    note: 'Scope and price in writing, so you can read it properly before deciding anything.',
  },
  {
    label: 'A start date',
    note: 'Around four projects a year means the diary is honest about when we could begin.',
  },
] as const

/**
 * Primary navigation.
 *
 * `hash` is for links to a section of a page. Routing is hash-based (see the
 * note in App.tsx), so an in-page anchor has to travel as a route plus a hash
 * rather than as a bare `#id` href — a bare one would be read as the location
 * itself and land on the 404.
 */
/**
 * The credentials row.
 *
 * A builder's site normally carries a strip of accreditation logos here —
 * Master Builders Queensland, HIA, and so on. None are used, because none are
 * confirmed: putting an industry body's mark on the page claims a membership,
 * and that is not ours to claim. Every line below is either a fact already
 * established elsewhere on this site or a legal requirement of holding a QBCC
 * licence in Queensland.
 *
 * OPEN: if Angus holds memberships he wants shown, they replace these — and
 * they need his confirmation plus the bodies' own artwork, not a lookalike.
 */
export const credentials = [
  { label: 'Licensed', value: `QBCC ${compliance.licenceNumber}` },
  { label: 'Insured', value: 'Home warranty cover' },
  { label: 'Where we build', value: 'Brisbane and the coast' },
  { label: 'Capacity', value: 'Four projects a year' },
] as const

export const nav = [
  { label: 'Work', to: '/work', hash: undefined },
  { label: 'Approach', to: '/approach', hash: undefined },
  { label: 'About', to: '/about', hash: undefined },
  { label: 'Contact', to: '/contact', hash: undefined },
] as const
