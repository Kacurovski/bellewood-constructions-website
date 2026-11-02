import { lazy, useEffect, useRef, useState } from 'react'
import { SheetRef } from '../components/Sheet'
import { useHousePreview } from '../hooks/useHousePreview'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { hasWebGL } from '../lib/webgl'
import { SceneFrame } from '../three/SceneFrame'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import { HERITAGE_MAQUETTE_ASPECT } from '../three/heritageMaquette'
import styles from './RenovationDetails.module.css'

const HeritageStudy = lazy(() => import('../three/HeritageStudy'))

/** The animated guide line and the model share one continuous reveal. */
export function RenovationDetails() {
  const [canAnimate, setCanAnimate] = useState(false)
  const [modelReady, setModelReady] = useState(false)
  const [inView, setInView] = useState(false)
  const [pageVisible, setPageVisible] = useState(!document.hidden)
  const [announcement, setAnnouncement] = useState('')
  const stage = useRef<HTMLDivElement>(null)
  const range = useRef<HTMLInputElement>(null)
  const reduced = useReducedMotion()
  const { progress, paused, running, pause, resume, seek } = useHousePreview(canAnimate && modelReady && inView && pageVisible)
  const automatic = canAnimate && !paused

  useEffect(() => { setCanAnimate(!reduced && hasWebGL()) }, [reduced])

  useEffect(() => {
    const surface = stage.current
    if (!surface || !('IntersectionObserver' in window)) return
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
    const update = (value: number) => {
      const input = range.current
      if (!input) return
      input.value = String(value * 100)
      input.style.setProperty('--reveal', String(value))
      input.setAttribute('aria-valuetext', value === 0 ? 'The cottage, without the addition' : value === 1 ? 'With the full addition' : `Addition ${Math.round(value * 100)} percent revealed`)
    }
    update(progress.get())
    return progress.on('change', update)
  }, [progress])

  function togglePreview() {
    if (paused) resume()
    else pause()
    setAnnouncement(paused ? 'Automatic preview resumed.' : 'Automatic preview paused.')
  }

  return (
    <section id="renovation-details" className={styles.section} aria-labelledby="renovation-details-heading" data-preview={automatic ? 'automatic' : 'manual'} data-running={running}>
      <div className="shell">
        <SheetRef number="E-03" name="Space for what's next" />
        <div className={styles.composition}>
          <div className={styles.story}>
            <h2 id="renovation-details-heading">More room.<br /><em>Still your home.</em></h2>
            <p className={styles.lede}>The familiar face stays. New living space opens behind it. Explore one way an older home can grow.</p>
          </div>

          <figure className={styles.figure}>
            <div ref={stage} id="renovation-model" className={styles.stage}>
              <div className={styles.ground} aria-hidden="true" />
              <div className={styles.model} style={{ aspectRatio: HERITAGE_MAQUETTE_ASPECT }}>
                <SceneFrame rootMargin="200px" label="An illustrative cottage and possible rear addition. Use the slider below to explore the change."
                  still={<HeritageStudyStill className={styles.drawing} presentation="maquette" additionMotion={progress} />}>
                  <HeritageStudy shadows={false} presentation="maquette" additionMotion={progress} onReady={setModelReady} interactive motionRef={stage} />
                </SceneFrame>
              </div>
            </div>
            <div className={styles.explore}>
              <div className={styles.controlRow}>
                <div className={styles.rangeControl}>
                  <div className={styles.endpoints} aria-hidden="true"><span>The cottage</span><span>With an addition</span></div>
                  <label htmlFor="renovation-progress" className="visually-hidden">Explore the cottage and its possible addition</label>
                  <input ref={range} id="renovation-progress" className={styles.range} type="range" min="0" max="100" step="1" defaultValue="0"
                    aria-controls="renovation-model" aria-describedby="renovation-slider-help"
                    onPointerDown={pause} onFocus={pause}
                    onChange={event => seek(event.currentTarget.valueAsNumber / 100)} />
                </div>
                {canAnimate && <button type="button" className={styles.previewToggle} onClick={togglePreview}
                  aria-label={paused ? 'Resume automatic house preview' : 'Pause automatic house preview'}
                  title={paused ? 'Resume automatic preview' : 'Pause automatic preview'} aria-controls="renovation-model">
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                    {paused ? <path d="m7 4 8 6-8 6Z" /> : <path d="M7 5v10M13 5v10" />}
                  </svg>
                </button>}
              </div>
              <p id="renovation-slider-help" className="visually-hidden">Drag the marker or use the arrow keys to explore the addition. Your selection pauses the automatic preview. Home shows the cottage; End shows the full addition.</p>
            </div>
            <figcaption className={styles.caption}>An illustrative renovation concept.</figcaption>
            <p className="visually-hidden" role="status">{announcement}</p>
          </figure>
        </div>
      </div>
    </section>
  )
}
