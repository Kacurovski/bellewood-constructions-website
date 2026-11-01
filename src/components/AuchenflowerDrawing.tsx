import { useId, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './AuchenflowerDrawing.module.css'

/** An illustrated elevation interpreted from the supplied Auchenflower photo.
 * Recognisable features: the tall verandah gable, curved bargeboards, smaller
 * right-hand gable, weatherboard wing and open lower terrace. Not a building plan.
 */
function Sash({ x, y, width, height, hood = false }: {
  x: number; y: number; width: number; height: number; hood?: boolean
}) {
  return (
    <g className={styles.window}>
      <rect x={x - 4} y={y - 4} width={width + 8} height={height + 8} />
      <rect x={x} y={y} width={width} height={height} />
      <path d={`M${x} ${y + height / 2}h${width} M${x + width / 2} ${y}v${height}`} />
      <path d={`M${x + width / 4} ${y}v${height / 2} M${x + width * 0.75} ${y}v${height / 2}`} />
      <path d={`M${x - 7} ${y + height + 5}h${width + 14}`} />
      {hood && <>
        <path d={`M${x - 8} ${y - 17}h${width + 12}l12 12h${-width - 27}z`} />
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${x - 5 + i * width / 11} ${y - 17}l7 12`} className={styles.fine} />)}
        <path d={`M${x - 4} ${y - 5}v11l9 -11 M${x + width + 2} ${y - 5}v11l-9 -11`} />
      </>}
    </g>
  )
}

export function AuchenflowerDrawing() {
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref, { once: true, amount: 0.3 })
  const reduced = useReducedMotion()
  const id = useId()
  const reveal = (delay: number) => ({
    initial: reduced ? false as const : { opacity: 0 },
    animate: { opacity: reduced || seen ? 1 : 0 },
    transition: { duration: reduced ? 0 : 0.9, delay: reduced ? 0 : delay },
  })
  const draw = (delay: number) => ({
    initial: reduced ? false as const : { pathLength: 0, opacity: 0 },
    animate: { pathLength: reduced || seen ? 1 : 0, opacity: reduced || seen ? 1 : 0 },
    transition: { duration: reduced ? 0 : 1.8, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
  })
  return (
    <div ref={ref} className={styles.drawing}>
      <svg viewBox="0 0 900 610" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>Auchenflower architectural elevation study</title>
        <desc id={`${id}-desc`}>A line illustration based on the photographed house: a tall gabled verandah over an open terrace, beside a smaller gabled weatherboard wing.</desc>
        <g className={styles.guides} aria-hidden="true">
          <path d="M72 152H856 M72 350H856 M72 541H856 M132 45V564 M522 45V564 M808 239V564" />
          <path d="M73 570H852 M80 563l-14 14 M859 563l-14 14" />
        </g>
        <motion.g {...reveal(0.15)}>
          <path className={styles.wash} d="M140 351H519V390H140z M540 291H817V314H540z" />
          <path className={styles.wall} d="M531 289H809V539H531z" />
          <path className={styles.wall} d="M173 390H496V533H173z" />
          <g className={styles.cladding}>
            {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M532 ${299 + i * 10}H808`} />)}
            {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M174 ${400 + i * 9}H496`} />)}
          </g>
        </motion.g>
        <motion.g {...reveal(0.5)} className={styles.structure}>
          <path className={styles.wall} d="M543 289L680 236L827 289V306H543z" />
          <path d="M543 289L680 236L827 289 M549 295L680 244L821 295" />
          <path className={styles.fine} d="M573 282H790 M594 274H768 M617 266H747" />
          <path className={styles.wall} d="M573 306Q564 289 588 279L680 250L774 280Q796 290 790 306L780 302Q781 295 764 290L680 264L597 290Q579 296 583 302z" />
          <path d="M525 307H558 M529 314H558" />
          <Sash x={561} y={326} width={56} height={65} />
          <Sash x={688} y={326} width={88} height={66} hood />
          <Sash x={560} y={454} width={59} height={65} />
          <Sash x={689} y={452} width={86} height={65} hood />
          <path d="M642 309V540 M647 309V540 M809 309V540" />
          <path d="M643 311l5 -12h13 M648 311l5 -12h10" />
        </motion.g>
        <motion.g {...reveal(0.7)} className={styles.structure}>
          <path className={styles.wall} d="M196 417H475V532H196z" />
          <path d="M203 423H468V526H203z M264 423V526 M338 423V526 M410 423V526 M203 449H468" />
          <path className={styles.fine} d="M215 423V449 M239 423V449 M283 423V449 M309 423V449 M358 423V449 M384 423V449 M430 423V449 M452 423V449" />
          <path className={styles.fine} d="M265 478h4 M335 478h-4 M411 478h4" />
          <path className={styles.wall} d="M168 185H493V329H168z" />
          <path className={styles.fine} d="M179 197H483 M179 209H483 M179 221H483 M179 233H483 M179 245H483 M179 257H483" />
          <Sash x={224} y={209} width={76} height={101} />
          <Sash x={365} y={209} width={76} height={101} />
          <path d="M147 183L172 197V329L147 340 M505 186L492 197" />
        </motion.g>
        <motion.g {...reveal(0.1)}>
          <path className={styles.roofFill} d="M89 146L322 49L558 146L548 157L322 65L99 158z" />
          <path className={styles.wall} d="M102 158L322 65L545 158V178H102z" />
          <g className={styles.cladding}>
            <path d="M142 148H506 M169 137H480 M196 126H454 M222 115H427 M249 104H399 M276 93H372" />
          </g>
          <path className={styles.wall} d="M154 179Q140 151 180 132L322 78L467 133Q507 151 493 179L481 175Q489 161 456 149L322 97L191 149Q158 162 166 175z" />
        </motion.g>
        <motion.path className={styles.outline} d="M89 146L322 49L558 146L548 157 M102 158L322 65L545 158 M102 178H545" {...draw(0)} />
        <motion.path className={styles.outline} d="M133 179V535 M143 179V535 M512 179V535 M522 179V535 M132 338H523 M132 351H523 M132 391H523" {...draw(0.3)} />
        <motion.g {...reveal(1.05)} className={styles.joinery}>
          <path className={styles.wall} d="M143 278H512V286H143z M143 330H512V338H143z" />
          {Array.from({ length: 34 }, (_, i) => <path key={i} d={`M${151 + i * 10.6} 286V330`} />)}
          <path className={styles.wall} d="M317 263H326V338H317z" />
          <path className={styles.wall} d="M143 363H512V369H143z M143 385H512V391H143z" />
          {Array.from({ length: 32 }, (_, i) => <path key={i} d={`M${150 + i * 11.4} 369V385`} />)}
          <path d="M143 198h16v-19 M143 217q21 -3 21 -27 M512 198h-16v-19 M512 217q-21 -3 -21 -27" />
          <path d="M147 286l22 -13 M147 330l22 -10" />
          <path className={styles.fine} d="M152 285v43 M158 281v45 M164 278v45" />
          <path d="M126 533h25 M504 533h26 M127 538h23 M506 538h23" />
        </motion.g>
        <motion.path className={styles.outline} d="M119 540H817 M119 545H817 M531 539V314" {...draw(0.6)} />
        <motion.g {...reveal(1.5)} className={styles.landscape}>
          <path d="M87 549H836 M178 551l-24 12 M602 551l26 12 M654 551l32 12" />
          <path d="M96 534q-10 -17 3 -23q-5 -14 10 -15q12 -11 20 0 M826 536q-13 -16 -3 -24q-7 -12 9 -17q16 -11 21 4q14 3 10 15" />
        </motion.g>
      </svg>
      <span className={styles.register} aria-hidden="true"><span>Auchenflower</span><span>Elevation study / 01</span></span>
    </div>
  )
}
