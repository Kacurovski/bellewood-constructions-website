import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import type { MotionValue } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import hotspotStyles from './HeritageHotspots.module.css'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {

  HERITAGE_GROUND,
  HERITAGE_MEMBERS,
  HERITAGE_OFFSET,
  HERITAGE_YAW,
} from './heritageMembers'
import type { Member } from './heritageMembers'
import { GLASS_EMISSIVE, MATERIALS, MATERIAL_KEYS } from './materials'
import type { MaterialKey } from './materials'
import {
  heritageFocusGroups,
  heritageMaquetteFrame,
  MAQUETTE_EYE,
  MAQUETTE_FOCUS_COLOURS,
  MAQUETTE_MATERIALS,
  MAQUETTE_MEMBERS,
  MAQUETTE_OFFSET,
  MAQUETTE_TARGET,
  MAQUETTE_YAW,
} from './heritageMaquette'
import type { HeritageFocus, HeritagePresentation } from './heritageMaquette'
import { isStudyAddition, STUDY_ADDITION_REVEAL, STUDY_POINTER_MOTION } from './studyEvolution'

/**
 * Scene 1 — the heritage study, in the hero.
 *
 * A Queenslander with a contemporary extension on the back: stumps,
 * weatherboards, a gable to the street, a verandah, lights on — and behind it a
 * wing in dark charred timber and glass. Heritage homes, rebuilt.
 *
 * It turns about twelve degrees either side of centre on a very slow sine and
 * leans towards the pointer. No orbit controls and no camera moves: it should
 * read as an object being considered on a table, not as a product viewer.
 *
 * Nothing about the building changes shape, so every member is baked at its true
 * size into one merged geometry per material — six draw calls, and every edge
 * gets a real fillet. Instancing would force one shared box scaled per member,
 * which distorts a fillet the moment the scale is not uniform.
 */

/** Edges are filleted, which is most of what separates a render from a diagram. */
const FILLET = 0.012

const EASE = 0.075
const DRIFT = 0.21

/** Optional controls used only by the temporary Approach-page concept. */
export type HeritagePart = 'original' | 'extension' | 'verandah'
const EXPLORE_POINTS: { id: HeritagePart; label: string; point: [number, number, number] }[] = [
  { id: 'original', label: 'Original house', point: [2.8, 3.8, 0.8] },
  { id: 'extension', label: 'New possibilities', point: [2.55, 3.1, -4.1] },
  { id: 'verandah', label: 'The verandah', point: [-1.4, 2.5, 4.35] },
]


function buildGeometries(
  groupBy: (member: Member) => string = (member) => member.mat,
  members: Member[] = HERITAGE_MEMBERS,
  order: THREE.EulerOrder = 'ZXY',
) {
  const buckets: Record<string, THREE.BufferGeometry[]> = {}

  const matrix = new THREE.Matrix4()
  const position = new THREE.Vector3()
  const quaternion = new THREE.Quaternion()
  const one = new THREE.Vector3(1, 1, 1)
  const euler = new THREE.Euler()

  for (const m of members) {
    const smallest = Math.min(m.s[0], m.s[1], m.s[2])
    // A radius at or past half the smallest side degenerates the geometry.
    const radius = Math.min(FILLET, smallest * 0.3)

    const geometry = new RoundedBoxGeometry(m.s[0], m.s[1], m.s[2], 1, radius)

    // New study beams are authored roll-then-pitch: Rx * Rz ('XYZ' with y=0).
    // Keep legacy geometry's original Euler order unchanged.
    euler.set(m.rx, 0, m.rz ?? 0, order)
    quaternion.setFromEuler(euler)
    position.set(m.p[0], m.p[1], m.p[2])
    matrix.compose(position, quaternion, one)
    geometry.applyMatrix4(matrix)

    const key = groupBy(m)
    ;(buckets[key] ??= []).push(geometry)
  }

  const merged: Record<string, THREE.BufferGeometry | null> = {}
  for (const k of Object.keys(buckets)) {
    merged[k] = buckets[k].length ? mergeGeometries(buckets[k], false) : null
    for (const g of buckets[k]) g.dispose()
  }
  return merged
}

/**
 * A separate photo-referenced study, split by architectural region and material.
 * Selection introduces Bellewood green; the other regions retain their physical
 * material colours and depth. Legacy presentations keep their original geometry.
 */
