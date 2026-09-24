import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { services } from '../data/services'
import styles from './Services.module.css'

/**
 * What we take on.
 *
 * Six kinds of work, each with a line and a short paragraph, so a person can
 * find their own job in the list. The copy is in `src/data/services.ts`.
 *
 * It sits at the foot of the project index: the projects show the work, this
 * names it. Set as a ruled grid rather than cards — cards would make six
 * boxes, and this is one list.
 */
export function Services({ number = 'B-08' }: { number?: string }) {
  return (
    <section className={['section', styles.section].join(' ')} aria-labelledby="services-heading">
      <div className="shell">
        <Reveal className={styles.head}>
          <SheetRef
            number={number}
            name={
              <h2 id="services-heading" className={styles.heading}>
                What we take on
              </h2>
            }
            note="Six kinds of work"
            rule={false}
          />
        </Reveal>

        <ol className={styles.grid}>
          {services.map((item, i) => (
            <Reveal key={item.title} as="li" className={styles.item} delay={Math.min(i * 0.04, 0.2)}>
              <span className={styles.num} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.lead}>{item.lead}</p>
              <p className={['small', styles.body].join(' ')}>{item.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
