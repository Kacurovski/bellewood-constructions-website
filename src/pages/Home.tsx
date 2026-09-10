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
 * reference; this is the same eight numbers collected as an index, which is how
 * a set of drawings opens.
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
