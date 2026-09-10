import type { ReactNode } from 'react'
import { Reveal } from './Reveal'
import { RegistrationMarks, SheetRef } from './Sheet'
import styles from './PageHead.module.css'

export type MetaRow = {
  label: string
  value: ReactNode
}

type Props = {
  /** The sheet number in the set, e.g. "B-01". */
  number: string
  eyebrow: ReactNode
  title: ReactNode
  lede?: ReactNode
  /** The right-hand ledger. Facts already stated elsewhere on the site. */
  meta?: MetaRow[]
  /** Anything that should sit under the title instead of a ledger. */
  children?: ReactNode
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
export function PageHead({ number, eyebrow, title, lede, meta, children }: Props) {
  return (
    <header className={['on-green', styles.head].join(' ')}>
      <RegistrationMarks />

      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.copy}>
          <SheetRef number={number} name={eyebrow} rule={false} />
          <h1 className={styles.title}>{title}</h1>
          {lede && <p className={styles.lede}>{lede}</p>}
          {children}
        </Reveal>

        {meta && meta.length > 0 && (
          <Reveal delay={0.08}>
            <dl className={styles.meta}>
              {meta.map((row) => (
                <div className={styles.row} key={row.label}>
                  <dt className={styles.label}>{row.label}</dt>
                  <dd className={styles.value}>{row.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
    </header>
  )
}
