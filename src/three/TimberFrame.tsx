import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { FRAME_BOUNDS, FRAME_MEMBERS, FRAME_VIEWS } from './frameMembers'
import type { FrameView, MaterialKey } from './frameMembers'
import { CroydeLandscape } from './CroydeLandscape'

/** Croyde's white Federation house, assembled through scroll.
 * The live scene and its fallback share the photo-referenced member list.
 */

// Pale drafting lines stay legible over the planted setting during assembly.
const LINE = '#f4f1dd'

/** White is the main paint colour. The photographed house's charcoal posts,
 * gable infill, muted metal roof and weathered decks supply the contrast. */
const MATERIALS: Record<MaterialKey, { color: string; roughness: number }> = {
  frame: { color: '#b19b7b', roughness: 0.88 },
  clad: { color: '#ffffff', roughness: 0.86 },
  trim: { color: '#ffffff', roughness: 0.76 },
  joinery: { color: '#f5f4ee', roughness: 0.78 },
  deck: { color: '#b2aaa0', roughness: 0.9 },
  roof: { color: '#e5e6df', roughness: 0.72 },
  glass: { color: '#627572', roughness: 0.3 },
  accent: { color: '#414945', roughness: 0.82 },
  ground: { color: '#dcd5c6', roughness: 0.95 },
  brick: { color: '#95765f', roughness: 0.94 },
}

const MATERIAL_KEYS = Object.keys(MATERIALS) as MaterialKey[]
type RenderKey = MaterialKey | 'corbel'
const RENDER_KEYS: RenderKey[] = [...MATERIAL_KEYS, 'corbel']

const smoothstep = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/** The twelve edges of a unit cube, as 24 corner indices. */
const EDGE_INDICES = [
  0, 1, 1, 3, 3, 2, 2, 0,
  4, 5, 5, 7, 7, 6, 6, 4,
  0, 4, 1, 5, 2, 6, 3, 7,
]

const UNIT_CORNERS = [
  [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5],
  [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5],
] as const

