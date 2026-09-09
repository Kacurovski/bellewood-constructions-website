import type { ReactNode } from 'react'
import { Reveal } from './Reveal'
import styles from './PageHead.module.css'

export type MetaRow = {
  label: string
  value: ReactNode
}

type Props = {
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
 * It carries `on-green` so the global reverse rules apply to anything passed
 * through `children`, and overrides the ground to Deep Pine — a step darker
 * than the footer, so the page opens at its darkest and resolves upward.
 *
 * The header is transparent over this band (see Header.module.css), which is
 * why the band runs up underneath it rather than starting below it.
 */
export function PageHead({ eyebrow, title, lede, meta, children }: Props) {
  return (
    <header className={['on-green', styles.head].join(' ')}>
      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.copy}>
          <p className="eyebrow">{eyebrow}</p>
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
