import { Hero } from '../sections/Hero'
import { ContinuityIntroduction } from '../sections/ContinuityIntroduction'
import { Proposition } from '../sections/Proposition'
import { EverydayStudy } from '../sections/PhotoStudiesTest'
import { Process } from '../sections/Process'
import { Testimonials } from '../sections/Testimonials'
import { Enquiry } from '../sections/Enquiry'
import { PhotoPauseTest } from '../sections/PhotoPauseTest'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Home() {
  usePageTitle(null)

  return (
    <>
      <Hero />
      <ContinuityIntroduction />
      <Proposition />
      <EverydayStudy home />
      <Process sheetNumber="A-04" />
      <Testimonials sheetNumber="A-05" />
      <PhotoPauseTest />
      <Enquiry sheetNumber="A-06" />
    </>
  )
}
