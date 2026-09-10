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
 * On this site it carries the kind of house, and the list is not decoration —
 * "a worker's cottage, a Queenslander, a post-war home" is already the sentence
 * further down the page. Cycling them in the headline is the same claim made as
 * range: this builder works on all of these, and the visitor sees their own
 * house named inside eight seconds.
 *
 * Three things keep it from being a gimmick.
 *
 * It never moves the layout. The word is a block on its own line inside a box
 * of a fixed height, and each one is absolutely positioned in it, so a long word
 * following a short one cannot reflow the two lines underneath. It rises out
 * from behind a hard edge, which is the same entrance the headline itself uses.
 *
 * It is `aria-hidden`, and the heading carries a plain, complete, unchanging
 * sentence for assistive technology and for search. Nothing that reads this page
 * without eyes gets a headline that mutates under it.
 *
 * And under reduced motion it does not cycle at all — it prints the first word
 * and stops. A headline that will not hold still is the exact thing that setting
 * is there to switch off.
 */
export function CycleWord({ words, hold = 3200, className }: Props) {
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
      {/* Holds the box open. The tallest word decides the height and no word
          decides the width, so nothing below this line ever moves. */}
      <span className={styles.sizer}>{words[0]}</span>

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
  )
}
