import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { SheetRef } from '../components/Sheet'
import { DrawnRule } from '../components/Drawn'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { faq } from '../data/faq'
import styles from './Questions.module.css'

/**
 * Questions.
 *
 * Ten questions, answered plainly, in the voice the rest of the site uses.
 * Copy lives in `src/data/faq.ts` — one file, no markup.
 *
 * SET AS A READING PANE WITH A RUNNING HEAD. On a desk the section is two
 * columns. The right column is the answers, numbered, each under a rule that
 * draws itself in. The left column is sticky and carries three things: a
 * counter, the question the reader is currently on in large type — it
 * crossfades to the next one as the answers scroll past — and beneath it a
 * compact index of all ten, the current one lit, each a link that scrolls
 * its answer into view. A specification's running head, for a page of
 * answers.
 *
 * Which answer is "current" is the one whose top has most recently passed a
 * line a third of the way down the window. That line, not the top edge, so
 * the head changes when the reader's eye reaches the new answer rather than
 * when its heading scrapes the header.
 *
 * On a phone there is no room for a running head, so the question sits over
 * its answer in one column — the same list, read straight down. Under reduced
 * motion the head still tracks the scroll but switches without a fade.
 */
export function Questions({ number = 'E-04' }: { number?: string }) {
  const reduced = useReducedMotion()
  const answers = useRef<(HTMLLIElement | null)[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const line = window.innerHeight * 0.34
      let idx = 0
      answers.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) idx = i
      })
      setActive((cur) => (cur === idx ? cur : idx))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const jump = (i: number) => {
    const el = answers.current[i]
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
  }

  const current = faq[active]

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

        <div className={styles.pane}>
          {/* --- The running head ------------------------------------- */}
          <div className={styles.headCol} aria-hidden="true">
            <div className={styles.sticky}>
              <p className={styles.counter}>
                Question <span className={styles.counterNum}>{String(active + 1).padStart(2, '0')}</span>
                <span className={styles.counterOf}> of {String(faq.length).padStart(2, '0')}</span>
              </p>

              <div className={styles.current}>
                {reduced ? (
                  <p className={styles.currentQ}>{current.q}</p>
                ) : (
                  /* Remounted on change and faded in; no exit animation. An
                     exit-then-enter sequence stalls when the key changes
                     faster than the exit can finish — which is exactly what
                     a fast scroll does — and leaves the head blank. */
                  <motion.p
                    key={active}
                    className={styles.currentQ}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {current.q}
                  </motion.p>
                )}
              </div>

              <ol className={styles.index}>
                {faq.map((item, i) => (
                  <li key={item.q}>
                    <button
                      type="button"
                      className={[styles.indexItem, i === active ? styles.indexActive : '', i < active ? styles.indexPast : ''].join(' ')}
                      onClick={() => jump(i)}
                      tabIndex={-1}
                    >
                      <span className={styles.indexNum}>{String(i + 1).padStart(2, '0')}</span>
                      <span className={styles.indexQ}>{item.q}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* --- The answers ------------------------------------------ */}
          <ol className={styles.list}>
            {faq.map((item, i) => (
              <Reveal key={item.q} as="li" className={styles.item} delay={Math.min(i * 0.03, 0.18)}>
                <div
                  ref={(el) => {
                    answers.current[i] = el as HTMLLIElement | null
                  }}
                  className={styles.anchor}
                />
                <span className={styles.num} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* The question is a real heading for readers and screen
                    readers; on a desk it is visually carried by the running
                    head instead, so it is hidden there and shown on a phone. */}
                <h3 className={styles.q}>{item.q}</h3>
                <div className={styles.answer}>
                  {item.a.map((para) => (
                    <p key={para} className={['small', styles.a].join(' ')}>
                      {para}
                    </p>
                  ))}
                </div>
                <DrawnRule className={styles.rule} delay={0.1 + Math.min(i * 0.03, 0.18)} />
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
