import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { contact } from '../config/site'
import styles from './Architects.module.css'

/**
 * For architects and designers.
 *
 * The referral engine, and the audience arriving from LinkedIn outreach. They
 * need one thing: evidence that this builder will not embarrass them in front
 * of their own client. So the section is short, plain and specific about how the
 * work runs — no sales language, nothing about partnership or synergy.
 */
export function Architects() {
  return (
    <section className={['section--tight', styles.section].join(' ')} aria-labelledby="architects-heading">
      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.left}>
          <SheetRef number="A-05" name="For architects and designers" rule={false} />
          <h2 id="architects-heading" className={['section-heading', styles.heading].join(' ')}>
            We build to the drawings.
          </h2>
        </Reveal>

        <Reveal delay={0.08} className={styles.right}>
          <div className={['stack', styles.body].join(' ')}>
            <p>
              Questions come early, in writing, before they become variations. Site
              is kept in a state you can bring a client to.
            </p>
            <p className={styles.call}>
              Talk it through before tender —{' '}
              <a href={contact.phoneHref} className={styles.link}>
                {contact.phone}
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
