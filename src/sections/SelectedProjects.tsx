import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { ProjectIndex } from '../components/ProjectIndex'
import { featuredProjects } from '../data/projects'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './SelectedProjects.module.css'

export function SelectedProjects({ sheetNumber = "A-05", compactIntro = false }: { sheetNumber?: string; compactIntro?: boolean } = {}) {
  const reduced = useReducedMotion()
  const band = useRef<HTMLElement>(null)

  function onMove(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse') return
    const box = band.current?.getBoundingClientRect()
    if (!box) return
    band.current?.style.setProperty('--mx', `${event.clientX - box.left}px`)
    band.current?.style.setProperty('--my', `${event.clientY - box.top}px`)
  }

  return (
    <section ref={band} className={['section', styles.section, compactIntro ? styles.compactIntro : ''].join(' ')}
      aria-labelledby="work-heading" onPointerMove={reduced ? undefined : onMove}>
      <span className={styles.grid} aria-hidden="true" />
      <div className="shell">
        <Reveal className={styles.head}>
          <SheetRef number={sheetNumber} name={<h2 id="work-heading" className={styles.heading}>Selected work</h2>}
            note="A selection" rule={false} />
        </Reveal>
        <Reveal className={styles.list}>
          <ProjectIndex projects={featuredProjects} footer={
            <Link to="/work" className={styles.more}>
              <span className={styles.moreLabel}>See all work</span>
              <span className={styles.moreArrow} aria-hidden="true">
                <svg viewBox="0 0 34 10" fill="none">
                  <path d="M0 5h32M27.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </span>
            </Link>
          } />
        </Reveal>
      </div>
    </section>
  )
}
