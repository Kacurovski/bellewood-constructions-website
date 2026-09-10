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

/** A space cannot be an inline-block on its own; a collapsed one closes the gap. */
const glyphs = (word: string) => [...word].map((g) => (g === ' ' ? ' ' : g))

/**
 * One word of a headline that changes.
 *
 * The change is per letter: the arriving word's letters rise out from behind the
 * clip in reading order while the leaving word's are drawn up out of it in the
 * same order, so the word is written and unwritten rather than flipped like a
 * sign.
 *
 * **The hidden copies that size the box are built the same way, letter by
 * letter, and that is not cosmetic.** A run of text is kerned — the pairs inside
 * "Post-war homes" sit tighter than the sum of their glyphs. Split into one
 * inline-block per letter, every pair becomes a separate box and the kerning is
 * gone, so the live word is measurably WIDER than the same string set as a run.
 * Ghosts made of plain text sized the box to the kerned width, the live word
 * overflowed it, and that is the "s" cut off the end of "Post-war homes". Both
 * sides have to be built identically or the box measures the wrong thing.
 *
 * The box is also sized by every word at once rather than by the first, which
 * was the earlier version of the same bug.
 *
 * That only guarantees the box fits the words. It does not guarantee the box
 * fits the column: the words must be short enough to set on one line at the
 * headline's size. `harness/cycle.mjs` measures the LIVE word against the column
 * at thirteen widths and fails under 16px of clearance. Run it after touching
 * this list, the face, or the headline's clamp.
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
    return (
      <span className={[styles.cycle, className].filter(Boolean).join(' ')}>
        <span className={styles.window} data-live="">
          {words[0]}
        </span>
      </span>
    )
  }

  return (
    <span className={[styles.cycle, className].filter(Boolean).join(' ')}>
      {/* The sizing copies. Same structure as the live word, letter for letter,
          so the box they build is the box it needs. */}
      {words.map((word) => (
        <span key={word} className={styles.ghost} data-ghost="">
          {glyphs(word).map((glyph, n) => (
            <span key={n} className={styles.letter}>
              {glyph}
            </span>
          ))}
        </span>
      ))}

      <span className={styles.window}>
        <AnimatePresence initial={false}>
          <motion.span
            key={i}
            className={styles.word}
            data-live=""
            initial="enter"
            animate="on"
            exit="off"
            variants={{
              // Reading order in and reading order out, so the word is always
              // being written left to right.
              on: { transition: { staggerChildren: 0.026 } },
              off: { transition: { staggerChildren: 0.016 } },
            }}
          >
            {glyphs(words[i]).map((glyph, n) => (
              <motion.span key={n} className={styles.letter} variants={LETTER}>
                {glyph}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}
