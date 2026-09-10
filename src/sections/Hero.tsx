import { lazy } from 'react'
import { Link } from 'react-router-dom'
import { SceneFrame } from '../three/SceneFrame'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import { Dimension, RegistrationMarks, SheetRef } from '../components/Sheet'
import { RiseIn } from '../components/RiseIn'
import { HERITAGE_SETOUT } from '../three/heritageMembers'
import { contact, site } from '../config/site'
import styles from './Hero.module.css'

const HeritageStudy = lazy(() => import('../three/HeritageStudy'))

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
 * The heading deliberately avoids a years-trading number. The records on file
 * disagree, and it is not going on the page until Angus settles it.
 */
export function Hero() {
  return (
    <section className={['on-green', styles.hero].join(' ')} aria-labelledby="hero-heading">
      <RegistrationMarks />

      <div className={['shell', styles.inner].join(' ')}>
        <SheetRef
          number="SK-01"
          name="Heritage study — cottage and new wing"
          note="Brisbane, QLD"
          className={styles.ref}
        />

        {/* Words left, drawing right. The sheet reference still runs across
            the top of both, so the band reads as one sheet rather than as two
            columns that happen to share a background. */}
        <div className={styles.body}>
          <div className={styles.copy}>
            <h1 id="hero-heading" className={styles.heading}>
              <RiseIn text="Heritage homes in inner Brisbane, rebuilt in timber." delay={0.15} />
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
              {/* Ground to ridge, up the right-hand edge. */}
              <Dimension
                figure={HERITAGE_SETOUT.height.toLocaleString('en-AU').replace(',', ' ')}
                vertical
                className={styles.dimV}
              />

              <SceneFrame
                className={styles.scene}
                label="A Queenslander cottage: the original house built, and a new wing behind it still drawn as a frame."
                rootMargin="0px"
                still={<HeritageStudyStill className={styles.still} />}
              >
                <HeritageStudy />
              </SceneFrame>
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
