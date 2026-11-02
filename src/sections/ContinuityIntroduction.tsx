import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useInView } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { Credentials } from '../components/Credentials'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './ContinuityIntroduction.module.css'

const continuity = ['Same builder.', 'Same company.', 'Same licence.', 'A new name.']
const repeatedContinuity = [...continuity, ...continuity, ...continuity]

/** A moving continuity line and a rotating set of three practical assurances.
 * The actual announcement stays still and readable throughout. */
export function ContinuityIntroduction() {
  const section = useRef<HTMLElement>(null)
  const ticker = useRef<HTMLDivElement>(null)
  const tickerMotion = useRef({ position: 0, width: 0, velocity: -52, direction: -1, hovered: false })
  const visible = useInView(section, { amount: .25 })
  const reduced = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  const running = visible && pageVisible && !reduced && !paused

  useEffect(() => {
    const track = ticker.current
    const group = track?.firstElementChild
    if (!track || !group) return
    if (reduced) {
      track.style.removeProperty('transform')
      return
    }

    const motion = tickerMotion.current
    const draw = () => {
      if (motion.width) track.style.transform = `translate3d(${motion.position - motion.width}px, 0, 0)`
    }
    const measure = () => {
      const width = group.getBoundingClientRect().width
      motion.position = motion.width ? motion.position / motion.width * width : 0
      motion.width = width
      draw()
    }
    const observer = new ResizeObserver(measure)
    observer.observe(group)
    measure()

    let lastScroll = window.scrollY
    const readDirection = () => {
      const change = window.scrollY - lastScroll
      if (Math.abs(change) < .5) return
      motion.direction = change > 0 ? -1 : 1
      track.dataset.direction = motion.direction < 0 ? 'left' : 'right'
      lastScroll = window.scrollY
    }
    track.dataset.direction = motion.direction < 0 ? 'left' : 'right'
    window.addEventListener('scroll', readDirection, { passive: true })

    let frame = 0
    let previous = 0
    const tick = (time: number) => {
      const elapsed = previous ? (time - previous) / 1000 : 0
      previous = time
      const target = motion.direction * (motion.hovered ? 10 : 52)
      // Ease through zero when reversing, without restarting the repeated line.
      motion.velocity += (target - motion.velocity) * (1 - Math.exp(-elapsed * 8))
      if (motion.width) {
        motion.position = ((motion.position + motion.velocity * elapsed) % motion.width + motion.width) % motion.width
        draw()
      }
      frame = window.requestAnimationFrame(tick)
    }
    if (running) frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', readDirection)
      observer.disconnect()
    }
  }, [running, reduced])

  return (
    <section ref={section} className={styles.section} aria-labelledby="continuity-heading"
      data-builder-introduction data-running={running}>
      <div className={styles.marquee}
        onPointerEnter={event => { if (event.pointerType === 'mouse') tickerMotion.current.hovered = true }}
        onPointerLeave={() => { tickerMotion.current.hovered = false }}>
        <div className={styles.track} ref={ticker} aria-hidden="true">
          {[0, 1].map(copy => (
            <div className={styles.phrases} key={copy}>
              {repeatedContinuity.map((phrase, i) => (
                <span className={styles.phrase} key={i}>
                  {phrase}
                  <span className={styles.separator} />
                </span>
              ))}
            </div>
          ))}
        </div>
        {!reduced && <button className={styles.motionAccess} type="button"
          onClick={() => setPaused(value => !value)} aria-pressed={paused}>
          {paused ? 'Resume introduction motion' : 'Pause introduction motion'}
        </button>}
      </div>

      <div className={['shell', styles.inner].join(' ')}>
        <Reveal className={styles.story} y={12}>
          <p className={styles.eyebrow}>A continuing story</p>
          <h2 id="continuity-heading" className={styles.heading}>
            <span>Angus Cowan{' '}<br />Constructions</span>{' '}
            <span className={styles.newName}>is becoming <em>Bellewood.</em></span>
          </h2>
          <p className={styles.reassurance}>The same company, the same licence.<br />Angus, still on site.</p>
          <Link to="/about" className={styles.link}>
            <span>Meet Angus and Bellewood</span>
            <svg viewBox="0 0 32 24" fill="none" aria-hidden="true"><path d="M1 12h28m-8-8 8 8-8 8" /></svg>
          </Link>
        </Reveal>

        <Credentials running={running} />
      </div>
    </section>
  )
}
