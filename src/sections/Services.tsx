import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { DrawnRule, Sketch } from '../components/Drawn'
import { services } from '../data/services'
import { pictograms } from './servicePictograms'
import styles from './Services.module.css'

/**
 * What we take on.
 *
 * Six kinds of work, each with a line drawing, a headline and a short
 * paragraph, so a person can find their own job in the list. Copy is in
 * `src/data/services.ts`; the drawings are in `servicePictograms.ts`.
 *
 * Each item is a detail on the sheet: the pictogram draws its outline as it
 * comes into view, then the rule beneath it draws from the left. The same
 * "line-work first" idea the house on the home page is built on, at the scale
 * of a list. Under a pointer the number fills and the title lifts a touch —
 * enough to say the row is a thing, not enough to say it is a button.
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
            <Reveal key={item.title} as="li" className={styles.item} delay={Math.min(i * 0.05, 0.25)}>
              <div className={styles.top}>
                <Sketch paths={pictograms[item.title] ?? []} className={styles.sketch} delay={Math.min(i * 0.05, 0.25)} />
                <span className={styles.num} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.lead}>{item.lead}</p>
              <p className={['small', styles.body].join(' ')}>{item.body}</p>
              <DrawnRule className={styles.rule} delay={0.15 + Math.min(i * 0.05, 0.25)} />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