function MaquetteHouse({ focus, additionProgress, additionMotion, onReady, interactive, motionRef }: {
  focus: HeritageFocus | null
  additionProgress: number
  additionMotion?: MotionValue<number>
  onReady?: (ready: boolean) => void
  interactive: boolean
  motionRef?: RefObject<HTMLElement>
}) {
  const { gl } = useThree()
  const motionPivot = useRef<THREE.Group>(null)
  const model = useRef<THREE.Group>(null)
  const addition = useRef<THREE.Group>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const shownProgress = useRef(THREE.MathUtils.clamp(additionMotion?.get() ?? additionProgress, 0, 1))
  const reveal = useRef({ from: shownProgress.current, to: shownProgress.current, elapsed: 2.2 })
  const revealPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -STUDY_ADDITION_REVEAL.back), [])
  const restPosition = useMemo(() => MAQUETTE_OFFSET.map((value, i) => value - MAQUETTE_TARGET[i]) as [number, number, number], [])

  const batches = useMemo(() => {
    const geometries = buildGeometries((member) => `${member.mat}|${heritageFocusGroups(member).join(' ')}|${isStudyAddition(member) ? 'addition' : 'original'}`, MAQUETTE_MEMBERS, 'XYZ')
    return Object.entries(geometries).flatMap(([id, geometry]) => {
      if (!geometry) return []
      const [key, groups, part] = id.split('|')
      const spec = MAQUETTE_MATERIALS[key as MaterialKey]
      const full = new THREE.Color(spec.color)
      return [{
        id,
        part,
        groups: groups.split(' '),
        geometry,
        full,
        active: new THREE.Color(MAQUETTE_FOCUS_COLOURS[key as MaterialKey]),
        material: new THREE.MeshStandardMaterial({
          ...spec,
          transparent: false,
          envMapIntensity: 0.28,
          emissiveIntensity: 0,
          clippingPlanes: part === 'addition' ? [revealPlane] : [],
        }),
      }]
    })
  }, [revealPlane])

  useEffect(() => {
    const previous = gl.localClippingEnabled
    gl.localClippingEnabled = true
    return () => { gl.localClippingEnabled = previous }
  }, [gl])

  useEffect(() => {
    onReady?.(true)
    return () => onReady?.(false)
  }, [onReady])

  useEffect(() => {
    pointer.current = { x: 0, y: 0 }
    if (!interactive || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const surface = motionRef?.current ?? gl.domElement.parentElement
    if (!surface) return
    const reset = () => { pointer.current = { x: 0, y: 0 } }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      if (event.target instanceof Element && event.target.closest('input, button, a')) return
      const rect = surface.getBoundingClientRect()
      pointer.current = {
        x: THREE.MathUtils.clamp(((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1, -1, 1),
        y: THREE.MathUtils.clamp(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1, -1, 1),
      }
    }
    surface.addEventListener('pointermove', move, { passive: true })
    surface.addEventListener('pointerleave', reset)
    window.addEventListener('blur', reset)
    return () => {
      surface.removeEventListener('pointermove', move)
      surface.removeEventListener('pointerleave', reset)
      window.removeEventListener('blur', reset)
      reset()
    }
  }, [gl, interactive, motionRef])

  useEffect(() => () => {
    batches.forEach(({ geometry, material }) => { geometry.dispose(); material.dispose() })
  }, [batches])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const pivot = motionPivot.current
    if (pivot) {
      const movement = 1 - Math.exp(-6 * dt)
      pivot.rotation.y = THREE.MathUtils.lerp(pivot.rotation.y, pointer.current.x * STUDY_POINTER_MOTION.yaw, movement)
      pivot.rotation.x = THREE.MathUtils.lerp(pivot.rotation.x, pointer.current.y * STUDY_POINTER_MOTION.tilt, movement)
    }

    const targetProgress = THREE.MathUtils.clamp(additionMotion?.get() ?? additionProgress, 0, 1)
    if (additionMotion) {
      // The slider owns timing. A second tween here would lag behind the marker
      // and continue moving after the visitor pauses or lets go.
      shownProgress.current = targetProgress
    } else {
      if (reveal.current.to !== targetProgress) {
        reveal.current = { from: shownProgress.current, to: targetProgress, elapsed: 0 }
      }
      const transition = reveal.current
      transition.elapsed = Math.min(2.2, transition.elapsed + delta)
      const t = transition.elapsed / 2.2
      shownProgress.current = THREE.MathUtils.lerp(transition.from, transition.to, t * t * (3 - 2 * t))
    }
    if (addition.current) addition.current.visible = shownProgress.current > 0
    if (model.current) {
      // The clipping plane follows the moving model, rather than remaining in
      // world space and sawing through a different part when the pointer moves.
      model.current.updateWorldMatrix(true, false)
      revealPlane.normal.set(0, 0, 1)
      revealPlane.constant = -THREE.MathUtils.lerp(STUDY_ADDITION_REVEAL.front, STUDY_ADDITION_REVEAL.back, shownProgress.current)
      revealPlane.applyMatrix4(model.current.matrixWorld)
    }

    const amount = 1 - Math.pow(0.005, Math.min(delta, 0.1))
    batches.forEach((batch) => {
      const active = focus !== null && batch.groups.includes(focus)
      batch.material.color.lerp(active ? batch.active : batch.full, amount)
    })
  })

  return (
    <group ref={motionPivot} name="study-motion-pivot" position={MAQUETTE_TARGET}>
      <group ref={model} position={restPosition} rotation={[0, MAQUETTE_YAW, 0]}>
        <group name="study-evolution-original">
          {batches.filter(batch => batch.part === 'original').map(({ id, geometry, material }) => (
            <mesh key={id} name={`study-${id}`} geometry={geometry} material={material} castShadow receiveShadow />
          ))}
        </group>
        <group ref={addition} name="study-evolution-addition" visible={(additionMotion?.get() ?? additionProgress) > 0}>
          {batches.filter(batch => batch.part === 'addition').map(({ id, geometry, material }) => (
            <mesh key={id} name={`study-${id}`} geometry={geometry} material={material} castShadow receiveShadow />
          ))}
        </group>
      </group>
    </group>
  )
}

