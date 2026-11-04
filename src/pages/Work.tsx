import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { PageHead } from '../components/PageHead'
import { WorkClosing } from '../sections/WorkClosing'
import { Services } from '../sections/Services'
import { FrontDoorStudy } from '../sections/PhotoStudiesTest'
import { projects } from '../data/projects'
import type { Project } from '../data/projects'
import { usePageTitle } from '../hooks/usePageTitle'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './Work.module.css'

const COUNT_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']

const galleryEase = [0.22, 1, 0.36, 1] as const

/** One complete contact sheet stays with the active home as the index scrolls. */
function WorkGallery({ project, id, onInteractionChange }: {
  project: Project; id: string; onInteractionChange: (held: boolean) => void
}) {
  const reduced = useReducedMotion()
  const gallery = useRef<HTMLDivElement>(null)
  const plate = useRef<HTMLAnchorElement>(null)
  const thumbnails = useRef<HTMLDivElement>(null)
  const markerId = useId()
  const openingsWarmed = useRef(false)
  const visible = useInView(gallery, { amount: 0.35 })
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)
  const [choice, setChoice] = useState({ slug: project.slug, index: 0 })
  const images = useMemo(() => [project.hero, ...project.gallery].filter((image, index, all) =>
    image.src && all.findIndex((other) => other.src === image.src) === index,
  ), [project])
  const selected = choice.slug === project.slug ? Math.min(choice.index, images.length - 1) : 0
  const main = images[selected]

  const choose = useCallback((index: number) => {
    setChoice({ slug: project.slug, index })
  }, [project.slug])

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  useEffect(() => {
    onInteractionChange(hovered || focused)
    return () => onInteractionChange(false)
  }, [hovered, focused, onInteractionChange])

  useEffect(() => {
    if (!visible || !pageVisible || reduced || hovered || focused || images.length < 2) return
    const timer = window.setTimeout(() => choose((selected + 1) % images.length), 5000)
    return () => window.clearTimeout(timer)
  }, [visible, pageVisible, reduced, hovered, focused, selected, images.length, project.slug, choose])

  useEffect(() => {
    if (!visible || openingsWarmed.current) return
    openingsWarmed.current = true
    projects.forEach((item) => {
      if (item.hero.src) { const image = new Image(); image.src = item.hero.src }
    })
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const next = images[(selected + 1) % images.length]
    if (next?.src) { const image = new Image(); image.src = next.src }
  }, [visible, images, selected])

  useEffect(() => {
    const track = thumbnails.current
    const button = track?.children[selected] as HTMLElement | undefined
    if (!track || !button || hovered) return
    track.scrollTo({
      left: Math.max(0, button.offsetLeft - (track.clientWidth - button.clientWidth) / 2),
      behavior: reduced ? 'auto' : 'smooth',
    })
  }, [selected, project.slug, reduced, hovered])

  function onMove(event: ReactPointerEvent<HTMLElement>) {
    if (reduced || event.pointerType !== 'mouse') return
    const box = plate.current?.getBoundingClientRect()
    if (!box) return
    plate.current?.style.setProperty('--cx', `${event.clientX - box.left}px`)
    plate.current?.style.setProperty('--cy', `${event.clientY - box.top}px`)
  }

  return (
    <div ref={gallery} id={id} className={styles.plateCol} role="region" aria-label={`${project.title} photographs`}
      data-work-gallery={project.slug} data-photo-index={selected}
      onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(true) }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
      <Link ref={plate} to={`/work/${project.slug}`} className={styles.plate}
        aria-label={`Explore ${project.title}`} onPointerMove={onMove}>
        <AnimatePresence initial={false}>
          {main && <motion.img key={`${project.slug}:${main.src}`} className={styles.plateImg}
            src={main.src!} alt={main.alt} decoding="async" data-work-photo={selected}
            initial={reduced ? false : { opacity: 0, scale: 1.025 }}
            animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 1.15, ease: galleryEase }} />}
        </AnimatePresence>
        <span className={styles.trace} aria-hidden="true">
          <span className={styles.traceH} /><span className={styles.traceV} />
          <span className={styles.traceTag}>Explore {project.title}</span>
        </span>
      </Link>
      <div className={styles.contactSheet}>
        <div className={styles.sheetHeading}>
          <p className={styles.sheetTitle}>{project.title}<span>Photographs</span></p>
          <span className={styles.photoCount} aria-label={`Photograph ${selected + 1} of ${images.length}`}>
            {String(selected + 1).padStart(2, '0')}<span aria-hidden="true"> / </span>{String(images.length).padStart(2, '0')}
          </span>
        </div>
        <div ref={thumbnails} className={styles.thumbnails} role="group" aria-label={`${project.title} photographs`}
          onKeyDown={(event) => {
            const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-photo]')
            if (!target) return
            const index = Number(target.dataset.photo)
            const next = event.key === 'ArrowRight' ? (index + 1) % images.length
              : event.key === 'ArrowLeft' ? (index - 1 + images.length) % images.length
              : event.key === 'Home' ? 0 : event.key === 'End' ? images.length - 1 : null
            if (next === null) return
            event.preventDefault()
            choose(next)
            const track = thumbnails.current
            const button = track?.children[next] as HTMLButtonElement | undefined
            button?.focus({ preventScroll: true })
            if (track && button) track.scrollTo({
              left: Math.max(0, button.offsetLeft - (track.clientWidth - button.clientWidth) / 2),
              behavior: reduced ? 'auto' : 'smooth',
            })
          }}>
          {images.map((image, index) => (
            <button key={`${project.slug}:${image.src}`} type="button" data-photo={index}
              className={[styles.thumbnail, index === selected ? styles.thumbnailActive : ''].join(' ')}
              aria-label={`Show photograph ${index + 1}: ${image.alt}`} aria-pressed={index === selected}
              onPointerEnter={(event) => { if (event.pointerType === 'mouse') choose(index) }}
              onFocus={() => choose(index)} onClick={() => choose(index)}>
              <span className={styles.thumbnailPicture}>
                <img src={image.src!} alt="" loading="lazy" decoding="async" />
                {index === selected && <motion.span className={styles.activeMarker}
                  layoutId={reduced ? undefined : markerId} transition={{ duration: reduced ? 0 : 0.5, ease: galleryEase }} aria-hidden="true" />}
              </span>
              <span className={styles.thumbnailNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}<span /></span>
            </button>
          ))}
        </div>
        <div className={styles.galleryFooter}>
          <Link to={`/work/${project.slug}`} className={styles.explore}>Explore {project.title}</Link>
        </div>
      </div>
    </div>
  )
}

