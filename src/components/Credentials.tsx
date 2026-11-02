import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import { credentials } from '../config/site'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { Logo } from './Logo'
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

/** The cards are the controls: drag to turn, select a face to read, select it
 * again to continue. Keyboard operation lives on the same surface. */
export function Credentials({ running }: { running: boolean }) {
  const reduced = useReducedMotion()
  const rotor = useRef<HTMLDivElement>(null)
  const angle = useRef(0)
  const selected = useRef(0)
  const requested = useRef<number | null>(null)
  const selectionFrame = useRef(0)
  const drag = useRef<{ id: number; x: number; y: number; angle: number } | null>(null)
  const gestureMoved = useRef(false)
  const pointerCard = useRef<number | null>(null)
  const [at, setAt] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [held, setHeld] = useState(false)
  const cycling = running && !dragging && !held

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
    requested.current = null
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
    setHeld(true)
    window.cancelAnimationFrame(selectionFrame.current)
    const targetIndex = modulo(index, assurances.length)
    requested.current = targetIndex
    const start = angle.current
    const delta = modulo(-targetIndex * STEP - start + 180, 360) - 180
    const started = performance.now()
    const settle = (time: number) => {
      const progress = Math.min((time - started) / 850, 1)
      paint(start + delta * (1 - Math.pow(1 - progress, 3)))
      if (progress < 1) selectionFrame.current = window.requestAnimationFrame(settle)
      else requested.current = null
    }
    selectionFrame.current = window.requestAnimationFrame(settle)
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (reduced) return
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (held) setHeld(false)
      else choose(selected.current)
      return
    }
    const index = requested.current ?? selected.current
    const next = event.key === 'ArrowRight' ? index + 1
      : event.key === 'ArrowLeft' ? index - 1
      : event.key === 'Home' ? 0 : event.key === 'End' ? assurances.length - 1 : null
    if (next === null) return
    event.preventDefault()
    choose(next)
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || reduced) return
    if (event.pointerType === 'mouse') event.preventDefault()
    window.cancelAnimationFrame(selectionFrame.current)
    requested.current = null
    gestureMoved.current = false
    const card = (event.target as HTMLElement).closest<HTMLElement>('[data-assurance-card]')
    pointerCard.current = card ? Number(card.dataset.assuranceCard) : null
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, angle: angle.current }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || drag.current.id !== event.pointerId) return
    const dx = event.clientX - drag.current.x
    const dy = event.clientY - drag.current.y
    if (Math.abs(dx) + Math.abs(dy) > 6) gestureMoved.current = true
    paint(drag.current.angle + dx / event.currentTarget.clientWidth * 240)
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== event.pointerId) return
    if (event.type === 'pointercancel') {
      gestureMoved.current = true
      pointerCard.current = null
    }
    drag.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  function readCard(event: MouseEvent<HTMLDivElement>) {
    const card = (event.target as HTMLElement).closest<HTMLElement>('[data-assurance-card]')
    const index = card ? Number(card.dataset.assuranceCard) : pointerCard.current
    pointerCard.current = null
    if (index === null || gestureMoved.current || reduced) return
    if (held && selected.current === index) setHeld(false)
    else choose(index)
  }

  return (
    <div className={styles.carousel} role="region" aria-label="About the builder"
      aria-roledescription={reduced ? undefined : 'carousel'}
      data-assurance-index={at} data-cycling={cycling} data-held={held}>
      <p id="builder-card-help" className="visually-hidden">
        Drag to turn the cards. Select a card to read it; select it again to continue.
        Use the left and right arrow keys to choose a card, or Space to pause and resume.
      </p>
      <div className={styles.stage} data-dragging={dragging} role="group"
        tabIndex={reduced ? undefined : 0} aria-label="Builder assurance cards"
        aria-describedby={reduced ? undefined : 'builder-card-help'}
        onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setHeld(true) }}
        onKeyDown={onKey} onClick={readCard}
        onPointerDown={startDrag} onPointerMove={moveDrag}
        onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}>
        <div className={styles.rotor} ref={rotor}>
          {assurances.map((item, i) => (
            <div key={item.title} role="group" aria-label={`${i + 1} of ${assurances.length}`}
              aria-hidden={reduced ? undefined : i !== at} className={styles.card}
              data-assurance-card={i} data-active={i === at}
              style={{ '--card-angle': `${i * STEP}deg` } as CSSProperties}>
              <div className={styles.front}>
                <div className={styles.cardTop}>
                  <span>{String(i + 1).padStart(2, '0')}</span><h3>{item.title}</h3>
                </div>
                <p className={styles.value}>{item.value}</p>
                <p className={styles.note}>{item.note}</p>
              </div>
              <div className={styles.back} aria-hidden="true">
                <span className={styles.backNumber}>{String(i + 1).padStart(2, '0')}</span>
                <Logo variant="symbol" tone="reverse" width={64} decorative />
              </div>
            </div>
          ))}
        </div>
        {!reduced && <span className={styles.focusHint} aria-hidden="true">← → Turn the cards · Space to pause / play</span>}
      </div>
      {!reduced && <p className="visually-hidden" aria-live={held ? 'polite' : 'off'} aria-atomic="true">
        {assurances[at].title}. {assurances[at].value}. {assurances[at].note}
      </p>}
    </div>
  )
}