/** Match the SVG's contain fit exactly; resizing cannot detach a DOM callout. */
function MaquetteFit() {
  const { camera, size } = useThree()
  useLayoutEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return
    const { width, height } = heritageMaquetteFrame(size.width / Math.max(size.height, 1))
    camera.left = -width / 2
    camera.right = width / 2
    camera.top = height / 2
    camera.bottom = -height / 2
    camera.zoom = 1
    camera.position.copy(new THREE.Vector3(...MAQUETTE_EYE).normalize().multiplyScalar(24))
    camera.position.add(new THREE.Vector3(...MAQUETTE_TARGET))
    camera.lookAt(...MAQUETTE_TARGET)
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])
  return null
}

/**
 * A small studio sky, generated rather than fetched.
 *
 * Image-based lighting is the single biggest difference between a model that
 * looks computed and one that looks photographed: it puts a soft gradient across
 * every surface instead of one flat value per face. This is a wash sky over a
 * sage ground, run through the same prefilter three uses for a real HDR, so it
 * costs one small canvas and no network request.
 */
function StudioSky({ neutral = false }: { neutral?: boolean }) {
  const { gl, scene } = useThree()

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
    gradient.addColorStop(0, '#ffffff')
    gradient.addColorStop(0.4, neutral ? '#f4f3ef' : '#f2f5ea')
    gradient.addColorStop(0.52, neutral ? '#deddd6' : '#d8e0d2')
    gradient.addColorStop(0.75, neutral ? '#aaa99f' : '#9aa894')
    gradient.addColorStop(1, neutral ? '#77796f' : '#6f7c6a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 256)

    const texture = new THREE.CanvasTexture(canvas)
    texture.mapping = THREE.EquirectangularReflectionMapping
    texture.colorSpace = THREE.SRGBColorSpace

    const pmrem = new THREE.PMREMGenerator(gl)
    const environment = pmrem.fromEquirectangular(texture).texture
    scene.environment = environment

    texture.dispose()
    pmrem.dispose()

    return () => {
      scene.environment = null
      environment.dispose()
    }
  }, [gl, scene, neutral])

  return null
}

/* --- Keying ----------------------------------------------------------------
   Point at a material in the legend and the building shows you where it is.

   One rule, arrived at the hard way over a dozen attempts: THE MATERIAL YOU
   ARE POINTING AT IS NEVER TOUCHED. Not recoloured, not tinted, not lit. It
   stays exactly the colour it is on the swatch beside it, because the moment
   it changes at all the house stops being the house and the legend stops
   telling the truth about what the building is made of. Every earlier version
   broke this — stepping the others to a tone, flattening the palette, taking
   the hue out, lighting the keyed one in its own colour — and every one of
   them read as the colours changing.

   So the signal comes entirely from the other five. They fall away towards the
   colour of the panel behind them, far enough that what is left standing at
   full strength is unmistakable. Nothing is lit; one thing is simply still
   there while everything else has gone quiet. */

