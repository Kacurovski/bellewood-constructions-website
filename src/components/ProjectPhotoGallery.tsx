import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ImageSlot, Project } from '../data/projects'
import { getLenis } from '../hooks/useLenis'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './ProjectPhotoGallery.module.css'

type Photograph = ImageSlot & { src: string }
const ease = [0.22, 1, 0.36, 1] as const
const number = (value: number) => String(value).padStart(2, '0')

function Arrow({ back = false }: { back?: boolean }) {
  return <svg viewBox="0 0 32 20" fill="none" aria-hidden="true" style={back ? { transform: 'rotate(180deg)' } : undefined}>
    <path d="M2 10h27M21 2l8 8-8 8" stroke="currentColor" strokeWidth="1.4" />
  </svg>
}

function FullPhoto({ title, image, index, total, onChange, onClose }: {
  title: string; image: Photograph; index: number; total: number
  onChange: (index: number) => void; onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const node = dialog.current
    if (!node) return
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    const lenis = getLenis()
    const resume = lenis && !lenis.isStopped
    node.showModal()
    document.body.style.overflow = 'hidden'
    lenis?.stop()
    return () => {
      node.close()
      document.body.style.overflow = overflow
      if (resume) lenis?.start()
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  return <dialog ref={dialog} className={styles.lightbox} aria-labelledby={titleId} data-lenis-prevent
    onCancel={(event) => { event.preventDefault(); onClose() }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    onKeyDown={(event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        onChange(index + (event.key === 'ArrowLeft' ? -1 : 1))
      }
    }}>
    <div className={styles.lightboxInner}>
      <header className={styles.lightboxHeader}>
        <h3 id={titleId}>{title}<span>{number(index + 1)} / {number(total)}</span></h3>
        <button type="button" className={styles.close} onClick={onClose} autoFocus>
          Close <span aria-hidden="true">×</span>
        </button>
      </header>
      <div className={styles.fullFrame}>
        <img src={image.src} alt={image.alt} className={styles.fullImage} />
      </div>
      <div className={styles.lightboxFooter}>
        <p>{image.alt}</p>
        {total > 1 && <div className={styles.fullNavigation}>
          <button type="button" onClick={() => onChange(index - 1)} aria-label="Previous photograph"><Arrow back /></button>
          <button type="button" onClick={() => onChange(index + 1)} aria-label="Next photograph"><Arrow /></button>
        </div>}
      </div>
    </div>
  </dialog>
}

/** One inspection stage; the complete contact sheet stays in a fixed order. */
export function ProjectPhotoGallery({ project }: { project: Project }) {
  const reduced = useReducedMotion()
  const headingId = useId()
  const stageId = useId()
  const track = useRef<HTMLDivElement>(null)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const request = useRef(0)
  const pointerPreview = useRef(false)
  const [active, setActive] = useState(0)
  const [opened, setOpened] = useState(false)
  const images = useMemo(() => [project.hero, ...project.gallery]
    .filter((image): image is Photograph => Boolean(image.src))
    .filter((image, index, all) => all.findIndex((other) => other.src === image.src) === index), [project])
  const image = images[active]

  function select(index: number, preview = false) {
    if (!images.length) return
    const next = (index + images.length) % images.length
    const token = ++request.current
    pointerPreview.current = preview
    // Keep the current photograph visible until the requested one is ready.
    const incoming = new Image()
    const show = () => { if (token === request.current) setActive(next) }
    incoming.onload = show
    incoming.src = images[next].src
    if (incoming.complete && incoming.naturalWidth) show()
  }

  useEffect(() => {
    return () => { request.current += 1 }
  }, [])

  useEffect(() => {
    if (images.length < 2) return
    for (const offset of [-1, 1]) {
      const adjacent = new Image()
      adjacent.src = images[(active + offset + images.length) % images.length].src
    }
    const strip = track.current
    const button = buttons.current[active]
    if (!strip || !button || pointerPreview.current) return
    const left = button.offsetLeft
    if (left < strip.scrollLeft || left + button.offsetWidth > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: Math.max(0, left - (strip.clientWidth - button.offsetWidth) / 2), behavior: reduced ? 'auto' : 'smooth' })
    }
  }, [active, images, reduced])

  function thumbnailKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === 'ArrowLeft') next = (index - 1 + images.length) % images.length
    else if (event.key === 'ArrowRight') next = (index + 1) % images.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = images.length - 1
    else return
    event.preventDefault()
    select(next)
    buttons.current[next]?.focus({ preventScroll: true })
  }

  if (!image) return null

  return <section className={styles.gallery} aria-labelledby={headingId}>
    <div className={styles.heading}>
      <h2 id={headingId}>Project photographs</h2>
      <p className={styles.count} aria-live="polite" aria-atomic="true">
        <span className={styles.srOnly}>Photograph </span>{number(active + 1)}<span className={styles.countDivider}> / </span>{number(images.length)}
      </p>
    </div>

    <figure className={styles.figure}>
      <div id={stageId} className={styles.stage}>
        <AnimatePresence initial={false}>
          <motion.img key={image.src} src={image.src} alt={image.alt} decoding="async" draggable={false}
            className={styles.mainImage}
            initial={reduced ? false : { opacity: 0, scale: 1.025 }}
            animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.7, ease }} />
        </AnimatePresence>
        {images.length > 1 && <>
          <button type="button" className={[styles.arrow, styles.previous].join(' ')} onClick={() => select(active - 1)} aria-label="Previous photograph"><Arrow back /></button>
          <button type="button" className={[styles.arrow, styles.next].join(' ')} onClick={() => select(active + 1)} aria-label="Next photograph"><Arrow /></button>
        </>}
        <button type="button" className={styles.expand} onClick={() => setOpened(true)} aria-haspopup="dialog">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4" stroke="currentColor" strokeWidth="1.3" /></svg>
          View full photograph
        </button>
      </div>
      <figcaption className={styles.caption}>{image.alt.replace(new RegExp(`^${project.title}:\\s*`, 'i'), '')}</figcaption>
    </figure>

    <div className={styles.contactSheet}>
      <div className={styles.sheetHeading}>
        <span>{project.title}<span className={styles.sheetLabel}> / The complete collection</span></span>
        <span className={styles.hint}>Choose a photograph</span>
      </div>
      <div ref={track} className={styles.thumbnails} role="group" aria-label="Choose a photograph. Use left and right arrow keys to browse." data-lenis-prevent-wheel>
        {images.map((photo, index) => <button key={photo.src} type="button"
          ref={(node) => { buttons.current[index] = node }}
          className={[styles.thumbnail, active === index ? styles.selected : ''].join(' ')}
          aria-label={`Photograph ${index + 1} of ${images.length}: ${photo.alt}`}
          aria-pressed={active === index} aria-controls={stageId} tabIndex={active === index ? 0 : -1}
          onPointerEnter={(event) => { if (event.pointerType === 'mouse') select(index, true) }}
          onClick={() => select(index)} onKeyDown={(event) => thumbnailKeys(event, index)}>
          <span className={styles.thumbnailImage}><img src={photo.src} alt="" loading="lazy" decoding="async" draggable={false} /></span>
          <span className={styles.thumbnailNumber} aria-hidden="true">{number(index + 1)}<span /></span>
        </button>)}
      </div>
    </div>

    {opened && <FullPhoto title={project.title} image={image} index={active} total={images.length} onChange={select} onClose={() => setOpened(false)} />}
  </section>
}