function ProjectPreviewRow({ project, narrow, active, galleryId, onSelect, onKeyDown, children }: {
  project: Project; narrow: boolean; active: boolean; galleryId: string; onSelect: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void; children: ReactNode
}) {
  if (narrow) return <Link to={`/work/${project.slug}`} className={styles.rowLink} onFocus={onSelect}>{children}</Link>
  return <button type="button" className={styles.rowLink} aria-pressed={active} aria-controls={galleryId}
    onFocus={onSelect} onClick={onSelect} onKeyDown={onKeyDown}>{children}</button>
}

/** All nine projects from the approved photo folders, with scroll and pointer previews. */
export default function Work() {
  usePageTitle('Work')

  const pointer = useMediaQuery('(min-width: 941px) and (pointer: fine)')
  const narrow = useMediaQuery('(max-width: 940px)')
  const reduced = useReducedMotion()
  const [at, setAt] = useState(0)

  const rows = useRef<(HTMLLIElement | null)[]>([])
  const galleryId = useId()
  const galleryHeld = useRef(false)
  const holdGallery = useCallback((held: boolean) => { galleryHeld.current = held }, [])

  /* The row being read is the last one whose top has passed a line drawn across
     the upper third of the window. Measured against the window rather than
     against the plate, so the answer does not change when the plate does. */
  const readScroll = useCallback(() => {
    if (!narrow && (galleryHeld.current || rows.current.some((row) => row?.contains(document.activeElement)))) return
    const line = window.innerHeight * 0.38
    let next = 0
    rows.current.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top <= line) next = i
    })
    setAt(next)
  }, [narrow])

  useEffect(() => {
    readScroll()
    window.addEventListener('scroll', readScroll, { passive: true })
    window.addEventListener('resize', readScroll)
    return () => {
      window.removeEventListener('scroll', readScroll)
      window.removeEventListener('resize', readScroll)
    }
  }, [readScroll])

  /* --- The stack, on a phone -------------------------------------------------
     Below the split there is no sticky plate, so the projects become cards that
     stick under the header one after another, each sliding up over the last.
     The card being covered steps back as it goes: it shrinks a little toward
     the top and darkens, so the stack reads as depth rather than as one picture
     replacing another.

     How far a card is covered is measured, not animated on a timer: the
     distance the next card has travelled over it, as a share of its height.
     Written straight to a custom property on the row, once per frame at most,
     so scrolling the stack costs no React render at all. */
  const frame = useRef(0)
  const readStack = useCallback(() => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const els = rows.current
      els.forEach((el, i) => {
        if (!el) return
        const next = els[i + 1]
        let cover = 0
        if (next) {
          const a = el.getBoundingClientRect()
          const b = next.getBoundingClientRect()
          cover = Math.min(1, Math.max(0, (a.bottom - b.top) / a.height))
        }
        el.style.setProperty('--cover', cover.toFixed(3))
      })
    })
  }, [])

  useEffect(() => {
    const els = rows.current
    if (!narrow || reduced) {
      els.forEach((el) => el?.style.removeProperty('--cover'))
      return
    }
    readStack()
    window.addEventListener('scroll', readStack, { passive: true })
    window.addEventListener('resize', readStack)
    return () => {
      cancelAnimationFrame(frame.current)
      window.removeEventListener('scroll', readStack)
      window.removeEventListener('resize', readStack)
    }
  }, [narrow, reduced, readStack])

  const shown =
    projects.length < COUNT_WORDS.length ? COUNT_WORDS[projects.length] : String(projects.length)

  const live = projects[at]

  return (
    <>
      <PageHead
        variant="work"
        number="B-01"
        eyebrow="Work"
        title="Renovations, extensions and restorations."
        lede="From a familiar street frontage to the life within. Explore the spaces, materials and details that make each home its own."
        meta={[
          { label: 'In the collection', value: <span className={styles.count}>{shown} homes</span> },
          { label: 'All projects', value: <Link to={{ pathname: '/work', hash: '#work-collection' }}>Explore the collection</Link> },
          { label: 'Featured home', value: <Link to={{ pathname: '/work', hash: '#front-door-test' }}>Step inside Wilston</Link> },
        ]}
      />

      {/* Not `shell`. See the note in the stylesheet: the two fight. */}
      <section id="work-collection" tabIndex={-1} className={styles.set} aria-labelledby="work-collection-heading">
        <h2 id="work-collection-heading" className="visually-hidden">All work</h2>
        <div className={styles.split}>
          {!narrow && <WorkGallery project={live} id={galleryId} onInteractionChange={holdGallery} />}

          <ol className={styles.list} aria-label="All projects">
            {projects.map((project, i) => {
              return (
              <li
                key={project.slug}
                ref={(el) => {
                  rows.current[i] = el
                }}
                className={[styles.row, i === at ? styles.rowOn : ''].join(' ')}
                /* Each card sticks a hair lower than the one before, so the
                   edges of the ones behind stay visible — a stack, not a swap. */
                style={{ '--i': i } as React.CSSProperties}
                onPointerEnter={pointer ? () => setAt(i) : undefined}
              >
                <ProjectPreviewRow project={project} narrow={narrow} active={i === at} galleryId={galleryId}
                  onSelect={() => setAt(i)} onKeyDown={(event) => {
                    const next = event.key === 'ArrowDown' ? (i + 1) % projects.length
                      : event.key === 'ArrowUp' ? (i - 1 + projects.length) % projects.length
                      : event.key === 'Home' ? 0 : event.key === 'End' ? projects.length - 1 : null
                    if (next === null) return
                    event.preventDefault()
                    setAt(next)
                    rows.current[next]?.querySelector<HTMLButtonElement>('button')?.focus()
                  }}>

                  <span className={styles.rowNum}>
                    {String(i + 1).padStart(2, '0')}
                    {/* Only the phone's card shows the project total; the desktop
                        contact sheet counts photographs within the selected home. */}
                    <span className={styles.rowOf}> / {String(projects.length).padStart(2, '0')}</span>
                  </span>

                  <span className={styles.rowBody}>
                    <span className={['sub-heading', styles.rowTitle].join(' ')}>
                      {project.title}
                    </span>
                    <span className={styles.rowMeta}>
                      <span>{project.kind}</span>
                      <span>{project.gallery.length + 1} photographs</span>
                      {/* The dot travels with the suburb, so on a phone the line
                          wraps before the dot rather than stranding it. */}
                      <span className={styles.place}>
                        <span className={styles.dot} aria-hidden="true" />
                        <span>{project.suburb}</span>
                      </span>
                    </span>

                    {/* The one line the data has always carried and the index
                        has always thrown away. Six names and a suburb each is a
                        contents page; this is what makes the list worth moving
                        through, and it opens on the row you are actually on. */}
                    <span className={styles.rowSummary}>
                      <span>{project.summary}</span>
                    </span>
                  </span>

                  <span className={styles.rowAction}>{narrow ? 'View home' : i === at ? 'On view' : 'Preview'}</span>

                  {/* The plate, inline. Below the split's breakpoint there is no
                      sticky column to carry it and no pointer to reveal it with,
                      so every row carries its own — which is the plain stacked
                      list a phone should have had all along. */}
                  <span className={styles.rowPlate} aria-hidden="true">
                    <img src={project.hero.src ?? undefined} alt="" loading="lazy" />
                  </span>
                </ProjectPreviewRow>
              </li>
              )
            })}
          </ol>
        </div>
      </section>

      <FrontDoorStudy />

      {/* The projects show the work; this names it. Numbered after the last
          project page, since the index is B-01 and each project is B-02 on. */}
      <Services number={`B-${String(projects.length + 2).padStart(2, '0')}`} tone="green" />

      <WorkClosing />
    </>
  )
}
