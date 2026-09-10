import { Hero } from '../sections/Hero'
import { SheetRail } from '../components/SheetRail'
import type { Sheet } from '../components/SheetRail'
import { Proposition } from '../sections/Proposition'
import { SelectedProjects } from '../sections/SelectedProjects'
import { GreenSection } from '../sections/GreenSection'
import { Process } from '../sections/Process'
import { Architects } from '../sections/Architects'
import { Testimonials } from '../sections/Testimonials'
import { Enquiry } from '../sections/Enquiry'
import { LeadMagnet } from '../components/LeadMagnet'
import { usePageTitle } from '../hooks/usePageTitle'
import styles from './Home.module.css'

/**
 * The set. Every band on this page carries its number in its own sheet
 * reference; this is the same seven numbers collected as an index, which is how
 * a set of drawings opens.
 *
 * The frame that assembles as you scroll is A-05 and it stays here. It was
 * moved to /approach for a pass, on the reasoning that a nav item should not
 * lead to a copy of a home page section — which is sound in general and wrong
 * for this one. It is the signature object of the site and the home page is
 * where most people meet it. /approach carries it too, headless, inside a page
 * that also holds the key to the drawing; the same object appears three ways on
 * this site already, and this is the fourth.
 *
 * `dark` marks the bands on Bellewood Green, so the rail knows to reverse as it
 * crosses onto one.
 */
const SHEETS: Sheet[] = [
  { number: 'A-01', name: 'Heritage study', target: 'hero-heading', dark: true },
  { number: 'A-02', name: 'What we build', target: 'proposition-heading' },
  { number: 'A-03', name: 'Selected work', target: 'work-heading' },
  { number: 'A-04', name: 'The name', target: 'name-heading', dark: true },
  { number: 'A-05', name: 'How it works', target: 'approach-heading' },
  { number: 'A-06', name: 'For architects', target: 'architects-heading' },
  { number: 'A-07', name: 'In their words', target: 'said-heading' },
  { number: 'A-08', name: 'What happens next', target: 'enquiry-heading', dark: true },
]

export default function Home() {
  usePageTitle(null)

  return (
    <>
      <SheetRail sheets={SHEETS} />
      <Hero />
      <Proposition />
      <SelectedProjects />
      <GreenSection />
      <Process />
      <Architects />
      <Testimonials />
      <div className={['shell', styles.magnet].join(' ')}>
        <LeadMagnet />
      </div>
      <Enquiry />
    </>
  )
}
