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
 * One letter's part in the change.
 *
 * In on a weighted ease that decelerates hard, out on one that accelerates —
 * so the arriving word settles and the leaving one is taken away. The same
 * curve both ways reads as a conveyor belt.
 */
const LETTER = {
  enter: { y: '110%' },
  on: { y: '0%', transition: { duration: 0.66, ease: [0.16, 1, 0.3, 1] } },
  off: { y: '-110%', transition: { duration: 0.46, ease: [0.7, 0, 0.84, 0] } },
} as const

/**
 * One word of a headline that changes.
 *
 * The change is per letter, not per word. The letters of the arriving word rise
 * out from behind the clip in reading order while the leaving word's letters are
 * drawn up out of it in the same order, so the word is written and unwritten
 * rather than flipped like a sign. It is the same entrance the headline itself
 * uses, one level finer.
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
            initial="enter"
            animate="on"
            exit="off"
            variants={{
              // The letters go in reading order coming in and in reading order
              // going out, so the word is always being written and unwritten
              // left to right rather than flipping like a sign.
              on: { transition: { staggerChildren: 0.026 } },
              off: { transition: { staggerChildren: 0.016 } },
            }}
          >
            {[...words[i]].map((glyph, n) => (
              <motion.span
                key={n}
                className={styles.letter}
                variants={LETTER}
                // A space cannot be an inline-block on its own, and a collapsed
                // one would close the gap between the halves of the word.
                style={glyph === ' ' ? { width: '0.28em' } : undefined}
              >
                {glyph === ' ' ? ' ' : glyph}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}
