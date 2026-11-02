import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { EnquiryForm } from '../components/EnquiryForm'
import { Reveal } from '../components/Reveal'
import { PageHead } from '../components/PageHead'
import { usePageTitle } from '../hooks/usePageTitle'
import { contact } from '../config/site'
import styles from './Contact.module.css'

const ServiceMapTest = lazy(() => import('../sections/ServiceMapTest').then(module => ({ default: module.ServiceMapTest })))

export default function Contact() {
  usePageTitle('Contact')

  return (
    <>
      <PageHead
        variant="contact"
        number="D-01"
        eyebrow="Contact"
        title="Tell us about the house."
        lede="You don’t need every answer before you get in touch. Tell us what you have in mind, and we can take it from there."
        meta={[
          { label: 'A project in mind?', value: <Link to={{ pathname: '/contact', hash: '#contact-enquiry' }}>Share your plans</Link> },
          { label: 'Prefer to talk?', value: <a href={contact.phoneHref}>Call Angus</a> },
          { label: 'Homeowners', value: 'Ideas for your home.' },
          { label: 'Architects & designers', value: 'A brief to discuss.' },
        ]}
      />

      <div id="service-map-test" style={{ scrollMarginTop: 'var(--header-h)' }}>
        <Suspense fallback={<div className="shell" role="status" style={{ minHeight: '30rem', paddingBlock: '4rem' }}>Loading the regional guide&hellip;</div>}>
          <ServiceMapTest />
        </Suspense>
      </div>

      <section id="contact-enquiry" tabIndex={-1} className={['shell', styles.wrap].join(' ')} aria-labelledby="enquiry-heading">
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
