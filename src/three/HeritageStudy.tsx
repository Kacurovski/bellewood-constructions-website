import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {

  HERITAGE_GROUND,
  HERITAGE_MEMBERS,
  HERITAGE_OFFSET,
  HERITAGE_YAW,
} from './heritageMembers'
import { GLASS_EMISSIVE, MATERIALS, MATERIAL_KEYS } from './materials'
import type { MaterialKey } from './materials'

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

function buildGeometries() {
  const buckets = {} as Record<MaterialKey, THREE.BufferGeometry[]>
  for (const k of MATERIAL_KEYS) buckets[k] = []

  const matrix = new THREE.Matrix4()
  const position = new THREE.Vector3()
  const quaternion = new THREE.Quaternion()
  const one = new THREE.Vector3(1, 1, 1)
  const euler = new THREE.Euler()

  for (const m of HERITAGE_MEMBERS) {
    const smallest = Math.min(m.s[0], m.s[1], m.s[2])
    // A radius at or past half the smallest side degenerates the geometry.
    const radius = Math.min(FILLET, smallest * 0.3)

    const geometry = new RoundedBoxGeometry(m.s[0], m.s[1], m.s[2], 1, radius)

    // Roll then pitch, matching the order the still frame projects them in.
    euler.set(m.rx, 0, m.rz ?? 0, 'ZXY')
    quaternion.setFromEuler(euler)
    position.set(m.p[0], m.p[1], m.p[2])
    matrix.compose(position, quaternion, one)
    geometry.applyMatrix4(matrix)

    buckets[m.mat].push(geometry)
  }

  const merged = {} as Record<MaterialKey, THREE.BufferGeometry | null>
  for (const k of MATERIAL_KEYS) {
    merged[k] = buckets[k].length ? mergeGeometries(buckets[k], false) : null
    for (const g of buckets[k]) g.dispose()
  }
  return merged
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
function StudioSky() {
  const { gl, scene } = useThree()

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
    gradient.addColorStop(0, '#ffffff')
    gradient.addColorStop(0.4, '#f2f5ea')
    gradient.addColorStop(0.52, '#d8e0d2')
    gradient.addColorStop(0.75, '#9aa894')
    gradient.addColorStop(1, '#6f7c6a')
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
  }, [gl, scene])

  return null
}

/* --- Keying ----------------------------------------------------------------
   Point at a material in the legend and the building shows you where it is.

   Two rules, arrived at the hard way over about eight attempts.

   NOTHING IS RECOLOURED. Every version that tried to say what a material is at
   the same time as where it is failed, because the palette cannot carry it:
   three of the six materials are nearly the same brown and two more are nearly
   black. Stepping the others back to a tone, flattening them to one value,
   taking the hue out, lighting the keyed one in the brand accent — all of them
   turned the house into a different house.

   THE SIGNAL IS THE HIGHLIGHT, NOT THE FADE. Mixing the other materials
   towards the panel is also a recolour, however gently it is done: the panel is
   nearly white, so even a third of the way there turns warm timber into cream.
   They are muted instead — the same hue, the same value order, just less of
   it — which reads as quiet rather than as changed. What actually marks the
   keyed material is that it lights up: its own colour, unchanged, lifted by an
   emissive of that same colour so the part gets brighter without becoming a
   different one. */

/** How much chroma a material that is not being keyed keeps, and how far its
    value lifts. Small on purpose: this is meant to read as quiet, not as pale. */
const MUTE_S = 0.4
const MUTE_L = 0.16

/* How hard a keyed material lights up, in its own colour.

   Scaled by how dark the material is, because an emissive is ADDED to the
   surface: the same intensity on Silky Oak is a clear lift and on Deep Pine is
   almost nothing, since there is almost nothing there to add. Left flat, the
   only row that did not visibly do anything was the roof — which is the row
   whose own material makes it hardest. Scaled, every row lifts by about as
   much as every other. */
