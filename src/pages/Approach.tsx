import { ApproachPhotoTest } from '../sections/ApproachPhotoTest'
import { PageHead } from '../components/PageHead'
import { PhotographyStorySlides } from '../sections/PhotographyStories'
import { RenovationDetails } from '../sections/RenovationDetails'
import { Journey } from '../sections/Journey'
import { Questions } from '../sections/Questions'
import { usePageTitle } from '../hooks/usePageTitle'
import { contact } from '../config/site'

/** Renovation principles, the working relationship, craft, then practical questions. */
export default function Approach() {
  usePageTitle('Approach')

  return (
    <>
      <PageHead
        number="E-01"
        eyebrow="Approach"
        title="Care for the house. Clarity for you."
        lede="We respect what makes the house worth keeping, build carefully from the drawings, and keep you informed from the first conversation to handover."
        meta={[
          { label: 'Working from', value: 'Architect and designer documents' },
          { label: 'Working together', value: 'First call to handover' },
          { label: 'On site', value: contact.principal },
        ]}
      />

      <RenovationDetails />
      <Journey number="E-03" />
      <PhotographyStorySlides sheetNumber="E-04" />
      <Questions number="E-05" />

      {/* One closing invitation follows the practical guidance. */}
      <ApproachPhotoTest />
    </>
  )
}
