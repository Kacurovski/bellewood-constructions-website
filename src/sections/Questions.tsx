import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { faq } from '../data/faq'
import styles from './Questions.module.css'

/**
 * Questions.
 *
 * Ten questions, answered plainly, in the voice the rest of the site uses.
 * Copy lives in `src/data/faq.ts` — one file, no markup.
 *
 * ONE QUESTION, ONE ANSWER. On a desk the questions are a list down the left
 * and the answer to the chosen one fills the right. Choose a question and the
 * marker slides to it, the answer crossfades in under its own heading, and a
 * link at its foot goes to the next. Arrow keys move through the list. There
 * is never any matching of numbers across columns to know what you are
 * reading: the question you chose is the heading over the answer you get.
 *
 * On a phone the two columns become one accordion, one answer open at a time,
 * the question as the button. Same state, same copy.
 *
 * The earlier version scrolled all ten answers past a sticky index. It was
 * clever and it was unclear: the answers carried no headings, so the reader
 * had to check the number. This trades the scroll-linking for legibility.
 */
export function Questions({ number = 'E-04' }: { number?: string }) {
  const reduced = useReducedMotion()
  const id = useId()
  const [active, setActive] = useState(0)
  const [narrow, setNarrow] = useState(false)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    const on = () => setNarrow(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const go = (i: number, focus = false) => {
    const n = (i + faq.length) % faq.length
    setActive(n)
    if (focus) tabs.current[n]?.focus()
  }

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      go(i + 1, true)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      go(i - 1, true)
    } else if (e.key === 'Home') {
      e.preventDefault()
      go(0, true)
    } else if (e.key === 'End') {
      e.preventDefault()
      go(faq.length - 1, true)
    }
  }

  const current = faq[active]
  const pad = (n: number) => String(n + 1).padStart(2, '0')

  /* --- The answer, shared by both layouts ------------------------------- */
  const Answer = ({ i, heading }: { i: number; heading: boolean }) => {
    const item = faq[i]
    const body = (
      <>
        {heading && <h3 className={styles.answerQ}>{item.q}</h3>}
        {item.a.map((para) => (
          <p key={para} className={styles.answerP}>
            {para}
          </p>
        ))}
        {!narrow && (
          <button type="button" className={styles.next} onClick={() => go(i + 1, true)}>
            <span className={styles.nextLabel}>Next</span>
            <span className={styles.nextQ}>{faq[(i + 1) % faq.length].q}</span>
            <span className={styles.nextArrow} aria-hidden="true">
              →
            </span>
          </button>
        )}
      </>
    )
    if (reduced) return <div className={styles.answerInner}>{body}</div>
    return (
      <motion.div
        key={i}
        className={styles.answerInner}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {body}
      </motion.div>
    )
  }

  return (
    <section className={['section', styles.section].join(' ')} aria-labelledby="questions-heading">
      <div className="shell">
        <Reveal className={styles.head}>
          <SheetRef
            number={number}
            name={
              <h2 id="questions-heading" className={styles.heading}>
                Questions we get asked
              </h2>
            }
            note="Before you ring a builder"
            rule={false}
          />
        </Reveal>

        {narrow ? (
          /* --- One column: an accordion, one open at a time --------------- */
          <Reveal className={styles.accordion}>
            {faq.map((item, i) => {
              const open = i === active
              return (
                <div key={item.q} className={[styles.accItem, open ? styles.accOpen : ''].join(' ')}>
                  <button
                    type="button"
                    className={styles.accBtn}
                    aria-expanded={open}
                    aria-controls={`${id}-acc-${i}`}
                    onClick={() => setActive(open ? -1 : i)}
                  >
                    <span className={styles.accNum}>{pad(i)}</span>
                    <span className={styles.accQ}>{item.q}</span>
                    <span className={styles.accMark} aria-hidden="true" />
                  </button>
                  <div id={`${id}-acc-${i}`} className={styles.accPanel} hidden={!open}>
                    {open && <Answer i={i} heading={false} />}
                  </div>
                </div>
              )
            })}
          </Reveal>
        ) : (
          /* --- Two columns: a list that selects, one answer -------------- */
          <div className={styles.pane}>
            <Reveal className={styles.listCol}>
              <ol className={styles.list} role="tablist" aria-orientation="vertical" aria-label="Questions">
                {faq.map((item, i) => {
                  const on = i === active
                  return (
                    <li key={item.q} className={styles.listItem}>
                      <button
                        ref={(el) => {
                          tabs.current[i] = el
                        }}
                        type="button"
                        role="tab"
                        id={`${id}-tab-${i}`}
                        aria-selected={on}
                        aria-controls={`${id}-panel`}
                        tabIndex={on ? 0 : -1}
                        className={[styles.tab, on ? styles.tabOn : ''].join(' ')}
                        onClick={() => go(i)}
                        onKeyDown={(e) => onKey(e, i)}
                      >
                        {on &&
                          (reduced ? (
                            <span className={styles.marker} aria-hidden="true" />
                          ) : (
                            <motion.span
                              layoutId={`${id}-marker`}
                              className={styles.marker}
                              aria-hidden="true"
                              transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 0.8 }}
                            />
                          ))}
                        <span className={styles.tabNum}>{pad(i)}</span>
                        <span className={styles.tabQ}>{item.q}</span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </Reveal>

            <Reveal delay={0.08} className={styles.answerCol}>
              <div
                id={`${id}-panel`}
                role="tabpanel"
                aria-labelledby={`${id}-tab-${active}`}
                className={styles.answer}
              >
                <span className={styles.watermark} aria-hidden="true">
                  {pad(active)}
                </span>
                <p className={styles.counter}>
                  <span className={styles.counterNum}>{pad(active)}</span> / {String(faq.length).padStart(2, '0')}
                </p>
                <Answer key={current.q} i={active} heading />
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  )
}
