import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { SheetRef } from '../components/Sheet'
import { RiseIn } from '../components/RiseIn'
import { CycleWord } from '../components/CycleWord'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { contact, site } from '../config/site'
import styles from './Hero.module.css'

import ascot1 from '../assets/projects/ascot-hero-1.jpg'
import ascot2 from '../assets/projects/ascot-hero-2.jpg'
import ascot3 from '../assets/projects/ascot-hero-3.jpg'
import ascot4 from '../assets/projects/ascot-hero-4.jpg'
import ascot5 from '../assets/projects/ascot-hero-5.jpg'

/**
 * The kinds of house that cycle in the headline.
 *
 * Every one of these is a house this business works on and every one already
 * appears in the copy further down the page. Do not add a kind here that the
 * site cannot back up elsewhere — the headline is the one line nobody scrolls
 * past, and it is the worst place on the site to widen a claim.
 */
const HOUSE_KINDS = ['Heritage homes', 'Queenslanders', 'Timber cottages', 'Post-war homes'] as const

/**
 * The five frames of the hero: one finished job, walked through.
 *
 * All five photographs are the Ascot house, in the order a visitor would walk
 * it — in at the front door, through the kitchen and living room, out to the
 * verandah. Each frame says only what its photograph shows; the claims the
 * site cannot back stay off this screen like every other.
 *
 * `side` is where the words sit, chosen per photograph so the veil never
 * covers the thing the photograph is about: the front door and archway are on
 * the right of frame 1, so its words sit left; the verandah opening is on the
 * left of frame 3, so its words sit right; and so on. Check against the
 * actual image before changing one.
 */
type Side = 'left' | 'right'

const FRAMES: { src: string; alt: string; side: Side }[] = [
  {
    src: ascot1,
    alt: 'The entry hall of the Ascot house: a navy front door, an arched hallway in vertical boards, and the living room opening off it.',
    side: 'left',
  },
  {
    src: ascot2,
    alt: 'The Ascot kitchen: white cabinetry, plantation shutters, and a stone-topped island.',
    side: 'right',
  },
  {
    src: ascot3,
    alt: 'The Ascot living room, running in one line of timber floor from the verandah through to the kitchen.',
    side: 'right',
  },
  {
    src: ascot4,
    alt: 'The Ascot verandah, furnished as an outdoor room under a wide boarded ceiling, with the suburb beyond the balustrade.',
    side: 'left',
  },
  {
    src: ascot5,
    alt: 'The far end of the Ascot living room, under a raked boarded ceiling with a bank of highlight windows.',
    side: 'left',
  },
]

/** The words of frames 2–5, indexed frame-1: FRAME_COPY[0] belongs to the
    second photograph. Frame 1 carries the headline and is laid out in JSX. */
const FRAME_COPY: { eyebrow: string; title: string; body: string }[] = [
  {
    eyebrow: 'Ascot — the kitchen',
    title: 'New rooms, finished like the old ones.',
    body: 'A kitchen built to the standard of the house around it — boarded walls, plantation shutters, stone benches.',
  },
  {
    eyebrow: 'Ascot — the living room',
    title: 'Opened right through.',
    body: 'Living, dining and kitchen in one run of timber floor, from the back of the house to the verandah.',
  },
  {
    eyebrow: 'Ascot — the verandah',
    title: 'The biggest room has no walls.',
    body: 'An outdoor room under a wide boarded ceiling, looking over the rooftops of the suburb.',
  },
  {
    eyebrow: 'Ascot — the whole house',
    title: 'One builder, start to finish.',
    body: 'Around four projects a year, taken one at a time. This is what one of them looks like.',
  },
]

