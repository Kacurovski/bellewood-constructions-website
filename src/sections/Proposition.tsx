import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { ImageSlot } from '../components/ImageSlot'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import type { MaterialKey } from '../three/materials'
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

/* The scope, as a schedule.

   Every line is work the site already says Bellewood does — the first two come
   straight out of the hero, the third is the sentence that used to sit here on
   its own. What the schedule adds is that two of the three are IN the drawing
   beside it: a renovation is the cottage that was kept, an extension is the new
   wing, and each is the only thing on the building in its material. Point at a
   line and Fig. 1 is gone over in a heavier pen exactly where that work is.

   The third has nothing to point at, which is the honest thing for it to say —
   apartment refurbishments are the work this sheet does not show — so pointing
   at it steps both plates back instead. */
const SCOPE: { n: string; name: string; key: MaterialKey | null; note?: string }[] = [
  { n: '01', name: 'Renovations', key: 'clad' },
  { n: '02', name: 'Extensions', key: 'charred' },
  {
    n: '03',
    name: 'Apartment refurbishments',
    key: null,
    note: 'In Brisbane and on the coast, to the same standard.',
  },
]

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

  /* Which line of the schedule is under the pointer. Null is nothing; a row
     with no material of its own sets 'off', which is not a key but the absence
     of one — both plates step back and nothing is drawn harder. */
  const [reading, setReading] = useState<number | null>(null)
  const row = reading == null ? null : SCOPE[reading]
  const lit = row?.key ?? null
  const off = row != null && row.key == null

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
      <div className={['shell', styles.inner, off ? styles.away : ''].join(' ').trim()}>
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
                <HeritageStudyStill className={styles.line} variant="line" highlight={lit} />
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

        {/* The schedule.

            This column held one sentence of fine print and three hundred pixels
            of nothing. It holds the scope now: three lines of work, numbered
            the way a schedule on a drawing is, and two of the three are in the
            plate beside them. See the note above SCOPE for why these three and
            what each one points at. */}
        <Reveal delay={0.12} className={styles.bodyWrap}>
          <div className={styles.scope}>
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

            <span className={['eyebrow', styles.scopeLabel].join(' ')}>Scope</span>

            <ul className={styles.scopeList}>
              {SCOPE.map((item, i) => (
                <li key={item.n} className={styles.scopeItem}>
                  {/* A button because it does something — it draws part of the
                      plate harder — and because a button is reachable from the
                      keyboard, which a hovered list item is not. The hero's
                      callouts key the same model the same way. */}
                  <button
                    type="button"
                    className={[styles.scopeRow, reading === i ? styles.scopeOn : ''].join(' ').trim()}
                    onPointerEnter={() => setReading(i)}
                    onPointerLeave={() => setReading(null)}
                    onFocus={() => setReading(i)}
                    onBlur={() => setReading(null)}
                  >
                    <span className={styles.scopeNum} aria-hidden="true">
                      {item.n}
                    </span>
                    <span className={styles.scopeName}>{item.name}</span>
                    <span className={styles.scopeRule} aria-hidden="true" />
                  </button>
                  {item.note && <p className={styles.scopeNote}>{item.note}</p>}
                </li>
              ))}
            </ul>
          </div>
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
