import { compliance, site } from '../config/site'
import styles from './ComplianceLine.module.css'

type Props = {
  className?: string
}

/**
 * The legally required advertising line.
 *
 * Queensland law requires the licensed name and licence number to appear in
 * advertising. Bellewood is a trading name until the ASIC name change takes
 * effect on 1 July 2027, so the licensed entity must appear on every
 * public-facing surface until then. This is not a design preference.
 *
 * AFTER 1 JULY 2027: set `compliance.tradingNameClause` to null in
 * src/config/site.ts. The trading-name clause drops off, the licence number
 * stays, and this component handles it. That is the entire change.
 */
export function ComplianceLine({ className }: Props) {
  const { licenceNumber, tradingNameClause } = compliance

  return (
    <p className={[styles.line, 'fine', className].filter(Boolean).join(' ')}>
      {site.name}
      {tradingNameClause ? `, ${tradingNameClause}` : ''}, QBCC Lic. No.{' '}
      {licenceNumber}
    </p>
  )
}
