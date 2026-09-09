import { lazy } from 'react'
import { Link } from 'react-router-dom'
import { SceneFrame } from '../three/SceneFrame'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import { Dimension, RegistrationMarks, SheetRef } from '../components/Sheet'
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
 * The composition is the change. It used to be copy in the left column and the
 * object in the right, which is the layout of every builder's website: the
 * headline could only ever be half the width of the page, and the object could
 * only ever be half of it too, so neither was ever the thing on the screen.
 *
 * Now the sheet reference runs the full width, the headline runs the full width
 * beneath it, and the object sits under both at the width of the page with a
 * dimension line under it. Nothing is competing for the same half. The house is
 * the largest thing on the page, which is what it should have been from the
 * start — it is the only asset here a competitor cannot buy.
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

        {/* The headline and the supporting line share one band rather than
            stacking. Stacked, the two of them took 300px off the top of the
            sheet and the drawing got what was left — which on a laptop was a
            strip. Side by side the drawing gets the height back, and the call
            stays above the fold. */}
        <div className={styles.head}>
          <h1 id="hero-heading" className={styles.heading}>
            Heritage homes in inner Brisbane, rebuilt in timber.
          </h1>

          <div className={styles.aside}>
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
        </div>

        <div className={styles.plate}>
          {/* Ground to ridge, up the right-hand edge of the plate. It uses the
              width a wide short frame cannot give the drawing anyway, and it is
              where a real sheet carries a height. */}
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
    </section>
  )
}
