import { lazy, useRef } from 'react'
import { SceneFrame } from '../three/SceneFrame'
import { TimberFrameStill } from '../three/TimberFrameStill'
import { Reveal } from '../components/Reveal'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { usePinProgress } from '../hooks/usePinProgress'
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
 * It starts empty. That is the point — someone spending two million dollars
 * gets to watch the sequence happen rather than arrive at a finished picture of
 * it. The scroll is doing the building, which is why holding the section still
 * is worth the reader's time.
 *
 * Muted throughout. No shadow theatre, no camera swoops. The boldness on this
 * site is spent on the green mesh; this section is reassurance.
 */
export function Process() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  // Pin only when there is something to watch. Under reduced motion, or with no
  // WebGL, the scene is a static drawing — holding someone in place for two
  // screens of nothing would be the worst possible version of this. In that
  // case progress sits at 1 and they get the finished frame, unpinned.
  const canAnimate = !reduced && hasWebGL()
  const { progress, stage } = usePinProgress(ref, FRAME_STAGE_STARTS, canAnimate)

  return (
    <section
      ref={ref}
      id="approach"
      className={['on-green', styles.section, canAnimate ? styles.pinned : styles.static].join(
        ' ',
      )}
      aria-labelledby="approach-heading"
    >
      <div className={styles.stage}>
        <div className={['shell', styles.inner].join(' ')}>
          <div className={styles.intro}>
            <Reveal>
              <p className="eyebrow">How it works</p>
              <h2 id="approach-heading" className={['section-heading', styles.heading].join(' ')}>
                Drawn, then built.
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <p className={[styles.lede, 'measure-tight'].join(' ')}>
                We work from the architect's documents, set out square, and build in
                the same order every time. Nothing about the sequence is improvised.
              </p>
            </Reveal>
          </div>

          <div className={styles.sceneWrap}>
            <SceneFrame
              className={styles.scene}
              label="A timber frame assembling: bearers, studs and plates, the roof pitch, then cladding."
              still={<TimberFrameStill className={styles.still} />}
            >
              <TimberFrame progress={progress} />
            </SceneFrame>
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
