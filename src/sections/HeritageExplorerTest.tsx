import { lazy, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SceneFrame } from '../three/SceneFrame'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import type { MaterialKey } from '../three/materials'
import { projectPhotos } from '../data/photoLibrary'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './HeritageExplorerTest.module.css'

const HeritageStudy = lazy(() => import('../three/HeritageStudy'))
const choices = [
  {
    id: 'original', label: 'Preserve its character', short: 'Keep what makes it home', material: 'clad' as MaterialKey,
    focus: 'Original weatherboards highlighted',
    heading: 'Keep what gives it character.',
    body: 'The roofline, timber boards and verandah give an older home its familiar presence. Kalinga shows how these elements come together in a completed home.',
    photo: projectPhotos.kalinga[0], project: 'Kalinga', slug: 'kalinga', caption: 'A familiar street frontage, with timber boards and double verandahs.',
    details: [
      { name: 'Weatherboards', text: 'The boards give the original house its texture and rhythm. The illustration highlights this outer layer.' },
      { name: 'Roof and openings', text: 'Roof forms, window proportions and verandah details all contribute to the character of an older home.' },
    ],
  },
  {
    id: 'extension', label: 'Make room for living', short: 'Space for the way you live', material: 'charred' as MaterialKey,
    focus: 'New wing cladding highlighted',
    heading: 'More room for everyday life.',
    body: 'Generous living spaces, daylight and an easy connection to the garden. At Bardon, the kitchen and covered deck show the feeling of openness that new work can bring.',
    photo: projectPhotos.bardon[0], project: 'Bardon', slug: 'bardon', caption: 'A timber kitchen and open living space connecting to the deck.',
    details: [
      { name: 'Structure and new work', text: 'Bearers, studs and roof framing support the new spaces. The illustration uses darker cladding to distinguish the added wing.' },
      { name: 'Glazing and openings', text: 'Window and door placement shape the daylight, views and connections between rooms. Materials are specific to each project.' },
    ],
  },
  {
    id: 'verandah', label: 'Connect to the outdoors', short: 'Another room beyond the walls', material: 'deck' as MaterialKey,
    focus: 'Verandah decking highlighted',
    heading: 'Let living reach outside.',
    body: 'A sheltered place to gather and a view beyond the walls. The Ascot verandah shows how a covered outdoor space can feel like another room of the home.',
    photo: projectPhotos.ascot[3], project: 'Ascot', slug: 'ascot', caption: 'A covered timber verandah with places to sit, dine and enjoy the outlook.',
    details: [
      { name: 'Decking', text: 'The timber floor forms the outdoor room. Its relationship to the internal floor and door openings shapes how the spaces connect.' },
      { name: 'Shelter and edges', text: 'Roof cover, posts, balustrades and steps give the verandah its enclosure and connection to the garden.' },
    ],
  },
]

/** Guided comparison test. The original MaterialKey section stays unchanged. */
export function HeritageExplorerTest() {
  const [selected, setSelected] = useState('original')
  const section = useRef<HTMLElement>(null)
  const near = useInView(section, { margin: '250px 0px' })
  const reduced = useReducedMotion()
  const current = choices.find(item => item.id === selected)!
  const index = choices.indexOf(current)
  const still = <div className={styles.staticModel}><HeritageStudyStill className={styles.drawing} highlight={current.material} /></div>

  return (
    <section ref={section} id="heritage-explorer-test" className={styles.section} aria-labelledby="heritage-explorer-heading">
      <div className="shell">
        <div className={styles.testBar}><span className={styles.testBadge}>Guided renovation study</span></div>
        <div className={styles.intro}>
          <h2 id="heritage-explorer-heading" className={styles.heading}>How we approach<br /><em>an older home.</em></h2>
          <div className={styles.introCopy}><p>Keep the character you love. Make space for the way you live.</p><p>Choose an idea below to highlight the model and see a real example from our work.</p></div>
        </div>
        <div className={styles.controls} role="group" aria-label="Choose a renovation idea">
          {choices.map((item, i) => <button key={item.id} type="button" className={[styles.choice, selected === item.id ? styles.choiceOn : ''].join(' ')} aria-pressed={selected === item.id} aria-controls="heritage-explorer-story" onClick={() => setSelected(item.id)}>
            <span className={styles.choiceNumber}>0{i + 1}</span><span className={styles.choiceCopy}><strong>{item.label}</strong><span>{item.short}</span></span>
          </button>)}
        </div>
        <div className={styles.grid}>
          <div className={styles.modelColumn}>
            <div className={styles.panelHeading}><span>The idea</span><span aria-hidden="true">0{index + 1} / 03</span></div>
            <div className={styles.modelFrame}>
              <p className={styles.modelLabel}>Illustration of a typical renovation</p>
              {near ? <SceneFrame className={styles.scene} rootMargin="0px" still={still} label={`Illustrative heritage house. ${current.focus}. Use the labelled choices above to change the highlighted element.`}>
                <HeritageStudy shadows={false} highlight={current.material} />
              </SceneFrame> : <div className={styles.scene}>{still}</div>}
              <p className={styles.modelNote}><span aria-hidden="true" />{current.focus}</p>
            </div>
            <p className={styles.disclaimer}>The model explains the idea. Photographs show separate completed Bellewood projects.</p>
          </div>
          <div id="heritage-explorer-story" className={styles.story}>
            <div className={styles.panelHeading}><span>Built example <span aria-hidden="true">/</span> <strong>{current.project}</strong></span><Link to={`/work/${current.slug}`}>View project </Link></div>
            <div className={styles.photo}>
              <AnimatePresence initial={false}>
                <motion.img key={current.id} src={current.photo.src!} alt={current.photo.alt} loading="lazy" decoding="async" initial={reduced ? false : { opacity: 0, scale: 1.025 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }} />
              </AnimatePresence>
            </div>
            <p className={styles.caption}>{current.caption}</p>
            <div className={styles.storyText} aria-live="polite" aria-atomic="true"><h3>{current.heading}</h3><p>{current.body}</p></div>
            <details key={current.id} className={styles.details}>
              <summary>Materials and details<span aria-hidden="true">+</span></summary>
              <dl>{current.details.map(detail => <div key={detail.name}><dt>{detail.name}</dt><dd>{detail.text}</dd></div>)}</dl>
            </details>
          </div>
        </div>
        <div className={styles.bottom}><p>Every home brings its own possibilities.</p><Link to="/contact">Talk about your home </Link></div>
      </div>
    </section>
  )
}
