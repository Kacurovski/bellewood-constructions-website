import { Link } from 'react-router-dom'
import { PageHead } from '../components/PageHead'
import { Reveal } from '../components/Reveal'
import { Process } from '../sections/Process'
import { ScrollWords } from '../components/ScrollWords'
import { usePageTitle } from '../hooks/usePageTitle'
import { contact } from '../config/site'
import styles from './Approach.module.css'

/**
 * How it works — a route of its own.
 *
 * "Approach" in the navigation used to be `/#approach`: it took you to the home
 * page and scrolled you down it. Two things were wrong with that. It is the only
 * item in the bar that does not go anywhere, so the bar reads as three links and
 * a bookmark; and the thing it scrolls to is the largest single section on the
 * site, held for two and a half screens, which is a page's worth of content
 * sitting inside somebody else's page.
 *
 * The build moved here rather than being copied here. The home page does not
 * carry it any more — this is the whole reason the route exists, and a nav item
 * that leads to a second copy of a home page section is the complaint it was
 * meant to answer.
 */
export default function Approach() {
  usePageTitle('Approach')

  return (
    <>
      <PageHead
        number="E-01"
        eyebrow="Approach"
        title="Drawn, then built."
        lede="We work from the architect's documents, set out square, and build in the same order every time. Nothing about the sequence is improvised."
        meta={[
          { label: 'Working from', value: 'Architect and designer documents' },
          { label: 'Sequence', value: 'Four stages, every job' },
          { label: 'On site', value: contact.principal },
        ]}
      />

      <Process headless />

      <section className={['shell', styles.close].join(' ')} aria-labelledby="approach-close">
        <Reveal>
          <ScrollWords
            as="h2"
            id="approach-close"
            className={styles.statement}
            text="The order is the same on every job, which is why the *last week of a build* looks like the first — and why the drawings you were handed are the drawings you get."
          />
        </Reveal>

        <Reveal delay={0.1} className={styles.actions}>
          <Link to="/contact" className="btn">
            Start a conversation
          </Link>
          <a href={contact.phoneHref} className="link-underline">
            {contact.phone}
          </a>
        </Reveal>
      </section>
    </>
  )
}
