import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { journey } from '../data/journey'
import styles from './Journey.module.css'

/**
 * From the first call to handover.
 *
 * The build animation above this shows the house going up. This is the job
 * around it: seven stages, from a phone call to a walk through the finished
 * house. Copy lives in `src/data/journey.ts`.
 *
 * Set as a numbered ledger: the stage number and title in the left column, the
 * account in the right, a rule between each. The same setting as the questions
 * below it, so the two read as one document.
 */
export function Journey({ number = 'E-04' }: { number?: string }) {
  return (
    <section className={['section', styles.section].join(' ')} aria-labelledby="journey-heading">
      <div className="shell">
        <Reveal className={styles.head}>
          <SheetRef
            number={number}
            name={
              <h2 id="journey-heading" className={styles.heading}>
                From the first call to handover
              </h2>
            }
            note="How a job runs"
            rule={false}
          />
        </Reveal>

        <ol className={styles.list}>
          {journey.map((stage, i) => (
            <Reveal key={stage.title} as="li" className={styles.item} delay={Math.min(i * 0.03, 0.18)}>
              <span className={styles.num} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.title}>{stage.title}</h3>
              <div>
                {stage.body.map((para) => (
                  <p key={para} className={['small', styles.body].join(' ')}>
                    {para}
                  </p>
                ))}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
