import { lazy, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { SheetRef } from '../components/Sheet'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { hasWebGL } from '../lib/webgl'
import { SceneFrame } from '../three/SceneFrame'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import { HERITAGE_MAQUETTE_ASPECT } from '../three/heritageMaquette'
import styles from './RenovationDetails.module.css'

const HeritageStudy = lazy(() => import('../three/HeritageStudy'))

/** One spatial idea, explored on a model. This is not a real project's history. */
export function RenovationDetails() {
  const [reveal, setReveal] = useState(100)
  const [canMove, setCanMove] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const progress = reveal / 100

  useEffect(() => { setCanMove(!reduced && hasWebGL()) }, [reduced])

  return (
    <section id="renovation-details" className={styles.section} aria-labelledby="renovation-details-heading">
      <div className="shell">
        <SheetRef number="E-03" name="Space for what's next" />
        <div className={styles.composition}>
          <div className={styles.story}>
            <h2 id="renovation-details-heading">More room.<br /><em>Still your home.</em></h2>
            <p className={styles.lede}>The familiar face stays. New living space opens behind it. Explore one way an older home can grow.</p>
            <span className={styles.signature} aria-hidden="true"><i /> A little room to imagine.</span>
          </div>

          <figure className={styles.figure}>
            <div ref={stage} className={styles.stage} data-movable={canMove || undefined}>
              <div className={styles.ground} aria-hidden="true" />
              <div className={styles.model} style={{ aspectRatio: HERITAGE_MAQUETTE_ASPECT }}>
                <SceneFrame rootMargin="200px" label="An illustrative cottage and possible rear addition. Use the slider to explore the idea."
                  still={<HeritageStudyStill className={styles.drawing} presentation="maquette" additionProgress={progress} />}>
                  <HeritageStudy shadows={false} presentation="maquette" additionProgress={progress} interactive motionRef={stage} />
                </SceneFrame>
              </div>
              {canMove && <span className={styles.motionHint}>Move your mouse to look around <span aria-hidden="true">↔</span></span>}
            </div>

            <div className={styles.explore} style={{ '--reveal': reveal + '%' } as CSSProperties}>
              <div className={styles.controlHeading}>
                <label htmlFor="renovation-addition">Explore an addition</label>
                <span id="renovation-slide-hint">Slide to reveal</span>
              </div>
              <input id="renovation-addition" className={styles.range} type="range" min="0" max="100" step="1" value={reveal}
                aria-describedby="renovation-slide-hint renovation-study-caption"
                aria-valuetext={reveal === 0 ? 'Original cottage' : reveal === 100 ? 'With a rear addition' : 'Rear addition partly revealed'}
                onChange={event => setReveal(Number(event.target.value))} />
              <div className={styles.endpoints} aria-hidden="true"><span>Original cottage</span><span>With a rear addition</span></div>
            </div>
            <figcaption id="renovation-study-caption" className={styles.caption}>An illustrative renovation concept.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
