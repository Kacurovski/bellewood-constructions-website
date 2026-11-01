import { lazy, useState } from 'react'
import { Link } from 'react-router-dom'
import { SheetRef } from '../components/Sheet'
import { SceneFrame } from '../three/SceneFrame'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import { TONE } from '../three/materials'
import type { MaterialKey } from '../three/materials'
import styles from './RenovationDetails.module.css'

const HeritageStudy = lazy(() => import('../three/HeritageStudy'))
type Detail = { material: MaterialKey; name: string; text: string }
type Chapter = { id: string; label: string; short: string; heading: string; body: string; focus: MaterialKey; details: Detail[] }
const chapters: Chapter[] = [
  {
    id: 'character', label: 'Preserve its character', short: 'Understand the original home',
    heading: 'Start with what belongs.', focus: 'clad',
    body: 'Before considering an addition, understand the original house. Its roofline, weatherboards and proportions give it a familiar character worth carrying forward.',
    details: [
      { material: 'clad', name: 'Cladding', text: 'The weatherboards give the cottage its texture and rhythm. Their condition and profile guide what can be retained, repaired or matched.' },
      { material: 'roof', name: 'Roof', text: 'Pitch, eaves and verandah cover shape the silhouette. The model shows how these forms bring the house together.' },
    ],
  },
  {
    id: 'living', label: 'Make room for living', short: 'Consider what comes next',
    heading: 'New space. A considered connection.', focus: 'charred',
    body: 'An addition starts with how you want to live. The model makes the new wing distinct, so you can explore its relationship to the original cottage and the structure beneath it.',
    details: [
      { material: 'frame', name: 'Structure', text: 'Bearers, stumps, studs and rafters support the spaces you live in. Their arrangement is resolved through the drawings and engineering.' },
      { material: 'charred', name: 'New work', text: 'The darker cladding identifies the added wing in this study. Floor levels, junctions and material choices shape how old and new meet.' },
    ],
  },
  {
    id: 'outdoors', label: 'Connect to the outdoors', short: 'Open the house to its setting',
    heading: 'Living beyond the walls.', focus: 'deck',
    body: 'A verandah creates a sheltered place between the house and garden. Together with carefully placed windows and doors, it makes the outlook part of everyday life.',
    details: [
      { material: 'deck', name: 'Deck', text: 'The floor, balustrades and steps define the outdoor room. Shelter and its connection to the internal floor shape how it is used.' },
      { material: 'glass', name: 'Glazing', text: 'Windows and glazed doors admit light and frame the view. Their size and position connect each room to its surroundings.' },
    ],
  },
]

/** One illustrative house explains the renovation ideas and their materials. */
export function RenovationDetails() {
  const [selected, setSelected] = useState(0)
  const [highlight, setHighlight] = useState<MaterialKey | null>(null)
  const [preview, setPreview] = useState<MaterialKey | null>(null)
  const current = chapters[selected]
  const shown = preview ?? highlight
  const detail = chapters.flatMap(chapter => chapter.details).find(item => item.material === shown)
  function chooseChapter(index: number) {
    setSelected(index)
    setHighlight(chapters[index].focus)
    setPreview(null)
  }
  function showHouse() { setHighlight(null); setPreview(null) }

  return <section id="renovation-details" className={styles.section} aria-labelledby="renovation-details-heading">
    <div className="shell">
      <SheetRef number="E-03" name="The anatomy of a renovation" note="An interactive architectural study" />
      <div className={styles.intro}>
        <h2 id="renovation-details-heading">Old character.<br /><em>New possibilities.</em></h2>
        <div><p>One house. Three ways to think about what comes next.</p><p className={styles.instruction}>Choose an idea, then explore its materials in the model.</p></div>
      </div>
      <div className={styles.choices} role="group" aria-label="Explore a renovation idea">
        {chapters.map((chapter, index) => <button key={chapter.id} type="button" aria-pressed={selected === index} aria-controls="renovation-chapter" onClick={() => chooseChapter(index)}>
          <span className={styles.number}>0{index + 1}</span><span className={styles.choiceText}><strong>{chapter.label}</strong><span>{chapter.short}</span></span><span className={styles.arrow} aria-hidden="true">&#8599;</span>
        </button>)}
      </div>
      <div id="renovation-chapter" className={styles.chapter}>
        <div className={styles.modelColumn}>
          <div className={styles.modelFrame}>
            <div className={styles.modelHeader}><span>House study / 01</span><span>Original cottage + new wing</span></div>
            <SceneFrame className={styles.scene} rootMargin="200px" label={shown ? `${detail?.name} highlighted in an illustrative cottage and extension.` : 'An illustrative timber cottage with a verandah and a darker new wing.'} still={<HeritageStudyStill className={styles.drawing} highlight={shown} />}>
              <HeritageStudy shadows={false} highlight={shown} />
            </SceneFrame>
            <div className={styles.modelStatus}><p aria-live="polite"><span className={styles.statusDot} aria-hidden="true" />{detail ? `${detail.name} highlighted` : 'The whole house'}</p><button type="button" onClick={showHouse} aria-pressed={shown === null}>Show whole house <span aria-hidden="true">&#8634;</span></button></div>
            <div className={styles.materialChips} role="group" aria-label="Highlight a material in the model">
              {current.details.map(item => <button key={item.material} type="button" aria-pressed={highlight === item.material} onClick={() => { setHighlight(item.material); setPreview(null) }}><span style={{ background: TONE[item.material].base }} aria-hidden="true" />{item.name}<span aria-hidden="true">+</span></button>)}
            </div>
          </div>
          <p className={styles.caption}>A conceptual house used to explain our approach.</p>
        </div>
        <div className={styles.story}>
          <div className={styles.storyIntro} aria-live="polite" aria-atomic="true"><span className={styles.chapterNumber}>0{selected + 1} / 03 <span>{current.label}</span></span><h3>{current.heading}</h3><p>{current.body}</p></div>
          <div className={styles.materials}>
            <h4>Explore the materials</h4><p className={styles.hint}>Hover or select a detail to locate it in the house.</p>
            <div className={styles.detailList} onPointerLeave={() => setPreview(null)}>
              {current.details.map(item => <button key={item.material} type="button" className={shown === item.material ? styles.detailActive : ''} aria-pressed={highlight === item.material} onPointerEnter={event => { if (event.pointerType === 'mouse') setPreview(item.material) }} onFocus={() => setPreview(item.material)} onBlur={() => setPreview(null)} onClick={() => setHighlight(item.material)}><span className={styles.detailTitle}><span className={styles.swatch} style={{ background: TONE[item.material].base }} aria-hidden="true" /><strong>{item.name}</strong><span className={styles.detailArrow} aria-hidden="true">&#8599;</span></span><span className={styles.detailCopy}>{item.text}</span></button>)}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bottom}><p>Every home brings its own possibilities.</p><Link to="/contact">Talk about your home <span aria-hidden="true">&#8599;</span></Link></div>
    </div>
  </section>
}