/**
 * The hero: one finished house, walked through in five photographs.
 *
 * The band is a track five screens tall with a pinned viewport inside it, and
 * the scroll wheel is the camera dolly. Every visible photograph is always
 * growing as you scroll down — the room you are in pushes slowly towards you,
 * and at each handover the next room rises out of the middle of the current
 * one, small at first and swelling to full frame — so the whole band reads as
 * one continuous move deeper into the house rather than a slideshow. Scroll
 * back up and the camera backs out the way it came.
 *
 * Nothing is animated on a clock. Opacity and scale are pure functions of
 * scroll position, scrubbed through `useTransform`, which is what makes it
 * feel like footage: hold the scroll and the picture holds, creep the scroll
 * and the picture creeps. Only the words run on springs, arriving once per
 * room.
 *
 * This replaced the 3D heritage-study drawing. The drawing argued the
 * proposition as a diagram; the photographs argue it as evidence, which only
 * became possible once the client's own jobs arrived to show.
 *
 * The photographs are bright, white interiors and the header and words are
 * wash-on-green, so each frame carries a Bellewood Green veil on the side the
 * words sit, dense behind the text and gone by mid-frame. The veil swaps
 * sides per frame, chosen so it never sits over the photograph's subject.
 *
 * The first frame is the old hero's words in full — the cycling headline, the
 * lede and both calls — so nothing the headline promised is lost; frames 2–5
 * are one eyebrow, one line and one sentence each, with the final frame
 * repeating the call to the work.
 *
 * For assistive technology the heading is one plain, unchanging sentence, the
 * frame texts are all in the document in order, and the images carry real
 * alt text. Under reduced motion the dolly is retired: the photographs sit at
 * rest and hand over in a short scroll-positioned fade, and the text arrives
 * without travel.
 */

/* How much of a segment the handover occupies, and how far the camera
   travels. The numbers are in room-units: the scroll from one room to the
   next is 1. A handover that starts 0.45 before the next room and lands 0.05
   before it leaves each room just over half a segment to be looked at on its
   own. PUSH is the scale a room reaches by the time the next one has fully
   covered it. A room's scale starts at exactly 1 — full bleed, never
   smaller — because a frame under full bleed shows its own hard edge against
   the room behind it, and the walk collapses into a growing inset picture.
   Every room on screen growing at once is what reads as one camera moving
   forward. */
const BLEND = 0.45
const LANDED = 0.06
const PUSH = 1.22

/**
 * One photograph of the walk, scrubbed by scroll.
 *
 * The layers stack in order, so a room only ever fades IN — the room before
 * it is simply covered, which keeps the handover from dipping to ground in
 * the middle. The wrapper carries the opacity and the veil; the image inside
 * carries the scale, so the veil never zooms.
 */
