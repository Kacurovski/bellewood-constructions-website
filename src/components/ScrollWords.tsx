import { useRef } from 'react'
import type { MotionValue } from 'framer-motion'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './ScrollWords.module.css'

type Props = {
  /**
   * The statement. Wrap a phrase in asterisks to set it in the accent — e.g.
   * `a post-war home *worth keeping*`. Everything else is ink.
   */
  text: string
  /** `h2` when the statement is the section's heading, which it usually is. */
  as?: 'p' | 'h2'
  id?: string
  className?: string
}

/**
 * A statement that reads itself in as you scroll.
 *
 * Every word starts nearly out and comes up to full weight as the section
 * crosses the screen, one after another, so the sentence arrives at the pace
 * somebody would read it at. It is the one long piece of prose on the home page
 * and this is what makes it worth stopping for.
 *
 * Two things keep it honest. The words are real text in the DOM in reading
 * order, so it is selectable, searchable and read aloud as the sentence it is —
 * the animation is opacity and nothing else. And under reduced motion every
 * word renders at full weight with no scroll listener at all: a statement you
 * cannot read until you have scrolled far enough is not a statement, it is a
 * puzzle.
 */
export function ScrollWords({ text, as = 'p', id, className }: Props) {
  const ref = useRef<HTMLParagraphElement & HTMLHeadingElement>(null)
  const Tag = as
  const MotionTag = motion[as]
  const reduced = useReducedMotion()

  // Starts as the block enters the lower part of the screen and finishes before
  // it leaves the upper part, so the last word lands while the sentence is
  // still comfortably in view rather than on its way off the top.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.55'],
  })

  // Asterisks mark the accent. Odd segments are accented, even are not.
  //
  // The space goes BEFORE each word rather than after it. Closing punctuation
  // that follows an accented phrase lands at the start of the next segment and
  // so becomes a word of its own — with a trailing space on the word before it,
  // that set "worth keeping ." with a gap in front of the full stop.
  const segments = text.split('*')
  const words: { word: string; accent: boolean; space: boolean }[] = []
  segments.forEach((segment, s) => {
    for (const word of segment.split(/\s+/).filter(Boolean)) {
      words.push({
        word,
        accent: s % 2 === 1,
        space: words.length > 0 && !/^[.,;:!?)\]]+$/.test(word),
      })
    }
  })

  if (reduced) {
    return (
      <Tag id={id} ref={ref} className={[styles.statement, className].filter(Boolean).join(' ')}>
        {words.map((w, i) => (
          <span key={i} className={w.accent ? styles.accent : undefined}>
            {w.space ? ' ' : ''}
            {w.word}
          </span>
        ))}
      </Tag>
    )
  }

  return (
    <MotionTag
      id={id}
      ref={ref}
      className={[styles.statement, className].filter(Boolean).join(' ')}
    >
      {words.map((w, i) => (
        <Word
          key={i}
          progress={scrollYProgress}
          // Each word owns a slice of the scroll, and the slices overlap by half
          // so the sentence comes up as a wave rather than as a row of switches.
          range={[i / words.length, (i + 1.6) / words.length]}
          accent={w.accent}
        >
          {w.space ? ' ' : ''}
          {w.word}
        </Word>
      ))}
    </MotionTag>
  )
}

/**
 * One word. A component of its own because it needs a hook, and a hook cannot
 * live inside a loop in the parent.
 */
function Word({
  children,
  progress,
  range,
  accent,
}: {
  children: React.ReactNode
  progress: MotionValue<number>
  range: [number, number]
  accent: boolean
}) {
  const opacity = useTransform(progress, range, [0.14, 1])

  return (
    <motion.span style={{ opacity }} className={accent ? styles.accent : undefined}>
      {children}
    </motion.span>
  )
}
