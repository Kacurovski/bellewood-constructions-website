import { motion } from 'framer-motion'
import { credentials } from '../config/site'
import { Reveal } from './Reveal'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './Credentials.module.css'

/** The practical assurances beneath the name change, kept as plain readable facts. */
export function Credentials({ inline = false }: { inline?: boolean } = {}) {
  const Wrap = inline ? 'div' : 'section'
  const reduced = useReducedMotion()
  const [licence, insurance, location, capacity] = credentials

  return (
    <Wrap className={[styles.section, inline ? styles.inline : 'section--tight'].join(' ')} aria-label="About the builder">
      <div className={inline ? undefined : 'shell'}>
        <div className={styles.continuityRule}>
          <span>What stays the same</span>
          <motion.span className={styles.line} aria-hidden="true"
            initial={reduced ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }}
            viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
        </div>
        <dl className={styles.facts}>
          <Reveal className={styles.attention} y={10}>
            <dt>Personal attention</dt>
            <dd><span className={styles.promise}>{capacity.value}.</span><span className={styles.note}>Angus, still on site.</span></dd>
          </Reveal>
          <Reveal className={styles.assurance} y={10} delay={0.08}>
            <dt>Licensed &amp; insured</dt>
            <dd><span className={styles.licence}>{licence.value}</span><span className={styles.note}>{insurance.value}</span></dd>
          </Reveal>
          <Reveal className={styles.location} y={10} delay={0.16}>
            <dt>{location.label}</dt>
            <dd><span className={styles.region}>{location.value}</span></dd>
          </Reveal>
        </dl>
      </div>
    </Wrap>
  )
}
