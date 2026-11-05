import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ActionGlyph } from '../components/ActionGlyph'
import { stills } from '../data/projects'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { getLenis } from '../hooks/useLenis'
import windsorOriginal from '../assets/projects/windsor-pause.jpg'
import styles from './PhotoPauseTest.module.css'

const soften = (value: number) => value * value * (3 - 2 * value)

/** The closing scene: the finished home leads directly into the next enquiry. */
export function PhotoPauseTest() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // One continuous opening and closing gesture. The full-width middle lasts
  // long enough to enjoy the room; the exit begins while the scene is visible.
  const scale = useTransform(scrollYProgress, [0, 0.38, 0.62, 1], [1.035, 1.008, 1.008, 1.025])
  const y = useTransform(scrollYProgress, [0, 1], ['-0.8%', '0.8%'])
  const aperture = useTransform(scrollYProgress, [0, 0.34, 0.58, 0.94], [
    'inset(0% 3.5% 0% 3.5%)',
    'inset(0% 0% 0% 0%)',
    'inset(0% 0% 0% 0%)',
    'inset(0% 3.5% 0% 3.5%)',
  ], { ease: soften })
  return (
    <section ref={ref} id="photo-pause-test" data-sheet-rail="quiet" className={styles.section} aria-labelledby="windsor-story-heading">
      <figure className={styles.figure}>
        {/* Keep the original JPEG's detail. Mask the photograph, leaving the
            caption, links and their keyboard focus outlines outside the crop. */}
        <motion.div className={styles.media} style={{ clipPath: reduced ? 'inset(0%)' : aperture }}>
          <motion.img src={windsorOriginal} alt={stills.preEnquiry.alt}
            width={1600} height={1129} loading="lazy" decoding="async"
            style={{ scale: reduced ? 1 : scale, y: reduced ? 0 : y }} />
        </motion.div>
        <Link to="/work/windsor" className={styles.credit} aria-label="View the Windsor project">
          View Windsor
        </Link>
        <figcaption className={styles.caption}>
          <motion.h2 id="windsor-story-heading" className={styles.heading}
            initial={reduced ? false : 'rest'} whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}>
            <span className={styles.wordMask}><motion.span
              variants={{ rest: { y: '105%', opacity: 0 }, visible: { y: '0%', opacity: 1 } }}
              transition={{ duration: reduced ? 0 : 1.05, ease: [0.22, 1, 0.36, 1] }}
            >Life,</motion.span></span>{' '}
            <span className={styles.wordMask}><motion.em
              variants={{ rest: { y: '105%', opacity: 0 }, visible: { y: '0%', opacity: 1 } }}
              transition={{ duration: reduced ? 0 : 1.2, delay: reduced ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
            >opened up.</motion.em></span>
          </motion.h2>
          <div className={styles.invitation}>
            <p className={styles.nextLabel}>Your home, <em>next.</em></p>
            <a href="#enquiry" className={styles.next} onClick={(event) => {
              const destination = document.getElementById('enquiry')
              if (!destination) return
              event.preventDefault()
              destination.focus({ preventScroll: true })
              // Lenis and native scrolling both honour the target's scroll margin.
              const lenis = getLenis()
              if (lenis) lenis.scrollTo(destination, { duration: 1.15, immediate: reduced })
              else destination.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })
            }}>
              <span>Explore your options</span>
              <span className={styles.conversationMark}><ActionGlyph name="conversation" /></span>
            </a>
          </div>
        </figcaption>
      </figure>
    </section>
  )
}
