import { Reveal } from '../components/Reveal'
import { ProjectCard } from '../components/ProjectCard'
import { SwipeRow } from '../components/SwipeRow'
import { LeadMagnet } from '../components/LeadMagnet'
import { projects } from '../data/projects'
import { usePageTitle } from '../hooks/usePageTitle'
import styles from './Work.module.css'

export default function Work() {
  usePageTitle('Work')

  return (
    <>
      <header className={['shell', styles.head].join(' ')}>
        <Reveal>
          <p className="eyebrow">Work</p>
          <h1 className={['headline', styles.title].join(' ')}>
            Renovations, extensions and restorations.
          </h1>
          <p className={[styles.lede, 'lead', 'measure'].join(' ')}>
            A small number of projects, each one taken from the drawings through to
            the last piece of trim. Most are heritage or older homes in inner
            Brisbane.
          </p>
        </Reveal>
      </header>

      <div className={['shell', styles.grid].join(' ')}>
        <SwipeRow label="All projects" columns={2}>
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={(i % 2) * 0.06}>
              <ProjectCard project={project} index={i} ratio="3 / 2" />
            </Reveal>
          ))}
        </SwipeRow>
      </div>

      <div className={['shell', styles.magnet].join(' ')}>
        <LeadMagnet tone="sage" />
      </div>
    </>
  )
}
