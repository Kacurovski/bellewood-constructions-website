import { lazy, useEffect, useRef, useState } from 'react'
import { SheetRef } from '../components/Sheet'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { hasWebGL } from '../lib/webgl'
import { SceneFrame } from '../three/SceneFrame'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import { HERITAGE_MAQUETTE_ASPECT } from '../three/heritageMaquette'
import styles from './RenovationDetails.module.css'

const HeritageStudy = lazy(() => import('../three/HeritageStudy'))
const PREVIEW_INTERVAL = 5200

/** An automatic, reversible study that gives way to a visitor's chosen view. */
export function RenovationDetails() {
  const [extended, setExtended] = useState(false)
  const [canAnimate, setCanAnimate] = useState(false)
  const [paused, setPaused] = useState(false)
  const [inView, setInView] = useState(false)
  const [pageVisible, setPageVisible] = useState(!document.hidden)
  const [announcement, setAnnouncement] = useState('')
  const stage = useRef<HTMLDivElement>(null)
  const previewStarted = useRef(false)
  const reduced = useReducedMotion()
  const progress = extended ? 1 : 0
  const automatic = canAnimate && !paused
  const running = automatic && inView && pageVisible

  useEffect(() => { setCanAnimate(!reduced && hasWebGL()) }, [reduced])

  useEffect(() => {
    const surface = stage.current
    if (!surface) return
    // Watch the house itself: on a phone the introduction can enter before
    // the model. Start the sequence only once the visitor can actually see it.
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting && entry.intersectionRatio >= 0.5)
    }, { threshold: [0, 0.5] })
    observer.observe(surface)
    const visibility = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])

  useEffect(() => {
    if (!running) return
    // A short first hold makes the interaction discoverable. Subsequent views
    // have a full reveal plus a quiet hold; there is no off-screen catch-up.
    const timer = window.setTimeout(() => {
      previewStarted.current = true
      setExtended(value => !value)
    }, previewStarted.current ? PREVIEW_INTERVAL : 1600)
    return () => window.clearTimeout(timer)
  }, [running, extended])

  function chooseView(withAddition: boolean) {
    setPaused(true)
    setExtended(withAddition)
    setAnnouncement(withAddition ? 'Showing the cottage with a possible rear addition.' : 'Showing the cottage without the addition.')
  }

  function togglePreview() {
    previewStarted.current = true
    if (paused) setExtended(value => !value)
    setPaused(value => !value)
    setAnnouncement(paused ? 'Automatic preview resumed.' : 'Automatic preview paused.')
  }

  return (
    <section id="renovation-details" className={styles.section} aria-labelledby="renovation-details-heading" data-view={extended ? 'addition' : 'cottage'} data-preview={automatic ? 'automatic' : 'manual'} data-running={running}>
      <div className="shell">
        <SheetRef number="E-03" name="Space for what's next" />
        <div className={styles.composition}>
          <div className={styles.story}>
            <h2 id="renovation-details-heading">More room.<br /><em>Still your home.</em></h2>
            <p className={styles.lede}>The familiar face stays. New living space opens behind it. Explore one way an older home can grow.</p>

            <div className={styles.explore}
              onFocusCapture={event => {
                // Keyboard exploration holds the current view until the visitor
                // explicitly resumes. Pointer hover still lets the house move.
                if (!event.currentTarget.contains(event.relatedTarget) && event.target.matches(':focus-visible')) setPaused(true)
              }}>
              <div className={styles.controlRow}>
                <div className={styles.choices} role="group" aria-label="Choose a house view" data-extended={extended}>
                  <button type="button" aria-pressed={!extended} aria-controls="renovation-model" onClick={() => chooseView(false)}>The cottage</button>
                  <button type="button" aria-pressed={extended} aria-controls="renovation-model" onClick={() => chooseView(true)}>With an addition</button>
                  <span className={styles.choiceLine} aria-hidden="true" />
                </div>
                {canAnimate && <button type="button" className={styles.previewToggle} onClick={togglePreview}
                  aria-label={paused ? 'Resume automatic house preview' : 'Pause automatic house preview'}
                  title={paused ? 'Resume automatic preview' : 'Pause automatic preview'} aria-controls="renovation-model">
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                    {paused ? <path d="m7 4 8 6-8 6Z" /> : <path d="M7 5v10M13 5v10" />}
                  </svg>
                </button>}
              </div>
              <p className={styles.choiceHelp}>{automatic ? 'Changes automatically. Choose a view to hold it.' : canAnimate ? 'Your view. Resume the preview whenever you like.' : 'Choose a view to explore the idea.'}</p>
            </div>
          </div>

          <figure className={styles.figure}>
            <div ref={stage} id="renovation-model" className={styles.stage}>
              <div className={styles.ground} aria-hidden="true" />
              <div className={styles.model} style={{ aspectRatio: HERITAGE_MAQUETTE_ASPECT }}>
                <SceneFrame rootMargin="200px" label="An illustrative cottage. Choose the cottage or the possible rear addition using the two view options."
                  still={<HeritageStudyStill className={styles.drawing} presentation="maquette" additionProgress={progress} />}>
                  <HeritageStudy shadows={false} presentation="maquette" additionProgress={progress} interactive motionRef={stage} />
                </SceneFrame>
              </div>
            </div>
            <figcaption className={styles.caption}>An illustrative renovation concept.</figcaption>
            <p className="visually-hidden" role="status">{announcement}</p>
          </figure>
        </div>
      </div>
    </section>
  )
}