/** How far a material that is not being keyed falls back towards the panel.
    The panel behind this scene went white when the light green grounds did, so
    the colour the house falls back towards followed it. Fading towards the old
    sage tint would leave every quiet material a green-grey that no longer
    matches anything on the page. */
const FADE_TO = '#f7f7f4'
const FADED = 0.84

/** The windows carry a little light of their own at rest, keyed or not; they
    lose it along with everything else when some other material is keyed. */
const GLASS_GLOW = 0.62

function House({
  lean,
  highlight,
  selectedPart,
  onPartSelect,
}: {
  selectedPart?: HeritagePart
  onPartSelect?: (part: HeritagePart) => void
  lean: React.MutableRefObject<{ x: number; y: number }>
  highlight: MaterialKey | null
}) {
  const group = useRef<THREE.Group>(null)
  const smoothed = useRef({ x: 0, y: 0 })

  /* Keying, done by colour rather than by opacity.

     The legend on the approach page points at one material and everything else
     has to drop back. Transparency would do it and would also put six meshes
     into the sorted pass and let the far side of the building show through the
     near one. Changing the colour keeps every mesh opaque.

     The materials are built once and mutated on the frame loop rather than
     rebuilt from props, because the change has to be a MOVE and not a cut. Six
     materials swapping value between two frames is what made this read as a
     flicker; easing them over about a quarter of a second reads as the house
     going quiet, which is what it is meant to say. */
  const mats = useMemo(() => {
    const out = {} as Record<MaterialKey, THREE.MeshStandardMaterial>
    for (const key of MATERIAL_KEYS) {
      out[key] = new THREE.MeshStandardMaterial({
        color: new THREE.Color(MATERIALS[key].color),
        // Opaque, always. See the note above the constants.
        transparent: false,
        roughness: MATERIALS[key].roughness,
        metalness: MATERIALS[key].metalness,
        envMapIntensity: key === 'glass' ? 2.4 : 0.9,
        emissive: new THREE.Color(key === 'glass' ? GLASS_EMISSIVE : '#000000'),
        emissiveIntensity: key === 'glass' ? GLASS_GLOW : 0,
      })
    }
    return out
  }, [])


  useEffect(
    () => () => {
      for (const key of MATERIAL_KEYS) mats[key].dispose()
    },
    [mats],
  )

  /** Each material's true colour, and the same colour fallen back. */
  const tone = useMemo(() => {
    const full = {} as Record<MaterialKey, THREE.Color>
    const quiet = {} as Record<MaterialKey, THREE.Color>
    const back = new THREE.Color(FADE_TO)
    for (const key of MATERIAL_KEYS) {
      full[key] = new THREE.Color(MATERIALS[key].color)
      quiet[key] = full[key].clone().lerp(back, FADED)
    }
    return { full, quiet }
  }, [])

  const geometries = useMemo(buildGeometries, [])

  useEffect(
    () => () => {
      for (const k of MATERIAL_KEYS) geometries[k]?.dispose()
    },
    [geometries],
  )

  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return

    // Twelve degrees either side of centre, once every couple of minutes. Slow
    // enough that you notice it has moved rather than watch it moving.
    const drift = Math.sin(clock.elapsedTime * 0.055) * DRIFT

    smoothed.current.x += (lean.current.x - smoothed.current.x) * EASE
    smoothed.current.y += (lean.current.y - smoothed.current.y) * EASE

    g.rotation.y = HERITAGE_YAW + drift + smoothed.current.x * 0.15
    g.rotation.x = 0.015 + smoothed.current.y * 0.05
  })

  /* Ease every material towards what it should be, frame by frame. Framerate
     independent, so it settles in the same quarter second on a 60Hz laptop and
     a 120Hz phone. */
  useFrame((_, delta) => {
    const t = 1 - Math.pow(0.02, Math.min(delta, 0.1))

    for (const key of MATERIAL_KEYS) {
      const m = mats[key]
      const quiet = highlight != null && key !== highlight

      /* Towards the panel if something else is keyed, otherwise back to its
         own colour. The keyed material takes this same line and lands on
         exactly what it always was. */
      m.color.lerp(quiet ? tone.quiet[key] : tone.full[key], t)

      /* Glass is the one material with light of its own, so its fade has to
         take the light with it or the windows stay bright while the walls go.
         Keyed or at rest it sits at exactly GLASS_GLOW — never higher. */
      if (key === 'glass') {
        const glow = quiet ? GLASS_GLOW * (1 - FADED) : GLASS_GLOW
        m.emissiveIntensity += (glow - m.emissiveIntensity) * t
      }
    }
  })




  return (
    <group ref={group} position={HERITAGE_OFFSET}>
      {onPartSelect && EXPLORE_POINTS.map((item, i) => (
        <Html key={item.id} position={item.point} center zIndexRange={[30, 20]}>
          <button type="button" tabIndex={-1}
            className={[hotspotStyles.point, selectedPart === item.id ? hotspotStyles.active : ''].join(' ')}
            onClick={(event) => { event.stopPropagation(); onPartSelect(item.id) }}
            title={item.label} aria-label={item.label}>
            {String(i + 1).padStart(2, '0')}
          </button>
        </Html>
      ))}
      {MATERIAL_KEYS.map((key) => {
        const geometry = geometries[key]
        if (!geometry) return null
        return (
          <mesh
            key={key}
            geometry={geometry}
            material={mats[key]}
            castShadow
            receiveShadow
          />
        )
      })}
    </group>
  )
}

