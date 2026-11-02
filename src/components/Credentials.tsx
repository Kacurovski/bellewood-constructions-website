import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { credentials } from '../config/site'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './Credentials.module.css'

const [licence, insurance, location, capacity] = credentials
const assurances = [
  { title: 'Personal attention', value: capacity.value, note: 'Angus, still on site.' },
  { title: 'Licensed & insured', value: licence.value, note: insurance.value },
  { title: location.label, value: location.value, note: 'Renovations and extensions.' },
]
const STEP = 360 / assurances.length
const DEGREES_PER_SECOND = 360 / 27
const modulo = (value: number, size: number) => ((value % size) + size) % size

/** A continuous three-card orbit, with a real front and reverse on each card.
 * Only the rotor moves: no face swapping, opacity crossfades or z-index jumps. */
export function Credentials({ running, paused, onPause, onToggleMotion }: {
  running: boolean
  paused: boolean
  onPause: () => void
  onToggleMotion: () => void
}) {
  const reduced = useReducedMotion()
  const rotor = useRef<HTMLDivElement>(null)
  const angle = useRef(0)
  const selected = useRef(0)
  const selectionFrame = useRef(0)
  const drag = useRef<{ id: number; x: number; angle: number } | null>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const [at, setAt] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [focused, setFocused] = useState(false)
  const cycling = running && !dragging && !focused

  function paint(next: number) {
    angle.current = next
    rotor.current?.style.setProperty('--orbit-angle', `${next}deg`)
    const index = modulo(Math.round(-next / STEP), assurances.length)
    if (index !== selected.current) {
      selected.current = index
      setAt(index)
    }
  }

  useEffect(() => {
    if (!cycling) return
    window.cancelAnimationFrame(selectionFrame.current)
    let frame = 0
    let previous = 0
    const tick = (time: number) => {
      if (previous) paint(angle.current + (time - previous) * DEGREES_PER_SECOND / 1000)
      previous = time
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [cycling])

  useEffect(() => () => window.cancelAnimationFrame(selectionFrame.current), [])

  function choose(index: number) {
    onPause()
    window.cancelAnimationFrame(selectionFrame.current)
    const targetIndex = modulo(index, assurances.length)
    const start = angle.current
    const delta = modulo(-targetIndex * STEP - start + 180, 360) - 180
    if (reduced) {
      paint(start + delta)
      return
    }
    const started = performance.now()
    const settle = (time: number) => {
      const progress = Math.min((time - started) / 850, 1)
      paint(start + delta * (1 - Math.pow(1 - progress, 3)))
      if (progress < 1) selectionFrame.current = window.requestAnimationFrame(settle)
    }
    selectionFrame.current = window.requestAnimationFrame(settle)
  }

  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === 'ArrowRight' ? modulo(index + 1, assurances.length)
      : event.key === 'ArrowLeft' ? modulo(index - 1, assurances.length)
      : event.key === 'Home' ? 0 : event.key === 'End' ? assurances.length - 1 : null
    if (next === null) return
    event.preventDefault()
    choose(next)
    tabs.current[next]?.focus()
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || reduced) return
    window.cancelAnimationFrame(selectionFrame.current)
    drag.current = { id: event.pointerId, x: event.clientX, angle: angle.current }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || drag.current.id !== event.pointerId) return
    const width = event.currentTarget.clientWidth
    paint(drag.current.angle + (event.clientX - drag.current.x) / width * 240)
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== event.pointerId) return
    drag.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <div className={styles.carousel} role="region" aria-label="About the builder"
      aria-roledescription="carousel" data-assurance-index={at} data-cycling={cycling}>
      <div className={styles.stage} data-dragging={dragging}
        onPointerDown={startDrag} onPointerMove={moveDrag}
        onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}>
        <div className={styles.rotor} ref={rotor}>
          {assurances.map((item, i) => (
            <div key={item.title} id={`builder-assurance-${i}`} role="tabpanel"
              aria-labelledby={`builder-assurance-tab-${i}`} aria-hidden={i !== at}
              className={styles.card} data-active={i === at}
              style={{ '--card-angle': `${i * STEP}deg` } as CSSProperties}>
              <div className={styles.front}>
                <span className={styles.number}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{item.value}</h3>
                <p><span>{item.title}.</span> {item.note}</p>
              </div>
              <div className={styles.back} aria-hidden="true">
                <span>{String(i + 1).padStart(2, '0')}</span>
                <small>Same builder.</small>
                <i />
              </div>
            </div>
          ))}
        </div>
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
              <span aria-hidden="true" />
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
