import { lazy } from 'react'
import { Link } from 'react-router-dom'
import { SceneFrame } from '../three/SceneFrame'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import { Dimension, SheetRef } from '../components/Sheet'
import { RiseIn } from '../components/RiseIn'
import { CycleWord } from '../components/CycleWord'
import { HERITAGE_SETOUT } from '../three/heritageMembers'
import { contact, site } from '../config/site'
import styles from './Hero.module.css'

const HeritageStudy = lazy(() => import('../three/HeritageStudy'))

/**
 * The kinds of house that cycle in the headline.
 *
 * Every one of these is a house this business works on and every one already
 * appears in the copy further down the page. Do not add a kind here that the
 * site cannot back up elsewhere — the headline is the one line nobody scrolls
 * past, and it is the worst place on the site to widen a claim.
 *
 * They also have to SET. Each one is a single line inside the headline column,
 * and the column is narrowest, relative to the type, between about 900 and
 * 1280px. "Workers' cottages" — the site's own phrase — measured 414px against
 * a 414px column at 900: touching, which is one font fallback away from a
 * clipped word. "Timber cottages" says the same thing about the same houses and
 * clears it. Run `harness/cycle.mjs` after changing this list.
 */
const HOUSE_KINDS = ['Heritage homes', 'Queenslanders', 'Timber cottages', 'Post-war homes'] as const

/**
 * The hero, set as a drawing sheet.
 *
 * A Queenslander where the old house is built and the new wing is still a
 * drawing. It is the proposition of the business as a single object — heritage
 * homes, rebuilt — and it sets up the section further down the page, which takes
 * the same idea and runs it through time.
 *
 * The sheet reference runs across the top of the band, then the words hold the
 * left column and the drawing holds the right, running off the screen edge.
 *
 * It was briefly a single stacked column — reference, headline, then the object
 * at the full width of the page. That gave the house the most room it has ever
 * had, and it pushed the supporting line and the call so far down the sheet
 * that the top of the page was a headline and an empty field. Beside each other
 * the words and the object both have somewhere to be, and the call is where
 * somebody deciding whether to ring can see it.
 *
 * The dimension is real. It is `HERITAGE_SETOUT.depth` from
 * `three/heritageMembers.ts` — the building's overall depth on plan, verandah
 * edge to the back of the new wing, in millimetres — read off the model rather
 * than typed in here. Change the building and the figure changes with it. A
 * drawing carrying an invented dimension is worse than one carrying none.
 *
 * It had five different kinds of technical mark on it at once — a reference
 * strip with three fields, four registration crosses, a height dimension, a
 * depth dimension and two annotation callouts — which is a drawing sheet's
 * whole vocabulary spoken at the same time, and it read as clutter rather than
 * as precision. What is left is the reference, one dimension, and the two
 * callouts that actually say something: the cottage kept, the wing added. The
 * marks and the second dimension were the two that carried no meaning.
 *
 * The heading deliberately avoids a years-trading number. The records on file
 * disagree, and it is not going on the page until Angus settles it.
 */
export function Hero() {
  return (
    <section className={['on-green', styles.hero].join(' ')} aria-labelledby="hero-heading">
      <div className={['shell', styles.inner].join(' ')}>
        <SheetRef number="A-01" name="Heritage study" className={styles.ref} />

        {/* Words left, drawing right. The sheet reference still runs across
            the top of both, so the band reads as one sheet rather than as two
            columns that happen to share a background. */}
        <div className={styles.body}>
          <div className={styles.copy}>
            {/* The kind of house changes; the rest of the sentence does not.

                The list is not decoration — "a worker's cottage, a Queenslander,
                a post-war home" is already the sentence in A-02. Cycling them up
                here is the same claim made as range: a visitor sees their own
                house named inside eight seconds.

                The heading carries a plain, complete, unchanging sentence for
                assistive technology and for search; the animated version is
                hidden from both. Nothing reading this page without eyes gets a
                headline that mutates under it. */}
            <h1 id="hero-heading" className={styles.heading}>
              <span className="visually-hidden">
                Heritage homes in inner Brisbane, rebuilt in timber.
              </span>

              <span aria-hidden="true">
                <CycleWord words={HOUSE_KINDS} className={styles.cycle} />
                <RiseIn text="in inner Brisbane, rebuilt in timber." delay={0.15} />
              </span>
            </h1>

            <p className={[styles.lede, 'lead'].join(' ')}>
              {site.description} Around four projects a year, taken one at a time.
            </p>

            <div className={styles.actions}>
              <Link to="/work" className="btn">
                See the work
              </Link>
              <a href={contact.phoneHref} className={['link-underline', styles.call].join(' ')}>
                {contact.phone}
              </a>
            </div>
          </div>

          <div className={styles.figure}>
            <div className={styles.plate}>
              <SceneFrame
                className={styles.scene}
                label="A Queenslander cottage: the original house built, and a new wing behind it still drawn as a frame."
                rootMargin="0px"
                still={<HeritageStudyStill className={styles.still} />}
              >
                <HeritageStudy />
              </SceneFrame>

              {/* Annotation, the way a drawing is annotated: a label, a leader
                  line, and a dot on the thing it names.

                  This is what turns the object from a render into an argument.
                  The headline says heritage homes rebuilt in timber; the two
                  labels are that sentence pointed at the building, so the shape
                  on the screen means something before a word of it is read.

                  Decorative — the scene already carries the whole description in
                  its own accessible label, and repeating half of it here would
                  read it out twice. */}
              <span className={[styles.note, styles.noteOld].join(' ')} aria-hidden="true">
                <span className={styles.noteDot} />
                <span className={styles.noteLine} />
                <span className={styles.noteText}>Cottage, kept</span>
              </span>

              <span className={[styles.note, styles.noteNew].join(' ')} aria-hidden="true">
                <span className={styles.noteDot} />
                <span className={styles.noteLine} />
                <span className={styles.noteText}>New wing</span>
              </span>
            </div>

            {/* Read off the building, not typed in. A thin space groups the
                thousands the way a drawing sets a figure. */}
            <Dimension
              figure={HERITAGE_SETOUT.depth.toLocaleString('en-AU').replace(',', ' ')}
              className={styles.dim}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
