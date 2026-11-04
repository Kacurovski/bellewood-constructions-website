import { ActionGlyph } from '../components/ActionGlyph'
import type { ReactNode } from 'react'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { photographyStories } from '../data/projects'
import type { ImageSlot } from '../data/projects'
import { contact } from '../config/site'
import { getLenis } from '../hooks/useLenis'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './PhotographyStories.module.css'

const ease = [0.22, 1, 0.36, 1] as const

function StoryPhoto({ image, project, caption, shape, position = '50% 50%', still = false }: {
  image: ImageSlot; project: string; caption: string; shape: 'landscape' | 'portrait' | 'exterior'; position?: string; still?: boolean
}) {
  const figure = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: figure, offset: ['start end', 'end start'] })
  const drift = useTransform(scrollYProgress, [0, 1], [-12, 12])
  return (
    <figure ref={figure} className={styles.figure}>
      <div className={[styles.photo, styles[shape]].join(' ')} data-story-photo={project.toLowerCase()}>
        {image.src && <motion.img draggable={false} src={image.src} alt={image.alt} loading="lazy" decoding="async"
          style={{ y: reduced || still ? 0 : drift, objectPosition: position }} />}
      </div>
      <figcaption className={styles.imageCaption}><span>{project}</span><span>{caption}</span></figcaption>
    </figure>
  )
}

// Embedded spreads are choreographed by their shared frame, not scroll reveals.
function EditorialFrame({ children, className }: { children: ReactNode; className?: string; delay?: number }) {
  return <div className={className}>{children}</div>
}

/** Everyday spaces and their connections to the outdoors. */
export function LivingSpaces({ sheetNumber = "A-03", embedded = false }: { sheetNumber?: string; embedded?: boolean } = {}) {
  const Frame = embedded ? EditorialFrame : Reveal
  const photos = photographyStories.living
  return (
    <section className={[styles.magazine, embedded ? styles.embeddedStory : ''].join(' ')} aria-labelledby="living-heading">
      <div className="shell">
        {!embedded && <SheetRef number={sheetNumber} name="Spaces to live in" note="Inside and out" />}
        <div className={styles.editorialIntro}>
          <Frame>
            <h2 id="living-heading" className={styles.editorialTitle}>
              Made for the everyday.<span>Open to the outdoors.</span>
            </h2>
          </Frame>
          <Frame delay={0.1} className={styles.introNote}>
            <p>Generous kitchens, sheltered verandahs and light-filled rooms. A closer look at how these Brisbane homes connect inside and out.</p>
          </Frame>
        </div>
        <div className={styles.editorialGrid}>
          <Frame className={styles.leadPhoto}>
            <StoryPhoto still={embedded} image={photos.main} project="Bardon" caption="Room to open up." shape="landscape" />
          </Frame>
          <Frame delay={0.16} className={styles.tallPhoto}>
            <StoryPhoto still={embedded} image={photos.detail} project="Yeronga" caption="Character in the details." shape="portrait" position="24% 50%" />
          </Frame>
          <Frame delay={0.08} className={styles.exteriorPhoto}>
            <StoryPhoto still={embedded} image={photos.exterior} project="Windsor" caption="The street facade and garden." shape="exterior" />
          </Frame>
          <Frame delay={0.16} className={styles.editorialNote}>
            <span className={styles.shortRule} aria-hidden="true" />
            <p className={styles.editorialQuote}>A place to gather.<br />A little room to retreat.</p>
            <p className={styles.spaceNote}>Wide openings draw the kitchen onto the verandah. Quieter rooms offer a different pace, with daylight and a view to the garden.</p>
            <Link to="/work" className={styles.architectLink}>Explore the homes </Link>
          </Frame>
        </div>
      </div>
    </section>
  )
}

type Detail = (typeof photographyStories.craft.details)[number]

/** Native modal supplies focus containment, Escape, and an uncropped full image. */
function FullPhotograph({ detail, onClose }: { detail: Detail | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    if (!detail || !dialog.current) return
    const node = dialog.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const lenis = getLenis()
    const resume = lenis && !lenis.isStopped
    node.showModal()
    document.body.style.overflow = 'hidden'
    lenis?.stop()
    return () => {
      node.close()
      document.body.style.overflow = previousOverflow
      if (resume) lenis?.start()
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true })
    }
  }, [detail])
  return (
    <dialog ref={dialog} className={styles.lightbox} aria-labelledby={titleId} data-lenis-prevent
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className={styles.lightboxInner}>
        <div className={styles.lightboxHeader}>
          <h3 id={titleId}>{detail ? `${detail.project} / ${detail.title}` : 'Project photograph'}</h3>
          <button type="button" onClick={onClose} autoFocus className={styles.close}>Close <span aria-hidden="true">&#215;</span></button>
        </div>
        {detail?.full.src && <img className={styles.fullPhoto} src={detail.full.src} alt={detail.full.alt} />}
        {detail && <p className={styles.lightboxNote}>{detail.note}</p>}
      </div>
    </dialog>
  )
}

