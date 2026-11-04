import front from '../assets/models/assembly-street.webp'
import rear from '../assets/models/assembly-garden.webp'
import type { FrameView } from './frameMembers'

/** Croyde's finished views rendered from TimberFrame at progress=1 using FRAME_VIEWS.
 * A pre-rendered view preserves actual depth testing: SVG face sorting cannot
 * reliably resolve the overlapping rails, roof junctions and narrow trim.
 * Regenerate both assets with scripts/render_croyde_study.ps1 whenever the
 * member geometry or palette changes. SceneFrame supplies the accessible label.
 */
export function TimberFrameStill({ className, view = 'front' }: { className?: string; view?: FrameView }) {
  return <img className={className} src={view === 'rear' ? rear : front} width={1650} height={1170} alt="" aria-hidden="true" decoding="async" style={{ objectFit: 'contain' }} />
}