function Building({ progress }: { progress: React.MutableRefObject<number> }) {
  const meshes = useRef<Partial<Record<RenderKey, THREE.InstancedMesh | null>>>({})
  const mats = useRef<Partial<Record<RenderKey, THREE.MeshStandardMaterial | null>>>({})
  const lineMat = useRef<THREE.LineBasicMaterial>(null)
  const lastProgress = useRef(-1)

  const count = FRAME_MEMBERS.length
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  // One shared extrusion for all curved brackets. A smooth concave edge avoids
  // both the old diagonal offcuts and seams from approximating it with boxes.
  const corbel = useMemo(() => {
    const profile = new THREE.Shape()
    profile.moveTo(-0.5, 0.5)
    profile.lineTo(0.5, 0.5)
    profile.lineTo(0.5, 0.42)
    profile.absellipse(0.5, -0.5, 1, 0.92, Math.PI / 2, Math.PI, false, 0)
    profile.closePath()
    const geometry = new THREE.ExtrudeGeometry(profile, {depth: 1, bevelEnabled: false, curveSegments: 24})
    geometry.translate(0, 0, -0.5)
    return geometry
  }, [])
  const framePaint = useMemo(() => ({
    bare: new THREE.Color(MATERIALS.frame.color),
    finished: new THREE.Color('#ffffff'),
  }), [])

  /** Which instanced mesh each member belongs to, and its slot within it. */
  const layout = useMemo(() => {
    const slot = new Int32Array(count)
    const lineSlot = new Int32Array(count).fill(-1)
    let lineCount = 0
    const sizes = {} as Record<RenderKey, number>
    const keys: RenderKey[] = []
    for (const k of RENDER_KEYS) sizes[k] = 0
    FRAME_MEMBERS.forEach((m, i) => {
      const key = m.profile === 'corbel' ? 'corbel' : m.mat
      keys[i] = key
      slot[i] = sizes[key]
      sizes[key] += 1
      if (m.lines !== false) lineSlot[i] = lineCount++
    })
    return { slot, sizes, keys, lineSlot, lineCount }
  }, [count])

  const quats = useMemo(
    () =>
      FRAME_MEMBERS.map((m) =>
        // 'YXZ': roll, then pitch, then yaw. The hip needs all three: a sheet
        // on a hip end rolls, a hip rafter pitches and yaws; a member with
        // only a pitch comes out exactly as it did under the default order.
        new THREE.Quaternion().setFromEuler(new THREE.Euler(m.rx, m.ry ?? 0, m.rz ?? 0, 'YXZ')),
      ),
    [],
  )

  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(layout.lineCount * EDGE_INDICES.length * 3), 3),
    )
    g.setDrawRange(0, 0)
    return g
  }, [layout.lineCount])

  const scratch = useMemo(
    () => ({
      matrix: new THREE.Matrix4(),
      position: new THREE.Vector3(),
      origin: new THREE.Vector3(),
      scale: new THREE.Vector3(),
      corner: new THREE.Vector3(),
      /** Last growth value per member, so settled members are not recomputed. */
      lastT: new Float32Array(count).fill(-1),
    }),
    [count],
  )

  useFrame(() => {
    const p = progress.current

    if (lineMat.current) {
      // The drawing hands over to solid material. At completion the white
      // paint and its shadows define the edges, without a green wire outline.
      lineMat.current.opacity = 1 - smoothstep(0.48, 0.9, p)
    }

    const solidOpacity = smoothstep(0.34, 0.68, p)
    for (const k of RENDER_KEYS) {
      const mat = mats.current[k]
      if (!mat) continue
      mat.opacity = solidOpacity
      // Invisible drafting-stage solids must not leave phantom shadows on
      // the lawn. The line drawing itself does not cast a building shadow.
      const mesh = meshes.current[k]
      if (mesh) mesh.castShadow = k !== 'glass' && solidOpacity > 0.01
      // Exposed bearers and joist ends receive the white finish along with the
      // house; the timber stage remains legible earlier in the sequence.
      if (k === 'frame') mat.color.copy(framePaint.bare).lerp(framePaint.finished, smoothstep(0.74, 0.92, p))
      /* Transparent only while fading in. Left transparent once the house is
         built, the blending let the page show through wherever two faces meet
         (the canvas is composited over the page with alpha), and every seam
         between two boards came out as a pale line that read as a gap. Opaque
         at full strength, nothing gets through. */
      const fading = solidOpacity < 0.999
      if (mat.transparent !== fading) {
        mat.transparent = fading
        mat.needsUpdate = true
      }
    }

    if (Math.abs(p - lastProgress.current) < 0.0003) return
    lastProgress.current = p

    const attr = lineGeometry.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    let anyVisible = false
    let changed = false
    let linesChanged = false

    for (let i = 0; i < count; i++) {
      const m = FRAME_MEMBERS[i]
      const t = smoothstep(m.at, m.at + 0.045, p)
      if (t > 0.001) anyVisible = true

      // A member that has finished growing never needs recomputing. Across the
      // whole section only a subset is in motion at once, which keeps this
      // detailed assembly affordable on a phone.
      if (scratch.lastT[i] === t) continue
      scratch.lastT[i] = t
      changed = true

      const [w, h, d] = m.s
      const long = Math.max(w, h, d)
      const sx = w === long ? w * t : w
      const sy = h === long ? h * t : h
      const sz = d === long ? d * t : d

      // Grow from one end, not from the middle. A stud is stood on the plate and
      // fixed; it does not appear in mid-air and expand both ways.
      scratch.origin.set(
        w === long ? -(w - sx) / 2 : 0,
        h === long ? -(h - sy) / 2 : 0,
        d === long ? -(d - sz) / 2 : 0,
      )
      scratch.origin.applyQuaternion(quats[i])

      scratch.scale.set(Math.max(sx, 1e-5), Math.max(sy, 1e-5), Math.max(sz, 1e-5))
      // A member shortened on only one axis still has a broad end face.
      // Collapse all axes before it starts, otherwise that face casts a line.
      if (t <= 0.001) scratch.scale.setScalar(1e-8)
      scratch.position.set(m.p[0], m.p[1], m.p[2]).add(scratch.origin)
      scratch.matrix.compose(scratch.position, quats[i], scratch.scale)

      const mesh = meshes.current[layout.keys[i]]
      if (mesh) mesh.setMatrixAt(layout.slot[i], scratch.matrix)

      // Roof sheets and fine corrugations have no drafting outline. Keep them
      // entirely out of the line buffer instead of transforming thousands of
      // invisible cube edges while the roof assembles.
      const lineSlot = layout.lineSlot[i]
      if (lineSlot < 0) continue
      linesChanged = true
      const base = lineSlot * EDGE_INDICES.length
      const draws = t > 0.001
      for (let e = 0; e < EDGE_INDICES.length; e++) {
        const c = UNIT_CORNERS[EDGE_INDICES[e]]
        scratch.corner.set(c[0], c[1], c[2]).applyMatrix4(scratch.matrix)
        const o = (base + e) * 3
        arr[o] = draws ? scratch.corner.x : 0
        arr[o + 1] = draws ? scratch.corner.y : 0
        arr[o + 2] = draws ? scratch.corner.z : 0
      }
    }

    if (!changed) return
    for (const k of RENDER_KEYS) {
      const mesh = meshes.current[k]
      if (mesh) mesh.instanceMatrix.needsUpdate = true
    }
    if (linesChanged) attr.needsUpdate = true
    lineGeometry.setDrawRange(0, anyVisible ? layout.lineCount * EDGE_INDICES.length : 0)
  })

  return (
    <group name="croyde-building" position={[0, -FRAME_BOUNDS.centreY, -FRAME_BOUNDS.centreZ]}>
      {RENDER_KEYS.filter((key) => layout.sizes[key] > 0).map((key) => (
        <instancedMesh
          key={key}
          name={`croyde-${key}`}
          ref={(el) => (meshes.current[key] = el)}
          args={[key === 'corbel' ? corbel : box, undefined, layout.sizes[key]]}
          castShadow={key !== 'glass'}
          receiveShadow={key !== 'glass'}
          frustumCulled={false}
        >
          <meshStandardMaterial
            ref={(el) => (mats.current[key] = el)}
            color={MATERIALS[key === 'corbel' ? 'trim' : key].color}
            roughness={MATERIALS[key === 'corbel' ? 'trim' : key].roughness}
            metalness={key === 'roof' ? 0.08 : 0}
            transparent
            opacity={0}
          />
        </instancedMesh>
      ))}

      <lineSegments name="croyde-drawing" geometry={lineGeometry} frustumCulled={false}>
        <lineBasicMaterial ref={lineMat} color={LINE} transparent opacity={1} />
      </lineSegments>
    </group>
  )
}

