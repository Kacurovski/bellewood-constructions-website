import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { PageHead } from '../components/PageHead'
import { ScrollWords } from '../components/ScrollWords'
import { ComplianceLine } from '../components/ComplianceLine'
import { BuilderFolioTest } from '../components/BuilderFolioTest'
import { NameStudy } from '../components/NameStudy'
import { AboutClosing } from '../sections/AboutClosing'
import { usePageTitle } from '../hooks/usePageTitle'
import { contact } from '../config/site'
import { companyPhoto } from '../data/company'
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
      <PageHead
        variant="about"
        number="C-01"
        eyebrow="About"
        title={<>Good homes begin with <em>good relationships.</em></>}
        media={
          <figure className={styles.introPhoto}>
            <div className={styles.introPhotoWindow}>
              <img
                src={companyPhoto.src}
                alt={companyPhoto.alt}
                width={1080}
                height={1080}
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </figure>
        }
        meta={[
          { label: 'Who we work with', value: 'Homeowners, architects & designers.' },
          { label: 'The builder', value: <Link to={{ pathname: '/about', hash: '#about-builder' }}>Get to know Angus</Link> },
          { label: 'The name', value: <Link to={{ pathname: '/about', hash: '#about-name' }}>Why Bellewood</Link> },
        ]}
      />

      <div id="about-builder" tabIndex={-1} className={['shell', styles.body].join(' ')}>
        <Reveal className={styles.copy}>
          <div className="stack-lg">
            {/* The page's argument, read in a word at a time — the same
                treatment A-02 gets on the home page, and for the same reason:
                it is the one sentence on this page that has to land. The accent
                falls on the part that is the actual difference. */}
            <ScrollWords
              className={styles.opening}
              text={`Bellewood Constructions is run by ${contact.principal}. He has worked on heritage and older homes in inner Brisbane for more than two decades. He is *on site on his own jobs*.`}
            />
            <p>
              We take on around four projects a year, mostly renovations,
              extensions and restorations built in timber. We also refurbish
              apartments in Brisbane and on the Sunshine Coast.
            </p>
            <p>
              Our company QBCC licence is 1014350. The change to Bellewood
              keeps the same licensed company behind the work.
            </p>
            <p>
              Most of our work comes through architects, designers and
              recommendations from previous clients.
            </p>
            <p>
              Angus visits the house, prepares the quote and runs the build.
              You deal with him throughout the job.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08} className={styles.portrait}>
          <BuilderFolioTest />
        </Reveal>
      </div>

      <section id="about-name" tabIndex={-1} className={['on-green', styles.name].join(' ')} aria-labelledby="name-story">
        <div className={['shell', styles.nameInner].join(' ')}>
          <Reveal className={styles.nameAside}>
            <h2 id="name-story" className={['section-heading', styles.nameHeading].join(' ')}>
              About the name
            </h2>
            {/* The name, taken apart: Belle and wood, each pinned to what it
                means. It fills the ground between the heading and the licensed
                entity that the column used to leave empty, and it says in one
                look what the first paragraph takes a sentence to say. */}
            <NameStudy />
            {/* The licensed entity sits at the foot of this column rather than
                under the paragraphs. It is the thing the story is about — same
                company, same licence — and it stops the column being a heading
                above three quarters of empty ground. */}
            <div className={styles.nameFine}>
              <hr className={['hairline', styles.rule].join(' ')} />
              <ComplianceLine />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className={['stack-lg', styles.nameBody].join(' ')}>
              <p>
                Angus Cowan Constructions is becoming Bellewood Constructions. Belle
                for beautiful, wood for the material we build with.
              </p>
              <p>
                The company, ABN and QBCC licence stay the same, and Angus
                continues running the work. Existing projects carry on as agreed.
                During the change, you may see both names on our website and site signs.
              </p>
              <p>
                If you know us as Angus Cowan Constructions, you can still
                contact Angus in the usual way.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <AboutClosing />
    </>
  )
}
