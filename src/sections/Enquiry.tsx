import { motion } from 'framer-motion'
import { EnquiryForm } from '../components/EnquiryForm'
import { Reveal } from '../components/Reveal'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useReducedMotion } from '../hooks/useReducedMotion'
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
/**
 * How far each sheet sits off square, in degrees.
 *
 * Written out rather than generated, because a fan wants to look dealt and not
 * calculated: the angles are uneven and they do not alternate cleanly. A loop
 * producing +2, -2, +2, -2 reads as a pattern, which is the one thing a pile of
 * paper never does.
 */
const TILT = [-2.1, 1.4, -1.1, 2.3]

export function Enquiry() {
  const reduced = useReducedMotion()
  /* One column below this, where four overlapping tilted sheets would be a
     stack you cannot read. The tilt is an inline transform from framer, so it
     has to be cancelled here — a stylesheet cannot reach it. */
  const narrow = useMediaQuery('(max-width: 560px)')

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
          <SheetRef number="A-09" name="What happens next" rule={false} />
        </Reveal>
        {/* Four sheets, dealt onto the table.

            This was four columns of reversed text on the dark band and it was
            the plainest thing on the page — which is a poor place for it, since
            it is the part that tells somebody what happens after they send a
            form they are nervous about sending.

            They are sheets rather than cards: pale paper on the dark ground,
            one line weight, square corners, the number where a sheet carries
            it. A card with a rounded corner and a soft drop shadow is the house
            style of a different kind of website, and this site is a drawing
            set — the same idea told in its own language is a set of drawings
            laid out on a table, slightly out of square, which is exactly how
            they end up.

            They deal in one after another as the band arrives, and the one
            under the pointer squares up and lifts to the top of the pile. */}
        <ol className={styles.stepsList}>
          {nextSteps.map((step, i) => (
            <motion.li
              key={step.label}
              className={styles.step}
              initial={reduced ? false : { opacity: 0, y: 26, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: narrow ? 0 : TILT[i] }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.72, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reduced ? undefined : { rotate: 0, y: -10, zIndex: 5 }}
            >
              <span className={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={styles.stepLabel}>{step.label}</h3>
              <p className={['small', styles.stepNote].join(' ')}>{step.note}</p>
            </motion.li>
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
