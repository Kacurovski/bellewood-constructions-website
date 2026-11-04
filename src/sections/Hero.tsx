import { ActionGlyph } from '../components/ActionGlyph'
import { GoogleReviewBadge } from '../components/GoogleReviewBadge'
import { googleReviews } from '../config/site'
import { useRef } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { RoomJourney } from '../components/RoomJourney'
import { ascotHeroFrames } from '../data/projects'
import type { HeroFrame } from '../data/projects'
import { captionState, heroState, HERO_TRAVEL } from '../lib/heroMotion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { getLenis } from '../hooks/useLenis'
import styles from './Hero.module.css'

function WorkLink() {
  return <Link className={styles.workLink} to="/work">
    <span>Explore our work</span>
  </Link>
}

function FrameCopy({ frame, index }: { frame: HeroFrame; index: number }) {
  return <>
    <p className={styles.eyebrow}>Ascot, Brisbane <span aria-hidden="true">/</span> {frame.room}</p>
    {index === 0
      ? <h1 id="hero-heading" className={styles.heading}>{frame.title}</h1>
      : <h2 className={styles.heading}>{frame.title}</h2>}
    <p className={styles.description}>{frame.body}</p>
  </>
}

function Caption({ frame, index, progress }: {
  frame: HeroFrame; index: number; progress: MotionValue<number>
}) {
  const opacity = useTransform(progress, value => captionState(value, index).opacity)
  const y = useTransform(progress, value => captionState(value, index).y)
  return (
    <motion.div className={[styles.caption, styles[frame.placement]].join(' ')} style={{ opacity, y }}>
      <FrameCopy frame={frame} index={index} />
    </motion.div>
  )
}

/** Always-present HTML images: first paint, failed WebGL and context-loss fallback. */
function PhotoFallback({ frame, index, progress }: {
  frame: HeroFrame; index: number; progress: MotionValue<number>
}) {
  const opacity = useTransform(progress, value => {
    const state = heroState(value)
    if (index <= state.from) return 1
    return index === state.to ? state.blend : 0
  })
  const scale = useTransform(progress, value => {
    const state = heroState(value)
    return index === state.from ? state.outgoingZoom : index === state.to ? state.incomingZoom : 1.035
  })
  return (
    <motion.div className={styles.fallback} style={{ opacity }}>
      <motion.img src={frame.src} alt={frame.alt} width="2560" height="1707"
        style={{ scale, objectPosition: frame.position, transformOrigin: frame.position }}
        decoding="async" fetchPriority={index === 0 ? 'high' : 'auto'} />
    </motion.div>
  )
}

function RoomStop({ index, progress, go }: {
  index: number; progress: MotionValue<number>; go: (index: number) => void
}) {
  const scaleX = useTransform(progress, value => Math.max(0, Math.min(1, value * HERO_TRAVEL - index + 1)))
  return (
    <button type="button" onClick={() => go(index)} className={styles.stop}
      aria-label={`View scene ${index + 1}: ${ascotHeroFrames[index].room}`}>
      <span className={styles.stopNumber}>{String(index + 1).padStart(2, '0')}</span>
      <span className={styles.stopRail}><motion.span style={{ scaleX }} /></span>
    </button>
  )
}

function ScrollHero() {
  const track = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  // One shared, lightly damped timeline keeps images, text and room markers
  // together even when a wheel or trackpad sends a sudden burst of scroll.
  const progress = useSpring(scrollYProgress, {
    stiffness: 95, damping: 30, mass: 0.65, restDelta: 0.0001, restSpeed: 0.0001,
  })
  const atmosphere = useTransform(progress, value => heroState(value).atmosphere)
  const go = (index: number) => {
    const el = track.current
    if (!el) return
    const pin = el.firstElementChild as HTMLElement
    const y = el.getBoundingClientRect().top + window.scrollY
      + (el.offsetHeight - pin.offsetHeight) * ((index === 0 ? 0 : index + 0.15) / HERO_TRAVEL)
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(y, { duration: 1.65 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }
  const skip = () => {
    const heading = document.getElementById('continuity-heading')
    const el = heading?.closest('section')
    if (!el) return
    heading?.setAttribute('tabindex', '-1')
    heading?.focus({ preventScroll: true })
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el, { offset: -84, duration: 1.2 })
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section ref={track} className={['on-green', styles.hero].join(' ')} aria-labelledby="hero-heading"
      aria-label="Ascot house, a journey through five photographs">
      <div className={styles.pin}>
        {ascotHeroFrames.map((frame, index) =>
          <PhotoFallback key={frame.src} frame={frame} index={index} progress={progress} />)}
        <RoomJourney progress={progress} className={styles.canvas} />
        <div className={styles.greenWash} aria-hidden="true" />
        <motion.div className={styles.transitionWash} style={{ opacity: atmosphere }} aria-hidden="true" />
        <div className={styles.topScrim} aria-hidden="true" />
        <div className={styles.bottomScrim} aria-hidden="true" />
        <div className={['shell', styles.content].join(' ')}>
          {ascotHeroFrames.map((frame, index) =>
            <Caption key={frame.src} frame={frame} index={index} progress={progress} />)}
          <div className={styles.footer}>
            <div className={styles.journeyControl}>
              <span className={styles.hint}>Scroll to explore <ActionGlyph name="down" /></span>
              <nav className={styles.stops} aria-label="Ascot rooms">
                {ascotHeroFrames.map((frame, index) =>
                  <RoomStop key={frame.src} index={index} progress={progress} go={go} />)}
              </nav>
            </div>
            <div className={styles.heroActions}>
              <div className={styles.links}>
                <button className={styles.skip} type="button" onClick={skip}>
                  <span>Skip tour</span>
                  <ActionGlyph name="down" />
                </button>
                <WorkLink />
              </div>
              {googleReviews.placements.hero && <GoogleReviewBadge variant="hero" />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Reduced motion is a normal document sequence: no pinning, zoom or blur. */
function StaticHero() {
  return (
    <section className={['on-green', styles.staticHero].join(' ')} aria-labelledby="hero-heading">
      {ascotHeroFrames.map((frame, index) => (
        <article className={styles.staticFrame} key={frame.src}>
          <img src={frame.src} alt={frame.alt} width="2560" height="1707"
            style={{ objectPosition: frame.position } as CSSProperties}
            loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} />
          <div className={styles.greenWash} aria-hidden="true" />
          <div className={styles.topScrim} aria-hidden="true" />
          <div className={styles.bottomScrim} aria-hidden="true" />
          <div className={['shell', styles.staticContent].join(' ')}>
            <div className={[styles.caption, styles[frame.placement]].join(' ')}>
              <FrameCopy frame={frame} index={index} />
            </div>
            {index === 0 && googleReviews.placements.hero ? (
              <div className={styles.staticActions}>
                <WorkLink />
                <GoogleReviewBadge variant="hero" />
              </div>
            ) : <WorkLink />}
          </div>
        </article>
      ))}
    </section>
  )
}

export function Hero() {
  return useReducedMotion() ? <StaticHero /> : <ScrollHero />
}
