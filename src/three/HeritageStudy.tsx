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

/**
 * What a material that is NOT being keyed turns into.
 *
 * Its own value, with the colour taken out. Not a tone, not the panel, not one
 * flat sage for all six — every one of those has been tried on this section and
 * every one failed the same way: the moment the materials stop carrying their
 * own darkness the house stops looking like a house. A roof that is the same
 * value as the wall under it is not a quiet roof, it is a shape.
 *
 * So the value is exactly what it always was. The roof stays the darkest thing
 * on the building, the cladding stays mid, the glazing stays the lightest, and
 * the only thing that changes is that they are no longer brown and green. The
 * keyed material is then the one piece of colour on an otherwise monochrome
 * model, which is the whole of the effect and the reason it can be read at a
 * glance.
 *
 * A touch of sage in the grey, so a page built out of two greens does not have
 * a neutral photographic grey dropped into the middle of it.
 */
const GHOST_TINT = '#8fa08b'
const GHOST_TINT_MIX = 0.16
/** The value the ghosted range is compressed towards, and by how much. */
const GHOST_MID = 0.12
const GHOST_RANGE = 0.6

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
        roughness: MATERIALS[key].roughness,
        metalness: MATERIALS[key].metalness,
        envMapIntensity: key === 'glass' ? 2.4 : 0.9,
        emissive: new THREE.Color(key === 'glass' ? GLASS_EMISSIVE : '#000000'),
        emissiveIntensity: key === 'glass' ? 0.62 : 0,
      })
    }
    return out
  }, [])

  const targets = useMemo(() => {
    const full = {} as Record<MaterialKey, THREE.Color>
    const ghost = {} as Record<MaterialKey, THREE.Color>
    const tint = new THREE.Color(GHOST_TINT)

    for (const key of MATERIAL_KEYS) {
      const colour = new THREE.Color(MATERIALS[key].color)
      full[key] = colour

      /* Luminance in, grey of the same luminance out — the material's own
         brightness with the hue taken off it, rather than an eyeballed guess at
         it. Rec. 709 weights, applied to the colour's own components, which
         three has already converted into the renderer's linear space. */
      const l = 0.2126 * colour.r + 0.7152 * colour.g + 0.0722 * colour.b

      /* Pulled towards the middle, not left where it was.

         Taking the colour out of a material that is already almost black does
         almost nothing to it, and the roof is Deep Pine: keyed and unkeyed it
         came out the same near-black, so pointing at the roof did not visibly
         do anything. Compressing the ghost's range towards a mid value keeps
         every material in the same ORDER — roof still darkest, glazing still
         lightest, so the house still reads — while making room for the keyed
         one to be both the only colour and the strongest value on the model. */
      const flat = GHOST_MID + (l - GHOST_MID) * GHOST_RANGE
      ghost[key] = new THREE.Color().setRGB(flat, flat, flat).lerp(tint, GHOST_TINT_MIX)
    }

    return { full, ghost }
  }, [])

  useEffect(
    () => () => {
      for (const key of MATERIAL_KEYS) mats[key].dispose()
    },
    [mats],
  )

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
      const lit = highlight == null || key === highlight
      m.color.lerp(lit ? targets.full[key] : targets.ghost[key], t)
      m.metalness += ((lit ? MATERIALS[key].metalness : 0) - m.metalness) * t
      const glow = key !== 'glass' ? 0 : lit ? 0.62 : 0.1
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
