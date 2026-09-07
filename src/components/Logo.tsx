import { brand, site } from '../config/site'
import styles from './Logo.module.css'

type Variant = 'lockup' | 'symbol'
type Tone = 'green' | 'reverse'

type Props = {
  variant?: Variant
  tone?: Tone
  /** Rendered width in px. Clamped to the brand minimum. */
  width?: number
  className?: string
  /** True when the mark sits next to the visible business name already. */
  decorative?: boolean
}

/**
 * The only component on this site that touches logo artwork.
 *
 * To swap the mark — a PNG for the final SVG master — change the paths in
 * `src/config/site.ts` and nothing here needs to be touched. Aspect ratio is
 * read from config so a differently proportioned master will not shift layout.
 *
 * Brand rules enforced here:
 *  - the full lockup is never rendered below 120px wide
 *  - the symbol is never rendered below 24px wide, and the small-size variant
 *    that would make small use legal does not exist yet, so the symbol is not
 *    used small anywhere on this site
 *  - clear space of X on all four sides, where X is the height of the roof pitch
 *  - the mark is never recoloured, stretched, skewed, shadowed or rebuilt from type
 */
export function Logo({
  variant = 'lockup',
  tone = 'green',
  width,
  className,
  decorative = false,
}: Props) {
  const art = variant === 'lockup' ? brand.lockup : brand.symbol
  const min = variant === 'lockup' ? brand.minLockupWidth : brand.minSymbolWidth
  const w = Math.max(width ?? min, min)
  const h = Math.round((w / art.width) * art.height)

  return (
    <span
      className={[styles.wrap, className].filter(Boolean).join(' ')}
      style={{ width: w, height: h, ['--clear' as string]: `${h * 0.34}px` }}
    >
      <img
        src={tone === 'green' ? art.green : art.reverse}
        width={w}
        height={h}
        alt={decorative ? '' : site.name}
        aria-hidden={decorative || undefined}
        draggable={false}
        className={styles.img}
      />
    </span>
  )
}