export function Craftsmanship({ sheetNumber = "A-04", embedded = false, onPhotoOpenChange }: { sheetNumber?: string; embedded?: boolean; onPhotoOpenChange?: (open: boolean) => void } = {}) {
  const Frame = embedded ? EditorialFrame : Reveal
  const [opened, setOpened] = useState<Detail | null>(null)
  const reduced = useReducedMotion()
  const photos = photographyStories.craft
  useEffect(() => { onPhotoOpenChange?.(opened !== null) }, [opened, onPhotoOpenChange])
  return (
    <section className={[styles.craft, embedded ? styles.embeddedStory : ''].join(' ')} aria-labelledby="architects-heading">
      <div className="shell">
        {!embedded && <SheetRef number={sheetNumber} name="The craft" note="For architects and designers" />}
        <div className={styles.craftGrid}>
          <Frame className={styles.craftOverview}>
            <StoryPhoto still={embedded} image={photos.overview} project="Auchenflower" caption="Timber, light and proportion." shape="portrait" />
          </Frame>
          <div className={styles.craftBody}>
            <Frame>
              <p className={styles.kicker}>From the whole room to the smallest detail</p>
              <h2 id="architects-heading" className={styles.craftTitle}>The detail makes<br /><span>the difference.</span></h2>
              <p className={styles.craftCopy}>A stair rail, a cabinet edge, the framing around a window. Each belongs to the whole room. For architects and designers, we build to the drawings, raise questions early in writing, and keep a site you can bring a client to.</p>
              <a href={contact.phoneHref} className={styles.architectLink}>Talk it through before tender </a>
            </Frame>
            <div className={styles.details}>
              {photos.details.map((detail, i) => (
                <Frame key={detail.title} delay={0.1 + i * 0.1}>
                  <button type="button" className={styles.detailButton} onClick={() => setOpened(detail)}
                    aria-label={`View full ${detail.project} photograph: ${detail.title}`} aria-haspopup="dialog">
                    <span className={styles.detailImage} data-story-photo={detail.project.toLowerCase()}>
                      <motion.img draggable={false} src={detail.crop.src!} alt={detail.crop.alt} loading="lazy" decoding="async"
                        whileHover={reduced ? undefined : { scale: 1.06 }} transition={{ duration: 0.9, ease }} />
                      <span className={styles.openMark}><ActionGlyph name="expand" /></span>
                    </span>
                    <span className={styles.detailHeading}><span>{detail.title}</span><span className={styles.detailNumber}>0{i + 1}</span></span>
                    <span className={styles.detailNote}>{detail.project} / View photograph</span>
                  </button>
                </Frame>
              ))}
            </div>
          </div>
        </div>
      </div>
      <FullPhotograph detail={opened} onClose={() => setOpened(null)} />
    </section>
  )
}

const STORY_HOLD = 8000
const TURN_DURATION = 1.45
const storyNames = ['Spaces to live in', 'A closer look']
type PhotoJourney = {
  key: string
  from: { x: number; y: number; width: number; height: number }
  to: { x: number; y: number; width: number; height: number }
  start: string; finish: string; startPosition: string; finishPosition: string
}

