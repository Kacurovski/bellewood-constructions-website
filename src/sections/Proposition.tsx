import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { ImageSlot } from '../components/ImageSlot'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import { ScrollWords } from '../components/ScrollWords'
import { Credentials } from '../components/Credentials'
import { stills } from '../data/projects'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './Proposition.module.css'

/**
 * A plotter pass.
 *
 * The caption under Fig. 1 says the cottage is "set out", so the drawing sets
 * itself out: a pen edge crosses the plate once and the line work is there
 * behind it. It is a clip rather than a stroke animation because the drawing
 * does its hidden-line removal by painting each face with the page's own ground
 * — stroke the edges on alone and every hidden edge behind them shows through.
 * A clip reveals fill and stroke together, so what arrives is the drawing and
 * not a wireframe of it.
 *
 * Once, on entry, and never again. Under reduced motion the plate is simply
 * there.
 */
function Plotted({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref, { once: true, margin: '-12% 0px -10% 0px' })

  /* One value, read two ways. The clip and the pen have to be the same edge,
     and two animations of the same length started by two observers are not the
     same edge — they drifted far enough apart that the pen was still at the
     left margin with the drawing most of the way in. */
  const drawn = useMotionValue(reduced ? 1 : 0)
  const clipPath = useTransform(drawn, (v) => `inset(0 ${(1 - v) * 100}% 0 0)`)
  const left = useTransform(drawn, (v) => `${v * 100}%`)
  const opacity = useTransform(drawn, [0, 0.05, 0.8, 1], [0, 1, 1, 0])

  useEffect(() => {
    if (reduced) {
      drawn.set(1)
      return
    }
    if (!seen) return
    const run = animate(drawn, 1, { duration: 1.6, ease: [0.16, 1, 0.3, 1] })
    return () => run.stop()
  }, [seen, reduced, drawn])

  return (
    <div className={styles.plot} ref={ref}>
      <motion.div className={styles.plotClip} style={{ clipPath }}>
        {children}
      </motion.div>
      {/* The pen. A green hairline riding the edge of the clip, lifted off the
          page by the time it reaches the right-hand side. */}
      <motion.span aria-hidden="true" className={styles.pen} style={{ left, opacity }} />
    </div>
  )
}

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
  const reduced = useReducedMotion()

  /* The leader and its tick, drawn once as the note comes up. Under reduced
     motion they are simply there, like everything else on the page. */
  const draws = (
    delay: number,
    from: Record<string, number | string>,
    to: Record<string, number | string>,
    duration: number,
  ) =>
    reduced
      ? {}
      : {
          initial: from,
          whileInView: to,
          viewport: { once: true, margin: '-10% 0px -10% 0px' },
          transition: { duration, delay, ease: [0.16, 1, 0.3, 1] as const },
        }

  return (
    <section className={['section', styles.section].join(' ')} aria-labelledby="proposition-heading">
      <div className={['shell', styles.inner].join(' ')}>
        {/* The statement is the heading. "Older houses, taken seriously." used
            to sit above it, and the two said the same thing — one in four words
            and one in twenty-six. The sentence that actually names what the
            work is wins.

            It reads itself in as the section crosses the screen, a word at a
            time, so the one long piece of prose on this page arrives at the
            pace somebody reads it at rather than all at once. */}
        <Reveal className={styles.head}>
          <SheetRef number="A-02" name="What we build" rule={false} />
          <ScrollWords
            as="h2"
            id="proposition-heading"
            className={styles.statement}
            text="A worker's cottage, a Queenslander, a post-war home *worth keeping*. Built predominantly in *timber*, because that is what these houses are made of."
          />
        </Reveal>

        {/* Two figures, and they are the argument.

            The section's heading says older houses taken seriously; the pair
            under it says how. Fig. 1 is the same house the hero carries, drawn
            as line work — every face filled with the page's own ground so the
            hidden edges are removed and what is left is an elevation. Fig. 2 is
            a wall frame going up. Drawn, then built, side by side, which is the
            one claim this business makes that a photograph alone cannot.

            It is also the reason this band is not another slab of photography.
            One of the two plates is a drawing, and nobody else has it. */}
        {/* Point at one of the two and the other steps back, the same way the
            material legend on the approach page works. Hover only, and only
            where there is a real pointer: on a touch screen there is nothing to
            point with and both plates stay as they are. */}
        <Reveal delay={0.06} className={styles.figures}>
          <figure className={styles.figure}>
            <div className={styles.drawing}>
              <Plotted>
                <HeritageStudyStill className={styles.line} variant="line" />
              </Plotted>
            </div>
            <figcaption className={styles.caption}>
              <span className={styles.captionNumber}>Fig. 1</span>
              The cottage and its new wing, set out.
            </figcaption>
          </figure>

          <figure className={styles.figure}>
            <ImageSlot slot={stills.detail} ratio="3 / 2" tone="sage" className={styles.detail} />
            <figcaption className={styles.caption}>
              <span className={styles.captionNumber}>Fig. 2</span>
              The same order, on site. A wall frame going up.
            </figcaption>
          </figure>
        </Reveal>

        {/* The note.

            It was a sentence of fine print alone in a third of the page, which
            is what a leftover looks like. It is a general note on a drawing
            now: labelled, at reading size, with a leader pulled out of it
            towards the two plates it qualifies. Apartment refurbishments are
            the work this sheet does not show, so the note is the only place on
            the page that can say so. */}
        <Reveal delay={0.12} className={styles.bodyWrap}>
          <aside className={styles.note}>
            <motion.span
              aria-hidden="true"
              className={styles.leader}
              {...draws(0.15, { scaleX: 0 }, { scaleX: 1 }, 1.1)}
            />
            <motion.span
              aria-hidden="true"
              className={styles.leaderMark}
              {...draws(
                1.05,
                { opacity: 0, scale: 0.2, rotate: 45, x: '-50%', y: '-50%' },
                { opacity: 1, scale: 1, rotate: 45, x: '-50%', y: '-50%' },
                0.6,
              )}
            />
            <span className={['eyebrow', styles.noteLabel].join(' ')}>Note</span>
            <p className={styles.aside}>
              Also apartment refurbishments, in Brisbane and on the coast, to the
              same standard.
            </p>
          </aside>
        </Reveal>

        {/* The credentials row, at the foot of this section rather than as a
            band of its own. This section is a heading, a figure and forty
            words, so it had height going spare; the row was a fifth band of the
            same weight on a page that already had too many. */}
        <div className={styles.creds}>
          <Credentials inline />
        </div>
      </div>
    </section>
  )
}