/**
 * Pushes the camera back along its own axis until the whole house fits.
 *
 * A perspective camera cannot be fitted with a zoom, so the distance is solved
 * from measured points. The house turns as it drifts, so the solve runs across
 * the whole sweep and the worst case wins — fitting to the current angle every
 * frame would make the camera breathe as it turned.
 *
 * **It fits to the members, not to the bounding box.** The box was eight
 * corners around the whole building, and in a three-quarter view the corners of
 * a box project a long way outside the thing inside it: the top-front corner
 * sits in empty air above the eave, and the fit was holding room for it. On a
 * wide, short plate — which is what the hero sheet gives it — that slack was
 * costing the house nearly half the height it had to work with.
 *
 * Every member's own eight corners are transformed the same way the mesh
 * transforms them (roll then pitch, ZXY, matching the still frame) and the
 * whole cloud is fitted. It is the real silhouette rather than a box around it,
 * so the house fills the frame it is given. Six thousand-odd points, solved
 * once per aspect change and never per frame.
 */
function Fit() {
  const geometry = useMemo(() => {
    const axis = new THREE.Vector3(8.5, 4.9, 12).normalize()

    const corners: THREE.Vector3[] = []
    const euler = new THREE.Euler()
    const quaternion = new THREE.Quaternion()

    for (const m of HERITAGE_MEMBERS) {
      euler.set(m.rx, 0, m.rz ?? 0, 'ZXY')
      quaternion.setFromEuler(euler)

      for (const sx of [-0.5, 0.5]) {
        for (const sy of [-0.5, 0.5]) {
          for (const sz of [-0.5, 0.5]) {
            corners.push(
              new THREE.Vector3(m.s[0] * sx, m.s[1] * sy, m.s[2] * sz)
                .applyQuaternion(quaternion)
                .add(new THREE.Vector3(m.p[0], m.p[1], m.p[2]))
                .add(new THREE.Vector3(...HERITAGE_OFFSET)),
            )
          }
        }
      }
    }

    const yaws: number[] = []
    for (let i = 0; i <= 6; i++) {
      yaws.push(HERITAGE_YAW + (i / 6 - 0.5) * (DRIFT + 0.08) * 2)
    }

    return { axis, corners, yaws }
  }, [])

  const lastAspect = useRef(-1)

  useFrame(({ camera, size }) => {
    const cam = camera as THREE.PerspectiveCamera
    const aspect = size.width / Math.max(size.height, 1)
    if (Math.abs(aspect - lastAspect.current) < 0.002) return
    lastAspect.current = aspect

    cam.aspect = aspect

    const vFov = (cam.fov * Math.PI) / 180
    const tanV = Math.tan(vFov / 2)
    const tanH = tanV * aspect

    const reference = 20
    const eye = geometry.axis.clone().multiplyScalar(reference)
    const basis = new THREE.Matrix4().lookAt(
      eye,
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
    )
    const toCamera = basis.clone().invert()

    const point = new THREE.Vector3()
    const rotated = new THREE.Vector3()
    let shift = -Infinity

    for (const yaw of geometry.yaws) {
      const cos = Math.cos(yaw)
      const sin = Math.sin(yaw)
      for (const c of geometry.corners) {
        rotated.set(c.x * cos + c.z * sin, c.y, -c.x * sin + c.z * cos)
        point.copy(rotated).sub(eye).applyMatrix4(toCamera)
        const depth = -point.z
        shift = Math.max(shift, Math.abs(point.x) / tanH - depth)
        shift = Math.max(shift, Math.abs(point.y) / tanV - depth)
      }
    }

    /* Close. The object is the brand image on this page, and it was sitting
       small in the middle of its panel with air all round — which reads as a
       render placed on a background rather than a photograph of a model. Fill
       the frame and it becomes the subject. */
    cam.position.copy(geometry.axis).multiplyScalar(reference + shift - 0.55)
    cam.lookAt(0, 0, 0)
    cam.updateProjectionMatrix()
  })

  return null
}

