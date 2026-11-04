import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ActionGlyph } from '../components/ActionGlyph'
import { stills } from '../data/projects'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './ApproachPhotoTest.module.css'

/** Additive concept preview. Existing Approach closing content stays above it. */
export function ApproachPhotoTest() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const drift = useTransform(scrollYProgress, [0, 1], [-12, 12])

  return (
    <section ref={ref} id="approach-photo-test" className={styles.section} aria-labelledby="approach-photo-test-heading">
      <motion.div className={styles.background}
        initial={reduced ? false : { opacity: 0.65, clipPath: 'inset(3% 0% 3% 0%)' }}
        whileInView={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }} viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: reduced ? 0 : 1.7, ease: [0.22, 1, 0.36, 1] }}>
        <motion.img src={stills.approachClosing.src!} alt={stills.approachClosing.alt}
          width={2000} height={1333} loading="lazy" decoding="async" style={{ y: reduced ? 0 : drift }} />
      </motion.div>
      <div className={styles.scrim} aria-hidden="true" />
      <div className={['shell', styles.content].join(' ')}>
        <div className={styles.testLabel}><span>Concept preview</span><span>Additional section / Test</span></div>
        <motion.div className={styles.copy} initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : 0.2 }}>
          <h2 id="approach-photo-test-heading" className={styles.heading}>
            Care in the making.<em>Pleasure in the living.</em>
          </h2>
          <Link to="/contact" className={styles.conversation}>
            <span>Start a conversation</span>
            <span className={styles.conversationMark}><ActionGlyph name="conversation" /></span>
          </Link>
        </motion.div>
        <div className={styles.creditRow}>
          <span className={styles.note}>Timber, light and a little room to breathe.</span>
          <Link to="/work/bardon" className={styles.credit}><strong>Bardon</strong><span>View project</span></Link>
        </div>
      </div>
    </section>
  )
}
