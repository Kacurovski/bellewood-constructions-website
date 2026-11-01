import { Link } from 'react-router-dom'
import { Reveal } from './Reveal'
import styles from './RenovationChecklist.module.css'

function PageMark() {
  return <svg viewBox="0 0 24 28" fill="none" aria-hidden="true">
    <path d="M4 2h12l5 5v18H4V2Z M16 2v6h5 M8 12h9 M8 16h9 M8 20h5" stroke="currentColor" strokeWidth="1.1" />
  </svg>
}

function Arrow() {
  return <svg viewBox="0 0 50 20" fill="none" aria-hidden="true">
    <path d="M1 10h46m-9-8 9 8-9 8" stroke="currentColor" strokeWidth="1.25" />
  </svg>
}

export function RenovationChecklist() {
  return (
    <section id="renovation-checklist" className={styles.feature} tabIndex={-1}
      aria-labelledby="renovation-checklist-heading" data-checklist-resource>
      <Reveal className={['shell', styles.inner].join(' ')} y={10}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}><PageMark /> Before you start</p>
          <h2 id="renovation-checklist-heading" className={styles.title}>
            The major renovation <span>checklist.</span>
          </h2>
        </div>
        <div className={styles.support}>
          <p className={styles.description}>A useful starting point before you commit to renovating an older home.</p>
          {/* This is a layout preview until Angus's guide and delivery are ready. */}
          <p className={styles.availability}>In preparation</p>
        </div>
      </Reveal>
    </section>
  )
}

/** A small invitation on Work leads to the guide feature on Home. */
export function ChecklistInvitation() {
  return (
    <aside className={['shell', styles.invitation].join(' ')} aria-labelledby="checklist-invitation-heading">
      <div className={styles.invitationInner}>
        <div>
          <p className={styles.eyebrow}>Planning ahead</p>
          <h2 id="checklist-invitation-heading" className={styles.invitationTitle}>Still imagining your own renovation?</h2>
          <p className={styles.invitationCopy}>Our renovation guide is in preparation.</p>
        </div>
        <Link to="/#renovation-checklist" className={styles.resourceLink}>
          <span>About the checklist</span><Arrow />
        </Link>
      </div>
    </aside>
  )
}
