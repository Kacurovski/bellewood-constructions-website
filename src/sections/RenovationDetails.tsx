import { lazy, useState } from 'react'
import { Link } from 'react-router-dom'
import { SheetRef } from '../components/Sheet'
import { SceneFrame } from '../three/SceneFrame'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import { HERITAGE_MAQUETTE_ANCHORS, HERITAGE_MAQUETTE_ASPECT } from '../three/heritageMaquette'
import type { HeritageFocus } from '../three/heritageMaquette'
import styles from './RenovationDetails.module.css'

const HeritageStudy = lazy(() => import('../three/HeritageStudy'))

const connections: { id: HeritageFocus; label: string; heading: string; body: string }[] = [
  {
    id: 'original', label: 'The original house',
    heading: 'Start with the character.',
    body: 'Auchenflower’s projecting gable, bay window and recessed verandah guide this imagined earlier cottage. These are the details that give the house its familiar street presence.',
  },
  {
    id: 'connection', label: 'Old meets new',
    heading: 'Make the next chapter belong.',
    body: 'A possible new wing sits behind the cottage, with a lower roof and a glazed connection. The join gives old and new their own space within one home.',
  },
  {
    id: 'outdoors', label: 'Openings & shelter',
    heading: 'A sheltered step outside.',
    body: 'A sheltered verandah, open balustrades and steps to the garden make the threshold useful. Doors, windows and cover bring the outlook into everyday life.',
  },
]

// One set of labelled controls works with mouse, keyboard and touch. The shared
// projection keeps the leaders on their parts in the live and static models.
const labelOrigins: Record<HeritageFocus, [number, number]> = {
  original: [190, 90], connection: [840, 166], outdoors: [195, 590],
}

export function RenovationDetails() {
  const [selected, setSelected] = useState<HeritageFocus>('connection')
  const shown = selected
  const index = connections.findIndex(item => item.id === shown)
  const current = connections[index]

  return (
    <section id="renovation-details" className={styles.section} aria-labelledby="renovation-details-heading" data-study-focus={shown}>
      <div className="shell">
        <SheetRef number="E-03" name="Considered connections" note="An architectural study" />
        <div className={styles.intro}>
          <h2 id="renovation-details-heading">Where old and new<br /><em>come together.</em></h2>
          <p className={styles.instruction}>Select a detail.<span>See how it belongs.</span></p>
        </div>
        <div className={styles.composition}>
          <figure className={styles.figure}>
            <div className={styles.stage}>
              <div className={styles.model} style={{ aspectRatio: HERITAGE_MAQUETTE_ASPECT }}>
                <SceneFrame rootMargin="200px" label={`Auchenflower-inspired concept of an earlier cottage and possible addition. ${current.label} highlighted in green.`}
                  still={<HeritageStudyStill className={styles.drawing} presentation="maquette" focus={shown} />}>
                  <HeritageStudy shadows={false} presentation="maquette" focus={shown} />
                </SceneFrame>
              </div>
              <svg className={styles.leaders} viewBox="0 0 1000 720" aria-hidden="true">
                {connections.map(item => {
                  const anchor = HERITAGE_MAQUETTE_ANCHORS[item.id]
                  const x = 50 + anchor.x * 900
                  const y = 720 * 0.14 + anchor.y * 900 / HERITAGE_MAQUETTE_ASPECT
                  const [startX, startY] = labelOrigins[item.id]
                  const elbowY = item.id === 'outdoors' ? startY - 38 : startY + 38
                  return <g key={item.id} data-active={shown === item.id}>
                    <path d={`M ${startX} ${startY} V ${elbowY} L ${x} ${y}`} />
                    <circle className={styles.anchorRing} cx={x} cy={y} r="11" />
                    <circle className={styles.anchorDot} cx={x} cy={y} r="4" />
                    {/* Pointer access on the drawing; the labelled buttons below
                        provide the same actions for keyboard and assistive tech. */}
                    <circle className={styles.pointHit} cx={x} cy={y} r="11"
                      onPointerEnter={event => { if (event.pointerType === 'mouse') setSelected(item.id) }}
                      onClick={() => setSelected(item.id)} />
                  </g>
                })}
              </svg>
              <div role="group" aria-label="Explore the house" className={styles.callouts}>
                {connections.map((item, i) => <button
                  key={item.id} type="button" className={`${styles.callout} ${styles[item.id]}`}
                  data-active={shown === item.id} aria-pressed={selected === item.id}
                  aria-controls="renovation-explanation"
                  onPointerEnter={event => { if (event.pointerType === 'mouse') setSelected(item.id) }}
                  onFocus={() => setSelected(item.id)}
                  onClick={() => setSelected(item.id)}>
                  <span className={styles.pointNumber} aria-hidden="true">0{i + 1}</span>
                  <span className={styles.pointLabel}>{item.label}</span>
                </button>)}
              </div>
            </div>
            <figcaption className={styles.caption}>
              <span>Auchenflower / Concept study</span>
              <Link to="/work/auchenflower">View the real home <span aria-hidden="true">↗</span></Link>
              <p>An imagined earlier cottage and possible addition.</p>
            </figcaption>
          </figure>
          <div id="renovation-explanation" className={styles.explanation}>
            <span className={styles.explanationNumber} aria-hidden="true">0{index + 1}</span>
            <div className={styles.explanationCopy}>
              {connections.map(item => <div key={item.id} className={styles.explanationPanel} data-active={shown === item.id} aria-hidden={shown !== item.id}>
                <span className={styles.explanationLabel}>{item.label}</span>
                <h3>{item.heading}</h3>
                <p>{item.body}</p>
              </div>)}
            </div>
            <p className="visually-hidden" role="status">{connections.find(item => item.id === selected)?.label} selected.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