const LIT_GLOW = 0.21
const LIT_GLOW_MIN = 0.3
const LIT_GLOW_MAX = 2.2
/** The windows are already a light source, so theirs runs from a higher floor. */
const GLASS_GLOW = 0.62
const GLASS_GLOW_LIT = 1.15

type HSL = { h: number; s: number; l: number }

/** sRGB hex to HSL and back, so muting happens where the eye is rather than in
    the renderer's linear space, where a mid grey is not a mid grey. */
function toHSL(hex: string): HSL {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return { h: 0, s: 0, l }
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h, s, l }
}

function fromHSL({ h, s, l }: HSL): string {
  const f = (n: number) => {
    const k = (n + h * 12) % 12
    const a = s * Math.min(l, 1 - l)
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(Math.max(0, Math.min(1, v)) * 255)
  }
  return `#${((f(0) << 16) | (f(8) << 8) | f(4)).toString(16).padStart(6, '0')}`
}

/** Same hue, same place in the value order, simply less of it. */
function muted(hex: string): string {
  const { h, s, l } = toHSL(hex)
  return fromHSL({ h, s: s * MUTE_S, l: l + (1 - l) * MUTE_L })
}

/** The lift this material needs to read as lit. See the note on LIT_GLOW. */
function glowFor(hex: string): number {
  const { l } = toHSL(hex)
  return Math.min(Math.max(LIT_GLOW / Math.max(l, 0.1), LIT_GLOW_MIN), LIT_GLOW_MAX)
}



function House({
  lean,
  highlight,
}: {
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
        emissive: new THREE.Color(key === 'glass' ? GLASS_EMISSIVE : MATERIALS[key].color),
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

  /** True colour, and the same colour muted. */
  const tone = useMemo(() => {
    const full = {} as Record<MaterialKey, THREE.Color>
    const quiet = {} as Record<MaterialKey, THREE.Color>
    const glow = {} as Record<MaterialKey, number>
    for (const key of MATERIAL_KEYS) {
      full[key] = new THREE.Color(MATERIALS[key].color)
      quiet[key] = new THREE.Color(muted(MATERIALS[key].color))
      glow[key] = glowFor(MATERIALS[key].color)
    }
    return { full, quiet, glow }
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
      const keyed = highlight != null && key === highlight
      const quiet = highlight != null && !keyed

      m.color.lerp(quiet ? tone.quiet[key] : tone.full[key], t)

      /* The lift. An emissive of the material's OWN colour, so the part gets
         brighter without becoming a different colour — which is the whole point
         and the thing every earlier attempt got wrong. */
      const glow =
        key === 'glass'
          ? keyed
            ? GLASS_GLOW_LIT
            : GLASS_GLOW
          : keyed
            ? tone.glow[key]
            : 0
      m.emissiveIntensity += (glow - m.emissiveIntensity) * t
    }
  })




  return (
    <group ref={group} position={HERITAGE_OFFSET}>
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
}: {
  shadows?: boolean
  /**
   * Draw one material at full strength and step everything else back. The
   * legend on the approach page drives it, so that page keys the building
   * itself rather than a flat drawing of it.
   */
  highlight?: MaterialKey | null
}) {
  const lean = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const onMove = (event: PointerEvent) => {
      lean.current.x = (event.clientX / window.innerWidth) * 2 - 1
      lean.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <Canvas
      // A long lens rather than an orthographic camera: the process section
      // further down is a drawing, and this one should read as an object.
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
      <Fit />
      <StudioSky />

      {/* Late afternoon. A warm key over the left shoulder, a cool fill, and the
          sky doing most of the work. */}
      <hemisphereLight args={['#f7f9f0', '#b6c5ae', 0.55]} />
      <directionalLight
        position={[-9, 13, 10]}
        intensity={1.55}
        color="#fff3de"
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

      <House lean={lean} highlight={highlight} />
    </Canvas>
  )
}
