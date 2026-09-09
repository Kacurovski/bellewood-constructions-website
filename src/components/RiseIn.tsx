import { motion } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'

type Props = {
  /** Plain text. Split on spaces, so no markup inside. */
  text: string
  /** Seconds before the first word moves. */
  delay?: number
  className?: string
}

/**
 * A headline that arrives a word at a time, each one rising out of its own
 * line.
 *
 * The rest of the site settles: content fades up a few pixels and looks like it
 * was always there. That is right for a section you scroll to and wrong for the
 * first thing anybody sees, which had no entrance at all — the page simply
 * appeared. This is the one piece of motion on the site that is meant to be
 * noticed.
 *
 * Each word sits in its own overflow-hidden box, so the letters travel out from
 * behind a hard edge rather than fading. Wrapping is untouched: the boxes are
 * inline-block and break between words exactly as the text would.
 *
 * The text stays one string in the DOM — every word is a real text node inside
 * the heading — so this reads and is read aloud as the sentence it is. Under
 * reduced motion it renders as plain text with no wrappers at all.
 */
export function RiseIn({ text, delay = 0, className }: Props) {
  const reduced = useReducedMotion()
  if (reduced) return <span className={className}>{text}</span>

  const words = text.split(' ')

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            // The descenders have to clear the box or they are clipped once the
            // word has landed.
            paddingBottom: '0.12em',
            marginBottom: '-0.12em',
            verticalAlign: 'bottom',
          }}
        >
          <motion.span
            style={{ display: 'inline-block', willChange: 'transform' }}
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{
              duration: 0.95,
              delay: delay + i * 0.055,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
          {/* A real space, outside the moving box, so the words keep their
              spacing while they travel. */}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}
