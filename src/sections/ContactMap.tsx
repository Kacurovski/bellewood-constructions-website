import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { contact, contactLocation } from '../config/site'
import styles from './ContactMap.module.css'

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>
}

/** Real street map and directions, separate from the region in which we build. */
export function ContactMap() {
  return (
    <section id="find-us" className={styles.section} aria-labelledby="contact-map-heading">
      <div className="shell">
        <Reveal className={styles.heading}>
          <p className="eyebrow">Location &amp; directions</p>
          <h2 id="contact-map-heading">Find us in Kenmore.</h2>
        </Reveal>

        <div className={styles.layout}>
          <div className={styles.mapPanel}>
            <div className={styles.map} data-lenis-prevent>
              <iframe
                title={`Google Maps: ${contactLocation.address}`}
                src={contactLocation.embedUrl}
                width="800"
                height="560"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <a className={styles.mapLink} href={contactLocation.mapsUrl} target="_blank" rel="noopener noreferrer">
              <span>Open in Google Maps<span className="visually-hidden"> (opens in a new tab)</span></span>
              <Arrow />
            </a>
          </div>

          <div className={styles.contactPanel}>
            <div>
              <p className={styles.eyebrow}>Our address</p>
              <address className={styles.address}>
                <span>{contactLocation.street}</span>
                <span>{contactLocation.locality}</span>
              </address>
              <p className={styles.visitNote}>Angus is often on site. Please call before visiting to arrange a time.</p>
              <a className={styles.directions} href={contactLocation.directionsUrl} target="_blank" rel="noopener noreferrer">
                <span>Get directions<span className="visually-hidden"> in Google Maps (opens in a new tab)</span></span>
                <Arrow />
              </a>
            </div>

            <div className={styles.contactDetails}>
              <a className={styles.contactLink} href={contact.phoneHref}>
                <span><small>Call Angus</small><strong>{contact.phone}</strong></span>
                <Arrow />
              </a>
              <a className={styles.contactLink} href={contact.emailHref}>
                <span><small>Email</small><strong>{contact.email}</strong></span>
                <Arrow />
              </a>
              <p className={styles.callNote}>If Angus cannot answer, you’ll get a text back.</p>
            </div>
          </div>
        </div>

        <div className={styles.serviceArea}>
          <p><span className={styles.eyebrow}>Where we build</span>{contact.serviceArea}</p>
          <Link to={{ pathname: '/contact', hash: '#contact-enquiry' }}>
            Tell us about your place <Arrow />
          </Link>
        </div>
      </div>
    </section>
  )
}
