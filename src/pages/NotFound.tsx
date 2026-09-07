import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { contact } from '../config/site'
import styles from './NotFound.module.css'

export default function NotFound() {
  usePageTitle('Page not found')

  return (
    <section className={['shell', styles.wrap].join(' ')}>
      <p className="eyebrow">404</p>
      <h1 className={['headline', styles.title].join(' ')}>That page isn't here.</h1>
      <p className={[styles.note, 'measure-tight'].join(' ')}>
        It may have moved, or the link may be old. The work is all in one place, or
        you can call Angus on{' '}
        <a href={contact.phoneHref} className={styles.link}>
          {contact.phone}
        </a>
        .
      </p>
      <Link to="/work" className={['btn', styles.action].join(' ')}>
        See the work
      </Link>
    </section>
  )
}
