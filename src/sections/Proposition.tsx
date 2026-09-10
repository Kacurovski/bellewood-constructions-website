import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { ImageSlot } from '../components/ImageSlot'
import { Credentials } from '../components/Credentials'
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
 *
 * This band used to carry three paragraphs. Two of the three said things the
 * page already says elsewhere — the four-projects-a-year line appears in the
 * hero and again on About, and "the person who quotes your job is the person on
 * site" is the whole of the About page in miniature. Saying them here as well
 * did not make them more true, it made the section longer, and length is what
 * was stopping any one thing on this page being the thing on the screen.
 */
export function Proposition() {
  return (
    <section className={['section', styles.section].join(' ')} aria-labelledby="proposition-heading">
      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.head}>
          <SheetRef number="A-02" name="What we build" rule={false} />
          <h2 id="proposition-heading" className={styles.heading}>
            Older houses, taken seriously.
          </h2>
        </Reveal>

        {/* A figure, at a figure's size, with a figure's caption.

            It was a half-width plate, which put a large photograph here and
            another large photograph in the register directly below — two bands
            running the same move back to back, and the second one lost because
            of it. Small and captioned it belongs to the paragraph beside it
            instead of competing with the section under it. */}
        <Reveal delay={0.06} className={styles.figure}>
          <ImageSlot slot={stills.detail} ratio="4 / 5" tone="sage" className={styles.detail} />
          <p className={styles.caption}>
            <span className={styles.captionNumber}>Fig. 1</span>
            Wall frame lifted into place. Set out from the drawings, built in the
            same order every time.
          </p>
        </Reveal>

        <Reveal delay={0.12} className={styles.bodyWrap}>
          <div className={[styles.body, 'stack'].join(' ')}>
            <p>
              A worker's cottage, a Queenslander, a post-war home worth keeping.
              The work is predominantly in timber, because that is what these
              houses are made of.
            </p>
            <p className={styles.aside}>
              Also apartment refurbishments, in Brisbane and on the coast, to the
              same standard.
            </p>
          </div>
        </Reveal>

        {/* The credentials row, at the foot of this section rather than as a
            band of its own. This section is a heading, a figure and forty
            words, so it had height going spare; the row was a fifth band of the
            same weight on a page that already had too many. */}
        <Reveal delay={0.16} className={styles.creds}>
          <Credentials inline />
        </Reveal>
      </div>
    </section>
  )
}
