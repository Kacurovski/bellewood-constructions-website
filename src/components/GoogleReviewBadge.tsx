import { googleReviews } from '../config/site'
import googleMark from '../assets/brand/google-g.png'
import styles from './GoogleReviewBadge.module.css'

/** A lightweight link to Google; it does not label the site's quotes as Google reviews. */
export function GoogleReviewBadge() {
  return (
    <a className={styles.badge} href={googleReviews.url} target="_blank" rel="noopener noreferrer"
      aria-label={`${googleReviews.rating.toFixed(1)} out of 5 on Google. Read reviews for ${googleReviews.businessName} (opens in a new tab).`}>
      <span className={styles.mark} aria-hidden="true">
        <img src={googleMark} width={24} height={24} alt="" />
      </span>
      <span className={styles.copy} aria-hidden="true">
        <span className={styles.rating}>
          <strong>{googleReviews.rating.toFixed(1)}</strong>
          <span className={styles.stars}>
            {Array.from({ length: 5 }, (_, i) => (
              <svg key={i} width="13" height="13" viewBox="0 0 24 24" focusable="false">
                <path d="m12 2.8 2.8 5.7 6.3.9-4.55 4.45 1.07 6.27L12 17.16l-5.62 2.96 1.07-6.27L2.9 9.4l6.3-.9Z" />
              </svg>
            ))}
          </span>
        </span>
        <span className={styles.label}>Read our Google reviews</span>
      </span>
    </a>
  )
}
