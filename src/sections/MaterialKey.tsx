import { useState } from 'react'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { HeritageStudyStill } from '../three/HeritageStudyStill'
import { TONE } from '../three/materials'
import type { MaterialKey as Key } from '../three/materials'
import styles from './MaterialKey.module.css'

/**
 * The key to the drawing.
 *
 * A set of drawings carries a legend: what each hatch and each tone on the
 * sheet stands for. This is that, and it is the one thing on the site where the
 * drawing answers back — point at a line in the key and everything on the
 * building except that material steps back, so the reader can see exactly what
 * the word means on the thing itself.
 *
 * It invents nothing. Every line describes a decision already recorded in
 * `three/materials.ts`: Silky Oak carries the structure, cladding and deck sit
 * either side of it, the new wing is dark so old reads apart from new, roofs are
 * Deep Pine, and the glazing is the only light in the scene.
 *
 * Under no pointer at all it simply reads as a key, which is the state it has to
 * work in first — nothing here is hidden behind an interaction.
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
  const [lit, setLit] = useState<Key | null>(null)

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
            note="Point at a material"
          />
        </Reveal>

        <Reveal delay={0.06} className={styles.plate}>
          <HeritageStudyStill className={styles.drawing} highlight={lit} />
        </Reveal>

        <Reveal delay={0.12} className={styles.listWrap}>
          <dl className={styles.list} onPointerLeave={() => setLit(null)}>
            {KEY.map((item) => (
              <div
                key={item.mat}
                className={[styles.row, lit === item.mat ? styles.rowOn : ''].join(' ')}
                onPointerEnter={() => setLit(item.mat)}
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
                    onFocus={() => setLit(item.mat)}
                    onBlur={() => setLit(null)}
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
