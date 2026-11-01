import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { ImageSlot } from './ImageSlot'
import { stills } from '../data/projects'
import { contact } from '../config/site'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './BuilderFolioTest.module.css'

const sheets = [
  { label: 'The builder', title: 'One builder. One conversation.', note: contact.principal + ' / Director', body: 'The person who looks at your house is the person who prices it, and the person on site while it is being built.', foot: 'Personally involved', to: '/contact', action: 'Talk with Angus' },
  { label: 'The material', title: 'Character, carried in timber.', note: 'Renovations / Extensions / Restorations', body: 'Predominantly timber. Care for the weatherboards, the verandahs and the details that make an older Brisbane house its own.', foot: 'Built with care', to: '/work', action: 'Explore the homes' },
  { label: 'The approach', title: 'Drawn carefully. Built carefully.', note: 'A small number of projects', body: 'Around four projects a year. Drawings followed carefully, with questions taken back to the architect while they are still questions.', foot: 'Time for the details', to: '/approach', action: 'See the approach' },
]

/** Illustrative architectural notation, not project drawings or measured plans. */
function FolioDrawing({ index }: { index: number }) {
  return <svg className={styles.drawing} viewBox="0 0 360 200" fill="none" aria-hidden="true">
    <g className={styles.guides} stroke="currentColor" strokeWidth="0.6">
      <path d="M12 174H348M30 18V188M330 18V188M12 26H348" strokeDasharray="2 6" />
      <path d="M25 174h10m-5-5v10m295-5h10m-5-5v10" />
    </g>
    <g stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" strokeLinecap="round">
      {index === 0 && <>
        <path d="M47 83L180 29L313 83H47ZM67 83V174M293 83V174M47 174H313M75 96H285M75 142H285M75 150H285" />
        <path d="M87 83V174M133 83V174M227 83V174M273 83V174M151 174V107H209V174M180 107V174M157 114H173V137H157ZM187 114H203V137H187Z" />
        <path d="M95 104H123V133H95ZM237 104H265V133H237ZM109 104V133M251 104V133M95 118H123M237 118H265" />
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${91+i*10} 150v24M${229+i*10} 150v24`} />)}
        <path d="M143 181H217M137 188H223M180 29V58M110 66H250" />
      </>}
      {index === 1 && <>
        <path d="M74 115L178 54L286 116L182 177Z" />
        <path d="M74 115V135L182 197L286 136V116M182 177V197" />
        <path d="M135 80V44L179 18L224 44V81M135 44L179 70L224 44M179 70V105L160 116L137 103M179 105L201 118L224 105V81" />
        <path d="M91 115L147 82M103 122L153 93M116 130L151 109M211 142L267 110M199 150L253 118M187 157L239 127" opacity="0.5" />
        <path d="M37 104L67 87M39 100L35 108M65 83L69 91M300 117L322 130M299 113L301 121M321 126L323 134" />
      </>}
      {index === 2 && <>
        <path d="M85 46H273V163H85ZM91 52H267V157H91ZM91 103H167V157M173 52V112H267M173 118V157M91 97H167V52M211 118V157" />
        <path d="M117 157V133A24 24 0 0 1 141 157M173 72H195A22 22 0 0 1 173 94M229 118V140A22 22 0 0 0 251 118" strokeWidth="0.7" />
        <path d="M101 67H152V84H101ZM188 60H253V80H188ZM223 132H255V148H223ZM99 113H122V131H99Z" opacity="0.5" />
        <path d="M85 34H273M85 29V39M273 29V39M285 46V163M280 46H290M280 163H290M62 181V145M57 153L62 145L67 153" />
        <circle cx="62" cy="181" r="3" />
      </>}
    </g>
  </svg>
}

export function BuilderFolioTest() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref, { once: true, amount: 0.35 })
  const introduced = useRef(false)
  const [photo, setPhoto] = useState(false)
  const [open, setOpen] = useState(reduced)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reduced) { setOpen(true); return }
    if (!seen || introduced.current) return
    introduced.current = true
    const timer = window.setTimeout(() => {
      if (!ref.current?.contains(document.activeElement)) setOpen(true)
    }, 1300)
    return () => window.clearTimeout(timer)
  }, [seen, reduced])

  return <div ref={ref} id="builder-folio-test" className={styles.test}>
    <div className={styles.previewBar}>
      <span>About study / Test</span>
      <button type="button" aria-pressed={photo} onClick={() => setPhoto(!photo)}>{photo ? 'View folio' : 'Original photo'} <span aria-hidden="true">&#8599;</span></button>
    </div>
    {photo ? <ImageSlot slot={stills.onSite} ratio="4 / 5" tone="green" /> : <>
      <div className={styles.folio} aria-label="The Bellewood builder's folio">
        <div className={styles.binding} aria-hidden="true"><span>Bellewood / Field notes</span></div>
        <div className={styles.paperBack} aria-hidden="true" />
        <div className={styles.paperMiddle} aria-hidden="true" />
        <div className={styles.sheet} aria-hidden={!open}>
          <div className={styles.sheetMeta}><span>{sheets[active].label}</span><span>0{active + 1} / 03</span></div>
          <motion.div key={active} aria-live="polite" aria-atomic="true" initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
            <p className={styles.sheetNote}>{sheets[active].note}</p>
            <h2 className={styles.title}>{sheets[active].title}</h2>
            <FolioDrawing index={active} />
            <p className={styles.body}>{sheets[active].body}</p>
            <Link className={styles.sheetLink} to={sheets[active].to} tabIndex={open ? 0 : -1}>{sheets[active].action}<span aria-hidden="true">&#8599;</span></Link>
          </motion.div>
          <div className={styles.sheetFoot}><span>{sheets[active].foot}</span><span>Illustrative study</span></div>
        </div>
        <motion.div className={styles.cover} initial={false} animate={{ y: open ? '-105%' : '0%' }} transition={{ duration: reduced ? 0 : 1.3, ease: [0.76, 0, 0.24, 1] }} aria-hidden={open}>
          <Logo tone="reverse" width={180} />
          <div className={styles.coverRule} />
          <div className={styles.coverCopy}><span>The builder's folio</span><p>A personal<br /><em>way to build.</em></p></div>
          <button type="button" tabIndex={open ? -1 : 0} onClick={() => setOpen(true)}>Open the folio<span aria-hidden="true">&#8599;</span></button>
          <span className={styles.coverFine}>Brisbane / Timber / Character</span>
        </motion.div>
      </div>
      <div className={styles.controls} role="group" aria-label="Choose a folio sheet">
        {sheets.map((sheet, index) => <button key={sheet.label} type="button" aria-pressed={open && active === index} onClick={() => { setActive(index); setOpen(true) }}><span>0{index + 1}</span>{sheet.label.replace('The ', '')}</button>)}
      </div>
      <div className={styles.footer}><span>Three notes on how we build.</span><button type="button" onClick={() => setOpen(!open)}>{open ? 'Close folio' : 'Open folio'}<span aria-hidden="true">{open ? '\u2212' : '+'}</span></button></div>
    </>}
  </div>
}
