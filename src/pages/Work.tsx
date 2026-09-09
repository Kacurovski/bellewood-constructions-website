import { Reveal } from '../components/Reveal'
import { PageHead } from '../components/PageHead'
import { ProjectCard } from '../components/ProjectCard'
import { SwipeRow } from '../components/SwipeRow'
import { LeadMagnet } from '../components/LeadMagnet'
import { projects } from '../data/projects'
import { contact } from '../config/site'
import { usePageTitle } from '../hooks/usePageTitle'
import styles from './Work.module.css'

const COUNT_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']

export default function Work() {
  usePageTitle('Work')

  const shown =
    projects.length < COUNT_WORDS.length ? COUNT_WORDS[projects.length] : String(projects.length)

  return (
    <>
      <PageHead
        eyebrow="Work"
        title="Renovations, extensions and restorations."
        lede="A small number of projects, each one taken from the drawings through to the last piece of trim. Most are heritage or older homes in inner Brisbane."
        meta={[
          { label: 'Projects', value: <span className={styles.count}>{shown} shown</span> },
          { label: 'Where', value: contact.serviceArea },
          {
            label: 'Enquiries',
            value: <a href={contact.phoneHref}>{contact.phone}</a>,
          },
        ]}
      />

      <div className={['shell', styles.grid].join(' ')}>
        <SwipeRow label="All projects" columns={2} variant="index">
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={(i % 2) * 0.06}>
              <ProjectCard project={project} index={i} ratio="3 / 2" />
            </Reveal>
          ))}
        </SwipeRow>
      </div>

      <div className={['shell', styles.magnet].join(' ')}>
        <LeadMagnet tone="green" />
      </div>
    </>
  )
}
