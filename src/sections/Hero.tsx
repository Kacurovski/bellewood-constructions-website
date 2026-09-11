import { lazy, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { SceneFrame } from '../three/SceneFrame'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import { SheetRef } from '../components/Sheet'
import { RiseIn } from '../components/RiseIn'
import { CycleWord } from '../components/CycleWord'
import { useReducedMotion } from '../hooks/useReducedMotion'
import type { MaterialKey } from '../three/materials'
import { contact, site } from '../config/site'
import styles from './Hero.module.css'

const HeritageStudy = lazy(() => import('../three/HeritageStudy'))

/**
 * The kinds of house that cycle in the headline.
 *
 * Every one of these is a house this business works on and every one already
 * appears in the copy further down the page. Do not add a kind here that the
 * site cannot back up elsewhere — the headline is the one line nobody scrolls
 * past, and it is the worst place on the site to widen a claim.
 *
 * They also have to SET. Each one is a single line inside the headline column,
 * and the column is narrowest, relative to the type, between about 900 and
 * 1280px. "Workers' cottages" — the site's own phrase — measured 414px against
 * a 414px column at 900: touching, which is one font fallback away from a
 * clipped word. "Timber cottages" says the same thing about the same houses and
 * clears it. Run `harness/cycle.mjs` after changing this list.
 */
const HOUSE_KINDS = ['Heritage homes', 'Queenslanders', 'Timber cottages', 'Post-war homes'] as const

/**
 * The hero, set as a drawing sheet.
 *
 * A Queenslander where the old house is built and the new wing is still a
 * drawing. It is the proposition of the business as a single object — heritage
 * homes, rebuilt — and it sets up the section further down the page, which takes
 * the same idea and runs it through time.
 *
 * The sheet reference runs across the top of the band, then the words hold the
 * left column and the drawing holds the right, running off the screen edge.
 *
 * It was briefly a single stacked column — reference, headline, then the object
 * at the full width of the page. That gave the house the most room it has ever
 * had, and it pushed the supporting line and the call so far down the sheet
 * that the top of the page was a headline and an empty field. Beside each other
 * the words and the object both have somewhere to be, and the call is where
 * somebody deciding whether to ring can see it.
 *
 * It had five different kinds of technical mark on it at once — a reference
 * strip with three fields, four registration crosses, a height dimension, a
 * depth dimension and two annotation callouts — which is a drawing sheet's
 * whole vocabulary spoken at the same time, and it read as clutter rather than
 * as precision. The marks and both dimensions have gone.
 *
 * The last of them to go was the depth: a real figure, read off the model, and
 * it still said nothing. "10 000" is millimetres to a builder and noise to the
 * homeowner this page is written for, which is the test it failed — a mark
 * that proves the drawing is measured, to a reader who was never in doubt.
 *
 * What is left is the reference and the two callouts, which are the only marks
 * that carry an argument: the cottage kept, the wing added. Those are no longer
 * furniture laid over the picture. They are drawn on after the house finishes
 * building, and they drift with the pointer alongside the model, so the label
 * and the thing it names move together as one object rather than as a caption
 * stuck to the glass in front of it.
 *
 * The heading deliberately avoids a years-trading number. The records on file
 * disagree, and it is not going on the page until Angus settles it.
 */
export function Hero() {
  const band = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  /* Which material the annotation under the pointer is naming.

     The two callouts used to be labels and nothing else, and they were the
     first thing anybody marked on this screen twice over. They say the whole
     proposition — the cottage kept, the wing added — so instead of removing
     them they now prove it: point at one and the building shows you which part
     of itself it means.

     Both map onto a single material, which is what makes this exact rather
     than approximate. The original cottage is the only thing on the building
     skinned in weatherboard, and the new wing is the only thing in charred
     timber. Nothing else has to be reasoned about. */
  const [keyed, setKeyed] = useState<MaterialKey | null>(null)

  /* The pointer, normalised to -1..1 across the window — the same figure the
     scene leans on, so the annotations and the model read the same input and
     stay in step. Written straight to two custom properties: a pointermove
     that re-renders the hero is a pointermove that re-renders the canvas. */
  function onMove(event: ReactPointerEvent<HTMLElement>) {
    const el = band.current
    if (!el) return
    el.style.setProperty('--px', `${(event.clientX / window.innerWidth) * 2 - 1}`)
    el.style.setProperty('--py', `${(event.clientY / window.innerHeight) * 2 - 1}`)
  }

  return (
    <section
      ref={band}
      className={['on-green', styles.hero].join(' ')}
      aria-labelledby="hero-heading"
      onPointerMove={reduced ? undefined : onMove}
    >
      <div className={['shell', styles.inner].join(' ')}>
        <SheetRef number="A-01" name="Heritage study" className={styles.ref} />

        {/* Words left, drawing right. The sheet reference still runs across
            the top of both, so the band reads as one sheet rather than as two
            columns that happen to share a background. */}
        <div className={styles.body}>
          <div className={styles.copy}>
            {/* The kind of house changes; the rest of the sentence does not.

                The list is not decoration — "a worker's cottage, a Queenslander,
                a post-war home" is already the sentence in A-02. Cycling them up
                here is the same claim made as range: a visitor sees their own
                house named inside eight seconds.

                The heading carries a plain, complete, unchanging sentence for
                assistive technology and for search; the animated version is
                hidden from both. Nothing reading this page without eyes gets a
                headline that mutates under it. */}
            <h1 id="hero-heading" className={styles.heading}>
              <span className="visually-hidden">
                Heritage homes in inner Brisbane, rebuilt in timber.
              </span>

              <span aria-hidden="true">
                <CycleWord words={HOUSE_KINDS} className={styles.cycle} />
                <RiseIn text="in inner Brisbane, rebuilt in timber." delay={0.15} />
              </span>
            </h1>

            <p className={[styles.lede, 'lead'].join(' ')}>
              {site.description} Around four projects a year, taken one at a time.
            </p>

            <div className={styles.actions}>
              <Link to="/work" className="btn">
                See the work
              </Link>
              <a href={contact.phoneHref} className={['link-underline', styles.call].join(' ')}>
                {contact.phone}
              </a>
            </div>
          </div>

          <div className={styles.figure}>
            <div className={styles.plate}>
              <SceneFrame
                className={styles.scene}
                label="A Queenslander cottage: the original house built, and a new wing behind it still drawn as a frame."
                rootMargin="0px"
                still={<HeritageStudyStill className={styles.still} highlight={keyed} />}
              >
                <HeritageStudy highlight={keyed} />
              </SceneFrame>

              {/* Annotation, the way a drawing is annotated: a label, a leader
                  line, and a dot on the thing it names.

                  This is what turns the object from a render into an argument.
                  The headline says heritage homes rebuilt in timber; the two
                  labels are that sentence pointed at the building, so the shape
                  on the screen means something before a word of it is read.

                  They used to sit there from the first frame and never move,
                  which is what made them read as furniture: the house leant
                  towards the pointer and its own labels stayed nailed to the
                  screen. Now the dot lands, the leader rules itself out and the
                  words arrive after the house has finished building, and all of
                  it drifts with the model. See the stylesheet.

                  Decorative — the scene already carries the whole description in
                  its own accessible label, and repeating half of it here would
                  read it out twice. */}
              <button
                type="button"
                className={[styles.note, styles.noteOld, keyed === 'clad' ? styles.noteOn : ''].join(' ')}
                onPointerEnter={() => setKeyed('clad')}
                onPointerLeave={() => setKeyed(null)}
                onFocus={() => setKeyed('clad')}
                onBlur={() => setKeyed(null)}
              >
                <span className={styles.noteDot} aria-hidden="true" />
                <span className={styles.noteLine} aria-hidden="true" />
                <span className={styles.noteText}>Cottage, kept</span>
              </button>

              <button
                type="button"
                className={[styles.note, styles.noteNew, keyed === 'charred' ? styles.noteOn : ''].join(' ')}
                onPointerEnter={() => setKeyed('charred')}
                onPointerLeave={() => setKeyed(null)}
                onFocus={() => setKeyed('charred')}
                onBlur={() => setKeyed(null)}
              >
                <span className={styles.noteDot} aria-hidden="true" />
                <span className={styles.noteLine} aria-hidden="true" />
                <span className={styles.noteText}>New wing</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
