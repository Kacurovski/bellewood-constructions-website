import { lazy, useRef, useState } from 'react'
import { SceneFrame } from '../three/SceneFrame'
import { TimberFrameStill } from '../three/TimberFrameStill'
import { Reveal } from '../components/Reveal'
import { Dimension, RegistrationMarks, SheetRef } from '../components/Sheet'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { usePinProgress } from '../hooks/usePinProgress'
import type { FrameView } from '../three/frameMembers'
import { FRAME_STAGES, FRAME_STAGE_STARTS } from '../three/frameMembers'
import { hasWebGL } from '../lib/webgl'
import styles from './Process.module.css'

const TimberFrame = lazy(() => import('../three/TimberFrame'))

/**
 * How it works.
 *
 * DOM order is intro, drawing, steps. On a narrow screen the section is plain
 * block flow and that order is what you get; on a wide one the grid areas in the
 * stylesheet put the drawing in its own column beside the other two. Ordering it
 * the other way round left the drawing below the steps on a phone.
 *
 * The section pins when it reaches the top of the screen and holds there while
 * the frame goes up under the reader's own scrolling: bearers, studs and
 * plates, the roof pitch, then cladding. Line-work first, then solid timber.
 *
 * It starts empty. That is the point â€” someone spending two million dollars
 * gets to watch the sequence happen rather than arrive at a finished picture of
 * it. The scroll is doing the building, which is why holding the section still
 * is worth the reader's time.
 *
 * Muted throughout. No shadow theatre, no camera swoops. The boldness on this
 * site is spent on the green mesh; this section is reassurance.
 */
export function Process({ headless = false, sheetNumber = "A-05" }: { headless?: boolean; sheetNumber?: string } = {}) {
  const [view, setView] = useState<FrameView>('front')
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  // Pin only when there is something to watch. Under reduced motion, or with no
  // WebGL, the scene is a static drawing â€” holding someone in place for two
  // screens of nothing would be the worst possible version of this. In that
  // case progress sits at 1 and they get the finished frame, unpinned.
  const canAnimate = !reduced && hasWebGL()
  const { progress, stage } = usePinProgress(ref, FRAME_STAGE_STARTS, canAnimate)

  return (
    <section
      ref={ref}
      id="approach"
      className={[
        styles.section,
        canAnimate ? styles.pinned : styles.static,
        headless ? styles.headless : '',
      ].join(' ')}
      {...(headless
        ? { 'aria-label': 'How it works' }
        : { 'aria-labelledby': 'approach-heading' })}
    >
      <RegistrationMarks />

      <div className={styles.stage}>
        <div className={['shell', styles.inner].join(' ')}>
          {/* On its own page the masthead above has already said all of this â€”
              the reference, the heading and the supporting line â€” so the section
              drops them rather than printing the same three things twice. */}
          {!headless && (
            <div className={styles.intro}>
              <Reveal>
                <SheetRef number={sheetNumber} name="How it works" rule={false} />
                <h2 id="approach-heading" className={['section-heading', styles.heading].join(' ')}>
                  Drawn, then built.
                </h2>
              </Reveal>

              <Reveal delay={0.08}>
                <p className={[styles.lede, 'measure-tight'].join(' ')}>
                    Follow the build from the drawings through the frame, roof and
                    finishing work. This model shows how the main parts come together.
                </p>
              </Reveal>
            </div>
          )}

          <div className={styles.sceneWrap}>
            <div className={styles.viewControls} role="group" aria-label="View Croyde in Camp Hill">
              <button type="button" aria-pressed={view === 'front'} onClick={() => setView('front')}>Street view</button>
              <button type="button" aria-pressed={view === 'rear'} onClick={() => setView('rear')}>Garden view</button>
            </div>
            <SceneFrame
              className={styles.scene}
              label={`Photo-based architectural study of Croyde, Camp Hill, ${view === 'front' ? 'street view with layered gables, an entrance stair and white verandah balustrades' : 'garden view with the long return verandah and sheltered outdoor living spaces'}.`}
              still={<TimberFrameStill className={styles.still} view={view} />}
            >
              <TimberFrame progress={progress} view={view} />
            </SceneFrame>

            {/* Read off the frame in `frameMembers.ts`, not typed in â€” the same
                rule the hero's dimensions follow. */}
            <Dimension
              figure="Croyde / architectural study"
              className={styles.sceneDim}
            />
          </div>

          <ol className={styles.steps}>
              {FRAME_STAGES.map((item, i) => (
                <li
                  key={item.label}
                  className={[styles.step, i === stage ? styles.stepActive : ''].join(' ')}
                  aria-current={canAnimate && i === stage ? 'step' : undefined}
                >
                  <span className={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className={styles.stepLabel}>{item.label}</h3>
                    <p className={['small', styles.stepNote].join(' ')}>{item.note}</p>
                  </div>
                </li>
              ))}
          </ol>


        </div>
      </div>
    </section>
  )
}
