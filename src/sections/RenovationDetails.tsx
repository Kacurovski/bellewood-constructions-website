import { lazy, useEffect, useRef, useState } from 'react'
import { SheetRef } from '../components/Sheet'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { hasWebGL } from '../lib/webgl'
import { SceneFrame } from '../three/SceneFrame'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import { HERITAGE_MAQUETTE_ASPECT } from '../three/heritageMaquette'
import styles from './RenovationDetails.module.css'

const HeritageStudy = lazy(() => import('../three/HeritageStudy'))

/** Two clear views of an illustrative home, with no implied project history. */
export function RenovationDetails() {
  const [extended, setExtended] = useState(true)
  const [canMove, setCanMove] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const progress = extended ? 1 : 0

  useEffect(() => { setCanMove(!reduced && hasWebGL()) }, [reduced])

  return (
    <section id="renovation-details" className={styles.section} aria-labelledby="renovation-details-heading" data-view={extended ? 'addition' : 'cottage'}>
      <div className="shell">
        <SheetRef number="E-03" name="Space for what's next" />
        <div className={styles.composition}>
          <div className={styles.story}>
            <h2 id="renovation-details-heading">More room.<br /><em>Still your home.</em></h2>
            <p className={styles.lede}>The familiar face stays. New living space opens behind it. Explore one way an older home can grow.</p>

            <div className={styles.explore}>
              <p id="renovation-view-prompt" className={styles.prompt}>See what an addition could change.</p>
              <div className={styles.choices} role="group" aria-labelledby="renovation-view-prompt" data-extended={extended}>
                <button type="button" aria-pressed={!extended} aria-controls="renovation-model" onClick={() => setExtended(false)}>The cottage</button>
                <button type="button" aria-pressed={extended} aria-controls="renovation-model" onClick={() => setExtended(true)}>With an addition</button>
                <span className={styles.choiceLine} aria-hidden="true" />
              </div>
              <p className={styles.choiceHelp}>Choose a view to watch the house change.</p>
            </div>
          </div>

          <figure className={styles.figure}>
            <div ref={stage} id="renovation-model" className={styles.stage} data-movable={canMove || undefined}>
              <div className={styles.ground} aria-hidden="true" />
              <div className={styles.model} style={{ aspectRatio: HERITAGE_MAQUETTE_ASPECT }}>
                <SceneFrame rootMargin="200px" label="An illustrative cottage. Choose the cottage or the possible rear addition using the two view options."
                  still={<HeritageStudyStill className={styles.drawing} presentation="maquette" additionProgress={progress} />}>
                  <HeritageStudy shadows={false} presentation="maquette" additionProgress={progress} interactive motionRef={stage} />
                </SceneFrame>
              </div>
            </div>
            <figcaption className={styles.caption}>
              <span>An illustrative renovation concept.</span>
              {canMove && <span className={styles.motionHint}>
                <svg width="18" height="22" viewBox="0 0 18 22" aria-hidden="true"><path d="m3 2 11 9-5 .9 2.7 6-2.4 1.1-2.7-6-3.6 3Z" /></svg>
                Move over the house to look around
              </span>}
            </figcaption>
            <p className="visually-hidden" role="status">{extended ? 'Showing the cottage with a possible rear addition.' : 'Showing the cottage without the addition.'}</p>
          </figure>
        </div>
      </div>
    </section>
  )
}
