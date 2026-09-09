import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { ImageSlot } from '../components/ImageSlot'
import { stills } from '../data/projects'
import styles from './Proposition.module.css'

/**
 * The proposition. Type-led, no imagery — which is honest, because there is no
 * imagery yet, and right for the brand either way: the book asks for generous
 * space and photography doing the work, and where there is no photography the
 * space has to do it alone.
 *
 * Written for two readers at once. A homeowner reads the first paragraph; an
 * architect reads the second and recognises themselves in it.
 */
export function Proposition() {
  return (
    <section className={['section', styles.section].join(' ')} aria-labelledby="proposition-heading">
      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.left}>
          <SheetRef number="A-02" name="What we build" rule={false} />
        </Reveal>

        <div className={styles.right}>
          <Reveal className={styles.headWrap}>
            <h2 id="proposition-heading" className={['section-heading', styles.heading].join(' ')}>
              Older houses, taken seriously.
            </h2>
          </Reveal>

          <Reveal delay={0.08} className={styles.bodyWrap}>
            <div className={[styles.body, 'measure', 'stack'].join(' ')}>
              <p>
                Most of what we build is a renovation, an extension or a restoration
                to a house that was here long before we were — a worker's cottage, a
                Queenslander, a post-war home worth keeping. The work is
                predominantly in timber, because that is what these houses are made
                of and matching them properly matters more than it looks like it
                should.
              </p>
              <p>
                We take on around four projects a year. That is a deliberate number.
                It means the person who quotes your job is the person on site, and it
                means the detail at the end gets the same attention as the frame at
                the start.
              </p>
              <p>
                We also do apartment refurbishments, in Brisbane and on the coast, to
                the same standard.
              </p>
            </div>
          </Reveal>
        </div>

        {/* A detail rather than another elevation: the showcase below is full of
            whole houses, and this section is about how they are put together.

            Its own grid item rather than a child of the label, because on a
            phone it has to move to the end of the section. Sitting between the
            label and the heading it read as an interruption, which is why it
            used to be hidden below 860px instead. */}
        <Reveal className={styles.figure}>
          <ImageSlot
            slot={stills.detail}
            ratio="4 / 5"
            tone="sage"
            className={styles.detail}
          />
        </Reveal>
      </div>
    </section>
  )
}
