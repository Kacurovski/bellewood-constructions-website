import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import type { Project } from '../data/projects'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './ProjectIndex.module.css'

type Props = { projects: Project[]; start?: number; footer?: ReactNode }
type GalleryProps = { project: Project; photoIndex: number; onPhotoChange: (index: number) => void }
const ease = [0.22, 1, 0.36, 1] as const

/** A persistent image stage animates both house and photograph changes.
 * The complete contact sheet stays in source order, including the selected image.
 */
function ProjectGallery({ project, photoIndex, onPhotoChange }: GalleryProps) {
  const reduced = useReducedMotion()
  const markerId = useId()
  const gallery = useRef<HTMLDivElement>(null)
  const thumbnails = useRef<HTMLDivElement>(null)
  const inView = useInView(gallery, { amount: 0.2 })
  const [hovering, setHovering] = useState(false)
  const [focused, setFocused] = useState(false)
  const images = useMemo(() =>
    [project.hero, ...project.gallery].filter((image, i, all) =>
      image.src && all.findIndex((other) => other.src === image.src) === i,
    ), [project],
  )
  const selected = Math.min(photoIndex, Math.max(0, images.length - 1))
  const main = images[selected]

  useEffect(() => {
    const track = thumbnails.current
    const button = track?.children[selected] as HTMLElement | undefined
    if (!track || !button || hovering) return
    track.scrollTo({
      left: Math.max(0, button.offsetLeft - (track.clientWidth - button.clientWidth) / 2),
      behavior: reduced ? 'auto' : 'smooth',
    })
  }, [selected, project.slug, reduced, hovering])

  useEffect(() => {
    if (reduced || hovering || focused || !inView || images.length < 2) return
    const timer = window.setTimeout(() => onPhotoChange((selected + 1) % images.length), 5000)
    return () => window.clearTimeout(timer)
  }, [project.slug, selected, images.length, onPhotoChange, reduced, hovering, focused, inView])

  return (
    <>
      <div ref={gallery} className={styles.gallery}
        onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovering(true) }}
        onPointerLeave={() => setHovering(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
        }}>
        <Link to={`/work/${project.slug}`} className={styles.frame}
          aria-label={`View ${project.title} project`}>
          <AnimatePresence initial={false}>
            {main ? (
              <motion.img key={`${project.slug}:${main.src}`} className={styles.plate}
                src={main.src!} alt={main.alt} decoding="async"
                initial={reduced ? false : { opacity: 0, scale: 1.035 }}
                animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 1.1, ease }}
              />
            ) : <span className={styles.placeholder}>{project.title}</span>}
          </AnimatePresence>
        </Link>
        {images.length > 0 && (
          <div className={styles.contactSheet}>
            <div className={styles.sheetHeading}>
              <span className={styles.sheetTitle}>{project.title}<span className={styles.sheetLabel}>Photographs</span></span>
              <span className={styles.photoCount} aria-label={`Photograph ${selected + 1} of ${images.length}`}>
                {String(selected + 1).padStart(2, '0')}<span aria-hidden="true"> / </span>{String(images.length).padStart(2, '0')}
              </span>
            </div>
            <motion.div ref={thumbnails} key={project.slug} className={styles.thumbnails}
              aria-label={`${project.title} photographs`}
              initial={reduced ? false : 'hidden'} animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : 0.055 } } }}>
              {images.map((image, i) => (
                <motion.button key={image.src} type="button"
                  className={[styles.thumbnail, i === selected ? styles.thumbnailActive : ''].join(' ')}
                  aria-label={`Show photograph ${i + 1}: ${image.alt}`} aria-pressed={i === selected}
                  onPointerEnter={(event) => { if (event.pointerType === 'mouse') onPhotoChange(i) }}
                  onClick={() => onPhotoChange(i)}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: reduced ? 0 : 0.65, ease }}>
                  <span className={styles.thumbnailPicture}>
                    <img src={image.src!} alt="" loading="lazy" decoding="async" />
                    {i === selected && (
                      <motion.span className={styles.activeMarker} layoutId={reduced ? undefined : markerId}
                        transition={{ duration: reduced ? 0 : 0.55, ease }} aria-hidden="true" />
                    )}
                  </span>
                  <span className={styles.thumbnailNumber} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                    <span className={styles.selectedDot} />
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        )}
      </div>
      <div className={styles.caption}>
        <Link to={`/work/${project.slug}`} className={styles.projectLink}>
          View {project.title}<span aria-hidden="true"> &#8599;</span>
        </Link>
      </div>
    </>
  )
}

export function ProjectIndex({ projects, start = 1, footer }: Props) {
  const [active, setActive] = useState(0)
  const [photoIndex, setPhotoIndex] = useState(0)
  const register = useRef<HTMLDivElement>(null)
  const inView = useInView(register, { amount: 0.1 })

  // Warm the five opening images as the register enters the viewport.
  useEffect(() => {
    if (!inView) return
    projects.forEach((item) => {
      if (item.hero.src) {
        const image = new Image()
        image.src = item.hero.src
      }
    })
  }, [inView, projects])

  function selectProject(index: number) {
    if (index === active) return
    setActive(index)
    setPhotoIndex(0)
  }
  const galleryId = useId()
  const project = projects[active] ?? projects[0]
  if (!project) return null

  return (
    <div ref={register} className={styles.wrap}>
      <div className={styles.directory}>
        <ol className={styles.list} aria-label="Select a project">
          {projects.map((item, i) => (
            <li key={item.slug} className={styles.item}>
              <button type="button"
                className={[styles.row, item === project ? styles.rowActive : ''].join(' ')}
                aria-pressed={item === project} aria-controls={galleryId}
                onPointerEnter={(event) => { if (event.pointerType === 'mouse') selectProject(i) }}
                onFocus={() => selectProject(i)} onClick={() => selectProject(i)}>
                <span className={styles.number}>{String(start + i).padStart(2, '0')}</span>
                <span className={styles.title}>{item.title}</span>
                <span className={styles.arrow} aria-hidden="true">&#8599;</span>
                <span className={styles.detail}>{item.kind}</span>
              </button>
            </li>
          ))}
        </ol>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
      <div id={galleryId} className={styles.stage} role="region" aria-label={`${project.title} gallery`}>
        <ProjectGallery project={project} photoIndex={photoIndex} onPhotoChange={setPhotoIndex} />
      </div>
    </div>
  )
}
