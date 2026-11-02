import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { Logo } from '../components/Logo'
import { Credentials } from '../components/Credentials'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './ContinuityIntroduction.module.css'

/** One identity carried forward: the established name, the new sign, the same builder. */
export function ContinuityIntroduction() {
  const reduced = useReducedMotion()
  return (
    <section className={styles.section} aria-labelledby="continuity-heading" data-builder-introduction>
      <div className="shell">
        <p className={styles.eyebrow}>Same builder. New name.</p>
        <motion.div className={styles.identity}
          initial={reduced ? false : 'rest'} whileInView="arrive"
          viewport={{ once: true, amount: .35 }}>
          <motion.h2 id="continuity-heading" className={styles.heading}
            variants={{ rest: { opacity: 0, y: 12 }, arrive: { opacity: 1, y: 0 } }}
            transition={{ duration: reduced ? 0 : .8, ease: [.16, 1, .3, 1] }}>
            Angus Cowan <span>Constructions</span>
            <span className="visually-hidden"> is becoming Bellewood Constructions.</span>
          </motion.h2>
          <div className={styles.connector} aria-hidden="true">
            <span>is becoming</span>
            <svg viewBox="0 0 120 16" fill="none">
              <motion.path d="M1 8H118M111 1l7 7-7 7"
                variants={{ rest: { pathLength: 0, opacity: 0 }, arrive: { pathLength: 1, opacity: 1 } }}
                transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : .15, ease: [.16, 1, .3, 1] }} />
            </svg>
          </div>
          <motion.div className={styles.newIdentity}
            variants={{ rest: { clipPath: 'inset(0 100% 0 0)' }, arrive: { clipPath: 'inset(0 0% 0 0)' } }}
            transition={{ duration: reduced ? 0 : 1.1, delay: reduced ? 0 : .25, ease: [.16, 1, .3, 1] }}>
            <Logo tone="reverse" width={340} decorative className={styles.lockup} />
          </motion.div>
        </motion.div>
        <Reveal className={styles.reassurance} y={8}>
          <p>Same company. Same licence. <em>Angus, still on site.</em></p>
          <Link to="/about" className={styles.link}>
            <span>Meet Angus</span>
            <svg viewBox="0 0 32 24" fill="none" aria-hidden="true"><path d="M1 12h28m-8-8 8 8-8 8" /></svg>
          </Link>
        </Reveal>
        <Credentials inline />
      </div>
    </section>
  )
}
