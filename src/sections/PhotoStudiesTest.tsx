import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { getLenis } from '../hooks/useLenis'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { wilstonStory, everydaySpaces } from '../data/photoStudies'
import styles from './PhotoStudiesTest.module.css'

/** Two independent, additive studies: one home in depth, then rooms across homes. */
export function PhotoStudiesTest() {
  return <><FrontDoorStudy /><EverydayStudy /></>
}

export function FrontDoorStudy() {
  const [chapter, setChapter] = useState(0)
  const current = wilstonStory.chapters[chapter]

  return (
    <section id="front-door-test" aria-labelledby="front-door-heading" className={styles.story}>
      <div className="shell">
        <div className={styles.studyLabel}><span>Featured home / Wilston</span><span>From the street to the garden</span></div>
        <Reveal className={styles.intro}>
          <h2 id="front-door-heading">Beyond the<br /><em>front door.</em></h2>
          <div><span className={styles.eyebrow}>One home. More to discover.</span><p>A familiar face to the street. A different feeling within. Explore the spaces that make this Wilston house a home.</p></div>
        </Reveal>
        <div className={styles.journey}>
          <Reveal className={styles.street}>
            <div className={styles.streetNote}><span>From the street</span><span aria-hidden="true">01 &mdash; 03 &rarr;</span></div>
            <figure>
              <img src={wilstonStory.exterior.src ?? undefined} alt={wilstonStory.exterior.alt} loading="lazy" decoding="async" width="1200" height="800" />
              <figcaption><strong>Wilston</strong><span>The familiar face.</span></figcaption>
            </figure>
            <p className={styles.streetCopy}>The gable, the verandah, the picket fence. A Brisbane welcome, with another story behind it.</p>
            <Link className={styles.projectLink} to="/work/wilston">Explore the whole home <span aria-hidden="true">&#8599;</span></Link>
          </Reveal>
          <Reveal delay={0.12} className={styles.inside}>
            <div className={styles.insideTop}><span>Within the home</span><span aria-hidden="true">0{chapter + 1} / 03</span></div>
            <div className={styles.roomImage}>
              {wilstonStory.chapters.map((room, i) => (
                <img key={room.label} src={room.photo.src ?? undefined} alt={i === chapter ? room.photo.alt : ''} aria-hidden={i !== chapter} loading="lazy" decoding="async" className={i === chapter ? styles.roomVisible : ''} />
              ))}
            </div>
            <div className={styles.chapterButtons} role="group" aria-label="Explore the Wilston home">
              {wilstonStory.chapters.map((room, i) => <button key={room.label} type="button" aria-pressed={chapter === i} aria-controls="wilston-room-caption" onClick={() => setChapter(i)}><span>0{i + 1}</span>{room.label}<span aria-hidden="true">&#8599;</span></button>)}
            </div>
            <div id="wilston-room-caption" className={styles.roomCaption} aria-live="polite" aria-atomic="true"><h3>{current.title}</h3><p>{current.description}</p></div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function EverydayStudy({ home = false }: { home?: boolean } = {}) {
  const [active, setActive] = useState(0)
  const controls = useRef<(HTMLButtonElement | null)[]>([])
  const revealSelection = useRef<number | null>(null)
  const reduced = useReducedMotion()
  const current = everydaySpaces[active]

  function select(index: number) {
    if (index === active) return
    revealSelection.current = window.matchMedia('(max-width: 680px)').matches ? index : null
    setActive(index)
  }

  function revealPanel(index: number) {
    if (revealSelection.current !== index) return
    revealSelection.current = null
    const panel = controls.current[index]
    if (!panel) return
    // A collapsing panel above the selection can otherwise lift the newly
    // opened photograph behind the header. Measure after its actual transition.
    const bounds = panel.getBoundingClientRect()
    const inset = (document.querySelector('header')?.getBoundingClientRect().bottom ?? 80) + 16
    if (bounds.top >= inset && bounds.bottom <= window.innerHeight - 16) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(panel, { offset: -inset, duration: 0.55 })
    else window.scrollTo({ top: bounds.top + window.scrollY - inset, behavior: reduced ? 'instant' : 'smooth' })
  }

  useEffect(() => {
    if (!reduced) return
    const timer = window.setTimeout(() => revealPanel(active), 0)
    return () => window.clearTimeout(timer)
  }, [active, reduced])

  function move(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % everydaySpaces.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + everydaySpaces.length - 1) % everydaySpaces.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = everydaySpaces.length - 1
    else return
    event.preventDefault()
    select(next)
    controls.current[next]?.focus({ preventScroll: true })
  }

  return (
    <section id="everyday-spaces-test" aria-labelledby="everyday-heading" data-sheet-rail="quiet" className={['on-green', styles.everyday].join(' ')}>
      <div className={styles.wide}>
        {home ? <SheetRef number="A-03" name="Spaces to live in" note="Four ways to feel at home" /> :
          <div className={styles.studyLabel}><span>Spaces to live in</span><span>Four ways to feel at home</span></div>}
        <Reveal className={styles.everydayIntro}>
          <h2 id="everyday-heading">Room for<br /><em>everyday life.</em></h2>
          <p>Good homes make room for the ordinary things.<br />Choose a moment. Find a home.</p>
        </Reveal>
        <Reveal>
          <div className={styles.panels} role="group" aria-label="Choose a moment at home">
            {everydaySpaces.map((space, i) => (
              <button key={space.slug} ref={el => { controls.current[i] = el }} type="button" className={[styles.panel, i === active ? styles.panelActive : ''].join(' ')} aria-pressed={i === active} aria-label={`${space.title}: ${space.project}`} aria-controls="everyday-caption" onClick={() => select(i)} onKeyDown={event => move(event, i)}
                onTransitionEnd={event => { if (event.target === event.currentTarget && event.propertyName === 'height') revealPanel(i) }}>
                <img src={space.photo.src ?? undefined} alt={space.photo.alt} loading="lazy" decoding="async" style={{ objectPosition: space.position }} />
                <span className={styles.panelNumber}>0{i + 1}<span aria-hidden="true">{i === active ? '\u2212' : '+'}</span></span>
                <span className={styles.panelTitle}>{space.title}</span>
                <span className={styles.panelProject}>{space.project}</span>
              </button>
            ))}
          </div>
          <div className={styles.selection} id="everyday-caption">
            <div aria-live="polite" aria-atomic="true" className={styles.selectionCopy}><span className={styles.eyebrow}>{current.project} / {current.title}</span><p>{current.description}</p></div>
            <Link className={styles.reverseLink} to={`/work/${current.slug}`}>Explore {current.project}<span aria-hidden="true">&#8599;</span></Link>
          </div>
        </Reveal>
        {home && <div className={styles.collectionLink}>
          <span>Every home has its own story.</span>
          <Link to="/work" className={styles.collectionButton}>
            <span>Explore all work</span>
            <span className={styles.collectionArrow} aria-hidden="true">
              <svg viewBox="0 0 60 24" fill="none"><path d="M1 12h55m-10-9 10 9-10 9" stroke="currentColor" strokeWidth="1.25" /></svg>
            </span>
          </Link>
        </div>}
      </div>
    </section>
  )
}
