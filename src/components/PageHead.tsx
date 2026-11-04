import type { CSSProperties, ReactNode } from 'react'
import { Reveal } from './Reveal'
import { RegistrationMarks, SheetRef } from './Sheet'
import styles from './PageHead.module.css'

export type MetaRow = {
  label: string
  value: ReactNode
}

type Props = {
  /** Optional legacy source reference; not part of the displayed introduction. */
  number?: string
  eyebrow: ReactNode
  title: ReactNode
  lede?: ReactNode
  /** Supporting context and routes into the page, or project facts. */
  meta?: MetaRow[]
  /** Optional editorial image alongside the introduction. */
  media?: ReactNode
  /** Anything that should sit under the title instead of a ledger. */
  children?: ReactNode
  /** Optional page-specific introduction. Omit to retain the original masthead. */
  variant?: 'work' | 'approach' | 'about' | 'contact'
}

/** Page openings enter on mount, independently of scroll observers or JS frames. */
function IntroSettle({ children, className, delay = 0, y = 12 }: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  return (
    <div
      className={[styles.settle, className].filter(Boolean).join(' ')}
      style={{ '--intro-delay': `${delay}s`, '--intro-y': `${y}px` } as CSSProperties}
    >
      {children}
    </div>
  )
}

/**
 * The masthead. One opening move for every route.
 *
 * It carries `on-green`, which is both the reverse text handling and the
 * ground: Bellewood Green, the colour the brand book assigns to solid grounds.
 * It was briefly Deep Pine, on the idea that the page should open a step darker
 * than the footer — but Pine is the book's text-and-rules colour, and used as a
 * field it reads as a near-black that is not quite the identity's dark.
 *
 * The header is transparent over this band (see Header.module.css), which is
 * why the band runs up underneath it rather than starting below it.
 */
export function PageHead({ number, eyebrow, title, lede, meta, media, children, variant }: Props) {
  const FactsReveal = variant ? IntroSettle : Reveal
  return (
    <header
      className={['on-green', styles.head, variant && styles.refined, variant && styles[variant], media && styles.withMedia].filter(Boolean).join(' ')}
      data-page-intro={variant}
    >
      <RegistrationMarks />

      <div className={['shell', styles.inner].join(' ')}>
        {variant ? (
          <div className={styles.copy}>
            <IntroSettle y={0}>
              <SheetRef number={number} name={eyebrow} rule={false} />
            </IntroSettle>
            <IntroSettle delay={0.06} y={12}>
              <h1 className={styles.title}>{title}</h1>
            </IntroSettle>
            {lede && variant !== 'approach' && (
              <IntroSettle delay={0.14} y={8}>
                <p className={styles.lede}>{lede}</p>
              </IntroSettle>
            )}
            {children}
          </div>
        ) : (
          <Reveal className={styles.copy}>
            <SheetRef number={number} name={eyebrow} rule={false} />
            <h1 className={styles.title}>{title}</h1>
            {lede && <p className={styles.lede}>{lede}</p>}
            {children}
          </Reveal>
        )}

        {variant === 'approach' && lede && (
          <IntroSettle className={styles.introNote} delay={0.14} y={8}>
            <p className={styles.lede}>{lede}</p>
          </IntroSettle>
        )}

        {meta && meta.length > 0 && (
          <FactsReveal className={variant ? styles.facts : undefined} delay={variant ? 0.22 : 0.08} y={variant ? 8 : 18}>
            <dl className={styles.meta}>
              {meta.map((row) => (
                <div className={styles.row} key={row.label}>
                  <dt className={styles.label}>{row.label}</dt>
                  <dd className={styles.value}>{row.value}</dd>
                </div>
              ))}
            </dl>
          </FactsReveal>
        )}

        {media && (
          <IntroSettle className={styles.media} delay={0.16} y={10}>
            {media}
          </IntroSettle>
        )}
      </div>
    </header>
  )
}
