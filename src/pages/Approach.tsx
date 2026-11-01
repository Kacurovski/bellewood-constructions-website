import { ApproachPhotoTest } from '../sections/ApproachPhotoTest'
import { PageHead } from '../components/PageHead'
import { Process } from '../sections/Process'
import { PhotographyStorySlides } from '../sections/PhotographyStories'
import { RenovationDetails } from '../sections/RenovationDetails'
import { Journey } from '../sections/Journey'
import { Questions } from '../sections/Questions'
import { usePageTitle } from '../hooks/usePageTitle'
import { contact } from '../config/site'

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
 * The build is on the home page as well, and that is deliberate. It was moved
 * here exclusively for a pass, on the reasoning that a nav item should not lead
 * to a copy of a home page section — sound in general, wrong for this one: it is
 * the signature object of the site and the home page is where most people meet
 * it. Here it runs headless, followed by an interactive architectural study that explains
 * the renovation ideas and materials, then the practical steps of working together.
 */
export default function Approach() {
  usePageTitle('Approach')

  return (
    <>
      <PageHead
        number="E-01"
        eyebrow="Approach"
        title="Drawn, then built."
        lede="We work from the architect's drawings, set out square and follow a clear sequence, with the same care from start to finish."
        meta={[
          { label: 'Working from', value: 'Architect and designer documents' },
          { label: 'Sequence', value: 'Four stages, every job' },
          { label: 'On site', value: contact.principal },
        ]}
      />

      <Process headless />

      <PhotographyStorySlides sheetNumber="E-02" />

      <RenovationDetails />

      {/* The plain-language half of this page: what the drawing says, said in
          words, plus everything people ring up to ask before they commit. */}
      <Journey number="E-04" />
      <Questions number="E-05" />

      {/* One closing invitation follows the practical guidance. */}
      <ApproachPhotoTest />
    </>
  )
}
