import { lazy, useRef } from 'react'
import { SceneFrame } from '../three/SceneFrame'
import { SiteMeshStill } from '../three/SiteMeshStill'
import { ComplianceLine } from '../components/ComplianceLine'
import { Reveal } from '../components/Reveal'
import { useSectionProgress } from '../hooks/useSectionProgress'
import { compliance } from '../config/site'
import styles from './GreenSection.module.css'

const SiteMesh = lazy(() => import('../three/SiteMesh'))

/**
 * The green section — job-site mesh, and the name.
 *
 * This is the signature moment of the site and it came from Angus directly. He
 * wants the reverse lockup on a green field because of how mesh reads from the
 * street: a whole lot of green with the white logos, and you know whose job it
 * is before you have read a word.
 *
 * The mesh runs the full height of the section and the copy sits on it, over
 * the part of the sheet that falls away into its own shadow. The mesh itself
 * still carries nothing but the mark, which is what the brand book specifies
 * for the real thing.
 *
 * The copy is the one place the rebrand is explained. It is told as continuity,
 * never as a new company — same builder, same licence, same family, new name.
 */
export function GreenSection() {
  const ref = useRef<HTMLElement>(null)
  const progress = useSectionProgress(ref)

  return (
    <section ref={ref} className={['on-green', styles.section].join(' ')} aria-labelledby="name-heading">
      {/* The mesh is the whole surface, not a band across the top of one. You
          should feel like you are standing in front of a hoarding rather than
          looking at a banner with a caption under it. */}
      <div className={styles.band}>
        <SceneFrame
          className={styles.scene}
          label="Bellewood job-site mesh: the mark in white, repeating across a green field."
          still={<SiteMeshStill />}
        >
          <SiteMesh progress={progress} />
        </SceneFrame>
      </div>

      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.left}>
          <h2 id="name-heading" className={['headline', styles.heading].join(' ')}>
            Same builder. Same licence. New name.
          </h2>
        </Reveal>

        <Reveal delay={0.08} className={styles.right}>
          <div className={['stack', styles.body].join(' ')}>
            <p>
              Angus Cowan Constructions is becoming Bellewood Constructions. It is
              the same company, the same licence, the same family and the same
              person on site — an ASIC name change, and nothing else.
            </p>
            <p>
              Belle for beautiful, wood for what we build with. The name changes
              formally on {compliance.nameChangeDate}. Until then you will see both,
              which is exactly as it should be.
            </p>
          </div>

          <hr className={['hairline', styles.rule].join(' ')} />
          <ComplianceLine className={styles.fine} />
        </Reveal>
      </div>
    </section>
  )
}
