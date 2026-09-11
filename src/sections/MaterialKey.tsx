import { lazy, useCallback, useEffect, useRef, useState } from 'react'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { SceneFrame } from '../three/SceneFrame'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import { TONE } from '../three/materials'
import type { MaterialKey as Key } from '../three/materials'
import { useMediaQuery } from '../hooks/useMediaQuery'
import styles from './MaterialKey.module.css'

const HeritageStudy = lazy(() => import('../three/HeritageStudy'))

/**
 * The key to the drawing.
 *
 * A set of drawings carries a legend: what each hatch and each tone on the
 * sheet stands for. This is that, and it is the one thing on the site where the
 * drawing answers back — key a material and everything on the building except
 * that one steps back, so the reader sees exactly what the word means on the
 * thing itself.
 *
 * It invents nothing. Every line describes a decision already recorded in
 * `three/materials.ts`: Silky Oak carries the structure, cladding and deck sit
 * either side of it, the new wing is dark so old reads apart from new, roofs are
 * Deep Pine, and the glazing is the only light in the scene.
 *
 * The plate is the hero's own scene, not a drawing of it. It was the flat still
 * for a long time and the still cannot be made correct: it is a painter's
 * algorithm over about a thousand boxes with no depth buffer, so a gable and
 * the roof sheet that oversails it are ordered on depths a few centimetres
 * apart and the join between them comes down to rounding. Several rounds of
 * fixes each closed one artefact and opened another. The scene has a real depth
 * buffer and was right the whole time.
 *
 * The still is still underneath, and still keyed, so a visitor on reduced
 * motion or without WebGL loses the polish and none of the behaviour.
 *
 * **It is keyed two different ways, because the two devices are two different
 * things.** With a pointer you choose: hovering a line keys it. Without one you
 * do not choose, and asking somebody to tap six times to read a legend is worse
 * than not offering it — so on a phone the drawing sticks under the header and
 * keys itself to whichever line has scrolled up under it. Reading the list IS
 * the interaction.
 *
 * Under no pointer and no scroll it reads as a plain legend, which is the state
 * it has to work in first — nothing here is hidden behind an interaction.
 */

const KEY: { mat: Key; name: string; note: string }[] = [
  {
    mat: 'frame',
    name: 'Structure',
    note: 'Bearers, stumps, studs, plates and rafters. Silky Oak, the brand accent, because the frame is the part of a house nobody sees and every part of it depends on.',
  },
  {
    mat: 'clad',
    name: 'Cladding',
    note: 'Weatherboards, gapped so they read as boards rather than as a wall. What the original cottage is skinned in.',
  },
  {
    mat: 'charred',
    name: 'New work',
    note: 'The wing off the back, in dark charred timber. It is the contrast that tells old from new at a glance, and it is the whole job in one join.',
  },
  {
    mat: 'roof',
    name: 'Roof',
    note: 'Sheet steel, run over the cottage, the verandah and the new wing. Deep Pine, the darkest value the brand holds.',
  },
  {
    mat: 'deck',
    name: 'Deck',
    note: 'The verandah floor, its balustrade and the flight of steps down to the ground.',
  },
  {
    mat: 'glass',
    name: 'Glazing',
    note: 'The only light in the drawing. A house with the lights on is a house being lived in, which is the point of all of it.',
  },
]

export function MaterialKey() {
  const pointer = useMediaQuery('(min-width: 901px) and (pointer: fine)')

  /* One state, and the change is immediate.
     It had a wipe: out to the right, swap, back in from the left. It was
     smooth and it was wrong — three quarters of a second in which the building
     leaves the screen and returns, which reads as the drawing RELOADING every
     time the pointer crosses a line, and which lags every move by the length of
     it. A key has to answer at the speed you point. */
  const [shown, setShown] = useState<Key | null>(null)

  const plate = useRef<HTMLDivElement>(null)
  const rows = useRef<(HTMLDivElement | null)[]>([])

  // --- Scrolling keys it, where there is no pointer -------------------------
  const readScroll = useCallback(() => {
    const box = plate.current?.getBoundingClientRect()
    if (!box) return
    // The line just under the pinned drawing. Whichever row has reached it is
    // the one being read, so it is the one the drawing answers with.
    const line = box.bottom + 72
    let next: Key | null = null
    rows.current.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top <= line) next = KEY[i].mat
    })
    setShown(next)
  }, [])

  useEffect(() => {
    if (pointer) return
    readScroll()
    window.addEventListener('scroll', readScroll, { passive: true })
    window.addEventListener('resize', readScroll)
    return () => {
      window.removeEventListener('scroll', readScroll)
      window.removeEventListener('resize', readScroll)
    }
  }, [pointer, readScroll])

  return (
    <section className={['section', styles.section].join(' ')} aria-labelledby="materials-heading">
      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.head}>
          <SheetRef
            number="E-03"
            name={
              <h2 id="materials-heading" className={styles.heading}>
                What it is made of
              </h2>
            }
            note={pointer ? 'Point at a material' : 'Scroll the list'}
          />
        </Reveal>

        <div ref={plate} className={styles.plate}>
          {/* The building itself, not a drawing of it.

              This plate used to be the flat still alone, and the still is a
              painter's algorithm over a thousand boxes: it has no depth buffer,
              so a gable and the roof sheet that oversails it are ordered on
              depths a few centimetres apart and the join between them is
              decided by rounding. Chasing that produced a run of fixes and a
              new artefact after each one. The scene next door has a real depth
              buffer and has been correct all along, which is the comparison
              that settled it.

              So this is the same object the hero carries, keyed the same way
              the list beside it always keyed the drawing. The still is still
              here underneath — SceneFrame shows it under reduced motion, while
              the chunk loads, and where there is no WebGL — and it is keyed
              too, so nothing about the section's behaviour depends on which
              one a visitor gets. */}
          <SceneFrame
            className={styles.stage}
            label="A Queenslander cottage: the original house in weatherboard on timber stumps, with a new wing behind it in dark charred timber."
            rootMargin="300px 0px"
            still={<HeritageStudyStill className={styles.drawing} highlight={shown} />}
          >
            <HeritageStudy shadows={false} highlight={shown} />
          </SceneFrame>
        </div>

        <Reveal delay={0.1} className={styles.listWrap}>
          <dl
            className={styles.list}
            onPointerLeave={pointer ? () => setShown(null) : undefined}
          >
            {KEY.map((item, i) => (
              <div
                key={item.mat}
                ref={(el) => {
                  rows.current[i] = el
                }}
                className={[styles.row, shown === item.mat ? styles.rowOn : ''].join(' ')}
                onPointerEnter={pointer ? () => setShown(item.mat) : undefined}
              >
                <dt className={styles.term}>
                  {/* The swatch is the drawing's own tone for that material, read
                      straight from the palette both scenes share — so the key can
                      never drift out of step with the thing it is keying. */}
                  <span
                    className={styles.swatch}
                    style={{ background: TONE[item.mat].base }}
                    aria-hidden="true"
                  />
                  <span
                    className={styles.name}
                    tabIndex={0}
                    onFocus={() => setShown(item.mat)}
                    onBlur={() => setShown(null)}
                  >
                    {item.name}
                  </span>
                </dt>
                <dd className={styles.note}>{item.note}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
