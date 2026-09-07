import { Reveal } from '../components/Reveal'
import { ComplianceLine } from '../components/ComplianceLine'
import { ImageSlot } from '../components/ImageSlot'
import { usePageTitle } from '../hooks/usePageTitle'
import { compliance, contact } from '../config/site'
import { stills } from '../data/projects'
import styles from './About.module.css'

/**
 * About.
 *
 * The continuity story lives here in full. Two things it must never do: claim a
 * number of years trading (the records on file disagree, and it is not going on
 * the page until Angus settles it), and present the rebrand as a new company.
 * The line to hold is: same builder, same licence, same family, new name.
 */
export default function About() {
  usePageTitle('About')

  return (
    <>
      <header className={['shell', styles.head].join(' ')}>
        <Reveal>
          <p className="eyebrow">About</p>
          <h1 className={['headline', styles.title].join(' ')}>
            One builder, more than two decades of Brisbane houses.
          </h1>
        </Reveal>
      </header>

      <div className={['shell', styles.body].join(' ')}>
        <Reveal className={styles.copy}>
          <div className="stack-lg">
            <p className="lead">
              Bellewood Constructions is run by {contact.principal}. He has been
              building in inner Brisbane for more than two decades, almost all of it
              on heritage and older homes, and he is on site on his own jobs.
            </p>
            <p>
              The work is mostly renovations, extensions and restorations, built
              predominantly in timber. Around four projects a year, in the range
              where the detail matters and the drawings are worth following
              carefully. Alongside the housing there are apartment refurbishments,
              in Brisbane and on the coast.
            </p>
            <p>
              He is QBCC licensed, and has been for the whole of it. The licence
              number is at the bottom of every page on this site, and it is the
              same number it has always been.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08} className={styles.portrait}>
          {/* Deliberately a photograph of the work rather than a portrait. A
              stock photograph of a stranger captioned "Angus Cowan" would be a
              picture of someone who is not him. Swap for a real portrait of
              Angus when one exists. */}
          <ImageSlot slot={stills.onSite} ratio="4 / 5" tone="green" />
        </Reveal>
      </div>

      <section className={['on-green', styles.name].join(' ')} aria-labelledby="name-story">
        <div className={['shell', styles.nameInner].join(' ')}>
          <Reveal>
            <h2 id="name-story" className={['section-heading', styles.nameHeading].join(' ')}>
              About the name
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <div className={['stack-lg', styles.nameBody].join(' ')}>
              <p>
                Angus Cowan Constructions is becoming Bellewood Constructions. Belle
                for beautiful, wood for what we build with. There is no family
                connection in the name. It was chosen for how it sounds and for what
                it says about the material.
              </p>
              <p>
                It is a name change and nothing else. The same company, the same
                ABN, the same QBCC licence, the same person on site. Every project
                already in the diary continues exactly as it was. The change takes
                effect formally on {compliance.nameChangeDate}, and until then you
                will see both names together: on this site, on signage, and on the
                job boards out the front of our work.
              </p>
              <p>
                If you have worked with us before, nothing about that changes. If
                you are about to, it is worth knowing that the reputation you are
                hiring is longer than the name on the sign.
              </p>
            </div>

            <hr className={['hairline', styles.rule].join(' ')} />
            <ComplianceLine />
          </Reveal>
        </div>
      </section>
    </>
  )
}
