import { Link, useParams } from 'react-router-dom'
import { ImageSlot } from '../components/ImageSlot'
import { SlicedImage } from '../components/SlicedImage'
import { BeforeAfter } from '../components/BeforeAfter'
import { Reveal } from '../components/Reveal'
import { PageHead } from '../components/PageHead'
import { getProject, hasBeforeAfter, projects } from '../data/projects'
import { usePageTitle } from '../hooks/usePageTitle'
import NotFound from './NotFound'
import styles from './ProjectDetail.module.css'

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = slug ? getProject(slug) : undefined
  usePageTitle(project?.title ?? 'Project')

  if (!project) return <NotFound />

  const index = projects.findIndex((p) => p.slug === project.slug)
  const next = projects[(index + 1) % projects.length]

  return (
    <article>
      <PageHead
        number={`B-${String(index + 2).padStart(2, '0')}`}
        eyebrow={
          <Link to="/work" className={['link-underline', styles.back].join(' ')}>
            All projects
          </Link>
        }
        title={project.title}
        meta={[
          { label: 'Location', value: project.suburb },
          { label: 'Work', value: project.kind },
          /* Year is only shown when it is known. An unconfirmed date is worse
             than no date on a builder's project page. */
          ...(project.year ? [{ label: 'Completed', value: project.year }] : []),
        ]}
      />

      {/* Set in panels, the way the home page opens. It gives every project a
          moment of arrival rather than a photograph that is simply there. */}
      <div className={styles.hero}>
        {project.hero.src ? (
          <SlicedImage slot={project.hero} />
        ) : (
          <ImageSlot
            slot={project.hero}
            ratio="16 / 9"
            label={project.title}
            sublabel={project.suburb}
            loading="eager"
          />
        )}
      </div>

      <div className={['shell', styles.body].join(' ')}>
        <Reveal className={styles.story}>
          <div className="stack-lg">
            {project.story.map((paragraph, i) => (
              <p key={i} className={i === 0 ? 'lead' : undefined}>
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.08} className={styles.summaryCol}>
          <p className={['pull-quote', styles.summary].join(' ')}>{project.summary}</p>
        </Reveal>
      </div>

      {/* Half a comparison is worse than none, so this only appears when both
          the before and the after actually exist. */}
      {/* On its own ground.

          Everything under the hero used to sit on the same pale wash — the
          story, the comparison, the gallery and the way out — which is four
          bands of one colour and reads as a long white page with good work
          stranded on it. The comparison is the moment the page is actually
          about, so it gets a ground of its own to sit in. */}
      {hasBeforeAfter(project) && (
        <div className={['on-sage', styles.band].join(' ')}>
          <section className={['shell', styles.compare].join(' ')} aria-label="Before and after">
            <Reveal>
              <h2 className={['section-heading', styles.compareHeading].join(' ')}>
                Before and after
              </h2>
              <BeforeAfter before={project.before} after={project.after} label={project.title} />
            </Reveal>
          </section>
        </div>
      )}

      {project.gallery.length > 0 && (
        <section className={['shell', styles.gallery].join(' ')} aria-label="Gallery">
          {project.gallery.map((slot, i) => (
            <Reveal key={i} delay={(i % 2) * 0.06}>
              <ImageSlot slot={slot} ratio="4 / 3" tone={i % 2 === 0 ? 'sage' : 'green'} />
            </Reveal>
          ))}
        </section>
      )}

      {/* The page closes on the dark ground the site's other endings use, and
          the next project is a destination rather than a footnote — it is the
          only thing on the page still asking to be clicked once the reader has
          got to the bottom. */}
      <div className={['on-green', styles.closer].join(' ')}>
        <nav className={['shell', styles.next].join(' ')} aria-label="Next project">
          <Link to={`/work/${next.slug}`} className={styles.nextLink}>
            <span className={styles.nextLabel}>Next project</span>
            <span className={styles.nextRow}>
              <span className={['section-heading', styles.nextTitle].join(' ')}>{next.title}</span>
              <span className={styles.nextArrow} aria-hidden="true">
                <svg viewBox="0 0 34 10" fill="none">
                  <path d="M0 5h32M27.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </span>
            </span>
            <span className={styles.nextMeta}>
              {next.kind}
              <span className={styles.dot} aria-hidden="true" />
              {next.suburb}
            </span>
          </Link>
        </nav>
      </div>
    </article>
  )
}
