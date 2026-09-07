import { lazy } from 'react'
import { Link } from 'react-router-dom'
import { SceneFrame } from '../three/SceneFrame'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import { contact, site } from '../config/site'
import styles from './Hero.module.css'

const HeritageStudy = lazy(() => import('../three/HeritageStudy'))

/**
 * The hero.
 *
 * A Queenslander where the old house is built and the new wing is still a
 * drawing. It is the proposition of the business as a single object — heritage
 * homes, rebuilt — and it sets up the section further down the page, which takes
 * the same idea and runs it through time.
 *
 * This column has been three things. A flat outline of the mark extruded in 3D,
 * which read as clip art beside the real artwork in the header. Then a
 * photograph, which was honest but said nothing the copy did not already say.
 * An object that explains the work is worth more than either.
 *
 * The heading deliberately avoids a years-trading number. The records on file
 * disagree, and it is not going on the page until Angus settles it.
 */
export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.grid}>
        <div className={[styles.copyCol, 'shell'].join(' ')}>
          <div className={styles.copy}>
            <h1 id="hero-heading" className={[styles.heading, 'display'].join(' ')}>
              Heritage homes in inner Brisbane, rebuilt in timber.
            </h1>

            {/* Everything below the headline is grouped, because on a phone the
                object slides in between the two: headline, then the house, then
                the supporting copy and the call. */}
            <div className={styles.body}>
              <hr className={['timber-rule', styles.rule].join(' ')} />

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
        </div>

        <div className={styles.media}>
          <SceneFrame
            className={styles.scene}
            label="A Queenslander cottage: the original house built, and a new wing behind it still drawn as a frame."
            rootMargin="0px"
            still={<HeritageStudyStill className={styles.still} />}
          >
            <HeritageStudy />
          </SceneFrame>
        </div>
      </div>
    </section>
  )
}
