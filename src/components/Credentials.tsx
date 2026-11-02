import { credentials } from '../config/site'
import { Reveal } from './Reveal'
import styles from './Credentials.module.css'

/** The practical assurances beneath the name change, kept as plain readable facts. */
export function Credentials({ inline = false }: { inline?: boolean } = {}) {
  const Wrap = inline ? 'div' : 'section'
  const [licence, insurance, location, capacity] = credentials

  return (
    <Wrap className={[styles.section, inline ? styles.inline : 'section--tight'].join(' ')} aria-label="About the builder">
      <div className={inline ? undefined : 'shell'}>
        <dl className={styles.facts}>
          <Reveal y={10}>
            <dt>Personal attention</dt>
            <dd><span className={styles.value}>{capacity.value}</span></dd>
          </Reveal>
          <Reveal y={10} delay={0.08}>
            <dt>Licensed &amp; insured</dt>
            <dd><span className={styles.value}>{licence.value}</span><span className={styles.note}>{insurance.value}</span></dd>
          </Reveal>
          <Reveal y={10} delay={0.16}>
            <dt>{location.label}</dt>
            <dd><span className={styles.value}>{location.value}</span></dd>
          </Reveal>
        </dl>
      </div>
    </Wrap>
  )
}