/** Two editorial compositions share their natural height and exchange photographs. */
export function PhotographyStorySlides({ sheetNumber = 'A-04' }: { sheetNumber?: string } = {}) {
  const [active, setActive] = useState(0)
  const stageId = useId()
  const chapterSelectionId = useId()
  const progress = useMotionValue(0)
  const remaining = useTransform(progress, [0, 1], [1, 0])
  const [paused, setPaused] = useState(false)
  const [focusHeld, setFocusHeld] = useState(false)
  const [pointerHeld, setPointerHeld] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)
  const [photoOpen, setPhotoOpen] = useState(false)
  const [journeys, setJourneys] = useState<PhotoJourney[]>([])
  const reduced = useReducedMotion()
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const perspectives = useRef<(HTMLDivElement | null)[]>([])
  const visible = useInView(section, { amount: 0.45 })
  const elapsed = useRef(0)
  const journeyBusy = useRef(false)
  const gesture = useRef<{ x: number; y: number; id: number } | null>(null)
  const suppressClick = useRef(false)
  const playing = visible && pageVisible && !paused && !focusHeld && !pointerHeld && !photoOpen && !reduced

  useLayoutEffect(() => {
    perspectives.current.forEach((panel, i) => panel?.toggleAttribute('inert', i !== active))
  }, [active])

  useEffect(() => {
    const photos = photographyStories
    ;[photos.living.main, photos.living.detail, photos.craft.overview,
      ...photos.craft.details.map((detail) => detail.crop)].forEach((photo) => {
      const image = new Image(); image.src = photo.src!
    })
  }, [])

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden)
    const resize = () => { journeyBusy.current = false; setJourneys([]) }
    document.addEventListener('visibilitychange', update)
    window.addEventListener('resize', resize)
    return () => {
      document.removeEventListener('visibilitychange', update)
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    if (reduced) { journeyBusy.current = false; setJourneys([]) }
  }, [reduced])

  function select(index: number) {
    if (journeyBusy.current) return
    const next = (index + 2) % 2
    if (next === active) return
    elapsed.current = 0
    progress.set(0)
    if (!reduced && stage.current) {
      const frame = stage.current.getBoundingClientRect()
      const rect = (element: HTMLElement) => {
        const r = element.getBoundingClientRect()
        return { x: r.left - frame.left, y: r.top - frame.top, width: r.width, height: r.height }
      }
      const paths: PhotoJourney[] = []
      for (const key of ['bardon', 'yeronga']) {
        const from = perspectives.current[active]?.querySelector<HTMLElement>(`[data-story-photo="${key}"]`)
        const to = perspectives.current[next]?.querySelector<HTMLElement>(`[data-story-photo="${key}"]`)
        const start = from?.querySelector('img')
        const finish = to?.querySelector('img')
        if (from && to && start && finish) paths.push({ key, from: rect(from), to: rect(to),
          start: start.currentSrc || start.src, finish: finish.currentSrc || finish.src,
          startPosition: getComputedStyle(start).objectPosition, finishPosition: getComputedStyle(finish).objectPosition })
      }
      journeyBusy.current = paths.length > 0
      setJourneys(paths)
    }
    setActive(next)
  }

  useEffect(() => {
    if (!playing) return
    let frame: number
    let last = performance.now()
    const tick = (now: number) => {
      elapsed.current += Math.max(0, now - last)
      last = now
      progress.set(Math.min(elapsed.current / STORY_HOLD, 1))
      if (elapsed.current >= STORY_HOLD && !journeyBusy.current) { select(1 - active); return }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // A journey ends well before the next turn; the clock continues through it.
  }, [playing, active])

  return (
    <section ref={section} className={styles.calmStory} aria-labelledby="spaces-craft-heading"
      aria-roledescription="carousel" data-story-view={active} data-story-playing={playing} data-story-changing={journeys.length > 0}
      onFocusCapture={(event) => { if (event.target.matches(':focus-visible')) setFocusHeld(true) }}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusHeld(false) }}>
      <div className={['shell', styles.storyFrame].join(' ')}>
        <div className={styles.calmHeader}>
          <SheetRef number={sheetNumber} name={<span id="spaces-craft-heading">Spaces &amp; craftsmanship</span>} rule={false} />
          <div className={styles.chapterTools} role="group" aria-label="Two perspectives on the homes">
            <ol className={styles.chapterJourney}>
              {['Living spaces', 'The finer details'].map((label, index) => (
                <li key={label} className={index === active ? styles.chapterCurrent : ''}>
                  {index === active && (reduced
                    ? <span className={styles.chapterSelection} aria-hidden="true" />
                    : <motion.span className={styles.chapterSelection} layoutId={chapterSelectionId}
                        transition={{ duration: 0.55, ease }} aria-hidden="true" />)}
                  <button type="button" onClick={() => select(index)} aria-controls={stageId}
                    aria-pressed={index === active} aria-label={`Show ${storyNames[index].toLowerCase()}`}
                    aria-disabled={journeys.length > 0}>
                    <span className={styles.chapterLabel}>{label}</span>
                  </button>
                </li>
              ))}
            </ol>
            {!reduced && <button type="button" className={styles.calmPause}
              aria-label={paused || focusHeld ? 'Resume automatic changes' : 'Pause automatic changes'}
              aria-pressed={paused || focusHeld} aria-controls={stageId}
              onClick={() => { setPaused(paused || focusHeld ? false : true); setFocusHeld(false) }}>
              <svg className={styles.pauseDial} viewBox="0 0 44 44" fill="none" aria-hidden="true">
                <circle className={styles.dialTrack} cx="22" cy="22" r="18" />
                <motion.circle className={styles.dialProgress} cx="22" cy="22" r="18" pathLength="1"
                  strokeDasharray="1" style={{ strokeDashoffset: remaining }} />
              </svg>
              <svg className={styles.pauseSymbol} viewBox="0 0 20 20" fill="none" aria-hidden="true">{paused || focusHeld
                ? <path d="m7 4 9 6-9 6V4Z" fill="currentColor" />
                : <><rect x="6" y="5" width="2.5" height="10" rx="0.7" fill="currentColor" /><rect x="11.5" y="5" width="2.5" height="10" rx="0.7" fill="currentColor" /></>}</svg>
              <span className={styles.pauseHint} aria-hidden="true">{paused || focusHeld ? 'Resume automatic changes' : 'Pause automatic changes'}</span>
            </button>}
          </div>
        </div>
        <div className={styles.storyBody}>
          <div ref={stage} id={stageId} className={styles.calmStage}
            onDragStartCapture={(event) => event.preventDefault()}
            onPointerDown={(event) => {
              suppressClick.current = false
              if (!event.isPrimary || event.button !== 0 || (event.target as HTMLElement).closest('a, button, dialog')) return
              gesture.current = { x: event.clientX, y: event.clientY, id: event.pointerId }
              setPointerHeld(true)
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerUp={(event) => {
              const start = gesture.current
              gesture.current = null
              setPointerHeld(false)
              if (!start || start.id !== event.pointerId) return
              const dx = event.clientX - start.x
              const dy = event.clientY - start.y
              if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                suppressClick.current = true
                select(1 - active)
              }
            }}
            onPointerCancel={() => { gesture.current = null; setPointerHeld(false) }}
            onClickCapture={(event) => {
              if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false }
            }}>
            {[
              <LivingSpaces embedded key="spaces" />,
              <Craftsmanship embedded onPhotoOpenChange={setPhotoOpen} key="craft" />,
            ].map((content, i) => (
              <div key={i} ref={(node) => { perspectives.current[i] = node }}
                className={[styles.calmPanel, i === active ? styles.activePanel : ''].join(' ')}
                data-story-panel={i} aria-hidden={i !== active} role="group" aria-roledescription="slide"
                aria-label={`${i + 1} of 2: ${storyNames[i]}`}>
                {content}
              </div>
            ))}
            {journeys.map((path, index) => (
              <motion.div key={`${active}-${path.key}`} className={styles.travellingPhoto} aria-hidden="true"
                initial={path.from} animate={path.to}
                onAnimationComplete={() => { if (index === 0) { journeyBusy.current = false; setJourneys([]) } }}
                transition={{ duration: TURN_DURATION - index * 0.06, ease: [0.65, 0, 0.2, 1] }}>
                <img src={path.start} alt="" style={{ objectPosition: path.startPosition }} />
                <motion.img src={path.finish} alt="" style={{ objectPosition: path.finishPosition }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.65, delay: 0.65 }} />
              </motion.div>
            ))}
          </div>
          <div className={styles.storyNavigation}>
            <button type="button" className={styles.pageTurn}
              aria-label={`Turn the page: ${active === 0 ? 'The finer details' : 'Living spaces'}`} aria-controls={stageId}
              aria-disabled={journeys.length > 0} onClick={() => select(1 - active)}>
              <span className={styles.pagePreview} aria-hidden="true">
                <span className={styles.pageBehind} />
                <span className={styles.pagePhoto}>
                  {[photographyStories.craft.overview, photographyStories.living.main].map((photo, index) => (
                    <img key={photo.src} src={photo.src!} alt="" loading="lazy" draggable={false}
                      className={active === index ? styles.previewVisible : ''} />
                  ))}
                </span>
              </span>
              <span className={styles.pageWords}>
                <span className={styles.pageHint}>Turn the page</span>
                <span className={styles.pageTitle}>{active === 0 ? 'The finer details' : 'Living spaces'}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
