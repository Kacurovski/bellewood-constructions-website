import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { faq } from '../data/faq'
import styles from './Questions.module.css'

/**
 * Questions.
 *
 * Angus asked for the site to be loaded up so he can read it and change the
 * wording. This is the section written for that: the questions people ask him
 * on a first site visit, answered plainly, in the voice the rest of the site
 * uses. The copy lives in `src/data/faq.ts` — one file, no markup — so he or
 * anyone else can rewrite an answer without touching a component.
 *
 * It is set as a plain ruled list rather than an accordion. Everything here is
 * meant to be read, and a closed accordion hides exactly the material that
 * makes the section worth having.
 */
export function Questions({ number = 'E-04' }: { number?: string }) {
  return (
    <section className={['section', styles.section].join(' ')} aria-labelledby="questions-heading">
      <div className="shell">
        <Reveal className={styles.head}>
          <SheetRef
            number={number}
            name={
              <h2 id="questions-heading" className={styles.heading}>
                Questions we get asked
              </h2>
            }
            note="Before you ring a builder"
            rule={false}
          />
        </Reveal>

        <ol className={styles.list}>
          {faq.map((item, i) => (
            <Reveal key={item.q} as="li" className={styles.item} delay={Math.min(i * 0.03, 0.18)}>
              <span className={styles.num} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.q}>{item.q}</h3>
              <div className={styles.answer}>
                {item.a.map((para) => (
                  <p key={para} className={['small', styles.a].join(' ')}>
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
