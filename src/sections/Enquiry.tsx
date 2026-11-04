import { useId, useState } from 'react'
import { EnquiryForm } from '../components/EnquiryForm'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { RegistrationMarks, SheetRef } from '../components/Sheet'
import { contact, nextSteps } from '../config/site'
import styles from './Enquiry.module.css'

export function Enquiry({ sheetNumber = 'A-08' }: { sheetNumber?: string } = {}) {
  const narrow = useMediaQuery('(max-width: 900px)')
  const [expanded, setExpanded] = useState<number | null>(null)
  const uid = useId()

  return (
    <section id="enquiry" className={['section', 'on-green', styles.section].join(' ')}
      aria-labelledby="enquiry-heading">
      <RegistrationMarks />

      {/* One landing point for both the explanation and the form. */}
      <div id="what-happens-next" tabIndex={-1} className={['shell', styles.inner].join(' ')}>
        <div className={styles.left}>
          <SheetRef number={sheetNumber} name="What happens next" rule={false} />
          <h2 id="enquiry-heading" className={styles.heading}>Start a conversation.</h2>
          <p className={styles.note}>Tell us roughly what you are thinking about and where.</p>

          <ol className={styles.stepsList} aria-label="What happens after your enquiry">
            {nextSteps.map((step, i) => {
              const open = !narrow || expanded === i
              const detailId = `${uid}-step-${i}`
              const label = <>
                <span className={styles.stepNumber} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span>{step.label}</span>
              </>
              return (
                <li key={step.label} className={styles.step}>
                  <h3 className={styles.stepLabel}>
                    {narrow ? (
                      <button type="button" className={styles.stepToggle}
                        aria-expanded={open} aria-controls={detailId}
                        onClick={() => setExpanded(open ? null : i)}>
                        {label}
                        <span className={styles.expandMark} aria-hidden="true" />
                      </button>
                    ) : <span className={styles.stepTitle}>{label}</span>}
                  </h3>
                  <p id={detailId} className={styles.stepNote} hidden={!open}>{step.note}</p>
                </li>
              )
            })}
          </ol>
          <p className={styles.reassurance}>
            If it is a good fit we will come and look at the house. If it is not,
            we will say so and point you somewhere better.
          </p>
        </div>

        <div className={styles.right}>
          <EnquiryForm compact />
        </div>
      </div>

      <dl className={['shell', styles.details].join(' ')}>
        <div className={styles.detail}>
          <dt>Phone</dt>
          <dd><a href={contact.phoneHref}>{contact.phone}</a></dd>
        </div>
        <div className={styles.detail}>
          <dt>Email</dt>
          <dd><a href={contact.emailHref}>{contact.email}</a></dd>
        </div>
        <div className={styles.detail}>
          <dt>Where we work</dt>
          <dd>{contact.serviceArea}</dd>
        </div>
      </dl>
    </section>
  )
}
