import { ActionGlyph } from '../components/ActionGlyph'
import { Link, useParams } from 'react-router-dom'
import { ImageSlot } from '../components/ImageSlot'
import { SlicedImage } from '../components/SlicedImage'
import { Reveal } from '../components/Reveal'
import { PageHead } from '../components/PageHead'
import { ProjectPhotoGallery } from '../components/ProjectPhotoGallery'
import { getProject, projects } from '../data/projects'
import { usePageTitle } from '../hooks/usePageTitle'
import { useRouteReturn } from '../hooks/useRouteReturn'
import NotFound from './NotFound'
import styles from './ProjectDetail.module.css'

function ProjectReturn({ light = false }: { light?: boolean }) {
  const destination = useRouteReturn()
  return (
    <Link to={destination.to} onClick={destination.onClick} className={[styles.back, light ? styles.backLight : ''].join(' ')}>
      <ActionGlyph className={styles.backDirection} name="previous" />
      <span className={styles.backLabel}>{destination.label}</span>
    </Link>
  )
}

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
        eyebrow={<ProjectReturn />}
        title={project.title}
        meta={[
          { label: 'Location', value: project.suburb },
          { label: 'Work', value: project.kind },
          { label: 'Photographs', value: String(project.gallery.length + 1) },
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

          {/* The facts of the job. Only what is known is shown: an empty scope
              list, an unnamed architect or an unconfirmed duration renders
              nothing rather than a placeholder. */}
          {(project.scope?.length || project.architect || project.duration) && (
            <dl className={styles.facts}>
              {project.scope?.length ? (
                <div className={styles.fact}>
                  <dt>Scope</dt>
                  <dd>
                    <ul className={styles.scope}>
                      {project.scope.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
              {project.architect ? (
                <div className={styles.fact}>
                  <dt>Architect</dt>
                  <dd>{project.architect}</dd>
                </div>
              ) : null}
              {project.duration ? (
                <div className={styles.fact}>
                  <dt>On site</dt>
                  <dd>{project.duration}</dd>
                </div>
              ) : null}
            </dl>
          )}
        </Reveal>
      </div>

      {project.gallery.length > 0 && (
        <div className={['shell', styles.gallery].join(' ')}>
          <ProjectPhotoGallery key={project.slug} project={project} />
        </div>
      )}

      <nav className={['shell', styles.next].join(' ')} aria-label="More projects">
        <ProjectReturn light />
        <Link to={`/work/${next.slug}`} className={styles.nextLink}>
          <span className="eyebrow">Next project</span>
          <span className={['section-heading', styles.nextTitle].join(' ')}>{next.title}</span>
        </Link>
      </nav>
    </article>
  )
}
