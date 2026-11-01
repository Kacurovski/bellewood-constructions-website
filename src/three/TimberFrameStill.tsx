import front from '../assets/models/kalinga-front.webp'
import rear from '../assets/models/kalinga-rear.webp'
import type { FrameView } from './frameMembers'

/** Finished views rendered from TimberFrame at progress=1 using FRAME_VIEWS.
 * A pre-rendered view preserves actual depth testing: SVG face sorting cannot
 * reliably resolve the overlapping rails, roof junctions and narrow trim.
 * Regenerate both assets whenever the member geometry or palette changes.
 */
export function TimberFrameStill({ className, view = 'front' }: { className?: string; view?: FrameView }) {
  return <img className={className} src={view === 'rear' ? rear : front} width={1650} height={1170} alt="" aria-hidden="true" decoding="async" style={{ objectFit: 'contain' }} />
}
