import { Reveal } from '../components/Reveal'
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
          <p className="eyebrow">For architects and designers</p>
          <h2 id="architects-heading" className={['section-heading', styles.heading].join(' ')}>
            We build to the drawings.
          </h2>
        </Reveal>

        <Reveal delay={0.08} className={styles.right}>
          <div className={['stack', styles.body].join(' ')}>
            <p>
              We are used to documented work and to being one part of a team that
              already has a design. Questions come early, in writing, before they
              become variations. Site is kept in a state you can bring a client to.
            </p>
            <p>
              If you have a project coming up in inner Brisbane and want to talk it
              through before it goes to tender, call Angus directly on{' '}
              <a href={contact.phoneHref} className={styles.link}>
                {contact.phone}
              </a>
              .
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
