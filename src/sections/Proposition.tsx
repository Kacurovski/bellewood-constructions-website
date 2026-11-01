import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { ScrollWords } from '../components/ScrollWords'
import { AuchenflowerDrawing } from '../components/AuchenflowerDrawing'
import { photographyStories } from '../data/projects'
import styles from './Proposition.module.css'

/** A photo-referenced architectural study paired with its Auchenflower photograph. */
export function Proposition() {
  const photos = photographyStories.proposition
  return (
    <section className={['section', styles.section].join(' ')} aria-labelledby="proposition-heading">
      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.head}>
          <SheetRef number="A-02" name="What we build" rule={false} />
          <ScrollWords as="h2" id="proposition-heading" className={styles.statement}
            text="A worker's cottage, a Queenslander, a post-war home *worth keeping*. Built predominantly in *timber*, because that is what these houses are made of." />
        </Reveal>
        <div className={styles.figures}>
          <Reveal>
            <figure className={styles.figure}>
              <Link to="/work/auchenflower" className={styles.drawingLink} aria-label="Explore Auchenflower, the reference for this architectural drawing">
                <AuchenflowerDrawing />
              </Link>
              <figcaption className={styles.caption}><span className={styles.captionNumber}>The study</span>Auchenflower, illustrated from the project photograph.</figcaption>
            </figure>
          </Reveal>
          <Reveal delay={0.12}>
            <figure className={styles.figure}>
              <Link to="/work/auchenflower" className={styles.photoLink} aria-label="See more photographs of Auchenflower">
                <img src={photos.reference.src!} alt={photos.reference.alt} loading="lazy" decoding="async" />
              </Link>
              <figcaption className={styles.caption}><span className={styles.captionNumber}>The house</span>The gabled verandah and adjoining weatherboard wing.</figcaption>
            </figure>
          </Reveal>
          <Link to="/work/auchenflower" className={styles.projectLink}>Explore Auchenflower <span aria-hidden="true">&#8594;</span></Link>
        </div>
        <Reveal delay={0.16} className={styles.bodyWrap}>
          <aside className={styles.note}>
            <span className={['eyebrow', styles.noteLabel].join(' ')}>Beyond the family home</span>
            <p className={styles.aside}>We also take on apartment refurbishments, in Brisbane and on the Sunshine Coast, to the same standard.</p>
          </aside>
        </Reveal>
      </div>
    </section>
  )
}
