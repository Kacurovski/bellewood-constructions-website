import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { EnquiryForm } from '../components/EnquiryForm'
import { Reveal } from '../components/Reveal'
import { PageHead } from '../components/PageHead'
import { usePageTitle } from '../hooks/usePageTitle'
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
      >
        <Link to={{ pathname: '/contact', hash: '#contact-enquiry' }} className={styles.introLink}>
          Send an enquiry
          <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
            <path d="M16 5v22m-8-8 8 8 8-8" />
          </svg>
        </Link>
      </PageHead>

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
