import { EnquiryForm } from '../components/EnquiryForm'
import { Reveal } from '../components/Reveal'
import { PageHead } from '../components/PageHead'
import { usePageTitle } from '../hooks/usePageTitle'
import { contact, social } from '../config/site'
import styles from './Contact.module.css'

export default function Contact() {
  usePageTitle('Contact')

  return (
    <>
      <PageHead
        eyebrow="Contact"
        title="Tell us about the house."
        lede="The quickest way to reach Angus is the phone. If he is on site and cannot pick up you will get a text back, so a missed call is never a lost one."
        meta={[
          { label: 'Phone', value: <a href={contact.phoneHref}>{contact.phone}</a> },
          { label: 'Email', value: <a href={contact.emailHref}>{contact.email}</a> },
          { label: 'Where we work', value: contact.serviceArea },
          {
            label: 'Follow',
            value: social.map((item, i) => (
              <span key={item.label}>
                {i > 0 && (
                  <span className={styles.sep} aria-hidden="true">
                    {' / '}
                  </span>
                )}
                <a href={item.href} target="_blank" rel="noreferrer noopener">
                  {item.label}
                </a>
              </span>
            )),
          },
        ]}
      />

      <section className={['shell', styles.wrap].join(' ')} aria-labelledby="enquiry-heading">
        <div className={styles.inner}>
          <Reveal className={styles.aside}>
            <p className="eyebrow">Send it through</p>
            <h2 id="enquiry-heading" className={['section-heading', styles.asideTitle].join(' ')}>
              Or write it down.
            </h2>
            <p className={[styles.asideNote, 'measure-tight'].join(' ')}>
              A suburb and a sentence about what you are thinking of is enough to
              start. Angus reads every one of these himself.
            </p>
          </Reveal>

          <Reveal delay={0.08} className={styles.right}>
            <EnquiryForm />
          </Reveal>
        </div>
      </section>
    </>
  )
}
