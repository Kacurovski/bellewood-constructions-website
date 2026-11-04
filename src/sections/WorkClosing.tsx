import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { ScrollWords } from '../components/ScrollWords'
import { contact } from '../config/site'
import styles from './WorkClosing.module.css'

/** The collection ends with an invitation to discuss the visitor's own home. */
export function WorkClosing() {
  return (
    <section className={['shell', styles.close].join(' ')} aria-labelledby="work-close-heading">
      <Reveal>
        <ScrollWords as="h2" id="work-close-heading" className={styles.statement}
          text="You've seen what's possible. Let's talk about *your home*." />
      </Reveal>
      <Reveal delay={0.1} className={styles.actions}>
        <Link to="/contact" className={styles.conversation}>
          <span>Start a conversation</span>
        </Link>
        <p className={styles.call}>Or call Angus <a href={contact.phoneHref}>{contact.phone}</a></p>
      </Reveal>
    </section>
  )
}
