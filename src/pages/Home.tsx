import { Hero } from '../sections/Hero'
import { SheetRail } from '../components/SheetRail'
import type { Sheet } from '../components/SheetRail'
import { ContinuityIntroduction } from '../sections/ContinuityIntroduction'
import { Proposition } from '../sections/Proposition'
import { EverydayStudy } from '../sections/PhotoStudiesTest'
import { Process } from '../sections/Process'
import { Testimonials } from '../sections/Testimonials'
import { Enquiry } from '../sections/Enquiry'
import { PhotoPauseTest } from '../sections/PhotoPauseTest'
import { LeadMagnet } from '../components/LeadMagnet'
import { usePageTitle } from '../hooks/usePageTitle'
import styles from './Home.module.css'

/** Home-page chapter navigation, in the same order as the rendered sections. */
const SHEETS: Sheet[] = [
  { number: 'A-01', name: 'Ascot house', target: 'hero-heading', dark: true },
  { number: 'Note', name: 'Same builder. New name.', target: 'continuity-heading' },
  { number: 'A-02', name: 'What we build', target: 'proposition-heading' },
  { number: 'A-03', name: 'Room for everyday life', target: 'everyday-heading', dark: true },
  { number: 'A-04', name: 'How it works', target: 'approach-heading' },
  { number: 'A-05', name: 'In their words', target: 'said-heading' },
  { number: 'A-06', name: 'What happens next', target: 'enquiry-heading', dark: true },
]

export default function Home() {
  usePageTitle(null)

  return (
    <>
      <SheetRail sheets={SHEETS} />
      <Hero />
      <ContinuityIntroduction />
      <Proposition />
      <EverydayStudy home />
      <Process sheetNumber="A-04" />
      <section id="renovation-checklist" className={['shell', styles.checklist].join(' ')}
        aria-labelledby="renovation-checklist-heading" tabIndex={-1}>
        <LeadMagnet tone="green" headingId="renovation-checklist-heading" />
      </section>
      <Testimonials sheetNumber="A-05" />
      <PhotoPauseTest />
      <Enquiry sheetNumber="A-06" />
    </>
  )
}
