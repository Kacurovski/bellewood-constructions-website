import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './CycleWord.module.css'

type Props = {
  /** The words to cycle. The first is the resting one. */
  words: readonly string[]
  /** Milliseconds each word is held. */
  hold?: number
  className?: string
}

/**
 * One word of a headline that changes.
 *
 * The box is sized by every word at once, not by the first one.
 *
 * The first version held it open with a hidden copy of `words[0]` and placed
 * the rest absolutely on top. "Heritage homes" is narrower than "Workers'
 * cottages", so the box was too small for half the list and `overflow: hidden`
 * cut the longer ones off mid-letter. Every word is now a ghost in the same
 * grid cell as the live one, so the cell is as wide as the widest and as tall as
 * the tallest and nothing can be clipped by it — whatever the list is changed to
 * later.
 *
 * That only guarantees the box fits the words. It does not guarantee the box
 * fits the column, and it cannot: the words have to be short enough to set on
 * one line at the headline's size. `harness/cycle.mjs` measures the widest word
 * against the column at every breakpoint, and it is the check to run before
 * adding one.
 */
export function CycleWord({ words, hold = 3400, className }: Props) {
  const reduced = useReducedMotion()
  const [i, setI] = useState(0)

  useEffect(() => {
    if (reduced || words.length < 2) return
    const timer = window.setInterval(() => setI((n) => (n + 1) % words.length), hold)
    return () => window.clearInterval(timer)
  }, [reduced, words.length, hold])

  if (reduced) {
    return <span className={[styles.cycle, className].filter(Boolean).join(' ')}>{words[0]}</span>
  }

  return (
    <span className={[styles.cycle, className].filter(Boolean).join(' ')}>
      {/* Every word, in the same cell, holding the box open. They take part in
          layout and nothing else — the grid cell ends up as wide as the widest
          of them, which is the whole point. */}
      {words.map((word) => (
        <span key={word} className={styles.ghost}>
          {word}
        </span>
      ))}

      <span className={styles.window}>
        <AnimatePresence initial={false}>
          <motion.span
            key={i}
            className={styles.word}
            initial={{ y: '105%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-105%' }}
            transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
          >
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}
