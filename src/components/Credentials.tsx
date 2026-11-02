import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { credentials } from '../config/site'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './Credentials.module.css'

const [licence, insurance, location, capacity] = credentials
const assurances = [
  { title: 'Personal attention', value: capacity.value, note: 'Angus, still on site.' },
  { title: 'Licensed & insured', value: licence.value, note: insurance.value },
  { title: location.label, value: location.value, note: 'Renovations and extensions.' },
]
const HOLD = 5200

/** Three overlapping editorial cards; one legible face, with the next visible
 * at its shoulder. Automatic motion is optional and stops for interaction. */
export function Credentials({ running, paused, onPause, onToggleMotion }: {
  running: boolean
  paused: boolean
  onPause: () => void
  onToggleMotion: () => void
}) {
  const reduced = useReducedMotion()
  const [at, setAt] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const down = useRef<{ x: number; y: number } | null>(null)
  const cycling = running && !hovered && !focused

  useEffect(() => {
    if (!cycling) return
    const timer = window.setTimeout(() => setAt(value => (value + 1) % assurances.length), HOLD)
    return () => window.clearTimeout(timer)
  }, [cycling, at])

  function choose(index: number) {
    onPause()
    setAt((index + assurances.length) % assurances.length)
  }

  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === 'ArrowRight' ? (index + 1) % assurances.length
      : event.key === 'ArrowLeft' ? (index + assurances.length - 1) % assurances.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? assurances.length - 1 : null
    if (next === null) return
    event.preventDefault()
    choose(next)
    tabs.current[next]?.focus()
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse') return
    down.current = { x: event.clientX, y: event.clientY }
    onPause()
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!down.current) return
    const dx = event.clientX - down.current.x
    const dy = event.clientY - down.current.y
    down.current = null
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) choose(at + (dx < 0 ? 1 : -1))
  }

  return (
    <div className={styles.carousel} role="region" aria-label="About the builder"
      aria-roledescription="carousel" data-assurance-index={at} data-cycling={cycling}>
      <div className={styles.stage}
        onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true) }}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={onPointerDown} onPointerUp={onPointerUp}
        onPointerCancel={() => { down.current = null }}>
        {assurances.map((item, i) => {
          const position = (i - at + assurances.length) % assurances.length
          return (
            <div key={item.title} id={`builder-assurance-${i}`} role="tabpanel"
              aria-labelledby={`builder-assurance-tab-${i}`} aria-hidden={i !== at}
              className={styles.card} data-position={position}>
              <span className={styles.edgeNumber} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div className={styles.face}>
                <div className={styles.cardTop}><span>{String(i + 1).padStart(2, '0')}</span><h3>{item.title}</h3></div>
                <p className={[styles.value, i === 1 ? styles.licence : ''].join(' ')}>{item.value}</p>
                <p className={styles.note}>{item.note}</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className={styles.navigation}>
        <div className={styles.tabs} role="tablist" aria-label="Choose a builder assurance"
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
          {assurances.map((item, i) => (
            <button key={item.title} ref={element => { tabs.current[i] = element }}
              type="button" role="tab" id={`builder-assurance-tab-${i}`}
              aria-controls={`builder-assurance-${i}`} aria-selected={i === at}
              aria-label={item.title} tabIndex={i === at ? 0 : -1}
              onClick={() => choose(i)} onKeyDown={event => onKey(event, i)}>
              {String(i + 1).padStart(2, '0')}
            </button>
          ))}
        </div>
        {!reduced && (
          <button type="button" className={styles.motionControl} onClick={onToggleMotion}
            aria-label={paused ? 'Resume introduction animations' : 'Pause introduction animations'}
            title={paused ? 'Resume animations' : 'Pause animations'}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {paused ? <path d="m9 5 10 7-10 7Z" /> : <path d="M9 6v12M16 6v12" />}
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