function HeroLayer({
  frame,
  index,
  progress,
  reduced,
}: {
  frame: (typeof FRAMES)[number]
  index: number
  progress: MotionValue<number>
  reduced: boolean
}) {
  const span = FRAMES.length - 1
  /* Room-units -> progress-units. */
  const at = (t: number) => Math.max(0, Math.min(1, t / span))

  /* The first layer is the floor of the stack and is always lit; under
     reduced motion the fade shortens to a cut-length blend and the scale
     pins to rest. Framer clamps outside the given range. */
  const opacity = useTransform(
    progress,
    index === 0
      ? [0, 1]
      : reduced
        ? [at(index - 0.18), at(index - 0.1)]
        : [at(index - BLEND), at(index - LANDED)],
    index === 0 ? [1, 1] : [0, 1],
  )

  /* From full bleed the moment it starts fading in, to PUSH as the next room
     finishes covering it: one straight line, so the growth never pauses at
     the landing and the move never changes speed mid-room. */
  const scale = useTransform(
    progress,
    [at(index - BLEND), at(index + 1)],
    reduced ? [1, 1] : [1, PUSH],
  )

  return (
    <motion.div
      className={[styles.photo, frame.side === 'right' ? styles.veilRight : styles.veilLeft].join(
        ' ',
      )}
      style={{ opacity }}
    >
      <motion.img
        src={frame.src}
        alt={frame.alt}
        className={styles.img}
        style={{ scale }}
        decoding="async"
        {...(index === 0 ? { fetchpriority: 'high' as const } : {})}
      />
    </motion.div>
  )
}
export function Hero() {
  const track = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [frame, setFrame] = useState(0)

  const { scrollYProgress } = useScroll({
    target: track,
    offset: ['start start', 'end end'],
  })

  /* Which room the words belong to. The walk is continuous, so the words
     change hands in the middle of a handover — when the incoming room is the
     one you are mostly looking at. */
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const t = v * (FRAMES.length - 1)
    /* floor(t + c) steps up at t = i - c; c of half the blend window puts the
       step at the middle of the handover. */
    const next = Math.max(0, Math.min(FRAMES.length - 1, Math.floor(t + (BLEND + LANDED) / 2)))
    setFrame(next)
  })

  /* The remounting text block shares one entrance. Under reduced motion it
     renders in place with no travel. */
  const enter = reduced
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 28 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
      }

  return (
    <section
      ref={track}
      className={['on-green', styles.hero].join(' ')}
      aria-labelledby="hero-heading"
    >
      <div className={styles.pin}>
        {/* The rooms, stacked in walking order and scrubbed by scroll. Every
            frame is in the DOM from the start, so there is never a flash of
            ground while a new image decodes. */}
        {FRAMES.map((f, i) => (
          <HeroLayer key={f.src} frame={f} index={i} progress={scrollYProgress} reduced={reduced} />
        ))}

        {/* The veils: green behind the words, a scrim up top so the header
            reads, a breath of ground at the foot for the frame counter. */}
        <div className={styles.topScrim} aria-hidden="true" />
        <div className={styles.footScrim} aria-hidden="true" />

        <div className={['shell', styles.inner].join(' ')}>
          <SheetRef number="A-01" name="Heritage study" className={styles.ref} />

          <div
            className={[
              styles.body,
              FRAMES[frame].side === 'right' ? styles.bodyRight : '',
            ].join(' ')}
          >
            {/* One frame of words at a time. Keyed on the frame so each change
                is a fresh entrance; no AnimatePresence, so a fast scroll can
                never queue exits. The h1 below is the whole sentence for
                anything reading without eyes, mounted once and never changed. */}
            <h1 id="hero-heading" className="visually-hidden">
              Heritage homes in inner Brisbane, rebuilt in timber.
            </h1>

            {frame === 0 ? (
              <motion.div key="frame-0" className={styles.copy} {...enter}>
                <p className={styles.heading} aria-hidden="true">
                  <CycleWord words={HOUSE_KINDS} className={styles.cycle} />
                  <RiseIn text="in inner Brisbane, rebuilt in timber." delay={0.15} />
                </p>

                <p className={[styles.lede, 'lead'].join(' ')}>
                  {site.description} Around four projects a year, taken one at a time.
                </p>

                <div className={styles.actions}>
                  <Link to="/work" className="btn">
                    See the work
                  </Link>
                  <a href={contact.phoneHref} className={['link-underline', styles.call].join(' ')}>
                    {contact.phone}
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div key={`frame-${frame}`} className={styles.copy} {...enter}>
                <p className={styles.eyebrow}>{FRAME_COPY[frame - 1].eyebrow}</p>
                <p className={styles.frameTitle}>{FRAME_COPY[frame - 1].title}</p>
                <p className={styles.frameBody}>{FRAME_COPY[frame - 1].body}</p>
                {frame === FRAMES.length - 1 && (
                  <div className={styles.actions}>
                    <Link to="/work" className="btn">
                      See the work
                    </Link>
                    <a href={contact.phoneHref} className={['link-underline', styles.call].join(' ')}>
                      {contact.phone}
                    </a>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Where the walk is up to. The meter is the page's own convention —
              a counter and a filling rail, the same one the phone sliders
              carry. */}
          <div className={styles.meter} aria-hidden="true">
            <span className={styles.meterCount}>
              {String(frame + 1).padStart(2, '0')} / {String(FRAMES.length).padStart(2, '0')}
            </span>
            <span className={styles.meterRail}>
              <span
                className={styles.meterFill}
                style={{ transform: `scaleX(${(frame + 1) / FRAMES.length})` }}
              />
            </span>
            <span className={styles.meterHint}>Scroll</span>
          </div>
        </div>

        {/* The frame texts again, in order, as plain document content for
            anything that does not scroll — screen readers and search read the
            whole walk even though a sighted visitor sees one frame at a time. */}
        <div className="visually-hidden">
          {FRAME_COPY.map((c) => (
            <p key={c.eyebrow}>
              {c.title} {c.body}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
