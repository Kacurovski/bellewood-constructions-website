import { useState } from 'react'
import { motion } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { contact } from '../config/site'
import { getLenis } from '../hooks/useLenis'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './ServiceMapTest.module.css'

const regions = {
  brisbane: {
    name: 'Brisbane', label: 'Where we are based',
    heading: 'A home in Brisbane.',
    copy: 'Heritage homes, renovations and extensions. Tell us about the house, the suburb and what you would like to make possible.',
  },
  coast: {
    name: 'Sunshine Coast', label: 'Where we also work',
    heading: 'A place by the coast.',
    copy: 'We also take on apartment refurbishments on the Sunshine Coast. Tell us where your place is and what you are considering.',
  },
} as const

/** A regional contact guide, independent of the portfolio and client locations. */
export function ServiceMapTest() {
  const [region, setRegion] = useState<keyof typeof regions>('brisbane')
  const reduced = useReducedMotion()
  const current = regions[region]

  function enquire() {
    const section = document.getElementById('enquiry-heading')?.closest('section')
    if (!section) return
    const focus = () => section.querySelector<HTMLInputElement>('input[name="suburb"]')?.focus({ preventScroll: true })
    const header = document.querySelector('header')?.getBoundingClientRect().height ?? 80
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(section, { offset: -(header + 20), duration: 1.1, onComplete: focus })
    else { window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - header - 20, behavior: reduced ? 'instant' : 'smooth' }); focus() }
  }

  return <section id="service-map-content" className={styles.section} aria-labelledby="service-map-heading">
    <div className="shell">
      <div className={styles.testLabel}><span>Contact study / Test</span><span>Our place. Your plans.</span></div>
      <Reveal className={styles.headingRow}>
        <h2 id="service-map-heading">Brisbane roots.<br /><em>A personal connection.</em></h2>
        <p>Based in Brisbane. Working across the city and the Sunshine Coast. Wherever your plans begin, the conversation starts with Angus.</p>
      </Reveal>
      <div className={styles.layout}>
        <div className={styles.mapPanel}>
          <div className={styles.mapHeading}><span>Where we work</span><span className={styles.north} aria-hidden="true">N &#8593;</span></div>
          <div className={styles.map}>
            <svg viewBox="0 0 800 600" className={styles.drawing} aria-hidden="true">
              <defs><pattern id="contact-regional-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" /></pattern></defs>
              <rect width="800" height="600" fill="url(#contact-regional-grid)" />
              <g className={styles.contours}>
                <path d="M-80 390C120 380 60 190 195 150S350 65 315-70" />
                <path d="M-80 425C170 415 105 220 225 180S390 80 350-70" />
                <path d="M-80 460C215 455 145 250 260 210S425 105 390-70" />
                <path d="M-80 495C245 500 185 290 295 245S465 130 430-70" />
              </g>
              <path d="M565-10C550 80 599 122 573 185S587 282 604 320S570 379 604 430S655 518 650 610H810V-10Z" className={styles.ocean} />
              <path d="M565-10C550 80 599 122 573 185S587 282 604 320S570 379 604 430S655 518 650 610" className={styles.coastline} />
              <motion.path d="M335 450C330 335 480 300 475 160" className={styles.connection} initial={reduced ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: 'easeInOut' }} />
              <g className={styles.focusRing} style={{ opacity: region === 'coast' ? 1 : 0.25 }}><circle cx="475" cy="160" r="48" /><circle cx="475" cy="160" r="34" /></g>
              <g className={styles.focusRing} style={{ opacity: region === 'brisbane' ? 1 : 0.25 }}><circle cx="335" cy="450" r="48" /><circle cx="335" cy="450" r="34" /></g>
              <circle cx="475" cy="160" r="5" className={styles.point} /><circle cx="335" cy="450" r="5" className={styles.point} />
              <path d="M455 160H412M315 450H273" className={styles.leader} />
              <text x="702" y="255" transform="rotate(90 702 255)" className={styles.sea}>CORAL SEA</text>
            </svg>
            <div className={styles.regions} role="group" aria-label="Choose a service region">
              <button type="button" className={styles.coastChoice} aria-pressed={region === 'coast'} aria-controls="region-contact-copy" onClick={() => setRegion('coast')}><span>Also working here</span><strong>Sunshine Coast</strong><span className={styles.selectPrompt}>Explore region <span aria-hidden="true">&#8599;</span></span></button>
              <button type="button" className={styles.brisbaneChoice} aria-pressed={region === 'brisbane'} aria-controls="region-contact-copy" onClick={() => setRegion('brisbane')}><span>Based here</span><strong>Brisbane</strong><span className={styles.selectPrompt}>Explore region <span aria-hidden="true">&#8599;</span></span></button>
            </div>
          </div>
          <div className={styles.mapFooter}><span>Brisbane &amp; the Sunshine Coast</span><span>Regional illustration</span></div>
        </div>
        <div className={styles.contactPanel}>
          <div id="region-contact-copy" className={styles.regionCopy} aria-live="polite" aria-atomic="true">
            <span className={styles.eyebrow}>{current.label}</span>
            <h3>{current.heading}</h3>
            <p>{current.copy}</p>
          </div>
          <div className={styles.person}>
            <span className={styles.eyebrow}>Your first conversation</span>
            <div className={styles.personName}><h3>{contact.principal}</h3><span>{contact.role}</span></div>
            <p>The builder you speak with. The person on site.</p>
            <a className={styles.phone} href={contact.phoneHref}><span><small>Call Angus directly</small>{contact.phone}</span><span aria-hidden="true">&#8599;</span></a>
            <a className={styles.email} href={contact.emailHref}>{contact.email}<span aria-hidden="true">&#8599;</span></a>
          </div>
          <button type="button" className={styles.enquire} onClick={enquire}>Tell us about your place <span aria-hidden="true">&#8595;</span></button>
        </div>
      </div>
      <div className={styles.note}><span className={styles.noteMark} aria-hidden="true">+</span><div><h3>A little further afield?</h3><p>Tell Angus the suburb and what you have in mind. He can let you know whether the location and project are a fit.</p></div><button type="button" onClick={enquire}>Ask about your location <span aria-hidden="true">&#8599;</span></button></div>
    </div>
  </section>
}
