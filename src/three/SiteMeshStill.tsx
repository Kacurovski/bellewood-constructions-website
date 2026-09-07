import { brand } from '../config/site'
import styles from './SiteMeshStill.module.css'

/**
 * The static frame for scene 2: the same green field carrying the same repeated
 * reverse lockup, hung flat instead of moving. Under reduced motion this is the
 * whole section, and it still does the job — a whole lot of green with the white
 * marks on it, which is the entire point.
 */
export function SiteMeshStill() {
  return (
    <div
      className={styles.mesh}
      style={{ backgroundImage: `url(${brand.lockup.reverse})` }}
      aria-hidden="true"
    />
  )
}
