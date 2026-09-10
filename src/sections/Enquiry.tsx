import { EnquiryForm } from '../components/EnquiryForm'
import { Reveal } from '../components/Reveal'
import { RegistrationMarks, SheetRef } from '../components/Sheet'
import { contact, nextSteps } from '../config/site'
import styles from './Enquiry.module.css'

/**
 * The enquiry. Calm and unhurried, because the decision it belongs to is.
 *
 * The phone number appears here as well as in the header. Missed-call text-back
 * runs off Angus's mobile, so a call that he cannot take on site still becomes
 * a conversation — which makes the number worth as much as the form.
 */
export function Enquiry() {
  return (
    /* Reversed. This is the page's most important moment and it was its
       plainest — the same pale ground as everything above it, with the form
       reading as an afterthought. Dark, it closes the page the way the hero
       opens it, and the form stops feeling like paperwork. */
    <section
      id="enquiry"
      className={['section', 'on-green', styles.section].join(' ')}
      aria-labelledby="enquiry-heading"
    >
      <RegistrationMarks />

      {/* What happens after the form is sent. Someone weighing up a major
          renovation will not fill in a form that goes into the dark. */}
      <div className={['shell', styles.steps].join(' ')}>
        <Reveal className={styles.stepsHead}>
          <SheetRef number="A-07" name="What happens next" rule={false} />
        </Reveal>
        <ol className={styles.stepsList}>
          {nextSteps.map((step, i) => (
            <Reveal as="li" key={step.label} delay={i * 0.06} className={styles.step}>
              <span className={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={styles.stepLabel}>{step.label}</h3>
              <p className={['small', styles.stepNote].join(' ')}>{step.note}</p>
            </Reveal>
          ))}
        </ol>
      </div>

      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.left}>
          <p className="eyebrow">Enquire</p>
          <h2 id="enquiry-heading" className={['section-heading', styles.heading].join(' ')}>
            Start a conversation.
          </h2>
          <p className={[styles.note, 'measure-tight'].join(' ')}>
            Tell us roughly what you are thinking about and where. If it is a good
            fit we will come and look at the house. If it is not, we will say so and
            point you somewhere better.
          </p>

          <dl className={styles.details}>
            <div className={styles.detail}>
              <dt className={styles.dt}>Phone</dt>
              <dd className={styles.dd}>
                <a href={contact.phoneHref}>{contact.phone}</a>
              </dd>
            </div>
            <div className={styles.detail}>
              <dt className={styles.dt}>Email</dt>
              <dd className={styles.dd}>
                <a href={contact.emailHref}>{contact.email}</a>
              </dd>
            </div>
            <div className={styles.detail}>
              <dt className={styles.dt}>Where we work</dt>
              <dd className={styles.dd}>{contact.serviceArea}</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={0.08} className={styles.right}>
          <EnquiryForm />
        </Reveal>
      </div>
    </section>
  )
}