function Daylight({ shadows }: { shadows: boolean }) {
  const canvasWidth = useThree((state) => state.size.width)
  const shadowSize = canvasWidth < 600 ? 1024 : 2048
  return (
    <>
      {/* Neutral sky and ground bounce keep shaded white walls white rather
          than tinting them with the site's green. The key reveals board laps,
          balusters and the depth of the sheltered verandahs. */}
      <hemisphereLight args={['#ffffff', '#e9e7dc', 1.35]} />
      <directionalLight
        key={shadowSize}
        position={[-18, 26, 17]}
        intensity={1.25}
        color="#fffefa"
        castShadow={shadows}
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
        shadow-camera-left={-36}
        shadow-camera-right={36}
        shadow-camera-top={36}
        shadow-camera-bottom={-36}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
      />
      <directionalLight position={[14, 8, -16]} intensity={0.62} color="#ffffff" />
    </>
  )
}

export default function TimberFrame({
  progress,
  shadows = true,
  view = 'front',
}: {
  progress: React.MutableRefObject<number>
  shadows?: boolean
  view?: FrameView
}) {
  return (
    <Canvas
      orthographic
      // A true axonometric: the view an architect would draw the thing in.
      camera={{ position: FRAME_VIEWS[view], zoom: 60, near: 0.1, far: 120 }}
      dpr={[1, shadows ? 1.75 : 1.4]}
      shadows={shadows}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        // No tone mapping. Silky Oak and Bellewood Green are specified values,
        // and a filmic curve would quietly shift both.
        toneMapping: THREE.NoToneMapping,
      }}
      style={{ background: 'transparent' }}
      resize={{ scroll: false }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
    >
      <fog attach="fog" args={['#dce2d5', 80, 155]} />
      <Fit view={view} />

      <Daylight shadows={shadows} />

      <CroydeLandscape progress={progress} />
      <Building progress={progress} />
    </Canvas>
  )
}

