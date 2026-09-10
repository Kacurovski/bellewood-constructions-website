import { Hero } from '../sections/Hero'
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

export default function Home() {
  usePageTitle(null)

  return (
    <>
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