export default function HeritageStudy({
  shadows = true,
  highlight = null,
  selectedPart,
  onPartSelect,
  presentation = 'default',
  focus = null,
  additionProgress = 1,
  additionMotion,
  onReady,
  interactive = false,
  motionRef,
}: {
  presentation?: HeritagePresentation
  focus?: HeritageFocus | null
  /** Reveal the imagined addition, from the original cottage (0) to complete (1). */
  additionProgress?: number
  /** A shared continuous value for the study's live slider and automatic loop. */
  additionMotion?: MotionValue<number>
  onReady?: (ready: boolean) => void
  /** Gentle, local pointer response for the architectural study only. */
  interactive?: boolean
  motionRef?: RefObject<HTMLElement>
  selectedPart?: HeritagePart
  onPartSelect?: (part: HeritagePart) => void
  shadows?: boolean
  /**
   * Draw one material at full strength and step everything else back. The
   * legend on the approach page drives it, so that page keys the building
   * itself rather than a flat drawing of it.
   */
  highlight?: MaterialKey | null
}) {
  const lean = useRef({ x: 0, y: 0 })
  const maquette = presentation === 'maquette'

  useEffect(() => {
    if (maquette) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    const onMove = (event: PointerEvent) => {
      lean.current.x = (event.clientX / window.innerWidth) * 2 - 1
      lean.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [maquette])

  return (
    <Canvas
      orthographic={maquette}
      // The new study shares orthographic framing with its static drawing.
      // Legacy presentations retain their long perspective lens.
      camera={{ position: [8.5, 4.9, 12], fov: 26, near: 0.5, far: 140 }}
      // This is the showpiece and it is one static object, so it is worth the
      // resolution the rest of the site does not spend.
      dpr={[1, shadows ? 2 : 1.5]}
      shadows={shadows ? 'soft' : false}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        // No tone mapping. Silky Oak and Bellewood Green are specified values.
        toneMapping: THREE.NoToneMapping,
      }}
      style={{ background: 'transparent' }}
      resize={{ scroll: false }}
    >
      {maquette ? <MaquetteFit /> : <Fit />}
      <StudioSky neutral={maquette} />

      {/* Late afternoon. A warm key over the left shoulder, a cool fill, and the
          sky doing most of the work. */}
      <hemisphereLight args={['#f7f7f4', maquette ? '#b8b6ab' : '#b6c5ae', maquette ? 0.65 : 0.55]} />
      <directionalLight
        position={[-9, 13, 10]}
        intensity={maquette ? 1 : 1.55}
        color={maquette ? '#fffdf6' : '#fff3de'}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-radius={5}
        shadow-bias={-0.0009}
        shadow-normalBias={0.022}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={0.5}
        shadow-camera-far={46}
      />
      <directionalLight position={[9, 3.5, -8]} intensity={0.28} color="#dfe8dc" />

      {shadows && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, HERITAGE_GROUND, 0]} receiveShadow>
          <planeGeometry args={[52, 52]} />
          {/* Light and tight. A soft grey pool under a floating object is the
              single thing that makes a 3D scene read as a render rather than as
              a photograph of a model, and the object is the brand image here. */}
          <shadowMaterial opacity={0.28} />
        </mesh>
      )}

      {maquette
        ? <MaquetteHouse focus={focus} additionProgress={additionProgress} additionMotion={additionMotion} onReady={onReady} interactive={interactive} motionRef={motionRef} />
        : <House lean={lean} highlight={highlight} selectedPart={selectedPart} onPartSelect={onPartSelect} />}
    </Canvas>
  )
}
