import { EnquiryForm } from '../components/EnquiryForm'
import { Reveal } from '../components/Reveal'
import { usePageTitle } from '../hooks/usePageTitle'
import { contact, social } from '../config/site'
import styles from './Contact.module.css'

export default function Contact() {
  usePageTitle('Contact')

  return (
    <section className={['shell', styles.wrap].join(' ')}>
      <div className={styles.inner}>
        <Reveal className={styles.left}>
          <p className="eyebrow">Contact</p>
          <h1 className={['headline', styles.title].join(' ')}>
            Tell us about the house.
          </h1>
          <p className={[styles.note, 'measure-tight'].join(' ')}>
            The quickest way to reach Angus is the phone. If he is on site and
            cannot pick up you will get a text back, so a missed call is never a
            lost one.
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
            <div className={styles.detail}>
              <dt className={styles.dt}>Follow</dt>
              <dd className={styles.dd}>
                {social.map((item, i) => (
                  <span key={item.label}>
                    {i > 0 && <span className={styles.sep} aria-hidden="true"> / </span>}
                    <a href={item.href} target="_blank" rel="noreferrer noopener">
                      {item.label}
                    </a>
                  </span>
                ))}
              </dd>
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