/**
 * Fits the building to its box without a camera move.
 *
 * The extent is measured, not estimated. Seen down an axonometric axis an 8 x 5
 * plan is neither 8 nor 5 wide on screen, and guessing at the diagonal put the
 * building over the edges of its own frame.
 */
function Fit({ view }: { view: FrameView }) {
  const { camera, size } = useThree()
  const corners = useMemo(() => {
    const matrix = new THREE.Matrix4()
    const quaternion = new THREE.Quaternion()
    const position = new THREE.Vector3()
    const scale = new THREE.Vector3()
    const points: THREE.Vector3[] = []
    for (const member of FRAME_MEMBERS) {
      quaternion.setFromEuler(new THREE.Euler(member.rx, member.ry ?? 0, member.rz ?? 0, 'YXZ'))
      position.set(member.p[0], member.p[1] - FRAME_BOUNDS.centreY, member.p[2] - FRAME_BOUNDS.centreZ)
      scale.set(...member.s)
      matrix.compose(position, quaternion, scale)
      for (const corner of UNIT_CORNERS) points.push(new THREE.Vector3(...corner).applyMatrix4(matrix))
    }
    // Frame the house and nearby pool/paths, not the entire 45 m property.
    // The surrounding landscape continues beyond the camera in every direction.
    for (const [x, y, z] of [[-14.9, 0, 2.8], [-14.9, 0, -15], [10, 0, 18.5], [-0.7, 0, 21]]) {
      points.push(new THREE.Vector3(x, y - FRAME_BOUNDS.centreY, z - FRAME_BOUNDS.centreZ))
    }
    return points
  }, [])

  useLayoutEffect(() => {
    const cam = camera as THREE.OrthographicCamera
    cam.position.set(...FRAME_VIEWS[view])
    cam.lookAt(0, 0, 0)
    cam.updateMatrixWorld()
    const point = new THREE.Vector3()
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const corner of corners) {
      point.copy(corner).applyMatrix4(cam.matrixWorldInverse)
      minX = Math.min(minX, point.x)
      maxX = Math.max(maxX, point.x)
      minY = Math.min(minY, point.y)
      maxY = Math.max(maxY, point.y)
    }

    // Fit the actual silhouette, including projecting stairs and roof peaks.
    // A box around the whole site wastes much of a small phone's canvas.
    // Use the finished geometry at every stage so the building never resizes
    // while it is being assembled. Only a resize or a chosen view refits it.
    const air = size.width < 520 ? 0.94 : 0.92
    cam.zoom = Math.min(size.width / Math.max(maxX - minX, 0.001), size.height / Math.max(maxY - minY, 0.001)) * air
    cam.translateX((minX + maxX) / 2)
    cam.translateY((minY + maxY) / 2)
    cam.updateMatrixWorld()
    cam.updateProjectionMatrix()
  }, [camera, corners, size.width, size.height, view])

  return null
}
