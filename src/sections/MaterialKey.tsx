import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import { TONE } from '../three/materials'
import type { MaterialKey as Key } from '../three/materials'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './MaterialKey.module.css'

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
  const reduced = useReducedMotion()

  /* `asked` is what the reader has chosen; `shown` is what the drawing is
     currently keyed to. They are two states because the change between them is
     a transition with a middle — the drawing wipes out, the key swaps at the
     point where nothing is visible, and it wipes back in. One value could not
     hold both ends of that. */
  const [asked, setAsked] = useState<Key | null>(null)
  const [shown, setShown] = useState<Key | null>(null)
  const wipe = useAnimationControls()

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
    setAsked(next)
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

  // --- The redraw, where there is ------------------------------------------
  useEffect(() => {
    if (!pointer || asked === shown) return

    if (reduced) {
      setShown(asked)
      return
    }

    let cancelled = false
    void (async () => {
      // Out to the right quickly, on a curve that accelerates away.
      await wipe.start({
        clipPath: 'inset(0% 0% 0% 100%)',
        transition: { duration: 0.24, ease: [0.7, 0, 0.84, 0] },
      })
      if (cancelled) return
      setShown(asked)
      // Back in from the left, slower, on the site's settling curve — so it
      // reads as the drawing being drawn again rather than as a flicker.
      await wipe.start({
        clipPath: 'inset(0% 0% 0% 0%)',
        transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] },
      })
    })()

    return () => {
      cancelled = true
    }
  }, [pointer, asked, shown, reduced, wipe])

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
          {/* The wipe is on this one element. Transitioning the drawing's own
              nineteen hundred faces is what made the first version clunky —
              every node in it composited on every frame. Here one wrapper's
              clip animates and the faces underneath simply are what they are. */}
          <motion.div className={styles.wipe} animate={wipe}>
            <HeritageStudyStill className={styles.drawing} highlight={shown} />
          </motion.div>
        </div>

        <Reveal delay={0.1} className={styles.listWrap}>
          <dl
            className={styles.list}
            onPointerLeave={pointer ? () => setAsked(null) : undefined}
          >
            {KEY.map((item, i) => (
              <div
                key={item.mat}
                ref={(el) => {
                  rows.current[i] = el
                }}
                className={[styles.row, shown === item.mat ? styles.rowOn : ''].join(' ')}
                onPointerEnter={pointer ? () => setAsked(item.mat) : undefined}
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
                    onFocus={() => setAsked(item.mat)}
                    onBlur={() => setAsked(null)}
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
